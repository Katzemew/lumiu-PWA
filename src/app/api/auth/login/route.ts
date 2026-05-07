import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { createJwt } from "@/lib/jwt";

function createAuthCookie(token: string) {
  const secure = process.env.NODE_ENV === "production";
  return `lumiu_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${secure ? "Secure;" : ""}`;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (name && user.name !== name) {
      return NextResponse.json({ error: "Incorrect username for this email." }, { status: 401 });
    }

    const token = createJwt({ id: user.id, name: user.name, email: user.email });
    const cookie = createAuthCookie(token);

    return NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email } },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (e: any) {
    console.error("Login Error:", e);
    return NextResponse.json({ error: "An error occurred during login." }, { status: 500 });
  }
}
