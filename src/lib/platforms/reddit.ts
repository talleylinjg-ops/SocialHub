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

// Reddit —— OAuth 2.0 + API
export class RedditAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    icon: '◉',
    category: 'community',
    region: 'global',
    website: 'https://reddit.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: true, video: false, link: true,
    scheduling: false, multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 40000,
    maxMedia: 1,
    supportedMediaTypes: ['image'],
    notes: '需指定 subreddit;标题最多 300 字符',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scopes: ['submit', 'identity'],
    extraParams: { duration: 'permanent' },
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('REDDIT_CLIENT_ID') && env('REDDIT_CLIENT_SECRET'));
  }

  /** 生成 Reddit 分享链接 */
  getShareUrl(content: PublishContent): string {
    const title = encodeURIComponent(content.text.slice(0, 300));
    const url = content.link ? encodeURIComponent(content.link) : '';
    return url
      ? `https://www.reddit.com/submit?title=${title}&url=${url}`
      : `https://www.reddit.com/submit?title=${title}`;
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('REDDIT_CLIENT_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(' '),
      response_type: 'code',
      state,
      duration: 'permanent',
    });
    return { url };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const basic = btoa(`${env('REDDIT_CLIENT_ID')}:${env('REDDIT_CLIENT_SECRET')}`);
    const tokenRes = await fetch(this.oauth.tokenUrl, {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: opts.redirectUri }),
    });
    const token = (await tokenRes.json()) as { access_token: string; refresh_token?: string };
    const meRes = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: { Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'SocialDistributor/1.0' },
    });
    const me = (await meRes.json()) as { id: string; name: string };
    return {
      provider: 'reddit',
      displayName: `u/${me.name}`,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      platformUserId: me.id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const subreddit = 'test';
      const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SocialDistributor/1.0',
        },
        body: new URLSearchParams({
          kind: content.media.length ? 'image' : 'self',
          sr: subreddit,
          title: content.text.slice(0, 300),
          text: content.text,
          url: content.media[0]?.url ?? '',
        }),
      });
      if (!res.ok) return { success: false, error: `Reddit API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { jquery?: Array<Array<string>> };
      const permalink = data.jquery?.find((a) => a?.[3]?.includes('/comments/'))?.[3];
      return {
        success: true,
        remoteUrl: permalink ? `https://reddit.com${permalink}` : undefined,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}