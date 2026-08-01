import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminderEmail } from "@/lib/email";
import { getNowInCopenhagen, addDaysToDateString } from "@/lib/availability";

// Dette endpoint kaldes automatisk en gang i døgnet af Vercel Cron (se
// vercel.json). Det finder alle bookinger, der ligger "i morgen" (dansk tid),
// og som ikke allerede har fået en påmindelses-mail, og sender en påmindelse.
//
// Sikkerhed: Vercel sender automatisk header'en "Authorization: Bearer
// <CRON_SECRET>" med, når den kalder cron-jobbet. Vi tjekker den herunder,
// så andre ikke kan kalde endpointet og udløse påmindelser manuelt.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date: todayDate } = getNowInCopenhagen();
  const tomorrowDate = addDaysToDateString(todayDate, 1);

  const bookings = await prisma.booking.findMany({
    where: {
      date: tomorrowDate,
      reminderSentAt: null,
    },
  });

  let sentCount = 0;

  for (const booking of bookings) {
    // Springer bookinger uden email over (fx gamle test-bookinger fra før
    // email-feltet blev tilføjet) - der er intet at sende til.
    if (!booking.customerEmail) continue;

    await sendBookingReminderEmail({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      serviceName: booking.serviceName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      priceKr: booking.priceKr,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { reminderSentAt: new Date() },
    });

    sentCount += 1;
  }

  return NextResponse.json({ ok: true, checked: bookings.length, sent: sentCount });
}
