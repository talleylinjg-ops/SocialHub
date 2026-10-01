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

// LinkedIn —— Marketing API / Share API
export class LinkedInAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: 'in',
    category: 'professional',
    region: 'global',
    website: 'https://linkedin.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true, images: true, video: true, link: true,
    scheduling: false, multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 3000,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '个人动态走 ugcPosts;企业页走 organizations API',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['w_member_social', 'r_liteprofile'],
  };

  isConfigured(): boolean {
    return !!(env('LINKEDIN_CLIENT_ID') && env('LINKEDIN_CLIENT_SECRET'));
  }

  async getAuthorizeUrl(redirectUri: string, state: string) {
    const url = buildAuthorizeUrl(this.oauth.authorizeUrl, {
      client_id: env('LINKEDIN_CLIENT_ID'),
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
    const tokenRes = await fetch(this.oauth.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: env('LINKEDIN_CLIENT_ID')!,
        client_secret: env('LINKEDIN_CLIENT_SECRET')!,
        redirect_uri: opts.redirectUri,
      }),
    });
    const token = (await tokenRes.json()) as { access_token: string; expires_in?: number };
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { sub: string; name: string; picture?: string };
    return {
      provider: 'linkedin',
      displayName: me.name,
      avatarUrl: me.picture,
      accessToken: token.access_token,
      tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : undefined,
      platformUserId: me.sub,
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const authorUrn = `urn:li:person:${account.platformUserId}`;
      const body = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content.text },
            shareMediaCategory: content.media.length ? 'IMAGE' : 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      };
      const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { success: false, error: `LinkedIn API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { id: string };
      return { success: true, remoteId: data.id };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}