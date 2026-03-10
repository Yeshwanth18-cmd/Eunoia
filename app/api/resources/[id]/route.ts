import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.resource.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Resource Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
