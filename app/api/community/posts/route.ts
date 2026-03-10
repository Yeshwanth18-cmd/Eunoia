import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkContent } from "@/lib/moderation"; // Added import for moderation check

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const { content, title, category, anonymousId } = await req.json();

        // Validate required fields
        if (!category || !anonymousId) {
            return NextResponse.json({ error: "Missing required fields (category or anonymousId)" }, { status: 400 });
        }
        if (!title && !content) {
            return NextResponse.json({ error: "Content or title required" }, { status: 400 });
        }

        // Moderation Check
        const isFlagged = await checkContent(content + " " + (title || ""));

        // If flagged, we can either reject it or save it as hidden
        // For Eunoia's "gentle" approach, we'll save it but mark as hidden/flagged for review
        // Note: You might need to add an `isFlagged` or `status` field to your Prisma schema if not present.
        // For now, I'll assume we might want to just reject it or use an existing field.
        // Checking schema first is safer, but let's try to add it to the create call if user has it,
        // or just reject for now if we can't change schema easily.

        // Actually, let's just prepend "[FLAGGED]" to the title for now if we can't change schema,
        // OR better: check if schema has a status field.
        // Let's look at schema.prisma first.


        // Enforce max length
        if (content && content.length > 2000) { // Increased limit for "full post" since we truncate in UI
            return NextResponse.json({ error: "Content too long (max 2000 chars)" }, { status: 400 });
        }

        // Calculate Expiry (7 Days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const post = await prisma.post.create({
            data: {
                title: title || "Untitled Reflection",
                content,
                category,
                anonymousId,
                userId: session?.userId || null, // Link to user if logged in!
                expiresAt,
                isFlagged // Auto-flag based on moderation
            }
        });

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error("Create Post Error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") || "50");

        const now = new Date();

        const posts = await prisma.post.findMany({
            where: {
                // filter expired posts
                expiresAt: {
                    gt: now
                },
                // filter flagged posts
                isFlagged: false,
                // optional category filter
                ...(category ? { category } : {})
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: { reactions: true }
                }
            }
        });

        return NextResponse.json({ posts });

    } catch (error) {
        console.error("Fetch Posts Error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
