import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logEvent } from "@/lib/logger";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const startStr = searchParams.get("start");
        const endStr = searchParams.get("end");

        if (!startStr || !endStr) {
            return NextResponse.json({ error: "Missing start/end params" }, { status: 400 });
        }

        const start = new Date(startStr);
        const end = new Date(endStr);

        const bookings = await prisma.booking.findMany({
            where: {
                slot: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                slot: true,
                reason: true, // To filter by counselor if needed later
            },
        });

        return NextResponse.json({
            bookings: bookings.map(b => ({
                slot: b.slot,
                counselorId: b.reason?.includes("Dr. Sarah") ? "c1"
                    : b.reason?.includes("James") ? "c2"
                        : b.reason?.includes("Emily") ? "c3"
                            : "unknown"
            }))
        });

    } catch (error) {
        logEvent("booking_fetch_error", { error: (error as Error).message });
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}

// Force dynamic to ensure cookies are read correctly
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const body = await req.json();

        // Support both old 'slotTime' payload and new fuller payload
        const slotStr = body.slot || body.slotTime;
        const studentName = body.studentName || "Anonymous Student";
        const studentEmail = body.studentEmail ?? null;
        const { userId } = body;

        if (!slotStr) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Try to parse slot string to date, fallback to now if invalid
        let slotDate = new Date(slotStr);
        if (isNaN(slotDate.getTime())) {
            slotDate = new Date();
        }

        // Determine User ID
        let finalUserId = session?.userId || null;
        let finalAnonymousId = session ? null : userId;

        // Fallback: If no session but email provided, try to link to registered user
        // (Note: In a strict prod app, we'd require auth, but for this prototype, this fixes the "Bookings not linking" issue)
        if (!finalUserId && studentEmail) {
            const userByEmail = await prisma.user.findUnique({ where: { email: studentEmail } });
            if (userByEmail) {
                finalUserId = userByEmail.id;
                finalAnonymousId = null; // Clear anonymous ID if we found a real user
            }
        }

        const booking = await prisma.booking.create({
            data: {
                studentName,
                studentEmail,
                reason: body.reason ?? null,
                slot: slotDate,
                status: "PENDING",
                userId: finalUserId,
                anonymousId: finalAnonymousId
            },
        });

        logEvent("booking_created", { id: booking.id, slot: booking.slot });

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            slotTime: slotStr
        });
    } catch (error) {
        // Temporary debug code and should be removed after diagnosis
        const err = error as Error;
        const msg = err.message || "Unknown error";
        logEvent("booking_error", { error: msg });

        const hint = msg.toLowerCase().includes("prisma") || msg.toLowerCase().includes("connection")
            ? "DB connection/Prisma error"
            : "Internal Server Error";

        return NextResponse.json(
            {
                ok: false,
                error: hint,
                details: msg.substring(0, 200)
            },
            { status: 500 }
        );
    }
}
