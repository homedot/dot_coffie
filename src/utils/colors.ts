import type { AvatarPalette } from "./types";

// Mirrors the Tailwind theme tokens defined in app/globals.css.
// Use these when a raw value is needed (SVG fills, inline gradients, canvas, etc).
export const brand = {
  50: "#eefdf3",
  100: "#d5f7e0",
  200: "#aeedc4",
  300: "#7ddda2",
  400: "#46c17c",
  500: "#22a35f",
  600: "#16824a",
  700: "#14663c",
  800: "#135233",
  900: "#0f432b",
};

export const coffee = {
  50: "#fbf5ee",
  100: "#f1e2cf",
  200: "#e3c6a0",
  300: "#d0a56f",
  400: "#b8824a",
  500: "#96633a",
  600: "#7a4f30",
  700: "#5f3e28",
  800: "#4a3120",
  900: "#3a2718",
};

export const cream = "#fff8ec";

export const statusColor = {
  pending: { bg: "#fff7e6", text: "#b45309", ring: "#fbbf24" },
  preparing: { bg: "#eaf2ff", text: "#1d4ed8", ring: "#60a5fa" },
  served: { bg: brand[50], text: brand[700], ring: brand[400] },
};

// One distinct color per employee so avatars are easy to tell apart at a
// glance — important for staff scanning a grid of orders quickly.
export const avatarPalette: Record<
  AvatarPalette,
  { from: string; to: string; text: string }
> = {
  brand: { from: brand[400], to: brand[600], text: "#ffffff" },
  coffee: { from: coffee[300], to: coffee[600], text: "#ffffff" },
  rose: { from: "#fb7185", to: "#be123c", text: "#ffffff" },
  amber: { from: "#fbbf24", to: "#b45309", text: "#ffffff" },
  teal: { from: "#2dd4bf", to: "#0f766e", text: "#ffffff" },
  indigo: { from: "#818cf8", to: "#4338ca", text: "#ffffff" },
  plum: { from: "#c084fc", to: "#7e22ce", text: "#ffffff" },
  sky: { from: "#38bdf8", to: "#0369a1", text: "#ffffff" },
};
