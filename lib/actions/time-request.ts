"use server";

import { prisma } from "@/lib/prisma";
import { addMinutesToTime, isAtLeast24HoursAway } from "@/lib/availability";
import { validateCustomerFields, type CustomerFieldsInput } from "@/lib/booking-validation";
import { sendOwnerTimeRequestEmail } from "@/lib/email";

export type TimeRequestResult =
  | {
      success: true;
      request: {
        date: string;
        startTime: string;
        serviceName: string;
      };
    }
  | { success: false; error: string };

// Gemmer en tidsanmodning ("Foreslå en tid") med status "afventer".
// Der oprettes IKKE en booking her - heller ikke selvom tiden faktisk er ledig.
// Tiden bliver først booket, når du trykker "Bekræft" i admin.
export async function createTimeRequest(input: CustomerFieldsInput): Promise<TimeRequestResult> {
  const validation = validateCustomerFields(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }
  const { service, customerName, customerPhone, customerEmail, message, imageUrl } =
    validation.fields;

  // Samme 24-timers-regel som ved en normal booking.
  if (!isAtLeast24HoursAway(input.date, input.startTime)) {
    return {
      success: false,
      error:
        "Den ønskede tid skal ligge mindst 24 timer ude i fremtiden. Vælg venligst en senere tid.",
    };
  }

  const endTime = addMinutesToTime(input.startTime, service.durationMinutes);
  if (endTime > "24:00") {
    return {
      success: false,
      error: "Behandlingen skal kunne nå at slutte inden midnat. Vælg venligst et tidligere klokkeslæt.",
    };
  }

  const request = await prisma.timeRequest.create({
    data: {
      status: "afventer",
      date: input.date,
      startTime: input.startTime,
      endTime,
      serviceId: service.id,
      serviceName: service.name,
      priceKr: service.priceKr,
      durationMin: service.durationMinutes,
      customerName,
      customerPhone,
      customerEmail,
      message,
      imageUrl,
    },
  });

  // Mail til dig, så du ved der ligger en anmodning og venter i admin.
  await sendOwnerTimeRequestEmail({
    customerName: request.customerName,
    customerPhone: request.customerPhone,
    customerEmail: request.customerEmail,
    serviceName: request.serviceName,
    date: request.date,
    startTime: request.startTime,
    endTime: request.endTime,
    priceKr: request.priceKr,
    message: request.message,
    imageUrl: request.imageUrl,
  });

  return {
    success: true,
    request: {
      date: request.date,
      startTime: request.startTime,
      serviceName: request.serviceName,
    },
  };
}
