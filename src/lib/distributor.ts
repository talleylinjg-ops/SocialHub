import { prisma } from '@/lib/db';
import { getAdapter } from '@/lib/platforms';
import type { PublishContent, PublishResult, StoredAccount } from '@/lib/platforms/base';

export interface DispatchRequest {
  text: string;
  mediaUrls: string[];
  link?: string;
  targetProviders: string[]; // 目标平台ID列表
  scheduledAt?: Date;
}

export interface DispatchOutcome {
  postId: string;
  results: Array<{
    provider: string;
    result: PublishResult;
  }>;
}

// 发布分发器:将统一内容分发到多个目标平台
export async function dispatchPublish(req: DispatchRequest): Promise<DispatchOutcome> {
  // 1. 为每个目标平台找到第一个已绑定的账号
  const accounts = await prisma.account.findMany({
    where: { provider: { in: req.targetProviders }, isActive: true },
  });

  const content: PublishContent = {
    text: req.text,
    media: req.mediaUrls.map((url, i) => ({
      type: /mp4|mov|avi|webm/i.test(url) ? 'video' as const : 'image' as const,
      url,
      altText: `media-${i}`,
    })),
    link: req.link,
  };

  // 2. 创建 Post 记录(关联到第一个账号或分享模式虚拟账号)
  const primary = accounts[0];
  // 如果没有绑定账号，检查是否有分享链接模式的平台
  const shareLinkProviders = req.targetProviders.filter((p) => {
    const adapter = getAdapter(p);
    return adapter?.isShareLinkMode?.();
  });
  const apiProviders = req.targetProviders.filter((p) => !shareLinkProviders.includes(p));

  if (!primary && apiProviders.length > 0) {
    throw new Error('所选平台尚未绑定账号,请先在账号管理页完成授权,或使用分享链接模式平台');
  }

  const post = await prisma.post.create({
    data: {
      text: req.text,
      mediaUrls: JSON.stringify(req.mediaUrls),
      status: 'publishing',
      scheduledAt: req.scheduledAt ?? null,
      targets: JSON.stringify(req.targetProviders),
      accountId: primary?.id ?? 'share-mode',
    },
  }).catch(() => null);

  // 3. 按平台分发
  const outcomes: DispatchOutcome['results'] = [];

  for (const provider of req.targetProviders) {
    const adapter = getAdapter(provider);
    if (!adapter) {
      outcomes.push({
        provider,
        result: { success: false, error: `不支持的平台: ${provider}` },
      });
      continue;
    }

    // 分享链接模式：生成 share URL 而非调 API
    if (adapter.isShareLinkMode?.()) {
      const shareUrl = adapter.getShareUrl?.(content);
      outcomes.push({
        provider,
        result: {
          success: true,
          remoteUrl: shareUrl,
          remoteId: 'share-link',
        },
      });
      // 写日志
      await prisma.publishLog.create({
        data: {
          postId: post?.id ?? 'share-mode',
          provider,
          status: 'success',
          remoteId: 'share-link',
          remoteUrl: shareUrl,
        },
      }).catch(() => {});
      continue;
    }

    const account = accounts.find((a) => a.provider === provider);
    if (!account) {
      outcomes.push({
        provider,
        result: { success: false, error: '未绑定该平台账号' },
      });
      continue;
    }

    // 先校验
    if (adapter.validate) {
      const v = adapter.validate(content);
      if (!v.valid) {
        outcomes.push({ provider, result: { success: false, error: v.errors.join('; ') } });
        continue;
      }
    }

    const stored: StoredAccount = {
      id: account.id,
      provider: account.provider,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      tokenExpiresAt: account.tokenExpiresAt ?? undefined,
      platformUserId: account.platformUserId ?? undefined,
    };

    const result = await adapter.publish(content, stored);
    outcomes.push({ provider, result });

    // 写日志
    await prisma.publishLog.create({
      data: {
        postId: post?.id ?? 'share-mode',
        provider,
        status: result.success ? 'success' : 'failed',
        remoteId: result.remoteId,
        remoteUrl: result.remoteUrl,
        error: result.error,
      },
    }).catch(() => {});
  }

  // 4. 更新 Post 状态
  const allSuccess = outcomes.every((o) => o.result.success);
  if (post) {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: allSuccess ? 'published' : 'failed' },
    }).catch(() => {});
  }

  return { postId: post?.id ?? 'share-mode', results: outcomes };
}