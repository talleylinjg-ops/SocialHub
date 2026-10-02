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

// Zalo —— 越南国民级即时通讯 + 社交平台(越南第一 IM)
// 文档: https://developers.zalo.me/docs/api/
export class ZaloAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'zalo',
    name: 'Zalo',
    color: '#0068FF',
    icon: 'Z',
    category: 'im',
    region: 'Vietnam',
    website: 'https://zalo.me',
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
    maxTextLength: 2000,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '越南第一 IM;通过 Official Account API 向关注者发布消息',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://oauth.zaloapp.com/v4/oa/permission',
    tokenUrl: 'https://oauth.zaloapp.com/v4/oa/access_token',
    scopes: ['message', 'post'],
  };

  isConfigured(): boolean {
    return !!(env('ZALO_APP_ID') && env('ZALO_APP_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      app_id: env('ZALO_APP_ID'),
      redirect_uri: redirectUri,
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
        app_id: env('ZALO_APP_ID')!,
        app_secret: env('ZALO_APP_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const meRes = await fetch(
      `https://openapi.zalo.me/v2.0/oa/getprofile?access_token=${token.access_token}`
    );
    const me = (await meRes.json()) as {
      data?: { name?: string; avatar?: string; oa_id?: string };
    };
    const d = me.data ?? {};
    return {
      provider: 'zalo',
      displayName: d.name ?? 'Zalo OA',
      avatarUrl: d.avatar,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      platformUserId: d.oa_id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      // 向所有关注者广播消息
      const body: Record<string, unknown> = {
        recipient: { target: 'all' },
        message: { text: content.text },
      };
      if (content.media.length > 0 && content.media[0].type === 'image') {
        body.message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'media',
              elements: [{ media_type: 'image', media_url: content.media[0].url }],
            },
          },
        };
      }

      const res = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: account.accessToken,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `Zalo API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as { message_id?: string; error?: string };
      if (data.error) return { success: false, error: `Zalo: ${data.error}` };
      return {
        success: true,
        remoteId: data.message_id,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
