import Image from "next/image";
import Link from "next/link";
import BookButton from "@/components/BookButton";
import { galleryImages } from "@/lib/gallery";

export default function Home() {
  return (
    <div>
      {/* Hero-sektion: overskrift + intro + stort "Z" med foto klippet ind */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-6">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.25em] text-accent">
            Kolding
          </p>
          <h1 className="max-w-xl font-serif text-4xl italic leading-tight text-ink sm:text-5xl md:text-[3.4rem]">
            Tid til et nyt sæt negle?
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/60">
            Book dit næste neglesæt hos Sophie i Kolding, betaling kontant ved fremmøde.
          </p>
          <BookButton className="mt-8" />
        </div>

        <div className="flex flex-col items-center justify-center text-center translate-x-10 sm:translate-x-16">
          <div className="bg-[url('/images/gallery/negle-11.jpg')] bg-[length:100%_100%] bg-no-repeat bg-center bg-clip-text font-archivo text-[500px] font-black leading-[0.65] text-transparent sm:text-[680px]">
            Z
          </div>
          <a
            href="https://www.instagram.com/zoeganails/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ink/40 hover:text-accent"
          >
            @zoeganails
          </a>
        </div>
      </section>

      {/* Udvalgte designs: tjenester fra prislisten vist sammen med rigtige billeder */}
      <section className="border-t border-beige">
        <div className="mx-auto flex max-w-5xl items-end justify-between px-4 pt-16 pb-20 sm:px-6">
          <h2 className="font-serif text-3xl italic text-ink">Udvalgte designs</h2>
          <Link
            href="/galleri"
            className="text-sm font-medium text-accent hover:text-accent-dark"
          >
            Se hele galleriet →
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-y-32 px-4 pb-16 sm:px-6 sm:pb-20 md:block md:gap-0 md:min-h-[800px] md:pb-0">
          {/* Simpelt design */}
          <div className="md:absolute md:left-10 md:top-0 md:w-[190px]">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={galleryImages[3].src}
                alt={galleryImages[3].alt}
                fill
                sizes="(min-width: 768px) 190px, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Med stort design */}
          <div className="md:absolute md:right-[60px] md:top-0 md:w-[210px]">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={galleryImages[4].src}
                alt={galleryImages[4].alt}
                fill
                sizes="(min-width: 768px) 210px, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Med nail art */}
          <div className="md:absolute md:left-[140px] md:top-[380px] md:w-[200px]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={galleryImages[1].src}
                alt={galleryImages[1].alt}
                fill
                sizes="(min-width: 768px) 200px, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Gel uden forlængelse */}
          <div className="md:absolute md:right-[90px] md:top-[400px] md:w-[175px]">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={galleryImages[16].src}
                alt={galleryImages[16].alt}
                fill
                sizes="(min-width: 768px) 175px, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Afsluttende CTA */}
      <section className="border-t border-beige bg-blush/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="font-serif text-2xl italic text-ink sm:text-3xl">
            Klar til din næste manicure?
          </h2>
          <p className="max-w-md text-ink/60">
            Vælg en tjeneste, find en ledig tid, og book direkte online.
            Betaling foregår kontant ved fremmøde.
          </p>
          <BookButton className="mt-2" />
        </div>
      </section>
    </div>
  );
}
