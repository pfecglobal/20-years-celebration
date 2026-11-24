// YouTube helpers for the video cards / popup player.

/**
 * The 11-character video code from whatever was pasted: the code itself ("tVLcwsXQ5f8") or a full link
 * (youtube.com/shorts/…, youtube.com/watch?v=…, youtu.be/…, /embed/…, /live/…). Returns "" if none found.
 */
export function ytId(value) {
  if (!value) return "";
  const s = String(value).trim();
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:shorts\/|watch\?(?:.*&)?v=|embed\/|live\/|v\/))([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(s) ? s : "";
}

/** A normal (landscape) video link — youtube.com/watch or youtu.be — rather than a Short. */
export const isLandscapeLink = (value) => /youtube\.com\/watch|youtu\.be\//.test(String(value || ""));

/**
 * Thumbnail sizes, best first. Not every size exists for every video (YouTube skips some, e.g. hq720 /
 * maxresdefault for many Shorts), and a missing one comes back as a 120×90 placeholder, so the card tries
 * them in order and moves on.
 *  - oar2: a Short's own portrait thumbnail, 1080×1920 — sharp on a 9:16 card (Shorts only).
 *  - hq720 / maxresdefault: 1280×720 (a Short sits in the middle, ~405 px wide).
 *  - sddefault 640×480, hqdefault 480×360: always there, but a Short in them is only ~200–270 px wide,
 *    so a 9:16 card shows it stretched and blurry — set a `poster` image for those videos instead.
 */
const THUMBS_SHORT = ["oar2", "hq720", "maxresdefault", "sddefault", "hqdefault"];
const THUMBS_WIDE = ["hq720", "maxresdefault", "sddefault", "hqdefault"];
export const ytThumbs = (id, landscape) =>
  (landscape ? THUMBS_WIDE : THUMBS_SHORT).map((size) => `https://i.ytimg.com/vi/${id}/${size}.jpg`);
/** The portrait (9:16) size — the image is already the Short's frame, so it needs no zoom. */
export const isPortraitThumb = (src) => /\/oar\d\.jpg$/.test(src || "");

/** Privacy-enhanced embed (no YouTube cookies until the visitor plays), autoplaying once opened. */
export const ytEmbed = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

/**
 * Loads YouTube's IFrame Player API once (only when someone first plays a video) and resolves with window.YT.
 * The player API is what tells us when a video has ended, so the popup can move on to the next one.
 */
let apiPromise = null;
export function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const fail = (err) => {
        apiPromise = null;
        reject(err);
      };
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => fail(new Error("YouTube player API failed to load"));
      document.head.append(s);
      setTimeout(() => !window.YT?.Player && fail(new Error("YouTube player API timed out")), 8000);
    });
  }
  return apiPromise;
}
