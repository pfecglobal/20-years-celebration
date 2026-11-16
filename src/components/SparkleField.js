"use client";

import { useEffect, useRef } from "react";

/** Twinkling, slowly rising gold dust that drifts away from the cursor. */
export default function SparkleField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pre-rendered glow sprite (much cheaper than per-particle gradients)
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d");
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,250,225,1)");
    g.addColorStop(0.18, "rgba(255,214,110,0.9)");
    g.addColorStop(0.45, "rgba(255,180,50,0.25)");
    g.addColorStop(1, "rgba(255,170,40,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);

    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };

    const make = (y) => ({
      x: Math.random() * w,
      y: y ?? Math.random() * h,
      r: 0.5 + Math.pow(Math.random(), 2.2) * 2.6,
      vy: -(0.08 + Math.random() * 0.35),
      drift: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.03,
      ox: 0,
      oy: 0,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // soft glow dots: 1.5× density is plenty
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(240, Math.round((w * h) / 5500));
      particles = Array.from({ length: target }, () => make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (!reduce) {
          p.phase += p.speed;
          p.drift += 0.01;
          p.y += p.vy;
          p.x += Math.sin(p.drift) * 0.15;
          const dx = p.x + p.ox - mouse.x;
          const dy = p.y + p.oy - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16000) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / 126) * 3;
            p.ox += (dx / d) * force;
            p.oy += (dy / d) * force;
          }
          p.ox *= 0.94;
          p.oy *= 0.94;
          if (p.y < -10) Object.assign(p, make(h + 10));
        }
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(p.phase));
        const size = p.r * 7 * (0.7 + tw * 0.3);
        ctx.globalAlpha = tw;
        ctx.drawImage(sprite, p.x + p.ox - size / 2, p.y + p.oy - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = () => {
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };

    const play = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onResize = () => {
      resize();
      if (reduce) draw();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
    });
    const onVis = () => !document.hidden && visible && play();

    resize();
    draw();
    play();
    io.observe(canvas);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
