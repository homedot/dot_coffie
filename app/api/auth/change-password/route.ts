import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/src/lib/mongodb";
import User from "@/src/models/User";

// Public (no session, no current-password check) — pass userId + newPassword
// directly. Anyone holding a user id can reset that user's password; only
// safe for a trusted/internal setup. Add auth back before exposing this
// beyond that.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!userId || !newPassword) {
    return NextResponse.json(
      { error: "userId and newPassword are required" },
      { status: 400 },
    );
  }
  if (!isValidObjectId(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "newPassword must be at least 6 characters" },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate(userId, {
    passwordHash: await bcrypt.hash(newPassword, 10),
  });
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
