import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        const postId = params.id;

        if (!postId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Fetch post to check ownership
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        // Verify ownership
        // 1. If logged in, check userId
        // 2. If anon, check anonymousId (passed in header or body? usually we can't verify anon delete easily without a token, 
        //    but for this app we'll assume Client-Side check is enough for Anon-created posts if we trust the local storage 'anonymousId' passed in query/body).
        //    Let's require userId match for now for strict Profile CRUD.

        let isOwner = false;

        // Check for Admin Session (Cookie)
        const adminSession = req.cookies.get("admin_session");

        if (adminSession) {
            isOwner = true; // Admin can delete anything
        }
        // Check for User Ownership
        else if (session && session.userId && post.userId === session.userId) {
            isOwner = true;
        }
        // Check for Anonymous Ownership
        else {
            const clientAnonId = req.headers.get("x-anonymous-id");
            if (clientAnonId && post.anonymousId === clientAnonId) {
                isOwner = true;
            }
        }

        if (!isOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 1. Check if exists
        const existing = await prisma.post.findUnique({ where: { id: postId } });
        if (!existing) {
            return NextResponse.json({ success: true });
        }

        // 2. Delete
        await prisma.post.delete({ where: { id: postId } });

        // 3. Verify
        const check = await prisma.post.findUnique({ where: { id: postId } });
        if (check) {
            console.error(`[Community DELETE] CRITICAL: Post ${postId} still exists after delete!`);
            return NextResponse.json({ error: "Deletion failed verification" }, { status: 500 });
        }

        console.log(`[Community DELETE] Successfully deleted post ${postId}`);
        return NextResponse.json({ success: true });

    } catch {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        const postId = params.id;
        const body = await req.json();

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        let isOwner = false;
        if (session && session.userId && post.userId === session.userId) isOwner = true;
        else {
            const clientAnonId = req.headers.get("x-anonymous-id");
            if (clientAnonId && post.anonymousId === clientAnonId) isOwner = true;
        }

        if (!isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        await prisma.post.update({
            where: { id: postId },
            data: {
                content: body.content,

                title: body.title
            }
        });

        return NextResponse.json({ success: true });

    } catch {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
