"use client";

import { useEffect, useRef } from "react";

// PFEC gold + blue party palette
const COLORS = ["#ffc53d", "#ffe08a", "#f5a524", "#fff3c4", "#c8a96a", "#2f35e0", "#8f95ff", "#ffffff", "#100694"];
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const rand = (a, b) => a + Math.random() * (b - a);

function makePiece(w, y) {
  const r = Math.random();
  const type = r < 0.58 ? "paper" : r < 0.78 ? "dot" : r < 0.9 ? "ribbon" : "star";
  return {
    type,
    x: rand(-20, w + 20),
    y,
    vy: rand(1.4, 3.2),
    vx: rand(-0.4, 0.4),
    swayAmp: rand(0.4, 1.6),
    swayFreq: rand(0.015, 0.04),
    phase: rand(0, Math.PI * 2),
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.08, 0.08),
    flip: rand(0, Math.PI * 2),
    flipSpeed: rand(0.05, 0.14),
    size: type === "ribbon" ? rand(18, 30) : type === "star" ? rand(5, 8) : rand(6, 11),
    color: type === "star" ? pick(["#ffc53d", "#ffe08a", "#fff3c4"]) : pick(COLORS),
    t: 0,
  };
}

function drawStar(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Birthday-style confetti falling from the top of the screen.
 * Falls once when the page loads (when the "20" counter lands) and again only if
 * "pfec:celebrate" is fired with { confetti: true } (the "Celebrate with us" button).
 */
export default function ConfettiRain() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const pieces = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let dpr = 1;

    const resize = () => {
      // ≤1.5× density (1.25× on phones): plenty for confetti, far cheaper
      dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const density = () => Math.max(window.innerWidth < 768 ? 0.36 : 0.45, Math.min(w / 1440, 1));

    const shower = (amount = 160) => {
      const n = Math.round(amount * density());
      for (let i = 0; i < n; i++) pieces.push(makePiece(w, rand(-h * 0.9, -10)));
      start();
    };

    const step = (now) => {
      const k = Math.min((now - (last || now)) / 16.67 || 1, 3);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.t += k;
        p.y += p.vy * k;
        p.x += (p.vx + Math.sin(p.t * p.swayFreq + p.phase) * p.swayAmp) * k;
        p.angle += p.spin * k;
        p.flip += p.flipSpeed * k;

        if (p.y > h + 40) {
          pieces[i] = pieces[pieces.length - 1]; // O(1) removal (order doesn't matter)
          pieces.pop();
          continue;
        }
        if (p.y < -40) continue;

        const flip = Math.cos(p.flip);
        // fade out over the last 15% of the screen
        ctx.globalAlpha = Math.min(1, (h + 40 - p.y) / (h * 0.15)) * (flip < 0 ? 0.75 : 1);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        // one setTransform (translate · rotate · scale) instead of save/translate/rotate/scale/restore
        const sx = p.type === "star" ? Math.abs(flip) * 0.5 + 0.5 : 1;
        const sy = p.type === "paper" ? flip : p.type === "dot" ? 0.35 + Math.abs(flip) * 0.65 : 1;
        const cos = Math.cos(p.angle) * dpr;
        const sin = Math.sin(p.angle) * dpr;
        ctx.setTransform(cos * sx, sin * sx, -sin * sy, cos * sy, p.x * dpr, p.y * dpr);

        if (p.type === "paper") {
          ctx.fillRect(-p.size / 2, -p.size * 0.8, p.size, p.size * 1.6);
        } else if (p.type === "dot") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "ribbon") {
          // curly streamer
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.beginPath();
          const seg = 6;
          for (let s = 0; s <= seg; s++) {
            const yy = (s / seg - 0.5) * p.size;
            const xx = Math.sin(s * 1.3 + p.flip) * 4;
            if (s === 0) ctx.moveTo(xx, yy);
            else ctx.lineTo(xx, yy);
          }
          ctx.stroke();
        } else {
          // (no shadowBlur — it's one of the slowest canvas operations)
          drawStar(ctx, p.size);
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;

      if (pieces.length) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
        last = 0;
        ctx.clearRect(0, 0, w, h);
      }
    };

    function start() {
      if (!raf) raf = requestAnimationFrame(step);
    }

    const onCelebrate = (e) => {
      if (e.detail?.confetti) shower(e.detail.confettiAmount ?? 220);
    };

    resize(); // the opening shower is triggered by the "20" counter when it lands
    window.addEventListener("resize", resize);
    window.addEventListener("pfec:celebrate", onCelebrate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pfec:celebrate", onCelebrate);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}
