import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Simple immediate hide for safety
        await prisma.post.update({
            where: { id: params.id },
            data: { isFlagged: true }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Flag Error:", error);
        return NextResponse.json({ error: "Failed to flag post" }, { status: 500 });
    }
}
