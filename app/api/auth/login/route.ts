import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import { setSessionCookie, signSession } from "@/src/lib/auth";
import type { Employee } from "@/src/utils/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ username });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !valid) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const employee: Employee = {
    id: user._id.toString(),
    name: user.name,
    department: user.department,
    initials: user.initials,
    palette: user.palette,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };

  const token = signSession(employee);
  await setSessionCookie(token);

  // `token` is for the mobile app, which has no cookie jar — it stores
  // this and sends it back as `Authorization: Bearer <token>`. The web
  // client ignores it and keeps using the cookie.
  return NextResponse.json({ employee, token });
}
