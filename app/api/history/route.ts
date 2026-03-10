import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json(
            { error: "Missing userId" },
            { status: 400 }
        );
    }

    const [assessments, moods, bookings] = await Promise.all([
        prisma.assessment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
        }),
        prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        prisma.booking.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
        }),
    ]);

    return NextResponse.json({
        assessments,
        moods,
        bookings,
    });
}
