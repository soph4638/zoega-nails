import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

// Elegant serif-font til de store overskrifter
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Moderne sans-serif til brødtekst, menu og knapper
const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zoega Nails – Book tid i Kolding",
  description:
    "Gel forlængelse og custom nail art hos Sophie Zoega i Kolding. Book din tid online.",
  // Det billede og den tekst, der vises når linket deles på Instagram, SMS osv.
  openGraph: {
    title: "Zoega Nails – Book tid i Kolding",
    description: "Gel forlængelse og custom nail art. Book din tid online.",
    url: SITE_URL,
    siteName: "Zoega Nails",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: "/images/gallery/negle-20.jpg",
        width: 2000,
        height: 1125,
        alt: "Negle med 3D-blomster og guld foran lyserøde liljer",
      },
    ],
  },
};

// Mobil-indstillinger: farven i toppen af Safari + plads til iPhonens kanter
export const viewport: Viewport = {
  themeColor: "#f3dceb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${cormorant.variable} ${montserrat.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-ink antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyBookBar />
      </body>
    </html>
  );
}
