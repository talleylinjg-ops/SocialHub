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

// VKontakte —— Russia 主流社交平台
// 文档:https://dev.vk.com/method/wall.post
export class VKAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'vk',
    name: 'VKontakte',
    color: '#0077FF',
    icon: 'VK',
    category: 'social',
    region: 'Russia',
    website: 'https://vk.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: true,
    scheduling: true,
    multipleImages: true,
    maxImages: 10,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 16000,
    maxMedia: 10,
    supportedMediaTypes: ['image', 'video'],
    notes: '发布到墙(wall.post);需 wall 权限;可指定群组 owner_id(负数)',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://oauth.vk.com/authorize',
    tokenUrl: 'https://oauth.vk.com/access_token',
    scopes: ['wall', 'photos', 'groups', 'offline'],
    extraParams: { v: '5.199' },
  };

  isConfigured(): boolean {
    return true; // 分享链接模式始终可用
  }

  isShareLinkMode(): boolean {
    return !(env('VK_CLIENT_ID') && env('VK_CLIENT_SECRET'));
  }

  /** 生成 VK 分享链接 */
  getShareUrl(content: PublishContent): string {
    const url = content.link ? encodeURIComponent(content.link) : '';
    const text = encodeURIComponent(content.text);
    return `https://vk.com/share.php?${url ? `url=${url}&` : ''}title=${text}`;
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('VK_CLIENT_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(','),
      response_type: 'code',
      state,
      v: '5.199',
    });
    return { url };
  }

  async handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo> {
    const tokenRes = await fetch(
      `${this.oauth.tokenUrl}?${new URLSearchParams({
        client_id: env('VK_CLIENT_ID')!,
        client_secret: env('VK_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
        code,
      })}`
    );
    const token = (await tokenRes.json()) as {
      access_token: string;
      user_id: number;
      expires_in?: number;
    };
    const meRes = await fetch(
      `https://api.vk.com/method/users.get?user_ids=${token.user_id}&fields=photo_100&v=5.199&access_token=${token.access_token}`
    );
    const me = (await meRes.json()) as {
      response: Array<{ id: number; first_name: string; last_name: string; photo_100?: string }>;
    };
    const u = me.response[0];
    return {
      provider: 'vk',
      displayName: `${u.first_name} ${u.last_name}`,
      avatarUrl: u.photo_100,
      accessToken: token.access_token,
      platformUserId: String(token.user_id),
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const params = new URLSearchParams({
        message: content.text,
        access_token: account.accessToken,
        v: '5.199',
        from_group: '1',
      });
      if (content.link) params.set('copyright', content.link);

      const res = await fetch(`https://api.vk.com/method/wall.post?${params}`, {
        method: 'POST',
      });
      if (!res.ok) {
        return { success: false, error: `VK API ${res.status}: ${await res.text()}` };
      }
      const data = (await res.json()) as {
        response?: { post_id: number };
        error?: { error_msg: string };
      };
      if (data.error) {
        return { success: false, error: `VK: ${data.error.error_msg}` };
      }
      const postId = data.response?.post_id;
      const ownerId = account.platformUserId ?? '';
      return {
        success: true,
        remoteId: String(postId),
        remoteUrl: `https://vk.com/wall${ownerId}_${postId}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}