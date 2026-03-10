
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "20");

        const moods = await prisma.moodLog.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ moods });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch moods" },
            { status: 500 }
        );
    }
}
