import Image from "next/image";

export default function DrinkOptionCard({
  image,
  emoji,
  label,
  description,
  selected,
  onSelect,
}: {
  image: string;
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 text-center transition-all duration-200 hover:-translate-y-1 ${
        selected
          ? "border-brand-500 bg-brand-50 shadow-lg"
          : "border-transparent bg-white/85 shadow-md hover:shadow-xl"
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 z-10 flex h-7 w-7 animate-pop items-center justify-center rounded-full bg-brand-600 text-sm text-cream shadow">
          ✓
        </span>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={`${label} illustration`}
          fill
          priority
          sizes="(max-width: 640px) 50vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span
          className={`absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl shadow-md ${
            selected ? "animate-wiggle" : ""
          }`}
        >
          {emoji}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 p-4">
        <p className="text-lg font-bold text-coffee-800">{label}</p>
        <p className="text-sm text-brand-600">{description}</p>
      </div>
    </button>
  );
}
