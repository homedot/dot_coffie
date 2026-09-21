import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/src/lib/mongodb";
import { toEmployee } from "@/src/lib/userSerializer";
import User from "@/src/models/User";
import type { AvatarPalette } from "@/src/utils/types";

const AVATAR_PALETTES: AvatarPalette[] = [
  "brand",
  "coffee",
  "rose",
  "amber",
  "teal",
  "indigo",
  "plum",
  "sky",
];

// Public (no token). Password and role are intentionally not editable here —
// with no auth, anyone could otherwise take over accounts or grant themselves
// pantry access.
type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findById(id).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: toEmployee(user) });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, string> = {};
  for (const field of ["name", "department", "initials", "avatarUrl"] as const) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") {
      return NextResponse.json({ error: `${field} must be a string` }, { status: 400 });
    }
    const value = body[field].trim();
    if (!value && field !== "avatarUrl") {
      return NextResponse.json({ error: `${field} cannot be empty` }, { status: 400 });
    }
    update[field] = field === "initials" ? value.toUpperCase() : value;
  }
  if (body.palette !== undefined) {
    if (!AVATAR_PALETTES.includes(body.palette)) {
      return NextResponse.json(
        { error: `palette must be one of: ${AVATAR_PALETTES.join(", ")}` },
        { status: 400 },
      );
    }
    update.palette = body.palette;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one of: name, department, initials, palette, avatarUrl" },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate(id, update, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: toEmployee(updated) });
}
