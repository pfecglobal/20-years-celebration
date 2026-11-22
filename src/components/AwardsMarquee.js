import Image, { getImageProps } from "next/image";
import CountUp from "./CountUp";

/** URL of a small (≈ card-sized, 2×) optimized copy of an award image — used as the hover-reflection mask. */
function maskSrc(a) {
  return getImageProps({ src: a.src, alt: "", width: 400, height: Math.round((400 * a.h) / a.w) }).props.src;
}

/** One endless row of award cards. `direction`: "ltr" (left → right) or "rtl" (right → left). */
function AwardRow({ items, direction, decorative = false }) {
  // A group must be wider than the screen: repeat the list until there are at least 8 cards. Two identical
  // groups slide by exactly 50%, which makes the loop seamless.
  const group = [];
  while (group.length < Math.max(8, items.length)) group.push(...items);
  // keep the scroll speed the same however many cards there are (8 cards ≈ 60s, as before)
  const duration = `${Math.round(group.length * 7.5)}s`;
  return (
    <div className={`award-row award-row--${direction}`} aria-hidden={decorative || undefined}>
      <div className="award-track" style={{ animationDuration: duration }}>
        {[0, 1].map((g) => (
          <div key={g} className="award-group" aria-hidden={g === 1 || undefined}>
            {group.map((a, i) => (
              <div
                key={i}
                className={`award-card ${a.photo ? "award-card--photo" : "award-card--shaped"}`}
                // shaped cards: their own outline (--award-img) is the stencil for the hover reflection — a small
                // optimized copy, not the ~1 MB original; photos are plain rectangles (rounded by CSS), no stencil
                style={{ aspectRatio: `${a.w} / ${a.h}`, ...(a.photo ? {} : { "--award-img": `url("${maskSrc(a)}")` }) }}
              >
                <Image
                  src={a.src}
                  alt={!decorative && g === 0 && i < items.length ? a.alt : ""}
                  width={a.w}
                  height={a.h}
                  sizes="(min-width: 1024px) 380px, 240px"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** "50+ Awards & Recognitions": two marquee rows moving in opposite directions + affiliations card. */
export default function AwardsMarquee({ data }) {
  // split the awards between the two rows (alternating), so each row shows different ones
  const rowA = data.items.filter((_, i) => i % 2 === 0);
  const rowB = data.items.filter((_, i) => i % 2 === 1);
  const aff = data.affiliations;

  return (
    <>
      <h2 data-reveal className="px-4 text-center text-3xl font-bold text-white sm:text-5xl">
        <span className="text-gold">
          <CountUp end={data.count} suffix="+" duration={1800} />
        </span>{" "}
        {data.title}
      </h2>

      <div data-reveal="fade" style={{ "--d": "150ms" }} className="mt-10 sm:mt-14">
        <AwardRow items={rowA} direction="ltr" />
        <AwardRow items={rowB.length ? rowB : rowA} direction="rtl" decorative={!rowB.length} />
      </div>

      <div className="px-4 sm:px-6">
        <div data-reveal style={{ "--d": "200ms" }} className="affil-card premium-card">
          <div className="affil-copy">
            <h3 className="text-lg font-bold text-[#100694] sm:text-xl">
              {aff.title} <span className="text-[#3a3fe6]">{aff.titleRest}</span>
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#55556a]">{aff.text}</p>
          </div>
          <ul className="affil-logos">
            {aff.logos.map((l, i) => (
              <li
                key={l.src}
                className="affil-logo"
                data-label={l.label}
                style={{ "--i": i, "--h": `${l.height}px` }}
              >
                {/* layers: li = pop-in, float = idle bob, lift = hover */}
                <span className="affil-float">
                  <span className="affil-lift">
                    <Image src={l.src} alt={l.alt} width={l.w} height={l.h} sizes="200px" />
                    <span className="affil-shine" aria-hidden="true" />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
