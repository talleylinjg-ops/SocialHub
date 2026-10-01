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

// Facebook —— Graph API
export class FacebookAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    icon: 'f',
    category: 'social',
    region: 'global',
    website: 'https://facebook.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: true, video: true, link: true,
    scheduling: true, multipleImages: true, maxImages: 10,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 63206,
    maxMedia: 10,
    supportedMediaTypes: ['image', 'video'],
    notes: '发布到主页(Page)需 pages_manage_posts 权限',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
  };

  isConfigured(): boolean {
    return !!(env('FACEBOOK_APP_ID') && env('FACEBOOK_APP_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('FACEBOOK_APP_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(','),
      state,
      response_type: 'code',
    });
    return { url };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const tokenUrl = `${this.oauth.tokenUrl}?${new URLSearchParams({
      client_id: env('FACEBOOK_APP_ID')!,
      client_secret: env('FACEBOOK_APP_SECRET')!,
      redirect_uri: opts.redirectUri,
      code,
    })}`;
    const tokenRes = await fetch(tokenUrl);
    const token = (await tokenRes.json()) as { access_token: string; expires_in?: number };
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${token.access_token}`
    );
    const me = (await meRes.json()) as { id: string; name: string };
    return {
      provider: 'facebook',
      displayName: me.name,
      accessToken: token.access_token,
      tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined,
      platformUserId: me.id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const pageId = account.platformUserId;
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.text,
          link: content.link,
          access_token: account.accessToken,
        }),
      });
      if (!res.ok) return { success: false, error: `Facebook API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { id: string };
      return {
        success: true,
        remoteId: data.id,
        remoteUrl: `https://facebook.com/${data.id}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}