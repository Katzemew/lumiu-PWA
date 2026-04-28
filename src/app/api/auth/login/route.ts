import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
        }

        // Verify name if it was provided
        if (name && user.name !== name) {
            return NextResponse.json({ error: "Incorrect username for this email." }, { status: 401 });
        }

        // Login successful
        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (e: any) {
        console.error("Login Error:", e);
        return NextResponse.json({ error: "An error occurred during login." }, { status: 500 });
    }
}
