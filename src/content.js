// All page copy and figures live here — edit freely.

export const FOUNDED_YEAR = 2006;
export const ANNIVERSARY_YEAR = 2026;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// VIDEOS ARE YOUTUBE: paste the video code — the last part of the link.
//   https://www.youtube.com/shorts/tVLcwsXQ5f8  →  "tVLcwsXQ5f8"
// (Pasting the whole link works too. Shorts open in a portrait player; normal youtube.com/watch?v=…
//  or youtu.be/… links open in a widescreen player.) Leave "" for a "Video coming soon" card.
// ─────────────────────────────────────────────────────────────────────────────────────────────

// "A Message from the People Who were there on Day One." video fold — the top management messages.
// Three cards, listed left → right as they appear on a computer. The MIDDLE one is the spotlight
// (bigger card, gold rim) — put the most senior person there; on phones it is shown first.
//   youtube: video code or link ("" → "Video coming soon")   name / role: shown under the card
//   quote: optional one-liner from their message, shown in italics under the name ("" to hide)
//   poster: optional cover image for the card, e.g. "/images/leaders/fareha.jpg" (put it in public/images/leaders/,
//     portrait 9:16, ~720×1280). Use it when the card looks blurry: some videos have only a small YouTube thumbnail.
export const DAY_ONE = {
  title: "A Message from the People",
  lead: "Who were there from",
  emphasis: "Day One.",
  label: "Watch the message",
  leaders: [
    { youtube: "https://www.youtube.com/watch?v=gDwUuLUUU4Y", name: "Fareha Begum", role: "Sr. Country Director,PFEC Global,Bangladesh", quote: "" },
    { youtube: "tVLcwsXQ5f8", name: "Md. Shahidul Islam", role: "Chief Executive Officer (CEO),PFEC GLOBAL", quote: "" }, // ← spotlight — replace
    { youtube: "https://www.youtube.com/shorts/0zvsD-j_8VI", name: "Mahmuda Akther", role: "General Manager,PFEC Global,Bangladesh", quote: "" }, // ← example — replace
  ],
};

export const TAGLINE = ["Building Global Citizens", "Powered by People"];

// Words wrapped in *asterisks* are highlighted in gold.
// export const STORY =
//   "Twenty years ago, we set out to be every student's *honest guide* to the world. Today, we're still *building global citizens*, and we're just getting started.";

  export const STORY =
  "Twenty years ago, we set out to *empower students* with *trusted guidance and global opportunities*. Today, we're shaping the next generation of global citizens — and we're just *getting started.*";

// TODO: replace these placeholder figures with PFEC's real numbers before going live.
export const STATS = [
  { value: 20, suffix: "", label: "Years of trust" },
  { value: 50000, suffix: "+", label: "Students guided" },
  { value: 500, suffix: "+", label: "Partner institutions" },
  { value: 15, suffix: "+", label: "Study destinations" },
];

// "Every Remarkable Journey" road — milestones from awards.pfecglobal.com
export const JOURNEY = {
  title: "Every Remarkable Journey Begins from a Simple Idea.",
  sub: "Here's a look at how our story unfolded.",
};

// Office openings along the road. `country` = flag code (bd / au / in / lk / id → /images/flags/{code}.svg),
// shown with the country name beside the city. Text only — add `img: "/images/journey/…"` to show a photo.
export const MILESTONES = [
  { year: "Nov 2006", title: "Melbourne", country: "au", text: "Where it all began — one small office and one big promise: to guide every student like family." },
  { year: "Dec 2012", title: "Dhanmondi", country: "bd", text: "Our first step into Bangladesh, bringing world-class guidance closer to home." },
  { year: "Sep 2013", title: "Chattogram", country: "bd", text: "The port city joins the journey — more dreams, now just around the corner." },
  { year: "2017", title: "Sydney", country: "au", text: "Harbour lights and a growing family — PFEC arrives in Australia's biggest city." },
  { year: "Jul & Dec 2019", title: "Adelaide & Perth", country: "au", text: "Two cities in one year — PFEC now stretches across Australia, from coast to coast." },
  { year: "May 2022", title: "Kolkata", country: "in", text: "Hello, India! The City of Joy opens a whole new chapter of our story." },
  { year: "Jul 2022", title: "Banani", country: "bd", text: "Dhaka grows with us — a second home in the heart of the capital." },
  { year: "May 2023", title: "Colombo", country: "lk", text: "Sri Lanka says yes, and our story crosses another ocean." },
  { year: "Oct 2023", title: "Ahmedabad", country: "in", text: "Gujarat's most ambitious students get a partner right on their doorstep." },
  { year: "Feb 2025", title: "Uttara", country: "bd", text: "Another door opens in Dhaka — because the dreams just keep coming." },
  { year: "Oct 2025", title: "Brisbane", country: "au", text: "Sunshine State, here we come — every major Australian city now within reach." },
  { year: "Nov 2025", title: "Lakemba, Sydney", country: "au", text: "A new door in Lakemba — closer to the communities who believed in us first." },
  { year: "Oct 2026", title: "Parramatta, Sydney", country: "au", text: "Parramatta joins the family — Western Sydney, and we're still growing." },
  { year: "Nov 2026", title: "Indonesia", country: "id", text: "Our newest flag, raised in our 20th year — and the road keeps going…" },
];

