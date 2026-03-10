import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        const { anonymousId } = await req.json();
        const postId = params.id;

        if (!session && !anonymousId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Determine finder
        const finder = session?.userId
            ? { postId_userId: { postId, userId: session.userId } }
            : { postId_anonymousId: { postId, anonymousId } };

        // Check if exists
        const existing = await prisma.savedPost.findUnique({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: finder as any
        });

        if (existing) {
            // Unsave
            await prisma.savedPost.delete({ where: { id: existing.id } });
            return NextResponse.json({ saved: false });
        } else {
            // Save
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {
                postId: postId,
                ...(session?.userId ? { userId: session.userId } : { anonymousId })
            };
            await prisma.savedPost.create({
                data
            });
            return NextResponse.json({ saved: true });
        }

    } catch (error) {
        console.error("Save Post Error:", error);
        return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
    }
}
