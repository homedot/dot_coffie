"use client";

import { useState } from "react";
import { useApp } from "@/src/context/AppContext";
import { formatWaterRequestWindow, isWithinWaterRequestWindow } from "@/src/utils/orderWindow";

// Independent of the coffee/tea order flow and its morning/evening windows —
// this has its own, wider window (see WATER_REQUEST_WINDOW).
export default function WaterRequestButton() {
  const { employee, waterRequests, requestWater } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!employee) return null;

  const myRequest = waterRequests.find((r) => r.employee.id === employee.id);

  if (!myRequest && !isWithinWaterRequestWindow()) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm">
        <span className="text-2xl">💧</span>
        <p className="text-sm font-semibold text-coffee-800">
          Refill requests are available {formatWaterRequestWindow()}, every day.
        </p>
      </div>
    );
  }

  async function handleRequest() {
    setError(null);
    setSubmitting(true);
    const result = await requestWater();
    setSubmitting(false);
    if (!result.ok) setError(result.error);
  }

  if (myRequest) {
    return (
      <div className="mt-6 flex animate-pop items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sky-800 shadow-sm">
        <span className="text-2xl">💧</span>
        <p className="font-semibold">Pantry has been notified — your water is on its way!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 rounded-2xl bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💧</span>
        <p className="text-sm font-semibold text-coffee-800">Bottle empty? Ask pantry for a refill.</p>
      </div>
      <button
        onClick={handleRequest}
        disabled={submitting}
        className="shrink-0 rounded-full bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow transition-all duration-200 hover:scale-105 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {submitting ? "Sending…" : "Request refill"}
      </button>
      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600 sm:basis-full">
          {error}
        </p>
      )}
    </div>
  );
}
