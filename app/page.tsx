import Image from "next/image";
import Link from "next/link";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";
import { galleryImages } from "@/lib/gallery";
import { services, formatDuration } from "@/lib/services";

// Behandlinger der vises som store kort på forsiden.
// "Helfarve gel uden forlængelse" vises som en lille linje under kortene i stedet.
const featuredServiceIds = ["gel-simpelt-design", "gel-simpel-nail-art", "gel-stort-design"];
const featuredServices = services.filter((s) => featuredServiceIds.includes(s.id));
const extraServices = services.filter((s) => !featuredServiceIds.includes(s.id));

// Billeder til galleri-teaseren (asymmetrisk grid)
const teaser = [galleryImages[13], galleryImages[6], galleryImages[1], galleryImages[11], galleryImages[14]];

const marqueeWords = ["Gel forlængelse", "Custom nail art", "Kolding", "Én kunde ad gangen"];

export default function Home() {
  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="relative">
        <div className="relative mx-auto h-[calc(100svh-3.5rem-5.5rem)] min-h-[460px] max-h-[760px] w-full overflow-hidden md:h-[80vh] md:max-w-6xl md:rounded-b-[2.5rem]">
          <Image
            src="/images/gallery/negle-3.jpg"
            alt="Lyserøde negle med prikker og gulddetaljer"
            fill
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover object-[50%_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

          <p className="absolute top-5 left-5 rounded-full bg-blush/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink backdrop-blur">
            ✦ Kolding
          </p>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-7 text-white md:px-12 md:pb-12">
            <h1 className="leading-[0.88]">
              <span className="block font-serif text-[3.6rem] font-light italic sm:text-7xl md:text-8xl">
                Your
              </span>
              <span className="block font-sans text-[3.1rem] font-extrabold tracking-tight uppercase sm:text-7xl md:text-8xl">
                nails,
              </span>
              <span className="block font-serif text-[3.6rem] font-light italic sm:text-7xl md:text-8xl">
                your <span className="font-sans text-[3.1rem] font-extrabold not-italic tracking-tight uppercase sm:text-7xl md:text-8xl">moment</span>
              </span>
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85 md:max-w-md md:text-base">
              Gel forlængelse og custom nail art hos Sophie i Kolding. Book din tid direkte her.
            </p>
            <div className="mt-6 hidden md:block">
              <BookButton className="bg-white !text-ink hover:!bg-blush" />
            </div>
          </div>
        </div>

        {/* Rullende tekstbånd */}
        <div className="overflow-hidden border-y border-ink/10 bg-baby py-3 md:mx-auto md:mt-6 md:max-w-6xl md:rounded-full md:border-0">
          <div className="marquee flex w-max">
            {[0, 1].map((n) => (
              <div key={n} className="flex shrink-0" aria-hidden={n === 1}>
                {[...marqueeWords, ...marqueeWords].map((word, i) => (
                  <span
                    key={`${n}-${i}`}
                    className="flex items-center gap-6 pr-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink"
                  >
                    {word} <span aria-hidden="true">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- BEHANDLINGER & PRISER ---------------- */}
      <section id="behandlinger" className="stripes relative py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="mx-auto mb-10 max-w-md rounded-3xl bg-blush/95 px-6 py-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/50">
                Treatments
              </p>
              <h2 className="mt-2 font-serif text-5xl font-light italic leading-none text-ink md:text-6xl">
                Priser &amp; <span className="font-sans text-4xl font-extrabold not-italic uppercase tracking-tight md:text-5xl">tider</span>
              </h2>
              <p className="mt-3 text-sm text-ink/60">Vælg ud fra hvor meget design du ønsker.</p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {featuredServices.map((service, i) => (
              <Reveal key={service.id} delay={i * 100}>
                <article className="flex h-full flex-col rounded-3xl bg-cream p-6 shadow-sm shadow-ink/5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-serif text-lg italic text-ink/40">0{i + 1}</span>
                    <span className="rounded-full border border-ink/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70">
                      {formatDuration(service.durationMinutes)}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-[1.7rem] font-medium leading-tight text-ink">
                    {capitalize(service.name.replace("Gel forlængelse – ", ""))}
                  </h3>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/50">
                    Gel forlængelse
                  </p>
                  {service.description && (
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{service.description}</p>
                  )}
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <p className="font-serif text-5xl font-light leading-none text-ink [font-variant-numeric:lining-nums]">
                      {service.priceKr}
                      <span className="ml-1 font-sans text-xs font-semibold uppercase tracking-[0.2em]">kr</span>
                    </p>
                    <Link
                      href={`/book?service=${service.id}`}
                      className="rounded-full bg-ink px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all hover:bg-accent-dark active:scale-[0.97]"
                    >
                      Book
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {extraServices.map((service) => (
            <Reveal key={service.id}>
              <Link
                href={`/book?service=${service.id}`}
                className="mt-4 flex items-center justify-between gap-4 rounded-full bg-white/90 px-6 py-4 text-sm text-ink transition-all active:scale-[0.98] md:mx-auto md:mt-6 md:max-w-xl"
              >
                <span>
                  <span className="font-medium">{service.name}</span>
                  <span className="block text-xs text-ink/50">
                    {formatDuration(service.durationMinutes)} · {service.priceKr} kr
                  </span>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">Book →</span>
              </Link>
            </Reveal>
          ))}

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.22em] text-ink/60">
            ✦ Betaling ved fremmøde ✦
          </p>
        </div>
      </section>

      {/* ---------------- GALLERI ---------------- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="leading-[0.9] text-ink">
                <span className="block font-serif text-5xl font-light italic md:text-6xl">Seneste</span>
                <span className="block font-sans text-4xl font-extrabold uppercase tracking-tight md:text-5xl">designs</span>
              </h2>
              <Link
                href="/galleri"
                className="border-b border-ink pb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink"
              >
                Se alle
              </Link>
            </div>
          </Reveal>

          {/* Asymmetrisk grid: to kolonner, den højre er skubbet lidt ned */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            <div className="flex flex-col gap-3 md:gap-5">
              <GalleryTile image={teaser[0]} aspect="aspect-[3/4]" />
              <GalleryTile image={teaser[1]} aspect="aspect-square" />
            </div>
            <div className="mt-10 flex flex-col gap-3 md:mt-20 md:gap-5">
              <GalleryTile image={teaser[2]} aspect="aspect-square" />
              <GalleryTile image={teaser[3]} aspect="aspect-[3/4]" />
            </div>
            <div className="hidden flex-col gap-5 md:mt-6 md:flex">
              <GalleryTile image={teaser[4]} aspect="aspect-[4/5]" />
              <div className="stripes flex aspect-square items-center justify-center rounded-[2rem] p-6">
                <p className="rounded-2xl bg-blush/95 px-5 py-4 text-center font-serif text-2xl italic text-ink">
                  Dit design,
                  <br />
                  din idé ✦
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- OM MIG ---------------- */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto w-[85%] md:w-full">
              <div className="stripes absolute -right-4 -bottom-4 h-full w-full rounded-[2rem]" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/gallery/negle-13.jpg"
                  alt="Fransk manicure med fint 3D-blomsterdesign"
                  fill
                  sizes="(min-width: 768px) 45vw, 85vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/50">About</p>
            <h2 className="mt-2 leading-[0.9] text-ink">
              <span className="block font-serif text-5xl font-light italic md:text-6xl">Hej, jeg er</span>
              <span className="block font-sans text-5xl font-extrabold uppercase tracking-tight md:text-6xl">Sophie</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink/70">
              Jeg laver gel forlængelse og custom nail art i Kolding. Jeg tager én kunde ad gangen,
              så du får min fulde opmærksomhed og et sæt, der holder.
            </p>
            <Link
              href="/om-mig"
              className="mt-6 inline-block border-b border-ink pb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink"
            >
              Læs mere
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- AFSLUTTENDE CTA ---------------- */}
      <section className="stripes py-16 md:py-24">
        <Reveal>
          <div className="mx-auto max-w-md px-5">
            <div className="rounded-[2rem] bg-blush/95 px-6 py-10 text-center">
              <p className="text-baby">✦ ✦ ✦</p>
              <h2 className="mt-3 leading-[0.9] text-ink">
                <span className="block font-serif text-5xl font-light italic">Klar til</span>
                <span className="block font-sans text-4xl font-extrabold uppercase tracking-tight">nye negle?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xs text-sm text-ink/60">
                Vælg behandling, find en ledig tid og book direkte. Betaling ved fremmøde.
              </p>
              <BookButton className="mt-6 w-full" />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function GalleryTile({ image, aspect }: { image: { src: string; alt: string }; aspect: string }) {
  return (
    <Reveal>
      <div className={`relative ${aspect} overflow-hidden rounded-[2rem] bg-beige`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 30vw, 48vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>
    </Reveal>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
