import Image from "next/image";
import CountUp from "./CountUp";

/** One endless row of award cards. `direction`: "ltr" (left → right) or "rtl" (right → left). */
function AwardRow({ items, direction, decorative = false }) {
  // Each group holds the list twice so it is always wider than the screen; two identical
  // groups slide by exactly 50%, which makes the loop seamless.
  const group = [...items, ...items];
  return (
    <div className={`award-row award-row--${direction}`} aria-hidden={decorative || undefined}>
      <div className="award-track">
        {[0, 1].map((g) => (
          <div key={g} className="award-group" aria-hidden={g === 1 || undefined}>
            {group.map((a, i) => (
              <div key={i} className="award-card" style={{ aspectRatio: `${a.w} / ${a.h}` }}>
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
  const shifted = [...data.items.slice(2), ...data.items.slice(0, 2)]; // vary the second row's order
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
        <AwardRow items={data.items} direction="ltr" />
        <AwardRow items={shifted} direction="rtl" decorative />
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
