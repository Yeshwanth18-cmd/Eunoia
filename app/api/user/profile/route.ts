import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        const { searchParams } = new URL(req.url);
        const anonymousId = searchParams.get("anonymousId");

        // We need EITHER a session userId OR an anonymousId
        const userId = session?.userId;
        const targetAnonId = anonymousId || "invalid-anon-id"; // Fallback to avoid matching nulls if anonId not provided

        // Fetch Data Parallelly
        const [assessments, moodLogs, bookings, myPosts, savedPosts, savedResources] = await Promise.all([
            // 1. Assessments
            prisma.assessment.findMany({
                where: userId
                    ? { userId }
                    : { anonymousId: targetAnonId, userId: null }, // Strict Anon
                orderBy: { createdAt: 'desc' },
                take: 20
            }),
            // 2. Mood Logs
            prisma.moodLog.findMany({
                where: userId
                    ? { userId }
                    : { anonymousId: targetAnonId, userId: null },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            // 3. Bookings (Only if Registered - Anon bookings usually don't have persistency views for users easily without ID, but we track by slot)
            // Actually, we track by studentEmail now for regs, but let's see if we linked userId.
            // In Booking API, we DO store userId if logged in.
            prisma.booking.findMany({
                where: userId
                    ? { userId }
                    : { anonymousId: targetAnonId, userId: null },
                orderBy: { slot: 'desc' },
                take: 10
            }),
            // 4. My Posts
            prisma.post.findMany({
                where: userId
                    ? { userId }
                    : { anonymousId: targetAnonId, userId: null },
                orderBy: { createdAt: 'desc' }
            }),
            // 5. Saved Posts (Expand the relations)
            prisma.savedPost.findMany({
                where: userId
                    ? { userId }
                    : { anonymousId: targetAnonId, userId: null },
                include: { post: true },
                orderBy: { savedAt: 'desc' }
            }),
            // 6. Saved Resources
            prisma.savedResource.findMany({
                where: userId
                    ? { userId }
                    : { anonymousId: targetAnonId, userId: null },
                orderBy: { savedAt: 'desc' }
            })
        ]);

        return NextResponse.json({
            user: session ? { id: session.userId, name: "Student", email: null } : null, // We could fetch real user details if needed
            data: {
                assessments,
                moodLogs,
                bookings,
                myPosts,
                savedPosts: savedPosts.map(sp => ({ ...sp.post, savedAt: sp.savedAt })), // Flatten structure
                savedResources
            }
        });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
    }
}
