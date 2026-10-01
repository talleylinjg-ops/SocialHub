'use client';

import { useEffect, useState } from 'react';
import { Clock, Calendar, Send, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  text: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  logs: Array<{ provider: string; status: string }>;
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);

  const refresh = () =>
    fetch('/api/posts').then((r) => r.json()).then((d) => setPosts(d.posts));

  useEffect(() => { refresh(); }, []);

  const scheduled = posts.filter((p) => p.status === 'scheduled' || p.scheduledAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">定时发布</h1>
        <p className="text-sm text-gray-500">管理定时发布的任务队列</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          定时任务由后台 cron 轮询 scheduled 状态的 Post,到点后自动调用发布分发器
        </div>
      </div>

      {scheduled.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <Clock className="mx-auto mb-3 h-10 w-10 opacity-40" />
          暂无定时任务
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {scheduled.map((post) => (
            <div key={post.id} className="p-5">
              <p className="text-sm">{post.text}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" />
                  {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('zh-CN') : '未设置'}
                </span>
                <span>·</span>
                <span>{post.logs.length} 个平台</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}