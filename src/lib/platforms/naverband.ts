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

// Naver Band —— 韩国 Naver 旗下社群社交平台
// 文档: https://developers.naver.com/docs/band-apis/
export class NaverBandAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'naverband',
    name: 'Naver Band',
    color: '#00C73C',
    icon: 'B',
    category: 'social',
    region: 'Korea',
    website: 'https://band.us',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: false,
    link: true,
    scheduling: false,
    multipleImages: true,
    maxImages: 10,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 5000,
    maxMedia: 10,
    supportedMediaTypes: ['image'],
    notes: '发布到 Band 群组帖子;需 band.write 权限',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://band.us/oauth/authorize',
    tokenUrl: 'https://api.band.us/oauth2/access_token',
    scopes: ['band.write', 'band.read'],
  };

  isConfigured(): boolean {
    return !!(env('NAVER_BAND_CLIENT_ID') && env('NAVER_BAND_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('NAVER_BAND_CLIENT_ID'),
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
        grant_type: 'authorization_code',
        code,
        client_id: env('NAVER_BAND_CLIENT_ID')!,
        client_secret: env('NAVER_BAND_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      user_key?: string;
    };
    // 获取用户信息
    const meRes = await fetch(
      `https://api.band.us/v2.1/profile?access_token=${token.access_token}`
    );
    const me = (await meRes.json()) as {
      result_data?: { name?: string; profile_url?: string; user_key?: string };
    };
    const d = me.result_data ?? {};
    return {
      provider: 'naverband',
      displayName: d.name ?? 'Naver Band User',
      avatarUrl: d.profile_url,
      accessToken: token.access_token,
      platformUserId: d.user_key ?? token.user_key,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      // 创建帖子
      const params = new URLSearchParams({
        access_token: account.accessToken,
        band_id: env('NAVER_BAND_BAND_ID') ?? '',
        content: content.text,
      });
      if (content.link) params.set('do_external_url', content.link);

      const res = await fetch('https://api.band.us/v2.2/create_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      if (!res.ok) {
        return { success: false, error: `Naver Band API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as {
        result_data?: { post_key?: string; band_key?: string };
        result?: { error_msg?: string };
      };
      if (data.result?.error_msg) {
        return { success: false, error: `Naver Band: ${data.result.error_msg}` };
      }
      const postKey = data.result_data?.post_key ?? '';
      const bandKey = data.result_data?.band_key ?? '';
      return {
        success: true,
        remoteId: postKey,
        remoteUrl: `https://band.us/band/${bandKey}/post/${postKey}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
