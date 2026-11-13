"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Book-knap der altid sidder i bunden af skærmen på mobil.
// Skjules på selve booking-siden og admin, hvor den ikke giver mening.
export default function StickyBookBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/book") || pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Tom plads, så knappen ikke dækker bunden af siden */}
      <div className="h-24 md:hidden" aria-hidden="true" />
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-blush via-blush/90 to-transparent px-4 pt-6 md:hidden">
        <Link
          href="/book"
          className="flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-white shadow-lg shadow-ink/20 transition-transform active:scale-[0.98]"
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.22em]">
            Book your appointment
          </span>
          <span aria-hidden="true" className="text-baby">
            ✦
          </span>
        </Link>
      </div>
    </>
  );
}
