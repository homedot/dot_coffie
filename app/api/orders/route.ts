import { NextRequest, NextResponse } from "next/server";
import { runAutoClear } from "@/src/lib/autoClear";
import { connectToDatabase } from "@/src/lib/mongodb";
import { broadcastOrdersChanged } from "@/src/lib/orderEvents";
import { toOrder } from "@/src/lib/orderSerializer";
import Order from "@/src/models/Order";
import { getSession } from "@/src/lib/auth";
import { formatOrderWindows, isWithinOrderWindow } from "@/src/utils/orderWindow";
import type { DrinkType, SugarLevel } from "@/src/utils/types";

const DRINK_TYPES: DrinkType[] = ["coffee", "tea"];
const SUGAR_LEVELS: SugarLevel[] = ["normal", "low", "without"];

export async function GET() {
  await connectToDatabase();
  const swept = await runAutoClear();
  if (swept > 0) broadcastOrdersChanged();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders: orders.map(toOrder) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role === "pantry") {
    return NextResponse.json({ error: "Pantry staff cannot place orders" }, { status: 403 });
  }
  if (!isWithinOrderWindow()) {
    return NextResponse.json(
      { error: `Ordering is only open ${formatOrderWindows()}` },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const drink = body?.drink as DrinkType;
  const sugar = body?.sugar as SugarLevel;

  if (!DRINK_TYPES.includes(drink)) {
    return NextResponse.json({ error: "Invalid drink" }, { status: 400 });
  }
  if (!SUGAR_LEVELS.includes(sugar)) {
    return NextResponse.json({ error: "Invalid sugar level" }, { status: 400 });
  }

  await connectToDatabase();
  const swept = await runAutoClear();
  if (swept > 0) broadcastOrdersChanged();

  const existingActiveOrder = await Order.findOne({
    "employee.id": session.id,
    status: { $ne: "served" },
  }).lean();
  if (existingActiveOrder) {
    return NextResponse.json(
      { error: "You already have an order in progress — wait for it to be served before ordering again" },
      { status: 409 },
    );
  }

  const created = await Order.create({
    employee: session,
    drink,
    sugar,
    status: "pending",
    createdAt: Date.now(),
  });
  broadcastOrdersChanged();

  return NextResponse.json({ order: toOrder(created) }, { status: 201 });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role !== "pantry") {
    return NextResponse.json({ error: "Only pantry staff can clear the order board" }, { status: 403 });
  }

  await connectToDatabase();
  await Order.deleteMany({});
  broadcastOrdersChanged();

  return NextResponse.json({ ok: true });
}
