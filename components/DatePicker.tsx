"use client";

import { useEffect, useMemo, useState } from "react";

type DatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  minDate: string;
  serviceId: string | null;
};

const WEEKDAYS = ["M", "T", "O", "T", "F", "L", "S"];
const MONTH_NAMES = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];

function toDateString(year: number, month: number, day: number): string {
  return year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

// Kalender til at vaelge dato. Henter hvilke dage i den viste maaned der har
// ledige tider, og markerer dem med fed skrift og en cirkel.
export default function DatePicker({ value, onChange, minDate, serviceId }: DatePickerProps) {
  const initial = value || minDate;
  const [year, setYear] = useState(() => Number(initial.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(initial.slice(5, 7)));

  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const monthKey = year + "-" + String(month).padStart(2, "0");

  useEffect(() => {
    if (!serviceId) {
      setAvailableDates(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/availability/month?month=" + monthKey + "&serviceId=" + serviceId)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAvailableDates(new Set(Array.isArray(data.dates) ? data.dates : []));
      })
      .catch(() => {
        if (!cancelled) setAvailableDates(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, serviceId]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const result: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [year, month]);

  function goToPrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="rounded-xl border border-beige bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="rounded-full px-2 py-1 text-ink/60 hover:bg-beige/60"
          aria-label="Forrige maaned"
        >
          {"<"}
        </button>
        <div className="font-medium text-ink">
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-full px-2 py-1 text-ink/60 hover:bg-beige/60"
          aria-label="Naeste maaned"
        >
          {">"}
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-ink/50">
        {WEEKDAYS.map((wd, i) => (
          <div key={i}>{wd}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weeks.flatMap((week, wi) =>
          week.map((day, di) => {
            const cellKey = wi + "-" + di;
            if (day === null) {
              return <div key={cellKey} />;
            }
            const dateStr = toDateString(year, month, day);
            const isPast = dateStr < minDate;
            const hasAvailability = availableDates.has(dateStr);
            const isSelected = dateStr === value;

            return (
              <button
                key={cellKey}
                type="button"
                disabled={isPast}
                onClick={() => onChange(dateStr)}
                className={[
                  "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  isPast
                    ? "cursor-not-allowed text-ink/25"
                    : hasAvailability
                      ? "font-semibold text-accent-dark ring-2 ring-accent hover:bg-blush/50"
                      : "text-ink hover:bg-beige/60",
                  isSelected ? "bg-accent text-white ring-accent hover:bg-accent" : "",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })
        )}
      </div>

      <p className="mt-3 text-center text-xs text-ink/50">
        {loading ? "Henter ledige dage..." : "Dage med en cirkel har ledige tider."}
      </p>
    </div>
  );
}
