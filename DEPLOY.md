# Vercel 部署指南

## 一键部署到 Vercel(免费套餐够用,自带 HTTPS)

### 前置条件
- GitHub 账号
- Vercel 账号(可用 GitHub 登录)

### 步骤

#### 1. 把代码推到 GitHub

```bash
# 在项目根目录
git remote add origin https://github.com/你的用户名/social-distributor.git
git branch -M main
git push -u origin main
```

#### 2. 在 Vercel 创建项目

1. 打开 https://vercel.com/new
2. 导入你的 GitHub 仓库 `social-distributor`
3. Vercel 会自动识别 Next.js,无需修改构建配置
4. 在 "Environment Variables" 中填入各平台凭证(从 `.env.example` 复制需要的 key)
5. 点击 "Deploy"

#### 3. 部署完成后

- Vercel 会分配一个 `xxx.vercel.app` 的 HTTPS 域名
- 后续每次 push 到 main 分支自动重新部署
- 在 Vercel Dashboard → Settings → Domains 可绑定自定义域名

### 数据库说明

本项目使用 SQLite + Prisma。在 Vercel serverless 环境下:
- SQLite 文件存储在 `/tmp` 目录(Vercel serverless 唯一可写目录)
- 数据在函数实例间不持久(实例会被回收),适合演示和开发
- **生产环境建议**: 在 Vercel Dashboard 切换为 Vercel Postgres(免费 256MB)

切换 PostgreSQL 只需:
1. Vercel Dashboard → Storage → Create → Postgres(免费)
2. 复制 `DATABASE_URL` 到环境变量
3. 修改 `prisma/schema.prisma` 中 `provider = "postgresql"`
4. 运行 `npx prisma db push` 重新部署

### 平台凭证配置

部署后各平台激活方式(在 Vercel Dashboard → Settings → Environment Variables 中添加):

| 平台 | 需要的环境变量 | 申请地址 |
|------|-------------|---------|
| Twitter / X | TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET | https://developer.twitter.com |
| Facebook | FACEBOOK_APP_ID, FACEBOOK_APP_SECRET | https://developers.facebook.com |
| Instagram | INSTAGRAM_BUSINESS_ACCOUNT_ID | https://developers.facebook.com |
| YouTube | YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET | https://console.cloud.google.com |
| TikTok | TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET | https://developers.tiktok.com |
| LinkedIn | LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET | https://developer.linkedin.com |
| Reddit | REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET | https://www.reddit.com/prefs/apps |
| Pinterest | PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET | https://developers.pinterest.com |
| VK | VK_CLIENT_ID, VK_CLIENT_SECRET | https://dev.vk.com |
| Telegram | TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID | @BotFather |
| Snapchat | SNAPCHAT_CLIENT_ID, SNAPCHAT_CLIENT_SECRET | https://business.snapchat.com |
| WhatsApp | WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN | https://developers.facebook.com |
| LINE | LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN | https://developers.line.biz |
| KakaoTalk | KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET | https://developers.kakao.com |
| Naver Band | NAVER_BAND_CLIENT_ID, NAVER_BAND_CLIENT_SECRET | https://developers.naver.com |
| ShareChat | SHARECHAT_CLIENT_ID, SHARECHAT_CLIENT_SECRET | https://sharechat.com |
| Koo | KOO_CLIENT_ID, KOO_CLIENT_SECRET | https://developer.kooapp.com |
| Imo | IMO_BOT_TOKEN, IMO_CHANNEL_ID | https://imo.im |
| Zalo | ZALO_APP_ID, ZALO_APP_SECRET | https://developers.zalo.me |
| Viber | VIBER_BOT_TOKEN, VIBER_CHANNEL_ID | https://partners.viber.com |
| XING | XING_CLIENT_ID, XING_CLIENT_SECRET | https://dev.xing.com |
| Odnoklassniki | OK_CLIENT_ID, OK_CLIENT_SECRET, OK_PUBLIC_KEY | https://apiok.ru |
| Rubika | RUBIKA_BOT_TOKEN, RUBIKA_CHANNEL_ID | https://rubika.ir |

### 回调地址

部署后在各平台开发者后台设置 OAuth 回调地址为:
```
https://你的域名.vercel.app/api/auth/twitter
https://你的域名.vercel.app/api/auth/facebook
...
```
