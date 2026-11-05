import { describe, expect, it } from "vitest";
import { EARLY_PAGE_SCRIPT, EARLY_PRESS_ATTRIBUTE, TAG_FALLBACK_MS, TAG_URLS } from "./early-page";

type Listener = (event: unknown) => void;

/** Runs the inline script against just enough of a browser to watch it. */
function run(url = "https://mycoach.jjsmithonline.com/free-call?utm_source=meta", formTop = 2000) {
  const scrolled: string[] = [];
  const appended: string[] = [];
  const listeners: Listener[] = [];
  const timers: Array<{ fn: () => void; ms: number }> = [];
  const polls: Array<() => void> = [];
  const window: Record<string, unknown> & { __ybAppReady?: () => void } = {
    innerHeight: 812,
    addEventListener: (_: string, fn: Listener) => listeners.push(fn),
    removeEventListener: (_: string, fn: Listener) => {
      listeners.splice(listeners.indexOf(fn), 1);
    },
  };
  const document = {
    URL: url,
    head: { appendChild: (script: { src: string }) => appended.push(script.src) },
    createElement: () => ({}),
    getElementById: (id: string) => ({
      getBoundingClientRect: () => ({ top: formTop }),
      scrollIntoView: () => scrolled.push(id),
    }),
  };
  const setTimeoutStub = (fn: () => void, ms: number) => timers.push({ fn, ms });
  const setIntervalStub = (fn: () => void) => polls.push(fn);
  const clearIntervalStub = () => {
    polls.length = 0;
  };
  new Function(
    "window",
    "document",
    "setTimeout",
    "setInterval",
    "clearInterval",
    EARLY_PAGE_SCRIPT,
  )(window, document, setTimeoutStub, setIntervalStub, clearIntervalStub);
  /** Marks a button as taken over by React, as hydration does. */
  const hydrate = (button: object) => Object.assign(button, { __reactProps$abc: {} });
  const tick = () => [...polls].forEach((fn) => fn());
  const makeButton = () => {
    const attrs = new Set<string>();
    const button = {
      clicks: 0,
      disabled: false,
      isConnected: true,
      attrs,
      setAttribute: (name: string) => attrs.add(name),
      removeAttribute: (name: string) => attrs.delete(name),
      click() {
        button.clicks += 1;
      },
      closest: () => button,
      getAttribute: (_: string): string | null => null,
    };
    return button;
  };
  const press = (button: ReturnType<typeof makeButton>) => {
    const event = {
      target: button,
      prevented: 0,
      stopped: 0,
      preventDefault() {
        event.prevented += 1;
      },
      stopImmediatePropagation() {
        event.stopped += 1;
      },
    };
    [...listeners].forEach((fn) => fn(event));
    return event;
  };
  return { appended, listeners, timers, polls, scrolled, window, makeButton, press, hydrate, tick };
}

describe("the page's first seconds", () => {
  it("does not download a tag until the app is interactive", () => {
    const page = run();
    expect(page.appended).toEqual([]);
    page.window.__ybAppReady?.();
    expect(page.appended).toHaveLength(TAG_URLS.length);
  });

  it("keeps HYROS first, with the address it read in <head>", () => {
    const page = run();
    page.window.__ybAppReady?.();
    expect(page.appended[0]).toBe(
      `${TAG_URLS[0]}${encodeURI("https://mycoach.jjsmithonline.com/free-call?utm_source=meta")}`,
    );
    expect(page.appended.slice(1)).toEqual(TAG_URLS.slice(1));
  });

  it("loads every tag anyway if the app never becomes interactive", () => {
    const page = run();
    const fallback = page.timers.find((timer) => timer.ms === TAG_FALLBACK_MS);
    fallback?.fn();
    expect(page.appended).toHaveLength(TAG_URLS.length);
  });

  it("loads the tags only once", () => {
    const page = run();
    page.window.__ybAppReady?.();
    page.timers.filter((timer) => timer.ms === TAG_FALLBACK_MS).forEach((timer) => timer.fn());
    page.window.__ybAppReady?.();
    expect(page.appended).toHaveLength(TAG_URLS.length);
  });

  it("queues Clarity calls until its script arrives", () => {
    const { window } = run();
    (window.clarity as (...args: unknown[]) => void)("event", "x");
    expect((window.clarity as unknown as { q: unknown[] }).q).toHaveLength(1);
  });

  it("marks an early press at once and runs it when its button is live", () => {
    const page = run();
    const button = page.makeButton();
    const event = page.press(button);
    expect(event.prevented).toBe(1);
    expect(event.stopped).toBe(1);
    expect(button.attrs.has(EARLY_PRESS_ATTRIBUTE)).toBe(true);

    // The app's ready signal can come first: the press keeps waiting for its button.
    page.window.__ybAppReady?.();
    page.tick();
    expect(button.clicks).toBe(0);

    page.hydrate(button);
    page.tick();
    expect(button.clicks).toBe(1);
    expect(button.attrs.has(EARLY_PRESS_ATTRIBUTE)).toBe(false);
    expect(page.polls).toHaveLength(0);
  });

  it("scrolls to the form at once when the booking button is pressed early", () => {
    const page = run();
    const button = Object.assign(page.makeButton(), {
      getAttribute: (name: string) => (name === "data-cta" ? "book-free-call" : null),
    });
    page.press(button);
    expect(page.scrolled).toEqual(["book-section"]);
  });

  it("does not scroll when the form is already on screen", () => {
    const page = run(undefined, 100);
    const button = Object.assign(page.makeButton(), {
      getAttribute: (name: string) => (name === "data-cta" ? "book-free-call" : null),
    });
    page.press(button);
    expect(page.scrolled).toEqual([]);
  });

  it("runs a double press once", () => {
    const page = run();
    const button = page.makeButton();
    page.press(button);
    page.press(button);
    page.hydrate(button);
    page.tick();
    page.tick();
    expect(button.clicks).toBe(1);
  });

  it("runs only the latest of two early presses", () => {
    const page = run();
    const first = page.makeButton();
    const second = page.makeButton();
    page.press(first);
    page.press(second);
    expect(first.attrs.has(EARLY_PRESS_ATTRIBUTE)).toBe(false);
    page.hydrate(first);
    page.hydrate(second);
    page.tick();
    expect(first.clicks).toBe(0);
    expect(second.clicks).toBe(1);
  });

  it("leaves a press on a live button alone", () => {
    const page = run();
    const button = page.makeButton();
    page.hydrate(button);
    const event = page.press(button);
    expect(event.prevented).toBe(0);
    expect(event.stopped).toBe(0);
    expect(button.attrs.has(EARLY_PRESS_ATTRIBUTE)).toBe(false);
  });

  it("stops keeping presses soon after the app is ready, even if the check never passes", () => {
    const page = run();
    const button = page.makeButton();
    page.press(button);
    page.window.__ybAppReady?.();
    page.timers.filter((timer) => timer.ms !== TAG_FALLBACK_MS).forEach((timer) => timer.fn());
    expect(button.clicks).toBe(1);
    expect(page.listeners).toHaveLength(0);
  });

  it("ignores a disabled button", () => {
    const page = run();
    const button = page.makeButton();
    button.disabled = true;
    const event = page.press(button);
    expect(event.prevented).toBe(0);
    page.window.__ybAppReady?.();
    page.tick();
    expect(button.clicks).toBe(0);
  });
});
