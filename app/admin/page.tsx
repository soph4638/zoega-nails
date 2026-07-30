import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { getTodayDateInCopenhagen } from "@/lib/availability";
import {
  addAvailabilityWindow,
  adminLogout,
  deleteAvailabilityWindow,
  deleteBooking,
} from "@/lib/actions/admin";

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
                    <button type="submit" className="shrink-0 text-sm text-red-600 hover:underline">
                      Annullér
                    </button>
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
