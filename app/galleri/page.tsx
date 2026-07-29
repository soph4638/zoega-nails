import type { Metadata } from "next";
import Image from "next/image";
import BookButton from "@/components/BookButton";
import { galleryImages } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Galleri – Zoega Nails",
  description: "Se billeder af gel forlængelse og custom nail art af Sophie Zoega.",
};

export default function GalleriPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Galleri</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink/70">
          Et udpluk af tidligere designs. Har du et ønske til dit eget design?
          Skriv det i beskeden, når du booker.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {galleryImages.map((image) => (
          <div
            key={image.src}
            className="relative aspect-square overflow-hidden rounded-2xl bg-beige"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 30vw, 45vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <BookButton />
      </div>
    </div>
  );
}
