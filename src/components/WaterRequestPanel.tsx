"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/src/context/AppContext";
import {
  getWaterAlertPermission,
  resyncWaterAlertSubscription,
  subscribeToWaterAlerts,
} from "@/src/lib/pushClient";
import { avatarPalette } from "@/src/utils/colors";

type PermissionState = "granted" | "denied" | "default" | "unsupported" | "checking";

// How often an already-granted subscription gets silently re-synced to the
// server while this screen stays open — catches a subscription that the
// phone's OS quietly drops mid-session (battery optimization, long idle
// stretches), not just the one at page load.
const RESYNC_INTERVAL_MS = 30 * 60 * 1000;

// Sky blue throughout — a distinct color from the coffee/tea board below it,
// so "someone needs water" never reads as just another drink order.
export default function WaterRequestPanel() {
  const { waterRequests, fulfillWaterRequest } = useApp();
  const [permission, setPermission] = useState<PermissionState>("checking");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  useEffect(() => {
    getWaterAlertPermission().then(setPermission);
  }, []);

  // Self-heal: if alerts were already enabled on this device, silently
  // re-register with the server every time the pantry screen loads (and
  // periodically while it stays open), so a subscription the OS dropped in
  // the background gets replaced before anyone notices alerts went quiet.
  // Permission that's already "granted" never prompts again — this never
  // interrupts whoever's looking at the screen.
  useEffect(() => {
    function resync() {
      resyncWaterAlertSubscription().catch(() => {});
    }
    resync();
    const id = setInterval(resync, RESYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleEnableAlerts() {
    setSubscribeError(null);
    setSubscribing(true);
    try {
      const result = await subscribeToWaterAlerts();
      if (!result.ok) {
        setSubscribeError(result.error);
        return;
      }
      setPermission(await getWaterAlertPermission());
    } catch {
      setSubscribeError("Something went wrong enabling alerts — try again");
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <div className="mt-8 rounded-3xl bg-sky-50 p-4 shadow-lg sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-sky-900 sm:text-3xl">
          <span className="text-3xl">💧</span> Water requests
        </h2>

        {permission === "granted" ? (
          <span className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-bold text-white shadow">
            🔔 Alerts on
          </span>
        ) : permission === "denied" ? (
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800">
            🔕 Notifications blocked — allow them in your phone&apos;s browser settings
          </span>
        ) : permission === "unsupported" ? null : (
          <button
            onClick={handleEnableAlerts}
            disabled={subscribing || permission === "checking"}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow transition-all duration-200 hover:scale-105 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {subscribing ? "Enabling…" : "🔔 Enable water alerts"}
          </button>
        )}
      </div>

      {subscribeError && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-600">
          {subscribeError}
        </p>
      )}

      {waterRequests.length === 0 ? (
        <p className="mt-4 text-sm font-medium text-sky-700">No one needs water right now.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {waterRequests.map((request) => {
            const palette = avatarPalette[request.employee.palette];
            return (
              <div
                key={request.id}
                className="animate-pop flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-white p-3 shadow-md"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                >
                  {request.employee.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-coffee-900">{request.employee.name}</p>
                  <p className="truncate text-sm font-medium text-sky-700">{request.employee.department}</p>
                </div>
                <button
                  onClick={() => fulfillWaterRequest(request.id)}
                  className="shrink-0 rounded-full bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow transition-all duration-200 hover:scale-105 hover:bg-sky-700"
                >
                  ✅ Filled
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
