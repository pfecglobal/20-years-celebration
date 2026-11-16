"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 650;

/** Final (centred) size of the portrait popup player, 9:16 */
function targetRect() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const h = Math.min(vh * 0.86, ((vw * 0.92) * 16) / 9, 900);
  const w = (h * 9) / 16;
  return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
}

const px = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

function PlayIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

/** Portrait video card that expands into a popup player (and shrinks back on close). */
/**
 * variant: "feature" (large card, e.g. the Day One message) | "tile" (portrait tile in a row of videos)
 * caption: optional overlay inside the card (e.g. a name + label in the student carousel)
 */
export default function VideoMessage({ src, poster, label = "Watch the message", title, variant = "feature", caption = null }) {
  const cardRef = useRef(null);
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const busy = useRef(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openPlayer = () => {
    if (busy.current) return;
    busy.current = true;
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const from = cardRef.current.getBoundingClientRect();
    const to = targetRect();

    Object.assign(panel.style, px(to));
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    window.__pfecLenis?.stop(); // keep the page still behind the player
    setOpen(true);
    cardRef.current.style.visibility = "hidden"; // the card "becomes" the popup

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

    const v = videoRef.current;
    if (v && !failed) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  const closeAnims = useRef([]);

  // Idempotent clean-up: safe to call from the animation end or a native dialog close
  const finishClose = useCallback(() => {
    closeAnims.current.forEach((a) => a.cancel());
    closeAnims.current = [];
    videoRef.current?.pause();
    if (dialogRef.current?.open) dialogRef.current.close();
    if (cardRef.current) cardRef.current.style.visibility = "";
    document.documentElement.style.overflow = "";
    window.__pfecLenis?.start();
    setOpen(false);
    busy.current = false;
  }, []);

  const closePlayer = useCallback(() => {
    if (busy.current || !dialogRef.current?.open) return;
    busy.current = true;
    const panel = panelRef.current;
    videoRef.current?.pause();

    const from = panel.getBoundingClientRect();
    const to = cardRef.current.getBoundingClientRect();
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
        cardRef.current.focus({ preventScroll: true });
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

  // Keep the popup centred if the window is resized while open
  useEffect(() => {
    if (!open) return;
    const onResize = () => Object.assign(panelRef.current.style, px(targetRect()));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  useEffect(() => () => (document.documentElement.style.overflow = ""), []);

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onClick={openPlayer}
        aria-label={`Play video: ${title}`}
        className={`video-card group ${variant === "tile" ? "video-card--tile" : ""}`}
      >
        {src && !failed ? (
          <video
            className="video-card-media"
            src={`${src}#t=0.1`}
            poster={poster || undefined}
            muted
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="video-card-media" src={poster} alt="" />
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

      <dialog ref={dialogRef} className="video-dialog" aria-label={title}>
        <div ref={backdropRef} className="video-backdrop" onClick={closePlayer} />
        <div ref={panelRef} className="video-panel">
          {src && !failed ? (
            <video
              ref={videoRef}
              className="h-full w-full bg-black object-contain"
              src={src}
              poster={poster || undefined}
              controls
              playsInline
              preload="none"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0b0b1e] p-8 text-center">
              <span className="video-play-btn">
                <PlayIcon />
              </span>
              <p className="text-lg font-semibold text-white">Video coming soon</p>
              <p className="text-sm text-ink-muted">This message will be available here shortly.</p>
            </div>
          )}
          <button type="button" onClick={closePlayer} className="video-close" aria-label="Close video">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </dialog>
    </>
  );
}
