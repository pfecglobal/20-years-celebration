"use client";

import { useEffect, useRef } from "react";

/**
 * "Sheet over" scroll transition.
 * `pin` stays fixed in place (sticky, its bottom locked to the bottom of the screen) while the
 * next section — `children` — slides up over it like a sheet. The pinned part itself doesn't change.
 * Scrolling up plays it in reverse.
 */
export default function CoverReveal({ pin, pinClassName = "", className = "", children }) {
  const pinRef = useRef(null);

  useEffect(() => {
    const pinEl = pinRef.current;
    if (!pinEl) return;

    // The pin locks with its bottom on the bottom of the screen — same on every screen size
    const measure = () => {
      const ph = pinEl.offsetHeight;
      pinEl.style.setProperty("--pin-h", `${ph}px`);
      pinEl.style.setProperty("--pin-top", `${window.innerHeight - ph}px`);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(pinEl);
    measure();
    window.addEventListener("resize", measure); // phones: the browser bar showing/hiding changes innerHeight
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className={`cover-stack ${className}`}>
      <div ref={pinRef} className={`cover-pin ${pinClassName}`}>
        <div className="cover-pin-inner">{pin}</div>
      </div>
      <div className="cover-sheet">
        {children}
      </div>
    </div>
  );
}
