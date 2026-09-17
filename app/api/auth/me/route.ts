import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  const employee = await getSession();
  return NextResponse.json({ employee });
}
