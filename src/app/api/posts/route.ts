import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      logs: true,
      account: { select: { provider: true, displayName: true } },
    },
    take: 100,
  });
  return NextResponse.json({ posts });
}