import { NextRequest, NextResponse } from "next/server";
import { getAvailableDatesInRange } from "@/lib/availability";
import { getServiceById } from "@/lib/services";

const MONTH_REGEX = /^\d{4}-\d{2}$/;

// GET /api/availability/month?month=2026-08&serviceId=gel-simpelt-design
// Returnerer en liste af datoer i den valgte maaned, der har mindst en ledig tid.
// Bruges af kalenderen paa booking-siden til at markere dage med ledige tider.
export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const serviceId = request.nextUrl.searchParams.get("serviceId");

  if (!month || !MONTH_REGEX.test(month)) {
    return NextResponse.json(
      { error: "Ugyldig eller manglende maaned." },
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

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr);
  const fromDate = month + "-01";
  const lastDay = new Date(year, monthNum, 0).getDate();
  const toDate = month + "-" + String(lastDay).padStart(2, "0");

  const dates = await getAvailableDatesInRange(fromDate, toDate, service.durationMinutes);

  return NextResponse.json({ dates });
}
