import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseReady } from '@/lib/db';

export async function GET() {
  await ensureDatabaseReady();
  const accounts = await prisma.account.findMany({
    orderBy: { provider: 'asc' },
    include: { _count: { select: { posts: true } } },
  }).catch(() => []);
  return NextResponse.json({ accounts });
}

// 删除账号
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.account.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}