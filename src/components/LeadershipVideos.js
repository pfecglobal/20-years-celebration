"use client";

import { useEffect, useRef, useState } from "react";
import VideoMessage from "./VideoMessage";
  
const PHONE = "(max-width: 639px)";
const AUTOPLAY_MS = 5000; // phones: next message every 7s

/**
 * Desktop: Founder and CEO share the larger featured row, with the other leaders below.
 * Name, role and an optional quote remain visible beneath each portrait.
 * Phones: a swipe slider ordered Founder, CEO, then the remaining leaders — cards scale / tilt / fade with the swipe (scroll-linked),
 * dots below; tapping a side card glides it to the centre, tapping the centre card plays it.
 * Autoplay (phones): glides to the next message every AUTOPLAY_MS (loops), the active dot fills up as a countdown.
 * Pauses while the finger is on the slider, while it's off screen, while a video popup is open, and with reduced motion.
 * Each card opens the same popup player as the rest of the page; it plays on through the messages
 * in the same order and can be switched like reels.
 */
export default function LeadershipVideos({ leaders, label = "Watch the message" }) {
  const featured = leaders.map((p, i) => p.featured ? i : -1).filter((i) => i !== -1);
  // Featured entries are listed Founder then CEO in content.js; keep the remaining leaders in content order.
  const slides = [...featured, ...leaders.map((_, i) => i).filter((i) => !featured.includes(i))];
  const spotlight = slides[0];
  // Cards, navigation dots, autoplay and the popup playlist all follow the same sequence.
  const order = slides.filter((i) => leaders[i].youtube);
  const playlist = order.map((i) => ({ youtube: leaders[i].youtube, title: `${leaders[i].name}, ${leaders[i].role}` }));

  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const [active, setActive] = useState(0); // slide index (phone order)
  const [visible, setVisible] = useState(false); // slider on screen
  const [hold, setHold] = useState(false); // finger on the slider
  const [tick, setTick] = useState(0); // restarts the autoplay timer (e.g. after a popup was open)

  // scroll-linked coverflow: each card gets --p (signed distance from the centre, -1..1) and --a (|p|)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const mq = window.matchMedia(PHONE);
    let raf = 0;
    let last = -1;

    const items = () => slides.map((i) => list.children[i]).filter(Boolean);
    const update = () => {
      raf = 0;
      const els = items();
      if (!mq.matches) {
        els.forEach((el) => {
          el.style.removeProperty("--p");
          el.style.removeProperty("--a");
        });
        return;
      }
      const box = list.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = 0;
      let bestD = Infinity;
      els.forEach((el, k) => {
        const r = el.getBoundingClientRect();
        const step = r.width + 12; // card width + gap → one slide away = 1
        const p = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / step));
        el.style.setProperty("--p", p.toFixed(3));
        el.style.setProperty("--a", Math.abs(p).toFixed(3));
        if (Math.abs(p) < bestD) {
          bestD = Math.abs(p);
          best = k;
        }
      });
      if (best !== last) {
        last = best;
        setActive(best);
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    list.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    mq.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      mq.removeEventListener("change", queue);
    };
    // slides only changes with the leaders list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaders]);

  // glide slide k (phone order) to the centre
  const goTo = (k) => {
    const list = listRef.current;
    const el = list?.children[slides[k]];
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left: el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  };

  // only autoplay while the slider is on screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // autoplay: the timer restarts whenever the active slide changes (a swipe or a dot tap resets it too)
  useEffect(() => {
    const ok =
      visible &&
      !hold &&
      slides.length > 1 &&
      window.matchMedia(PHONE).matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wrapRef.current?.classList.toggle("is-auto", ok); // drives the dot countdown (CSS)
    if (!ok) return;
    const t = setTimeout(() => {
      if (document.querySelector("dialog[open]") || !window.matchMedia(PHONE).matches) setTick((n) => n + 1);
      else goTo((active + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
    // goTo / slides are stable for a given leaders list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visible, hold, tick]);

  return (
    <div
      ref={wrapRef}
      className="leaders-wrap"
      style={{ "--autoplay": `${AUTOPLAY_MS}ms` }}
    >
      <ul
        ref={listRef}
        data-reveal="fade"
        className={`leaders ${featured.length === 2 ? "leaders--hierarchy" : ""}`}
        aria-label="Messages from our leadership"
        // finger on the slider → pause autoplay; released → the timer starts again from the current slide
        onTouchStart={() => setHold(true)}
        onTouchEnd={() => setHold(false)}
        onTouchCancel={() => setHold(false)}
      >
        {leaders.map((p, i) => {
          const isSpot = i === spotlight;
          const k = slides.indexOf(i);
          return (
            <li
              key={i}
              className={`leader ${isSpot ? "leader--spotlight" : ""} ${p.featured ? "leader--featured" : ""} ${k === active ? "is-current" : ""}`}
              style={{
                "--k": Math.abs(i - spotlight),
                "--slide-order": k,
                "--desktop-sequence": k,
                // desktop 12-column grid: Founder in columns 3–6, CEO in 7–10 (centred above the rows of 4)
                "--featured-column": featured.indexOf(i) === 0 ? 3 : 7,
              }}
              // phones: a tap on a side card brings it to the centre first (the centre card plays)
              onClickCapture={(e) => {
                if (e.target.closest("dialog")) return; // clicks inside the open popup player
                if (k !== active && window.matchMedia(PHONE).matches) {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(k);
                }
              }}
            >
              {p.featured && <p className="leader-feature-label">{p.featured}</p>}
              <div className="leader-card">
                <VideoMessage
                  youtube={p.youtube}
                  poster={p.poster}
                  label={isSpot || p.featured ? label : "Watch"}
                  title={`${p.name}, ${p.role}`}
                  variant="tile"
                  playlist={playlist}
                  index={order.indexOf(i)}
                  group="leaders"
                />
              </div>
              <div className="leader-meta">
                <p className="leader-name">{p.name}</p>
                <p className="leader-role">{p.role}</p>
                {p.quote && <p className="leader-quote">{p.quote}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {/* phones only: slide dots */}
      {slides.length > 1 && (
        <div className="leaders-dots" role="tablist" aria-label="Choose a message">
          {slides.map((i, k) => (
            <button
              // key includes the active slide → the countdown fill restarts on every change
              key={k === active ? `${i}-on-${tick}` : i}
              type="button"
              role="tab"
              aria-selected={k === active}
              aria-label={`${leaders[i].name}`}
              className={k === active ? "is-active" : ""}
              onClick={() => goTo(k)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
