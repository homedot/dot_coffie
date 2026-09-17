import type { DrinkType } from "@/src/utils/types";

const LIQUID_COLORS: Record<DrinkType, { top: string; body: string }> = {
  coffee: { top: "#96633a", body: "#3a2718" },
  tea: { top: "#d9b872", body: "#8a6a2e" },
};

const SIZES = {
  md: { wrap: "h-40 w-36", cup: "h-28 w-28", stream: "h-9", drip: "top-7", steamRow: "top-9" },
  lg: { wrap: "h-56 w-48", cup: "h-40 w-40", stream: "h-12", drip: "top-9", steamRow: "top-11" },
} as const;

// A looping "brewing" scene shown while an order is pending or being
// prepared — a stream pouring into a gently 3D-tilted cup, rising steam,
// and a bobbing liquid surface — so the wait feels alive instead of static.
export default function BrewingAnimation({
  drink,
  size = "md",
}: {
  drink: DrinkType;
  size?: keyof typeof SIZES;
}) {
  const liquid = LIQUID_COLORS[drink];
  const s = SIZES[size];

  return (
    <div className={`relative mx-auto ${s.wrap}`} style={{ perspective: "700px" }}>
      <div
        className={`animate-pour-stream absolute left-1/2 top-0 ${s.stream} w-1.5 origin-top -translate-x-1/2 rounded-full`}
        style={{ background: `linear-gradient(to bottom, transparent, ${liquid.body})` }}
      />
      <div
        className={`animate-drip absolute left-1/2 ${s.drip} h-2.5 w-2.5 -translate-x-1/2 rounded-full`}
        style={{ background: liquid.body, animationDelay: "0.35s" }}
      />

      <div className={`absolute left-1/2 ${s.steamRow} flex -translate-x-1/2 gap-2.5`}>
        <span className={`animate-steam block ${s.stream} w-1.5 rounded-full bg-white/70`} />
        <span
          className={`animate-steam block ${s.stream} w-1.5 rounded-full bg-white/70`}
          style={{ animationDelay: "0.6s" }}
        />
        <span
          className={`animate-steam block ${s.stream} w-1.5 rounded-full bg-white/70`}
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      <div className="animate-brew-tilt absolute inset-x-0 bottom-2" style={{ transformStyle: "preserve-3d" }}>
        <svg viewBox="0 0 120 100" className={`mx-auto ${s.cup} drop-shadow-xl`} aria-hidden>
          <path
            d="M92 40c14 0 14 26 0 26"
            stroke="var(--color-coffee-700)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M18 34h74v24c0 15-12 27-27 27H45c-15 0-27-12-27-27V34Z"
            fill="var(--color-cream)"
            stroke="var(--color-coffee-700)"
            strokeWidth="3"
          />
          <path
            d="M22 38h66v18c0 13-10.5 24-23.5 24h-19C32.5 80 22 69 22 56V38Z"
            fill={liquid.body}
          />
          <ellipse
            cx="55"
            cy="38"
            rx="33"
            ry="6"
            fill={liquid.top}
            className="animate-surface-bob origin-center [transform-box:fill-box]"
          />
        </svg>
      </div>
    </div>
  );
}
