// Kontaktoplysninger vist på bekræftelsessiden efter en booking, og i emails.
// Ret trygt tallene/teksten herunder - de bruges automatisk på siden og i mails.
export const CONTACT_INFO = {
  // Dit Instagram-brugernavn (vises som tekst).
  instagramHandle: "@zoeganails",
  // Link til din Instagram-profil.
  instagramUrl: "https://www.instagram.com/zoeganails",
  // Dit telefonnummer - ret dette til dit eget nummer.
  phoneNumber: "12 34 56 78",
};

// -----------------------------------------------------------------------
// Email-indstillinger, bruges af lib/email.ts til at sende bekræftelses-
// og påmindelses-mails via Resend.
// -----------------------------------------------------------------------
export const EMAIL_CONFIG = {
  // Navnet der vises som afsender i kundens indbakke.
  fromName: "Zoega Nails",
  // Afsender-adressen. "onboarding@resend.dev" er Resends gratis test-adresse.
  // Den kan (indtil du verificerer dit eget domæne under "Domains" i Resend)
  // KUN sende til din egen email - den du oprettede Resend-kontoen med.
  // Har du et domæne (fx zoeganails.dk), kan du - efter at have verificeret det
  // under "Domains" i Resend - ændre denne til fx "booking@zoeganails.dk", så
  // mails kan sendes til alle kunder.
  fromEmail: "onboarding@resend.dev",
};
