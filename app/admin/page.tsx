import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { getNowInCopenhagen, getTodayDateInCopenhagen, rangesOverlap } from "@/lib/availability";
import {
addAvailabilityWindow,
adminLogout,
deleteAvailabilityWindow,
deleteBooking,
confirmTimeRequest,
declineTimeRequest,
} from "@/lib/actions/admin";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default async function AdminPage() {
if (!(await isAdminAuthenticated())) {
redirect("/admin/login");
}

const today = getTodayDateInCopenhagen();

const [windows, bookings] = await Promise.all([
prisma.availabilityWindow.findMany({
where: { date: { gte: today } },
orderBy: [{ date: "asc" }, { startTime: "asc" }],
}),
prisma.booking.findMany({
where: { date: { gte: today } },
orderBy: [{ date: "asc" }, { startTime: "asc" }],
}),
]);

// Afventende tidsanmodninger. Anmodninger med en dato der er passeret skjules;
// er tidspunktet passeret i dag, markeres de som udløbet.
const timeRequests = await prisma.timeRequest.findMany({
where: { status: "afventer", date: { gte: today } },
orderBy: [{ date: "asc" }, { startTime: "asc" }],
});
const nowTime = getNowInCopenhagen().time;
const requestsWithInfo = timeRequests.map((request) => ({
request,
isExpired: request.date === today && request.startTime <= nowTime,
overlaps: bookings.some(
(booking) =>
booking.date === request.date &&
rangesOverlap(request.startTime, request.endTime, booking.startTime, booking.endTime)
),
}));

return (
<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
<div className="mb-10 flex items-center justify-between">
<h1 className="font-serif text-3xl text-ink">Admin</h1>
<form action={adminLogout}>
<button type="submit" className="text-sm text-ink/60 hover:text-accent">
Log ud
</button>
</form>
</div>

{/* Tidsanmodninger */}
<section className="mb-12">
<h2 className="mb-4 font-serif text-xl text-ink">
Tidsanmodninger
{requestsWithInfo.length > 0 && (
<span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 align-middle font-sans text-xs font-medium text-white">
{requestsWithInfo.length}
</span>
)}
</h2>
{requestsWithInfo.length === 0 ? (
<p className="text-ink/60">Ingen afventende tidsanmodninger.</p>
) : (
<ul className="flex flex-col gap-3">
{requestsWithInfo.map(({ request, isExpired, overlaps }) => (
<li
key={request.id}
className={`rounded-xl border bg-white px-4 py-4 ${isExpired ? "border-beige opacity-60" : "border-accent/40"}`}
>
<div className="flex flex-wrap items-center gap-2">
<p className="font-medium text-ink">
Ønsket: {request.date} · {request.startTime}–{request.endTime}
</p>
{isExpired && (
<span className="rounded-full bg-beige px-2 py-0.5 text-xs text-ink/70">Udløbet</span>
)}
</div>
<p className="text-sm text-ink/70">
{request.serviceName} · {request.priceKr} kr.
</p>
<p className="mt-2 text-ink">{request.customerName}</p>
<p className="text-sm text-ink/70">{request.customerPhone}</p>
{request.customerEmail && <p className="text-sm text-ink/70">{request.customerEmail}</p>}
{request.message && (
<p className="mt-2 text-sm italic text-ink/70">&ldquo;{request.message}&rdquo;</p>
)}
{request.imageUrl && (
<a href={request.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
src={request.imageUrl}
alt="Ønsket design fra kunden"
className="h-24 w-24 rounded-lg border border-beige object-cover"
/>
</a>
)}
{overlaps && !isExpired && (
<p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
Denne tid overlapper med en anden booking.
</p>
)}
<div className="mt-4 flex gap-3">
{!isExpired && (
<form action={confirmTimeRequest.bind(null, request.id, overlaps)} className="flex-1">
<ConfirmSubmitButton
confirmMessage={
overlaps
? `Denne tid overlapper med en anden booking. Vil du alligevel bekræfte tiden for ${request.customerName} (${request.date} kl. ${request.startTime})?`
: `Bekræft tiden for ${request.customerName} (${request.date} kl. ${request.startTime})? Den bliver til en booking i kalenderen.`
}
className="w-full rounded-full bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-dark"
>
Bekræft
</ConfirmSubmitButton>
</form>
)}
<form action={declineTimeRequest.bind(null, request.id)} className="flex-1">
<ConfirmSubmitButton
confirmMessage={`Afslå anmodningen fra ${request.customerName} (${request.date} kl. ${request.startTime})? Der sendes ingen mail - du skriver selv til kunden.`}
className="w-full rounded-full border border-beige px-4 py-3 text-ink transition-colors hover:border-accent/50"
>
Afslå
</ConfirmSubmitButton>
</form>
</div>
</li>
))}
</ul>
)}
</section>

{/* Tilføj ledig tid */}
<section className="mb-12 rounded-2xl border border-beige bg-white p-6">
<h2 className="mb-4 font-serif text-xl text-ink">Tilføj ledig tid</h2>
<form action={addAvailabilityWindow} className="flex flex-col gap-4 sm:flex-row sm:items-end">
<div className="flex-1">
<label className="mb-1 block text-sm font-medium text-ink">Dato</label>
<input
type="date"
name="date"
required
min={today}
className="w-full rounded-xl border border-beige bg-cream px-4 py-3 text-ink"
/>
</div>
<div className="flex-1">
<label className="mb-1 block text-sm font-medium text-ink">Fra</label>
<input
type="time"
name="startTime"
required
className="w-full rounded-xl border border-beige bg-cream px-4 py-3 text-ink"
/>
</div>
<div className="flex-1">
<label className="mb-1 block text-sm font-medium text-ink">Til</label>
<input
type="time"
name="endTime"
required
className="w-full rounded-xl border border-beige bg-cream px-4 py-3 text-ink"
/>
</div>
<button
type="submit"
className="rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-dark"
>
Tilføj
</button>
</form>
</section>

{/* Kommende ledige tidsrum */}
<section className="mb-12">
<h2 className="mb-4 font-serif text-xl text-ink">Kommende ledige tidsrum</h2>
{windows.length === 0 ? (
<p className="text-ink/60">Du har ikke lagt nogen ledige tider ud endnu.</p>
) : (
<ul className="flex flex-col gap-2">
{windows.map((window) => (
<li
key={window.id}
className="flex items-center justify-between rounded-xl border border-beige bg-white px-4 py-3"
>
<span className="text-ink">
{window.date} · {window.startTime}–{window.endTime}
</span>
<form action={deleteAvailabilityWindow.bind(null, window.id)}>
<button type="submit" className="text-sm text-red-600 hover:underline">
Slet
</button>
</form>
</li>
))}
</ul>
)}
</section>

{/* Kommende bookinger */}
<section>
<h2 className="mb-4 font-serif text-xl text-ink">Kommende bookinger</h2>
{bookings.length === 0 ? (
<p className="text-ink/60">Ingen kommende bookinger endnu.</p>
) : (
<ul className="flex flex-col gap-3">
{bookings.map((booking) => (
<li key={booking.id} className="rounded-xl border border-beige bg-white px-4 py-4">
<div className="flex items-start justify-between gap-4">
<div>
<p className="font-medium text-ink">
{booking.date} · {booking.startTime}–{booking.endTime}
</p>
<p className="text-sm text-ink/70">
{booking.serviceName} · {booking.priceKr} kr.
</p>
<p className="mt-2 text-ink">{booking.customerName}</p>
<p className="text-sm text-ink/70">{booking.customerPhone}</p>
  {booking.customerEmail && <p className="text-sm text-ink/70">{booking.customerEmail}</p>}
{booking.message && (
<p className="mt-2 text-sm italic text-ink/70">
&ldquo;{booking.message}&rdquo;
</p>
)}
{booking.imageUrl && (
<a
href={booking.imageUrl}
target="_blank"
rel="noopener noreferrer"
className="mt-3 inline-block"
>
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
src={booking.imageUrl}
alt="Ønsket design fra kunden"
className="h-24 w-24 rounded-lg border border-beige object-cover"
/>
</a>
)}
</div>
<form action={deleteBooking.bind(null, booking.id)}>
<ConfirmSubmitButton
confirmMessage={`Er du sikker på at du vil annullere bookingen for ${booking.customerName} (${booking.date} kl. ${booking.startTime})?`}
className="shrink-0 text-sm text-red-600 hover:underline"
>
Annullér
</ConfirmSubmitButton>
</form>
</div>
</li>
))}
</ul>
)}
</section>
</div>
);
}
