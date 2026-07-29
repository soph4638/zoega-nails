import { prisma } from "@/lib/prisma";

// -----------------------------------------------------------------------
// Hjælpefunktioner til at regne med klokkeslæt gemt som tekst ("HH:mm").
// Vi undgår bevidst at bruge JavaScripts Date-objekt til klokkeslæt, da det
// nemt fører til tidszone-fejl. Kun minut-tal bruges til udregninger.
// -----------------------------------------------------------------------

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Returnerer dagens dato og klokkeslæt i dansk tid ("Europe/Copenhagen"),
// uanset hvilken tidszone serveren selv kører i (Vercel kører i UTC).
function getNowInCopenhagen(): { date: string; time: string } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Copenhagen",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

// Hvor mange minutter der er mellem hver mulige starttid, kunder kan vælge.
const SLOT_STEP_MINUTES = 30;

// -----------------------------------------------------------------------
// Finder alle ledige starttidspunkter for en given dato og servicevarighed.
// -----------------------------------------------------------------------
export async function getOpenSlots(
  date: string,
  durationMinutes: number
): Promise<string[]> {
  const [windows, bookings] = await Promise.all([
    prisma.availabilityWindow.findMany({ where: { date } }),
    prisma.booking.findMany({ where: { date } }),
  ]);

  const { date: today, time: nowTime } = getNowInCopenhagen();
  const nowMinutes = timeToMinutes(nowTime);

  const candidateStarts = new Set<number>();

  for (const window of windows) {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);

    for (
      let start = windowStart;
      start + durationMinutes <= windowEnd;
      start += SLOT_STEP_MINUTES
    ) {
      // Skjul tidspunkter der allerede er passeret i dag.
      if (date === today && start <= nowMinutes) continue;
      candidateStarts.add(start);
    }
  }

  const bookedRanges = bookings.map((booking) => ({
    start: timeToMinutes(booking.startTime),
    end: timeToMinutes(booking.endTime),
  }));

  const openStarts = [...candidateStarts]
    .filter((start) => {
      const end = start + durationMinutes;
      return !bookedRanges.some(
        (booked) => start < booked.end && end > booked.start
      );
    })
    .sort((a, b) => a - b);

  return openStarts.map(minutesToTime);
}

// Dagens dato i "YYYY-MM-DD", i dansk tid. Bruges af admin-siden til at vise
// og filtrere kun kommende (ikke overståede) bookinger og tidsrum.
export function getTodayDateInCopenhagen(): string {
  return getNowInCopenhagen().date;
}

// Beregner sluttidspunkt ud fra et starttidspunkt og en varighed i minutter.
export function addMinutesToTime(time: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(time) + durationMinutes);
}

// Tjekker om to tidsrum overlapper - bruges til at forhindre dobbeltbookinger.
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(aEnd) > timeToMinutes(bStart);
}

// Finder alle datoer i et datointerval, hvor der er mindst en ledig starttid
// for den angivne varighed. Bruges til at markere dage med ledige tider i
// kalenderen paa booking-siden.
export async function getAvailableDatesInRange(
  fromDate: string,
  toDate: string,
  durationMinutes: number
): Promise<string[]> {
  const [windows, bookings] = await Promise.all([
    prisma.availabilityWindow.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
    }),
    prisma.booking.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
    }),
  ]);

  const { date: today, time: nowTime } = getNowInCopenhagen();
  const nowMinutes = timeToMinutes(nowTime);

  const windowsByDate = new Map<string, typeof windows>();
  for (const w of windows) {
    const list = windowsByDate.get(w.date) ?? [];
    list.push(w);
    windowsByDate.set(w.date, list);
  }

  const bookingsByDate = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const list = bookingsByDate.get(b.date) ?? [];
    list.push(b);
    bookingsByDate.set(b.date, list);
  }

  const availableDates: string[] = [];

  for (const [date, dateWindows] of windowsByDate) {
    const candidateStarts = new Set<number>();

    for (const window of dateWindows) {
      const windowStart = timeToMinutes(window.startTime);
      const windowEnd = timeToMinutes(window.endTime);

      for (
        let start = windowStart;
        start + durationMinutes <= windowEnd;
        start += SLOT_STEP_MINUTES
      ) {
        if (date === today && start <= nowMinutes) continue;
        candidateStarts.add(start);
      }
    }

    if (candidateStarts.size === 0) continue;

    const dateBookings = bookingsByDate.get(date) ?? [];
    const bookedRanges = dateBookings.map((booking) => ({
      start: timeToMinutes(booking.startTime),
      end: timeToMinutes(booking.endTime),
    }));

    const hasOpenSlot = [...candidateStarts].some((start) => {
      const end = start + durationMinutes;
      return !bookedRanges.some(
        (booked) => start < booked.end && end > booked.start
      );
    });

    if (hasOpenSlot) {
      availableDates.push(date);
    }
  }

  return availableDates.sort();
}
