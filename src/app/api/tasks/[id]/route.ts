import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH update task
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { title, description, completed } = await request.json();
        const { id } = await params;
        const task = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { title, description, completed }
        });
        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// DELETE task
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.task.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Failed to delete task', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
