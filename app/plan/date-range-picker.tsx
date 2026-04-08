"use client";

import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function toISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toDate(str: string): Date | undefined {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Date | undefined>();

  const [range, setRange] = useState<DateRange | undefined>({
    from: toDate(startDate),
    to: toDate(endDate),
  });

  const hoverRange: DateRange | undefined =
    range?.from && !range?.to && hovered
      ? range.from <= hovered
        ? { from: range.from, to: hovered }
        : { from: hovered, to: range.from }
      : undefined;

  function handleSelect(r: DateRange | undefined) {
    setRange(r);

    if (r?.from && r?.to) {
      onStartChange(toISO(r.from));
      onEndChange(toISO(r.to));
      if (r.from.getTime() !== r.to.getTime()) setOpen(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  let displayValue = "Select date range";
  if (range?.from) {
    if (!range.to) {
      displayValue = format(range.from, "PPP");
    } else {
      displayValue = `${format(range.from, "PPP")} – ${format(range.to, "PPP")}`;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Travel dates
      </label>
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:border-gray-300 transition-colors select-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 shrink-0"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={range?.from ? "text-gray-900" : "text-gray-400"}>
          {displayValue}
        </span>
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            pagedNavigation
            animate
            modifiers={{
              hover_preview: hoverRange
                ? (date: Date) => date >= hoverRange.from! && date <= hoverRange.to!
                : () => false,
            }}
            modifiersStyles={{
              hover_preview: { backgroundColor: "var(--rdp-accent-background-color, #e0e7ff)" },
            }}
            onDayMouseEnter={(day) => setHovered(day)}
            onDayMouseLeave={() => setHovered(undefined)}
          />
        </div>
      )}
    </div>
  );
}
