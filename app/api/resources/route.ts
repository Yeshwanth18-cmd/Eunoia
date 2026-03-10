import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESOURCES } from "@/lib/resourceList";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const anonymousId = searchParams.get("anonymousId");

        // 1. Fetch from DB
        let resources = await prisma.resource.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // 2. Auto-Seed if empty (Lazy Migration)
        if (resources.length === 0) {
            console.log("Seeding Resources from static list...");

            const seedData = RESOURCES.map(r => ({
                id: r.id, // Keep original string IDs for consistency
                title: r.title,
                description: r.description,
                image: r.image,
                link: r.link,
                category: "Wellness"
            }));

            await prisma.$transaction(
                seedData.map(data => prisma.resource.create({ data }))
            );

            resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
        }

        // 3. Check Bookmarks if userId is provided
        let resourcesWithStatus = resources;
        if (anonymousId) {
            const savedIds = await prisma.savedResource.findMany({
                where: { anonymousId },
                select: { resourceId: true }
            });
            const savedSet = new Set(savedIds.map(s => s.resourceId));

            resourcesWithStatus = resources.map(r => ({
                ...r,
                isBookmarked: savedSet.has(r.id)
            }));
        }

        return NextResponse.json({ resources: resourcesWithStatus });

    } catch (error) {
        console.error("Resources GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic Validation
        if (!body.title || !body.link) {
            return NextResponse.json({ error: "Title and Link are required" }, { status: 400 });
        }

        const newResource = await prisma.resource.create({
            data: {
                title: body.title,
                description: body.description || "",
                link: body.link,
                image: body.image || "/images/topics/default.png", // Fallback image
                category: body.category || "General"
            }
        });

        return NextResponse.json({ success: true, resource: newResource });

    } catch (error) {
        console.error("Resources POST Error:", error);
        return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
    }
}