// End of the road — the "TODAY" fold below the journey
export const TODAY = {
  label: "Today",
  date: "Nov 2026",
  text: "PFEC Global is stronger than ever, celebrating its 20th year with 350+ employees across the world.",
  image: "/celebrate-image.png",
  imageAlt: "The PFEC Global team celebrating 20 years together",
};

// "We've grown from 1 car in Melbourne" — offices per country (the headline total is computed from these)
export const OFFICES = {
  intro: "From *Melbourne* to the World.",
  note: "But, that's not all! We are going to expand even more across many other countries. Stay tuned to know more!",
  // lx / ly = where the flag label sits on the map (percent of the map image)
  countries: [
    { code: "bd", name: "Bangladesh", offices: 4, map: "/images/country-map/bd.png", w: 488, h: 551, lx: "54%", ly: "56%" },
    { code: "au", name: "Australia", offices: 7, map: "/images/country-map/au.png", w: 448, h: 431, lx: "55%", ly: "46%" },
    { code: "in", name: "India", offices: 5, map: "/images/country-map/in.png", w: 578, h: 644, lx: "56%", ly: "60%" },
    { code: "lk", name: "Sri Lanka", offices: 1, map: "/images/country-map/lk.png", w: 307, h: 587, lx: "58%", ly: "52%" },
    { code: "id", name: "Indonesia", offices: 1, map: "/images/country-map/id.png", w: 641, h: 426, lx: "60%", ly: "60%" },
  ],
};

