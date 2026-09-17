"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/src/context/AppContext";
import Avatar from "./Avatar";

const LINKS = [
  { href: "/order", label: "☕ Order" },
  { href: "/pantry", label: "🧑‍🍳 Pantry" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { employee, logout } = useApp();
  const links = LINKS.filter((l) =>
    employee?.role === "pantry" ? l.href === "/pantry" : l.href === "/order",
  );

  return (
    <header className="sticky top-0 z-50 bg-brand-700/95 text-cream shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="text-xl">☕</span>
          <span>dot.coffie</span>
        </Link>

        <nav className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-cream text-brand-800 shadow"
                  : "text-cream/80 hover:bg-white/10 hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {employee ? (
          <div className="flex items-center gap-2">
            <Avatar
              initials={employee.initials}
              palette={employee.palette}
              avatarUrl={employee.avatarUrl}
              size="sm"
            />
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-full border border-cream/30 px-3 py-1.5 text-xs font-semibold text-cream/80 transition-colors hover:bg-white/10 hover:text-cream"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/"
            className="rounded-full border border-cream/30 px-3 py-1.5 text-xs font-semibold text-cream/80 hover:bg-white/10 hover:text-cream"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
