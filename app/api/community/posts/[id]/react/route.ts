import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { anonymousId, type } = await req.json();

        if (!anonymousId || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const validTypes = ["WARMTH", "INSIGHT", "SOLIDARITY"]; // 💙, 💡, 🫂
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
        }

        // Toggle logic: If exists, delete. If not, create.
        const existing = await prisma.postReaction.findUnique({
            where: {
                postId_anonymousId_type: {
                    postId: params.id,
                    anonymousId,
                    type
                }
            }
        });

        if (existing) {
            await prisma.postReaction.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ success: true, action: "removed" });
        } else {
            await prisma.postReaction.create({
                data: {
                    postId: params.id,
                    anonymousId,
                    type
                }
            });
            return NextResponse.json({ success: true, action: "added" });
        }

    } catch (error) {
        console.error("Reaction Error:", error);
        return NextResponse.json({ error: "Failed to react" }, { status: 500 });
    }
}
