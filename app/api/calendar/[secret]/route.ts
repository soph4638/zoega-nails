import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDateInCopenhagen } from "@/lib/availability";

// GET /api/calendar/[secret]
// Returnerer alle kommende bookinger som en iCalendar-feed (.ics), saa
// Sophie kan abonnere paa dem i fx Apple Kalender. Linket indeholder en
// hemmelig kode i stedet for login - kun dem der kender linket kan se det.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
) {
  const { secret } = await params;
  const expectedSecret = process.env.CALENDAR_FEED_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Ikke fundet." }, { status: 404 });
  }

  const today = getTodayDateInCopenhagen();
  const bookings = await prisma.booking.findMany({
    where: { date: { gte: today } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const ics = buildIcsFeed(bookings);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="zoega-nails-bookinger.ics"',
      "Cache-Control": "no-store",
    },
  });
}

type BookingRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  message: string | null;
};

function buildIcsFeed(bookings: BookingRow[]): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Zoega Nails//Bookinger//DA");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push("X-WR-CALNAME:Zoega Nails bookinger");
  lines.push("REFRESH-INTERVAL;VALUE=DURATION:PT30M");
  lines.push("X-PUBLISHED-TTL:PT30M");

  for (const booking of bookings) {
    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + booking.id + "@zoega-nails.vercel.app");
    lines.push("DTSTAMP:" + formatIcsTimestamp(new Date()));
    lines.push("DTSTART:" + formatIcsLocalDateTime(booking.date, booking.startTime));
    lines.push("DTEND:" + formatIcsLocalDateTime(booking.date, booking.endTime));
    lines.push("SUMMARY:" + escapeIcsText(booking.customerName + " - " + booking.serviceName));

    const descriptionParts = [
      "Kunde: " + booking.customerName,
      "Telefon: " + booking.customerPhone,
      "Tjeneste: " + booking.serviceName,
    ];
    if (booking.message) {
      descriptionParts.push("Besked: " + booking.message);
    }
    lines.push("DESCRIPTION:" + escapeIcsText(descriptionParts.join("\n")));
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function formatIcsTimestamp(date: Date): string {
  const iso = date.toISOString().replace(/[-:]/g, "").split(".")[0];
  return iso + "Z";
}

// Bookingens dato/tid er gemt som dansk lokal tid (Europe/Copenhagen), uden
// tidszone-info. Vi bruger derfor en "floating time" i ICS-filen (uden "Z"),
// saa kalender-appen selv bruger enhedens lokale tidszone til at vise tiden.
function formatIcsLocalDateTime(date: string, time: string): string {
  const datePart = date.replace(/-/g, "");
  const [hours, minutes] = time.split(":");
  return datePart + "T" + hours + minutes + "00";
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
