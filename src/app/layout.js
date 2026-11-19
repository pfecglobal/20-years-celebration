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
  title: "PFEC Global Celebrating 20 | Building Global Citizens",
  description:
    "Celebrating 20 years of PFEC Global — Study Abroad | Visa. Building Global Citizens, Powered by People.",
  icons: {
    icon: [{ url: "/PFEC-Favicon.webp", type: "image/webp" }],
    shortcut: "/PFEC-Favicon.webp",
    apple: "/PFEC-Favicon.webp",
  },
  openGraph: {
    title: "PFEC Global Celebrating 20",
    description: "Building Global Citizens | Powered by People",
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
