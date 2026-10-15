#!/usr/bin/env node
/**
 * Creates the "YoBody JJ — Growth & Conversion" dashboard and its tiles in
 * PostHog via the public API.
 *
 * The PostHog MCP server was not available when this was written, so the
 * dashboard could not be created directly. Run this once with a personal API
 * key and it does the whole job:
 *
 *   node scripts/posthog-setup.mjs --key phx_xxx --dry-run     # print payloads
 *   node scripts/posthog-setup.mjs --key phx_xxx               # create
 *
 * Flags:
 *   --key <phx_...>   PostHog PERSONAL api key (not the phc_ project key).
 *                     Needs scopes: dashboard:write, insight:write, project:read.
 *   --host <url>      default https://us.posthog.com
 *   --project <id>    default: the first project the key can see
 *   --environment <v> default "production"; use "all" for no environment filter
 *   --dry-run         print what would be created and exit
 *
 * Idempotent: if a dashboard with the same name already exists it is reused,
 * and tiles whose names already exist on it are skipped.
 */

const args = process.argv.slice(2);
const arg = (name, fallback = undefined) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const HOST = (arg("host", "https://us.posthog.com") || "").replace(/\/$/, "");
const KEY = arg("key", process.env.POSTHOG_PERSONAL_API_KEY);
const ENVIRONMENT = arg("environment", "production");
const DRY = args.includes("--dry-run");
const DASHBOARD_NAME = "YoBody JJ — Growth & Conversion";

if (!KEY && !DRY) {
  console.error("Missing --key phx_... (or POSTHOG_PERSONAL_API_KEY).");
  process.exit(1);
}

