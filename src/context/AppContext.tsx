"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { DrinkType, Employee, Order, OrderStatus, SugarLevel } from "@/src/utils/types";

const ORDERS_POLL_MS = 5000;

type LoginResult = { ok: true; employee: Employee } | { ok: false; error: string };
type ActionResult = { ok: true } | { ok: false; error: string };

interface AppContextValue {
  employee: Employee | null;
  orders: Order[];
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  placeOrder: (drink: DrinkType, sugar: SugarLevel) => Promise<ActionResult>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  clearOrders: () => Promise<ActionResult>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      // Network hiccup — keep showing the last known orders.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setEmployee(data.employee ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live updates via Server-Sent Events, with interval polling as a
  // fallback if the stream ever fails (dropped connection, proxy that
  // blocks SSE, etc). Every push is a full snapshot rather than a delta,
  // so duplicate or out-of-order events are harmless — the UI just
  // re-renders the same (or newest) state, never a partial one.
  useEffect(() => {
    let cancelled = false;
    let fallbackId: ReturnType<typeof setInterval> | null = null;

    function startFallbackPolling() {
      if (fallbackId !== null || cancelled) return;
      fallbackId = setInterval(refreshOrders, ORDERS_POLL_MS);
    }

    function stopFallbackPolling() {
      if (fallbackId !== null) {
        clearInterval(fallbackId);
        fallbackId = null;
      }
    }

    const source = new EventSource("/api/orders/stream");

    source.addEventListener("orders", (event) => {
      if (cancelled) return;
      stopFallbackPolling();
      try {
        const data = JSON.parse((event as MessageEvent).data);
        setOrders(data.orders);
      } catch {
        // Malformed push — ignore it, the next one self-corrects.
      }
    });

    // EventSource retries dropped connections on its own, but a browser
    // can take a while to notice a half-dead connection (sleep, wifi
    // drop). Poll in the meantime so the board never goes stale for long.
    source.onerror = startFallbackPolling;

    return () => {
      cancelled = true;
      stopFallbackPolling();
      source.close();
    };
  }, [refreshOrders]);

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Login failed" };
    setEmployee(data.employee);
    return { ok: true, employee: data.employee };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setEmployee(null);
  }, []);

  const placeOrder = useCallback(
    async (drink: DrinkType, sugar: SugarLevel): Promise<ActionResult> => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drink, sugar }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return { ok: false, error: data?.error ?? "Could not place order" };
      await refreshOrders();
      return { ok: true };
    },
    [refreshOrders],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await refreshOrders();
    },
    [refreshOrders],
  );

  const clearOrders = useCallback(async (): Promise<ActionResult> => {
    const res = await fetch("/api/orders", { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.error ?? "Could not clear orders" };
    await refreshOrders();
    return { ok: true };
  }, [refreshOrders]);

  return (
    <AppContext.Provider
      value={{
        employee,
        orders,
        loading,
        login,
        logout,
        placeOrder,
        updateOrderStatus,
        clearOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
