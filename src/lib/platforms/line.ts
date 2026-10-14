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

// LINE —— Japan 主流 IM,通过 LINE Official Account / Messaging API
// 文档:https://developers.line.biz/en/docs/messaging-api/
export class LINEAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'line',
    name: 'LINE',
    color: '#06C755',
    icon: 'L',
    category: 'im',
    region: 'Japan',
    website: 'https://line.me',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: true,
    scheduling: false,
    multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 5000,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '通过 LINE Official Account 广播消息;需 channel access token',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://access.line.me/oauth2/v2.1/authorize',
    tokenUrl: 'https://api.line.me/oauth2/v2.1/token',
    scopes: ['profile', 'openid'],
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('LINE_CHANNEL_ID') && env('LINE_CHANNEL_ACCESS_TOKEN'));
  }

  /** 生成 LINE 分享链接 */
  getShareUrl(content: PublishContent): string {
    const text = encodeURIComponent(content.text + (content.link ? `\n${content.link}` : ''));
    return `https://line.me/R/msg/text/?${text}`;
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('LINE_CHANNEL_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(' '),
      state,
    });
    return { url };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const tokenRes = await fetch(this.oauth.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: env('LINE_CHANNEL_ID')!,
        client_secret: env('LINE_CHANNEL_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as { access_token: string; expires_in?: number };
    const meRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { userId: string; displayName: string; pictureUrl?: string };
    return {
      provider: 'line',
      displayName: me.displayName,
      avatarUrl: me.pictureUrl,
      accessToken: env('LINE_CHANNEL_ACCESS_TOKEN') ?? token.access_token,
      platformUserId: me.userId,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const token = account.accessToken || env('LINE_CHANNEL_ACCESS_TOKEN');
      let body: Record<string, unknown>;

      if (content.media.length > 0) {
        const m = content.media[0];
        body = {
          messages: [
            m.type === 'video'
              ? { type: 'video', originalContentUrl: m.url, previewImageUrl: m.url }
              : { type: 'image', originalContentUrl: m.url, previewImageUrl: m.url },
          ],
        };
      } else {
        body = { messages: [{ type: 'text', text: content.text }] };
      }

      const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { success: false, error: `LINE API ${res.status}: ${await res.text()}` };
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}