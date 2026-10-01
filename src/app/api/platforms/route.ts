import { NextResponse } from 'next/server';
import { getAllAdapters } from '@/lib/platforms';

// 获取所有支持平台及其配置状态
export async function GET() {
  const data = getAllAdapters().map((a) => ({
    id: a.meta.id,
    name: a.meta.name,
    color: a.meta.color,
    icon: a.meta.icon,
    category: a.meta.category,
    region: a.meta.region,
    website: a.meta.website,
    capabilities: a.capabilities,
    limits: a.limits,
    configured: a.isConfigured(),
    oauthScopes: a.oauth.scopes,
  }));
  return NextResponse.json({ platforms: data, total: data.length });
}