import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Check if user with same email or username already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { name: name }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                // If email already exists, try to log them in automatically
                const passwordMatch = await bcrypt.compare(password, existingUser.password);
                if (passwordMatch) {
                    return NextResponse.json({ success: true, user: { id: existingUser.id, name: existingUser.name, email: existingUser.email } });
                } else {
                    return NextResponse.json({ error: "Email already in use, or incorrect password." }, { status: 400 });
                }
            } else if (existingUser.name === name) {
                return NextResponse.json({ error: "Username already in use." }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (e: any) {
        console.error("Signup Error:", e);
        return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }
}
