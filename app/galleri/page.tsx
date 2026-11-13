import type { Metadata } from "next";
import Image from "next/image";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";
import { galleryImages } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Galleri – Zoega Nails",
  description: "Se billeder af gel forlængelse og custom nail art af Sophie Zoega.",
};

// Skiftende billedformater giver det asymmetriske "magasin"-look
const aspects = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/6]"];

export default function GalleriPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <Reveal>
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/50">Gallery</p>
          <h1 className="mt-2 leading-[0.9] text-ink">
            <span className="block font-serif text-6xl font-light italic md:text-7xl">Mine</span>
            <span className="block font-sans text-5xl font-extrabold uppercase tracking-tight md:text-6xl">designs</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/70">
            Et udpluk af tidligere sæt. Har du et ønske til dit eget design? Skriv det i beskeden,
            når du booker, eller send det på Instagram.
          </p>
        </div>
      </Reveal>

      <div className="columns-2 gap-3 md:columns-3 md:gap-5">
        {galleryImages.map((image, i) => (
          <Reveal key={image.src} className="mb-3 break-inside-avoid md:mb-5">
            <div className={`relative ${aspects[i % aspects.length]} overflow-hidden rounded-[1.75rem] bg-beige`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 30vw, 48vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 hidden justify-center md:flex">
        <BookButton />
      </div>
    </div>
  );
}
