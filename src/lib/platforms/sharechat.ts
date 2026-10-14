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

// ShareChat —— 印度本土 15+ 语种社交平台
// 文档: https://sharechat.com/ (开放 API 受限,使用 OAuth 2.0 授权码模式)
export class ShareChatAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'sharechat',
    name: 'ShareChat',
    color: '#FE5622',
    icon: 'SC',
    category: 'social',
    region: 'India',
    website: 'https://sharechat.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: false,
    scheduling: false,
    multipleImages: true,
    maxImages: 5,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 3000,
    maxMedia: 5,
    supportedMediaTypes: ['image', 'video'],
    notes: '支持印地语/泰米尔语/泰卢固语等 15+ 印度语种发布',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://sharechat.com/oauth/authorize',
    tokenUrl: 'https://sharechat.com/oauth/token',
    scopes: ['post:write', 'profile:read'],
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('SHARECHAT_CLIENT_ID') && env('SHARECHAT_CLIENT_SECRET'));
  }

  /** 生成 ShareChat 分享链接 */
  getShareUrl(content: PublishContent): string {
    const text = encodeURIComponent(content.text);
    return `https://sharechat.com/share?text=${text}`;
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('SHARECHAT_CLIENT_ID'),
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
        client_id: env('SHARECHAT_CLIENT_ID')!,
        client_secret: env('SHARECHAT_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      user_id?: string;
    };

    const meRes = await fetch('https://api.sharechat.com/v1/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as {
      display_name?: string;
      avatar_url?: string;
      user_id?: string;
    };
    return {
      provider: 'sharechat',
      displayName: me.display_name ?? 'ShareChat User',
      avatarUrl: me.avatar_url,
      accessToken: token.access_token,
      platformUserId: me.user_id ?? token.user_id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const body: Record<string, unknown> = { text: content.text };
      if (content.media.length > 0) {
        body.media = content.media.map((m) => ({ url: m.url, type: m.type }));
      }
      const res = await fetch('https://api.sharechat.com/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { success: false, error: `ShareChat API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as { post_id?: string; post_url?: string; error?: string };
      if (data.error) return { success: false, error: `ShareChat: ${data.error}` };
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
