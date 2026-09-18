"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BeansBackground from "@/src/components/BeansBackground";
import Button from "@/src/components/Button";
import NavBar from "@/src/components/NavBar";
import OrderCard from "@/src/components/OrderCard";
import SugarSummary from "@/src/components/SugarSummary";
import { useApp } from "@/src/context/AppContext";
import { IMAGES } from "@/src/utils/images";

export default function PantryScreen() {
  const router = useRouter();
  const { employee, orders, clearOrders } = useApp();
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) {
      router.replace("/");
    } else if (employee.role !== "pantry") {
      router.replace("/order");
    }
  }, [employee, router]);

  const sorted = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt), [orders]);
  const activeCount = orders.filter((o) => o.status !== "served").length;

  if (!employee || employee.role !== "pantry") return null;

  async function handleClear() {
    if (!window.confirm("Clear the order board? This marks every order handled and lets everyone place a new one.")) {
      return;
    }
    setClearError(null);
    setClearing(true);
    const result = await clearOrders();
    setClearing(false);
    if (!result.ok) setClearError(result.error);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-brand-50 via-cream to-brand-100">
      <BeansBackground />
      <NavBar />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={IMAGES.pantryHero}
              alt="Coffee brewing among roasted beans"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/85 via-coffee-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-6">
              <div className="text-cream">
                <h1 className="text-2xl font-extrabold drop-shadow sm:text-3xl">
                  🧑‍🍳 Pantry Dashboard
                </h1>
                <p className="mt-1 text-sm text-cream/90 sm:text-base">
                  Live orders from your teammates — freshly brewed, on demand.
                </p>
              </div>
              <span className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-bold text-cream shadow">
                {activeCount} active {activeCount === 1 ? "order" : "orders"}
              </span>
            </div>
          </div>
        </div>

        {sorted.length > 0 && (
          <div className="mt-8">
            <SugarSummary orders={sorted} />
          </div>
        )}

        {sorted.length > 0 && (
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-coffee-800">Today&apos;s orders</h2>
            <Button
              variant="secondary"
              onClick={handleClear}
              disabled={clearing}
              className="w-full px-10 py-5 text-xl sm:w-auto"
            >
              {clearing ? "Clearing…" : "✅ Clear board"}
            </Button>
          </div>
        )}

        {clearError && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
            {clearError}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {sorted.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl bg-white/70 py-16 text-center">
              <span className="animate-float text-5xl">☕</span>
              <p className="text-lg font-semibold text-coffee-700">
                No orders yet — enjoy the quiet before the rush.
              </p>
            </div>
          ) : (
            sorted.map((order, i) => (
              <OrderCard key={order.id} order={order} delayMs={Math.min(i, 8) * 60} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
