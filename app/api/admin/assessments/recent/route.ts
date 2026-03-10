import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");

    const limit = (() => {
        const parsed = Number(limitParam);
        if (Number.isNaN(parsed) || parsed <= 0 || parsed > 100) return 20;
        return parsed;
    })();

    const assessments = await prisma.assessment.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            createdAt: true,
            userId: true,
            assessmentType: true,
            totalScore: true,
            severity: true,
        },
    });

    return NextResponse.json({ assessments });
}
