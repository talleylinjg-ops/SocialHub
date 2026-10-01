import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/platforms';
import { prisma } from '@/lib/db';

// OAuth 授权入口与回调统一入口
//   GET /api/auth/twitter?action=start   → 返回授权 URL(前端跳转)
//   GET /api/auth/twitter?code=...&state=... → 平台回调,换取 token 并入库
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const adapter = getAdapter(provider);
  if (!adapter) {
    return NextResponse.json({ error: `不支持的平台: ${provider}` }, { status: 404 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/${provider}`;

  // ===== 启动授权 =====
  if (action === 'start') {
    if (!adapter.isConfigured()) {
      return NextResponse.json(
        {
          error: `${adapter.meta.name} 尚未配置 OAuth 凭证`,
          hint: `请在 .env 中填写 ${provider.toUpperCase()} 相关的环境变量`,
          doc: '参见 .env.example',
        },
        { status: 400 }
      );
    }
    const state = crypto.randomUUID();
    const { url: authUrl, codeVerifier } = await adapter.getAuthorizeUrl(redirectUri, state);

    const res = NextResponse.json({ authUrl, state });
    // 临时存储 state 与 codeVerifier 供回调校验(cookie,httpOnly)
    res.cookies.set(`oauth_state_${provider}`, state, {
      httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/',
    });
    if (codeVerifier) {
      res.cookies.set(`oauth_pkce_${provider}`, codeVerifier, {
        httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/',
      });
    }
    return res;
  }

  // ===== 处理回调 =====
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code) {
    return NextResponse.json({ error: '缺少 code 参数' }, { status: 400 });
  }

  const savedState = req.cookies.get(`oauth_state_${provider}`)?.value;
  const codeVerifier = req.cookies.get(`oauth_pkce_${provider}`)?.value;
  if (state && savedState && state !== savedState) {
    return NextResponse.json({ error: 'state 校验失败,可能存在 CSRF' }, { status: 400 });
  }

  try {
    const info = await adapter.handleCallback(code, { codeVerifier, redirectUri });

    // upsert 账号(provider + platformUserId 唯一)
    const existing = await prisma.account.findFirst({
      where: { provider, platformUserId: info.platformUserId ?? undefined },
    });

    if (existing) {
      await prisma.account.update({
        where: { id: existing.id },
        data: {
          displayName: info.displayName,
          handle: info.handle,
          avatarUrl: info.avatarUrl,
          accessToken: info.accessToken,
          refreshToken: info.refreshToken,
          tokenExpiresAt: info.tokenExpiresAt,
          scope: info.scope,
          isActive: true,
        },
      });
    } else {
      await prisma.account.create({
        data: {
          provider: info.provider,
          displayName: info.displayName,
          handle: info.handle,
          avatarUrl: info.avatarUrl,
          accessToken: info.accessToken,
          refreshToken: info.refreshToken,
          tokenExpiresAt: info.tokenExpiresAt,
          platformUserId: info.platformUserId,
          isActive: true,
        },
      });
    }

    // 清理 cookie 并重定向到账号管理页
    const res = NextResponse.redirect(`${appUrl}/accounts?connected=${provider}`);
    res.cookies.delete(`oauth_state_${provider}`);
    res.cookies.delete(`oauth_pkce_${provider}`);
    return res;
  } catch (e) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/accounts?error=${encodeURIComponent((e as Error).message)}`
    );
  }
}