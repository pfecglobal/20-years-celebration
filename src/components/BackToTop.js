"use client";

import { useEffect, useRef, useState } from "react";

const R = 27; // ring radius
const C = 2 * Math.PI * R;

/** Floating gold "back to top" button with a scroll-progress ring. */
export default function BackToTop() {
  const ringRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    let raf = 0;
    // Page height is measured only when the page resizes — reading scrollHeight on every scroll frame
    // forces a full layout (very costly while scroll-driven scenes update the page).
    let max = 0;
    const measure = () => (max = document.documentElement.scrollHeight - window.innerHeight);
    const ro = new ResizeObserver(() => {
      measure();
      queue();
    });
    ro.observe(document.body);
    measure();
    const update = () => {
      raf = 0;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = `${C * (1 - p)}`;
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    const onResize = () => {
      measure();
      queue();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const toTop = () => {
    setLaunching(true);
    setTimeout(() => setLaunching(false), 700);
    const lenis = window.__pfecLenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6 }); // same silky glide as the rest of the page
    } else {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`to-top ${visible ? "is-visible" : ""} ${launching ? "is-launching" : ""}`}
    >
      <span className="to-top-float">
        <svg className="to-top-ring" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r={R} className="to-top-track" />
          <circle
            ref={ringRef}
            cx="32"
            cy="32"
            r={R}
            className="to-top-progress"
            style={{ strokeDasharray: C, strokeDashoffset: C }}
          />
        </svg>
        <span className="to-top-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="to-top-arrow">
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </span>
      </span>
    </button>
  );
}
