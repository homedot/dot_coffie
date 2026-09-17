"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BeansBackground from "@/src/components/BeansBackground";
import BrewingAnimation from "@/src/components/BrewingAnimation";
import Button from "@/src/components/Button";
import DrinkOptionCard from "@/src/components/DrinkOptionCard";
import GreetingScene from "@/src/components/GreetingScene";
import NavBar from "@/src/components/NavBar";
import OrderStatusTracker from "@/src/components/OrderStatusTracker";
import SugarLevelChip from "@/src/components/SugarLevelChip";
import { useApp } from "@/src/context/AppContext";
import { DRINK_OPTIONS, SUGAR_LEVELS } from "@/src/utils/constants";
import { IMAGES } from "@/src/utils/images";
import {
  formatOrderWindows,
  getLabeledOrderWindows,
  getOrderWindowFor,
  isWithinOrderWindow,
} from "@/src/utils/orderWindow";
import type { DrinkType, SugarLevel } from "@/src/utils/types";

const DRINK_IMAGES: Record<DrinkType, string> = {
  coffee: IMAGES.coffeeCard,
  tea: IMAGES.teaCard,
};

export default function OrderScreen() {
  const router = useRouter();
  const { employee, orders, placeOrder } = useApp();
  const [drink, setDrink] = useState<DrinkType | null>(null);
  const [sugar, setSugar] = useState<SugarLevel | null>(null);
  const [justPlaced, setJustPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!employee) {
      router.replace("/");
    } else if (employee.role === "pantry") {
      router.replace("/pantry");
    }
  }, [employee, router]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!employee || employee.role === "pantry") return null;

  // One order at a time per employee — once it's served they can order again.
  const activeOrder = orders.find(
    (o) => o.employee.id === employee.id && o.status !== "served",
  );
  const orderWindowOpen = isWithinOrderWindow(new Date(now));
  const activeOrderWindow = activeOrder ? getOrderWindowFor(new Date(activeOrder.createdAt)) : null;

  async function handleConfirm() {
    if (!drink || !sugar || !orderWindowOpen) return;
    setError(null);
    setSubmitting(true);
    const result = await placeOrder(drink, sugar);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setJustPlaced(true);
    setDrink(null);
    setSugar(null);
    setTimeout(() => setJustPlaced(false), 3000);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-brand-50 via-cream to-brand-100">
      <BeansBackground />
      <NavBar />

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <GreetingScene name={employee.name.split(" ")[0]} />

        {justPlaced && (
          <div className="mt-6 flex animate-pop items-center gap-3 rounded-2xl bg-white/90 p-4 text-brand-800 shadow-lg">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image src={IMAGES.beanHeart} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <p className="font-semibold">
              Order placed! Our pantry staff has been notified and is on it.
            </p>
          </div>
        )}

        {activeOrder ? (
          <div className="relative mt-10 animate-fade-up">
            <div
              className="animate-card-glow pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] blur-2xl"
              style={{
                background:
                  activeOrder.drink === "coffee"
                    ? "radial-gradient(circle, var(--color-coffee-400), transparent 70%)"
                    : "radial-gradient(circle, var(--color-brand-400), transparent 70%)",
              }}
            />

            <div className="animate-breathe relative overflow-hidden rounded-[2.5rem] bg-white/95 p-8 text-center shadow-2xl">
              <span className="animate-sparkle absolute left-8 top-8 text-xl" style={{ animationDelay: "0.2s" }}>
                ✨
              </span>
              <span className="animate-sparkle absolute right-10 top-16 text-lg" style={{ animationDelay: "1s" }}>
                ✨
              </span>
              <span className="animate-sparkle absolute bottom-12 left-12 text-lg" style={{ animationDelay: "1.6s" }}>
                ✨
              </span>

              <BrewingAnimation drink={activeOrder.drink} size="lg" />

              {activeOrderWindow && (
                <div
                  className={`relative mt-4 inline-flex animate-pop items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg ${
                    activeOrderWindow.label === "Morning"
                      ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400"
                  }`}
                >
                  <span
                    className="animate-shimmer pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                  <span className="relative text-base">{activeOrderWindow.emoji}</span>
                  <span className="relative">{activeOrderWindow.label} Order</span>
                </div>
              )}
              <p className={`text-xl font-extrabold text-coffee-800 ${activeOrderWindow ? "mt-3" : "mt-4"}`}>
                {activeOrderWindow ? (
                  <>
                    <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                      {employee.name.split(" ")[0]}&apos;s
                    </span>{" "}
                    {activeOrderWindow.label.toLowerCase()} {activeOrder.drink} is on the way!
                  </>
                ) : (
                  <>Your {activeOrder.drink} is on the way!</>
                )}
              </p>
              <p className="mt-1 text-sm text-brand-600">
                You can order again once the pantry marks it served.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {getLabeledOrderWindows().map((window) => (
                  <span
                    key={window.label}
                    className="inline-flex items-center gap-2 rounded-full border border-coffee-200 bg-gradient-to-r from-coffee-50 to-brand-50 px-4 py-2 text-sm font-bold text-coffee-700 shadow-sm"
                  >
                    <span className="text-base">{window.emoji}</span>
                    {window.label} ☕🍵
                    <span className="font-semibold text-coffee-500">{window.range}</span>
                  </span>
                ))}
              </div>

              <OrderStatusTracker status={activeOrder.status} />
            </div>
          </div>
        ) : !orderWindowOpen ? (
          <div className="mt-10 animate-fade-up rounded-3xl bg-white/90 p-6 text-center shadow-lg">
            <p className="text-3xl">⏰</p>
            <p className="mt-2 text-lg font-bold text-coffee-800">Ordering is closed right now</p>
            <p className="mt-1 text-sm text-brand-600">
              You can order between {formatOrderWindows()}.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <p role="alert" className="mt-6 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-coffee-800">1. Choose your drink</h2>
              <div className="grid grid-cols-2 gap-5">
                {DRINK_OPTIONS.map((option) => (
                  <DrinkOptionCard
                    key={option.id}
                    image={DRINK_IMAGES[option.id]}
                    emoji={option.emoji}
                    label={option.label}
                    description={option.description}
                    selected={drink === option.id}
                    onSelect={() => setDrink(option.id)}
                  />
                ))}
              </div>
            </section>

            {drink && (
              <section className="mt-8 animate-fade-up">
                <h2 className="mb-4 text-lg font-bold text-coffee-800">2. How much sugar?</h2>
                <div className="flex flex-wrap gap-3">
                  {SUGAR_LEVELS.map((level) => (
                    <SugarLevelChip
                      key={level.id}
                      emoji={level.emoji}
                      label={level.label}
                      selected={sugar === level.id}
                      onSelect={() => setSugar(level.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 flex justify-center sm:justify-start">
              <Button onClick={handleConfirm} disabled={!drink || !sugar || submitting}>
                {submitting ? "Placing order…" : "Confirm order ☕"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
