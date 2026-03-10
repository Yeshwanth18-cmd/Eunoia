import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Auto-login after signup
        await createSession(user.id);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
