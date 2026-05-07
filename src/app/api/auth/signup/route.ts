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

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json({ error: "An account already exists with this email." }, { status: 400 });
    }

    const existingByName = await prisma.user.findUnique({ where: { name } });
    if (existingByName) {
      return NextResponse.json({ error: "Username already in use." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = createJwt({ id: newUser.id, name: newUser.name, email: newUser.email });
    const cookie = createAuthCookie(token);

    return NextResponse.json(
      { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (e: any) {
    console.error("Signup Error:", e);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
