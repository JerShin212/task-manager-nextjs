import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const ensureCategoryOwner = async (id: number, userId: string) => {
    return prisma.category.findFirst({
        where: { id, userId }
    });
};

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const categoryId = parseInt(id, 10);

        if (Number.isNaN(categoryId)) {
            return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
        }

        const existing = await ensureCategoryOwner(categoryId, user.id);

        if (!existing) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const { name, color } = await request.json();
        const data: { name?: string; color?: string } = {};

        if (typeof name === 'string') data.name = name;
        if (typeof color === 'string') data.color = color;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id: existing.id },
            data
        });

        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Category name already exists for this user' },
                { status: 409 }
            );
        }

        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const categoryId = parseInt(id, 10);

        if (Number.isNaN(categoryId)) {
            return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
        }

        const existing = await ensureCategoryOwner(categoryId, user.id);

        if (!existing) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        await prisma.category.delete({
            where: { id: existing.id }
        });

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
