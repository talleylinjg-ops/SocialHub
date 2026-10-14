import { getAllAdapters } from '@/lib/platforms';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Key, CheckCircle2, AlertCircle, Clock, Share2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

// 每个平台的申请指南
const platformGuide: Record<string, {
  difficulty: 'easy' | 'medium' | 'hard';
  mode: 'oauth' | 'api-key' | 'bot-token' | 'share-link';
  timeToGet: string;
  applyUrl: string;
  steps: string[];
  envVars: { name: string; desc: string }[];
  notes?: string;
}> = {
  twitter: {
    difficulty: 'medium',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://developer.x.com/en/portal/dashboard',
    steps: [
      'Twitter/X 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 twitter.com/intent/tweet 链接跳转发推',
      '2. API 模式: 通过 X Developer Portal 申请 OAuth 2.0 凭证',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 developer.x.com',
      '2. 创建 Project → 创建 App',
      '3. 在 Keys and Tokens 获取凭证',
      '4. 设置回调 URL: https://social.chacha.asia/api/auth/twitter',
    ],
    envVars: [
      { name: 'TWITTER_CLIENT_ID', desc: 'OAuth 2.0 Client ID' },
      { name: 'TWITTER_CLIENT_SECRET', desc: 'OAuth 2.0 Client Secret' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  facebook: {
    difficulty: 'medium',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://developers.facebook.com/apps',
    steps: [
      'Facebook 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 facebook.com/sharer.php 跳转分享',
      '2. Graph API 模式: 通过 Meta 开发者后台创建 App',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 developers.facebook.com',
      '2. 点击 "Create App" → 选择 "Business" 类型',
      '3. 添加 Facebook Login 产品',
      '4. 配置回调 URL: https://social.chacha.asia/api/auth/facebook',
      '5. 申请 pages_manage_posts 权限',
    ],
    envVars: [
      { name: 'FACEBOOK_APP_ID', desc: '应用 ID' },
      { name: 'FACEBOOK_APP_SECRET', desc: '应用密钥' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  instagram: {
    difficulty: 'medium',
    mode: 'oauth',
    timeToGet: '30分钟',
    applyUrl: 'https://developers.facebook.com/apps',
    steps: [
      '1. 在 Facebook 开发者后台创建/使用已有的 App',
      '2. 添加 Instagram Graph API 产品',
      '3. 配置 Instagram Business 账号（需先转成 Business 账号）',
      '4. 获取 Instagram Graph API 访问令牌',
      '5. 回调 URI: https://social.chacha.asia/api/auth/instagram',
    ],
    envVars: [
      { name: 'INSTAGRAM_ACCESS_TOKEN', desc: 'Graph API 访问令牌' },
      { name: 'INSTAGRAM_BUSINESS_ACCOUNT_ID', desc: 'Business 账号 ID' },
    ],
    notes: 'Instagram 个人账号不能发帖，必须转成 Business 账号',
  },
  youtube: {
    difficulty: 'easy',
    mode: 'oauth',
    timeToGet: '10分钟',
    applyUrl: 'https://console.cloud.google.com',
    steps: [
      '1. 登录 console.cloud.google.com',
      '2. 创建新项目（如 "SocialHub"）',
      '3. 启用 "YouTube Data API v3"',
      '4. 进入 "凭据" → 创建 OAuth 2.0 客户端 ID',
      '5. 添加授权回调地址: https://social.chacha.asia/api/auth/youtube',
      '6. 复制 Client ID 和 Client Secret',
    ],
    envVars: [
      { name: 'YOUTUBE_CLIENT_ID', desc: 'OAuth Client ID' },
      { name: 'YOUTUBE_CLIENT_SECRET', desc: 'OAuth Client Secret' },
    ],
  },
  tiktok: {
    difficulty: 'medium',
    mode: 'oauth',
    timeToGet: '1-3天审核',
    applyUrl: 'https://developers.tiktok.com/application/registration',
    steps: [
      '1. 登录 developers.tiktok.com',
      '2. 注册开发者账号',
      '3. 创建应用，选择 "Display API + Content Posting API"',
      '4. 配置回调 URL: https://social.chacha.asia/api/auth/tiktok',
      '5. 申请 video.publish 权限',
      '6. 获取 Client Key 和 Client Secret',
    ],
    envVars: [
      { name: 'TIKTOK_CLIENT_KEY', desc: 'Client Key' },
      { name: 'TIKTOK_CLIENT_SECRET', desc: 'Client Secret' },
    ],
  },
  linkedin: {
    difficulty: 'easy',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://www.linkedin.com/developers/apps',
    steps: [
      'LinkedIn 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 linkedin.com/sharing/share-offsite 跳转分享',
      '2. Marketing API 模式: 通过 LinkedIn Developers 创建 App',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 linkedin.com/developers/apps',
      '2. 点击 "Create App"',
      '3. 关联你的 LinkedIn Company Page',
      '4. 添加 "Share on LinkedIn" 产品',
      '5. 设置重定向 URL: https://social.chacha.asia/api/auth/linkedin',
      '6. 申请 w_member_social 权限',
    ],
    envVars: [
      { name: 'LINKEDIN_CLIENT_ID', desc: 'Client ID' },
      { name: 'LINKEDIN_CLIENT_SECRET', desc: 'Client Secret' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  reddit: {
    difficulty: 'easy',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://www.reddit.com/prefs/apps',
    steps: [
      'Reddit 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 reddit.com/submit 链接跳转提交',
      '2. API 模式: 通过 reddit.com/prefs/apps 创建 App',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 reddit.com/prefs/apps',
      '2. 点击 "create another app"',
      '3. 选择 "web app"',
      '4. 填写重定向 URL: https://social.chacha.asia/api/auth/reddit',
      '5. 复制 app_id 和 secret',
    ],
    envVars: [
      { name: 'REDDIT_CLIENT_ID', desc: 'App ID' },
      { name: 'REDDIT_CLIENT_SECRET', desc: 'App Secret' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  pinterest: {
    difficulty: 'medium',
    mode: 'oauth',
    timeToGet: '1-3天审核',
    applyUrl: 'https://developers.pinterest.com/account/overview',
    steps: [
      '1. 登录 developers.pinterest.com',
      '2. 创建 Developer App',
      '3. 申请 boards:read 和 pins:write 权限',
      '4. 配置 OAuth redirect URI: https://social.chacha.asia/api/auth/pinterest',
      '5. 获取 App ID 和 App Secret',
    ],
    envVars: [
      { name: 'PINTEREST_APP_ID', desc: 'App ID' },
      { name: 'PINTEREST_APP_SECRET', desc: 'App Secret' },
    ],
  },
  vk: {
    difficulty: 'easy',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://dev.vk.com',
    steps: [
      'VK 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 vk.com/share.php 跳转分享',
      '2. API 模式: 通过 dev.vk.com 创建 App',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 dev.vk.com',
      '2. 点击 "My Apps" → "Create App"',
      '3. 选择 "Standalone application"',
      '4. 添加 Redirect URI: https://social.chacha.asia/api/auth/vk',
      '5. 复制 App ID 和 Secure Key',
    ],
    envVars: [
      { name: 'VK_CLIENT_ID', desc: 'App ID' },
      { name: 'VK_CLIENT_SECRET', desc: 'Secure Key' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  telegram: {
    difficulty: 'easy',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://t.me/BotFather',
    steps: [
      'Telegram 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 t.me/share/url 链接跳转分享',
      '2. Bot Token 模式: 通过 BotFather 创建 Bot 自动发布到频道',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'Bot Token 模式步骤:',
      '1. 在 Telegram 里搜索并打开 @BotFather',
      '2. 发送 /newbot 创建 Bot',
      '3. BotFather 返回 Token',
      '4. 把 Bot 加入频道并设为管理员',
      '5. 获取频道 ID（可用 @userinfobot 查看）',
    ],
    envVars: [
      { name: 'TELEGRAM_BOT_TOKEN', desc: 'Bot Token（Bot Token 模式）' },
      { name: 'TELEGRAM_CHANNEL_ID', desc: '频道/群组 ID（如 -1001234567890）' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  snapchat: {
    difficulty: 'hard',
    mode: 'api-key',
    timeToGet: '需 Snapchat Business 账号',
    applyUrl: 'https://business.snapchat.com',
    steps: [
      '1. 登录 business.snapchat.com',
      '2. 需要有 Snapchat Business Manager 账号',
      '3. 在 Snap Marketing API 里创建 App',
      '4. 申请 ads:manage 和 ads:read 权限',
      '5. 获取 Client ID 和 Client Secret',
    ],
    envVars: [
      { name: 'SNAPCHAT_CLIENT_ID', desc: 'Client ID' },
      { name: 'SNAPCHAT_CLIENT_SECRET', desc: 'Client Secret' },
      { name: 'SNAPCHAT_AD_ACCOUNT_ID', desc: '广告账户 ID' },
    ],
  },
  whatsapp: {
    difficulty: 'medium',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: '',
    steps: [
      'WhatsApp 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 wa.me/?text= 链接直接跳转 WhatsApp 分享',
      '2. Cloud API 模式: 需在 Meta 开发者后台开通 WhatsApp Business API',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
    ],
    envVars: [
      { name: 'WHATSAPP_PHONE_NUMBER_ID', desc: 'Cloud API 模式: 电话号码 ID' },
      { name: 'WHATSAPP_ACCESS_TOKEN', desc: 'Cloud API 模式: 访问令牌' },
      { name: 'WHATSAPP_RECIPIENT', desc: 'Cloud API 模式: 接收方号码' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式，点击发布会打开 WhatsApp 分享页面',
  },
  line: {
    difficulty: 'medium',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://developers.line.biz/console',
    steps: [
      'LINE 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 line.me/R/msg/text 跳转分享',
      '2. Messaging API 模式: 通过 LINE Developers 创建 Channel',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 developers.line.biz',
      '2. 创建 LINE Login Channel',
      '3. 配置回调 URL: https://social.chacha.asia/api/auth/line',
      '4. 如需 Bot 发消息: 创建 Messaging API Channel',
      '5. 获取 Channel ID 和 Channel Secret',
    ],
    envVars: [
      { name: 'LINE_CHANNEL_ID', desc: 'Channel ID' },
      { name: 'LINE_CHANNEL_ACCESS_TOKEN', desc: 'Messaging API Access Token' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  kakaotalk: {
    difficulty: 'medium',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://developers.kakao.com',
    steps: [
      'KakaoTalk 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 sharer.kakao.com 跳转分享',
      '2. Kakao API 模式: 通过 Kakao Developers 创建 App',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 developers.kakao.com',
      '2. 创建应用',
      '3. 启用 Kakao Talk Social',
      '4. 配置 Redirect URI: https://social.chacha.asia/api/auth/kakaotalk',
      '5. 获取 REST API Key',
    ],
    envVars: [
      { name: 'KAKAO_REST_API_KEY', desc: 'REST API Key' },
      { name: 'KAKAO_ADMIN_KEY', desc: 'Admin Key' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  naverband: {
    difficulty: 'hard',
    mode: 'oauth',
    timeToGet: '需 Naver 开发者认证',
    applyUrl: 'https://developers.band.us',
    steps: [
      '1. 登录 developers.band.us',
      '2. 创建 Band App',
      '3. 申请 band.content.write 权限',
      '4. 配置回调 URL: https://social.chacha.asia/api/auth/naverband',
      '5. 获取 Client ID 和 Client Secret',
    ],
    envVars: [
      { name: 'NAVER_BAND_CLIENT_ID', desc: 'Band App Client ID' },
      { name: 'NAVER_BAND_CLIENT_SECRET', desc: 'Band App Client Secret' },
    ],
  },
  sharechat: {
    difficulty: 'hard',
    mode: 'api-key',
    timeToGet: '需联系 ShareChat 商务',
    applyUrl: 'https://sharechat.com/about/contact',
    steps: [
      '1. ShareChat 目前无公开 API',
      '2. 需联系 ShareChat 商务合作获取 API 权限',
      '3. 或使用分享链接模式: https://sharechat.com/share',
    ],
    envVars: [
      { name: 'SHARECHAT_API_KEY', desc: '商务合作获取的 API Key' },
    ],
  },
  koo: {
    difficulty: 'medium',
    mode: 'oauth',
    timeToGet: '15分钟',
    applyUrl: 'https://www.koo.com/developers',
    steps: [
      '1. 登录 koo.com/developers',
      '2. 创建 App',
      '3. 配置回调: https://social.chacha.asia/api/auth/koo',
      '4. 获取 Client ID 和 Client Secret',
    ],
    envVars: [
      { name: 'KOO_CLIENT_ID', desc: 'Client ID' },
      { name: 'KOO_CLIENT_SECRET', desc: 'Client Secret' },
    ],
  },
  imo: {
    difficulty: 'hard',
    mode: 'share-link',
    timeToGet: '无公开 API',
    applyUrl: '',
    steps: [
      'IMO 没有公开的 API。',
      '系统使用分享链接模式: imo://share?text=...',
      '无需配置，点击发布会跳转 IMO 分享',
    ],
    envVars: [],
  },
  zalo: {
    difficulty: 'medium',
    mode: 'oauth',
    timeToGet: '15分钟',
    applyUrl: 'https://developers.zalo.me',
    steps: [
      '1. 登录 developers.zalo.me',
      '2. 创建 Zalo Official Account',
      '3. 在 OA 管理后台获取 OA ID',
      '4. 申请 article 权限（发帖到 Zalo Wall）',
      '5. 配置回调 URL: https://social.chacha.asia/api/auth/zalo',
    ],
    envVars: [
      { name: 'ZALO_OA_ID', desc: 'Official Account ID' },
      { name: 'ZALO_OA_SECRET', desc: 'OA Secret Key' },
    ],
  },
  viber: {
    difficulty: 'medium',
    mode: 'api-key',
    timeToGet: '15分钟',
    applyUrl: 'https://partners.viber.com',
    steps: [
      '1. 登录 partners.viber.com',
      '2. 创建 Viber Bot/PA',
      '3. 获取 Authentication Token',
      '4. 配置 Webhook URL',
    ],
    envVars: [
      { name: 'VIBER_AUTH_TOKEN', desc: 'Viber Bot Auth Token' },
    ],
  },
  xing: {
    difficulty: 'hard',
    mode: 'oauth',
    timeToGet: '已停止开放新开发者',
    applyUrl: 'https://dev.xing.com',
    steps: [
      '1. Xing API 已逐步停止对新开发者开放',
      '2. 如已有账号: 登录 dev.xing.com',
      '3. 创建 OAuth Consumer',
      '4. 配置回调: https://social.chacha.asia/api/auth/xing',
    ],
    envVars: [
      { name: 'XING_CONSUMER_KEY', desc: 'Consumer Key' },
      { name: 'XING_CONSUMER_SECRET', desc: 'Consumer Secret' },
    ],
    notes: 'Xing API 新注册基本已关闭',
  },
  odnoklassniki: {
    difficulty: 'easy',
    mode: 'share-link',
    timeToGet: '无需配置',
    applyUrl: 'https://ok.ru/devaccess',
    steps: [
      'Odnoklassniki 支持两种模式:',
      '1. 分享链接模式（零配置）: 通过 connect.ok.ru/offer 跳转分享',
      '2. API 模式: 通过 ok.ru/devaccess 创建 App',
      '',
      '系统已内置分享链接模式，无需任何配置即可使用',
      '',
      'API 模式步骤:',
      '1. 登录 ok.ru/devaccess',
      '2. 创建 App（选择 "Внешнее приложение"）',
      '3. 申请 VALUABLE_ACCESS 和 GROUP_CONTENT 权限',
      '4. 配置回调: https://social.chacha.asia/api/auth/odnoklassniki',
      '5. 获取 Application ID 和 Secret Key',
    ],
    envVars: [
      { name: 'OK_CLIENT_ID', desc: 'Application ID' },
      { name: 'OK_CLIENT_SECRET', desc: 'Secret Key' },
      { name: 'OK_PUBLIC_KEY', desc: 'Public Key' },
    ],
    notes: '不配置环境变量时自动使用分享链接模式',
  },
  rubika: {
    difficulty: 'hard',
    mode: 'share-link',
    timeToGet: '无公开 API',
    applyUrl: '',
    steps: [
      'Rubika 没有公开的 API。',
      '系统使用分享链接模式。',
      '无需配置。',
    ],
    envVars: [],
  },
};

export default function SetupPage() {
  const adapters = getAllAdapters();

  const difficultyColor = {
    easy: 'text-green-400 bg-green-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    hard: 'text-red-400 bg-red-500/10',
  };

  const modeLabel = {
    oauth: 'OAuth 授权',
    'api-key': 'API Key',
    'bot-token': 'Bot Token',
    'share-link': '分享链接(零配置)',
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">API 密钥配置指南</h1>
          <p className="text-sm text-gray-500">23 个社媒平台的 API 申请步骤与环境变量配置</p>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-400">零配置可用</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-400">
            {Object.values(platformGuide).filter((g) => g.mode === 'share-link').length}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-400">需配置 API</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-400">
            {Object.values(platformGuide).filter((g) => g.mode !== 'share-link').length}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-400">已配置</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-400">
            {adapters.filter((a) => a.isConfigured()).length}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-400">待配置</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-yellow-400">
            {adapters.filter((a) => !a.isConfigured()).length}
          </div>
        </div>
      </div>

      {/* Vercel 环境变量配置说明 */}
      <div className="card p-5 border border-blue-500/30 bg-blue-500/5">
        <h2 className="text-lg font-bold text-blue-400">如何在 Vercel 配置环境变量</h2>
        <ol className="mt-3 space-y-1 text-sm text-gray-300">
          <li>1. 登录 <a href="https://vercel.com/dashboard" target="_blank" className="text-blue-400 underline">vercel.com/dashboard</a> → 选择 social-distributor 项目</li>
          <li>2. Settings → Environment Variables</li>
          <li>3. 逐个添加下方表格中的变量名和值</li>
          <li>4. 添加完后点 "Redeploy" 重新部署</li>
        </ol>
      </div>

      {/* 各平台详细指南 */}
      <div className="space-y-4">
        {adapters.map((adapter) => {
          const guide = platformGuide[adapter.meta.id];
          if (!guide) return null;
          const configured = adapter.isConfigured();

          return (
            <div key={adapter.meta.id} className={`card overflow-hidden ${configured ? 'border-green-500/30' : ''}`}>
              {/* 平台头部 */}
              <div className="flex items-center justify-between border-b border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xl" style={{ backgroundColor: adapter.meta.color + '20', color: adapter.meta.color }}>
                    {adapter.meta.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{adapter.meta.name}</h3>
                    <p className="text-xs text-gray-500">{adapter.meta.region} · {adapter.meta.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {configured ? (
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">✅ 已配置</span>
                  ) : (
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">⚠️ 待配置</span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs ${difficultyColor[guide.difficulty]}`}>
                    {guide.difficulty === 'easy' ? '简单' : guide.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
              </div>

              {/* 内容 */}
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {/* 左：申请步骤 */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-300">
                      {modeLabel[guide.mode]} · {guide.timeToGet}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {guide.steps.map((step, i) => (
                      <p key={i} className="text-xs text-gray-400">{step}</p>
                    ))}
                  </div>
                  {guide.applyUrl && (
                    <a href={guide.applyUrl} target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                      <ExternalLink className="h-3 w-3" /> 前往申请
                    </a>
                  )}
                  {guide.notes && (
                    <p className="mt-2 text-xs text-yellow-400/80">💡 {guide.notes}</p>
                  )}
                </div>

                {/* 右：环境变量 */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-300">环境变量</h4>
                  {guide.envVars.length > 0 ? (
                    <div className="space-y-2">
                      {guide.envVars.map((v) => (
                        <div key={v.name} className="rounded bg-gray-800/50 p-2">
                          <code className="text-xs text-green-400">{v.name}</code>
                          <p className="text-xs text-gray-500">{v.desc}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-green-400">无需配置环境变量</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
