import { DRINK_OPTIONS, SUGAR_LEVELS } from "@/src/utils/constants";
import type { Order, SugarLevel } from "@/src/utils/types";
import SugarLevelIcon from "./SugarLevelIcon";

const TILE_STYLES: Record<SugarLevel, string> = {
  normal: "bg-brand-50 border-brand-200",
  low: "bg-amber-50 border-amber-200",
  without: "bg-rose-50 border-rose-200",
};

const COUNT_STYLES: Record<SugarLevel, string> = {
  normal: "text-brand-700",
  low: "text-amber-700",
  without: "text-rose-700",
};

// Pantry-only label override — OrderScreen keeps using SUGAR_LEVELS' own
// labels for its sugar picker, unaffected by this.
const TILE_LABELS: Record<SugarLevel, string> = {
  normal: "പഞ്ചസാര",
  low: "കുറച്ച് പഞ്ചസാര",
  without: "പഞ്ചസാര വേണ്ട",
};

// Large, at-a-glance counts of how many of each drink + sugar level are
// outstanding — icon, color, and number all reinforce the same read, so
// pantry staff can prep in bulk without reading every card.
export default function SugarSummary({ orders }: { orders: Order[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {DRINK_OPTIONS.map((drink) => (
        <div key={drink.id} className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <h3 className="flex items-center gap-2 text-3xl font-extrabold text-coffee-800">
            <span className="text-3xl">{drink.emoji}</span> {drink.label}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {SUGAR_LEVELS.map((level) => {
              const count = orders.filter(
                (o) => o.drink === drink.id && o.sugar === level.id,
              ).length;
              return (
                <div
                  key={level.id}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 ${TILE_STYLES[level.id]}`}
                >
                  <SugarLevelIcon level={level.id} size={12} />
                  <span
                    className={`text-6xl font-black leading-none ${COUNT_STYLES[level.id]}`}
                  >
                    {count}
                  </span>
                  <span className="text-center text-2xl font-bold leading-tight text-coffee-700">
                    {TILE_LABELS[level.id]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
