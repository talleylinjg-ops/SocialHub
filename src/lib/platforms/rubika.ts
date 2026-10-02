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

// Rubika —— 伊朗本土即时通讯 + 社交平台
// 文档: https://rubika.ir/developer (Bot API 模式)
export class RubikaAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'rubika',
    name: 'Rubika',
    color: '#E91E63',
    icon: 'R',
    category: 'social',
    region: 'Iran',
    website: 'https://rubika.ir',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: false,
    scheduling: false,
    multipleImages: false,
    maxImages: 1,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 4096,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '伊朗本土 IM + 社交;通过 Bot API 向频道/群组发布',
  };

  // Rubika 使用 Bot Token 模式
  readonly oauth: OAuthConfig = {
    authorizeUrl: '',
    tokenUrl: '',
    scopes: [],
  };

  isConfigured(): boolean {
    return !!(env('RUBIKA_BOT_TOKEN') && env('RUBIKA_CHANNEL_ID'));
  }

  async getAuthorizeUrl(): Promise<{ url: string; codeVerifier?: string }> {
    throw new Error('Rubika 使用 Bot Token 模式,无需 OAuth。请在 .env 配置 RUBIKA_BOT_TOKEN');
  }

  async handleCallback(): Promise<AccountInfo> {
    throw new Error('Rubika 无回调流程');
  }

  buildVirtualAccount(): StoredAccount {
    return {
      id: 'rubika-bot',
      provider: 'rubika',
      accessToken: env('RUBIKA_BOT_TOKEN') ?? '',
      platformUserId: env('RUBIKA_CHANNEL_ID') ?? '',
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const token = account.accessToken || env('RUBIKA_BOT_TOKEN');
      const channelId = account.platformUserId || env('RUBIKA_CHANNEL_ID');
      if (!token || !channelId) {
        return { success: false, error: '缺少 RUBIKA_BOT_TOKEN 或 RUBIKA_CHANNEL_ID' };
      }

      // 向频道发送消息
      let method = 'sendMessage';
      const body: Record<string, unknown> = {
        chat_id: channelId,
      };

      if (content.media.length > 0) {
        const media = content.media[0];
        method = media.type === 'video' ? 'sendVideo' : 'sendPhoto';
        body['file'] = media.url;
        body['caption'] = content.text.slice(0, 1024);
      } else {
        body['text'] = content.text;
      }

      const res = await fetch(`https://api.rubika.ir/v1/bot/${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `Rubika API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as {
        ok?: boolean;
        result?: { message_id?: string };
        error?: string;
      };
      if (data.error) return { success: false, error: `Rubika: ${data.error}` };
      if (data.ok === false) return { success: false, error: 'Rubika: 请求失败' };
      return {
        success: true,
        remoteId: data.result?.message_id,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
