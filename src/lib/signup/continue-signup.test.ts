import { describe, expect, it } from "vitest";

import { withLeadTokenFragment } from "./continue-signup";

const TOKEN =
  "l1.ZGIxNzJhZGMtZTZkNy00ZTE4LTk2MGQtNzNlYjdjYjdlOWRk.1797665620.3Z6ZQIpVojxfnHdZ4Z5ZLYFPmsbTHgidtEaUdgb8ho4";
const HANDOFF =
  "https://app.example.com/signup?coach=jj-smith&intentId=i1&intentToken=tok&step=success";

describe("withLeadTokenFragment", () => {
  it("adds her token to the URL fragment, not the query", () => {
    const url = new URL(withLeadTokenFragment(HANDOFF, TOKEN));
    expect(url.hash).toBe(`#t=${TOKEN}`);
    expect(url.search).toBe(new URL(HANDOFF).search);
    expect(url.searchParams.has("t")).toBe(false);
  });

  it("keeps a fragment the URL already has", () => {
    const url = new URL(withLeadTokenFragment(`${HANDOFF}#offer`, TOKEN));
    expect(url.hash).toBe(`#offer&t=${TOKEN}`);
  });

  it.each([null, undefined, "", "   "])("leaves the URL alone with no token (%j)", (token) => {
    expect(withLeadTokenFragment(HANDOFF, token)).toBe(HANDOFF);
  });

  it("leaves an empty or unparsable URL alone", () => {
    expect(withLeadTokenFragment("", TOKEN)).toBe("");
    expect(withLeadTokenFragment("not a url", TOKEN)).toBe("not a url");
  });
});
