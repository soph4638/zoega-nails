"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { services, formatDuration, getServiceById } from "@/lib/services";
import { createBooking } from "@/lib/actions/booking";
import { createTimeRequest } from "@/lib/actions/time-request";
import DatePicker from "@/components/DatePicker";
import { CONTACT_INFO } from "@/lib/site-config";

type Step = 1 | 2 | 3 | 4;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

// Dagens dato i "YYYY-MM-DD"-format, brugt som minimum-dato i datovælgeren.
function getTodayDateString(): string {
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
return `${year}-${month}-${day}`;
}

// Morgendagens dato i "YYYY-MM-DD" - tidligste dato man kan foreslå en tid på
// (samme 24-timers-regel som ved en normal booking).
function getTomorrowDateString(): string {
const now = new Date();
now.setDate(now.getDate() + 1);
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
return `${year}-${month}-${day}`;
}

// Skriver en dato som "fredag 20. november" i stedet for "2026-11-20".
function formatDanishDate(dateStr: string): string {
const [y, m, d] = dateStr.split("-").map(Number);
if (!y || !m || !d) return dateStr;
return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("da-DK", {
weekday: "long",
day: "numeric",
month: "long",
timeZone: "UTC",
});
}

export default function BookingWizard({
initialServiceId = null,
}: {
initialServiceId?: string | null;
} = {}) {
const [step, setStep] = useState<Step>(1);

const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
const [date, setDate] = useState<string>("");
const [time, setTime] = useState<string | null>(null);

const [slots, setSlots] = useState<string[]>([]);
const [loadingSlots, setLoadingSlots] = useState(false);
const [slotsError, setSlotsError] = useState<string | null>(null);
// Tælles op for at hente ledige tider igen (fx hvis en tid lige er blevet taget)
const [slotsRefresh, setSlotsRefresh] = useState(0);

const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [message, setMessage] = useState("");
const [imageFile, setImageFile] = useState<File | null>(null);
const [imageError, setImageError] = useState<string | null>(null);

const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
const [confirmedBooking, setConfirmedBooking] = useState<
Extract<Awaited<ReturnType<typeof createBooking>>, { success: true }>["booking"] | null
>(null);

// "Foreslå en tid": kunden vælger selv dato + klokkeslæt. Det bliver en
// anmodning, som først er booket, når Sophie har bekræftet den i admin.
const [isRequest, setIsRequest] = useState(false);
const [requestDate, setRequestDate] = useState("");
const [requestTime, setRequestTime] = useState("");
const [requestSent, setRequestSent] = useState(false);

const selectedService = serviceId ? getServiceById(serviceId) : undefined;
const requestMinDate = useMemo(() => getTomorrowDateString(), []);
const minDate = useMemo(() => getTodayDateString(), []);

// Henter ledige tider, hver gang dato eller valgt tjeneste ændres.
useEffect(() => {
if (!date || !serviceId) return;

let cancelled = false;
// Nulstiller status og den tidligere valgte tid, når dato/tjeneste ændres,
// og starter derefter en ny hentning af ledige tider herunder.
// eslint-disable-next-line react-hooks/set-state-in-effect
setLoadingSlots(true);
setSlotsError(null);
setTime(null);

fetch(`/api/availability?date=${date}&serviceId=${serviceId}`)
.then((res) => res.json())
.then((data) => {
if (cancelled) return;
if (data.error) {
setSlotsError(data.error);
setSlots([]);
} else {
setSlots(data.slots ?? []);
}
})
.catch(() => {
if (!cancelled) setSlotsError("Kunne ikke hente ledige tider. Prøv igen.");
})
.finally(() => {
if (!cancelled) setLoadingSlots(false);
});

return () => {
cancelled = true;
};
}, [date, serviceId, slotsRefresh]);

function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
const file = e.target.files?.[0] ?? null;
if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
setImageError("Kun JPG- og PNG-billeder er tilladt.");
setImageFile(null);
e.target.value = "";
return;
}
setImageError(null);
setImageFile(file);
}

