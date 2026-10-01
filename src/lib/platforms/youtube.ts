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

// YouTube —— Google OAuth 2.0 + Data API v3(videos.insert)
export class YouTubeAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    icon: '▶',
    category: 'video',
    region: 'global',
    website: 'https://youtube.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: false, video: true, link: false,
    scheduling: false, multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 5000,
    maxMedia: 1,
    supportedMediaTypes: ['video'],
    notes: '标题最多 100 字符;需 youtube.upload scope',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    extraParams: { access_type: 'offline', prompt: 'consent' },
  };

  isConfigured(): boolean {
    return !!(env('YOUTUBE_CLIENT_ID') && env('YOUTUBE_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('YOUTUBE_CLIENT_ID'),
      redirect_uri: redirectUri,
      scope: this.oauth.scopes.join(' '),
      response_type: 'code',
      state,
      access_type: 'offline',
      prompt: 'consent',
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
        client_id: env('YOUTUBE_CLIENT_ID')!,
        client_secret: env('YOUTUBE_CLIENT_SECRET')!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as {
      access_token: string; refresh_token?: string; expires_in?: number;
    };
    const meRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    const me = (await meRes.json()) as { items?: Array<{ id: string; snippet: { title: string } }> };
    const ch = me.items?.[0];
    return {
      provider: 'youtube',
      displayName: ch?.snippet.title ?? 'YouTube Channel',
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined,
      platformUserId: ch?.id,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const video = content.media.find((m) => m.type === 'video');
      if (!video) return { success: false, error: 'YouTube 需要视频媒体' };
      const metadata = {
        snippet: { title: content.text.slice(0, 100), description: content.text },
        status: { privacyStatus: 'public' },
      };
      // 实际需 multipart/related 上传视频字节流,此处为 API 结构骨架
      const res = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/*',
          },
          body: JSON.stringify(metadata),
        }
      );
      if (!res.ok) return { success: false, error: `YouTube API ${res.status}: ${await res.text()}` };
      return {
        success: true,
        remoteUrl: res.headers.get('location') ?? undefined,
        error: '已创建可恢复上传会话,需后续上传视频字节流',
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}