"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

const SAMPLES = 800;

// milestone `country` code → name (flags live in /images/flags/{code}.svg)
const COUNTRIES = { au: "Australia", bd: "Bangladesh", in: "India", lk: "Sri Lanka", id: "Indonesia" };

/**
 * Winding grey road with milestone nodes. As you scroll, a glowing blue line
 * drives along the road; every node it reaches turns gold and its card goes
 * from greyscale to full colour.
 *
 * If `endId` is given, the road continues past the last milestone into that
 * element (e.g. the centred "TODAY" node below), which lights up on arrival.
 *
 * Node positions come from CSS (--seg / --pad / left %) so the layout renders
 * on the server; the SVG road is drawn through the nodes after mount.
 */
export default function JourneyRoad({ items, endId }) {
  const wrapRef = useRef(null);
  const pathRefs = useRef([]);
  const tipRef = useRef(null);
  const [geom, setGeom] = useState(null);
  const gradId = `jr-grad-${useId().replace(/:/g, "")}`;

  // 1) Build the road through the node centres (re-run on resize)
  useEffect(() => {
    const wrap = wrapRef.current;
    const build = () => {
      const box = wrap.getBoundingClientRect();
      const nodes = [...wrap.querySelectorAll(".jr-node")];
      if (!nodes.length) return;
      const pts = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      const w = box.width;
      const h = box.height;
      // Vertical tangents at each node → smooth S-curves like a winding road
      const end = endId && document.getElementById(endId);
      let tail = { x: pts[pts.length - 1].x, y: h };
      let hole = null;
      if (end) {
        const r = end.getBoundingClientRect();
        // run into the centre of the end node; a mask hides the road inside the circle,
        // so the line looks like it slides in *behind* it (no round cap sitting on top)
        tail = { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
        hole = { x: tail.x, y: tail.y, r: r.width / 2 + 2 }; // +2 → edge tucked under the node's ring
      }
      const all = [{ x: pts[0].x, y: 0 }, ...pts, tail];
      let d = `M ${all[0].x} ${all[0].y}`;
      for (let i = 0; i < all.length - 1; i++) {
        const a = all[i];
        const b = all[i + 1];
        const dy = b.y - a.y;
        if (end && i === all.length - 2) {
          // Final stretch: run down past the last card, then sweep sideways into the end node
          d += ` C ${a.x} ${a.y + dy * 0.75}, ${b.x + (a.x - b.x) * 0.55} ${b.y - dy * 0.08}, ${b.x} ${b.y}`;
        } else {
          const k = dy * 0.55;
          d += ` C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`;
        }
      }
      setGeom({ w, h, d, hole, nodeYs: pts.map((p) => p.y) });
    };
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    const end = endId && document.getElementById(endId);
    if (end) ro.observe(end.parentElement);
    return () => ro.disconnect();
  }, [items.length, endId]);

  // 3D hover: an active card tilts toward the cursor and a soft glare follows it (mouse / trackpad only)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = [...wrap.querySelectorAll(".jr-card")];
    const offs = cards.map((card) => {
      let raf = 0;
      let px = 0.5;
      let py = 0.5;
      const apply = () => {
        raf = 0;
        card.style.setProperty("--tilt-x", `${((0.5 - py) * 8).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${((px - 0.5) * 10).toFixed(2)}deg`);
        card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      };
      const onMove = (e) => {
        if (!card.closest(".jr-item")?.classList.contains("is-active")) return;
        const r = card.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width;
        py = (e.clientY - r.top) / r.height;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const onLeave = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      return () => {
        cancelAnimationFrame(raf);
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      };
    });
    return () => offs.forEach((off) => off());
  }, [items.length]);

  // 2) Scroll-linked progress along the road
  useEffect(() => {
    if (!geom) return;
    const wrap = wrapRef.current;
    const [base, ...progress] = pathRefs.current;
    if (!base) return;
    const total = base.getTotalLength();

    // Sample the path once: y increases monotonically along it
    const ys = new Float32Array(SAMPLES);
    const xs = new Float32Array(SAMPLES);
    for (let i = 0; i < SAMPLES; i++) {
      const p = base.getPointAtLength((total * i) / (SAMPLES - 1));
      xs[i] = p.x;
      ys[i] = p.y;
    }
    const indexAtY = (y) => {
      if (y <= ys[0]) return 0;
      if (y >= ys[SAMPLES - 1]) return SAMPLES - 1;
      let lo = 0;
      let hi = SAMPLES - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (ys[mid] <= y) lo = mid;
        else hi = mid;
      }
      return lo;
    };
    const lenAt = (i) => (total * i) / (SAMPLES - 1);
    const nodeLens = geom.nodeYs.map((y) => lenAt(indexAtY(y)));
    const nodeEls = [...wrap.querySelectorAll(".jr-item")];
    const endEl = endId && document.getElementById(endId);

    progress.forEach((p) => {
      p.style.strokeDasharray = `${total}`;
      p.style.strokeDashoffset = `${total}`;
    });

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect();
      const target = window.innerHeight * 0.6 - r.top;
      const idx = target <= 0 ? -1 : indexAtY(target);
      const len = idx < 0 ? 0 : lenAt(idx);
      progress.forEach((p) => (p.style.strokeDashoffset = `${total - len}`));
      const tip = tipRef.current;
      if (idx < 0 || idx >= SAMPLES - 1) {
        tip.style.opacity = "0";
      } else {
        tip.style.opacity = "1";
        tip.setAttribute("cx", xs[idx]);
        tip.setAttribute("cy", ys[idx]);
      }
      nodeEls.forEach((el, i) => el.classList.toggle("is-active", idx >= 0 && nodeLens[i] <= len + 2));
      endEl?.classList.toggle("is-active", idx >= SAMPLES - 1);
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
  }, [geom, endId]);

  return (
    <div ref={wrapRef} className="journey-road" style={{ "--n": items.length }}>
      {geom && (
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geom.h}>
              {/* gold where the background is blue, PFEC blue where it turns white */}
              <stop offset="0" stopColor="#ffe08a" />
              <stop offset="0.45" stopColor="#ffc53d" />
              <stop offset="0.62" stopColor="#3a3fe6" />
              <stop offset="1" stopColor="#100694" />
            </linearGradient>
            {geom.hole && (
              <mask id={`${gradId}-mask`} maskUnits="userSpaceOnUse" x={-geom.w} y={-geom.h} width={geom.w * 3} height={geom.h * 3}>
                <rect x={-geom.w} y={-geom.h} width={geom.w * 3} height={geom.h * 3} fill="#fff" />
                <circle cx={geom.hole.x} cy={geom.hole.y} r={geom.hole.r} fill="#000" />
              </mask>
            )}
          </defs>
          <g mask={geom.hole ? `url(#${gradId}-mask)` : undefined}>
            {/* grey road */}
            <path ref={(el) => { pathRefs.current[0] = el; }} d={geom.d} fill="none" stroke="#c4c2e4" strokeWidth="5" strokeLinecap="round" />
            {/* glowing progress (layered strokes = cheap glow) */}
            <path ref={(el) => { pathRefs.current[1] = el; }} d={geom.d} fill="none" stroke={`url(#${gradId})`} strokeWidth="22" strokeOpacity="0.12" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current[2] = el; }} d={geom.d} fill="none" stroke={`url(#${gradId})`} strokeWidth="13" strokeOpacity="0.28" strokeLinecap="round" />
            <path ref={(el) => { pathRefs.current[3] = el; }} d={geom.d} fill="none" stroke={`url(#${gradId})`} strokeWidth="6" strokeLinecap="round" />
            {/* light at the tip */}
            <circle ref={tipRef} r="7" className="jr-tip" style={{ opacity: 0 }} />
          </g>
        </svg>
      )}

      <ol>
        {items.map((m, i) => (
          <li key={`${m.year}-${m.title}`} className={`jr-item ${i % 2 ? "jr-item--b" : "jr-item--a"}`} style={{ "--i": i }}>
            <span className="jr-node" aria-hidden="true" />
            <div className="jr-card premium-card" style={{ "--sweep-delay": `${(i % 4) * 0.9}s` }}>
              <p className="jr-year">{m.year}</p>
              <h3 className="jr-title">
                {m.title}
                {m.country && (
                  // the city is the country itself (e.g. "Indonesia") → flag only
                  <span className={`jr-country ${COUNTRIES[m.country] === m.title ? "jr-country--flag" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/images/flags/${m.country}.svg`} alt="" width={16} height={11} />
                    {COUNTRIES[m.country] !== m.title && COUNTRIES[m.country]}
                  </span>
                )}
              </h3>
              <p className="jr-text">{m.text}</p>
              {m.img && (
                <div className="jr-img">
                  <Image src={m.img} alt={m.title} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 80vw" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
