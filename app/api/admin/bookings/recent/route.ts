import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");

    const limit = (() => {
        const parsed = Number(limitParam);
        if (Number.isNaN(parsed) || parsed <= 0 || parsed > 100) return 20;
        return parsed;
    })();

    const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            createdAt: true,
            studentName: true,
            studentEmail: true,
            reason: true,
            slot: true,
            status: true,
            anonymousId: true,
        },
    });

    return NextResponse.json({ bookings });
}
