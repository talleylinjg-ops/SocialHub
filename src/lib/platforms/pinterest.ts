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

// Pinterest —— API v5
export class PinterestAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#BD081C',
    icon: 'P',
    category: 'image',
    region: 'global',
    website: 'https://pinterest.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: true, video: false, link: true,
    scheduling: false, multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 500,
    maxMedia: 1,
    supportedMediaTypes: ['image'],
    notes: '必须指定 board_id;图片为必填项',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: ['boards:read', 'pins:write'],
  };

  isConfigured(): boolean {
    return !!(env('PINTEREST_CLIENT_ID') && env('PINTEREST_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('PINTEREST_CLIENT_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(','),
      response_type: 'code',
      state,
    });
    return { url };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const basic = btoa(`${env('PINTEREST_CLIENT_ID')}:${env('PINTEREST_CLIENT_SECRET')}`);
    const tokenRes = await fetch(this.oauth.tokenUrl, {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: opts.redirectUri }),
    });
    const token = (await tokenRes.json()) as { access_token: string; refresh_token?: string };
    const meRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { username: string; account_type?: string };
    return {
      provider: 'pinterest',
      displayName: me.username,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      platformUserId: me.username,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const image = content.media.find((m) => m.type === 'image');
      if (!image) return { success: false, error: 'Pinterest 必须包含图片' };
      const res = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: account.platformUserId,
          title: content.text.slice(0, 100),
          description: content.text,
          media_source: { source_type: 'image_url', url: image.url },
          link: content.link,
        }),
      });
      if (!res.ok) return { success: false, error: `Pinterest API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { id: string };
      return {
        success: true,
        remoteId: data.id,
        remoteUrl: `https://pinterest.com/pin/${data.id}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}