import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusLabel: Record<string, { text: string; cls: string }> = {
  published: { text: '已发布', cls: 'bg-green-100 text-green-700' },
  failed: { text: '部分失败', cls: 'bg-red-100 text-red-700' },
  publishing: { text: '发布中', cls: 'bg-blue-100 text-blue-700' },
  draft: { text: '草稿', cls: 'bg-gray-100 text-gray-600' },
  scheduled: { text: '已定时', cls: 'bg-amber-100 text-amber-700' },
};

export default async function HistoryPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { logs: true, account: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">发布历史</h1>
        <p className="text-sm text-gray-500">查看所有发布记录及各平台结果</p>
      </div>

      {posts.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <Clock className="mx-auto mb-3 h-10 w-10 opacity-40" />
          暂无发布记录
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {posts.map((post) => {
            const st = statusLabel[post.status] ?? statusLabel.draft;
            return (
              <div key={post.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{post.text}</p>
                    {post.scheduledAt && (
                      <div className="mt-1 text-xs text-amber-600">
                        <Clock className="inline h-3 w-3" /> 定时: {formatDate(post.scheduledAt)}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">
                      {formatDate(post.createdAt)} · 账号 {post.account.displayName}
                    </div>
                  </div>
                  <span className={`chip ${st.cls} shrink-0`}>{st.text}</span>
                </div>

                {/* 各平台结果 */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.logs.map((log) => (
                    <span
                      key={log.id}
                      className={`chip ${
                        log.status === 'success'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                      title={log.error ?? undefined}
                    >
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {log.provider}
                      {log.remoteUrl && (
                        <a href={log.remoteUrl} target="_blank" rel="noreferrer" className="ml-1">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}