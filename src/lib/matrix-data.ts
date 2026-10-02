// 全球社媒矩阵数据 —— 按国家/地区列出头部社媒平台
// 覆盖全球 50+ 语言/国家的主流社媒。status 表示当前框架对接状态:
//   live = 已实现适配器(14 个平台)
//   planned = 架构支持,待开发适配器
//   external = 第三方/受限,需通过其他方式

export interface RegionalPlatform {
  name: string;
  status: 'live' | 'planned' | 'external';
  category: PlatformCategory;
  users: string; // 该国/地区月活规模
  notes: string;
}

export type { PlatformCategory } from '@/lib/platforms/base';
import type { PlatformCategory } from '@/lib/platforms/base';

export interface CountryPlatforms {
  country: string;
  flag: string;
  region: string;
  language: string; // 主要语言
  platforms: RegionalPlatform[];
}

// 区域列表(供前端筛选 tab 使用)
export const regions = [
  'global',
  'North America',
  'East Asia',
  'South Asia',
  'Southeast Asia',
  'South America',
  'Western Europe',
  'Northern Europe',
  'Eastern Europe',
  'Middle East & Central Asia',
  'Africa',
] as const;

export const globalSocialMediaMatrix: CountryPlatforms[] = [
  // ==================== 全球通用 ====================
  {
    country: '全球通用',
    flag: '🌍',
    region: 'global',
    language: '多语言',
    platforms: [
      { name: 'Twitter / X', status: 'live', category: 'microblog', users: '5.5亿', notes: '已对接 · OAuth 2.0 PKCE' },
      { name: 'Facebook', status: 'live', category: 'social', users: '30亿', notes: '已对接 · Graph API v19' },
      { name: 'Instagram', status: 'live', category: 'image', users: '20亿', notes: '已对接 · Graph API' },
      { name: 'YouTube', status: 'live', category: 'video', users: '25亿', notes: '已对接 · Data API v3' },
      { name: 'TikTok', status: 'live', category: 'video', users: '15亿', notes: '已对接 · Content Posting API' },
      { name: 'LinkedIn', status: 'live', category: 'professional', users: '10亿', notes: '已对接 · Share API' },
      { name: 'Reddit', status: 'live', category: 'community', users: '8.5亿', notes: '已对接 · OAuth 2.0' },
      { name: 'Pinterest', status: 'live', category: 'image', users: '4.9亿', notes: '已对接 · API v5' },
      { name: 'Telegram', status: 'live', category: 'im', users: '9亿', notes: '已对接 · Bot API' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '20亿', notes: '已对接 · Cloud API' },
      { name: 'Snapchat', status: 'live', category: 'image', users: '8亿', notes: '已对接 · Snap Kit' },
      { name: 'LINE', status: 'live', category: 'im', users: '2亿', notes: '已对接 · Messaging API' },
      { name: 'KakaoTalk', status: 'live', category: 'im', users: '5700万', notes: '已对接 · Channel API' },
      { name: 'VKontakte', status: 'live', category: 'social', users: '1亿', notes: '已对接 · wall.post API' },
    ],
  },

  // ==================== 北美 ====================
  {
    country: '美国',
    flag: '🇺🇸',
    region: 'North America',
    language: '英语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '2.4亿', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '2.4亿', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1.6亿', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1.5亿', notes: '已对接' },
      { name: 'Reddit', status: 'live', category: 'community', users: '8000万', notes: '已对接' },
    ],
  },
  {
    country: '加拿大',
    flag: '🇨🇦',
    region: 'North America',
    language: '英语 / 法语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '2500万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '2400万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1800万', notes: '已对接' },
      { name: 'LinkedIn', status: 'live', category: 'professional', users: '1900万', notes: '已对接' },
    ],
  },

  // ==================== 东亚 ====================
  {
    country: '日本',
    flag: '🇯🇵',
    region: 'East Asia',
    language: '日语',
    platforms: [
      { name: 'LINE', status: 'live', category: 'im', users: '9500万', notes: '已对接 · 国民级 IM' },
      { name: 'Twitter / X', status: 'live', category: 'microblog', users: '6700万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '5500万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '7800万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '2000万', notes: '已对接' },
    ],
  },
  {
    country: '韩国',
    flag: '🇰🇷',
    region: 'East Asia',
    language: '韩语',
    platforms: [
      { name: 'KakaoTalk', status: 'live', category: 'im', users: '4900万', notes: '已对接 · 国民级 IM' },
      { name: 'Instagram', status: 'live', category: 'image', users: '2300万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '4600万', notes: '已对接' },
      { name: 'Naver Band', status: 'live', category: 'social', users: '3000万', notes: '已对接 · Naver Band API' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1000万', notes: '已对接' },
    ],
  },
  {
    country: '蒙古',
    flag: '🇲🇳',
    region: 'East Asia',
    language: '蒙古语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '220万', notes: '已对接 · 蒙古最大社媒' },
      { name: 'TikTok', status: 'live', category: 'video', users: '150万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '130万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '180万', notes: '已对接' },
    ],
  },

  // ==================== 南亚 ====================
  {
    country: '印度',
    flag: '🇮🇳',
    region: 'South Asia',
    language: '印地语 / 马拉地语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '4.8亿', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '4.6亿', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '3.6亿', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '3.5亿', notes: '已对接' },
      { name: 'ShareChat', status: 'live', category: 'social', users: '1.8亿', notes: '已对接 · 印度本土 15+ 语种' },
      { name: 'Koo', status: 'live', category: 'microblog', users: '6000万', notes: '已对接 · 印度版 Twitter' },
    ],
  },
  {
    country: '巴基斯坦',
    flag: '🇵🇰',
    region: 'South Asia',
    language: '乌尔都语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '1.1亿', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '6000万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '7000万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '5500万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '2000万', notes: '已对接' },
    ],
  },
  {
    country: '孟加拉国',
    flag: '🇧🇩',
    region: 'South Asia',
    language: '孟加拉语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '5000万', notes: '已对接 · 国民级社媒' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '4000万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '3500万', notes: '已对接' },
      { name: 'Imo', status: 'live', category: 'im', users: '3000万', notes: '已对接 · 本土 IM Bot API' },
      { name: 'TikTok', status: 'live', category: 'video', users: '2500万', notes: '已对接' },
    ],
  },
  {
    country: '尼泊尔',
    flag: '🇳🇵',
    region: 'South Asia',
    language: '尼泊尔语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '1200万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1000万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1100万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '900万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '400万', notes: '已对接' },
    ],
  },
  {
    country: '斯里兰卡',
    flag: '🇱🇰',
    region: 'South Asia',
    language: '泰米尔语 / 僧伽罗语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '600万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '500万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '550万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '200万', notes: '已对接' },
    ],
  },

  // ==================== 东南亚 ====================
  {
    country: '印度尼西亚',
    flag: '🇮🇩',
    region: 'Southeast Asia',
    language: '印尼语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '1.1亿', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1亿', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '1.3亿', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1.2亿', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1.4亿', notes: '已对接' },
    ],
  },
  {
    country: '越南',
    flag: '🇻🇳',
    region: 'Southeast Asia',
    language: '越南语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '7000万', notes: '已对接 · 国民级社媒' },
      { name: 'Zalo', status: 'live', category: 'im', users: '7500万', notes: '已对接 · 越南第一 IM OA API' },
      { name: 'TikTok', status: 'live', category: 'video', users: '5000万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '6000万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1400万', notes: '已对接' },
    ],
  },
  {
    country: '泰国',
    flag: '🇹🇭',
    region: 'Southeast Asia',
    language: '泰语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '5000万', notes: '已对接' },
      { name: 'LINE', status: 'live', category: 'im', users: '4800万', notes: '已对接 · 国民级 IM' },
      { name: 'TikTok', status: 'live', category: 'video', users: '4000万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '5600万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '2000万', notes: '已对接' },
    ],
  },
  {
    country: '菲律宾',
    flag: '🇵🇭',
    region: 'Southeast Asia',
    language: '菲律宾语 / 英语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '8000万', notes: '已对接 · 国民级社媒' },
      { name: 'YouTube', status: 'live', category: 'video', users: '7000万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '5000万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '2000万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '3000万', notes: '已对接' },
    ],
  },
  {
    country: '马来西亚',
    flag: '🇲🇾',
    region: 'Southeast Asia',
    language: '马来语 / 英语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '2500万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '2400万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1700万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1500万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '2200万', notes: '已对接' },
    ],
  },
  {
    country: '缅甸',
    flag: '🇲🇲',
    region: 'Southeast Asia',
    language: '缅甸语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '3000万', notes: '已对接 · 国民级社媒' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1600万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1400万', notes: '已对接' },
      { name: 'Viber', status: 'live', category: 'im', users: '800万', notes: '已对接 · 本土 IM Bot API' },
    ],
  },
  {
    country: '老挝',
    flag: '🇱🇦',
    region: 'Southeast Asia',
    language: '老挝语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '500万', notes: '已对接 · 国民级社媒' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '400万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '350万', notes: '已对接' },
      { name: 'LINE', status: 'live', category: 'im', users: '200万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '450万', notes: '已对接' },
    ],
  },

  // ==================== 南美洲 ====================
  {
    country: '巴西',
    flag: '🇧🇷',
    region: 'South America',
    language: '葡萄牙语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '1.4亿', notes: '已对接 · 国民级 IM' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1.2亿', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1.4亿', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '8000万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '9000万', notes: '已对接' },
    ],
  },
  {
    country: '秘鲁 / 玻利维亚',
    flag: '🇵🇪',
    region: 'South America',
    language: '西班牙语 / 克丘亚语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '2500万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '2200万', notes: '已对接 · 国民级社媒' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1200万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1800万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1000万', notes: '已对接' },
    ],
  },

  // ==================== 西欧 ====================
  {
    country: '德国',
    flag: '🇩🇪',
    region: 'Western Europe',
    language: '德语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '6500万', notes: '已对接 · 国民级 IM' },
      { name: 'YouTube', status: 'live', category: 'video', users: '6000万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '3000万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '3500万', notes: '已对接' },
      { name: 'XING', status: 'live', category: 'professional', users: '800万', notes: '已对接 · 德语区职场平台' },
    ],
  },
  {
    country: '法国',
    flag: '🇫🇷',
    region: 'Western Europe',
    language: '法语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '3500万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '3800万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '3000万', notes: '已对接' },
      { name: 'Snapchat', status: 'live', category: 'image', users: '2500万', notes: '已对接 · 法国极流行' },
      { name: 'TikTok', status: 'live', category: 'video', users: '2200万', notes: '已对接' },
    ],
  },
  {
    country: '意大利',
    flag: '🇮🇹',
    region: 'Western Europe',
    language: '意大利语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '4000万', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '3500万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '3000万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1800万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '3200万', notes: '已对接' },
    ],
  },
  {
    country: '西班牙',
    flag: '🇪🇸',
    region: 'Western Europe',
    language: '西班牙语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '3000万', notes: '已对接 · 国民级 IM' },
      { name: 'Instagram', status: 'live', category: 'image', users: '2400万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '2000万', notes: '已对接' },
      { name: 'Twitter / X', status: 'live', category: 'microblog', users: '1800万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1600万', notes: '已对接' },
    ],
  },
  {
    country: '荷兰',
    flag: '🇳🇱',
    region: 'Western Europe',
    language: '荷兰语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '1400万', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '1000万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '800万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1100万', notes: '已对接' },
      { name: 'LinkedIn', status: 'live', category: 'professional', users: '900万', notes: '已对接' },
    ],
  },

  // ==================== 北欧 ====================
  {
    country: '瑞典',
    flag: '🇸🇪',
    region: 'Northern Europe',
    language: '瑞典语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '800万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '650万', notes: '已对接 · 瑞典最流行' },
      { name: 'Facebook', status: 'live', category: 'social', users: '700万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '750万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '300万', notes: '已对接' },
    ],
  },
  {
    country: '丹麦',
    flag: '🇩🇰',
    region: 'Northern Europe',
    language: '丹麦语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '450万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '280万', notes: '已对接' },
      { name: 'Snapchat', status: 'live', category: 'image', users: '220万', notes: '已对接 · 丹麦极流行' },
      { name: 'TikTok', status: 'live', category: 'video', users: '180万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '400万', notes: '已对接' },
    ],
  },
  {
    country: '芬兰',
    flag: '🇫🇮',
    region: 'Northern Europe',
    language: '芬兰语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '420万', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '350万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '230万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '380万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '120万', notes: '已对接' },
    ],
  },
  {
    country: '挪威',
    flag: '🇳🇴',
    region: 'Northern Europe',
    language: '挪威语',
    platforms: [
      { name: 'Snapchat', status: 'live', category: 'image', users: '280万', notes: '已对接 · 挪威第一社媒' },
      { name: 'Facebook', status: 'live', category: 'social', users: '360万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '250万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '150万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '390万', notes: '已对接' },
    ],
  },
  {
    country: '爱沙尼亚',
    flag: '🇪🇪',
    region: 'Northern Europe',
    language: '爱沙尼亚语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '80万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '70万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '50万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '30万', notes: '已对接' },
    ],
  },
  {
    country: '拉脱维亚',
    flag: '🇱🇻',
    region: 'Northern Europe',
    language: '拉脱维亚语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '100万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '70万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '80万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '40万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '90万', notes: '已对接' },
    ],
  },
  {
    country: '立陶宛',
    flag: '🇱🇹',
    region: 'Northern Europe',
    language: '立陶宛语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '150万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '120万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '90万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '50万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '130万', notes: '已对接' },
    ],
  },

  // ==================== 东欧 ====================
  {
    country: '俄罗斯',
    flag: '🇷🇺',
    region: 'Eastern Europe',
    language: '俄语',
    platforms: [
      { name: 'VKontakte (VK)', status: 'live', category: 'social', users: '7000万', notes: '已对接 · 俄国第一社媒' },
      { name: 'Telegram', status: 'live', category: 'im', users: '9000万', notes: '已对接 · 国民级 IM' },
      { name: 'Odnoklassniki', status: 'live', category: 'social', users: '4000万', notes: '已对接 · OK mediatopic API' },
      { name: 'YouTube', status: 'live', category: 'video', users: '7000万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '5000万', notes: '已对接' },
    ],
  },
  {
    country: '乌克兰',
    flag: '🇺🇦',
    region: 'Eastern Europe',
    language: '乌克兰语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '2400万', notes: '已对接 · 乌克兰第一社媒' },
      { name: 'Facebook', status: 'live', category: 'social', users: '2000万', notes: '已对接' },
      { name: 'Telegram', status: 'live', category: 'im', users: '2500万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1800万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '2200万', notes: '已对接' },
    ],
  },
  {
    country: '波兰',
    flag: '🇵🇱',
    region: 'Eastern Europe',
    language: '波兰语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '2500万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1700万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1400万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '2000万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '2800万', notes: '已对接' },
    ],
  },
  {
    country: '罗马尼亚',
    flag: '🇷🇴',
    region: 'Eastern Europe',
    language: '罗马尼亚语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '1100万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '600万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '800万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '900万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1200万', notes: '已对接' },
    ],
  },
  {
    country: '保加利亚',
    flag: '🇧🇬',
    region: 'Eastern Europe',
    language: '保加利亚语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '400万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '250万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '180万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '350万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '420万', notes: '已对接' },
    ],
  },
  {
    country: '克罗地亚',
    flag: '🇭🇷',
    region: 'Eastern Europe',
    language: '克罗地亚语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '350万', notes: '已对接 · 国民级 IM' },
      { name: 'Instagram', status: 'live', category: 'image', users: '180万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '220万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '120万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '250万', notes: '已对接' },
    ],
  },
  {
    country: '塞尔维亚',
    flag: '🇷🇸',
    region: 'Eastern Europe',
    language: '塞尔维亚语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '250万', notes: '已对接 · 塞尔维亚第一社媒' },
      { name: 'Facebook', status: 'live', category: 'social', users: '350万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '400万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '150万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '380万', notes: '已对接' },
    ],
  },
  {
    country: '斯洛文尼亚',
    flag: '🇸🇮',
    region: 'Eastern Europe',
    language: '斯洛文尼亚语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '90万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '110万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '120万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '50万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '130万', notes: '已对接' },
    ],
  },
  {
    country: '北马其顿',
    flag: '🇲🇰',
    region: 'Eastern Europe',
    language: '马其顿语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '140万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '90万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '60万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '120万', notes: '已对接' },
    ],
  },
  {
    country: '捷克',
    flag: '🇨🇿',
    region: 'Eastern Europe',
    language: '捷克语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '600万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '350万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '250万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '700万', notes: '已对接' },
      { name: 'Twitter / X', status: 'live', category: 'microblog', users: '150万', notes: '已对接' },
    ],
  },
  {
    country: '斯洛伐克',
    flag: '🇸🇰',
    region: 'Eastern Europe',
    language: '斯洛伐克语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '300万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '180万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '120万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '250万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '350万', notes: '已对接' },
    ],
  },
  {
    country: '匈牙利',
    flag: '🇭🇺',
    region: 'Eastern Europe',
    language: '匈牙利语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '650万', notes: '已对接 · 国民级社媒' },
      { name: 'Instagram', status: 'live', category: 'image', users: '300万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '200万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '750万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '500万', notes: '已对接' },
    ],
  },
  {
    country: '阿尔巴尼亚',
    flag: '🇦🇱',
    region: 'Eastern Europe',
    language: '阿尔巴尼亚语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '150万', notes: '已对接 · 阿尔巴尼亚第一社媒' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '200万', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '180万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '100万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '210万', notes: '已对接' },
    ],
  },

  // ==================== 中东 & 中亚 ====================
  {
    country: '中东(沙特等)',
    flag: '🇸🇦',
    region: 'Middle East & Central Asia',
    language: '阿拉伯语',
    platforms: [
      { name: 'Snapchat', status: 'live', category: 'image', users: '2000万', notes: '已对接 · 中东极流行' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1700万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '2600万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '3000万', notes: '已对接' },
      { name: 'Twitter / X', status: 'live', category: 'microblog', users: '1800万', notes: '已对接' },
    ],
  },
  {
    country: '伊朗',
    flag: '🇮🇷',
    region: 'Middle East & Central Asia',
    language: '波斯语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '4700万', notes: '已对接 · 伊朗第一社媒' },
      { name: 'Telegram', status: 'live', category: 'im', users: '5000万', notes: '已对接 · 国民级 IM' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '3000万', notes: '已对接' },
      { name: 'Rubika', status: 'live', category: 'social', users: '2000万', notes: '已对接 · 伊朗本土 Bot API' },
    ],
  },
  {
    country: '以色列',
    flag: '🇮🇱',
    region: 'Middle East & Central Asia',
    language: '希伯来语 / 阿拉伯语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '700万', notes: '已对接 · 国民级 IM' },
      { name: 'Instagram', status: 'live', category: 'image', users: '500万', notes: '已对接' },
      { name: 'Facebook', status: 'live', category: 'social', users: '550万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '300万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '600万', notes: '已对接' },
    ],
  },
  {
    country: '阿富汗',
    flag: '🇦🇫',
    region: 'Middle East & Central Asia',
    language: '普什图语 / 达利语',
    platforms: [
      { name: 'Facebook', status: 'live', category: 'social', users: '500万', notes: '已对接 · 阿富汗第一社媒' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '400万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '300万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '200万', notes: '已对接' },
      { name: 'Telegram', status: 'live', category: 'im', users: '250万', notes: '已对接' },
    ],
  },
  {
    country: '阿塞拜疆',
    flag: '🇦🇿',
    region: 'Middle East & Central Asia',
    language: '阿塞拜疆语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '500万', notes: '已对接 · 阿塞拜疆第一社媒' },
      { name: 'Facebook', status: 'live', category: 'social', users: '350万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '400万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '450万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '480万', notes: '已对接' },
    ],
  },
  {
    country: '哈萨克斯坦',
    flag: '🇰🇿',
    region: 'Middle East & Central Asia',
    language: '哈萨克语 / 俄语',
    platforms: [
      { name: 'Instagram', status: 'live', category: 'image', users: '1000万', notes: '已对接 · 哈萨克第一社媒' },
      { name: 'VKontakte (VK)', status: 'live', category: 'social', users: '800万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '700万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '900万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1100万', notes: '已对接' },
    ],
  },
  {
    country: '亚美尼亚',
    flag: '🇦🇲',
    region: 'Middle East & Central Asia',
    language: '亚美尼亚语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '250万', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '200万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '150万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '80万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '220万', notes: '已对接' },
    ],
  },

  // ==================== 非洲 ====================
  {
    country: '尼日利亚',
    flag: '🇳🇬',
    region: 'Africa',
    language: '英语 / 豪萨语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '1.2亿', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '3500万', notes: '已对接 · 非洲第一社媒' },
      { name: 'YouTube', status: 'live', category: 'video', users: '3000万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '2500万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '1500万', notes: '已对接' },
    ],
  },
  {
    country: '肯尼亚 / 坦桑尼亚',
    flag: '🇰🇪',
    region: 'Africa',
    language: '斯瓦希里语 / 英语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '4500万', notes: '已对接 · 东非国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '2000万', notes: '已对接 · 东非第一社媒' },
      { name: 'TikTok', status: 'live', category: 'video', users: '1500万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '1800万', notes: '已对接' },
      { name: 'Instagram', status: 'live', category: 'image', users: '800万', notes: '已对接' },
    ],
  },
  {
    country: '埃塞俄比亚',
    flag: '🇪🇹',
    region: 'Africa',
    language: '阿姆哈拉语',
    platforms: [
      { name: 'Telegram', status: 'live', category: 'im', users: '1500万', notes: '已对接 · 埃塞俄比亚国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '1200万', notes: '已对接' },
      { name: 'WhatsApp', status: 'live', category: 'im', users: '1000万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '600万', notes: '已对接' },
      { name: 'YouTube', status: 'live', category: 'video', users: '800万', notes: '已对接' },
    ],
  },
  {
    country: '卢旺达',
    flag: '🇷🇼',
    region: 'Africa',
    language: '卢旺达语 / 英语 / 法语',
    platforms: [
      { name: 'WhatsApp', status: 'live', category: 'im', users: '500万', notes: '已对接 · 国民级 IM' },
      { name: 'Facebook', status: 'live', category: 'social', users: '80万', notes: '已对接 · 卢旺达第一社媒' },
      { name: 'YouTube', status: 'live', category: 'video', users: '100万', notes: '已对接' },
      { name: 'TikTok', status: 'live', category: 'video', users: '60万', notes: '已对接' },
      { name: 'Twitter / X', status: 'live', category: 'microblog', users: '40万', notes: '已对接' },
    ],
  },
];