async function handleConfirm() {
if (isRequest) {
await handleSendRequest();
return;
}
if (!serviceId || !date || !time) return;
setSubmitting(true);
setSubmitError(null);
setImageError(null);

let imageUrl: string | undefined;
if (imageFile) {
try {
const uploadFormData = new FormData();
uploadFormData.append("file", imageFile);
const uploadRes = await fetch("/api/upload", {
method: "POST",
body: uploadFormData,
});
const uploadData = await uploadRes.json();
if (!uploadRes.ok) {
setSubmitting(false);
setImageError(uploadData.error ?? "Kunne ikke uploade billedet. Prøv igen.");
return;
}
imageUrl = uploadData.url;
} catch {
setSubmitting(false);
setImageError("Kunne ikke uploade billedet. Prøv igen.");
return;
}
}

const result = await createBooking({
serviceId,
date,
startTime: time,
customerName,
customerPhone,
message,
imageUrl,
});

setSubmitting(false);

if (!result.success) {
setSubmitError(result.error);
// Tiden er sandsynligvis ikke længere ledig - gå tilbage og hent friske tider.
setStep(2);
setTime(null);
setSlotsRefresh((n) => n + 1); // henter friske ledige tider
return;
}

setConfirmedBooking(result.booking);
setStep(4);
}

// Sender en tidsanmodning ("Foreslå en tid") med de samme felter som en
// normal booking. Der bookes ikke noget - Sophie bekræfter den selv i admin.
async function handleSendRequest() {
if (!serviceId || !requestDate || !requestTime) return;
setSubmitting(true);
setSubmitError(null);
setImageError(null);

let imageUrl: string | undefined;
if (imageFile) {
try {
const uploadFormData = new FormData();
uploadFormData.append("file", imageFile);
const uploadRes = await fetch("/api/upload", {
method: "POST",
body: uploadFormData,
});
const uploadData = await uploadRes.json();
if (!uploadRes.ok) {
setSubmitting(false);
setImageError(uploadData.error ?? "Kunne ikke uploade billedet. Prøv igen.");
return;
}
imageUrl = uploadData.url;
} catch {
setSubmitting(false);
setImageError("Kunne ikke uploade billedet. Prøv igen.");
return;
}
}

try {
const result = await createTimeRequest({
serviceId,
date: requestDate,
startTime: requestTime,
customerName,
customerPhone,
message,
imageUrl,
});
setSubmitting(false);
if (!result.success) {
setSubmitError(result.error);
return;
}
setRequestSent(true);
setStep(4);
} catch {
setSubmitting(false);
setSubmitError("Anmodningen kunne ikke sendes. Prøv igen.");
}
}

