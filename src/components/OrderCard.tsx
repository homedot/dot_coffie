import Image from "next/image";
import StrengthLevelIcon from "@/src/components/StrengthLevelIcon";
import { DRINK_OPTIONS, STRENGTH_LEVELS, SUGAR_LEVELS } from "@/src/utils/constants";
import { avatarPalette } from "@/src/utils/colors";
import type { Order, StrengthLevel, SugarLevel } from "@/src/utils/types";

// Pantry-only label override — OrderScreen keeps using SUGAR_LEVELS' own
// labels for its sugar picker, unaffected by this.
const SUGAR_LABELS_ML: Record<SugarLevel, string> = {
  normal: "പഞ്ചസാര",
  low: "കുറച്ച് പഞ്ചസാര",
  without: "പഞ്ചസാര വേണ്ട",
};

// Pantry-only label override, same idea as SUGAR_LABELS_ML — "kaduppam" is
// the everyday word for how strong/thick a chai or coffee is brewed.
const STRENGTH_LABELS_ML: Record<StrengthLevel, string> = {
  low: "കടുപ്പം കുറവ്",
  normal: "സാധാരണ കടുപ്പം",
};

// One order per row: numbered avatar on the left, with the employee name
// and the drink/sugar line stacked underneath it as a single text block.
export default function OrderCard({
  order,
  index,
  delayMs = 0,
}: {
  order: Order;
  index: number;
  delayMs?: number;
}) {
  const drink = DRINK_OPTIONS.find((d) => d.id === order.drink)!;
  const sugar = SUGAR_LEVELS.find((s) => s.id === order.sugar)!;
  // Orders placed before this feature shipped have no strength field —
  // skip the row for those rather than fabricating a level nobody picked.
  const strength = STRENGTH_LEVELS.find((s) => s.id === order.strength);
  const palette = avatarPalette[order.employee.palette];

  const isLowStrength = strength?.id === "low";

  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      // A thick amber ring makes a low-strength order stand out across the
      // whole grid at a glance, before anyone has to read a single word —
      // pantry staff need to catch this one without scanning every line.
      className={`animate-fade-up relative flex items-center gap-3 rounded-3xl bg-white p-2.5 sm:gap-6 shadow-md transition-shadow duration-200 hover:shadow-xl ${
        isLowStrength ? "ring-4 ring-amber-400" : ""
      }`}
    >
      <span className="absolute right-3 top-3 text-5xl leading-none sm:text-8xl">
        {drink.emoji}
      </span>

      <div className="relative h-28 w-28 shrink-0 sm:h-56 sm:w-56">
        {/* <span className="absolute -left-3 -top-3 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white ring-2 ring-white">
          {index}
        </span> */}
        <div className="h-full w-full overflow-hidden rounded-full">
          {order.employee.avatarUrl ? (
            <Image
              src={order.employee.avatarUrl}
              alt={order.employee.name}
              fill
              sizes="224px"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
              }}
            >
              <span className="text-5xl font-black text-white">
                {order.employee.initials}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {isLowStrength && (
          // Bold, high-contrast badge — the first thing read on the card —
          // so "make it weak" isn't easy to miss among the other lines.
          // Same pr-14/pr-24 reserve as the lines below it, so the pill
          // wraps instead of running under the drink emoji in the corner.
          <div className="mb-1.5 pr-14 sm:pr-24">
            <span className="inline-flex max-w-full animate-pop items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-sm font-black text-white shadow-md sm:gap-2 sm:px-4 sm:py-2 sm:text-2xl">
              <StrengthLevelIcon level="low" size={14} color="#ffffff" />
              <span>{STRENGTH_LABELS_ML.low}</span>
            </span>
          </div>
        )}
        <p className="truncate pr-14 text-xl font-bold sm:pr-24 sm:text-3xl text-coffee-900">
          {order.employee.name}
        </p>
        <p className="mt-1 truncate pr-14 text-lg font-black sm:mt-2 sm:pr-24 sm:text-2xl leading-tight text-coffee-900">
          {drink.label}
        </p>
        <p className="break-words text-lg font-medium sm:text-3xl leading-tight text-coffee-800">
          ({SUGAR_LABELS_ML[sugar.id]})
        </p>
        {strength && strength.id === "normal" && (
          <p className="mt-1 flex items-center gap-2 break-words text-base font-semibold sm:mt-2 sm:text-2xl leading-tight text-coffee-700">
            <StrengthLevelIcon level={strength.id} size={14} />
            {STRENGTH_LABELS_ML[strength.id]}
          </p>
        )}
      </div>
    </div>
  );
}
