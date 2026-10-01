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

// WhatsApp —— Cloud API (Meta)
// 文档:https://developers.facebook.com/docs/whatsapp/cloud-api
export class WhatsAppAdapter extends BasePlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#25D366',
    icon: '✆',
    category: 'im',
    region: 'global',
    website: 'https://whatsapp.com',
  };

  readonly capabilities: PlatformCapabilities = {
    text: true,
    images: true,
    video: true,
    link: false,
    scheduling: false,
    multipleImages: false,
  };

  readonly limits: PlatformLimits = {
    maxTextLength: 4096,
    maxMedia: 1,
    supportedMediaTypes: ['image', 'video'],
    notes: '通过 Cloud API 发送消息;需 phone_number_id 与接收方号码',
  };

  readonly oauth: OAuthConfig = {
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['whatsapp_business_messaging'],
  };

  isConfigured(): boolean {
    return !!(env('WHATSAPP_PHONE_NUMBER_ID') && env('WHATSAPP_ACCESS_TOKEN'));
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
      provider: 'whatsapp',
      displayName: 'WhatsApp Business',
      accessToken: token.access_token,
      platformUserId: env('WHATSAPP_PHONE_NUMBER_ID'),
    };
  }

  async publish(content: PublishContent, account: StoredAccount): Promise<PublishResult> {
    try {
      const phoneNumberId = account.platformUserId ?? env('WHATSAPP_PHONE_NUMBER_ID');
      const recipient = env('WHATSAPP_RECIPIENT');
      if (!recipient) return { success: false, error: '缺少 WHATSAPP_RECIPIENT(接收方号码)' };

      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const body = content.media.length
        ? {
            messaging_product: 'whatsapp',
            to: recipient,
            type: content.media[0].type === 'video' ? 'video' : 'image',
            [content.media[0].type === 'video' ? 'video' : 'image']: { link: content.media[0].url },
            caption: content.text,
          }
        : {
            messaging_product: 'whatsapp',
            to: recipient,
            type: 'text',
            text: { body: content.text },
          };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken || env('WHATSAPP_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { success: false, error: `WhatsApp API ${res.status}: ${await res.text()}` };
      const data = (await res.json()) as { messages?: Array<{ id: string }> };
      return {
        success: true,
        remoteId: data.messages?.[0]?.id,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}