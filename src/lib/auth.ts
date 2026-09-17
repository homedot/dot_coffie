import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { Employee } from "@/src/utils/types";

const COOKIE_NAME = "dot_coffie_session";
// Stay logged in for a month — employees and pantry staff log in once and
// aren't asked again until this expires.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionPayload = Employee;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET environment variable");
  return secret;
}

export function signSession(employee: SessionPayload): string {
  return jwt.sign(employee, getJwtSecret(), { expiresIn: SESSION_MAX_AGE_SECONDS });
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== "object" || decoded === null) return null;
    const { id, name, department, initials, palette, avatarUrl, role } = decoded as Record<
      string,
      unknown
    >;
    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof department !== "string" ||
      typeof initials !== "string" ||
      typeof palette !== "string" ||
      (role !== "employee" && role !== "pantry")
    ) {
      return null;
    }
    return {
      id,
      name,
      department,
      initials,
      palette,
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : undefined,
      role,
    } as SessionPayload;
  } catch {
    return null;
  }
}
