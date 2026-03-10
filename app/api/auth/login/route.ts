import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { passcode } = await req.json();

        // Use environment variable, fallback to default for dev
        const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";

        if (passcode === ADMIN_SECRET) {
            // Set secure cookie
            cookies().set("admin_session", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24, // 24 hours
                path: "/",
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "Invalid Passcode" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
