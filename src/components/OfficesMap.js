import Image from "next/image";
import CountUp from "./CountUp";

/** "We've grown from 1 car in Melbourne" — 3D country maps with flag + office-count labels. */
export default function OfficesMap({ data }) {
  const total = data.countries.reduce((n, c) => n + c.offices, 0);

  return (
    <div className="relative mx-auto max-w-7xl text-center">
      <h2 data-reveal className="text-2xl leading-tight font-bold text-white sm:text-4xl lg:text-[2.6rem]">
        {data.intro}
        <br />
        <span className="text-gold">
          <CountUp end={total} duration={1800} />
        </span>{" "}
        Offices Across the{" "}
        <span className="text-gold">
          <CountUp end={data.countries.length} duration={1200} />
        </span>{" "}
        Countries
      </h2>

      <ul className="offices-maps">
        {data.countries.map((c, i) => (
          <li
            key={c.code}
            data-reveal="rise"
            className={`office-item office-item--${c.code}`}
            style={{ "--i": i, "--d": `${i * 140}ms` }}
          >
            <div className="office-float">
              <div className="office-card">
                <Image
                  src={c.map}
                  alt={`Map of ${c.name}`}
                  width={c.w}
                  height={c.h}
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className="office-map"
                />
                <span className="office-chip" style={{ left: c.lx, top: c.ly }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/flags/${c.code}.svg`} alt="" width={22} height={16} className="office-flag" />
                  <span className="office-chip-text">
                    <strong>{c.name}</strong>
                    <small>
                      ({c.offices} {c.offices === 1 ? "Office" : "Offices"})
                    </small>
                  </span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p data-reveal style={{ "--d": "300ms" }} className="mx-auto mt-10 max-w-xl text-sm leading-relaxed text-white/75 sm:mt-14 sm:text-base">
        {data.note}
      </p>
    </div>
  );
}
