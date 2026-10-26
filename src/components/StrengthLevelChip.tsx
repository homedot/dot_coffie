import type { StrengthLevel } from "@/src/utils/types";

// Selected color deepens with intensity — light tan for Low, mid-brown for
// Normal — so the roast color itself reads as "how strong", distinct from
// SugarLevelChip's single uniform highlight.
const SELECTED_STYLES: Record<StrengthLevel, string> = {
  low: "border-coffee-300 bg-coffee-300 text-coffee-900 shadow-lg",
  normal: "border-coffee-600 bg-coffee-600 text-cream shadow-lg",
};

export default function StrengthLevelChip({
  level,
  emoji,
  label,
  selected,
  onSelect,
}: {
  level: StrengthLevel;
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105 ${
        selected
          ? SELECTED_STYLES[level]
          : "border-coffee-200 bg-white/80 text-coffee-700 hover:border-coffee-400"
      }`}
    >
      <span className="mr-1.5">{emoji}</span>
      {label}
    </button>
  );
}
