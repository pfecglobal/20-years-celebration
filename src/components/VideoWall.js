"use client";

import { useEffect, useRef } from "react";
import VideoMessage from "./VideoMessage";

/**
 * A row of portrait video tiles; each one opens the popup player (same as the Day One message).
 * rowReveal: as you scroll, the grid appears row by row — each row rises in, its tiles staggered left → right.
 */
export default function VideoWall({ videos, label = "Watch", reveal = true, grid = false, rowReveal = false }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!rowReveal || !list) return;
    const items = [...list.children];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((li) => li.classList.add("row-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        // tiles that come into view together are grouped into rows (same top), then staggered
        const entering = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        let rowTop = null;
        let row = -1;
        let col = 0;
        for (const e of entering) {
          const top = e.boundingClientRect.top;
          if (rowTop === null || Math.abs(top - rowTop) > 12) {
            rowTop = top;
            row++;
            col = 0;
          }
          e.target.style.setProperty("--row-delay", `${row * 200 + col * 90}ms`);
          e.target.classList.add("row-in");
          io.unobserve(e.target);
          col++;
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [rowReveal, videos]);

  return (
    <ul ref={listRef} className={`video-wall ${grid ? "video-wall--grid" : ""} ${rowReveal ? "video-wall--rows" : ""}`}>
      {videos.map((v, i) => (
        <li key={v.name} data-reveal={reveal ? "zoom" : undefined} style={{ "--d": `${i * 110}ms`, "--i": i }}>
          <VideoMessage youtube={v.youtube} title={v.name} label={label} variant="tile" />
        </li>
      ))}
    </ul>
  );
}
