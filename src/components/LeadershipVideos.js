import VideoMessage from "./VideoMessage";

/**
 * Top management messages: three video cards side by side — the middle one is the spotlight (larger, gold
 * rim, sides sit lower). Name, role and a short quote are always visible under each card, so who is
 * speaking reads at a glance. Phones: a swipeable row that opens on the spotlight card.
 * Each card opens the same popup player as the rest of the page; it plays on through the three messages
 * (spotlight first) and can be switched like reels.
 */
export default function LeadershipVideos({ leaders, label = "Watch the message" }) {
  const spotlight = Math.floor((leaders.length - 1) / 2);
  // popup playlist (reels): the spotlight first, then the others left → right; empty video codes are skipped
  const order = [spotlight, ...leaders.map((_, i) => i).filter((i) => i !== spotlight)].filter((i) => leaders[i].youtube);
  const playlist = order.map((i) => ({ youtube: leaders[i].youtube, title: `${leaders[i].name}, ${leaders[i].role}` }));

  return (
    <ul data-reveal="fade" className="leaders" aria-label="Messages from our leadership">
      {leaders.map((p, i) => {
        const isSpot = i === spotlight;
        return (
          <li
            key={i}
            className={`leader ${isSpot ? "leader--spotlight" : ""}`}
            style={{ "--k": Math.abs(i - spotlight) }}
          >
            <div className="leader-card">
              <VideoMessage
                youtube={p.youtube}
                label={isSpot ? label : "Watch"}
                title={`${p.name}, ${p.role}`}
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
  );
}
