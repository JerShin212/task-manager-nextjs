import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const tasks = await prisma.task.findMany(
            {orderBy: {createdAt: 'desc'}}
        );
        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const {title, description} = await request.json();
        const task = await prisma.task.create({
            data: { title, description }
        });
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}