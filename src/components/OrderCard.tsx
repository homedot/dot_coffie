import Image from "next/image";
import { DRINK_OPTIONS, SUGAR_LEVELS } from "@/src/utils/constants";
import { avatarPalette } from "@/src/utils/colors";
import type { Order, SugarLevel } from "@/src/utils/types";

// Pantry-only label override — OrderScreen keeps using SUGAR_LEVELS' own
// labels for its sugar picker, unaffected by this.
const SUGAR_LABELS_ML: Record<SugarLevel, string> = {
  normal: "സാധാരണ പഞ്ചസാര",
  low: "കുറച്ച് പഞ്ചസാര",
  without: "പഞ്ചസാര വേണ്ട",
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
  const palette = avatarPalette[order.employee.palette];

  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className="animate-fade-up relative flex items-center gap-6 rounded-3xl bg-white p-2.5 shadow-md transition-shadow duration-200 hover:shadow-xl"
    >
      <span className="absolute right-3 top-3 text-8xl leading-none">
        {drink.emoji}
      </span>

      <div className="relative h-56 w-56 shrink-0">
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
        <p className="truncate pr-24 text-3xl font-bold text-coffee-900">
          {order.employee.name}
        </p>
        <p className="mt-2 truncate pr-24 text-2xl font-black leading-tight text-coffee-900">
          {drink.label}
        </p>
        <p className="whitespace-nowrap text-3xl font-medium leading-tight text-coffee-800">
          ({SUGAR_LABELS_ML[sugar.id]})
        </p>
      </div>
    </div>
  );
}
