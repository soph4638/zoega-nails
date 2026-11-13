import type { Metadata } from "next";
import BookingWizard from "@/components/BookingWizard";
import { getServiceById } from "@/lib/services";

export const metadata: Metadata = {
  title: "Book tid – Zoega Nails",
  description: "Book en tid til gel forlængelse eller nail art hos Zoega Nails i Kolding.",
};

// Kommer kunden fra en "Book"-knap på et behandlingskort (/book?service=...),
// er den behandling valgt på forhånd.
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { service } = await searchParams;
  const initialServiceId =
    typeof service === "string" && getServiceById(service) ? service : null;

  return <BookingWizard initialServiceId={initialServiceId} />;
}
