import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Support both old 3-axis input and new single 'value' input
        const { userId, physical, mental, emotional, value } = body;
        const session = await getSession();

        const capValue = value !== undefined ? Number(value) : null;

        // processing logic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbData: any = {
            physical: capValue ?? physical ?? 50,
            mental: capValue ?? mental ?? 50,
            emotional: capValue ?? emotional ?? 50
        };

        if (session && session.userId) {
            dbData.user = { connect: { id: session.userId } };
        } else {
            dbData.anonymousId = userId; // fallback usually sent as 'userId' prop from frontend for anon
        }

        const log = await prisma.capacityLog.create({
            data: dbData,
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Capacity Log Error:", error);
        return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const { searchParams } = new URL(req.url);
        const queryId = searchParams.get("userId");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {};

        if (session?.userId) {
            whereClause.userId = session.userId;
        } else if (queryId) {
            whereClause.anonymousId = queryId;
        } else {
            return NextResponse.json({ logs: [] });
        }

        const logs = await prisma.capacityLog.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ logs });
    } catch {
        return NextResponse.json({ logs: [] });
    }
}
