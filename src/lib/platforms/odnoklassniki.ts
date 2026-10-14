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

// Odnoklassniki (OK) —— 俄罗斯第二大社交平台
// 文档: https://apiok.ru/dev/methods/
export class OdnoklassnikiAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'odnoklassniki',
    name: 'Odnoklassniki',
    color: '#EE8208',
    icon: 'OK',
    category: 'social',
    region: 'Russia',
    website: 'https://ok.ru',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: true,
    scheduling: false,
    multipleImages: true,
    maxImages: 10,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 32000,
    maxMedia: 10,
    supportedMediaTypes: ['image', 'video'],
    notes: '俄罗斯/前苏联国家流行社交;通过 mediatopic.post 发布',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://connect.ok.ru/oauth/authorize',
    tokenUrl: 'https://api.ok.ru/oauth/token.do',
    scopes: ['VALUABLE_ACCESS', 'GROUP_CONTENT'],
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('OK_CLIENT_ID') && env('OK_CLIENT_SECRET') && env('OK_PUBLIC_KEY'));
  }

  /** 生成 Odnoklassniki 分享链接 */
  getShareUrl(content: PublishContent): string {
    const url = content.link ? encodeURIComponent(content.link) : '';
    const text = encodeURIComponent(content.text);
    return `https://connect.ok.ru/offer?${url ? `url=${url}&` : ''}title=${text}`;
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('OK_CLIENT_ID'),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.oauth.scopes.join(';'),
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
        client_id: env('OK_CLIENT_ID')!,
        client_secret: env('OK_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string;
      user_id?: string;
    };

    // 获取用户信息
    const meRes = await fetch(
      `https://api.ok.ru/fb.do?method=users.getCurrentUser&access_token=${token.access_token}&application_key=${env('OK_PUBLIC_KEY')}&format=json`
    );
    const me = (await meRes.json()) as {
      name?: string;
      first_name?: string;
      last_name?: string;
      pic_1?: string;
      uid?: string;
    };
    const displayName = me.name ?? (`${me.first_name ?? ''} ${me.last_name ?? ''}`.trim() || 'OK User');
    return {
      provider: 'odnoklassniki',
      displayName,
      avatarUrl: me.pic_1,
      accessToken: token.access_token,
      platformUserId: me.uid ?? token.user_id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      // 发布 mediatopic 到群组
      const attachment = JSON.stringify({
        media: [{ type: 'text', text: content.text }],
      });
      const gid = env('OK_GROUP_ID') ?? '';
      const params = new URLSearchParams({
        gid: gid,
        type: 'GROUP_THEME',
        attachment: attachment,
        access_token: account.accessToken,
        application_key: env('OK_PUBLIC_KEY')!,
        format: 'json',
      });

      const res = await fetch(`https://api.ok.ru/mediatopic.post?${params}`, {
        method: 'POST',
      });
      if (!res.ok) {
        return { success: false, error: `OK API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as {
        id?: string | { topic_id: string };
        error_code?: number;
        error_msg?: string;
      };
      if (data.error_code) {
        return { success: false, error: `OK: ${data.error_msg ?? 'Error ' + data.error_code}` };
      }
      const topicId = typeof data.id === 'object' ? data.id?.topic_id : data.id;
      return {
        success: true,
        remoteId: topicId,
        remoteUrl: gid ? `https://ok.ru/group/${gid}/topic/${topicId}` : undefined,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
