// All page copy and figures live here — edit freely.

export const FOUNDED_YEAR = 2006;
export const ANNIVERSARY_YEAR = 2026;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// VIDEOS ARE YOUTUBE: paste the video code — the last part of the link.
//   https://www.youtube.com/shorts/tVLcwsXQ5f8  →  "tVLcwsXQ5f8"
// (Pasting the whole link works too. Shorts open in a portrait player; normal youtube.com/watch?v=…
//  or youtu.be/… links open in a widescreen player.) Leave "" for a "Video coming soon" card.
// ─────────────────────────────────────────────────────────────────────────────────────────────

// "A Message from the People Who were there on Day One." video fold.
export const DAY_ONE = {
  title: "A Message from the People",
  lead: "Who were there on",
  emphasis: "Day One.",
  youtube: "tVLcwsXQ5f8", // ← example Short — replace with the Day One message's code
  label: "Watch the message",
};

export const TAGLINE = ["Building Global Citizens", "Powered by People"];

// Words wrapped in *asterisks* are highlighted in gold.
export const STORY =
  "Twenty years ago, we set out to be every student's *honest guide* to the world. Today, we're still *building global citizens*, and we're just getting started.";

// TODO: replace these placeholder figures with PFEC's real numbers before going live.
export const STATS = [
  { value: 20, suffix: "", label: "Years of trust" },
  { value: 50000, suffix: "+", label: "Students guided" },
  { value: 500, suffix: "+", label: "Partner institutions" },
  { value: 15, suffix: "+", label: "Study destinations" },
];

// "Every Remarkable Journey" road — milestones from awards.pfecglobal.com
export const JOURNEY = {
  title: "Every Remarkable Journey Begins as a Simple Idea.",
  sub: "Here's a look at how our story unfolded, one milestone at a time.",
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
  intro: "We've Grown from 1 Car in Melbourne",
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

// "50+ Awards & Recognitions" — award cards scroll in two marquee rows
export const AWARDS = {
  count: 50,
  title: "Awards & Recognitions",
  items: [
    { src: "/images/awards/1.png", w: 617, h: 372, alt: "Outstanding Partnership & Support for Sarawak Campus (2024), recognised by Swinburne University of Technology" },
    { src: "/images/awards/2.png", w: 650, h: 372, alt: "Outstanding Achievement (2024) and Rising Star Agent Award (2022), recognised by Western Sydney University" },
    { src: "/images/awards/3.png", w: 650, h: 372, alt: "Best Conversion and Best Emerging Partner Award (2025), recognised by UWE Bristol" },
    { src: "/images/awards/4.png", w: 650, h: 372, alt: "Gold Agent of the Year and Top 3 Student Recruiter of the Year – Bangladesh (2024), recognised by Canterbury Christ Church University" },
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

// Student stories (carousel) — one YouTube code per story (see the note at the top of this file)
const STUDENT_VIDEOS = [
  { name: "Student story 1", youtube: "" },
  { name: "Student story 2", youtube: "" },
  { name: "Student story 3", youtube: "" },
  { name: "Student story 4", youtube: "" },
  { name: "Student story 5", youtube: "" },
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
  students: {
    title: "We've Truly Made a Difference in So Many Students' Lives",
    videos: STUDENT_VIDEOS,
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
