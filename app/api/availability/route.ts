import { NextRequest, NextResponse } from "next/server";
import { getOpenSlots } from "@/lib/availability";
import { getServiceById } from "@/lib/services";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/availability?date=2026-08-02&serviceId=gel-simpelt-design
// Returnerer en liste af ledige starttidspunkter ("HH:mm") for den valgte
// dato og tjeneste. Bruges af booking-siden til at vise en kalender/liste.
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const serviceId = request.nextUrl.searchParams.get("serviceId");

  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: "Ugyldig eller manglende dato." },
      { status: 400 }
    );
  }

  const service = serviceId ? getServiceById(serviceId) : undefined;
  if (!service) {
    return NextResponse.json(
      { error: "Ukendt tjeneste." },
      { status: 400 }
    );
  }

  const slots = await getOpenSlots(date, service.durationMinutes);
  return NextResponse.json({ slots });
}
