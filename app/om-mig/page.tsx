import type { Metadata } from "next";
import Image from "next/image";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Om mig – Zoega Nails",
  description: "Mød Sophie Zoega, negleteknikker i Kolding.",
};

export default function OmMigPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/50">About</p>
          <h1 className="mt-2 leading-[0.9] text-ink">
            <span className="block font-serif text-6xl font-light italic md:text-7xl">Hej, jeg er</span>
            <span className="block font-sans text-5xl font-extrabold uppercase tracking-tight md:text-6xl">Sophie</span>
          </h1>
        </Reveal>

        {/* Billede for sig selv, så teksten aldrig ligger oven på det */}
        <Reveal className="md:row-span-2">
          <div className="relative mx-auto w-[85%] md:w-full">
            <div className="stripes absolute -right-4 -bottom-4 h-full w-full rounded-[2rem]" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image
                src="/images/gallery/negle-21.jpg"
                alt="Nude mandelnegle med håndmalede hvide hibiscus-blomster og prikker"
                fill
                sizes="(min-width: 768px) 45vw, 85vw"
                className="object-cover object-[40%_50%]"
              />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="space-y-5 rounded-[2rem] bg-cream p-6 leading-relaxed text-ink/80 md:p-8">
            <p>
              Jeg laver gel forlængelse og custom nail art fra Kolding, med fokus på kvalitet og
              godt håndværk i hvert eneste sæt.
            </p>
            <p>
              Jeg tager en kunde ad gangen. Det betyder, at min tid og opmærksomhed er rettet mod dig
              og dine negle, uden stress eller venten. Et sæt tager typisk 1-2 timer, afhængigt af
              hvor detaljeret design du ønsker.
            </p>
            <p>
              Betaling foregår ved fremmøde. Har du et specifikt design i tankerne, må du meget gerne
              skrive det i beskeden eller sende det på Instagram, når du booker. Så kan jeg forberede
              mig bedst muligt og sikre, at det bliver præcis, som du ønsker.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-start gap-5">
            <a
              href="https://www.instagram.com/zoeganails/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ink pb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink"
            >
              @zoeganails på Instagram →
            </a>
            <div className="hidden md:block">
              <BookButton />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
