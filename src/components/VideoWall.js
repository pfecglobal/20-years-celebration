import VideoMessage from "./VideoMessage";

/** A row of portrait video tiles; each one opens the popup player (same as the Day One message). */
export default function VideoWall({ videos, label = "Watch", reveal = true, grid = false }) {
  return (
    <ul className={`video-wall ${grid ? "video-wall--grid" : ""}`}>
      {videos.map((v, i) => (
        <li key={v.src} data-reveal={reveal ? "zoom" : undefined} style={{ "--d": `${i * 110}ms`, "--i": i }}>
          <VideoMessage src={v.src} poster={v.poster} title={v.name} label={label} variant="tile" />
        </li>
      ))}
    </ul>
  );
}
