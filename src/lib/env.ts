// 安全读取环境变量(服务端专用)
export function env(key: string): string | undefined {
  if (typeof process === 'undefined') return undefined;
  return process.env[key];
}

export function envRequired(key: string, label: string): string {
  const v = env(key);
  if (!v) throw new Error(`缺少环境变量 ${key}(${label})`);
  return v;
}

// 构建 OAuth 授权 URL 的通用辅助
export function buildAuthorizeUrl(
  baseUrl: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  return url.toString();
}