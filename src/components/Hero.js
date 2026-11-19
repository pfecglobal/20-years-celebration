"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import SparkleField from "./SparkleField";
import CelebrateButton from "./CelebrateButton";
// imported (not a "/public" path) → the URL carries a hash of the file, so a replaced logo is never served from cache
import logo from "../../public/pfec-logo-white.png";
import { TAGLINE } from "@/content";

/** Gold word whose letters rise in one by one; `shine` = when its glossy sweep starts (same gloss as the 20). */
function SplitWord({ text, start, shine, className = "" }) {
  return (
    <span
      className={`split-word text-gold-shimmer ${className}`}
      style={{ "--start": `${start}s`, "--shine-delay": `${shine}s` }}
    >
      {text.split("").map((ch, i) => (
        <span key={i} className="split-letter" style={{ "--i": i }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Shows 1 straight away and counts 1 → 20, then pops and kicks off the fireworks + confetti. */
function TwentyCounter({ start = 1, end = 20, duration = 2000 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const wrap = el.parentElement;
    // After landing on 20, it "jumps" again every 8–12s (random gap each time)
    let popTimer = 0;
    const schedulePop = () => {
      popTimer = setTimeout(() => {
        if (!document.hidden) {
          const ease = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // same bounce as the first jump (CSS twenty-pop)
          el.animate(
            [
              { transform: "scale(1)", easing: ease },
              { transform: "scale(1.14)", offset: 0.35, easing: ease },
              { transform: "scale(1)" },
            ],
            { duration: 700 }
          );
        }
        schedulePop();
      }, 8000 + Math.random() * 4000);
    };

    const done = () => {
      el.textContent = String(end);
      wrap.classList.add("is-done");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }

    // (the width is reserved for two digits in CSS, so nothing shifts while counting)
    wrap.classList.remove("is-done");

    let raf = 0;
    let timer = 0;
    // Start counting almost immediately — the number is never blank.
    // If the opening invitation is on screen, wait until it has dissolved ("pfec:intro-done").
    const delay = 150;
    const run = () => (timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(start + Math.round((end - start) * eased));
        if (p < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          done();
          schedulePop();
          window.dispatchEvent(
            new CustomEvent("pfec:celebrate", { detail: { count: 7, confetti: true, confettiAmount: 170 } })
          );
        }
      };
      raf = requestAnimationFrame(tick);
    }, delay));
    if (document.querySelector(".ix-intro")) window.addEventListener("pfec:intro-done", run, { once: true });
    else run();

    return () => {
      window.removeEventListener("pfec:intro-done", run);
      clearTimeout(timer);
      clearTimeout(popTimer);
      cancelAnimationFrame(raf);
    };
  }, [start, end, duration]);

  return (
    <span ref={ref} className="twenty text-gold-shimmer" suppressHydrationWarning>
      {start}
    </span>
  );
}

export default function Hero() {
  const ref = useRef(null);

  // The hero renders "on hold" (.is-held: its intro animations paused) while the opening invitation plays,
  // and is released when the invitation starts to dissolve. A class on the hero itself only re-styles the
  // hero — a page-level :has() check re-styled the whole page at that moment (a visible hitch on phones).
  useEffect(() => {
    const el = ref.current;
    const release = () => el.classList.remove("is-held");
    if (!document.querySelector(".ix-intro")) {
      release();
      return;
    }
    window.addEventListener("pfec:intro-done", release, { once: true });
    return () => window.removeEventListener("pfec:intro-done", release);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let mx = 0;
    let my = 0;

    // Parallax / scroll-out of the hero content, written straight onto that one element (custom properties on
    // .hero would re-style the whole hero subtree every scroll frame) — and skipped once nothing changes,
    // e.g. after the hero has scrolled out of view.
    const content = el.querySelector(".hero-content");
    let last = "";
    const apply = () => {
      raf = 0;
      const sp = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
      const key = `${mx.toFixed(3)}|${my.toFixed(3)}|${sp.toFixed(3)}`;
      if (key === last || !content) return;
      last = key;
      content.style.transform = `translate3d(${(mx * 10).toFixed(2)}px, ${(my * 8 + sp * 140).toFixed(2)}px, 0) scale(${(1 - sp * 0.12).toFixed(4)})`;
      content.style.opacity = String(Math.max(0, 1 - sp * 1.3).toFixed(3));
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
      className="hero is-held relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      <div className="hero-bg" />
      <SparkleField />
      <div className="hero-vignette" />

      <div className="hero-content relative z-10 flex flex-col items-center px-4 pt-16 pb-24 text-center">
        {/* logo: fades in, then one gold gloss sweeps across it with a soft glow (once per load) */}
        <span className="logo-shine" style={{ "--logo-url": `url(${logo.src})` }}>
          <Image
            src={logo}
            alt="PFEC Global"
            loading="eager"
            fetchPriority="high"
            className="intro-logo h-auto w-[150px] sm:w-[200px]"
          />
        </span>

        <h1 className="sr-only">PFEC Global celebrating 20 years</h1>
        <div aria-hidden="true" className="mt-4 flex flex-col items-center sm:mt-6">
          <SplitWord text="CELEBRATING" start={0.45} shine={0.2} className="split-word--lead" />
          <div className="twenty-wrap">
            <div className="twenty-rays" />
            <div className="twenty-halo" />
            <TwentyCounter />
          </div>
          <SplitWord text="YEARS" start={1.65} shine={1.4} />
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
