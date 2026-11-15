import VideoMessage from "./VideoMessage";

/** A row of portrait video tiles; each one opens the popup player (same as the Day One message). */
export default function VideoWall({ videos, label = "Watch" }) {
  return (
    <ul className="video-wall">
      {videos.map((v, i) => (
        <li key={v.src} data-reveal="zoom" style={{ "--d": `${i * 110}ms` }}>
          <VideoMessage src={v.src} poster={v.poster} title={v.name} label={label} variant="tile" />
        </li>
      ))}
    </ul>
  );
}
