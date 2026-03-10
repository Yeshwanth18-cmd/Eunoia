import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const clientUserId = searchParams.get("userId"); // This might be an anonymous UUID
    const session = await getSession();

    let whereClause = {};

    if (session && session.userId) {
        // If logged in, prioritize their account data
        whereClause = { userId: session.userId };
    } else if (clientUserId) {
        // If not logged in, look for their anonymous data
        whereClause = { anonymousId: clientUserId };
    } else {
        return NextResponse.json({ logs: [] });
    }

    const logs = await prisma.moodLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 30,
    });

    return NextResponse.json({ logs });
}
