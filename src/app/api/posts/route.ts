import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseReady } from '@/lib/db';

// 强制动态渲染(避免 Vercel 构建时预渲染尝试访问数据库)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabaseReady();
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        logs: true,
        account: { select: { provider: true, displayName: true } },
      },
      take: 100,
    });
    return NextResponse.json({ posts });
  } catch {
    // 数据库未初始化时返回空数组
    return NextResponse.json({ posts: [] });
  }
}