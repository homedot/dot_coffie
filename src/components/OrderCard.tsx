import Image from "next/image";
import { DRINK_OPTIONS, SUGAR_LEVELS } from "@/src/utils/constants";
import { avatarPalette } from "@/src/utils/colors";
import type { DrinkType, Order, SugarLevel } from "@/src/utils/types";
import SugarLevelIcon from "./SugarLevelIcon";

const DRINK_BANNER_STYLES: Record<DrinkType, string> = {
  coffee: "bg-gradient-to-r from-coffee-600 to-coffee-800 text-cream",
  tea: "bg-gradient-to-r from-brand-500 to-brand-700 text-cream",
};

// Solid, high-contrast bars (not soft tints) so the sugar level is legible
// at a glance — the same color language as SugarSummary's tiles, just
// turned up for a busy pantry counter.
const SUGAR_BANNER_STYLES: Record<SugarLevel, string> = {
  normal: "bg-brand-600 text-white",
  low: "bg-amber-500 text-white",
  without: "bg-rose-600 text-white",
};

// Pantry-only label override — OrderScreen keeps using SUGAR_LEVELS' own
// labels for its sugar picker, unaffected by this.
const SUGAR_BANNER_LABELS: Record<SugarLevel, string> = {
  normal: "പഞ്ചസാര",
  low: "കുറച്ച് പഞ്ചസാര",
  without: "പഞ്ചസാര വേണ്ട",
};

// The employee photo fills the card at full size — staff identify who the
// order belongs to purely by face and name, nothing else.
export default function OrderCard({
  order,
  delayMs = 0,
}: {
  order: Order;
  delayMs?: number;
}) {
  const drink = DRINK_OPTIONS.find((d) => d.id === order.drink)!;
  const sugar = SUGAR_LEVELS.find((s) => s.id === order.sugar)!;
  const palette = avatarPalette[order.employee.palette];

  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className="animate-fade-up overflow-hidden rounded-3xl bg-white shadow-md transition-shadow duration-200 hover:shadow-xl"
    >
      <div
        className={`flex items-center justify-center gap-2 py-2 text-base font-black uppercase tracking-wide sm:py-3 sm:text-xl ${DRINK_BANNER_STYLES[drink.id]}`}
      >
        <span className="text-xl sm:text-2xl">{drink.emoji}</span>
        {drink.label}
      </div>

      <div
        className={`flex items-center justify-center gap-2 py-2 text-center text-base font-black uppercase tracking-wide sm:py-2.5 sm:text-3xl ${SUGAR_BANNER_STYLES[sugar.id]}`}
      >
        <span className="scale-75 sm:scale-100">
          <SugarLevelIcon level={sugar.id} size={15} color="#ffffff" />
        </span>
        {SUGAR_BANNER_LABELS[sugar.id]}
      </div>

      <div className="relative aspect-square w-full">
        {order.employee.avatarUrl ? (
          <Image
            src={order.employee.avatarUrl}
            alt={order.employee.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw,360px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
            }}
          >
            <span className="text-8xl font-black text-white/25">
              {order.employee.initials}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-2xl font-black text-white drop-shadow">
            {order.employee.name}
          </p>
        </div>
      </div>
    </div>
  );
}
