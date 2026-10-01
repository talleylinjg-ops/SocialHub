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

// TikTok —— Content Posting API(需企业认证 + 申请发布权限)
export class TikTokAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    icon: '♪',
    category: 'video',
    region: 'global',
    website: 'https://tiktok.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: false, video: true, link: false,
    scheduling: false, multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 2200,
    maxMedia: 1,
    supportedMediaTypes: ['video'],
    notes: '需申请 Content Posting API 权限;视频走 init→upload→publish 流程',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['video.publish'],
    extraParams: { tiktok_app_permissions_key: 'video.publish' },
  };

  isConfigured(): boolean {
    return !!(env('TIKTOK_CLIENT_KEY') && env('TIKTOK_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_key: env('TIKTOK_CLIENT_KEY'),
      scope: this.oauth.scopes.join(','),
      response_type: 'code',
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
        client_key: env('TIKTOK_CLIENT_KEY')!,
        client_secret: env('TIKTOK_CLIENT_SECRET')!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string; refresh_token?: string; expires_in?: number;
      open_id?: string;
    };
    return {
      provider: 'tiktok',
      displayName: 'TikTok Creator',
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined,
      platformUserId: token.open_id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const video = content.media.find((m) => m.type === 'video');
      if (!video) return { success: false, error: 'TikTok 需要视频媒体' };
      // 步骤1:初始化上传
      const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ post_info: { title: content.text.slice(0, 150), privacy_level: 'PUBLIC_TO_EVERYONE' } }),
      });
      if (!initRes.ok) return { success: false, error: `TikTok init ${await initRes.text()}` };
      const init = (await initRes.json()) as { data?: { publish_id: string } };
      return {
        success: true,
        remoteId: init.data?.publish_id,
        error: '已初始化发布会话,需后续上传视频字节流到返回地址',
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}