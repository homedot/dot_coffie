"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { playWaterAlarm } from "@/src/utils/alarm";
import type {
  DrinkType,
  Employee,
  Order,
  OrderStatus,
  StrengthLevel,
  SugarLevel,
  WaterRequest,
} from "@/src/utils/types";

const ORDERS_POLL_MS = 5000;
const WATER_REQUESTS_POLL_MS = 5000;

type LoginResult = { ok: true; employee: Employee } | { ok: false; error: string };
type ActionResult = { ok: true } | { ok: false; error: string };

interface AppContextValue {
  employee: Employee | null;
  orders: Order[];
  waterRequests: WaterRequest[];
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  placeOrder: (
    drink: DrinkType,
    sugar: SugarLevel,
    strength: StrengthLevel,
  ) => Promise<ActionResult>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  clearOrders: () => Promise<ActionResult>;
  requestWater: () => Promise<ActionResult>;
  fulfillWaterRequest: (requestId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waterRequests, setWaterRequests] = useState<WaterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  // Tracks which pending request ids we've already alarmed on, so a
  // reconnect or fallback-poll re-delivering the same snapshot doesn't
  // re-trigger the siren for a request that's already been heard.
  const knownRequestIds = useRef<Set<string> | null>(null);
  // Read inside the SSE handler without making the stream effect reconnect
  // every time the employee object changes identity.
  const employeeRef = useRef<Employee | null>(null);
  useEffect(() => {
    employeeRef.current = employee;
  }, [employee]);

  // Sirens only for pantry staff, and only for a request that showed up
  // *during* this session — not for whatever was already pending when the
  // page first loaded.
  const applyWaterRequests = useCallback((requests: WaterRequest[]) => {
    const ids = new Set(requests.map((r) => r.id));
    const previous = knownRequestIds.current;
    if (previous && employeeRef.current?.role === "pantry") {
      const hasNewRequest = requests.some((r) => !previous.has(r.id));
      if (hasNewRequest) playWaterAlarm();
    }
    knownRequestIds.current = ids;
    setWaterRequests(requests);
  }, []);

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

  const refreshWaterRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/water-requests", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      applyWaterRequests(data.requests);
    } catch {
      // Network hiccup — keep showing the last known requests.
    }
  }, [applyWaterRequests]);

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

  // Same SSE-with-polling-fallback pattern as orders, for water requests.
  useEffect(() => {
    let cancelled = false;
    let fallbackId: ReturnType<typeof setInterval> | null = null;

    function startFallbackPolling() {
      if (fallbackId !== null || cancelled) return;
      fallbackId = setInterval(refreshWaterRequests, WATER_REQUESTS_POLL_MS);
    }

    function stopFallbackPolling() {
      if (fallbackId !== null) {
        clearInterval(fallbackId);
        fallbackId = null;
      }
    }

    const source = new EventSource("/api/water-requests/stream");

    source.addEventListener("water-requests", (event) => {
      if (cancelled) return;
      stopFallbackPolling();
      try {
        const data = JSON.parse((event as MessageEvent).data);
        applyWaterRequests(data.requests);
      } catch {
        // Malformed push — ignore it, the next one self-corrects.
      }
    });

    source.onerror = startFallbackPolling;

    return () => {
      cancelled = true;
      stopFallbackPolling();
      source.close();
    };
  }, [refreshWaterRequests, applyWaterRequests]);

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
    async (
      drink: DrinkType,
      sugar: SugarLevel,
      strength: StrengthLevel,
    ): Promise<ActionResult> => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drink, sugar, strength }),
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

  const requestWater = useCallback(async (): Promise<ActionResult> => {
    const res = await fetch("/api/water-requests", { method: "POST" });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.error ?? "Could not send water request" };
    await refreshWaterRequests();
    return { ok: true };
  }, [refreshWaterRequests]);

  const fulfillWaterRequest = useCallback(
    async (requestId: string) => {
      const res = await fetch(`/api/water-requests/${requestId}`, { method: "PATCH" });
      if (res.ok) await refreshWaterRequests();
    },
    [refreshWaterRequests],
  );

  return (
    <AppContext.Provider
      value={{
        employee,
        orders,
        waterRequests,
        loading,
        login,
        logout,
        placeOrder,
        updateOrderStatus,
        clearOrders,
        requestWater,
        fulfillWaterRequest,
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
