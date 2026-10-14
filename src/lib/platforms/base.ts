// 平台适配器统一契约 —— 整个框架的核心抽象
// 每个境外社媒平台实现此接口,即可被发布分发器统一调度

// ============ 发布内容(统一中间表示) ============
export interface PublishContent {
  text: string;
  media: MediaItem[];
  link?: string;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  altText?: string;
}

// ============ 平台能力声明 ============
export interface PlatformCapabilities {
  text: boolean;
  images: boolean;
  video: boolean;
  link: boolean;
  scheduling: boolean;
  multipleImages: boolean;
  maxImages?: number;
}

// ============ 平台限制(前端校验提示用) ============
export interface PlatformLimits {
  maxTextLength: number;
  maxMedia?: number;
  supportedMediaTypes: Array<'image' | 'video'>;
  notes?: string;
}

// ============ OAuth 配置 ============
export interface OAuthConfig {
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  pkce?: boolean;
  extraParams?: Record<string, string>;
}

// ============ 平台元信息 ============
export interface PlatformMeta {
  id: string;
  name: string;
  color: string;
  icon: string;
  category: PlatformCategory;
  region: string; // global / 地区
  website: string;
}

export type PlatformCategory =
  | 'microblog'
  | 'social'
  | 'video'
  | 'professional'
  | 'community'
  | 'image'
  | 'im';

// ============ 账号信息 ============
export interface AccountInfo {
  provider: string;
  displayName: string;
  handle?: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformUserId?: string;
  scope?: string;
}

// 已存储账号(取自数据库,用于 publish)
export interface StoredAccount {
  id: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  platformUserId?: string | null;
}

// ============ 发布结果 ============
export interface PublishResult {
  success: boolean;
  remoteId?: string;
  remoteUrl?: string;
  error?: string;
}

// ============ 校验结果 ============
export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

// ============ 适配器统一接口 ============
export interface SocialPlatformAdapter {
  readonly meta: PlatformMeta;
  readonly capabilities: PlatformCapabilities;
  readonly limits: PlatformLimits;
  readonly oauth: OAuthConfig;

  // 返回授权 URL,若使用 PKCE 同时返回 codeVerifier 供调用方临时存储(cookie)
  getAuthorizeUrl(
    redirectUri: string,
    state: string
  ): Promise<{ url: string; codeVerifier?: string }>;
  // 用回调 code 换取 token 并返回账号信息
  handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo>;
  publish(content: PublishContent, account: StoredAccount): Promise<PublishResult>;
  validate?(content: PublishContent): ValidationResult;
  /** 是否已配置有效凭证(运行时检测) */
  isConfigured(): boolean;
  /** 是否为分享链接模式(无需 API/无需绑定账号) */
  isShareLinkMode?(): boolean;
  /** 生成分享链接(仅 share-link 模式平台实现) */
  getShareUrl?(content: PublishContent): string;
}

// ============ 抽象基类:提供默认 validate 实现 ============
export abstract class BasePlatformAdapter implements SocialPlatformAdapter {
  abstract readonly meta: PlatformMeta;
  abstract readonly capabilities: PlatformCapabilities;
  abstract readonly limits: PlatformLimits;
  abstract readonly oauth: OAuthConfig;

  abstract getAuthorizeUrl(
    redirectUri: string,
    state: string
  ): Promise<{ url: string; codeVerifier?: string }>;
  abstract handleCallback(
    code: string,
    opts: { codeVerifier?: string; redirectUri: string }
  ): Promise<AccountInfo>;
  abstract publish(content: PublishContent, account: StoredAccount): Promise<PublishResult>;
  abstract isConfigured(): boolean;

  isShareLinkMode(): boolean {
    return false;
  }

  validate(content: PublishContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (content.text.length > this.limits.maxTextLength) {
      errors.push(
        `文案超出 ${this.meta.name} 字数上限(最多 ${this.limits.maxTextLength} 字,当前 ${content.text.length} 字)`
      );
    }

    const maxMedia = this.limits.maxMedia ?? 0;
    if (content.media.length > maxMedia) {
      warnings.push(`${this.meta.name} 最多 ${maxMedia} 个媒体,将仅发布前 ${maxMedia} 个`);
    }

    for (const m of content.media.slice(0, maxMedia)) {
      if (!this.limits.supportedMediaTypes.includes(m.type)) {
        errors.push(`${this.meta.name} 不支持${m.type === 'image' ? '图片' : '视频'}格式`);
      }
    }

    return { valid: errors.length === 0, warnings, errors };
  }
}

// ============ OAuth 辅助:生成 PKCE code_verifier / code_challenge ============
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) result += chars[bytes[i] % chars.length];
  return result;
}

export async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}