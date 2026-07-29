import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-beige bg-beige/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
        <p className="font-serif text-lg text-ink">Zoega Nails</p>
        <p className="text-sm text-ink/70">Kolding · Kontant betaling ved fremmøde</p>
        <a
          href="https://www.instagram.com/zoeganails/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark"
        >
          @zoeganails på Instagram
        </a>
        <div className="mt-2 flex gap-6 text-sm text-ink/60">
          <Link href="/book" className="hover:text-accent">
            Book tid
          </Link>
          <Link href="/om-mig" className="hover:text-accent">
            Kontakt
          </Link>
          <Link href="/admin" className="hover:text-accent">
            Admin
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink/40">
          © {new Date().getFullYear()} Sophie Zoega
        </p>
      </div>
    </footer>
  );
}