// "50+ Awards & Recognitions" — award cards scroll in two marquee rows (split between them, alternating).
// Files live in public/images/awards. w / h = the image's pixel size (keeps the card's shape).
// photo: true  → a photograph (rectangular) — shown with rounded corners.
// (no photo)   → a designed award card with its own shape (transparent edges); its outline is used for the
//                hover reflection, so keep these as PNGs with transparency.
export const AWARDS = {
  count: 50,
  title: "Awards & Recognitions",
  items: [
    // order matters: items alternate between the two rows (1st → top row, 2nd → bottom row, 3rd → top …)
    // (a photo roughly every third card, so each row mixes photos and designed cards)
    { src: "/images/awards/acu-silver-award.png", w: 1567, h: 914, alt: "2024 Silver Award, recognised by Australian Catholic University" },
    { src: "/images/awards/awaed1.jpg", w: 1536, h: 2048, photo: true, alt: "Outstanding Achievement Partner award (2024) from Western Sydney University, presented to PFEC Global" },
    { src: "/images/awards/adelaide-partner-of-the-year.png", w: 1664, h: 931, alt: "Outstanding Achievement (2024) and Partner of the Year Award – Diamond Category (2024 & 2023), recognised by Adelaide University" },
    { src: "/images/awards/deakin-outstanding-partner.png", w: 1561, h: 898, alt: "Outstanding Partner Award (2020), recognised by Deakin University" },
    { src: "/images/awards/cqu-collaborative-excellence.png", w: 1651, h: 953, alt: "Collaborative Excellence Award (2024), Outstanding Service Award (2023), Top Performing Agent (2021) and Top Quality Agent (2018), recognised by CQUniversity Australia" },
    { src: "/images/awards/awaed3.jpg", w: 3024, h: 4032, photo: true, alt: "Outstanding Agency Performance, South Asia — award from Kaplan Business School Australia to PFEC Global" },
    { src: "/images/awards/federation-platinum-status.png", w: 1573, h: 919, alt: "Platinum Level Status in the Recruitment of International Students (2023 & 2021), recognised by Federation University" },
    { src: "/images/awards/jcu-trusted-agent.png", w: 1568, h: 907, alt: "Trusted Agent (2025), recognised by James Cook University" },
    { src: "/images/awards/kaplan-legacy-partner.png", w: 1651, h: 953, alt: "Legacy Partner Agency (South Asia), Champion Performer – Kaplink Agent Portal, Outstanding Agency Performance (South Asia), Above & Beyond Award (2023) and Outstanding Performance in 2020 (Year on Year growth), recognised by Kaplan Business School Australia" },
    { src: "/images/awards/awaed4.jpg", w: 1536, h: 2048, photo: true, alt: "Outstanding Service Award (2023) from CQUniversity Australia, presented to PFEC Global" },
    { src: "/images/awards/la-trobe-double-platinum.png", w: 1560, h: 902, alt: "Double Platinum Eagle Award (2023) and Most Engaged Agency Award (2024), recognised by La Trobe University" },
    { src: "/images/awards/rmit-gold-agent.png", w: 1560, h: 903, alt: "Gold Agent Status (2023), recognised by RMIT University" },
    { src: "/images/awards/navitas-outstanding-partner.png", w: 1652, h: 952, alt: "Outstanding Partner Award (2025) and Diamond Agent (2022), recognised by Navitas" },
    { src: "/images/awards/awaed2.png", w: 1654, h: 2339, photo: true, alt: "Partner of the Year Award, Diamond Category (2024), presented to PFEC Global Bangladesh by the University of Adelaide" },
    { src: "/images/awards/up-education-platinum-partner.png", w: 1579, h: 924, alt: "Platinum Partner (2023), recognised by UP Education" },
    { src: "/images/awards/cim-top-performing-partner.png", w: 1580, h: 921, alt: "Top Performing Partner 2023–24 (Melbourne Campus), recognised by Canterbury Institute of Management" },
    { src: "/images/awards/scu-agent-of-the-year.png", w: 1651, h: 953, alt: "Agent of the Year Award (2022) and VIP Agent Status (FY2024), recognised by Southern Cross University" },
    { src: "/images/awards/awaed5.jpg", w: 1152, h: 2048, photo: true, alt: "Glass award from La Trobe University, presented to Pacific Foreign Education Consultants Limited (PFEC)" },
    { src: "/images/awards/ecu-top-performing-agent.png", w: 1577, h: 919, alt: "Top Performing Agent Award (2023), Highest Achiever – Interstate Recruitment (2022) and Top Performing Agent Award – Eastern States (2021), recognised by Edith Cowan University" },
    { src: "/images/awards/torrens-excellence-subcontinent.png", w: 1582, h: 923, alt: "Excellence Award Subcontinent (2021), recognised by Torrens University Australia" },
    { src: "/images/awards/holmes-outstanding-performance-gold.png", w: 1654, h: 951, alt: "Outstanding Performance – Gold (2023/24), recognised by Holmes Institute" },
    { src: "/images/awards/awaed6.png", w: 906, h: 1234, photo: true, alt: "Partner of the Decade and Emerging Excellence award from Swinburne University of Technology to PFEC Global" },
    { src: "/images/awards/uts-outstanding-performance.png", w: 1579, h: 921, alt: "Outstanding Performance – South Asia (2023), recognised by University of Technology Sydney" },
    { src: "/images/awards/wollongong-global-recruitment.png", w: 1564, h: 905, alt: "Certificate of Achievement for Global Recruitment Initiatives (2023), recognised by University of Wollongong" },
    { src: "/images/awards/vit-platinum-agency.png", w: 1671, h: 941, alt: "Platinum Agency Award (2020) and Top Performing Business Partner (2023), recognised by Victorian Institute of Technology" },
    { src: "/images/awards/awaed7.jpg", w: 1200, h: 1600, photo: true, alt: "Bangladesh Expatriate Award 2024 from the Bangladesh High Commission, Canberra, presented to Md Shahidul Islam" },
    { src: "/images/awards/tasmania-rising-star.png", w: 1575, h: 920, alt: "In Recognition of Excellent Cooperation & Unwavering Support (2023) and Rising Star Award (2024), recognised by University of Tasmania" },
    { src: "/images/awards/uwa-best-newcomer.png", w: 1562, h: 898, alt: "Best Newcomer for 2024 – Gold, recognised by The University of Western Australia" },
    { src: "/images/awards/cdu-top-performing-agent.png", w: 1651, h: 953, alt: "Top Performing Agent – Bangladesh (2020), recognised by Charles Darwin University" },
    { src: "/images/awards/awaed8.jpg", w: 1200, h: 1600, photo: true, alt: "Best Conversion and Best Emerging Partner Award, UWE Bristol Partners Conference 2025, presented to PFEC Global" },
    { src: "/images/awards/victoria-agent-of-the-year.png", w: 1567, h: 913, alt: "Excellence Award for Conversion – AU (2022), Top Performing Agent (2024) and Agent of the Year (2021), recognised by Victoria University" },
    { src: "/images/awards/western-sydney-rising-star.png", w: 1574, h: 907, alt: "Rising Star Agent Award (2022) and Outstanding Achievement Partner Award (2024), recognised by Western Sydney University" },
    { src: "/images/awards/melbourne-polytechnic-most-consistent.png", w: 1651, h: 953, alt: "Most Consistent Agency (2020), recognised by Melbourne Polytechnic" },
    { src: "/images/awards/performance-education-agent-excellence.png", w: 1566, h: 891, alt: "Agent Excellence Award (2023), recognised by Performance Education" },
  ],
  affiliations: {
    title: "Our Affiliations",
    titleRest: "& Recognition",
    text: "Prestigious recognitions that speak volumes about the quality of our service.",
    logos: [
      { src: "/images/recognition/5.png", w: 250, h: 250, label: "AIRC Certified", alt: "AIRC — American International Recruitment Council certified", height: 90 },
      { src: "/images/recognition/4.png", w: 650, h: 762, label: "ICEF Accredited", alt: "ICEF Accredited Agency #2660", height: 94 },
      { src: "/images/recognition/3.png", w: 420, h: 650, label: "QEAC #12934", alt: "QEAC #12934", height: 88 },
      { src: "/images/recognition/2.png", w: 772, h: 731, label: "MIA Member", alt: "Member of the Migration Institute of Australia", height: 88 },
      { src: "/images/recognition/1.png", w: 281, h: 101, label: "IEAA Member", alt: "IEAA — International Education Association of Australia", height: 58 },
    ],
  },
};

