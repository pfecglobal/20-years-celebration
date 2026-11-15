"use client";

import { useEffect, useRef } from "react";

const fmt = (n) => n.toLocaleString("en-IN");

export default function CountUp({ end, suffix = "", duration = 2400 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(end) + suffix;
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / duration, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = fmt(Math.round(end * eased)) + suffix;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, suffix, duration]);

  return (
    <>
      <span className="sr-only">
        {fmt(end)}
        {suffix}
      </span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        0{suffix}
      </span>
    </>
  );
}
