import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';

export async function GET() {


    try {
        const posts = await prisma.post.findMany({
            where: { isFlagged: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ posts });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function PATCH() { // Not used here, dynamic route needs folder structure
    return NextResponse.json({ error: "Use specific ID route" });
}
