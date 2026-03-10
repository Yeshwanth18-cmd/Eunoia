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

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
}

export async function PATCH(
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

    const body = await req.json().catch(() => null);
    const status = body?.status as string | undefined;

    if (!status) {
        return NextResponse.json(
            { error: "Missing status" },
            { status: 400 }
        );
    }

    const booking = await prisma.booking.update({
        where: { id },
        data: { status },
    });

    return NextResponse.json({ success: true, booking });
}
