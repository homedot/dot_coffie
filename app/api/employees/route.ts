import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import type { AvatarPalette, Employee, EmployeeRole } from "@/src/utils/types";

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
const EMPLOYEE_ROLES: EmployeeRole[] = ["employee", "pantry"];

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.role !== "pantry") {
    return NextResponse.json({ error: "Only pantry staff can add employees" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const username = str(body?.username).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  const name = str(body?.name);
  const department = str(body?.department);
  const initials = str(body?.initials).toUpperCase() || deriveInitials(name);
  const palette = (str(body?.palette) || "brand") as AvatarPalette;
  const role = (str(body?.role) || "employee") as EmployeeRole;
  const avatarUrl = str(body?.avatarUrl) || undefined;

  if (!username || !password || !name || !department) {
    return NextResponse.json(
      { error: "username, password, name and department are required" },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (!AVATAR_PALETTES.includes(palette)) {
    return NextResponse.json(
      { error: `palette must be one of: ${AVATAR_PALETTES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!EMPLOYEE_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role must be one of: ${EMPLOYEE_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  await connectToDatabase();

  if (await User.exists({ username })) {
    return NextResponse.json({ error: "Username already exists" }, { status: 409 });
  }

  const user = await User.create({
    username,
    passwordHash: await bcrypt.hash(password, 10),
    name,
    department,
    initials,
    palette,
    avatarUrl,
    role,
  });

  const employee: Employee = {
    id: user._id.toString(),
    name: user.name,
    department: user.department,
    initials: user.initials,
    palette: user.palette,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };

  return NextResponse.json({ employee }, { status: 201 });
}
