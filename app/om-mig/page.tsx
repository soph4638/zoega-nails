import type { Metadata } from "next";
import BookButton from "@/components/BookButton";

export const metadata: Metadata = {
  title: "Om mig – Zoega Nails",
  description: "Mød Sophie Zoega, negleteknikker i Kolding.",
};

export default function OmMigPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">Om mig</h1>

      <div className="mt-8 space-y-5 text-left text-ink/80 leading-relaxed sm:text-lg">
        <p>
          Hej, jeg hedder Sophie Zoega. Jeg laver gel forlængelse og custom
          nail art fra Kolding, med fokus på kvalitet og godt håndværk i hvert
          eneste sæt.
        </p>
        <p>
          Jeg tager en kunde ad gangen. Det betyder min tid og
          opmærksomhed er rettet mod dig og dine negle, uden stress eller
          venten. Et sæt tager typisk 1-2 timer, afhængigt af hvor
          detaljeret design du ønsker.
        </p>
        <p>
          Betaling foregår kontant ved fremmøde. Har du et specifikt design i
          tankerne, må du meget gerne skrive det i beskeden eller sende det over insta, når du booker, så
          jeg kan forberede mig bedst muligt, og sikre det kan udføres efter dit ønske.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <a
          href="https://www.instagram.com/zoeganails/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-medium text-accent hover:text-accent-dark"
        >
          @zoeganails på Instagram →
        </a>
        <BookButton />
      </div>
    </div>
  );
}
