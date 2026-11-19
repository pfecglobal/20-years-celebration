"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TOTAL_MS = 3900; // whole opening sequence

// fixed sparkle positions (percent of the screen), so server and client render the same
const SPARKS = [
  [12, 18, 0], [86, 14, 0.6], [22, 72, 1.1], [78, 68, 0.3], [50, 9, 0.9], [6, 46, 1.4],
  [94, 42, 0.2], [34, 88, 0.7], [66, 86, 1.2], [40, 26, 1.6], [62, 30, 0.4], [17, 90, 1.8],
];

/**
 * Opening invitation for the 20th anniversary: an ivory envelope with a gold "20" wax seal floats in,
 * the seal cracks, the flap opens, and the invitation rises out — then the screen dissolves into the hero.
 * It always plays through (no skip). While it plays, the hero's own intro is held (see globals.css) and
 * starts the moment the overlay is gone ("pfec:intro-done").
 */
export default function IntroInvite() {
  const [done, setDone] = useState(false);
  const timers = useRef([]);
  const rootRef = useRef(null);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setDone(true);
    window.dispatchEvent(new Event("pfec:intro-done"));
  }, []);

  // The sequence is pure CSS and starts at first paint, while this code only runs after hydration
  // (later on slow phones). So we finish exactly when the overlay's fade-out animation ends — or at once
  // if it already ended before we got here. The timer is only a safety net.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(finish, 0);
      return () => clearTimeout(t);
    }
    const out = el.getAnimations?.().find((a) => a.animationName === "ix-overlay-out");
    if (out?.playState === "finished") {
      const t = setTimeout(finish, 0);
      return () => clearTimeout(t);
    }
    const onEnd = (e) => e.target === el && e.animationName === "ix-overlay-out" && finish();
    el.addEventListener("animationend", onEnd);
    const remaining = out ? Math.max(0, TOTAL_MS - (out.currentTime ?? 0)) + 400 : TOTAL_MS;
    timers.current = [setTimeout(finish, remaining)];
    const t = timers.current;
    return () => {
      el.removeEventListener("animationend", onEnd);
      t.forEach(clearTimeout);
    };
  }, [finish]);

  if (done) return null;

  return (
    <div ref={rootRef} className="ix-intro" aria-hidden="true" data-lenis-prevent>
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
      </div>
    </div>
  );
}
