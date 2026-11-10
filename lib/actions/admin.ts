"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rangesOverlap } from "@/lib/availability";
import { sendBookingConfirmationEmail } from "@/lib/email";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
  isAdminAuthenticated,
} from "@/lib/auth";

export type LoginState = { error?: string };

// Tjekker kodeordet og logger ind, hvis det er korrekt.
// Bruges sammen med useActionState i login-formularen.
export async function adminLogin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!checkPassword(password)) {
    return { error: "Forkert kodeord." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    // Serverfunktioner kan tilgås direkte, så vi tjekker altid login her -
    // ikke kun i siden der viser knappen.
    throw new Error("Du skal være logget ind som admin for at gøre dette.");
  }
}

// Opretter et nyt ledigt tidsrum, som kunder kan booke ind på.
export async function addAvailabilityWindow(formData: FormData) {
  await requireAdmin();

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (!date || !startTime || !endTime || startTime >= endTime) {
    throw new Error(
      "Udfyld dato, start- og sluttidspunkt korrekt (starttid skal være før sluttid)."
    );
  }

  await prisma.availabilityWindow.create({ data: { date, startTime, endTime } });
  revalidatePath("/admin");
}

// Fjerner et ledigt tidsrum igen, fx hvis det blev tastet forkert.
export async function deleteAvailabilityWindow(id: string) {
  await requireAdmin();
  await prisma.availabilityWindow.delete({ where: { id } });
  revalidatePath("/admin");
}

// Annullerer en booking, fx hvis en kunde selv har afbudt telefonisk.
export async function deleteBooking(id: string) {
  await requireAdmin();
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/admin");
}

// -----------------------------------------------------------------------
// Tidsanmodninger ("Foreslå en tid")
// -----------------------------------------------------------------------

// Bekræfter en tidsanmodning: opretter en helt almindelig Booking med de samme
// oplysninger (samme varighed ud fra behandlingen), så tiden bliver optaget i
// kalenderen. Kunden får samme bekræftelsesmail som ved en normal booking.
//
// allowOverlap: true betyder at du allerede har set advarslen om at tiden
// overlapper en anden booking, og har valgt at fortsætte alligevel.
export async function confirmTimeRequest(id: string, allowOverlap: boolean) {
  await requireAdmin();

  const booking = await prisma.$transaction(async (tx) => {
    const request = await tx.timeRequest.findUnique({ where: { id } });
    if (!request || request.status !== "afventer") {
      throw new Error("Anmodningen findes ikke, eller er allerede behandlet.");
    }

    if (!allowOverlap) {
      const sameDayBookings = await tx.booking.findMany({ where: { date: request.date } });
      const hasConflict = sameDayBookings.some((existing) =>
        rangesOverlap(request.startTime, request.endTime, existing.startTime, existing.endTime)
      );
      if (hasConflict) {
        throw new Error(
          "Denne tid overlapper med en anden booking. Gå tilbage til admin og prøv igen."
        );
      }
    }

    const created = await tx.booking.create({
      data: {
        date: request.date,
        startTime: request.startTime,
        endTime: request.endTime,
        serviceId: request.serviceId,
        serviceName: request.serviceName,
        priceKr: request.priceKr,
        durationMin: request.durationMin,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        message: request.message,
        imageUrl: request.imageUrl,
      },
    });

    await tx.timeRequest.update({
      where: { id },
      data: { status: "bekræftet", bookingId: created.id },
    });

    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  // Præcis som ved en normal booking: bekræftelsesmailen sendes kun, hvis
  // kunden har oplyst en email.
  if (booking.customerEmail) {
    await sendBookingConfirmationEmail({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      serviceName: booking.serviceName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      priceKr: booking.priceKr,
    });
  }

  revalidatePath("/admin");
}

// Afslår en tidsanmodning. Der sendes INGEN mail - du skriver selv til kunden.
export async function declineTimeRequest(id: string) {
  await requireAdmin();
  await prisma.timeRequest.updateMany({
    where: { id, status: "afventer" },
    data: { status: "afslået" },
  });
  revalidatePath("/admin");
}
