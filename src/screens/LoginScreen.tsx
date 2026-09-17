"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import BeansBackground from "@/src/components/BeansBackground";
import Button from "@/src/components/Button";
import { useApp } from "@/src/context/AppContext";
import { IMAGES } from "@/src/utils/images";
import type { Employee } from "@/src/utils/types";

function landingPageFor(employee: Employee) {
  return employee.role === "pantry" ? "/pantry" : "/order";
}

export default function LoginScreen() {
  const router = useRouter();
  const { employee, loading, login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) router.replace(landingPageFor(employee));
  }, [employee, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(landingPageFor(result.employee));
  }

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-brand-50 via-cream to-brand-100 px-6 py-16">
      <BeansBackground />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          <Image
            src={IMAGES.loginHero}
            alt="Freshly brewed espresso with scattered coffee beans"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/85 via-coffee-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-10">
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow sm:text-5xl">
              Welcome to <span className="text-brand-300">dot.coffie</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-cream/90 sm:text-lg">
              Sign in with your employee account to order your coffee or tea,
              just the way you like it.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mt-10 w-full max-w-sm animate-fade-up rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur"
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-coffee-800">
            Username
            <input
              type="text"
              autoComplete="username"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User name"
              className="rounded-xl border border-coffee-200 bg-white px-4 py-2.5 font-normal text-coffee-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-coffee-800">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-coffee-200 bg-white px-4 py-2.5 font-normal text-coffee-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting || loading}
            className="mt-2 w-full"
          >
            {submitting ? "Signing in…" : "Sign in ☕"}
          </Button>
        </div>
      </form>
    </div>
  );
}
