import { statusColor } from "@/src/utils/colors";
import type { OrderStatus } from "@/src/utils/types";

const STEPS: { id: OrderStatus; label: string; emoji: string }[] = [
  { id: "pending", label: "Received", emoji: "📝" },
  { id: "preparing", label: "Brewing", emoji: "🔥" },
  { id: "served", label: "Served", emoji: "🎉" },
];

// A three-step tracker that lights up as the order moves from received
// through brewing to served, sharing the same status colors pantry staff
// see on the order board — so the wait visibly progresses, not just idles.
export default function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const activeIndex = STEPS.findIndex((s) => s.id === status);

  return (
    <div className="mx-auto mt-6 flex max-w-xs items-start">
      {STEPS.map((step, i) => {
        const reached = i <= activeIndex;
        const active = i === activeIndex;
        const colors = statusColor[step.id];
        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-md transition-all duration-500 ${
                  reached ? "animate-pop" : "opacity-40 grayscale"
                }`}
                style={{
                  background: reached ? colors.bg : "#f3f4f6",
                  boxShadow: active ? `0 0 0 4px ${colors.ring}66` : undefined,
                }}
              >
                {step.emoji}
              </div>
              <span
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: reached ? colors.text : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-1.5 h-1 flex-1 -translate-y-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-brand-400 transition-all duration-700"
                  style={{ width: i < activeIndex ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
