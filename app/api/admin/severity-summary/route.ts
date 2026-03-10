import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");

    const days = (() => {
        const parsed = Number(daysParam);
        if (Number.isNaN(parsed) || parsed <= 0 || parsed > 365) return 30;
        return parsed;
    })();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const assessments = await prisma.assessment.findMany({
        where: {
            createdAt: {
                gte: since,
            },
        },
        select: {
            severity: true,
        },
    });

    const bySeverity: Record<string, number> = {};
    for (const a of assessments) {
        const key = a.severity ?? "unknown";
        bySeverity[key] = (bySeverity[key] ?? 0) + 1;
    }

    const totalCount = assessments.length;

    return NextResponse.json({
        totalCount,
        bySeverity,
        days,
    });
}