// University partners (carousel) — messages from university representatives.
// Add one line per video: the YouTube code (see the note at the top of this file), the university and its
// country (flag + name = the small tag on the card) and the person / title (shown as the name).
// country = 2-letter code of a flag in public/images/flags:
//   au Australia · gb UK · us USA · ca Canada · nz New Zealand · ie Ireland · de Germany · fr France
//   nl Netherlands · se Sweden · fi Finland · dk Denmark · ch Switzerland · it Italy · es Spain · mt Malta
//   cy Cyprus · hu Hungary · my Malaysia · sg Singapore · ae UAE · jp Japan · kr South Korea · cn China · hk Hong Kong
// Only filled-in videos appear; the carousel starts turning automatically once there are two or more.
// poster: optional cover image for the card, e.g. "/images/universities/monash.jpg" (public/images/universities/,
//   portrait 9:16, ~720×1280) — use it when a card looks blurry (the video has only a small YouTube thumbnail).
const UNIVERSITY_VIDEOS = [
  { youtube: "WUd9usOdxC8", university: "Curtin University", country: "au", name: "Rhys Lodwick, Regional Recruitment Manager – Australia" },
  { youtube: "AbJuRXipbjE", university: "Federation University", country: "au", name: "Adeyemi Ekunola, International Student Recruitment Officer – Australia" },
  { youtube: "TQesEopYv6U", university: "Murdoch University", country: "au", name: "Arjun Singh, Regional Manager South Asia – Australia" },

];

// Team messages per country — YouTube codes, in order. Add or remove "" slots freely (5 per row on desktop).
const TEAM_VIDEOS = {
  bd: ["", "", "", "", "", "", "", "", "", ""], // Bangladesh
  au: ["", "", "", "", "", "", "", "", "", ""], // Australia
  in: ["", "", "", "", "", "", "", "", "", ""], // India
  lk: ["", "", "", "", "", "", "", "", "", ""], // Sri Lanka
  id: ["", "", "", "", "", "", "", "", "", ""], // Indonesia
};

export const VOICES = {
  partners: {
    title: "Trusted by Universities Around the World",
    videos: UNIVERSITY_VIDEOS.filter((v) => v.youtube),
  },
  team: {
    title: "None of this Would Have Been Possible Without Your Efforts!",
    sub: "Hear it from our team!",
    // Country tabs (flag from /images/flags/{code}.svg) + an "All" tab; the videos come from TEAM_VIDEOS above
    countries: OFFICES.countries.map(({ code, name }) => ({
      code,
      name,
      videos: (TEAM_VIDEOS[code] || []).map((youtube, i) => ({ name: `${name} team message ${i + 1}`, youtube })),
    })),
  },
};

// "What drives us" section — hidden for now; set to true to show it again
export const SHOW_VALUES = false;

export const PILLARS = [
  {
    icon: "globe",
    title: "Building Global Citizens",
    text: "Every application, every visa and every new beginning is about one thing — helping students belong anywhere in the world.",
  },
  {
    icon: "people",
    title: "Powered by People",
    text: "Our counsellors, partners, students and families are the heart of PFEC. Twenty years of success is their story.",
  },
  {
    icon: "star",
    title: "The Next 20",
    text: "New destinations, new possibilities, same promise: guidance you can trust, from the first question to the first day on campus.",
  },
];

export const MARQUEE = ["20 Years", "Building Global Citizens", "Powered by People", "Study Abroad", "Visa"];
