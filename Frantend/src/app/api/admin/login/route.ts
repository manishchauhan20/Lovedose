import { NextResponse } from "next/server";
import { createAdminSession, getAdminCredentials } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };
  const credentials = getAdminCredentials();

  if (
    body.username !== credentials.username ||
    body.password !== credentials.password
  ) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ success: true });
}
