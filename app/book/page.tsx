import type { Metadata } from "next";
import BookingWizard from "@/components/BookingWizard";

export const metadata: Metadata = {
  title: "Book tid – Zoega Nails",
  description: "Book en tid til gel forlængelse eller nail art hos Zoega Nails i Kolding.",
};

export default function BookPage() {
  return <BookingWizard />;
}