return (
<div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-16">
{step < 4 && (
<p className="mb-6 text-center text-sm font-medium tracking-wide text-accent">
Trin {step} af 3
</p>
)}

{step === 1 && (
<section>
<h1 className="mb-6 text-center font-serif text-3xl text-ink">Vælg tjeneste</h1>
<p className="mb-6 rounded-xl bg-white/70 px-4 py-3 text-center text-sm text-ink/70">
Er du i tvivl om, hvilken kategori dit design hører under? Så kontakt mig gerne på
Instagram{" "}
<a
href="https://www.instagram.com/zoeganails"
target="_blank"
rel="noopener noreferrer"
className="font-medium text-accent-dark underline"
>
@zoeganails
</a>{" "}
💅
</p>
<div className="flex flex-col gap-3">
{services.map((service) => (
<button
key={service.id}
type="button"
onClick={() => setServiceId(service.id)}
className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
serviceId === service.id
? "border-ink bg-cream"
: "border-beige bg-white hover:border-accent/50"
}`}
>
<p className="font-medium text-ink">{service.name}</p>
<p className="mt-1 text-sm text-ink/60">
{formatDuration(service.durationMinutes)} · {service.priceKr} kr.
</p>
</button>
))}
</div>
<button
type="button"
disabled={!serviceId}
onClick={() => setStep(2)}
className="mt-8 w-full rounded-full bg-accent px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
>
Næste
</button>
</section>
)}

{step === 2 && selectedService && !isRequest && (
<section>
<h1 className="mb-2 text-center font-serif text-3xl text-ink">Vælg dato og tid</h1>
<p className="mb-6 text-center text-sm text-ink/60">
{selectedService.name} · {formatDuration(selectedService.durationMinutes)}
</p>

{submitError && !isRequest && (
<p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-red-700">
{submitError}
</p>
)}

<label className="mb-2 block text-sm font-medium text-ink">Dato</label>
<DatePicker value={date} onChange={setDate} minDate={minDate} serviceId={serviceId} />

<div className="mt-6">
{loadingSlots && <p className="text-center text-ink/60">Henter ledige tider…</p>}
{slotsError && <p className="text-center text-red-600">{slotsError}</p>}
{!loadingSlots && !slotsError && date && slots.length === 0 && (
<p className="text-center text-ink/60">
Ingen ledige tider denne dag. Prøv en anden dato.
</p>
)}
{!loadingSlots && date && slots.length > 0 && (
<div className="grid grid-cols-3 gap-2">
{slots.map((slot) => (
<button
key={slot}
type="button"
onClick={() => setTime(slot)}
className={`rounded-xl border px-3 py-3 text-center transition-colors ${
time === slot
? "border-ink bg-ink font-medium text-white"
: "border-beige bg-white hover:border-accent/50"
}`}
>
{slot}
</button>
))}
</div>
)}
</div>

<button
type="button"
onClick={() => {
setIsRequest(true);
setSubmitError(null);
}}
className="mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-ink bg-white px-5 py-4 text-left transition-all hover:bg-cream active:scale-[0.98]"
>
<span>
<span className="block text-xs text-ink/60">Kan du ikke finde en tid, der passer?</span>
<span className="mt-0.5 block text-base font-semibold text-ink">Foreslå din egen tid</span>
</span>
<span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-lg text-white">→</span>
</button>

<div className="mt-8 flex gap-3">
<button
type="button"
onClick={() => setStep(1)}
className="w-1/3 rounded-full border border-beige px-4 py-4 text-ink transition-colors hover:border-accent/50"
>
Tilbage
</button>
<button
type="button"
disabled={!time}
onClick={() => setStep(3)}
className="w-2/3 rounded-full bg-accent px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
>
Næste
</button>
</div>
</section>
)}

{step === 2 && selectedService && isRequest && (
<section>
<h1 className="mb-2 text-center font-serif text-3xl text-ink">Foreslå en tid</h1>
<p className="mb-6 text-center text-sm text-ink/60">
{selectedService.name} · {formatDuration(selectedService.durationMinutes)}
</p>

<p className="mb-6 rounded-xl bg-white/70 px-4 py-3 text-center text-sm text-ink/70">
Vælg den dag og det klokkeslæt, der passer dig. Det er en anmodning - tiden er først
booket, når jeg har bekræftet den.
</p>

<div className="flex flex-col gap-4">
<div>
<label htmlFor="request-date" className="mb-1 block text-sm font-medium text-ink">
Dato
</label>
<input
id="request-date"
type="date"
required
min={requestMinDate}
value={requestDate}
onChange={(e) => setRequestDate(e.target.value)}
className="block w-full min-h-[3.25rem] appearance-none rounded-xl border border-beige bg-white px-4 py-3 text-base text-ink"
/>
</div>
<div>
<label htmlFor="request-time" className="mb-1 block text-sm font-medium text-ink">
Klokkeslæt
</label>
<input
id="request-time"
type="time"
required
step={900}
value={requestTime}
onChange={(e) => setRequestTime(e.target.value)}
className="block w-full min-h-[3.25rem] appearance-none rounded-xl border border-beige bg-white px-4 py-3 text-base text-ink"
/>
</div>
{requestDate && requestDate < requestMinDate && (
<p className="text-center text-sm text-red-600">
Vælg venligst en dato fra i morgen og frem.
</p>
)}
</div>

<div className="mt-8 flex gap-3">
<button
type="button"
onClick={() => setIsRequest(false)}
className="w-1/3 rounded-full border border-beige px-4 py-4 text-ink transition-colors hover:border-accent/50"
>
Tilbage
</button>
<button
type="button"
disabled={!requestDate || !requestTime || requestDate < requestMinDate}
onClick={() => setStep(3)}
className="w-2/3 rounded-full bg-accent px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
>
Næste
</button>
</div>
</section>
)}

{step === 3 && selectedService && (
<section>
<h1 className="mb-2 text-center font-serif text-3xl text-ink">Dine oplysninger</h1>
<p className="mb-6 text-center text-sm text-ink/60">
{isRequest
? `Ønsket tid: ${selectedService.name} · ${formatDanishDate(requestDate)} kl. ${requestTime}`
: `${selectedService.name} · ${formatDanishDate(date)} kl. ${time}`}
</p>

{submitError && (
<p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-red-700">
{submitError}
</p>
)}

<form
onSubmit={(e) => {
e.preventDefault();
handleConfirm();
}}
className="flex flex-col gap-4"
>
<div>
<label htmlFor="customer-name" className="mb-1 block text-sm font-medium text-ink">Navn</label>
<input
id="customer-name"
required
type="text"
autoComplete="name"
value={customerName}
onChange={(e) => setCustomerName(e.target.value)}
className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
/>
</div>
<div>
<label htmlFor="customer-contact" className="mb-1 block text-sm font-medium text-ink">
Telefonnummer eller Instagram-navn
</label>
<input
id="customer-contact"
required
type="text"
autoComplete="tel"
placeholder="Så jeg kan kontakte dig"
value={customerPhone}
onChange={(e) => setCustomerPhone(e.target.value)}
className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
/>
</div>
<div>
<label htmlFor="customer-message" className="mb-1 block text-sm font-medium text-ink">
Besked (valgfri) - fx ønsket design
</label>
<textarea
id="customer-message"
value={message}
onChange={(e) => setMessage(e.target.value)}
rows={3}
className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
/>
</div>
<div>
<label htmlFor="customer-image" className="mb-1 block text-sm font-medium text-ink">
Billede af ønsket design (valgfrit)
</label>
<input
id="customer-image"
type="file"
accept="image/png, image/jpeg"
onChange={handleImageChange}
className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-white"
/>
{imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
</div>

<p className="rounded-xl bg-cream px-4 py-3 text-sm text-ink/70">
Betaling foregår ved fremmøde.
</p>

<div className="mt-2 flex gap-3">
<button
type="button"
onClick={() => setStep(2)}
className="w-1/3 rounded-full border border-beige px-4 py-4 text-ink transition-colors hover:border-accent/50"
>
Tilbage
</button>
<button
type="submit"
disabled={submitting}
className="w-2/3 rounded-full bg-accent px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
>
{isRequest
? submitting
? "Sender…"
: "Send anmodning"
: submitting
? "Bekræfter…"
: "Bekræft booking"}
</button>
</div>
</form>
</section>
)}

{step === 4 && requestSent && (
<section className="text-center">
<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-baby text-3xl text-ink">
✓
</div>
<h1 className="mb-2 font-serif text-3xl text-ink">Anmodning sendt</h1>
<p className="mb-6 text-ink/70">
Tak! Din anmodning er sendt. Du hører fra mig, når tiden er bekræftet.
</p>

<div className="rounded-2xl border border-beige bg-white px-6 py-5 text-left">
<p className="font-medium text-ink">{selectedService?.name}</p>
<p className="mt-1 text-ink/70">
Ønsket tid: {formatDanishDate(requestDate)} kl. {requestTime}
</p>
<p className="mt-1 text-sm text-ink/60">Afventer bekræftelse - tiden er ikke booket endnu.</p>
</div>

<p className="mt-6 rounded-xl bg-white/70 px-4 py-3 text-sm text-ink/70">
Spørgsmål? Kontakt mig på Instagram{" "}
<a
href={CONTACT_INFO.instagramUrl}
target="_blank"
rel="noopener noreferrer"
className="font-medium text-accent-dark underline"
>
{CONTACT_INFO.instagramHandle}
</a>
{CONTACT_INFO.phoneNumber ? ` eller SMS/ring på ${CONTACT_INFO.phoneNumber}` : ""}.
</p>

<Link
href="/"
className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark"
>
Til forsiden
</Link>
</section>
)}

{step === 4 && confirmedBooking && (
<section className="text-center">
<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-baby text-3xl text-ink">
✓
</div>
<h1 className="mb-2 font-serif text-3xl text-ink">Din tid er booket!</h1>
<p className="mb-6 text-ink/70">Vi glæder os til at se dig.</p>

<div className="rounded-2xl border border-beige bg-white px-6 py-5 text-left">
<p className="font-medium text-ink">{confirmedBooking.serviceName}</p>
<p className="mt-1 text-ink/70">
{formatDanishDate(confirmedBooking.date)} kl. {confirmedBooking.startTime}–{confirmedBooking.endTime}
</p>
<p className="mt-1 text-ink/70">{confirmedBooking.priceKr} kr. - betales ved fremmøde</p>
</div>
  <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-ink/70">
  Du modtager ikke en bekræftelses-sms eller e-mail – men tiden herover er bekræftet og booket.
  </p>

<p className="mt-6 rounded-xl bg-white/70 px-4 py-3 text-sm text-ink/70">
Spørgsmål? Kontakt mig på Instagram{" "}
<a
href={CONTACT_INFO.instagramUrl}
target="_blank"
rel="noopener noreferrer"
className="font-medium text-accent-dark underline"
>
{CONTACT_INFO.instagramHandle}
</a>
{CONTACT_INFO.phoneNumber ? ` eller SMS/ring på ${CONTACT_INFO.phoneNumber}` : ""}.
</p>

<Link
href="/"
className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark"
>
Til forsiden
</Link>
</section>
)}
</div>
);
}
