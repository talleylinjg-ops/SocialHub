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

// KakaoTalk —— Korea 主流 IM,通过 Kakao Talk Channel API
// 文档:https://developers.kakao.com/docs/latest/ko/message/rest-api
export class KakaoTalkAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'kakaotalk',
    name: 'KakaoTalk',
    color: '#FEE500',
    icon: 'K',
    category: 'im',
    region: 'Korea',
    website: 'https://kakaocorp.com/service/KakaoTalk',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: false,
    link: true,
    scheduling: false,
    multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 1000,
    maxMedia: 1,
    supportedMediaTypes: ['image'],
    notes: '通过 Kakao Talk Channel 发送;需 template_id',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
    tokenUrl: 'https://kauth.kakao.com/oauth/token',
    scopes: ['talk_message'],
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('KAKAO_REST_API_KEY') && env('KAKAO_ADMIN_KEY'));
  }

  /** 生成 KakaoTalk 分享链接 */
  getShareUrl(content: PublishContent): string {
    const text = encodeURIComponent(content.text);
    const url = content.link ? encodeURIComponent(content.link) : '';
    return url
      ? `https://sharer.kakao.com/talk/friends/picker?text=${text}&url=${url}`
      : `https://sharer.kakao.com/talk/friends/picker?text=${text}`;
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      response_type: 'code',
      client_id: env('KAKAO_REST_API_KEY'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(','),
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
        client_id: env('KAKAO_REST_API_KEY')!,
        client_secret: env('KAKAO_CLIENT_SECRET') ?? '',
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as { access_token: string; expires_in?: number };
    const meRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { id: number; properties?: { nickname?: string } };
    return {
      provider: 'kakaotalk',
      displayName: me.properties?.nickname ?? 'Kakao User',
      accessToken: env('KAKAO_ADMIN_KEY') ?? token.access_token,
      refreshToken: undefined,
      platformUserId: String(me.id),
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      // 使用默认模板发送文本消息
      const res = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          template_object: JSON.stringify({
            object_type: 'text',
            text: content.text,
            link: { web_url: content.link ?? 'https://kakao.com' },
            button_title: '查看',
          }),
        }),
      });
      if (!res.ok) return { success: false, error: `Kakao API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { result_code?: number };
      return { success: data.result_code === 0 };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}