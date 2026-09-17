import Image from "next/image";
import { avatarPalette } from "@/src/utils/colors";
import type { AvatarPalette } from "@/src/utils/types";

const SIZE_CLASSES = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
} as const;

const ICON_SIZE_CLASSES = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
  xl: "h-14 w-14",
} as const;

const IMAGE_SIZES = {
  sm: "36px",
  md: "48px",
  lg: "64px",
  xl: "96px",
} as const;

// Renders the employee's photo when one is on file; otherwise falls back to
// a unique color per employee plus a simple person silhouette, so a grid of
// orders is still easy to visually scan.
export default function Avatar({
  initials,
  palette,
  avatarUrl,
  size = "md",
}: {
  initials: string;
  palette: AvatarPalette;
  avatarUrl?: string;
  size?: keyof typeof SIZE_CLASSES;
}) {
  if (avatarUrl) {
    return (
      <div
        title={initials}
        className={`relative shrink-0 overflow-hidden rounded-full shadow-inner ring-2 ring-white/70 ${SIZE_CLASSES[size]}`}
      >
        <Image src={avatarUrl} alt={initials} fill sizes={IMAGE_SIZES[size]} className="object-cover" />
      </div>
    );
  }

  const colors = avatarPalette[palette];
  return (
    <div
      title={initials}
      className={`flex shrink-0 items-center justify-center rounded-full shadow-inner ring-2 ring-white/70 ${SIZE_CLASSES[size]}`}
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      <svg viewBox="0 0 24 24" fill={colors.text} className={ICON_SIZE_CLASSES[size]} aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8Z" />
      </svg>
    </div>
  );
}