async function api(path, init) {
  const res = await fetch(`${HOST}/api${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok)
    throw new Error(`${init?.method ?? "GET"} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  return body;
}

// --- query builders --------------------------------------------------------

const event = (name) => ({ kind: "EventsNode", event: name, name });

const funnel = (steps, extra = {}) => ({
  kind: "InsightVizNode",
  source: {
    kind: "FunnelsQuery",
    series: steps.map(event),
    dateRange: { date_from: "-30d" },
    funnelsFilter: { funnelVizType: "steps" },
    ...extra,
  },
});

const trend = (name, { breakdown, display = "ActionsBarValue", math = "total" } = {}) => ({
  kind: "InsightVizNode",
  source: {
    kind: "TrendsQuery",
    series: [{ kind: "EventsNode", event: name, name, math }],
    dateRange: { date_from: "-30d" },
    trendsFilter: { display },
    ...(breakdown ? { breakdownFilter: { breakdown, breakdown_type: "event" } } : {}),
  },
});

// --- the tiles ------------------------------------------------------------
// Deliberately a focused set: enough to answer the business questions without
// turning into an analytics science project.

const TILES = [
  {
    name: "A · Executive funnel — visitor to purchase",
    description:
      "Pageview -> CTA -> lead -> Stripe loaded -> purchase. Purchase step stays empty until the webhook event is wired (see TRACKING_PLAN.md).",
    query: funnel([
      "$pageview",
      "yobody_cta_clicked",
      "yobody_lead_captured",
      "yobody_stripe_checkout_loaded",
      "yobody_purchase_completed",
    ]),
  },

  {
    name: "D · Lead & checkout funnel (pricing friction)",
    description:
      "Form started -> lead captured -> Stripe rendered -> purchased. The lead->Stripe gap is checkout friction; the Stripe->purchase gap is price/payment friction.",
    query: funnel([
      "yobody_lead_form_started",
      "yobody_lead_captured",
      "yobody_stripe_checkout_loaded",
      "yobody_purchase_completed",
    ]),
  },

  {
    name: "B1 · Leads by utm_source (latest touch)",
    query: trend("yobody_lead_captured", { breakdown: "utm_source" }),
  },
  {
    name: "B2 · Leads by utm_campaign (latest touch)",
    query: trend("yobody_lead_captured", { breakdown: "utm_campaign" }),
  },
  {
    name: "B3 · Leads by utm_medium (latest touch)",
    query: trend("yobody_lead_captured", { breakdown: "utm_medium" }),
  },
  {
    name: "B4 · Leads by utm_content (creative)",
    query: trend("yobody_lead_captured", { breakdown: "utm_content" }),
  },
  {
    name: "B5 · Leads by traffic_channel",
    query: trend("yobody_lead_captured", { breakdown: "traffic_channel" }),
  },

  {
    name: "F1 · Visitors by traffic_channel (latest touch)",
    query: trend("$pageview", { breakdown: "traffic_channel", math: "dau" }),
  },
  {
    name: "F2 · Visitors by FIRST-touch channel",
    description:
      "Where these people originally came from, regardless of the click that brought them back.",
    query: trend("$pageview", { breakdown: "first_traffic_channel", math: "dau" }),
  },
  {
    name: "F3 · Checkout reached by traffic_channel",
    query: trend("yobody_stripe_checkout_loaded", { breakdown: "traffic_channel" }),
  },
  { name: "F4 · Referrers", query: trend("$pageview", { breakdown: "$referrer", math: "dau" }) },

  {
    name: "C1 · Mobile vs desktop visitors",
    query: trend("$pageview", { breakdown: "$device_type", math: "dau" }),
  },
  {
    name: "C2 · Section reach — how far into the page people get",
    description:
      "Which sections buyers actually read. Pair with the funnel to see which sections correlate with converting.",
    query: trend("yobody_section_viewed", { breakdown: "section_name" }),
  },
  {
    name: "C3 · Scroll depth distribution",
    query: trend("yobody_scroll_depth_reached", { breakdown: "percent" }),
  },
  {
    name: "C4 · CTA clicks by section",
    query: trend("yobody_cta_clicked", { breakdown: "section_name" }),
  },
  {
    name: "C5 · Daily visitors (trend)",
    query: trend("$pageview", { display: "ActionsLineGraph", math: "dau" }),
  },

  {
    name: "E · Checkout errors by category",
    description:
      "Coarse failure buckets. A spike in network_unreachable / stripe_init_failed usually means in-app browser breakage.",
    query: trend("yobody_checkout_error", { breakdown: "error_category" }),
  },
];

// --- run ------------------------------------------------------------------

const envFilter =
  ENVIRONMENT === "all"
    ? []
    : [{ key: "environment", value: [ENVIRONMENT], operator: "exact", type: "event" }];

if (DRY) {
  console.log(`DRY RUN — host=${HOST} environment=${ENVIRONMENT}`);
  console.log(`Dashboard: ${DASHBOARD_NAME}`);
  console.log(`Dashboard-level property filter: ${JSON.stringify(envFilter)}`);
  for (const t of TILES)
    console.log(`  tile: ${t.name}\n        ${JSON.stringify(t.query).slice(0, 150)}...`);
  console.log(`\n${TILES.length} tiles would be created.`);
  process.exit(0);
}

const projectId = arg("project") ?? (await api("/projects/")).results?.[0]?.id;
if (!projectId) throw new Error("Could not resolve a project id — pass --project <id>.");
console.log(`project: ${projectId}`);

const existing = (await api(`/projects/${projectId}/dashboards/?limit=200`)).results ?? [];
let dashboard = existing.find((d) => d.name === DASHBOARD_NAME);
if (dashboard) {
  console.log(`dashboard exists -> reusing #${dashboard.id}`);
} else {
  dashboard = await api(`/projects/${projectId}/dashboards/`, {
    method: "POST",
    body: JSON.stringify({
      name: DASHBOARD_NAME,
      description:
        "Acquisition -> lead -> checkout -> purchase for mycoach.jjsmithonline.com. Source of truth: TRACKING_PLAN.md in the jj-landing-page repo.",
      filters: { date_from: "-30d", properties: envFilter },
    }),
  });
  console.log(`created dashboard #${dashboard.id}`);
}

const onDash =
  (await api(`/projects/${projectId}/insights/?dashboards=${dashboard.id}&limit=200`)).results ??
  [];
const have = new Set(onDash.map((i) => i.name));

let created = 0,
  skipped = 0;
for (const tile of TILES) {
  if (have.has(tile.name)) {
    skipped++;
    console.log(`  skip (exists): ${tile.name}`);
    continue;
  }
  await api(`/projects/${projectId}/insights/`, {
    method: "POST",
    body: JSON.stringify({
      name: tile.name,
      description: tile.description ?? "",
      query: tile.query,
      dashboards: [dashboard.id],
      saved: true,
    }),
  });
  created++;
  console.log(`  created: ${tile.name}`);
}

console.log(`\ndone — ${created} created, ${skipped} skipped`);
console.log(
  `open: ${HOST.replace("us.posthog.com", "us.posthog.com")}/project/${projectId}/dashboard/${dashboard.id}`,
);
