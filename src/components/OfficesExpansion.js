"use client";

import { useEffect, useMemo, useRef } from "react";
import SparkleField from "./SparkleField";
import { WORLD } from "@/data/worldMap";

/*
 * "We've grown from 1 car in Melbourne" — a pinned, scroll-driven fold (like an "assembly" scene):
 *   1. a dotted world map assembles, continent by continent, as you scroll
 *   2. the camera zooms into Asia-Pacific
 *   3. our countries light up in the order they opened — gold dots + outline, city pins pop,
 *      a glowing arc draws from Melbourne — while the numbered labels and the office counter build up
 * The page only moves on once the map is complete. Everything is drawn from the scroll position
 * (scrolling back up plays it in reverse).
 */

// timeline (fractions of the pinned scroll)
const ASSEMBLE_END = 0.34;
const ZOOM = [0.34, 0.46];
const SLOT_START = 0.46;
const SLOT = 0.09; // one country per slot
const REGION_ORDER = [0, 1, 2, 3, 4]; // Americas, Europe, Africa, Asia, Oceania
const REGION_FROM = [
  [-1, -0.25],
  [0.1, -1],
  [0.25, 1],
  [1, -0.35],
  [0.9, 1],
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
// deterministic pseudo-random per dot (same "scatter" every render)
const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pad3 = (n) => String(n).padStart(3, "0");

export default function OfficesExpansion({ data, milestones }) {
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const officesRef = useRef(null);
  const countriesRef = useRef(null);
  const officesWordRef = useRef(null);
  const countriesWordRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const pctRef = useRef(null);
  const labelsRef = useRef(null);

  // countries in the order they opened (from the journey milestones) + their office counts
  const order = useMemo(() => {
    const firstYear = {};
    for (const m of milestones) if (m.country && !firstYear[m.country]) firstYear[m.country] = String(m.year).match(/\d{4}/)?.[0];
    return Object.keys(firstYear).map((code) => {
      const c = data.countries.find((x) => x.code === code);
      return { code, name: c?.name ?? code, offices: c?.offices ?? 0, since: firstYear[code] };
    });
  }, [data, milestones]);

  useEffect(() => {
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!track || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const N = WORLD.dots.length / 3;
    const goldOf = new Map(); // dot index → order slot of its country
    order.forEach((c, slot) => (WORLD.countryDots[c.code] || []).forEach((i) => goldOf.set(i, slot)));
    const outlines = Object.fromEntries(order.map((c) => [c.code, new Path2D(WORLD.outlines[c.code])]));
    const citiesBy = Object.fromEntries(order.map((c) => [c.code, WORLD.cities.filter((x) => x.code === c.code)]));
    const origin = WORLD.cities.find((x) => x.name === "Melbourne").xy;
    const labels = labelsRef.current ? [...labelsRef.current.children] : [];

    // per-dot scatter + start delay (precomputed)
    const scatter = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = WORLD.dots[i * 3 + 2];
      const [fx, fy] = REGION_FROM[r];
      const dist = 520 + rand(i, 1) * 380;
      scatter[i * 3] = fx * dist + (rand(i, 2) - 0.5) * 260;
      scatter[i * 3 + 1] = fy * dist + (rand(i, 3) - 0.5) * 260;
      scatter[i * 3 + 2] = rand(i, 4); // delay jitter
    }

    let cw = 0;
    let ch = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      cw = r.width;
      ch = r.height;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    };

    const progress = () => {
      if (reduced) return 1;
      const r = track.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return total > 0 ? clamp01(-r.top / total) : 1;
    };

    let lastSlot = -2;
    // fireworks when the expansion completes (100%) — once; re-armed after scrolling back below 90%
    let celebrated = false;

    // The map (dots, outlines, arcs) only changes with the scroll position, so it's rendered into an
    // offscreen buffer when p changes; each frame just copies it and draws the pulsing pins on top.
    const scene = document.createElement("canvas");
    const sctx = scene.getContext("2d");
    let sceneP = -1;
    let cam = { s: 1, ox: 0, oy: 0 };
    let lit = order.map(() => 0);

    const renderScene = (p) => {
      sceneP = p;
      if (scene.width !== canvas.width || scene.height !== canvas.height) {
        scene.width = canvas.width;
        scene.height = canvas.height;
      }
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.clearRect(0, 0, scene.width, scene.height);

      // ----- camera: whole world → Asia-Pacific -----
      const z = easeInOut(clamp01((p - ZOOM[0]) / (ZOOM[1] - ZOOM[0])));
      const [fx, fy, fw, fh] = WORLD.focus;
      const vx = lerp(0, fx, z);
      const vy = lerp(0, fy, z);
      const vw = lerp(WORLD.w, fw, z);
      const vh = lerp(WORLD.h, fh, z);
      const s = Math.min(cw / vw, ch / vh) * 0.94;
      const ox = (cw - vw * s) / 2 - vx * s;
      const oy = (ch - vh * s) / 2 - vy * s;
      cam = { s, ox, oy };
      sctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);

      // country "lit" amount (0..1) per slot
      lit = order.map((_, k) => easeOut(clamp01((p - (SLOT_START + k * SLOT)) / (SLOT * 0.6))));

      // ----- dots: tiny squares (look round at this size, far cheaper than arcs), batched by colour step;
      //       constant size on screen while the camera zooms -----
      const rDot = (1.05 + 0.7 * z) / s;
      const buckets = new Map();
      const add = (key, x, y, r) => {
        let b = buckets.get(key);
        if (!b) buckets.set(key, (b = []));
        b.push(x, y, r);
      };
      for (let i = 0; i < N; i++) {
        const reg = WORLD.dots[i * 3 + 2];
        const rk = REGION_ORDER.indexOf(reg);
        const start = 0.02 + rk * 0.056 + scatter[i * 3 + 2] * 0.07;
        const t = easeOut(clamp01((p - start) / 0.13));
        if (t <= 0) continue;
        const x = WORLD.dots[i * 3] + scatter[i * 3] * (1 - t);
        const y = WORLD.dots[i * 3 + 1] + scatter[i * 3 + 1] * (1 - t);
        const a = Math.ceil(t * 5) / 5;
        const slot = goldOf.get(i);
        if (slot !== undefined && lit[slot] > 0) {
          const g = Math.ceil(lit[slot] * 4) / 4;
          add(`g|${g}`, x, y, rDot * (1 + 0.3 * g));
        } else if (slot !== undefined) {
          // our countries, waiting their turn: stay bright so the eye goes there
          add(`w|${a}`, x, y, rDot);
        } else {
          add(`b|${a}`, x, y, rDot);
        }
      }
      const dim = 1 - 0.62 * z; // the rest of the world steps back once we focus on our region
      for (const [key, list] of buckets) {
        const [kind, v] = key.split("|");
        const val = +v;
        sctx.fillStyle =
          kind === "g"
            ? `rgba(255, 205, 90, ${0.35 + 0.65 * val})`
            : kind === "w"
              ? `rgba(196, 200, 255, ${0.75 * val})`
              : `rgba(170, 176, 255, ${0.5 * val * dim})`;
        sctx.beginPath();
        for (let j = 0; j < list.length; j += 3) {
          const r = list[j + 2];
          sctx.rect(list[j] - r, list[j + 1] - r, r * 2, r * 2);
        }
        sctx.fill();
      }

      // ----- countries: outline glow (wide faint stroke + thin bright one, no blur), arcs from Melbourne -----
      order.forEach((c, k) => {
        const l = lit[k];
        if (l <= 0) return;
        const path = outlines[c.code];
        sctx.fillStyle = `rgba(255, 196, 61, ${0.14 * l})`;
        sctx.fill(path);
        sctx.lineJoin = "round";
        sctx.lineWidth = 6 / s;
        sctx.strokeStyle = `rgba(255, 190, 60, ${0.16 * l})`;
        sctx.stroke(path);
        sctx.lineWidth = 1.4 / s;
        sctx.strokeStyle = `rgba(255, 214, 110, ${0.9 * l})`;
        sctx.stroke(path);

        const arcT = easeOut(clamp01((p - (SLOT_START + k * SLOT) - SLOT * 0.1) / (SLOT * 0.7)));
        if (arcT <= 0) return;
        for (const city of citiesBy[c.code]) {
          if (city.name === "Melbourne") continue;
          const [x2, y2] = city.xy;
          const mx = (origin[0] + x2) / 2;
          const my = (origin[1] + y2) / 2 - Math.hypot(x2 - origin[0], y2 - origin[1]) * 0.35;
          const steps = 36;
          const upto = Math.max(1, Math.round(steps * arcT));
          sctx.beginPath();
          let hx = origin[0];
          let hy = origin[1];
          sctx.moveTo(hx, hy);
          for (let j = 1; j <= upto; j++) {
            const u = j / steps;
            hx = (1 - u) * (1 - u) * origin[0] + 2 * (1 - u) * u * mx + u * u * x2;
            hy = (1 - u) * (1 - u) * origin[1] + 2 * (1 - u) * u * my + u * u * y2;
            sctx.lineTo(hx, hy);
          }
          sctx.lineWidth = 1.3 / s;
          sctx.strokeStyle = "rgba(255, 224, 138, 0.75)";
          sctx.stroke();
          if (arcT < 1) {
            // travelling spark at the head of the arc
            sctx.fillStyle = "#fff6d6";
            sctx.beginPath();
            sctx.arc(hx, hy, 2.4 / s, 0, Math.PI * 2);
            sctx.fill();
          }
        }
      });

      // ----- HTML overlays -----
      const litCount = lit.filter((l) => l > 0.5).length;
      const offices = litCount ? order.slice(0, litCount).reduce((n, c) => n + c.offices, 0) : 1;
      const nCountries = Math.max(1, litCount);
      if (officesRef.current) officesRef.current.textContent = offices;
      if (countriesRef.current) countriesRef.current.textContent = nCountries;
      if (officesWordRef.current) officesWordRef.current.textContent = offices === 1 ? "Office" : "Offices";
      if (countriesWordRef.current) countriesWordRef.current.textContent = nCountries === 1 ? "Country" : "Countries";
      // the "N Offices Across the N Countries" line appears once the countries start coming in
      // (scroll-linked: fades / rises in with the first country, and back out when scrolling up)
      if (countRef.current) {
        const c = lit[0];
        countRef.current.style.opacity = c.toFixed(3);
        countRef.current.style.transform = `translateY(${(0.6 * (1 - c)).toFixed(3)}em) scale(${(0.96 + 0.04 * c).toFixed(4)})`;
        countRef.current.style.filter = c >= 1 ? "none" : `blur(${(6 * (1 - c)).toFixed(2)}px)`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) pctRef.current.textContent = `${pad3(Math.round(p * 100))}%`;
      if (!celebrated && p >= 0.995 && !reduced) {
        celebrated = true;
        // a burst right over the map + a show across the screen (CelebrationCanvas; fewer rockets on phones)
        const r = canvas.getBoundingClientRect();
        window.dispatchEvent(
          new CustomEvent("pfec:celebrate", { detail: { count: 6, x: r.left + r.width / 2, y: r.top + r.height * 0.35 } })
        );
      } else if (celebrated && p < 0.9) {
        celebrated = false;
      }
      const current = litCount - 1;
      if (current !== lastSlot) {
        lastSlot = current;
        labels.forEach((el, k) => {
          el.classList.toggle("is-on", k <= current);
          el.classList.toggle("is-current", k === current);
        });
        // every country lit → phones switch from "latest country only" to a summary of all of them
        labelsRef.current?.classList.toggle("is-complete", current === order.length - 1);
      }
    };

    // ----- hover: a label or the country itself (on the map) → that country lights up brighter -----
    let hovered = -1; // order index, or -1
    const hoverAmt = order.map(() => 0); // eased 0..1 per country
    const hitCtx = document.createElement("canvas").getContext("2d"); // identity transform → world coords
    const setHover = (k) => {
      if (k === hovered) return;
      hovered = k;
      labels.forEach((el, i) => el.classList.toggle("is-hover", i === k));
      canvas.style.cursor = k >= 0 ? "pointer" : "";
    };
    const countryAt = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      const { s, ox, oy } = cam;
      const wx = (clientX - r.left - ox) / s;
      const wy = (clientY - r.top - oy) / s;
      // 1) inside a country's outline wins (countries never overlap — e.g. Bangladesh vs India)
      for (let k = 0; k < order.length; k++) {
        if (lit[k] >= 0.5 && hitCtx.isPointInPath(outlines[order[k].code], wx, wy)) return k;
      }
      // 2) otherwise the nearest city pin within ~18px (helps tiny Sri Lanka / Bangladesh)
      let best = -1;
      let bestD = 18;
      order.forEach((c, k) => {
        if (lit[k] < 0.5) return;
        for (const city of citiesBy[c.code]) {
          const d = Math.hypot(city.xy[0] - wx, city.xy[1] - wy) * s;
          if (d < bestD) {
            bestD = d;
            best = k;
          }
        }
      });
      return best;
    };
    const onCanvasMove = (e) => setHover(countryAt(e.clientX, e.clientY));
    const onCanvasLeave = () => setHover(-1);
    const labelHandlers = labels.map((el, k) => {
      const enter = () => lit[k] >= 0.5 && setHover(k);
      const leave = () => setHover(-1);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      };
    });
    canvas.addEventListener("pointermove", onCanvasMove);
    canvas.addEventListener("pointerleave", onCanvasLeave);

    let shown = false; // something is on the visible canvas
    const draw = (now) => {
      const p = progress();
      const changed = p !== sceneP;
      if (changed) renderScene(p);
      const anyLit = lit[0] > 0;
      // nothing moves (no pins yet) and the scroll didn't change → keep the current frame
      if (!changed && !anyLit && shown) return;
      shown = true;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(scene, 0, 0);
      if (!anyLit) return;

      const { s, ox, oy } = cam;
      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
      const pulse = (Math.sin(now / 420) + 1) / 2;

      // hovered country: brighter fill + strong glowing outline (eased in / out)
      order.forEach((c, k) => {
        hoverAmt[k] += ((hovered === k ? 1 : 0) - hoverAmt[k]) * 0.18;
        const h = hoverAmt[k] * Math.min(1, lit[k]);
        if (h < 0.01) return;
        const path = outlines[c.code];
        ctx.lineJoin = "round";
        ctx.fillStyle = `rgba(255, 200, 70, ${0.28 * h})`;
        ctx.fill(path);
        ctx.lineWidth = 12 / s;
        ctx.strokeStyle = `rgba(255, 190, 60, ${0.16 * h})`;
        ctx.stroke(path);
        ctx.lineWidth = 5 / s;
        ctx.strokeStyle = `rgba(255, 205, 90, ${0.32 * h})`;
        ctx.stroke(path);
        ctx.lineWidth = 2.2 / s;
        ctx.strokeStyle = `rgba(255, 240, 190, ${h})`;
        ctx.stroke(path);
      });

      // pins pop in (one after another), then pulse softly (bigger on the hovered country)
      order.forEach((c, k) => {
        const l = lit[k];
        if (l <= 0) return;
        const grow = 1 + 0.45 * hoverAmt[k];
        citiesBy[c.code].forEach((city, j) => {
          const pt = clamp01((l - j * 0.12) / 0.5);
          if (pt <= 0) return;
          const pop = pt < 1 ? 1 + Math.sin(pt * Math.PI) * 0.6 : 1;
          const [x, y] = city.xy;
          const base = (3.4 / s) * grow;
          ctx.fillStyle = `rgba(255, 200, 70, ${0.18 + 0.12 * pulse})`;
          ctx.beginPath();
          ctx.arc(x, y, base * (2.2 + pulse * 0.9) * pop, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffc53d";
          ctx.beginPath();
          ctx.arc(x, y, base * pop, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fffbea";
          ctx.beginPath();
          ctx.arc(x, y, base * 0.42 * pop, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      // Melbourne: the origin ring
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * (1 - pulse)})`;
      ctx.lineWidth = 1.2 / s;
      ctx.beginPath();
      ctx.arc(origin[0], origin[1], (5 + pulse * 7) / s, 0, Math.PI * 2);
      ctx.stroke();
    };

    // run only while the fold is on screen
    let raf = 0;
    let visible = false;
    const loop = (now) => {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const play = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
    });
    io.observe(track);

    const ro = new ResizeObserver(() => {
      resize();
      sceneP = -1;
      shown = false;
      draw(performance.now());
    });
    ro.observe(canvas);
    resize();
    draw(performance.now());
    const onVis = () => !document.hidden && visible && play();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onCanvasMove);
      canvas.removeEventListener("pointerleave", onCanvasLeave);
      labelHandlers.forEach((off) => off());
    };
  }, [order]);

  const total = data.countries.reduce((n, c) => n + c.offices, 0);

  return (
    <section ref={trackRef} id="offices" className="ox-track bg-offices relative isolate">
      <div ref={stickyRef} className="ox-sticky">
        <div className="stars-carry stars-carry--in" aria-hidden="true">
          <SparkleField />
        </div>
        {/* outlined "PFEC GLOBAL" running on its own in the background (seamless loop: two identical halves) */}
        <div className="ox-outline" aria-hidden="true">
          <div className="ox-outline-track">
            {[0, 1].map((half) => (
              <span key={half}>
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className="ox-outline-word">
                    PFEC GLOBAL
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <header className="ox-head">
          <p className="ox-eyebrow">Our footprint · 2006 — 2026</p>
          <h2 className="ox-title">
            {/* "*word*" → gold */}
            {data.intro.split(/(\*[^*]+\*)/).map((part, i) =>
              part.startsWith("*") && part.endsWith("*") ? (
                <span key={i} className="text-gold">
                  {part.slice(1, -1)}
                </span>
              ) : (
                part
              )
            )}
            <br />
            {/* hidden until the first country lights up, then it rises in and counts along */}
            <span ref={countRef} className="ox-count" style={{ display: "inline-block", opacity: 0 }}>
              <span ref={officesRef} className="text-gold">
                1
              </span>{" "}
              <span ref={officesWordRef}>Office</span> Across the{" "}
              <span ref={countriesRef} className="text-gold">
                1
              </span>{" "}
              <span ref={countriesWordRef}>Country</span>
            </span>
          </h2>
          <span className="sr-only">
            {total} offices across {data.countries.length} countries.
          </span>
        </header>

        <div className="ox-stage">
          <canvas ref={canvasRef} className="ox-canvas" aria-hidden="true" />
        </div>

        <ol ref={labelsRef} className="ox-labels">
          {order.map((c, k) => {
            // pairs side by side (01 | 02, 03 | 04 …); an odd last one goes under the right column (05 below 04)
            const lastOdd = k === order.length - 1 && order.length % 2 === 1;
            const side = lastOdd || k % 2 ? "r" : "l";
            const row = Math.floor(k / 2);
            return (
            <li key={c.code} className={`ox-label ox-label--${side}`} style={{ "--k": k, "--row": row }}>
              <span className="ox-num">{String(k + 1).padStart(2, "0")}</span>
              <span className="ox-rule" aria-hidden="true" />
              <span className="ox-name">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/flags/${c.code}.svg`} alt="" width={22} height={15} />
                {c.name}
              </span>
              <span className="ox-meta">
                <span>
                  {c.offices} {c.offices === 1 ? "office" : "offices"}
                </span>
                <span className="ox-meta-sep"> · </span>
                <span>since {c.since}</span>
              </span>
            </li>
            );
          })}
        </ol>

        <div className="ox-progress" aria-hidden="true">
          <span>Expansion</span>
          <span className="ox-bar">
            <i ref={barRef} />
          </span>
          <span ref={pctRef} className="ox-pct">
            000%
          </span>
        </div>
      </div>
    </section>
  );
}
