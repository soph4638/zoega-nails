// -----------------------------------------------------------------------
// Prisliste / tjenester
// -----------------------------------------------------------------------
// Rediger frit i listen herunder for at tilføje, fjerne eller ændre tjenester.
// - id: må IKKE ændres for en eksisterende tjeneste (bruges internt), men du
//   kan sagtens tilføje nye linjer med et nyt id.
// - durationMinutes: bruges til at beregne hvor meget tid en booking blokerer.
// - priceKr: prisen i danske kroner, kun betaling kontant ved fremmøde.
// -----------------------------------------------------------------------

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceKr: number;
  description?: string;
};

export const services: Service[] = [
  {
    id: "gel-simpelt-design",
    name: "Gel forlængelse – simpelt design",
    durationMinutes: 60,
    priceKr: 200,
  },
  {
    id: "gel-simpel-nail-art",
    name: "Gel forlængelse – med simpel nail art",
    durationMinutes: 90,
    priceKr: 250,
  },
  {
    id: "gel-stort-design",
    name: "Gel forlængelse – med stort design",
    durationMinutes: 120,
    priceKr: 300,
  },
  {
    id: "gel-uden-forlaengelse",
    name: "Helfarve gel uden forlængelse",
    durationMinutes: 60,
    priceKr: 150,
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

// Skriver en varighed i minutter ud som en læsevenlig dansk tekst,
// fx 60 -> "1 time", 90 -> "1,5 time", 120 -> "2 timer".
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "1 time" : `${hours} timer`;
  }
  return `${hours.toString().replace(".", ",")} time`;
}
