import { createHmac } from "crypto";
import { cookies } from "next/headers";

// -----------------------------------------------------------------------
// Simpelt password-baseret admin-login.
// Der er kun ét kodeord (gemt i miljøvariablen ADMIN_PASSWORD) - ingen
// brugerdatabase. Når kodeordet er korrekt, sætter vi en signeret cookie,
// så vi kan genkende at browseren er logget ind ved senere besøg.
// -----------------------------------------------------------------------

const COOKIE_NAME = "admin_session";
const SESSION_VALUE = "authenticated";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET mangler. Sæt den som miljøvariabel (se .env.example)."
    );
  }
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminPassword) && password === adminPassword;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${SESSION_VALUE}.${sign(SESSION_VALUE)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [value, signature] = token.split(".");
  return value === SESSION_VALUE && signature === sign(SESSION_VALUE);
}
