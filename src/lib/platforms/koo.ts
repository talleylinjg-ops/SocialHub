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

// Koo —— 印度本土微博平台(印度版 Twitter)
// 文档: https://developer.kooapp.com/
export class KooAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'koo',
    name: 'Koo',
    color: '#EAB431',
    icon: 'K',
    category: 'microblog',
    region: 'India',
    website: 'https://kooapp.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: false,
    link: true,
    scheduling: false,
    multipleImages: true,
    maxImages: 4,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 500,
    maxMedia: 4,
    supportedMediaTypes: ['image'],
    notes: '印度/巴西微博平台;支持多语种(印地语/马拉地语/泰米尔语等)',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://kooapp.com/oauth/authorize',
    tokenUrl: 'https://api.kooapp.com/oauth/token',
    scopes: ['post:write', 'profile:read'],
  };

  isConfigured(): boolean {
    return !!(env('KOO_CLIENT_ID') && env('KOO_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('KOO_CLIENT_ID'),
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
        client_id: env('KOO_CLIENT_ID')!,
        client_secret: env('KOO_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      user_id?: string;
    };

    const meRes = await fetch('https://api.kooapp.com/v1/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as {
      name?: string;
      handle?: string;
      avatar_url?: string;
      id?: string;
    };
    return {
      provider: 'koo',
      displayName: me.name ?? 'Koo User',
      handle: me.handle,
      avatarUrl: me.avatar_url,
      accessToken: token.access_token,
      platformUserId: me.id ?? token.user_id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const body: Record<string, unknown> = { text: content.text };
      if (content.link) body.link = content.link;
      if (content.media.length > 0) {
        body.media = content.media.slice(0, 4).map((m) => ({ url: m.url, type: m.type }));
      }
      const res = await fetch('https://api.kooapp.com/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `Koo API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as {
        post_id?: string;
        post_url?: string;
        error?: string;
      };
      if (data.error) return { success: false, error: `Koo: ${data.error}` };
      return {
        success: true,
        remoteId: data.post_id,
        remoteUrl: data.post_url,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
