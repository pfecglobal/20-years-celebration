"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ffd36b", "#ffc53d", "#fff3c4", "#f5a524", "#ffffff", "#8f95ff", "#ffb04a"];
// Deeper tones for the occasional fireworks further down, so they still read on the light sections
const PAGE_COLORS = ["#f5a524", "#e8a317", "#ffb04a", "#4234ff", "#6a5cff", "#d4af37"];
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

// Performance: sparks are drawn in batches (one stroke per colour / opacity step / width step)
// instead of one stroke per spark, and the canvas renders at ≤1.5× pixel density.
const ALPHA_STEPS = 6;
const MAX_DPR = 1.5;
const remove = (arr, i) => {
  arr[i] = arr[arr.length - 1];
  arr.pop();
};

/**
 * Full-viewport overlay that renders fireworks and a gold cursor trail.
 * Clicking anywhere on the page (except buttons, links, videos, etc.) bursts a firework at the cursor.
 * Trigger a show from anywhere with:
 *   window.dispatchEvent(new CustomEvent("pfec:celebrate", { detail: { count, x, y } }))
 */
export default function CelebrationCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const rockets = [];
    const sparks = [];
    const timers = new Set();
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let maxSparks = 1600;
    const batches = new Map(); // "color|alpha|width" → flat [x1, y1, x2, y2, …]

    const resize = () => {
      // phones: 1.25× is plenty for soft sparks and ~30% fewer pixels to fill than 1.5×
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : MAX_DPR);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxSparks = w < 640 ? 800 : 1600; // phones get a smaller particle budget
    };

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const explode = (x, y, palette = COLORS) => {
      const room = maxSparks - sparks.length;
      if (room < 20) return;
      const count = Math.min(room, (w < 640 ? 45 : 70) + ((Math.random() * (w < 640 ? 30 : 50)) | 0));
      const base = pick(palette);
      const alt = pick(palette);
      const ring = Math.random() < 0.3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.15;
        const sp = ring ? 4.6 + Math.random() * 0.5 : 0.8 + Math.random() * 5;
        sparks.push({
          x, y, px: x, py: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.007 + Math.random() * 0.011,
          color: Math.random() < 0.72 ? base : alt,
          size: 1.3 + Math.random() * 1.7,
          gravity: 0.05,
          friction: 0.972,
          twinkle: Math.random() < 0.4,
        });
      }
      sparks.push({ x, y, px: x, py: y, vx: 0, vy: 0, life: 1, decay: 0.07, color: "#fff", size: 60, gravity: 0, friction: 1, flash: true });
      start();
    };

    const launch = (tx, ty, palette) => {
      const x = tx ?? w * (0.12 + Math.random() * 0.76);
      const y = ty ?? h * (0.1 + Math.random() * 0.32);
      const sx = x + (Math.random() - 0.5) * w * 0.12;
      rockets.push({ x: sx, y: h + 10, px: sx, py: h + 10, tx: x, ty: y, palette });
      start();
    };

    // While a show runs, <html class="is-celebrating"> pauses costly CSS animations (see globals.css)
    let celebrateTimer = 0;
    const show = (count = 6) => {
      for (let i = 0; i < count; i++) later(() => launch(), i * 260 + Math.random() * 220);
      document.documentElement.classList.add("is-celebrating");
      clearTimeout(celebrateTimer);
      celebrateTimer = setTimeout(() => document.documentElement.classList.remove("is-celebrating"), count * 260 + 3200);
    };

    const step = (now) => {
      const k = Math.min((now - (last || now)) / 16.67 || 1, 3);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.px = r.x;
        r.py = r.y;
        r.x += (r.tx - r.x) * 0.055 * k;
        r.y += (r.ty - r.y) * 0.055 * k;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#ffe08a";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(r.px, r.py + 14);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (Math.abs(r.ty - r.y) < 6) {
          remove(rockets, i);
          explode(r.x, r.y, r.palette);
        } else if (Math.random() < 0.5 && sparks.length < maxSparks) {
          sparks.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 1.2, life: 0.7, decay: 0.03, color: "#ffc53d", size: 1.2, gravity: 0.02, friction: 0.96 });
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= s.decay * k;
        if (s.life <= 0) {
          remove(sparks, i);
          continue;
        }
        if (s.ring) {
          // touch ripple: a thin gold ring that eases outward and fades
          const t = 1 - s.life;
          const eased = 1 - Math.pow(1 - t, 3);
          ctx.globalAlpha = s.life * s.life * 0.45;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 4 + eased * s.size, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }
        if (s.flash) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
          g.addColorStop(0, `rgba(255,236,180,${(s.peak ?? 0.55) * s.life})`);
          g.addColorStop(1, "rgba(255,200,80,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        s.px = s.x;
        s.py = s.y;
        const f = Math.pow(s.friction, k);
        s.vx *= f;
        s.vy = s.vy * f + s.gravity * k;
        s.x += s.vx * k;
        s.y += s.vy * k;
        // queue the streak into its batch (drawn below in one stroke per batch)
        const alpha = s.twinkle ? s.life * (0.4 + Math.random() * 0.6) : s.life;
        const a = Math.ceil(alpha * ALPHA_STEPS);
        if (a <= 0) continue;
        const key = `${s.color}|${a}|${s.size < 1.6 ? 1 : s.size < 2.4 ? 2 : 3}`;
        let list = batches.get(key);
        if (!list) batches.set(key, (list = []));
        list.push(s.px - s.vx * 1.5, s.py - s.vy * 1.5, s.x, s.y);
      }

      const WIDTHS = [0, 1.3, 2, 2.8];
      for (const [key, list] of batches) {
        if (!list.length) continue;
        const [color, a, wi] = key.split("|");
        ctx.globalAlpha = a / ALPHA_STEPS;
        ctx.strokeStyle = color;
        ctx.lineWidth = WIDTHS[wi];
        ctx.beginPath();
        for (let j = 0; j < list.length; j += 4) {
          ctx.moveTo(list[j], list[j + 1]);
          ctx.lineTo(list[j + 2], list[j + 3]);
        }
        ctx.stroke();
        list.length = 0;
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (rockets.length || sparks.length) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
        last = 0;
        batches.clear();
        ctx.clearRect(0, 0, w, h);
      }
    };

    function start() {
      if (!raf) raf = requestAnimationFrame(step);
    }

    // Gold cursor trail (mouse / trackpad only)
    let lx = -1;
    let ly = -1;
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      if (dx * dx + dy * dy < 140) return;
      lx = e.clientX;
      ly = e.clientY;
      for (let i = 0; i < 2; i++) {
        sparks.push({
          x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6 + 0.4,
          life: 0.9, decay: 0.028 + Math.random() * 0.02,
          color: pick(["#ffd36b", "#ffc53d", "#fff3c4"]),
          size: 1 + Math.random() * 1.6, gravity: 0.03, friction: 0.95, twinkle: true,
        });
      }
      start();
    };

    // Touch screens have no cursor: press → soft glow + ripple ring, drag / scroll → sparkle trail under the finger
    // soft, low-opacity halo that fades slowly
    const glowAt = (x, y, size, peak) =>
      sparks.push({ x, y, px: x, py: y, vx: 0, vy: 0, life: 1, decay: 0.022, color: "#fff", size, peak, gravity: 0, friction: 1, flash: true });
    // a few tiny gold motes that drift gently upward and fade
    const sparkle = (x, y, n, speed) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.2 + Math.random() * speed;
        sparks.push({
          x, y, px: x, py: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.25,
          life: 0.75, decay: 0.01 + Math.random() * 0.01,
          color: pick(["#ffd36b", "#ffe08a", "#fff3c4"]),
          size: 0.8 + Math.random() * 1, gravity: -0.004, friction: 0.97,
        });
      }
    };

    let tx = -1;
    let ty = -1;
    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (!t) return;
      tx = t.clientX;
      ty = t.clientY;
      glowAt(tx, ty, 38, 0.3);
      sparks.push({ x: tx, y: ty, px: tx, py: ty, vx: 0, vy: 0, life: 1, decay: 0.018, color: "#ffd36b", size: 30, gravity: 0, friction: 1, ring: true });
      sparkle(tx, ty, 5, 0.9);
      start();
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - tx;
      const dy = t.clientY - ty;
      if (dx * dx + dy * dy < 200) return; // ~14px between drops → a light, even trail
      tx = t.clientX;
      ty = t.clientY;
      glowAt(tx, ty, 22, 0.18);
      sparkle(tx, ty, 1 + (Math.random() < 0.5 ? 1 : 0), 0.6);
      start();
    };

    // Click anywhere → firework burst at that spot (interactive elements keep their normal behaviour)
    const INTERACTIVE = "a, button, input, textarea, select, label, video, iframe, dialog, [role='button'], .video-card, .award-row";
    const onClick = (e) => {
      if (e.button !== 0 || e.target.closest?.(INTERACTIVE)) return;
      if (e.pointerType === "touch" || e.pointerType === "pen") return; // touch gets the soft glow instead
      if (window.getSelection?.().toString()) return; // don't fire while selecting text
      explode(e.clientX, e.clientY);
    };

    const onCelebrate = (e) => {
      const { count = 6, x, y } = e.detail || {};
      if (x != null && y != null) explode(x, y);
      show(w < 640 ? Math.ceil(count * 0.7) : count);
    };

    const inHero = () => window.scrollY <= window.innerHeight * 0.5;

    // Gentle ambient fireworks while the hero is on screen
    const ambient = setInterval(() => {
      if (document.hidden || !inHero()) return;
      launch();
      if (Math.random() < 0.4) later(() => launch(), 350);
    }, 7000);

    // Further down the page: a small show (2–3 rockets) every 8–10s — not while a video is playing.
    // Rockets are spread across the screen: always one left + one right, and the 3rd in the middle.
    const PAGE_MIN_MS = 8000;
    const PAGE_MAX_MS = 10000;
    const LANES = [
      [0.06, 0.3], // left
      [0.7, 0.94], // right
      [0.38, 0.62], // centre
    ];
    const pageShow = () => {
      if (!document.hidden && !inHero() && !document.querySelector("dialog[open]")) {
        const lanes = LANES.slice(0, 2 + ((Math.random() * 2) | 0)).sort(() => Math.random() - 0.5); // random firing order
        lanes.forEach(([from, to], i) => {
          const x = w * (from + Math.random() * (to - from));
          const y = h * (0.1 + Math.random() * 0.32);
          later(() => launch(x, y, PAGE_COLORS), i * 380 + Math.random() * 200);
        });
      }
      later(pageShow, PAGE_MIN_MS + Math.random() * (PAGE_MAX_MS - PAGE_MIN_MS));
    };
    later(pageShow, PAGE_MIN_MS);

    resize(); // the opening show is triggered by the "20" counter when it lands
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pfec:celebrate", onCelebrate);
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(ambient);
      clearTimeout(celebrateTimer);
      document.documentElement.classList.remove("is-celebrating");
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pfec:celebrate", onCelebrate);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
