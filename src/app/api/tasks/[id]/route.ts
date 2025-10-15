import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { title, description, completed } = await request.json();
        const task = await prisma.task.update({
            where: { id: parseInt(params.id) },
            data: { title, description, completed }
        });
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params } : { params: { id: string} }
) {
    try {
        await prisma.task.delete({
            where: { id: parseInt(params.id)}
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}