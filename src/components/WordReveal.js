"use client";

import { useEffect, useRef } from "react";

// "*phrase in gold*" → each word in the phrase is flagged as gold
function parseWords(text) {
  const out = [];
  let inGold = false;
  for (const raw of text.split(" ")) {
    const opens = raw.startsWith("*");
    out.push({ word: raw.replaceAll("*", ""), gold: inGold || opens });
    if (opens) inGold = true;
    if (raw.replace(/[.,!?;:]+$/, "").endsWith("*")) inGold = false;
  }
  return out;
}

/** Paragraph whose words light up one by one as it scrolls through the viewport. */
export default function WordReveal({ text, className = "" }) {
  const ref = useRef(null);
  const words = parseWords(text);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.3;
      const p = (start - r.top) / (start - end + r.height * 0.5);
      el.style.setProperty("--p", Math.min(Math.max(p, 0), 1).toFixed(4));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  return (
    <p ref={ref} className={className} style={{ "--n": words.length }}>
      {words.map(({ word, gold }, i) => (
        <span key={i} className={`wr-word ${gold ? "text-gold" : ""}`} style={{ "--i": i }}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
