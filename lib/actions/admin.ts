"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
