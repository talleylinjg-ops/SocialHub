'use client';

import { useState, useMemo } from 'react';
import { globalSocialMediaMatrix, regions } from '@/lib/matrix-data';
import { CheckCircle2, Clock, ExternalLink, Search, Globe } from 'lucide-react';

const statusMap = {
  live: { label: '已对接', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  planned: { label: '待开发', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  external: { label: '第三方', cls: 'bg-gray-100 text-gray-600', icon: ExternalLink },
};

const categoryMap: Record<string, string> = {
  microblog: '微博',
  social: '社交',
  video: '视频',
  professional: '职场',
  community: '社区',
  image: '图片',
  im: '即时通讯',
};

const regionLabels: Record<string, string> = {
  global: '全球通用',
  'North America': '北美',
  'East Asia': '东亚',
  'South Asia': '南亚',
  'Southeast Asia': '东南亚',
  'South America': '南美',
  'Western Europe': '西欧',
  'Northern Europe': '北欧',
  'Eastern Europe': '东欧',
  'Middle East & Central Asia': '中东 & 中亚',
  Africa: '非洲',
};

export default function MatrixPage() {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return globalSocialMediaMatrix.filter((c) => {
      const regionMatch = activeRegion === 'all' || c.region === activeRegion;
      const searchMatch =
        !search ||
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.language.toLowerCase().includes(search.toLowerCase()) ||
        c.platforms.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      return regionMatch && searchMatch;
    });
  }, [activeRegion, search]);

  const totalLive = globalSocialMediaMatrix
    .flatMap((c) => c.platforms)
    .filter((p) => p.status === 'live').length;
  const totalPlanned = globalSocialMediaMatrix
    .flatMap((c) => c.platforms)
    .filter((p) => p.status === 'planned').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">全球社媒矩阵</h1>
        <p className="text-sm text-gray-500">
          覆盖全球 {globalSocialMediaMatrix.length} 个国家/地区 · {globalSocialMediaMatrix.flatMap((c) => c.platforms).length} 个社媒平台对接进度
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalLive}</div>
          <div className="text-xs text-gray-500">已对接平台</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{totalPlanned}</div>
          <div className="text-xs text-gray-500">待开发平台</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-600">{globalSocialMediaMatrix.length}</div>
          <div className="text-xs text-gray-500">覆盖国家/地区</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">23</div>
          <div className="text-xs text-gray-500">已实现适配器</div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索国家、语言或平台名称…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
        />
      </div>

      {/* 区域筛选 Tab */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveRegion('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            activeRegion === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Globe className="mr-1 inline h-3 w-3" />
          全部
        </button>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeRegion === r
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {regionLabels[r] ?? r}
          </button>
        ))}
      </div>

      {/* 国家/平台卡片列表 */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-gray-400">
            未找到匹配的国家或平台
          </div>
        )}
        {filtered.map((country) => (
          <div key={country.country} className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
              <span className="text-xl">{country.flag}</span>
              <span className="font-semibold">{country.country}</span>
              <span className="text-xs text-gray-400">{country.region}</span>
              <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                {country.language}
              </span>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
              {country.platforms.map((p, i) => {
                const st = statusMap[p.status];
                const Icon = st.icon;
                return (
                  <div
                    key={`${p.name}-${i}`}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                      p.status === 'live'
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">
                        {categoryMap[p.category] ?? p.category} · {p.users}
                      </div>
                      <div className="truncate text-xs text-gray-300">{p.notes}</div>
                    </div>
                    <span className={`chip ml-2 shrink-0 ${st.cls}`}>
                      <Icon className="h-3 w-3" />
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 扩展说明 */}
      <div className="card p-5">
        <h3 className="mb-2 font-semibold">扩展新平台</h3>
        <p className="text-sm text-gray-500">
          本框架采用适配器模式,新增任何社媒平台只需:
        </p>
        <ol className="mt-2 space-y-1 text-sm text-gray-600">
          <li>1. 在 <code className="rounded bg-gray-100 px-1">src/lib/platforms/</code> 下新建适配器,实现 <code className="rounded bg-gray-100 px-1">SocialPlatformAdapter</code> 接口</li>
          <li>2. 在 <code className="rounded bg-gray-100 px-1">platforms/index.ts</code> 注册表实例化</li>
          <li>3. 在 <code className="rounded bg-gray-100 px-1">.env</code> 填入该平台 OAuth 凭证</li>
        </ol>
        <p className="mt-2 text-sm text-gray-500">发布分发器与所有前端页面自动支持新平台,无需改动</p>
      </div>
    </div>
  );
}
