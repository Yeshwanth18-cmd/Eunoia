import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const action = body.action ? body.action.toUpperCase() : "";

        // Security: Verify Admin Session
        const adminSession = req.cookies.get("admin_session");

        console.log(`[Moderation] Request: Action=${action} ID=${params.id} AdminCookie=${!!adminSession}`);

        if (!adminSession) {
            console.log(`[Moderation] Unauthorized: Missing admin_session cookie`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (action === "RESTORE") {
            // Extend expiry by 7 days from now so it actually shows up in the feed
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 7);

            await prisma.post.update({
                where: { id: params.id },
                data: { isFlagged: false, expiresAt: newExpiry }
            });
            console.log(`[Moderation] Successfully restored post ${params.id}`);
            return NextResponse.json({ success: true });
        }

        else if (action === "DELETE") {
            // 1. Check if exists
            const existing = await prisma.post.findUnique({ where: { id: params.id } });
            if (!existing) {
                console.log(`[Moderation] Post ${params.id} already gone.`);
                return NextResponse.json({ success: true });
            }

            // 2. Delete
            await prisma.post.delete({ where: { id: params.id } });

            // 3. Verify Deletion (Read-After-Write)
            const check = await prisma.post.findUnique({ where: { id: params.id } });
            if (check) {
                console.error(`[Moderation] CRITICAL: Post ${params.id} still exists after delete!`);
                return NextResponse.json({ error: "Deletion failed verification" }, { status: 500 });
            }

            console.log(`[Moderation] Successfully deleted post ${params.id}`);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("[Moderation] Error:", error);
        return NextResponse.json({ error: "Operation failed", details: String(error) }, { status: 500 });
    }
}
