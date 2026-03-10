import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch users descending by creation date
        // Fetch users descending by creation date
        const users = await prisma.user.findMany({
            select: {
                id: true,
                createdAt: true,
                email: true,
                name: true,
                _count: {
                    select: {
                        assessments: true,
                        bookings: true,
                        moodLogs: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ users });
    } catch {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
