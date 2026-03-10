import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        const body = await req.json();
        const { anonymousId, content, tags, mood, title, prompt } = body;

        console.log("Journal POST:", {
            userId: session?.userId,
            anonymousId,
            contentLength: content?.length
        });

        if (!content) {
            return NextResponse.json({ error: 'Content required' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {
            content,
            title: title || "Untitled Entry",
            prompt: prompt || null,
            tags: tags || [],
            mood: mood || null,
        };

        // Strict Separation:
        // If Logged In -> Use Session User ID (ignore anonymousId)
        // If Not Logged In -> Use Anonymous ID
        if (session?.userId) {
            data.user = { connect: { id: session.userId } };
            // Ensure no anonymousId is attached to user entries to prevent bleeding
            data.anonymousId = null;
        } else {
            if (!anonymousId) return NextResponse.json({ error: 'ID required' }, { status: 401 });
            data.anonymousId = anonymousId;
        }

        const entry = await prisma.journalEntry.create({ data });

        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error("Journal API Error:", error);
        return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getSession();
        const { searchParams } = new URL(req.url);
        const queryAnonId = searchParams.get('anonymousId');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {};

        if (session?.userId) {
            whereClause.userId = session.userId;
        } else if (queryAnonId) {
            whereClause.anonymousId = queryAnonId;
            // EITHER anonymousId matches OR userId is null (strictly anonymous)
            // Actually, we just want entries where anonymousId matches.
        } else {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entries = await prisma.journalEntry.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ entries });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        const body = await req.json();
        const { id, anonymousId } = body;

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const entry = await prisma.journalEntry.findUnique({ where: { id } });

        if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Authorization Check
        let isAuthorized = false;

        if (session?.userId) {
            // User owns it?
            if (entry.userId === session.userId) isAuthorized = true;
        } else if (anonymousId) {
            // Anon owns it?
            if (entry.anonymousId === anonymousId) isAuthorized = true;
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await prisma.journalEntry.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
