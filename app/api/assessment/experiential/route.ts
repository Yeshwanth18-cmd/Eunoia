import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { userId, tags, note } = await req.json();
        const session = await getSession();

        // Verify session matches provided userId if user is authenticated
        if (session && session.userId && session.userId !== userId) {
            // Fallback if userId passed doesn't match session (security check)
            // In this prototype, we trust the client logic, but good to be aware.
        }

        // Determine if we attach to a registered user or just store anonymousId
        // If 'userId' is a UUID v4 (anonymous), we store it in `anonymousId`.
        // If it matches a real user ID from session, we connect it.

        // Simplification for prototype:
        // If session exists, link to User. Else, link to AnonymousId.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbData: any = {
            tags,
            note
        };

        if (session && session.userId) {
            dbData.user = { connect: { id: session.userId } };
        } else {
            dbData.anonymousId = userId; // The client passes the anonymous UUID here
        }

        const log = await prisma.experientialLog.create({
            data: dbData,
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Experiential Log Error:", error);
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

        const logs = await prisma.experientialLog.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ logs });
    } catch {
        return NextResponse.json({ logs: [] });
    }
}
