"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Buttery smooth wheel / trackpad scrolling (Lenis). Touch screens keep native scrolling,
 * and visitors who prefer reduced motion keep the browser's normal scrolling.
 * Other components reach it via window.__pfecLenis (stop/start while a video is open, scrollTo).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.07, // lower = longer, silkier glide
      wheelMultiplier: 1,
      anchors: true, // in-page links (e.g. the hero's "Scroll" cue) glide too
    });
    window.__pfecLenis = lenis;

    return () => {
      lenis.destroy();
      if (window.__pfecLenis === lenis) delete window.__pfecLenis;
    };
  }, []);

  return null;
}
