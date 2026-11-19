import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Elegant serif for premium accents (e.g. the "TODAY" card date), as on awards.pfecglobal.com
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  title: "PFEC Global — 20 Years of Building Global Citizens (2006–2026)",
  description:
    "Since 2006, PFEC Global has guided students worldwide in study abroad and visa services. Celebrating two decades of building global citizens, powered by people.",
  // not to be indexed by search engines (and their links not followed)
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  icons: {
    icon: [{ url: "/PFEC-Favicon.webp", type: "image/webp" }],
    shortcut: "/PFEC-Favicon.webp",
    apple: "/PFEC-Favicon.webp",
  },
  openGraph: {
    title: "PFEC Global — 20 Years of Building Global Citizens",
    description: "Two decades of guiding students to study abroad, 2006–2026. Building Global Citizens, Powered by People.",
  },
};

export const viewport = {
  themeColor: "#121212",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. ColorZilla's `cz-shortcut-listen`,
    // Grammarly) inject attributes into <html>/<body> before React hydrates. This only
    // ignores attribute mismatches on these two elements, not their children.
    <html lang="en" className={`${poppins.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}.office-chip{opacity:1!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
