"use client";

import { useEffect, useRef } from "react";

/**
 * Twinkling, slowly rising gold dust that drifts away from the cursor.
 *
 * Performance: the stars live in the coordinates of the whole host section, but the canvas itself is only
 * about one screen tall — it glides along with the viewport (a cheap transform) and only the stars inside
 * that window are drawn. A section-sized canvas (thousands of px tall on phones) had to be cleared and
 * re-composited every frame, which made scrolling stutter on mobile.
 */
export default function SparkleField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas.parentElement;
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

    let w = 0; // host size (star space)
    let h = 0;
    let viewH = 0; // canvas height (≈ one screen)
    let off = 0; // where the canvas currently sits inside the host
    let dpr = 1;
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
      const small = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5); // soft glow dots: low density is plenty
      w = host.clientWidth;
      h = host.clientHeight;
      viewH = reduce ? h : Math.min(h, Math.ceil(window.innerHeight * 1.15));
      canvas.style.height = `${viewH}px`;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(viewH * dpr));
      const target = Math.min(240, Math.round(((w * h) / 5500) * (small ? 0.75 : 1)));
      if (particles.length !== target) particles = Array.from({ length: target }, () => make());
      off = -1;
    };

    // keep the canvas over the visible part of the host
    const place = () => {
      if (viewH >= h) {
        if (off !== 0) {
          off = 0;
          canvas.style.transform = "";
        }
        return;
      }
      const top = host.getBoundingClientRect().top;
      const o = Math.round(Math.max(0, Math.min(h - viewH, -top - (viewH - window.innerHeight) / 2)));
      if (o !== off) {
        off = o;
        canvas.style.transform = `translate3d(0, ${o}px, 0)`;
      }
    };

    const draw = () => {
      place();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, -off * dpr);
      ctx.globalCompositeOperation = "lighter";
      const top = off - 30;
      const bottom = off + viewH + 30;
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
        const y = p.y + p.oy;
        if (y < top || y > bottom) continue; // outside the visible window — not drawn
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(p.phase));
        const size = p.r * 7 * (0.7 + tw * 0.3);
        ctx.globalAlpha = tw;
        ctx.drawImage(sprite, p.x + p.ox - size / 2, y - size / 2, size, size);
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
      if (e.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
    });
    const onVis = () => !document.hidden && visible && play();

    resize();
    draw();
    play();
    ro.observe(host);
    io.observe(host);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute top-0 right-0 left-0 w-full" />;
}
