"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import SparkleField from "./SparkleField";
import CelebrateButton from "./CelebrateButton";
import { TAGLINE } from "@/content";

function SplitWord({ text, start }) {
  return (
    <span className="split-word text-gold" style={{ "--start": `${start}s` }}>
      {text.split("").map((ch, i) => (
        <span key={i} className="split-letter" style={{ "--i": i }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Counts 0 → 20 as it appears, then pops and kicks off the fireworks + confetti. */
function TwentyCounter({ end = 20, duration = 2000 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const wrap = el.parentElement;
    const done = () => {
      el.textContent = String(end);
      wrap.classList.add("is-done");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }

    // Lock the width to the final "20" so the layout doesn't jump while counting
    el.style.minWidth = `${el.offsetWidth}px`;
    el.textContent = "0";
    wrap.classList.remove("is-done");

    let raf = 0;
    // Start roughly when the CSS zoom-in (0.9s after load) is underway
    const delay = Math.max(150, 1000 - performance.now());
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(end * eased));
        if (p < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          done();
          window.dispatchEvent(
            new CustomEvent("pfec:celebrate", { detail: { count: 7, confetti: true, confettiAmount: 170 } })
          );
        }
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);

  return (
    <span ref={ref} className="twenty text-gold-shimmer">
      {end}
    </span>
  );
}

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let mx = 0;
    let my = 0;

    const apply = () => {
      raf = 0;
      const sp = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      el.style.setProperty("--sp", sp.toFixed(3));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      queue();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", queue);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="hero relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      <div className="hero-bg" />
      <SparkleField />
      <div className="hero-vignette" />

      <div className="hero-content relative z-10 flex flex-col items-center px-4 pt-16 pb-24 text-center">
        <Image
          src="/pfec-logo-white.png"
          alt="PFEC Global — Study Abroad | Visa"
          width={635}
          height={221}
          loading="eager"
          fetchPriority="high"
          className="intro-logo h-auto w-[150px] sm:w-[200px]"
        />

        <h1 className="sr-only">PFEC Global turns 20 years</h1>
        <div aria-hidden="true" className="mt-4 flex flex-col items-center sm:mt-6">
          <SplitWord text="TURNS" start={0.45} />
          <div className="twenty-wrap">
            <div className="twenty-rays" />
            <div className="twenty-halo" />
            <TwentyCounter />
          </div>
          <SplitWord text="YEARS" start={1.65} />
        </div>

        <p className="intro-pill">
          {TAGLINE[0]} <span className="mx-1.5 text-gold">|</span> {TAGLINE[1]}
        </p>

        <div className="hero-cta">
          <CelebrateButton />
        </div>
      </div>

      <a
        href="#story"
        className="scroll-cue absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-medium tracking-[0.3em] text-white/60 uppercase transition-colors hover:text-gold-soft"
      >
        <span className="mouse" />
        Scroll
      </a>
    </section>
  );
}
