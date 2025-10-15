import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all tasks
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim();
        const categoryId = searchParams.get('categoryId');

        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                ...(search && {
                    OR: [
                        { title: { contains: search } },
                        { description: { contains: search } },
                    ],
                }),
                ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
            },
            include: {
                category: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST create new task
export async function POST(request: Request) {
    try {

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { title, description, categoryId, dueDate } = await request.json();
        const task = await prisma.task.create({
            data: {
                title,
                description,
                userId: user.id,
                categoryId: categoryId ? parseInt(categoryId, 10) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
            include: {
                category: true,
            }
        });
        
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
