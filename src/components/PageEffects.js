"use client";

import { useEffect, useRef } from "react";

/** Scroll reveals, card spotlight glow and the top scroll-progress bar. */
export default function PageEffects() {
  const barRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const els = document.querySelectorAll("[data-reveal]");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));

    const onMove = (e) => {
      const card = e.target.closest?.(".glass-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - r.left}px`);
      card.style.setProperty("--y", `${e.clientY - r.top}px`);
    };

    let raf = 0;
    // page height cached (re-measured on resize) — reading scrollHeight every scroll frame forces layout
    let max = 0;
    const measure = () => (max = root.scrollHeight - window.innerHeight);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    measure();
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // set on the bar itself — a custom property on <html> would make the browser recalculate the style of
        // the whole page on every scroll frame (the main cause of scroll jank on phones)
        if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? (window.scrollY / max).toFixed(4) : 0})`;
      });
    };

    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <div ref={barRef} className="page-progress" aria-hidden="true" />;
}
