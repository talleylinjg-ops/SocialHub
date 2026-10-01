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

// Snapchat —— Snap Kit Marketing API
// 文档:https://kit.snapchat.com/marketing-api
export class SnapchatAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'snapchat',
    name: 'Snapchat',
    color: '#FFFC00',
    icon: '👻',
    category: 'image',
    region: 'global',
    website: 'https://snapchat.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: false,
    images: true,
    video: true,
    link: false,
    scheduling: true,
    multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 250,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '通过 Marketing API 创建 Snap Ad;需广告账户(ad_account_id)',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://accounts.snapchat.com/accounts/oauth2',
    tokenUrl: 'https://accounts.snapchat.com/accounts/oauth2/token',
    scopes: ['snapshots', 'media', 'ads'],
    extraParams: { response_type: 'code' },
  };

  isConfigured(): boolean {
    return !!(env('SNAPCHAT_CLIENT_ID') && env('SNAPCHAT_CLIENT_SECRET') && env('SNAPCHAT_AD_ACCOUNT_ID'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('SNAPCHAT_CLIENT_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(' '),
      response_type: 'code',
      state,
    });
    return { url };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const basic = btoa(`${env('SNAPCHAT_CLIENT_ID')}:${env('SNAPCHAT_CLIENT_SECRET')}`);
    const tokenRes = await fetch(this.oauth.tokenUrl, {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: opts.redirectUri }),
    });
    const token = (await tokenRes.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
    const meRes = await fetch('https://marketingapi.snapchat.com/v1/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { id: string; display_name?: string };
    return {
      provider: 'snapchat',
      displayName: me.display_name ?? 'Snapchat Ads',
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined,
      platformUserId: env('SNAPCHAT_AD_ACCOUNT_ID'),
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const media = content.media[0];
      if (!media) return { success: false, error: 'Snapchat 必须包含图片或视频' };
      const adAccountId = account.platformUserId ?? env('SNAPCHAT_AD_ACCOUNT_ID');

      // 步骤1:上传媒体
      const mediaRes = await fetch('https://marketingapi.snapchat.com/v1/adaccounts/' + adAccountId + '/media', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media: [{ name: content.text.slice(0, 50) || 'media', type: media.type === 'video' ? 'VIDEO' : 'IMAGE' }],
        }),
      });
      if (!mediaRes.ok) return { success: false, error: `Snapchat media ${mediaRes.status}: ${await mediaRes.text()}` };
      return {
        success: true,
        error: '已创建媒体资产,需后续配置 Ad Creative 与 Campaign 才能正式投放',
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}