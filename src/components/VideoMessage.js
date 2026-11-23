"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isLandscapeLink, loadYouTubeApi, ytEmbed, ytId, ytThumbAt, ytThumbCount } from "@/lib/youtube";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 650;
const SWITCH_MS = 480; // reel-style slide when moving to the next / previous video
const STEP_COOLDOWN = 650; // one wheel flick / swipe = one video

/** Final (centred) size of the popup player: 9:16 for Shorts, 16:9 for normal (landscape) videos */
function targetRect(landscape) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (landscape) {
    const w = Math.min(vw * 0.92, ((vh * 0.82) * 16) / 9, 1280);
    const h = (w * 9) / 16;
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }
  const h = Math.min(vh * 0.86, ((vw * 0.92) * 16) / 9, 900);
  const w = (h * 9) / 16;
  return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
}

const px = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

const inViewport = (r) => r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;

/** Up / down controls: beside the player when there is room, otherwise under it (phones) */
function placeNav(nav, r) {
  if (!nav) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const beside = vw - (r.left + r.width) >= 76;
  nav.classList.toggle("is-below", !beside);
  if (beside) {
    Object.assign(nav.style, { left: `${r.left + r.width + 18}px`, top: `${r.top + r.height / 2}px`, bottom: "", translate: "0 -50%" });
  } else {
    const below = vh - (r.top + r.height);
    Object.assign(nav.style, {
      left: `${vw / 2}px`,
      top: below >= 64 ? `${r.top + r.height + below / 2}px` : "",
      bottom: below >= 64 ? "" : "14px",
      translate: below >= 64 ? "-50% -50%" : "-50% 0",
    });
  }
}

function PlayIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

