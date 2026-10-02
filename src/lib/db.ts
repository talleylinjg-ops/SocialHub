import { PrismaClient } from '@prisma/client';
import { env } from '@/lib/env';

// 检测是否在 Vercel serverless 环境
const isVercel = !!process.env.VERCEL;
const isProd = process.env.NODE_ENV === 'production';

// Vercel 的文件系统是只读的(除 /tmp),SQLite 文件需放 /tmp
function resolveDatabaseUrl(): string {
  const configured = env('DATABASE_URL');
  if (configured && !configured.startsWith('file:')) {
    // 非 SQLite 连接串(如 PostgreSQL)直接用
    return configured;
  }
  // SQLite 文件模式:Vercel 下放 /tmp,本地用项目目录
  const fileName = configured?.replace('file:', '') ?? 'dev.db';
  if (isVercel) {
    return `file:/tmp/${fileName}`;
  }
  return `file:./${fileName}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: isProd ? ['error'] : ['warn', 'error'],
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!isProd) globalForPrisma.prisma = prisma;

// 在 Vercel serverless 环境下自动初始化数据库表结构
// SQLite 在 /tmp 下是新文件,需要创建表
// 用 Prisma 自身的 $executeRawUnsafe 建表,不依赖 node:sqlite(兼容性更好)
const initStatements = [
  `CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    displayName TEXT NOT NULL,
    handle TEXT,
    avatarUrl TEXT,
    accessToken TEXT NOT NULL,
    refreshToken TEXT,
    tokenExpiresAt DATETIME,
    scope TEXT,
    platformUserId TEXT,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT (datetime('now')),
    updatedAt DATETIME DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS Account_provider_idx ON Account(provider)`,
  `CREATE TABLE IF NOT EXISTS Post (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    mediaUrls TEXT DEFAULT '[]',
    status TEXT DEFAULT 'draft',
    scheduledAt DATETIME,
    createdAt DATETIME DEFAULT (datetime('now')),
    updatedAt DATETIME DEFAULT (datetime('now')),
    accountId TEXT NOT NULL,
    targets TEXT DEFAULT '[]',
    FOREIGN KEY (accountId) REFERENCES Account(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS Post_accountId_idx ON Post(accountId)`,
  `CREATE INDEX IF NOT EXISTS Post_status_idx ON Post(status)`,
  `CREATE TABLE IF NOT EXISTS PublishLog (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    remoteId TEXT,
    remoteUrl TEXT,
    error TEXT,
    createdAt DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (postId) REFERENCES Post(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS PublishLog_postId_idx ON PublishLog(postId)`,
  `CREATE INDEX IF NOT EXISTS PublishLog_provider_idx ON PublishLog(provider)`,
];

export async function ensureDatabaseReady(): Promise<void> {
  if (!isVercel) return; // 本地环境用 prisma db push 手动初始化
  const flag = globalThis as unknown as { __dbReady?: boolean };
  if (flag.__dbReady) return;

  try {
    // 尝试查询,如果失败说明表不存在
    await prisma.post.findMany({ take: 1 });
    flag.__dbReady = true;
  } catch {
    // 表不存在,逐条执行建表 SQL
    for (const stmt of initStatements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (e) {
        // 忽略"已存在"等错误,继续下一条
      }
    }
    flag.__dbReady = true;
  }
}
