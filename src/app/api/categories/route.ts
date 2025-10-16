import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if(!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if(!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const categories = await prisma.category.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { tasks: true }
                }
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if(!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if(!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { name, color } = await request.json();

        const category = await prisma.category.create({
            data: {
                name,
                color,
                userId: user.id
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}
