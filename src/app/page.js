import Image from "next/image";
import Hero from "@/components/Hero";
import CelebrationCanvas from "@/components/CelebrationCanvas";
import PageEffects from "@/components/PageEffects";
import CountUp from "@/components/CountUp";
import WordReveal from "@/components/WordReveal";
import JourneyRoad from "@/components/JourneyRoad";
import CelebrateButton from "@/components/CelebrateButton";
import SparkleField from "@/components/SparkleField";
import ConfettiRain from "@/components/ConfettiRain";
import VideoMessage from "@/components/VideoMessage";
// import OfficesMap from "@/components/OfficesMap"; // previous offices fold (see the commented section below)
import OfficesExpansion from "@/components/OfficesExpansion";
import AwardsMarquee from "@/components/AwardsMarquee";
import TeamVideoTabs from "@/components/TeamVideoTabs";
import StudentCarousel from "@/components/StudentCarousel";
import BackToTop from "@/components/BackToTop";
import SmoothScroll from "@/components/SmoothScroll";
import CoverReveal from "@/components/CoverReveal";
import IntroInvite from "@/components/IntroInvite";
import {
  ANNIVERSARY_YEAR,
  DAY_ONE,
  JOURNEY,
  OFFICES,
  AWARDS,
  VOICES,
  TODAY,
  FOUNDED_YEAR,
  MARQUEE,
  MILESTONES,
  PILLARS,
  SHOW_VALUES,
  STATS,
  STORY,
  TAGLINE,
} from "@/content";

// Countries with a PFEC office, in the order they joined the journey (from the milestones)
const JOURNEY_COUNTRIES = [...new Set(MILESTONES.map((m) => m.country).filter(Boolean))].map((code) => ({
  code,
  name: OFFICES.countries.find((c) => c.code === code)?.name ?? code,
}));

const ICONS = {
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
};

