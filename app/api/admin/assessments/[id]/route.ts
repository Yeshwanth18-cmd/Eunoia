import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function DELETE(
    req: NextRequest,
    { params }: Params
) {
    const { id } = params;
    if (!id) {
        return NextResponse.json(
            { error: "Missing id" },
            { status: 400 }
        );
    }

    await prisma.assessment.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
