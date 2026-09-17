import type { SugarLevel } from "@/src/utils/types";

// Three dots, filled left-to-right — the same "how much" pattern as a
// spice-level or signal-strength indicator. Normal = all 3 filled, Low = 1,
// Without = none filled and shown in red, so the level reads instantly
// without anyone needing to parse the text label next to it.
const LEVEL_CONFIG: Record<SugarLevel, { filled: number; color: string }> = {
  normal: { filled: 3, color: "#d97706" },
  low: { filled: 1, color: "#d97706" },
  without: { filled: 0, color: "#e11d48" },
};

export default function SugarLevelIcon({
  level,
  size = 12,
  color: colorOverride,
}: {
  level: SugarLevel;
  size?: number;
  color?: string;
}) {
  const { filled, color: defaultColor } = LEVEL_CONFIG[level];
  const color = colorOverride ?? defaultColor;
  return (
    <svg viewBox="0 0 60 20" width={size * 3} height={size} aria-hidden>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={10 + i * 20}
          cy={10}
          r={8}
          fill={i < filled ? color : "none"}
          stroke={color}
          strokeWidth={2.5}
        />
      ))}
    </svg>
  );
}
