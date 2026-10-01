import type { SocialPlatformAdapter, PlatformMeta, PlatformCategory } from './base';
import { TwitterAdapter } from './twitter';
import { FacebookAdapter } from './facebook';
import { InstagramAdapter } from './instagram';
import { YouTubeAdapter } from './youtube';
import { TikTokAdapter } from './tiktok';
import { LinkedInAdapter } from './linkedin';
import { RedditAdapter } from './reddit';
import { PinterestAdapter } from './pinterest';
import { VKAdapter } from './vk';
import { TelegramAdapter } from './telegram';
import { SnapchatAdapter } from './snapchat';
import { WhatsAppAdapter } from './whatsapp';
import { LINEAdapter } from './line';
import { KakaoTalkAdapter } from './kakaotalk';

// ============ 平台注册表 ============
// 新增平台只需在此实例化注册,发布分发器自动支持。
const adapters: SocialPlatformAdapter[] = [
  new TwitterAdapter(),
  new FacebookAdapter(),
  new InstagramAdapter(),
  new YouTubeAdapter(),
  new TikTokAdapter(),
  new LinkedInAdapter(),
  new RedditAdapter(),
  new PinterestAdapter(),
  new VKAdapter(),
  new TelegramAdapter(),
  new SnapchatAdapter(),
  new WhatsAppAdapter(),
  new LINEAdapter(),
  new KakaoTalkAdapter(),
];

const adapterMap = new Map<string, SocialPlatformAdapter>(
  adapters.map((a) => [a.meta.id, a])
);

export function getAdapter(id: string): SocialPlatformAdapter | undefined {
  return adapterMap.get(id);
}

export function getAllAdapters(): SocialPlatformAdapter[] {
  return adapters;
}

export function getConfiguredAdapters(): SocialPlatformAdapter[] {
  return adapters.filter((a) => a.isConfigured());
}

export function getAllPlatformMetas(): PlatformMeta[] {
  return adapters.map((a) => a.meta);
}

export { adapters };
export type { PlatformCategory } from './base';