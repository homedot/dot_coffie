import type { StrengthLevel } from "@/src/utils/types";

// Three ascending bars, filled left-to-right — a signal-strength pattern
// read as "how strong" at a glance, visually distinct from SugarLevelIcon's
// dots so the two indicators are never confused on a pantry order card.
const LEVEL_CONFIG: Record<StrengthLevel, { filled: number; color: string }> = {
  low: { filled: 1, color: "#b8824a" },
  normal: { filled: 2, color: "#7a4f30" },
};

const BAR_X = [4, 24, 44];
const BAR_HEIGHTS = [6, 11, 16];
const BASELINE = 18;

export default function StrengthLevelIcon({
  level,
  size = 12,
  color: colorOverride,
}: {
  level: StrengthLevel;
  size?: number;
  color?: string;
}) {
  const { filled, color: defaultColor } = LEVEL_CONFIG[level];
  const color = colorOverride ?? defaultColor;
  return (
    <svg viewBox="0 0 60 20" width={size * 3} height={size} aria-hidden>
      {BAR_HEIGHTS.map((h, i) => (
        <rect
          key={i}
          x={BAR_X[i]}
          y={BASELINE - h}
          width={12}
          height={h}
          rx={2}
          fill={i < filled ? color : "none"}
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
