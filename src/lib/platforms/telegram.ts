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

// Telegram —— Bot API(通过 Bot 向频道/群组发布)
// 文档:https://core.telegram.org/bots/api#sendmessage
export class TelegramAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'telegram',
    name: 'Telegram',
    color: '#0088CC',
    icon: '✈',
    category: 'im',
    region: 'global',
    website: 'https://telegram.org',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: true,
    scheduling: false,
    multipleImages: true,
    maxImages: 10,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 4096,
    maxMedia: 10,
    supportedMediaTypes: ['image', 'video'],
    notes: '通过 Bot 发布到频道;channelId 需以 @ 开头或为数字负数',
  };

  // Telegram 使用 Bot Token,非 OAuth 流程
  readonly oauth: OAuthConfig = {
    authorizeUrl: '',
    tokenUrl: '',
    scopes: [],
  };

  isConfigured(): boolean {
    return !!(env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHANNEL_ID'));
  }

  // Telegram 跳过 OAuth,直接用 Bot Token + Channel ID
  async getAuthorizeUrl(): Promise<{ url: string; codeVerifier?: string }> {
    throw new Error('Telegram 使用 Bot Token 模式,无需 OAuth 授权。请在 .env 配置 TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHANNEL_ID');
  }

  async handleCallback(): Promise<AccountInfo> {
    throw new Error('Telegram 无回调流程');
  }

  // 直接构造一个虚拟账号用于发布
  buildVirtualAccount(): StoredAccount {
    return {
      id: 'telegram-bot',
      provider: 'telegram',
      accessToken: env('TELEGRAM_BOT_TOKEN') ?? '',
      platformUserId: env('TELEGRAM_CHANNEL_ID') ?? '',
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const token = account.accessToken || env('TELEGRAM_BOT_TOKEN');
      const chatId = account.platformUserId || env('TELEGRAM_CHANNEL_ID');
      if (!token || !chatId) {
        return { success: false, error: '缺少 TELEGRAM_BOT_TOKEN 或 TELEGRAM_CHANNEL_ID' };
      }
      const base = `https://api.telegram.org/bot${token}`;

      // 有媒体时用 sendPhoto / sendVideo
      if (content.media.length > 0) {
        const media = content.media[0];
        const endpoint = media.type === 'video' ? 'sendVideo' : 'sendPhoto';
        const field = media.type === 'video' ? 'video' : 'photo';
        const res = await fetch(`${base}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            caption: content.text.slice(0, 1024),
            [field]: media.url,
          }),
        });
        if (!res.ok) return { success: false, error: `Telegram API ${res.status}: ${await res.text()}` };
        const data = (await res.json()) as { result?: { message_id: number } };
        return {
          success: true,
          remoteId: String(data.result?.message_id ?? ''),
          remoteUrl: typeof chatId === 'string' && chatId.startsWith('@') ? `https://t.me/${chatId.slice(1)}` : undefined,
        };
      }

      // 纯文本
      const res = await fetch(`${base}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: content.text }),
      });
      if (!res.ok) return { success: false, error: `Telegram API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { result?: { message_id: number } };
      return {
        success: true,
        remoteId: String(data.result?.message_id ?? ''),
        remoteUrl: typeof chatId === 'string' && chatId.startsWith('@') ? `https://t.me/${chatId.slice(1)}` : undefined,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}