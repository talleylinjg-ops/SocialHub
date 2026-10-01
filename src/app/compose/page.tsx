'use client';

import { useEffect, useState } from 'react';
import { Send, Loader2, CheckCircle2, XCircle, Image as ImageIcon, Link2 } from 'lucide-react';

interface PlatformInfo {
  id: string;
  name: string;
  color: string;
  icon: string;
  limits: { maxTextLength: number; maxMedia?: number; notes?: string };
  configured: boolean;
  bound: number;
  categories?: Record<string, string>;
}

interface AccountInfo {
  provider: string;
  displayName: string;
}

export default function ComposePage() {
  const [text, setText] = useState('');
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<null | {
    successCount: number;
    totalCount: number;
    details: Array<{ provider: string; success: boolean; error?: string; remoteUrl?: string }>;
  }>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/platforms').then((r) => r.json()),
      fetch('/api/accounts').then((r) => r.json()),
    ]).then(([p, a]) => {
      const boundMap: Record<string, number> = {};
      a.accounts.forEach((acc: AccountInfo) => {
        boundMap[acc.provider] = (boundMap[acc.provider] ?? 0) + 1;
      });
      setPlatforms(p.platforms.map((pl: PlatformInfo) => ({ ...pl, bound: boundMap[pl.id] ?? 0 })));
      setAccounts(a.accounts);
    });
  }, []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setResult(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mediaUrls,
          link: link || undefined,
          targetProviders: [...selected],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          successCount: data.successCount,
          totalCount: data.totalCount,
          details: data.results.map((r: { provider: string; result: { success: boolean; error?: string; remoteUrl?: string } }) => ({
            provider: r.provider,
            success: r.result.success,
            error: r.result.error,
            remoteUrl: r.result.remoteUrl,
          })),
        });
      } else {
        alert(data.error || '发布失败');
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">新建发布</h1>
        <p className="text-sm text-gray-500">编辑一次内容,一键分发到多个社媒平台</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左:编辑区 */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
          <label className="label">文案内容</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="input resize-none"
            placeholder="输入要发布的文案..."
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>支持 Emoji、话题标签 #、@提及</span>
            <span>{text.length} 字</span>
          </div>

          <div className="mt-4">
            <label className="label">媒体 URL(图片/视频,每行一个)</label>
            <textarea
              value={mediaUrls.join('\n')}
              onChange={(e) => setMediaUrls(e.target.value.split('\n').filter(Boolean))}
              rows={3}
              className="input resize-none font-mono text-xs"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/video1.mp4"
            />
            <div className="mt-1 text-xs text-gray-400">
              <ImageIcon className="inline h-3 w-3" /> 支持图片与视频直链
            </div>
          </div>

          <div className="mt-4">
            <label className="label">
              <Link2 className="inline h-3 w-3" /> 附带链接(可选)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="input"
              placeholder="https://your-landing-page.com"
            />
          </div>
          </div>

          {/* 发布结果 */}
          {result && (
            <div className="card p-5">
              <h3 className="mb-3 font-semibold">发布结果</h3>
              <div className="mb-3 flex items-center gap-4 text-sm">
                <span className="chip bg-green-100 text-green-700">
                  成功 {result.successCount}
                </span>
                <span className="chip bg-red-100 text-red-700">
                  失败 {result.totalCount - result.successCount}
                </span>
                <span className="text-gray-400">共 {result.totalCount} 个平台</span>
              </div>
              <div className="space-y-2">
                {result.details.map((d) => (
                  <div
                    key={d.provider}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {d.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {d.provider}
                    </span>
                    {d.success ? (
                      d.remoteUrl ? (
                        <a href={d.remoteUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          查看
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">已提交</span>
                      )
                    ) : (
                      <span className="max-w-[55%] truncate text-xs text-red-500" title={d.error}>
                        {d.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右:平台选择 */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">选择平台</h3>
              <span className="text-xs text-gray-400">已选 {selected.size}</span>
            </div>
            <div className="space-y-2">
              {platforms.map((p) => {
                const isSel = selected.has(p.id);
                const disabled = !p.configured || p.bound === 0;
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                      isSel ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-600"
                      checked={isSel}
                      disabled={disabled}
                      onChange={() => toggle(p.id)}
                    />
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">
                        {p.configured ? (p.bound > 0 ? `${p.bound} 个账号` : '未绑定') : '未配置'}
                      </div>
                    </div>
                    {isSel && (
                      <div className="text-right text-xs text-gray-400">
                        ≤{p.limits.maxTextLength}字
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              灰色平台需先在 <b>账号管理</b> 完成 OAuth 授权与配置
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing || selected.size === 0 || !text.trim()}
            className="btn-primary w-full justify-center py-3"
          >
            {publishing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> 发布中...</>
            ) : (
              <><Send className="h-4 w-4" /> 一键发布到 {selected.size} 个平台</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}