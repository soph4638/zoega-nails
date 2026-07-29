import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Elegant serif-font til overskrifter
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Ren, letlæselig sans-serif-font til brødtekst
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zoega Nails – Book tid i Kolding",
  description:
    "Gel forlængelse og custom nail art hos Sophie Zoega i Kolding. Book din tid online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-ink antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
