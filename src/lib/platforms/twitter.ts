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
import { generateRandomString, sha256Base64Url } from './base';

// Twitter / X —— OAuth 2.0 with PKCE
export class TwitterAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'twitter',
    name: 'Twitter / X',
    color: '#1DA1F2',
    icon: '𝕏',
    category: 'microblog',
    region: 'global',
    website: 'https://twitter.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: true,
    scheduling: false,
    multipleImages: true,
    maxImages: 4,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 280,
    maxMedia: 4,
    supportedMediaTypes: ['image', 'video'],
    notes: 'X Premium 订阅用户可达 25000 字符与更长视频',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    pkce: true,
    extraParams: { code_challenge_method: 'S256' },
  };

  isConfigured(): boolean {
    return !!(env('TWITTER_CLIENT_ID') && env('TWITTER_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const codeVerifier = generateRandomString(64);
    const challenge = await sha256Base64Url(codeVerifier);
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('TWITTER_CLIENT_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    return { url, codeVerifier };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const basic = btoa(`${env('TWITTER_CLIENT_ID')}:${env('TWITTER_CLIENT_SECRET')}`);
    const tokenRes = await fetch(this.oauth.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: opts.redirectUri,
        code_verifier: opts.codeVerifier ?? '',
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const meRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { data: { id: string; name: string; username: string } };
    return {
      provider: 'twitter',
      displayName: me.data.name,
      handle: `@${me.data.username}`,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiresAt: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000)
        : undefined,
      platformUserId: me.data.id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const body: Record<string, unknown> = { text: content.text };
      if (content.media.length > 0) {
        body.media = { media_ids: content.media.slice(0, 4).map((_, i) => String(i)) };
      }
      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${account.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `Twitter API ${res.status}: ${err}` };
      }
      const data = (await res.json()) as { data: { id: string } };
      return {
        success: true,
        remoteId: data.data.id,
        remoteUrl: `https://twitter.com/i/web/status/${data.data.id}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}