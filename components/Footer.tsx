import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-blush">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-14 text-center">
        <p className="flex items-baseline gap-2">
          <span className="font-serif text-3xl font-medium italic">Zoega</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">Nails</span>
        </p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-blush/60">
          Kolding ✦ Betaling ved fremmøde
        </p>
        <a
          href="https://www.instagram.com/zoeganails/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 rounded-full border border-blush/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-blush transition-colors hover:bg-blush hover:text-ink"
        >
          @zoeganails på Instagram
        </a>
        <div className="mt-2 flex gap-6 text-[11px] uppercase tracking-[0.22em] text-blush/60">
          <Link href="/book" className="hover:text-blush">
            Book tid
          </Link>
          <Link href="/om-mig" className="hover:text-blush">
            Kontakt
          </Link>
        </div>
        <p className="mt-4 text-[10px] tracking-[0.15em] text-blush/40">
          © {new Date().getFullYear()} Sophie Zoega
        </p>
      </div>
    </footer>
  );
}
