import { NextRequest, NextResponse } from 'next/server';
import { dispatchPublish } from '@/lib/distributor';
import { ensureDatabaseReady } from '@/lib/db';

// 一键多平台发布
export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { text, mediaUrls, link, targetProviders, scheduledAt } = body as {
      text: string;
      mediaUrls?: string[];
      link?: string;
      targetProviders: string[];
      scheduledAt?: string;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: '文案不能为空' }, { status: 400 });
    }
    if (!targetProviders?.length) {
      return NextResponse.json({ error: '至少选择一个目标平台' }, { status: 400 });
    }

    const outcome = await dispatchPublish({
      text,
      mediaUrls: mediaUrls ?? [],
      link,
      targetProviders,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    const successCount = outcome.results.filter((r) => r.result.success).length;
    return NextResponse.json({
      ok: true,
      postId: outcome.postId,
      successCount,
      totalCount: outcome.results.length,
      results: outcome.results,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}