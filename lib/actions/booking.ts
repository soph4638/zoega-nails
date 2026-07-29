"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServiceById } from "@/lib/services";
import { addMinutesToTime, rangesOverlap } from "@/lib/availability";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export type BookingInput = {
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  message?: string;
};

export type BookingResult =
  | {
      success: true;
      booking: {
        date: string;
        startTime: string;
        endTime: string;
        serviceName: string;
        priceKr: number;
      };
    }
  | { success: false; error: string };

// Kastes internt når det ønskede tidsrum ikke (længere) kan bookes.
class BookingConflictError extends Error {}

// Opretter en booking. Tjekker lige inden vi gemmer - inde i en database-
// transaktion - at tiden stadig er ledig, så to kunder ikke kan ende med at
// booke det samme tidsrum, selvom de begge har siden åben samtidig.
export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const service = getServiceById(input.serviceId);
  if (!service) {
    return { success: false, error: "Ukendt tjeneste." };
  }
  if (!DATE_REGEX.test(input.date) || !TIME_REGEX.test(input.startTime)) {
    return { success: false, error: "Ugyldig dato eller tidspunkt." };
  }

  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  if (!customerName || !customerPhone) {
    return { success: false, error: "Navn og telefonnummer er påkrævet." };
  }

  const endTime = addMinutesToTime(input.startTime, service.durationMinutes);

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const sameDayBookings = await tx.booking.findMany({
          where: { date: input.date },
        });
        const hasConflict = sameDayBookings.some((existing) =>
          rangesOverlap(input.startTime, endTime, existing.startTime, existing.endTime)
        );
        if (hasConflict) {
          throw new BookingConflictError(
            "Den valgte tid er desværre ikke længere ledig. Vælg venligst en anden tid."
          );
        }

        const windows = await tx.availabilityWindow.findMany({
          where: { date: input.date },
        });
        const isWithinOpenWindow = windows.some(
          (window) => window.startTime <= input.startTime && window.endTime >= endTime
        );
        if (!isWithinOpenWindow) {
          throw new BookingConflictError(
            "Den valgte tid ligger uden for åbningstiden. Vælg venligst en anden tid."
          );
        }

        return tx.booking.create({
          data: {
            date: input.date,
            startTime: input.startTime,
            endTime,
            serviceId: service.id,
            serviceName: service.name,
            priceKr: service.priceKr,
            durationMin: service.durationMinutes,
            customerName,
            customerPhone,
            message: input.message?.trim() || null,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return {
      success: true,
      booking: {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        serviceName: booking.serviceName,
        priceKr: booking.priceKr,
      },
    };
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return { success: false, error: error.message };
    }
    // P2034: Prisma-fejlkode for at en "serializable" transaktion løb ind i en
    // konflikt med en anden samtidig transaktion (dvs. en anden kunde booker
    // helt samme tidspunkt i samme øjeblik).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return {
        success: false,
        error: "Den valgte tid blev lige booket af en anden. Vælg venligst en anden tid.",
      };
    }
    throw error;
  }
}
