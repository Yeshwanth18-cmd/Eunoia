import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Use a transaction to delete all related data first, then the user
        await prisma.$transaction([
            prisma.booking.deleteMany({ where: { userId } }),
            prisma.assessment.deleteMany({ where: { userId } }),
            prisma.moodLog.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } }),
        ]);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
