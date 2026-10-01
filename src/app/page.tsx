import { prisma } from '@/lib/db';
import { getAllAdapters } from '@/lib/platforms';
import Link from 'next/link';
import { PenSquare, Users, Globe, History, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [accounts, posts, platforms] = await Promise.all([
    prisma.account.findMany(),
    prisma.post.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { logs: true } }),
    Promise.resolve(getAllAdapters()),
  ]);

  const configuredCount = platforms.filter((p) => p.isConfigured()).length;
  const successCount = posts.flatMap((p) => p.logs).filter((l) => l.status === 'success').length;
  const failedCount = posts.flatMap((p) => p.logs).filter((l) => l.status === 'failed').length;

  const stats = [
    { label: '已集成平台', value: platforms.length, sub: `${configuredCount} 个已配置`, icon: Globe, color: 'bg-blue-500' },
    { label: '绑定账号', value: accounts.length, sub: '个社媒账号', icon: Users, color: 'bg-purple-500' },
    { label: '发布成功', value: successCount, sub: '次', icon: CheckCircle2, color: 'bg-green-500' },
    { label: '发布失败', value: failedCount, sub: '次', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">控制台</h1>
          <p className="text-sm text-gray-500">多平台社媒发布概览</p>
        </div>
        <Link href="/compose" className="btn-primary">
          <PenSquare className="h-4 w-4" /> 新建发布
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label} · {s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* 平台状态 */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">平台对接状态</h2>
          <Link href="/accounts" className="text-sm text-brand-600 hover:underline">
            管理账号 <ArrowRight className="inline h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {platforms.map((p) => {
            const bound = accounts.filter((a) => a.provider === p.meta.id).length;
            return (
              <div
                key={p.meta.id}
                className="flex flex-col items-center rounded-lg border border-gray-100 p-4 text-center"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: p.meta.color }}
                >
                  {p.meta.icon}
                </div>
                <div className="mt-2 text-sm font-medium">{p.meta.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {p.isConfigured() ? (
                    <span className="chip bg-green-100 text-green-700">已配置</span>
                  ) : (
                    <span className="chip bg-gray-100 text-gray-500">未配置</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400">{bound > 0 ? `${bound} 个账号` : '未绑定'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最近发布 */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">最近发布</h2>
          <Link href="/history" className="text-sm text-brand-600 hover:underline">
            查看全部 <ArrowRight className="inline h-3 w-3" />
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            <History className="mx-auto mb-2 h-8 w-8 opacity-40" />
            暂无发布记录,点击「新建发布」开始
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                <div className="flex-1">
                  <div className="line-clamp-1 text-sm">{post.text}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
                    <span>·</span>
                    <span>{post.logs.length} 个平台</span>
                  </div>
                </div>
                <span
                  className={
                    'chip ' +
                    (post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : post.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700')
                  }
                >
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}