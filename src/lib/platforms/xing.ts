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

// XING —— 德语区职场社交平台(德国版 LinkedIn)
// 文档: https://dev.xing.com/
export class XINGAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'xing',
    name: 'XING',
    color: '#00B9AC',
    icon: 'X',
    category: 'professional',
    region: 'Germany',
    website: 'https://www.xing.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: false,
    video: false,
    link: true,
    scheduling: true,
    multipleImages: false,
    maxImages: 0,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 2000,
    maxMedia: 0,
    supportedMediaTypes: [],
    notes: '德语区职场平台;通过 Conversations API 发布动态',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://api.xing.com/v1/authorize',
    tokenUrl: 'https://api.xing.com/v1/access_token',
    scopes: ['user_posts:write', 'user_profile:read'],
  };

  isConfigured(): boolean {
    return !!(env('XING_CLIENT_ID') && env('XING_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('XING_CLIENT_ID'),
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
        client_id: env('XING_CLIENT_ID')!,
        client_secret: env('XING_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      user_id?: string;
    };

    const meRes = await fetch('https://api.xing.com/v1/users/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as {
      users?: Record<string, { display_name?: string; photo_url?: string; id?: string }>;
    };
    const userObj = Object.values(me.users ?? {})[0] ?? {};
    return {
      provider: 'xing',
      displayName: userObj.display_name ?? 'XING User',
      avatarUrl: userObj.photo_url,
      accessToken: token.access_token,
      platformUserId: userObj.id ?? token.user_id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const body: Record<string, unknown> = {
        text: content.text,
      };
      if (content.link) body.url = content.link;

      const res = await fetch('https://api.xing.com/v1/users/me/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `XING API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as { id?: string; post_url?: string; error?: string };
      if (data.error) return { success: false, error: `XING: ${data.error}` };
      return {
        success: true,
        remoteId: data.id,
        remoteUrl: data.post_url,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
