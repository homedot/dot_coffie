export default function SugarLevelChip({
  emoji,
  label,
  selected,
  onSelect,
}: {
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
          ? "border-coffee-600 bg-coffee-600 text-cream shadow-lg"
          : "border-coffee-200 bg-white/80 text-coffee-700 hover:border-coffee-400"
      }`}
    >
      <span className="mr-1.5">{emoji}</span>
      {label}
    </button>
  );
}
