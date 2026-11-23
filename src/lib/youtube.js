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
 * Thumbnail. For a Short, hq720 is 1280×720 with the vertical video exactly in the centre, so a 9:16 crop
 * (object-fit: cover) shows the Short's own frame — at ~100 KB instead of ~180 KB for the full portrait one.
 */
// Not every size exists for every video (YouTube drops some, e.g. after a custom thumbnail is set), so the
// card tries them in this order: hq720 → maxresdefault (same 16:9 framing) → hqdefault (always there).
const THUMBS = ["hq720", "maxresdefault", "hqdefault"];
export const ytThumbCount = THUMBS.length;
export const ytThumbAt = (id, i) => `https://i.ytimg.com/vi/${id}/${THUMBS[i]}.jpg`;

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
