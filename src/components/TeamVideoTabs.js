"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import VideoWall from "./VideoWall";

const ALL = "all";
const MAX_VIDEOS = 15; // 3 rows of 5 on desktop

// "All" takes videos in turn from each country, so every country shows up in the 3 rows
const interleave = (lists) =>
  Array.from({ length: Math.max(0, ...lists.map((l) => l.length)) }, (_, i) => lists.map((l) => l[i])).flat().filter(Boolean);
const EXIT_MS = 320; // old tiles leave, then the new country's tiles cascade in

function GlobeIcon() {
  return (
    <svg className="country-tab-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** "All" + one tab per country (flag + name). Picking a tab filters the team video wall with an animated swap. */
export default function TeamVideoTabs({ countries }) {
  const tabs = useMemo(
    () => [{ code: ALL, name: "All", videos: interleave(countries.map((c) => c.videos)) }, ...countries].map((t) => ({
      ...t,
      videos: t.videos.slice(0, MAX_VIDEOS),
    })),
    [countries]
  );

  const [active, setActive] = useState(ALL); // highlighted tab (moves instantly)
  const [shown, setShown] = useState(ALL); // country whose videos are on screen (swaps after the exit)
  const [phase, setPhase] = useState("idle"); // idle | out | in
  const [pill, setPill] = useState(null); // sliding highlight position
  const [height, setHeight] = useState(null); // animated panel height

  const listRef = useRef(null);
  const tabsRef = useRef([]);
  const innerRef = useRef(null);
  const timer = useRef(0);

  const current = tabs.find((t) => t.code === shown) ?? tabs[0];

  // Sliding pill follows the active tab (and re-measures on resize)
  const measurePill = useCallback(() => {
    const i = tabs.findIndex((t) => t.code === active);
    const el = tabsRef.current[i];
    if (el) setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  }, [active, tabs]);

  useLayoutEffect(measurePill, [measurePill]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(measurePill);
    ro.observe(list);
    return () => ro.disconnect();
  }, [measurePill]);

  // Panel height eases between countries instead of jumping (inner is re-keyed per country)
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height));
    ro.observe(inner);
    return () => ro.disconnect();
  }, [shown]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const select = (code, i) => {
    if (code === active) return;
    setActive(code);
    tabsRef.current[i]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    clearTimeout(timer.current);

    if (prefersReducedMotion()) {
      setShown(code);
      setPhase("idle");
      return;
    }
    setPhase("out");
    timer.current = setTimeout(() => {
      setShown(code);
      setPhase("in");
    }, EXIT_MS);
  };

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e, i) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + tabs.length) % tabs.length;
    select(tabs[next].code, next);
    tabsRef.current[next]?.focus();
  };

  return (
    <div>
      <div ref={listRef} role="tablist" aria-label="Filter team videos by country" className="country-tabs">
        {pill && (
          <span
            className="country-tab-pill"
            aria-hidden="true"
            style={{ transform: `translate3d(${pill.left}px, ${pill.top}px, 0)`, width: pill.width, height: pill.height }}
          />
        )}
        {tabs.map((t, i) => {
          const selected = t.code === active;
          return (
            <button
              key={t.code}
              ref={(el) => (tabsRef.current[i] = el)}
              type="button"
              role="tab"
              id={`team-tab-${t.code}`}
              aria-selected={selected}
              aria-controls="team-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.code, i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`country-tab ${selected ? "is-active" : ""} ${pill ? "has-pill" : ""}`}
            >
              {t.code === ALL ? (
                <GlobeIcon />
              ) : (
                <img src={`/images/flags/${t.code}.svg`} alt="" width={26} height={18} className="country-tab-flag" />
              )}
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="team-tabpanel"
        aria-labelledby={`team-tab-${active}`}
        aria-busy={phase === "out"}
        className="country-panel mt-8"
        style={height != null ? { height } : undefined}
      >
        <div ref={innerRef} key={current.code} className={`country-panel-inner is-${phase}`}>
          <VideoWall videos={current.videos} label="Watch message" reveal={false} grid />
        </div>
      </div>
    </div>
  );
}