function Marquee({ back = false }) {
  const row = [...MARQUEE, ...MARQUEE];
  return (
    <div className={`marquee py-2 sm:py-4 ${back ? "marquee--back" : ""}`} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((g) => (
          <div key={g} className="flex shrink-0">
            {row.map((t, i) => (
              <span
                key={i}
                className={`flex items-center gap-4 px-4 text-sm font-extrabold tracking-wider whitespace-nowrap uppercase sm:gap-6 sm:px-6 sm:text-2xl ${
                  back ? "text-white/80" : "text-[#08082c]"
                }`}
              >
                {t}
                <span className={back ? "text-gold" : "text-[#08082c]/60"}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PfecMark() {
  return (
    <div className="pfec-mark" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ "--i": i }} />
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
      <p data-reveal className="eyebrow">{eyebrow}</p>
      <h2 data-reveal style={{ "--d": "100ms" }} className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p data-reveal style={{ "--d": "200ms" }} className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* opening invitation (envelope) — plays on load, then the hero's own intro starts */}
      <IntroInvite />
      <SmoothScroll />
      <PageEffects />
      <BackToTop />
      <ConfettiRain />
      <CelebrationCanvas />

      <main>
        <Hero />

        {/* Day One message + team videos: one starry #100694 → soft purple gradient (continues the hero) */}
        <div className="bg-message-team">
          {/* Message from the people who were there on Day One */}
          <section
            id="message"
            className="relative isolate flex flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-14 lg:min-h-svh lg:py-28"
          >
            <div className="stars-carry stars-carry--full" aria-hidden="true">
              <SparkleField />
            </div>
            <div className="relative text-center">
              <h2 data-reveal className="text-2xl font-bold text-white sm:text-4xl">
                {DAY_ONE.title}
              </h2>
              <p data-reveal style={{ "--d": "120ms" }} className="mt-1 text-2xl font-light text-white/90 sm:text-4xl">
                {DAY_ONE.lead} <strong className="font-bold text-white">{DAY_ONE.emphasis}</strong>
              </p>
            </div>
            <div className="relative mt-10 grid w-full grid-cols-[1fr_auto_1fr] items-center sm:mt-14">
              <div data-reveal="left" style={{ "--d": "250ms" }} className="hidden justify-self-center sm:block">
                <PfecMark />
              </div>
              <div data-reveal="zoom" style={{ "--d": "180ms" }} className="col-start-2">
                <VideoMessage
                  src={DAY_ONE.video}
                  poster={DAY_ONE.poster}
                  label={DAY_ONE.label}
                  title={`${DAY_ONE.title} ${DAY_ONE.lead} ${DAY_ONE.emphasis}`}
                />
              </div>
              <div data-reveal="right" style={{ "--d": "250ms" }} className="hidden justify-self-center sm:block">
                <PfecMark />
              </div>
            </div>
          </section>

          {/* Team videos, filterable by country */}
          <section id="team" className="relative isolate overflow-hidden px-4 pt-6 pb-8 sm:px-6 sm:pt-10 sm:pb-10 lg:pt-24 lg:pb-20">
            <div className="stars-carry stars-carry--full" aria-hidden="true">
              <SparkleField />
            </div>
            <div className="relative mx-auto max-w-7xl text-center">
              <h2 data-reveal className="mx-auto max-w-2xl text-2xl leading-tight font-bold text-white sm:text-4xl">
                {VOICES.team.title}
              </h2>
              <p data-reveal style={{ "--d": "100ms" }} className="mt-3 text-white/80">
                {VOICES.team.sub}
              </p>
              <div className="mt-8 text-left">
                <TeamVideoTabs countries={VOICES.team.countries} />
              </div>
            </div>
          </section>
        </div>

        {/* Journey road: #100694 → #F9F9F9 gradient, continuing from the team section above */}
        <div className="bg-flow-down">
          {/* Journey road — continues the light background from the video fold */}
          <section id="journey" className="px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14 lg:pt-28">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-10">
              <div className="journey-intro premium-card relative lg:sticky lg:top-28 lg:self-start">
                <span className="today-spark today-spark--tl" aria-hidden="true">✦</span>
                <span className="today-spark today-spark--br" aria-hidden="true">✦</span>
                <p data-reveal className="today-eyebrow relative">
                  Our Journey · {FOUNDED_YEAR} — {ANNIVERSARY_YEAR}
                </p>
                {/* round flags of every country we're in — they pop in one after another */}
                <ul data-reveal="fade" className="journey-flags" aria-label="Countries with a PFEC office">
                  {JOURNEY_COUNTRIES.map((c, i) => (
                    <li key={c.code} style={{ "--k": i }} title={c.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/images/flags/${c.code}.svg`} alt={c.name} width={28} height={28} />
                    </li>
                  ))}
                </ul>
                <h2 data-reveal style={{ "--d": "80ms" }} className="relative mt-3 text-3xl leading-tight font-bold text-[#0b0b2b] sm:text-4xl">
                  {JOURNEY.title}
                </h2>
                <span className="intro-divider" aria-hidden="true">
                  <i />
                </span>
                <p data-reveal style={{ "--d": "160ms" }} className="relative max-w-sm leading-relaxed text-[#55556a]">
                  {JOURNEY.sub}
                </p>
              </div>
              <JourneyRoad items={MILESTONES} endId="today-node" />
            </div>
          </section>
        </div>

        {/* TODAY — the road ends here, on top of a premium card */}
        <section id="today" className="relative z-[1] overflow-x-clip pt-12 pb-6 text-center sm:pb-8">
          <div className="px-4 sm:px-6">
            {/* opacity-only reveal so the node (road end point) never moves */}
            <div data-reveal="fade" className="today-card">
              <span id="today-node" className="today-node" aria-hidden="true" />
              <span className="today-clip" aria-hidden="true">
                <span className="today-sweep" />
              </span>
              <span className="today-spark today-spark--tl" aria-hidden="true">✦</span>
              <span className="today-spark today-spark--br" aria-hidden="true">✦</span>

              <p className="today-eyebrow">
                Twenty Years · {FOUNDED_YEAR} — {ANNIVERSARY_YEAR}
              </p>
              <h2 className="today-title">{TODAY.label}</h2>
              <p className="today-date">{TODAY.date}</p>
              <span className="today-divider" aria-hidden="true">
                <i />
              </span>
              <p className="today-text">{TODAY.text}</p>
            </div>
          </div>
        </section>

        {/* The celebration photo stays pinned while the offices section slides up over it like a sheet */}
        <CoverReveal
          className="bg-[#f9f9f9]"
          pinClassName="cover-pin--today pt-8 sm:pt-10"
          pin={
            <div data-reveal="rise" style={{ "--d": "250ms" }} className="mx-auto max-w-[1760px]">
              <Image
                src={TODAY.image}
                alt={TODAY.imageAlt}
                width={1760}
                height={893}
                sizes="(min-width: 1760px) 1760px, (min-width: 640px) 100vw, 1000px"
                className="h-auto w-full"
              />
            </div>
          }
        >
          {/* Offices — NEW: pinned scroll scene; the world map assembles, then our countries light up one by one */}
          <OfficesExpansion data={OFFICES} milestones={MILESTONES} />

          {/* Offices — PREVIOUS fold (3D country maps), kept for now. To switch back, remove the line above and uncomment:
          <section id="offices" className="bg-offices relative isolate overflow-hidden px-4 pt-20 pb-8 sm:px-6 sm:pt-28 sm:pb-28">
            <div className="stars-carry stars-carry--in" aria-hidden="true">
              <SparkleField />
            </div>
            <OfficesMap data={OFFICES} />
          </section>
          */}
        </CoverReveal>

        {/* 50+ Awards & Recognitions: solid #100796, two marquee rows in opposite directions */}
        <section id="awards" className="bg-awards relative overflow-hidden pt-8 pb-20 sm:py-28">
          <AwardsMarquee data={AWARDS} />
        </section>

        {/* Student stories: the awards' #100796 fades quickly to #F9F9F9 above the heading */}
        <div className="bg-voices">
          <section id="students" className="px-4 pt-44 pb-6 sm:px-6 sm:pt-56 sm:pb-32">
            <div className="mx-auto max-w-7xl">
              <h2 data-reveal className="max-w-xl text-2xl leading-tight font-bold text-[#0b0b2b] sm:text-4xl">
                {VOICES.students.title}
              </h2>
              <div data-reveal="zoom" style={{ "--d": "120ms" }} className="mt-10">
                <StudentCarousel videos={VOICES.students.videos} />
              </div>
            </div>
          </section>
        </div>

        {/* Story: hero-style background (#121212 → #100694) with stars, blended in/out of the light sections */}
        <section id="story" className="bg-story relative isolate overflow-hidden px-4 pt-28 pb-6 sm:px-6 sm:pt-56 sm:pb-52">
          <div className="stars-carry stars-carry--story" aria-hidden="true">
            <SparkleField />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <p data-reveal className="eyebrow">
              {FOUNDED_YEAR} — {ANNIVERSARY_YEAR}
            </p>
            <WordReveal
              text={STORY}
              className="mt-8 text-2xl leading-snug font-semibold text-white sm:text-4xl sm:leading-tight"
            />
          </div>
        </section>

        {/* Numbers → thank-you: picks up the story's #100694, light #F9F9F9, then back to #100694 */}
        <div className="bg-flow-up">
          <div className="on-light">

            {/* Stats */}
            <section id="numbers" className="px-4 pt-2 pb-8 sm:px-6 sm:pt-20 sm:pb-36">
              <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {STATS.map((s, i) => (
                  <div key={s.label} data-reveal="zoom" style={{ "--d": `${i * 120}ms` }}>
                    <div
                      className="premium-card relative flex h-full flex-col items-center justify-center px-4 py-8 text-center sm:py-12"
                      style={{ "--sweep-delay": `${i * 0.7}s` }}
                    >
                      <span className="today-spark today-spark--tl" aria-hidden="true">✦</span>
                      <span className="today-spark today-spark--br" aria-hidden="true">✦</span>
                      <p className="text-gold relative text-3xl font-extrabold tracking-tight sm:text-6xl">
                        <CountUp end={s.value} suffix={s.suffix} />
                      </p>
                      <p className="relative mt-3 text-xs font-semibold tracking-[0.2em] text-[#8c6d35] uppercase sm:text-sm">
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Marquee ribbons */}
            <div className="marquee-pair relative overflow-x-clip pt-10 pb-8 sm:py-10">
              <Marquee back />
              <div className="marquee-front -mt-9 sm:-mt-14">
                <Marquee />
              </div>
          </div>

        {/* "What drives us" — hidden via SHOW_VALUES in content.js */}
        {SHOW_VALUES && (
          <section id="values" className="section-glow px-4 py-24 sm:px-6 sm:py-36">
            <SectionHeading
              eyebrow="What drives us"
              title={
                <>
                  {TAGLINE[0]}. <span className="text-gold">{TAGLINE[1]}.</span>
                </>
              }
            />
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
              {PILLARS.map((p, i) => (
                <div key={p.title} data-reveal style={{ "--d": `${i * 140}ms` }}>
                  <article className="glass-card p-8 sm:p-10">
                    <div className="icon-badge">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {ICONS[p.icon]}
                      </svg>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white sm:text-2xl">{p.title}</h3>
                    <p className="mt-3 leading-relaxed text-ink-muted">{p.text}</p>
                  </article>
                </div>
              ))}
            </div>
          </section>
        )}

        </div>

          {/* Celebrate */}
          <section id="celebrate" className="relative isolate overflow-hidden px-4 pt-8 pb-28 text-center sm:px-6 sm:py-40">
            <div className="stars-carry stars-carry--up" aria-hidden="true">
              <SparkleField />
            </div>
            <div className="relative mx-auto max-w-3xl">
              <p data-reveal className="eyebrow">Thank you</p>
              <h2 data-reveal="zoom" style={{ "--d": "100ms" }} className="float-slow mt-6 text-5xl leading-none font-extrabold sm:text-8xl">
                <span className="text-white">Here&apos;s to the</span>
                <br />
                <span className="text-gold-shimmer">next 20</span>
              </h2>
              <p data-reveal style={{ "--d": "250ms" }} className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                To every student who trusted us with their dreams, every family, every partner institution and every
                member of the PFEC team — this milestone belongs to you.
              </p>
              <div data-reveal style={{ "--d": "400ms" }} className="mt-10">
                <CelebrateButton />
              </div>
            </div>
          </section>
        </div>
      </main>
      

      {/* Footer: no divider — the stars continue straight on from the thank-you section */}
      <footer className="footer-blue relative isolate overflow-hidden px-4 pt-6 pb-24 sm:px-6 sm:pb-12">
        <div className="stars-carry stars-carry--footer" aria-hidden="true">
          <SparkleField />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Image src="/pfec-logo-white.png" alt="PFEC Global" width={635} height={221} loading="eager" className="h-auto w-[110px]" />
          <p className="text-sm text-ink-muted">
            © {ANNIVERSARY_YEAR} PFEC Global · Study Abroad | Visa · Celebrating {FOUNDED_YEAR} — {ANNIVERSARY_YEAR}
          </p>
        </div>
      </footer>
    </>
  );
}
