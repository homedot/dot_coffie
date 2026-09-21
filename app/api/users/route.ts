import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";
import { toEmployee } from "@/src/lib/userSerializer";
import User from "@/src/models/User";

// Public (no token) — returns every user, never including passwordHash.
export async function GET() {
  await connectToDatabase();
  const users = await User.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({ users: users.map(toEmployee) });
}
