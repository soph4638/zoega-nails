"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#behandlinger", label: "Treatments" },
  { href: "/galleri", label: "Gallery" },
  { href: "/om-mig", label: "About" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Lås scroll bag menuen, når den er åben på mobil
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-beige/70 bg-blush/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-baseline gap-2 text-ink"
        >
          <span className="font-serif text-2xl font-medium italic leading-none">Zoega</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">Nails</span>
        </Link>

        {/* Navigation til større skærme */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-medium uppercase tracking-[0.22em] transition-opacity hover:opacity-60 ${
                pathname === link.href ? "text-ink" : "text-ink/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="rounded-full bg-ink px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent-dark"
          >
            Book now
          </Link>
        </nav>

        {/* Menu-knap til mobil */}
        <button
          type="button"
          aria-label={menuOpen ? "Luk menu" : "Åbn menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="-mr-2 flex h-11 items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink md:hidden"
        >
          {menuOpen ? "Luk" : "Menu"}
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 block h-[1.5px] w-5 bg-ink transition-transform ${
                menuOpen ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-[1.5px] w-5 bg-ink transition-transform ${
                menuOpen ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Fuldskærms-menu på mobil */}
      {menuOpen && (
        <nav className="stripes fixed inset-x-0 top-14 bottom-0 z-50 flex flex-col bg-blush px-5 pt-6 md:hidden">
          <div className="flex flex-col rounded-3xl bg-blush/95 p-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-baseline justify-between border-b border-beige py-4"
              >
                <span className="font-serif text-4xl font-light italic text-ink">{link.label}</span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-ink/40">
                  0{i + 1}
                </span>
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-8 rounded-full bg-ink px-6 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.22em] text-white active:scale-[0.98]"
            >
              Book your appointment
            </Link>
            <a
              href="https://www.instagram.com/zoeganails/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 text-center text-[11px] uppercase tracking-[0.22em] text-ink/60"
            >
              @zoeganails
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
