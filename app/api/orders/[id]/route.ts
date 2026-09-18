import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import { toOrder } from "@/src/lib/orderSerializer";
import Order from "@/src/models/Order";
import { getSession } from "@/src/lib/auth";
import type { OrderStatus } from "@/src/utils/types";

const ORDER_STATUSES: OrderStatus[] = ["pending", "preparing", "served"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role !== "pantry") {
    return NextResponse.json({ error: "Only pantry staff can update order status" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as OrderStatus;

  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await Order.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).lean();
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: toOrder(updated) });
}
