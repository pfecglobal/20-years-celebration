"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VideoMessage from "./VideoMessage";

const AUTOPLAY_MS = 4000;

// Horizontal position (× card width), scale and opacity for each distance from the centre card
const LAYOUT = [
  { x: 0, scale: 1, opacity: 1 },
  { x: 0.84, scale: 0.82, opacity: 0.85 },
  { x: 1.52, scale: 0.68, opacity: 0.5 },
  { x: 2.08, scale: 0.58, opacity: 0 },
];

/** Shortest signed distance from `active` to `i` on a loop of `n` cards. */
const offsetOf = (i, active, n) => {
  let o = (i - active) % n;
  if (o > n / 2) o -= n;
  if (o < -n / 2) o += n;
  return o;
};

/** Coverflow-style auto-playing carousel of videos (university partner messages). */
export default function StudentCarousel({ videos }) {
  const n = videos.length;
  const playlist = videos.map((v) => ({ youtube: v.youtube, title: v.name })); // popup plays on like reels
  const [state, setState] = useState({ active: 0, prev: 0 }); // prev → detects cards wrapping round
  const [hold, setHold] = useState(false); // hover / focus pause
  const [visible, setVisible] = useState(false); // on screen
  const [cycle, setCycle] = useState(0); // restarts the autoplay timer
  const stageRef = useRef(null);
  const swipe = useRef(null);

  const { active, prev } = state;
  const steps = Math.abs(offsetOf(active, prev, n));

  const goTo = useCallback((i) => {
    setState((s) => {
      const next = ((i % n) + n) % n;
      return next === s.active ? s : { active: next, prev: s.active };
    });
    setCycle((c) => c + 1);
  }, [n]);

  const next = useCallback(() => goTo(active + 1), [goTo, active]);
  const back = useCallback(() => goTo(active - 1), [goTo, active]);

  // Pause while off-screen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = !hold && visible && n > 1;

  // Autoplay: next card every AUTOPLAY_MS (not while a video popup is open, nor with reduced motion)
  useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (document.querySelector("dialog[open]")) setCycle((c) => c + 1);
      else next();
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [running, next, cycle]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
  };

  // Swipe / drag
  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - s.y)) (dx < 0 ? next : back)();
  };

  if (!n) return null;

  return (
    <div
      ref={stageRef}
      className="sc-stage"
      role="region"
      aria-roledescription="carousel"
      aria-label="Messages from our university partners"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHold(false)}
    >
      <div className="sc-glow" aria-hidden="true" />

      <div className="sc-track" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
        {videos.map((v, i) => {
          const o = offsetOf(i, active, n);
          const d = Math.min(Math.abs(o), LAYOUT.length - 1);
          const l = LAYOUT[d];
          const wrapped = Math.abs(o - offsetOf(i, prev, n)) > steps; // jumped from one side to the other
          const isActive = o === 0;
          return (
            <div
              key={v.youtube}
              className={`sc-slide ${isActive ? "is-active" : ""} ${wrapped ? "is-wrapping" : ""}`}
              style={{
                "--x": Math.sign(o) * l.x,
                "--s": l.scale,
                "--o": l.opacity,
                zIndex: 10 - d,
              }}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${v.name}`}
              aria-hidden={d > 2 || undefined}
            >
              <div className="sc-card" inert={!isActive}>
                <VideoMessage
                  youtube={v.youtube}
                  poster={v.poster}
                  title={v.name}
                  label=""
                  variant="tile"
                  playlist={playlist}
                  index={i}
                  group="partners"
                  caption={
                    <span className="sc-caption">
                      <span className="sc-caption-tag">
                        {v.country && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/images/flags/${v.country}.svg`}
                            alt=""
                            width={16}
                            height={12}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}
                        {v.university || "University partner"}
                      </span>
                      <span className="sc-caption-name">{v.name}</span>
                    </span>
                  }
                />
              </div>
              {!isActive && (
                <button type="button" tabIndex={-1} className="sc-pick" aria-label={`Show ${v.name}`} onClick={() => goTo(i)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
