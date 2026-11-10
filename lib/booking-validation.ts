import { getServiceById, type Service } from "@/lib/services";

// -----------------------------------------------------------------------
// Validering af kundens indtastninger til "Foreslå en tid"
// (lib/actions/time-request.ts). Reglerne er de samme som i den normale
// booking (lib/actions/booking.ts) - hvis du ændrer en regel dér, så ret den
// også her, så de to formularer tjekkes ens.
// -----------------------------------------------------------------------

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CustomerFieldsInput = {
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message?: string;
  imageUrl?: string;
};

export type ValidatedCustomerFields = {
  service: Service;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string | null;
  imageUrl: string | null;
};

export function validateCustomerFields(
  input: CustomerFieldsInput
): { ok: true; fields: ValidatedCustomerFields } | { ok: false; error: string } {
  const service = getServiceById(input.serviceId);
  if (!service) {
    return { ok: false, error: "Ukendt tjeneste." };
  }
  if (!DATE_REGEX.test(input.date) || !TIME_REGEX.test(input.startTime)) {
    return { ok: false, error: "Ugyldig dato eller tidspunkt." };
  }

  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  const customerEmail = (input.customerEmail ?? "").trim();
  if (!customerName || !customerPhone) {
    return { ok: false, error: "Navn og telefonnummer er påkrævet." };
  }
  if (customerEmail && !EMAIL_REGEX.test(customerEmail)) {
    return { ok: false, error: "Indtast venligst en gyldig emailadresse." };
  }

  // Billedet uploades til Vercel Blob af klienten, inden server-actionen
  // kaldes. Her tjekker vi blot at den medsendte URL ligner en gyldig blob-URL.
  const imageUrl =
    input.imageUrl && /^https:\/\/.+\.public\.blob\.vercel-storage\.com\//.test(input.imageUrl)
      ? input.imageUrl
      : null;

  return {
    ok: true,
    fields: {
      service,
      customerName,
      customerPhone,
      customerEmail,
      message: input.message?.trim() || null,
      imageUrl,
    },
  };
}
