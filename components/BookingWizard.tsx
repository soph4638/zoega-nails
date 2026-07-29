"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { services, formatDuration, getServiceById } from "@/lib/services";
import { createBooking } from "@/lib/actions/booking";

type Step = 1 | 2 | 3 | 4;

// Dagens dato i "YYYY-MM-DD"-format, brugt som minimum-dato i datovælgeren.
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingWizard() {
  const [step, setStep] = useState<Step>(1);

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<
    Extract<Awaited<ReturnType<typeof createBooking>>, { success: true }>["booking"] | null
  >(null);

  const selectedService = serviceId ? getServiceById(serviceId) : undefined;
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
  }, [date, serviceId]);

  async function handleConfirm() {
    if (!serviceId || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await createBooking({
      serviceId,
      date,
      startTime: time,
      customerName,
      customerPhone,
      message,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      // Tiden er sandsynligvis ikke længere ledig - gå tilbage og hent friske tider.
      setStep(2);
      setTime(null);
      setDate((current) => current); // trigger re-fetch af ledige tider via useEffect
      return;
    }

    setConfirmedBooking(result.booking);
    setStep(4);
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
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setServiceId(service.id)}
                className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                  serviceId === service.id
                    ? "border-accent bg-blush/50"
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

      {step === 2 && selectedService && (
        <section>
          <h1 className="mb-2 text-center font-serif text-3xl text-ink">Vælg dato og tid</h1>
          <p className="mb-6 text-center text-sm text-ink/60">
            {selectedService.name} · {formatDuration(selectedService.durationMinutes)}
          </p>

          <label className="mb-2 block text-sm font-medium text-ink">Dato</label>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
          />

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
                        ? "border-accent bg-blush/50 font-medium text-accent-dark"
                        : "border-beige bg-white hover:border-accent/50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

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

      {step === 3 && selectedService && (
        <section>
          <h1 className="mb-2 text-center font-serif text-3xl text-ink">Dine oplysninger</h1>
          <p className="mb-6 text-center text-sm text-ink/60">
            {selectedService.name} · {date} kl. {time}
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
              <label className="mb-1 block text-sm font-medium text-ink">Navn</label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Telefonnummer</label>
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Besked (valgfri) - fx ønsket design
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
              />
            </div>

            <p className="rounded-xl bg-beige/60 px-4 py-3 text-sm text-ink/70">
              Betaling foregår kontant ved fremmøde.
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
                {submitting ? "Bekræfter…" : "Bekræft booking"}
              </button>
            </div>
          </form>
        </section>
      )}

      {step === 4 && confirmedBooking && (
        <section className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush text-3xl text-accent-dark">
            ✓
          </div>
          <h1 className="mb-2 font-serif text-3xl text-ink">Din tid er booket!</h1>
          <p className="mb-6 text-ink/70">Vi glæder os til at se dig.</p>

          <div className="rounded-2xl border border-beige bg-white px-6 py-5 text-left">
            <p className="font-medium text-ink">{confirmedBooking.serviceName}</p>
            <p className="mt-1 text-ink/70">
              {confirmedBooking.date} kl. {confirmedBooking.startTime}–{confirmedBooking.endTime}
            </p>
            <p className="mt-1 text-ink/70">{confirmedBooking.priceKr} kr. - betales kontant ved fremmøde</p>
          </div>

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
