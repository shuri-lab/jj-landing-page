import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCountdown, pad } from "@/hooks/use-countdown";
import heroJJ from "@/assets/landing/hero-jj.png";
import jjPortrait from "@/assets/landing/jj-portrait.jpg";
import jjFans from "@/assets/landing/jj-fans.jpg";
import jjHug from "@/assets/landing/jj-hug.jpg";
import t1 from "@/assets/landing/transformation-1.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import jjOwn from "@/assets/landing/jj-own-transformation.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JJ Smith — 12-Week Body Transformation Challenge" },
      {
        name: "description",
        content:
          "Lose up to 30 pounds in 12 weeks. JJ Smith's most personal program ever — built around your body, with JJ in your corner every single day.",
      },
      { property: "og:title", content: "JJ Smith — 12-Week Body Transformation Challenge" },
      {
        property: "og:description",
        content:
          "Sister, this time I'm with you every step of the way. A personalized 12-week transformation with JJ Smith.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

// Cohort target — 14 days from now (rolling) for demo
const COHORT_DEADLINE = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

function Landing() {
  return (
    <div className="bg-background text-foreground">
      <UrgencyBar />
      <Nav />
      <main className="mx-auto max-w-[760px]">
        <Hero />
        <ForYou />
        <RealTalk />
        <PromiseBlock />
        <Steps />
        <Roadmap />
        <JJReveal />
        <Transformations />
        <Included />
        <Comparison />
        <CommunityProof />
        <Offer />
        <Guarantee />
        <Faq />
        <LastCall />
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}

function scrollToOffer() {
  document.getElementById("offer")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CountdownInline({ className = "" }: { className?: string }) {
  const { days, hours, minutes, seconds } = useCountdown(COHORT_DEADLINE);
  return (
    <span className={className}>
      {days}d {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

function UrgencyBar() {
  return (
    <div className="bg-ink text-white text-[12px] sm:text-[13px] tracking-wide">
      <div className="mx-auto max-w-[760px] px-4 py-2.5 flex items-center justify-center gap-2 text-center">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
        <span className="opacity-90">Spring cohort closes in</span>
        <CountdownInline className="font-semibold tabular-nums" />
        <span className="hidden sm:inline opacity-70">· Only 500 spots</span>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="border-b border-line bg-background">
      <div className="mx-auto max-w-[760px] px-5 py-4 flex items-center justify-between">
        <span className="font-serif text-[18px] tracking-wide">JJ SMITH</span>
        <div className="hidden sm:flex gap-6 text-[13px] text-ink-soft">
          <a href="#stories">Success stories</a>
          <a href="#about">About</a>
          <a href="#offer" className="text-ink font-medium">Reserve</a>
        </div>
      </div>
    </div>
  );
}

function CtaButton({
  children,
  className = "",
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={scrollToOffer}
      className={`inline-flex items-center justify-center bg-ink text-white px-7 py-4 rounded-md text-[15px] font-medium tracking-wide transition-transform hover:-translate-y-px hover:bg-brand-deep ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold mb-4">
      {children}
    </div>
  );
}

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-5 py-14 border-b border-line ${className}`}>
      {children}
    </section>
  );
}

function Hero() {
  return (
    <Section>
      <Eyebrow>My new program · Spring cohort</Eyebrow>
      <h1 className="text-[34px] sm:text-[42px] leading-[1.1] mb-4">
        12-Week Body Transformation Challenge — lose up to 30 pounds in 12 weeks.
      </h1>
      <p className="text-[17px] text-ink-soft leading-relaxed mb-5">
        A challenge built around your body. With one big difference from anything I've ever done before.
      </p>
      <p className="font-serif italic text-[22px] sm:text-[24px] leading-snug text-ink my-6 py-5 border-y border-line">
        This time… I'm with you every step of the way. Not in a group. Not from a distance. Actually right there with you.
      </p>

      <div className="rounded-xl overflow-hidden bg-bg-soft mb-7">
        <img
          src={heroJJ}
          alt="JJ Smith"
          className="w-full h-auto block"
          width={1024}
          height={1024}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <CtaButton>Yes, I want you in my corner</CtaButton>
        <span className="text-[13px] text-ink-faint">14-day money-back · Only 500 spots</span>
      </div>

      <div className="mt-6 p-4 bg-bg-warm border-l-[3px] border-brand rounded text-[14px] text-brand-deep font-serif italic leading-relaxed">
        Sister, <strong className="not-italic font-semibold font-sans text-brand-deep">this is personal for me</strong> — so I'm only opening 500 spots. Once they're gone, they're gone. The next cohort won't open for another 90 days.
      </div>

      <div className="mt-7 pt-6 border-t border-line flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-ink-faint">
        <span>✓ 5+ million pounds lost in our community</span>
        <span>✓ #1 NY Times bestselling author</span>
        <span>✓ As seen on Dr. Oz, Steve Harvey, The View</span>
      </div>
    </Section>
  );
}

function ForYou() {
  const items = [
    "You're a sister in your 40s, 50s, 60s and the weight just won't come off like it used to",
    "You've tried every cleanse, plan, and challenge — and you're tired of starting over",
    "You want a plan built around YOUR body, your hormones, your life — not a generic PDF",
    "You know the missing piece has never been the information — it's been having someone in your corner",
  ];
  return (
    <Section>
      <Eyebrow>Sister, this is for you if…</Eyebrow>
      <h2 className="text-[26px] leading-tight mb-6">You're done doing this alone.</h2>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 items-start text-[15px] text-ink-soft leading-relaxed">
            <span className="text-brand font-semibold mt-0.5">✓</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <CtaButton>This is me — reserve my spot</CtaButton>
      </div>
    </Section>
  );
}

function RealTalk() {
  return (
    <Section>
      <Eyebrow>Real talk</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-5">
        Sister to sister — let me tell you what's really going on.
      </h2>
      <div className="space-y-4 text-[16px] text-ink-soft leading-[1.75]">
        <p>Sister, you already know what to do. You've read the books. You've done the cleanses. You've signed up for the challenges. You've started over a Monday more times than you can count.</p>
        <p>So why hasn't it stuck?</p>
        <p><strong className="text-ink font-medium">Because every program leaves you on a Tuesday night.</strong></p>
        <p>Sunday you're motivated. Monday you're locked in. Tuesday is fine. Then Wednesday hits — the kids, the work, the stress — and by Thursday at 9pm you're standing in front of the fridge, alone, fixing to undo everything you started.</p>
        <p>That's where every program loses you. Not because the information was wrong. <strong className="text-ink font-medium">Because nobody was there with you.</strong></p>
        <p>Nobody to text. Nobody who knew the kind of week you were having. Nobody to remind you what you signed up for and why this time was supposed to be different. Just you, by yourself, doing what you've always done.</p>
        <p className="text-ink font-medium text-[17px] pt-2">That's the part I'm fixing this time.</p>
      </div>
    </Section>
  );
}

function PromiseBlock() {
  return (
    <section className="relative px-5 py-16 text-center bg-bg-soft border-b border-line">
      <span aria-hidden className="absolute top-6 left-6 font-serif text-[90px] leading-none text-brand opacity-20">"</span>
      <span aria-hidden className="absolute bottom-0 right-6 font-serif text-[90px] leading-none text-brand opacity-20 rotate-180">"</span>
      <Eyebrow>My promise to you</Eyebrow>
      <p className="font-serif italic text-[28px] sm:text-[30px] leading-snug max-w-[540px] mx-auto mb-5">
        Sister, I've spent 15 years giving you the information. This time, I'm giving you me.
      </p>
      <p className="text-[14px] text-ink-faint tracking-wide">— JJ</p>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "We'll start with a call — just you and me",
    text: (
      <>
        Sister, before anything else, I want to know <em>you</em>. What you've tried. What worked, what didn't. What you love eating and what you can't stand. What's been holding you back. <strong>This whole thing is about you</strong> — so we have to start there.
      </>
    ),
  },
  {
    n: "02",
    title: "I'll build your meal plan and movement plan — just for you",
    text: (
      <>
        From everything you tell me, I'll put together a meal plan and a movement plan that's all <em>you</em>. Not a cookie-cutter PDF I send to everybody. Not a generic challenge plan from a book. <strong>A plan designed around your body, your life, the foods you actually love.</strong>
      </>
    ),
  },
  {
    n: "03",
    title: "Then I'm calling you — once or twice a week",
    text: (
      <>
        This is where it all changes, sister. I'm going to be calling you. Not to throw more information at you. Just to <strong>check in on you</strong> — see how you're feeling, what's working, what's hard. Then we'll figure out together what to do about it. The way real sisters do.
      </>
    ),
  },
  {
    n: "04",
    title: "And I'll be texting you every day",
    text: (
      <>
        Every. Single. Day. A check-in in the morning. A pick-me-up in the afternoon. A "you good?" on the days that look hard. <strong>I'm not letting anything slip past me</strong> — because if we catch the small stuff early, we never end up on a Tuesday night staring at the fridge wondering how we got here again.
      </>
    ),
  },
];

function Steps() {
  return (
    <Section>
      <Eyebrow>Here's how it works, sister</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-2">
        This is what our 12 weeks together will actually feel like.
      </h2>
      <div className="mt-7">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`grid grid-cols-[56px_1fr] gap-5 py-6 ${
              i < STEPS.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div className="font-serif italic font-medium text-[36px] text-brand leading-none">
              {s.n}
            </div>
            <div>
              <h3 className="text-[17px] font-semibold mb-2 font-sans tracking-tight">
                {s.title}
              </h3>
              <p className="text-[15px] text-ink-soft leading-[1.7]">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

const ROADMAP = [
  {
    weeks: "WK 1–3",
    title: "Foundation & quick wins",
    text: "We get to know each other. Your plan goes live. The scale starts moving, your clothes start feeling looser, and the cravings that ruled you for years start to quiet down.",
  },
  {
    weeks: "WK 4–6",
    title: "Momentum",
    text: "This is when the people in your life start noticing. Your energy is up. Your sleep is better. The plan is clicking — and so are we. The texts and calls become the part of your day you look forward to.",
  },
  {
    weeks: "WK 7–9",
    title: "Transformation",
    text: "The waist comes back. The belly fat finally lets go. You're stronger than you've felt in years. Sister, this is where the woman in the mirror starts looking like the one you've been missing.",
  },
  {
    weeks: "WK 10–12",
    title: "It becomes who you are",
    text: "By the end, this isn't a challenge anymore — it's the way you live. You walk away with the body, the habits, and the confidence to keep going long after our 12 weeks are done.",
  },
];

function Roadmap() {
  return (
    <Section>
      <Eyebrow>Your 12-week roadmap</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-6">
        Here's exactly what happens — week by week.
      </h2>
      <div className="space-y-4">
        {ROADMAP.map((r) => (
          <div
            key={r.weeks}
            className="bg-bg-soft rounded-xl p-5 sm:p-6 grid grid-cols-[80px_1fr] gap-4 items-start"
          >
            <div className="font-serif italic text-brand text-[17px] leading-tight pt-1">
              {r.weeks}
            </div>
            <div>
              <h3 className="text-[17px] font-semibold mb-2 font-sans">{r.title}</h3>
              <p className="text-[15px] text-ink-soft leading-[1.7]">{r.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7">
        <CtaButton>Start my 12 weeks with JJ</CtaButton>
      </div>
    </Section>
  );
}

function JJReveal() {
  return (
    <Section id="about">
      <Eyebrow>From JJ</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-6">
        Sister to sister — why and how I'm doing this.
      </h2>
      <div className="bg-bg-soft rounded-xl p-6 sm:p-8">
        <div className="flex gap-5 items-center mb-5">
          <img
            src={jjPortrait}
            alt="JJ Smith portrait"
            className="w-20 h-20 rounded-full object-cover border border-line"
            width={80}
            height={80}
            loading="lazy"
          />
          <div className="text-[14px] text-ink-faint tracking-wide">JJ Smith</div>
        </div>
        <div className="space-y-4 text-[16px] text-ink-soft leading-[1.75]">
          <p>For 15 years I've been writing the books, building the programs, and giving you everything I've learned. Together we've lost more than 5 million pounds. And I am so proud of every single one.</p>
          <p>But here's the truth, sister. <strong className="text-ink font-medium">Every single time, I've watched you sign up with all the hope in the world and slip back without me.</strong> And every time, I wished I could be there with you. On your shoulder on the hard days. In your pocket on the random Tuesday nights when nobody else is.</p>
          <p>For years, that was impossible. There's only one of me, and millions of you.</p>
          <p>So we built something. <strong className="text-ink font-medium">Something that lets me actually be with you</strong> — calling you, texting you, checking in on you, the way I would if it was just you and me. It's me, in your pocket, every day for 12 weeks. Finally.</p>
        </div>
        <blockquote className="mt-5 pl-4 border-l-[3px] border-brand font-serif italic text-[18px] leading-snug text-ink">
          That's why this time is different. Because this time, I'm not handing you another program and saying good luck. I'm walking with you the whole way.
        </blockquote>
        <p className="mt-5 font-serif italic text-[18px] text-ink">
          Love,
          <br />
          JJ
        </p>
      </div>
    </Section>
  );
}

function Transformations() {
  const groups = [
    { headline: '"My waist comes back, my belly fat finally lets go."', imgs: [t1, t8, t7] },
    { headline: '"I get my curves back — snatched, not skinny."', imgs: [t4, jjOwn, t1] },
    { headline: '"My clothes fit again, and I look 10 years younger."', imgs: [t8, t7, t4] },
    { headline: '"My energy is back — and my confidence with it."', imgs: [jjOwn, t1, t8] },
  ];
  return (
    <Section id="stories">
      <Eyebrow>Real sisters · Real transformations</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-4">Here's what happens after 12 weeks.</h2>
      <p className="text-[16px] text-ink-soft leading-[1.75] mb-8">
        When you make it through 12 weeks with a plan built for your body and someone walking with you the whole way, this is what happens:
      </p>
      <div className="space-y-10">
        {groups.map((g) => (
          <div key={g.headline}>
            <p className="font-serif italic text-[20px] leading-snug text-ink mb-4 text-center">
              {g.headline}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {g.imgs.map((src, i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden rounded bg-bg-soft">
                  <img
                    src={src}
                    alt="Sister transformation before and after"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Included() {
  const items = [
    { icon: "📞", title: "A welcome call with JJ", text: "We start by getting to know you — your body, your life, what you've already tried." },
    { icon: "🥗", title: "Your personal meal plan", text: "Built around the foods you actually love and the way your body works in this season of life." },
    { icon: "🏃‍♀️", title: "Your personal movement plan", text: "Joint-friendly, doable in 20–30 minutes, designed for women navigating perimenopause and beyond." },
    { icon: "📲", title: "Daily text check-ins", text: "Morning hello, midday pick-me-up, late-night reminder. Every. Single. Day." },
    { icon: "☎️", title: "Weekly calls from JJ", text: "Real conversations to fix what's hard before it derails you." },
    { icon: "👯‍♀️", title: "Private sister community", text: "A circle of women living this with you, cheering you on when you need it most." },
  ];
  return (
    <Section>
      <Eyebrow>What's included</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-6">Everything you get when you join me.</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.title} className="rounded-xl border border-line bg-card p-5">
            <div className="text-[24px] mb-3">{it.icon}</div>
            <h3 className="text-[16px] font-semibold font-sans mb-1.5">{it.title}</h3>
            <p className="text-[14px] text-ink-soft leading-[1.65]">{it.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Comparison() {
  const rows = [
    ["A plan built for YOUR body", false, true],
    ["JJ in your corner — every day", false, true],
    ["Designed for women 40+ & hormones", false, true],
    ["Weekly calls from JJ", false, true],
    ["A sister community lifting you up", false, true],
    ["No starting over on Monday", false, true],
  ];
  return (
    <Section>
      <Eyebrow>Why this is different</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-6">
        Why this beats every other program — including mine.
      </h2>
      <div className="rounded-xl overflow-hidden border border-line">
        <div className="grid grid-cols-[1fr_110px_120px] bg-bg-soft text-[12px] uppercase tracking-wider text-ink-faint">
          <div className="px-4 py-3"></div>
          <div className="px-3 py-3 text-center">Other programs</div>
          <div className="px-3 py-3 text-center text-brand font-semibold">JJ's 12-Week</div>
        </div>
        {rows.map(([label, a, b], i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_110px_120px] text-[14px] ${
              i % 2 === 0 ? "bg-card" : "bg-bg-soft/50"
            }`}
          >
            <div className="px-4 py-3.5 text-ink">{label as string}</div>
            <div className="px-3 py-3.5 text-center text-ink-faint">{a ? "✓" : "✗"}</div>
            <div className="px-3 py-3.5 text-center text-brand font-semibold">{b ? "✓" : "✗"}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CommunityProof() {
  return (
    <Section>
      <Eyebrow>The sisterhood</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-6">
        You're joining a circle of women who've got you.
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl overflow-hidden bg-bg-soft">
          <img src={jjFans} alt="JJ Smith with her community of sisters" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="rounded-xl overflow-hidden bg-bg-soft">
          <img src={jjHug} alt="JJ Smith hugging a sister" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
      <p className="mt-6 text-[16px] text-ink-soft leading-[1.75]">
        Over <strong className="text-ink font-medium">5 million pounds lost</strong> together. Sisters who get it. A space where you can bring your whole self — the wins, the wobbles, the Tuesday nights — and be met with love.
      </p>
    </Section>
  );
}

function Offer() {
  const lines: { label: string; value: string }[] = [
    { label: "A welcome call to get to know you", value: "$200" },
    { label: "Your personalized meal plan & movement plan", value: "$497" },
    { label: "Weekly calls with JJ for 12 weeks", value: "$1,200" },
    { label: "Daily text check-ins from JJ", value: "$600" },
    { label: "Private sister community", value: "$197" },
    { label: "BONUS: JJ's recipe library & quick-start guide", value: "$97" },
  ];
  return (
    <Section id="offer">
      <Eyebrow>The offer</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-2">Here's everything that's included.</h2>
      <p className="text-[15px] text-ink-soft mb-5">
        At a price that makes this the easiest yes you'll make this year.
      </p>
      <div className="rounded-2xl border-2 border-ink bg-card p-6 sm:p-8">
        <span className="inline-block bg-bg-warm text-brand-deep text-[11px] tracking-[0.12em] font-semibold px-3 py-1.5 rounded mb-4">
          SPRING COHORT · 500 SPOTS ONLY
        </span>
        <h3 className="text-[20px] font-semibold font-sans">JJ's 12-Week Body Transformation</h3>
        <p className="text-[14px] text-ink-soft mt-1">
          Personalized for your body. JJ with you every step of the way.
        </p>

        <div className="flex items-baseline gap-3 flex-wrap my-5">
          <span className="font-serif text-[46px] font-medium leading-none">$497</span>
          <span className="text-[17px] text-ink-faint line-through">$2,791</span>
          <span className="text-[13px] text-ink-soft">or 3 payments of $179</span>
        </div>

        <ul className="border-t border-dashed border-line">
          {lines.map((l) => (
            <li
              key={l.label}
              className="flex items-center gap-3 py-3 text-[14px] text-ink-soft border-b border-dashed border-line last:border-b-0"
            >
              <span className="text-brand font-semibold w-5 text-center">✓</span>
              <span className="flex-1">{l.label}</span>
              <span className="text-[12px] text-ink-faint">{l.value}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-ink pt-4 mt-3 text-[14px] font-semibold">
          <span>Total value</span>
          <span>$2,791</span>
        </div>
        <div className="flex justify-between text-[14px] font-semibold text-brand">
          <span>You pay today</span>
          <span>$497</span>
        </div>

        <CtaButton fullWidth className="mt-6">Reserve my spot — $497</CtaButton>
        <p className="text-center text-[13px] text-ink-faint mt-3">
          14-day money-back · Only 500 spots · Closes in <CountdownInline className="font-medium text-ink-soft tabular-nums" />
        </p>
      </div>
    </Section>
  );
}

function Guarantee() {
  return (
    <Section>
      <Eyebrow>My personal guarantee</Eyebrow>
      <div className="bg-bg-soft rounded-xl p-6 sm:p-7 flex gap-5 items-start">
        <div className="text-brand text-[32px] leading-none">♡</div>
        <p className="font-serif italic text-[16px] leading-[1.7] text-ink">
          "Sister, I need you to be confident this is right for you. So if you're not 100% thrilled within 14 days, I want to send your money back. If you're not happy, I'm not happy. No reason needed. That's my promise."
          <br />
          <br />
          <span className="not-italic font-sans text-[13px] text-ink-faint tracking-wide">— JJ</span>
        </p>
      </div>
    </Section>
  );
}

function Faq() {
  const items = [
    {
      q: "I'm in my 50s and nothing's worked. Will this?",
      a: "Sister, this is who I built it for. Most of the women I work with are 40+ navigating perimenopause, menopause, and hormone shifts. Your plan is built around all of that — and I'm right there with you the whole way.",
    },
    {
      q: "I work full-time and have kids. Do I have time?",
      a: "Yes. Personalizing your plan means it fits your life — not the other way around. And I'm meeting you right where you are, every day. Most sisters spend 20–30 minutes a day on this.",
    },
    {
      q: "Do I have to drink green smoothies?",
      a: "Only if you want to. This isn't the cleanse. Your plan is built around foods you actually love.",
    },
    {
      q: "What makes this different from your other programs?",
      a: "My books and challenges gave you the information. This one gives you me — every step of the way. The information was never the problem. Being alone on the hard days was.",
    },
    {
      q: "What if I miss this cohort?",
      a: "I only run 4 cohorts a year so we can give every sister the real attention she deserves. The next one won't open for another 90 days.",
    },
  ];
  return (
    <Section>
      <Eyebrow>Questions sisters ask me</Eyebrow>
      <h2 className="text-[28px] leading-tight mb-4">Let me answer what's on your mind.</h2>
      <Accordion type="single" collapsible defaultValue="q-0" className="w-full">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="border-line">
            <AccordionTrigger className="text-left text-[16px] font-semibold font-sans hover:no-underline">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-[14px] text-ink-soft leading-[1.75]">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

function LastCall() {
  return (
    <section className="px-5 py-14 text-center">
      <Eyebrow>Last call</Eyebrow>
      <h2 className="text-[30px] sm:text-[34px] leading-tight mb-5">
        Your next 12 weeks are happening either way.
      </h2>
      <p className="text-[16px] text-ink-soft leading-[1.75] text-left mb-6">
        You can spend them like the last 12. Or you can spend them with me right there with you — every Tuesday morning, every Thursday night, every time life hits. This time, sister, you don't have to do it alone.
      </p>
      <CtaButton>Reserve my spot — $497</CtaButton>
      <p className="text-[13px] text-ink-faint mt-4">
        14-day money-back guarantee · Only 500 spots · Closes in <CountdownInline className="tabular-nums" />
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 py-8 border-t border-line text-[12px] text-ink-faint text-center">
      © {new Date().getFullYear()} JJ Smith. All rights reserved. ·{" "}
      <a href="#" className="underline">Terms</a> ·{" "}
      <a href="#" className="underline">Privacy</a>
    </footer>
  );
}

function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 border-t border-line bg-background/95 backdrop-blur transition-transform sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 text-[12px] leading-tight">
          <div className="font-semibold text-ink">Spring cohort · $497</div>
          <div className="text-ink-faint">
            Closes in <CountdownInline className="tabular-nums" />
          </div>
        </div>
        <button
          onClick={scrollToOffer}
          className="bg-ink text-white px-5 py-3 rounded-md text-[14px] font-medium"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
