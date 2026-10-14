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
import { env } from '@/lib/env';

// Viber —— 东欧/东南亚主流即时通讯平台
// 文档: https://developers.viber.com/docs/api/
export class ViberAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'viber',
    name: 'Viber',
    color: '#8E44AD',
    icon: 'V',
    category: 'im',
    region: 'Eastern Europe',
    website: 'https://www.viber.com',
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
    maxTextLength: 7000,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '东欧/缅甸主流 IM;通过 Bot API 向频道订阅者发布',
  };

  // Viber 使用 Bot Token 模式
  readonly oauth: OAuthConfig = {
    authorizeUrl: '',
    tokenUrl: '',
    scopes: [],
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('VIBER_BOT_TOKEN') && env('VIBER_CHANNEL_ID'));
  }

  /** 生成 Viber 分享链接 */
  getShareUrl(content: PublishContent): string {
    const text = encodeURIComponent(content.text + (content.link ? `\n${content.link}` : ''));
    return `viber://forward?text=${text}`;
  }

  async getAuthorizeUrl(): Promise<{ url: string; codeVerifier?: string }> {
    throw new Error('Viber 使用 Bot Token 模式,无需 OAuth。请在 .env 配置 VIBER_BOT_TOKEN');
  }

  async handleCallback(): Promise<AccountInfo> {
    throw new Error('Viber 无回调流程');
  }

  buildVirtualAccount(): StoredAccount {
    return {
      id: 'viber-bot',
      provider: 'viber',
      accessToken: env('VIBER_BOT_TOKEN') ?? '',
      platformUserId: env('VIBER_CHANNEL_ID') ?? '',
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const token = account.accessToken || env('VIBER_BOT_TOKEN');
      if (!token) return { success: false, error: '缺少 VIBER_BOT_TOKEN' };

      // 广播消息到频道
      let body: Record<string, unknown>;
      if (content.media.length > 0) {
        const media = content.media[0];
        body = {
          sender: { name: 'SocialHub' },
          type: media.type === 'video' ? 'video' : 'picture',
          media: media.url,
          text: content.text,
        };
      } else {
        body = {
          sender: { name: 'SocialHub' },
          type: 'text',
          text: content.text,
        };
      }

      const res = await fetch(`https://chatapi.viber.com/broadcast/${account.platformUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Viber-Auth-Token': token,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `Viber API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as { status?: number; status_message?: string; message_token?: string };
      if (data.status !== 0 && data.status !== undefined) {
        return { success: false, error: `Viber: ${data.status_message ?? 'Unknown error'}` };
      }
      return {
        success: true,
        remoteId: data.message_token ? String(data.message_token) : undefined,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
