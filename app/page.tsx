import Image from "next/image";
import Link from "next/link";
import BookButton from "@/components/BookButton";
import { featuredGalleryImages } from "@/lib/gallery";

export default function Home() {
  return (
    <div>
      {/* Hero-sektion: kort velkomst + tydelig Book tid-knap */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-sm tracking-widest text-accent uppercase">Kolding</p>
        <h1 className="max-w-2xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
          Gel forlængelse &amp; custom nail art, skabt til dig
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
          Jeg hedder Sophie Zoega og tager kun én kunde ad gangen, så din
          session bliver rolig, personlig og med tid til at gøre dine negle
          præcis som du drømmer om.
        </p>
        <BookButton className="mt-2 w-full max-w-xs sm:w-auto" />
      </section>

      {/* Galleri-highlight: de bedste billeder */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">Mit arbejde</h2>
          <Link href="/galleri" className="text-sm font-medium text-accent hover:text-accent-dark">
            Se hele galleriet →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {featuredGalleryImages.map((image) => (
            <div
              key={image.src}
              className="relative aspect-square overflow-hidden rounded-2xl bg-beige"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 22vw, 45vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Afsluttende CTA */}
      <section className="border-t border-beige bg-blush/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">
            Klar til din næste manicure?
          </h2>
          <p className="max-w-md text-ink/70">
            Vælg en tjeneste, find en ledig tid, og book direkte online.
            Betaling foregår kontant ved fremmøde.
          </p>
          <BookButton className="mt-2 w-full max-w-xs sm:w-auto" />
        </div>
      </section>
    </div>
  );
}
