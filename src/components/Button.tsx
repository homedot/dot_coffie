import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-cream hover:bg-brand-700 shadow-lg shadow-brand-900/20 hover:shadow-xl",
  secondary:
    "bg-coffee-600 text-cream hover:bg-coffee-700 shadow-lg shadow-coffee-900/20 hover:shadow-xl",
  ghost: "bg-white/10 text-cream hover:bg-white/20 border border-cream/30",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
