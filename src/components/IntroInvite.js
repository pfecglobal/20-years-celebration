"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ANNIVERSARY_HASHTAG } from "@/content";

const REVEAL_MS = 3150; // earliest moment the overlay dissolves (the envelope sequence has played by then)
const FADE_MS = 750; // the dissolve itself (ix-overlay-out)

// fixed sparkle positions (percent of the screen), so server and client render the same
const SPARKS = [
  [12, 18, 0], [86, 14, 0.6], [22, 72, 1.1], [78, 68, 0.3], [50, 9, 0.9], [6, 46, 1.4],
  [94, 42, 0.2], [34, 88, 0.7], [66, 86, 1.2], [40, 26, 1.6], [62, 30, 0.4], [17, 90, 1.8],
];

/**
 * Opening invitation for the 20th anniversary: an ivory envelope with a gold "20" wax seal floats in,
 * the seal cracks, the flap opens, and the invitation rises out — then the screen dissolves into the hero.
 * It always plays through (no skip). While it plays, the hero's own intro is held (see globals.css); it starts
 * the moment the overlay *begins* to dissolve ("pfec:intro-done"), so the hero builds up underneath the fading
 * envelope — a crossfade with no empty pause in between.
 */
export default function IntroInvite() {
  const [done, setDone] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const timers = useRef([]);
  const rootRef = useRef(null);
  const revealed = useRef(false);

  // release the hero (its intro, the 1 → 20 count …) as the overlay starts to fade
  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    setRevealing(true);
    window.dispatchEvent(new Event("pfec:intro-done"));
  }, []);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    reveal();
    setDone(true);
  }, [reveal]);

  // The sequence is pure CSS and starts at first paint, while this code only runs after hydration
  // (later on slow phones). So we finish exactly when the overlay's fade-out animation ends — or at once
  // if it already ended before we got here. The timer is only a safety net.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(finish, 0);
      return () => clearTimeout(t);
    }
    // How far the CSS envelope sequence already is (it starts at first paint; this code runs after hydration).
    // The dissolve is started from here — never earlier than REVEAL_MS — so the hero is always released at the
    // same moment the overlay begins to fade: a clean crossfade, no matter how long the page took to load.
    const intro = el.getAnimations?.({ subtree: true }).find((a) => a.animationName === "ix-float-in");
    const elapsed = intro?.currentTime ?? 0;
    const onEnd = (e) => e.target === el && e.animationName === "ix-overlay-out" && finish();
    el.addEventListener("animationend", onEnd);
    // no scrolling while the invitation is up (on the overlay itself — locking <html> re-laid out the page)
    const block = (e) => !revealed.current && e.cancelable && e.preventDefault();
    el.addEventListener("wheel", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    const wait = Math.max(0, REVEAL_MS - elapsed);
    timers.current = [
      setTimeout(reveal, wait),
      setTimeout(finish, wait + FADE_MS + 400), // safety net if animationend is missed
    ];
    const t = timers.current;
    return () => {
      el.removeEventListener("wheel", block);
      el.removeEventListener("touchmove", block);
      el.removeEventListener("animationend", onEnd);
      t.forEach(clearTimeout);
    };
  }, [finish, reveal]);

  if (done) return null;

  return (
    <div ref={rootRef} className={`ix-intro ${revealing ? "is-revealing" : ""}`} aria-hidden="true" data-lenis-prevent>
      <div className="ix-rays" aria-hidden="true" />
      <div className="ix-sparks" aria-hidden="true">
        {SPARKS.map(([x, y, d], i) => (
          <span key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>
            ✦
          </span>
        ))}
      </div>

      <div className="ix-stage" aria-hidden="true">
        <div className="ix-env">
          <div className="ix-env-back" />
          <div className="ix-letter">
            <span className="ix-invited">You are invited</span>
            <span className="ix-title">
              <em>20 Years of</em>
              PFEC Global
            </span>
            <span className="ix-divider">
              <i />
            </span>
            <span className="ix-years">2006 — 2026</span>
            <span className="ix-letter-hashtag">{ANNIVERSARY_HASHTAG}</span>
          </div>
          <div className="ix-env-front" />
          <div className="ix-env-flap">
            <div />
          </div>
          <div className="ix-seal">
            <span>20</span>
          </div>
        </div>
        <p className="ix-for">To celebrate with every PFECian</p>
        <p className="ix-hashtag">{ANNIVERSARY_HASHTAG}</p>
      </div>
    </div>
  );
}
