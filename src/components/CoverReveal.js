"use client";

import { useEffect, useRef } from "react";

/**
 * "Sheet over" scroll transition.
 * `pin` stays fixed in place (sticky, its bottom locked to the bottom of the screen) while the
 * next section — `children` — slides up over it like a sheet. As it gets covered the pinned part
 * sinks back (scales down, darkens, rounds its corners). Scrolling up plays it in reverse.
 */
export default function CoverReveal({ pin, pinClassName = "", className = "", children }) {
  const pinRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    const pinEl = pinRef.current;
    const sheet = sheetRef.current;
    if (!pinEl || !sheet) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The pin locks with its bottom on the bottom of the screen — same on every screen size
    let pinTop = 0;
    const measure = () => {
      const vh = window.innerHeight;
      const ph = pinEl.offsetHeight;
      pinTop = vh - ph;
      pinEl.style.setProperty("--pin-h", `${ph}px`);
      pinEl.style.setProperty("--pin-top", `${pinTop}px`);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduced) return;
      const vh = window.innerHeight;
      const ph = pinEl.offsetHeight;
      const top = sheet.getBoundingClientRect().top;
      // 0 when the sheet's top meets the pinned photo's bottom → 1 when it reaches the photo's top
      const p = Math.min(1, Math.max(0, (pinTop + ph - top) / Math.max(1, Math.min(ph, vh))));
      pinEl.style.setProperty("--cover", p.toFixed(4));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const ro = new ResizeObserver(() => {
      measure();
      queue();
    });
    ro.observe(pinEl);
    measure();
    update();
    window.addEventListener("scroll", queue, { passive: true });
    const onResize = () => {
      measure(); // phones: the browser bar showing/hiding changes innerHeight
      queue();
    };
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={`cover-stack ${className}`}>
      <div ref={pinRef} className={`cover-pin ${pinClassName}`}>
        <div className="cover-pin-inner">
          {pin}
          <span className="cover-pin-shade" aria-hidden="true" />
        </div>
      </div>
      <div ref={sheetRef} className="cover-sheet">
        {children}
      </div>
    </div>
  );
}
