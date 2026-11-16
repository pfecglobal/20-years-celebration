// All page copy and figures live here — edit freely.

export const FOUNDED_YEAR = 2006;
export const ANNIVERSARY_YEAR = 2026;

// "A Message from the People Who were there on Day One." video fold.
// Drop the CEO's portrait video at public/videos/ceo-message.mp4 (and optionally a poster image).
export const DAY_ONE = {
  title: "A Message from the People",
  lead: "Who were there on",
  emphasis: "Day One.",
  video: "/videos/ceo-message.mp4",
  poster: "", // e.g. "/videos/ceo-message-poster.jpg"
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

export const MILESTONES = [
  { year: 2006, title: "Where it all began", text: "A single office in Melbourne and a promise to guide every student like family.", img: "/images/journey/2006-melbourne.jpg" },
  { year: 2009, title: "Growing across Australia", text: "Sydney opens, soon followed by Adelaide, Perth and Brisbane." },
  { year: 2012, title: "Hello, Bangladesh", text: "Our Dhaka office opens its doors, later joined by Chattogram.", img: "/images/journey/2012-bangladesh.jpg" },
  { year: 2015, title: "100 partner institutions", text: "Universities, TAFEs and colleges worldwide join our network." },
  { year: 2017, title: "India & Sri Lanka", text: "Kolkata, Ahmedabad and Colombo bring PFEC closer to more families.", img: "/images/journey/2017-india-sri-lanka.jpg" },
  { year: 2019, title: "10,000 students placed", text: "A milestone measured in dreams, visas and first days on campus." },
  { year: 2022, title: "Migration services", text: "Registered migration agents join, guiding students from classroom to career." },
  { year: 2024, title: "550+ partners, 11 countries", text: "A study-abroad network that spans the globe.", img: "/images/journey/2024-global.jpg" },
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

// Video walls: students, then the team. Drop the files into public/videos/... (posters optional).
const videoSet = (folder, names) =>
  names.map((name, i) => ({ name, src: `/videos/${folder}/${i + 1}.mp4`, poster: "" }));

export const VOICES = {
  students: {
    title: "We've Truly Made a Difference in So Many Students' Lives",
    videos: videoSet("students", ["Student story 1", "Student story 2", "Student story 3", "Student story 4", "Student story 5"]),
  },
  team: {
    title: "None of this Would Have Been Possible Without Your Efforts!",
    sub: "Hear it from our team!",
    // Country tabs (flag from /images/flags/{code}.svg) + an "All" tab. Videos go in public/videos/team/{code}/1.mp4, 2.mp4 …
    // Change `length` to match how many videos each country has (5 per row on desktop).
    countries: OFFICES.countries.map(({ code, name }) => ({
      code,
      name,
      videos: videoSet(`team/${code}`, Array.from({ length: 10 }, (_, i) => `${name} team message ${i + 1}`)),
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
