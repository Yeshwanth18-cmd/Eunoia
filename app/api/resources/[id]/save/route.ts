import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // Assuming auth lib exists, or we handle manual session check if needed.

// Simpler: Just rely on passed IDs since ClientUserId handles identity
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { anonymousId, title } = await req.json();
        const resourceId = params.id;
        const session = await getSession();

        // Determine finder
        const finder = session?.userId
            ? { resourceId_userId: { resourceId, userId: session.userId } }
            : { resourceId_anonymousId: { resourceId, anonymousId } };

        // Check if exists
        const existing = await prisma.savedResource.findUnique({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: finder as any
        });

        if (existing) {
            // Unsave
            await prisma.savedResource.delete({ where: { id: existing.id } });
            return NextResponse.json({ saved: false });
        } else {
            // Save
            await prisma.savedResource.create({
                data: {
                    resourceId,
                    title: title || "Resource",
                    ...(session?.userId ? { userId: session.userId } : { anonymousId })
                }
            });
            return NextResponse.json({ saved: true });
        }

    } catch (error) {
        console.error("Save Resource Error:", error);
        return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
    }
}
