import { NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    fullName?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email or password is missing." }, { status: 400 });
  }

  const result = await sendForgotPasswordEmail({
    to: body.email,
    fullName: body.fullName ?? "",
    password: body.password,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: "Password reminder mail sent successfully." });
}

