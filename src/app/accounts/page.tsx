'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface Account {
  id: string;
  provider: string;
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PlatformInfo {
  id: string;
  name: string;
  color: string;
  icon: string;
  website: string;
  oauthScopes: string[];
  configured: boolean;
}

function AccountsContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const err = searchParams.get('error');
    if (connected) setToast(`✅ ${connected} 账号连接成功`);
    if (err) setToast(`❌ ${err}`);
    if (connected || err) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const refresh = () =>
    Promise.all([
      fetch('/api/accounts').then((r) => r.json()),
      fetch('/api/platforms').then((r) => r.json()),
    ]).then(([a, p]) => {
      setAccounts(a.accounts);
      setPlatforms(p.platforms);
    });

  const connect = async (provider: string) => {
    setLoading((s) => ({ ...s, [provider]: true }));
    try {
      const res = await fetch(`/api/auth/${provider}?action=start`).then((r) => r.json());
      if (res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setToast(`❌ ${res.error || '无法启动授权'}`);
      }
    } finally {
      setLoading((s) => ({ ...s, [provider]: false }));
    }
  };

  const remove = async (id: string) => {
    if (!confirm('确认删除该账号?')) return;
    await fetch('/api/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    refresh();
  };

  const boundedProvider = (provider: string) => accounts.filter((a) => a.provider === provider);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">账号管理</h1>
        <p className="text-sm text-gray-500">绑定社媒账号,完成 OAuth 授权</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
          {toast}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((p) => {
          const bound = boundedProvider(p.id);
          return (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-400 hover:text-brand-600"
                    >
                      {p.website} <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </div>
                </div>
                {p.configured ? (
                  <span className="chip bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> 已配置
                  </span>
                ) : (
                  <span className="chip bg-gray-100 text-gray-500">
                    <AlertCircle className="h-3 w-3" /> 未配置
                  </span>
                )}
              </div>

              {/* 已绑定账号 */}
              {bound.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {bound.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {a.avatarUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
                        )}
                        <div>
                          <div className="text-sm font-medium">{a.displayName}</div>
                          {a.handle && <div className="text-xs text-gray-400">{a.handle}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(a.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                  暂未绑定账号
                </div>
              )}

              <button
                onClick={() => connect(p.id)}
                disabled={!p.configured || loading[p.id]}
                className="btn-secondary mt-4 w-full justify-center"
              >
                {loading[p.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {bound.length > 0 ? '绑定新账号' : '连接授权'}
              </button>

              {!p.configured && (
                <div className="mt-2 text-center text-xs text-amber-600">
                  请先在 .env 配置 {p.id.toUpperCase()} 凭证
                </div>
              )}
              {p.configured && (
                <div className="mt-2 text-xs text-gray-400">
                  所需权限: {p.oauthScopes.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">加载中...</div>}>
      <AccountsContent />
    </Suspense>
  );
}