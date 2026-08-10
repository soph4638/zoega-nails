import { Resend } from "resend";
import { CONTACT_INFO, EMAIL_CONFIG } from "@/lib/site-config";

// Denne fil sender bekræftelses- og påmindelses-mails via Resend.
// Al tekst i emails herunder kan roligt rettes - det er almindelig dansk tekst
// (ikke kode), så du kan ændre ordlyden når som helst.
//
// For at mails rent faktisk bliver sendt, skal miljøvariablen RESEND_API_KEY
// være sat i Vercel (Settings -> Environment Variables). Mangler den, logges
// blot en fejl i Vercels logs, og resten af booking-flowet fortsætter som
// normalt (kunden kan stadig booke, selvom mailen ikke kunne sendes).
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type BookingEmailInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  priceKr: number;
};

// Fælles bund-tekst med kontaktoplysninger, brugt i begge mails herunder.
function contactFooterHtml(): string {
  return `
    <p style="margin-top:24px;font-size:14px;color:#6b6b6b;">
      Spørgsmål? Kontakt mig på Instagram
      <a href="${CONTACT_INFO.instagramUrl}" style="color:#a8677d;">${CONTACT_INFO.instagramHandle}</a>
      eller SMS/ring på ${CONTACT_INFO.phoneNumber}.
    </p>
  `;
}

// Fælles ramme/design omkring alle emails.
function wrapEmailHtml(titleText: string, bodyHtml: string): string {
  return `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;background:#fdf8f3;border-radius:16px;">
      <h1 style="font-size:22px;color:#3a2e2e;margin-bottom:16px;">${titleText}</h1>
      ${bodyHtml}
    </div>
  `;
}

// Sendes lige efter en kunde har booket en tid.
export async function sendBookingConfirmationEmail(booking: BookingEmailInput): Promise<void> {
  if (!resend) {
    console.error("RESEND_API_KEY mangler - bekræftelses-mail blev ikke sendt.");
    return;
  }

  // ---- Ret gerne emne-linjen og teksten herunder ----
  const subject = `Din tid hos Zoega Nails er bekræftet - ${booking.date} kl. ${booking.startTime}`;

  const bodyHtml = `
    <p style="font-size:16px;color:#3a2e2e;">Hej ${booking.customerName},</p>
    <p style="font-size:16px;color:#3a2e2e;">Din tid er booket! Her er detaljerne:</p>
    <div style="background:#ffffff;border:1px solid #e7ddd3;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:16px;color:#3a2e2e;"><strong>${booking.serviceName}</strong></p>
      <p style="margin:4px 0 0;font-size:15px;color:#6b6b6b;">${booking.date} kl. ${booking.startTime}–${booking.endTime}</p>
      <p style="margin:4px 0 0;font-size:15px;color:#6b6b6b;">${booking.priceKr} kr. - betales kontant ved fremmøde</p>
    </div>
    ${contactFooterHtml()}
  `;
  // ---- Slut på tekst der kan rettes ----

  try {
    await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: booking.customerEmail,
      subject,
      html: wrapEmailHtml("Din tid er booket! ✓", bodyHtml),
    });
  } catch (error) {
    console.error("Kunne ikke sende bekræftelses-mail:", error);
  }
}

// Sendes til dig selv (EMAIL_CONFIG.ownerEmail), hver gang en kunde booker en
// tid, så du får besked med det samme uden at skulle tjekke admin-siden.
export async function sendOwnerBookingNotificationEmail(booking: BookingEmailInput): Promise<void> {
  if (!resend) {
    console.error("RESEND_API_KEY mangler - notifikations-mail til dig blev ikke sendt.");
    return;
  }

  const subject = `Ny booking: ${booking.customerName} - ${booking.date} kl. ${booking.startTime}`;

  const bodyHtml = `
    <p style="font-size:16px;color:#3a2e2e;">Du har fået en ny booking:</p>
    <div style="background:#ffffff;border:1px solid #e7ddd3;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:16px;color:#3a2e2e;"><strong>${booking.serviceName}</strong></p>
      <p style="margin:4px 0 0;font-size:15px;color:#6b6b6b;">${booking.date} kl. ${booking.startTime}–${booking.endTime}</p>
      <p style="margin:4px 0 0;font-size:15px;color:#6b6b6b;">${booking.priceKr} kr.</p>
    </div>
    <p style="font-size:15px;color:#3a2e2e;">
      <strong>Kunde:</strong> ${booking.customerName}<br/>
      <strong>Telefon:</strong> ${booking.customerPhone ?? "(ikke oplyst)"}<br/>
      <strong>Email:</strong> ${booking.customerEmail || "(ikke oplyst)"}
    </p>
  `;

  try {
    await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: EMAIL_CONFIG.ownerEmail,
      subject,
      html: wrapEmailHtml("Ny booking! 💅", bodyHtml),
    });
  } catch (error) {
    console.error("Kunne ikke sende notifikations-mail til dig:", error);
  }
}

// Sendes ca. 24 timer før en booking, af cron-jobbet i app/api/cron/reminders.
export async function sendBookingReminderEmail(booking: BookingEmailInput): Promise<void> {
  if (!resend) {
    console.error("RESEND_API_KEY mangler - påmindelses-mail blev ikke sendt.");
    return;
  }

  // ---- Ret gerne emne-linjen og teksten herunder ----
  const subject = `Påmindelse: Din tid hos Zoega Nails er i morgen kl. ${booking.startTime}`;

  const bodyHtml = `
    <p style="font-size:16px;color:#3a2e2e;">Hej ${booking.customerName},</p>
    <p style="font-size:16px;color:#3a2e2e;">Bare en lille påmindelse om din kommende tid:</p>
    <div style="background:#ffffff;border:1px solid #e7ddd3;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:16px;color:#3a2e2e;"><strong>${booking.serviceName}</strong></p>
      <p style="margin:4px 0 0;font-size:15px;color:#6b6b6b;">${booking.date} kl. ${booking.startTime}–${booking.endTime}</p>
      <p style="margin:4px 0 0;font-size:15px;color:#6b6b6b;">${booking.priceKr} kr. - betales kontant ved fremmøde</p>
    </div>
    <p style="font-size:15px;color:#3a2e2e;">Vi glæder os til at se dig!</p>
    ${contactFooterHtml()}
  `;
  // ---- Slut på tekst der kan rettes ----

  try {
    await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: booking.customerEmail,
      subject,
      html: wrapEmailHtml("Påmindelse om din tid 💅", bodyHtml),
    });
  } catch (error) {
    console.error("Kunne ikke sende påmindelses-mail:", error);
  }
}
