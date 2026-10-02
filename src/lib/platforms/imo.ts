import {
  BasePlatformAdapter,
  type AccountInfo,
  type OAuthConfig,
  type PlatformCapabilities,
  type PlatformLimits,
  type PlatformMeta,
  type PublishContent,
  type PublishResult,
  type StoredAccount,
} from './base';
import { buildAuthorizeUrl, env } from '@/lib/env';

// Imo —— 孟加拉国/中东主流即时通讯 + 社交平台
// 文档: https://imo.im/developer (开放 API 受限)
export class ImoAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'imo',
    name: 'Imo',
    color: '#3B82F6',
    icon: 'im',
    category: 'im',
    region: 'Bangladesh',
    website: 'https://imo.im',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: true,
    scheduling: false,
    multipleImages: false,
    maxImages: 1,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 4096,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '孟加拉国国民级 IM;通过官方 Bot API 向频道/群组发布',
  };

  // Imo 使用 Bot Token 模式(类似 Telegram)
  readonly oauth: OAuthConfig = {
    authorizeUrl: '',
    tokenUrl: '',
    scopes: [],
  };

  isConfigured(): boolean {
    return !!(env('IMO_BOT_TOKEN') && env('IMO_CHANNEL_ID'));
  }

  async getAuthorizeUrl(): Promise<{ url: string; codeVerifier?: string }> {
    throw new Error('Imo 使用 Bot Token 模式,无需 OAuth。请在 .env 配置 IMO_BOT_TOKEN 和 IMO_CHANNEL_ID');
  }

  async handleCallback(): Promise<AccountInfo> {
    throw new Error('Imo 无回调流程');
  }

  buildVirtualAccount(): StoredAccount {
    return {
      id: 'imo-bot',
      provider: 'imo',
      accessToken: env('IMO_BOT_TOKEN') ?? '',
      platformUserId: env('IMO_CHANNEL_ID') ?? '',
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const token = account.accessToken || env('IMO_BOT_TOKEN');
      const channelId = account.platformUserId || env('IMO_CHANNEL_ID');
      if (!token || !channelId) {
        return { success: false, error: '缺少 IMO_BOT_TOKEN 或 IMO_CHANNEL_ID' };
      }

      const body: Record<string, unknown> = {
        channel_id: channelId,
        text: content.text,
      };
      if (content.media.length > 0) {
        body.media_url = content.media[0].url;
        body.media_type = content.media[0].type;
      }

      const res = await fetch(`https://api.imo.im/v1/bot/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `Imo API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as { message_id?: string; error?: string };
      if (data.error) return { success: false, error: `Imo: ${data.error}` };
      return {
        success: true,
        remoteId: data.message_id,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
