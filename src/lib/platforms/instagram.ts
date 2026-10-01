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

// Instagram —— Graph API(需 Business 账号,复用 Facebook OAuth)
export class InstagramAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    icon: '◉',
    category: 'image',
    region: 'global',
    website: 'https://instagram.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: true, video: true, link: false,
    scheduling: false, multipleImages: true, maxImages: 10,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 2200,
    maxMedia: 10,
    supportedMediaTypes: ['image', 'video'],
    notes: '必须为 Business 账号;图片/视频需先创建 media container 再发布',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish'],
  };

  isConfigured(): boolean {
    return !!(env('FACEBOOK_APP_ID') && env('FACEBOOK_APP_SECRET') && env('INSTAGRAM_BUSINESS_ACCOUNT_ID'));
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
    const tokenRes = await fetch(
      `${this.oauth.tokenUrl}?${new URLSearchParams({
        client_id: env('FACEBOOK_APP_ID')!,
        client_secret: env('FACEBOOK_APP_SECRET')!,
        redirect_uri: opts.redirectUri,
        code,
      })}`
    );
    const token = (await tokenRes.json()) as { access_token: string };
    return {
      provider: 'instagram',
      displayName: 'Instagram Business',
      accessToken: token.access_token,
      platformUserId: env('INSTAGRAM_BUSINESS_ACCOUNT_ID'),
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const igId = account.platformUserId ?? env('INSTAGRAM_BUSINESS_ACCOUNT_ID');
      // 步骤1:创建 media container
      const mediaRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
        method: 'POST',
        body: new URLSearchParams({
          image_url: content.media[0]?.url ?? '',
          caption: content.text,
          access_token: account.accessToken,
        }),
      });
      if (!mediaRes.ok) return { success: false, error: `IG media ${await mediaRes.text()}` };
      const media = (await mediaRes.json()) as { id: string };
      // 步骤2:发布
      const pubRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
        method: 'POST',
        body: new URLSearchParams({
          creation_id: media.id,
          access_token: account.accessToken,
        }),
      });
      if (!pubRes.ok) return { success: false, error: `IG publish ${await pubRes.text()}` };
      const data = (await pubRes.json()) as { id: string };
      return { success: true, remoteId: data.id, remoteUrl: `https://instagram.com/p/${data.id}` };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}