function Chevron({ up = false }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

/**
 * Video card (YouTube thumbnail) that expands into a popup YouTube player (and shrinks back on close).
 * youtube: the video code ("tVLcwsXQ5f8") or a full YouTube link — empty → "Video coming soon".
 * variant: "feature" (large card, e.g. the Day One message) | "tile" (portrait tile in a row of videos)
 * caption: optional overlay inside the card (e.g. a name + label in the student carousel)
 * playlist / index / group: the videos this card belongs to ([{ youtube, title }], this card's place in it, and a
 *   name shared by those cards). With two or more, the popup works like reels: when a video ends the next one
 *   plays, and up / down buttons, arrow keys, the mouse wheel or a swipe move between them.
 * The YouTube player (iframe) only exists while the popup is open — dozens of cards don't load dozens of players.
 */
export default function VideoMessage({
  youtube,
  label = "Watch the message",
  title,
  variant = "feature",
  caption = null,
  playlist = null,
  index = -1,
  group = "",
}) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const hostRef = useRef(null);
  const navRef = useRef(null);
  const backdropRef = useRef(null);
  const playerRef = useRef(null);
  const hiddenCard = useRef(null);
  const busy = useRef(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false); // player mounted
  const [apiFailed, setApiFailed] = useState(false); // YouTube player API blocked → plain embed (no auto-next)
  const [thumb, setThumb] = useState(0); // index into the thumbnail sizes (falls back on load error)

  const list = playlist && playlist.length > 1 && index >= 0 && index < playlist.length ? playlist : null;
  const [cur, setCur] = useState(index); // the video showing in the popup (its place in the playlist)

  const cardVideoId = ytId(youtube);
  const thumbSrc = cardVideoId && thumb < ytThumbCount ? ytThumbAt(cardVideoId, thumb) : "";

  const item = list ? list[cur] || list[index] : { youtube, title };
  const id = ytId(item.youtube);
  const landscape = isLandscapeLink(item.youtube);
  const panelThumb = id ? (id === cardVideoId && thumbSrc ? thumbSrc : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`) : "";

  // latest values for event handlers that outlive a render (player callbacks, listeners)
  const idRef = useRef(id);
  const curRef = useRef(cur);
  useEffect(() => {
    idRef.current = id;
    curRef.current = cur;
  }, [id, cur]);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** The card for a playlist entry (other cards are found by their data attributes). */
  const cardFor = useCallback(
    (i) =>
      i === index
        ? cardRef.current
        : group
          ? document.querySelector(`[data-video-group="${CSS.escape(group)}"][data-video-index="${i}"]`)
          : null,
    [group, index]
  );

  // the card that is "in" the popup is hidden on the page
  const hideCard = (el) => {
    if (hiddenCard.current && hiddenCard.current !== el) hiddenCard.current.style.visibility = "";
    if (el) el.style.visibility = "hidden";
    hiddenCard.current = el;
  };

  const openPlayer = () => {
    if (busy.current) return;
    busy.current = true;
    setCur(index);
    curRef.current = index;
    idRef.current = cardVideoId;
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const from = cardRef.current.getBoundingClientRect();
    const to = targetRect(isLandscapeLink(youtube));

    Object.assign(panel.style, px(to));
    dialog.showModal();
    placeNav(navRef.current, to);
    document.documentElement.style.overflow = "hidden";
    window.__pfecLenis?.stop(); // keep the page still behind the player
    setOpen(true);
    if (cardVideoId) setPlaying(true); // mount the YouTube player (autoplays — this click is the user gesture)
    hideCard(cardRef.current); // the card "becomes" the popup

    const d = reduce() ? 0 : DURATION;
    backdropRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d, easing: "ease", fill: "both" });
    const anim = panel.animate(
      [
        { ...px(from), borderRadius: "18px" },
        { ...px(to), borderRadius: "24px" },
      ],
      { duration: d, easing: EASE }
    );
    anim.finished.finally(() => {
      busy.current = false;
    });
  };

  /** Reels: show another video of the playlist in the open popup (dir +1 = next, -1 = previous). */
  const goTo = useCallback(
    (i) => {
      if (!list || busy.current || !dialogRef.current?.open || i < 0 || i >= list.length || i === curRef.current) return;
      const dir = i > curRef.current ? 1 : -1;
      const panel = panelRef.current;
      const from = panel.getBoundingClientRect();
      const to = targetRect(isLandscapeLink(list[i].youtube));
      const d = reduce() ? 0 : SWITCH_MS;

      setCur(i);
      curRef.current = i; // a second flick before the re-render must count from here
      idRef.current = ytId(list[i].youtube);
      hideCard(cardFor(i));
      Object.assign(panel.style, px(to));
      placeNav(navRef.current, to);
      if (from.width !== to.width || from.height !== to.height) {
        panel.animate([px(from), px(to)], { duration: d, easing: EASE });
      }
      stageRef.current?.animate(
        [
          { opacity: 0, transform: `translate3d(0, ${dir * 70}px, 0)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: d, easing: EASE }
      );
    },
    [list, cardFor]
  );

  const step = useCallback((dir) => goTo(curRef.current + dir), [goTo]);
  // a video finished → the next one (stays on the last one at the end)
  const onEndedRef = useRef(() => {});
  useEffect(() => {
    onEndedRef.current = () => step(1);
  }, [step]);

  const closeAnims = useRef([]);

  // Idempotent clean-up: safe to call from the animation end or a native dialog close
  const finishClose = useCallback(() => {
    closeAnims.current.forEach((a) => a.cancel());
    closeAnims.current = [];
    setPlaying(false);
    if (dialogRef.current?.open) dialogRef.current.close();
    if (hiddenCard.current) hiddenCard.current.style.visibility = "";
    hiddenCard.current = null;
    document.documentElement.style.overflow = "";
    window.__pfecLenis?.start();
    setOpen(false);
    setCur(index);
    curRef.current = index;
    busy.current = false;
  }, [index]);

  const closePlayer = useCallback(() => {
    if (busy.current || !dialogRef.current?.open) return;
    busy.current = true;
    const panel = panelRef.current;
    setPlaying(false); // stop the video at once; the thumbnail shows while the popup shrinks back

    // shrink back into the card of the video now showing (if it is on screen), else the card that opened it
    const current = hiddenCard.current;
    const currentRect = current?.getBoundingClientRect();
    const target = currentRect && inViewport(currentRect) ? current : cardRef.current;
    const from = panel.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const d = reduce() ? 0 : DURATION * 0.85;

    const fade = backdropRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d, easing: "ease", fill: "both" });
    const shrink = panel.animate(
      [
        { ...px(from), borderRadius: "24px" },
        { ...px(to), borderRadius: "18px" },
      ],
      { duration: d, easing: EASE, fill: "forwards" }
    );
    closeAnims.current = [fade, shrink];
    shrink.finished
      .then(() => {
        finishClose();
        target.focus({ preventScroll: true });
      })
      .catch(() => {}); // cancelled by finishClose()
  }, [finishClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    // ESC → animated close instead of the instant native close
    const onCancel = (e) => {
      e.preventDefault();
      closePlayer();
    };
    // If the browser closes the dialog itself (ESC without user activation), reset at once
    const onClose = () => finishClose();
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [closePlayer, finishClose]);

  // The YouTube player: created when the popup opens, destroyed when it closes. Through the player API we
  // hear when a video ends (→ next one) and can load another video into the same player.
  useEffect(() => {
    const host = hostRef.current;
    if (!playing || !host) return;
    let cancelled = false;
    let player = null;
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        const startId = idRef.current;
        const el = document.createElement("div");
        host.append(el);
        player = new YT.Player(el, {
          host: "https://www.youtube-nocookie.com",
          videoId: startId,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, origin: window.location.origin },
          events: {
            onReady: (e) => {
              playerRef.current = e.target;
              // switched to another video while the player was still loading
              if (idRef.current !== startId) e.target.loadVideoById(idRef.current);
              else e.target.playVideo();
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) onEndedRef.current();
            },
          },
        });
      })
      .catch(() => !cancelled && setApiFailed(true));
    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {}
      playerRef.current = null;
      host.replaceChildren();
    };
  }, [playing]);

  // another video chosen in the open popup → load it into the same player (keeps playing with sound)
  useEffect(() => {
    if (playing && id) playerRef.current?.loadVideoById?.(id);
  }, [id, playing]);

  // Reels controls while open: arrow keys, the mouse wheel (outside the video) and a swipe on the backdrop
  useEffect(() => {
    if (!open || !list) return;
    const dialog = dialogRef.current;
    let last = 0;
    const flick = (dir) => {
      const now = Date.now();
      if (now - last < STEP_COOLDOWN) return;
      last = now;
      step(dir);
    };
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) >= 24) flick(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e) => {
      if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key)) {
        e.preventDefault();
        flick(1);
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        flick(-1);
      }
    };
    dialog.addEventListener("wheel", onWheel, { passive: true });
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("wheel", onWheel);
      dialog.removeEventListener("keydown", onKey);
    };
  }, [open, list, step]);

  // swipe up / down on the backdrop = next / previous (a tap still closes)
  const swipe = useRef(null);
  const onBackdropDown = (e) => (swipe.current = { y: e.clientY, x: e.clientX, moved: false });
  const onBackdropUp = (e) => {
    const s = swipe.current;
    if (!s || !list) return;
    const dy = e.clientY - s.y;
    if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(e.clientX - s.x)) {
      s.moved = true;
      step(dy < 0 ? 1 : -1);
    }
  };
  const onBackdropClick = () => {
    if (swipe.current?.moved) {
      swipe.current = null;
      return;
    }
    closePlayer();
  };

  // Keep the popup centred if the window is resized while open
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      const r = targetRect(landscape);
      Object.assign(panelRef.current.style, px(r));
      placeNav(navRef.current, r);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, landscape]);

  useEffect(() => () => (document.documentElement.style.overflow = ""), []);

  // The thumbnail can finish loading before React hydrates (so onLoad / onError never fire): check it once here
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth <= 120) setThumb((t) => t + 1); // missing (0) or YouTube's placeholder
  }, [thumb]);

  const showNav = list && open;
  const nextItem = list && cur < list.length - 1 ? list[cur + 1] : null;

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onClick={openPlayer}
        aria-label={`Play video: ${title}`}
        className={`video-card group ${variant === "tile" ? "video-card--tile" : ""}`}
        data-video-group={group || undefined}
        data-video-index={group && index >= 0 ? index : undefined}
      >
        {thumbSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            className={`video-card-media ${isLandscapeLink(youtube) ? "" : "video-card-media--short"}`}
            src={thumbSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setThumb((t) => t + 1)}
            // a missing size comes back as YouTube's 120×90 grey placeholder (not an error) → try the next size
            onLoad={(e) => e.currentTarget.naturalWidth <= 120 && setThumb((t) => t + 1)}
          />
        ) : null}

        <span className="video-card-shade" aria-hidden="true" />
        <span className="video-play" aria-hidden="true">
          <span className="video-play-ring" />
          <span className="video-play-ring video-play-ring--2" />
          <span className="video-play-btn">
            <PlayIcon />
          </span>
        </span>
        {label && <span className="video-card-label">{label}</span>}
        {caption}
      </button>

      <dialog ref={dialogRef} className="video-dialog" aria-label={item.title || title}>
        <div
          ref={backdropRef}
          className="video-backdrop"
          onPointerDown={onBackdropDown}
          onPointerUp={onBackdropUp}
          onClick={onBackdropClick}
        />
        <div ref={panelRef} className="video-panel">
          <div ref={stageRef} className="absolute inset-0">
            {id ? (
              <div className="relative h-full w-full bg-black">
                {panelThumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="absolute inset-0 h-full w-full object-cover" src={panelThumb} alt="" />
                )}
                {playing && !apiFailed && <div ref={hostRef} className="video-yt absolute inset-0" />}
                {playing && apiFailed && (
                  <iframe
                    key={id}
                    className="absolute inset-0 h-full w-full"
                    src={ytEmbed(id)}
                    title={item.title || title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                )}
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0b0b1e] p-8 text-center">
                <span className="video-play-btn">
                  <PlayIcon />
                </span>
                <p className="text-lg font-semibold text-white">Video coming soon</p>
                <p className="text-sm text-ink-muted">This message will be available here shortly.</p>
              </div>
            )}
          </div>
          <button type="button" onClick={closePlayer} className="video-close" aria-label="Close video">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {list && (
          <div ref={navRef} className="video-reel-nav" hidden={!showNav}>
            <button type="button" className="video-reel-btn" onClick={() => step(-1)} disabled={cur <= 0} aria-label="Previous video">
              <Chevron up />
            </button>
            <span className="video-reel-count" aria-live="polite">
              {cur + 1} / {list.length}
            </span>
            <button
              type="button"
              className="video-reel-btn"
              onClick={() => step(1)}
              disabled={!nextItem}
              aria-label={nextItem ? `Next video: ${nextItem.title}` : "Next video"}
            >
              <Chevron />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
