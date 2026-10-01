'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid, PenSquare, Users, History, Globe, Clock, Share2,
} from 'lucide-react';

const navItems = [
  { href: '/', label: '控制台', icon: LayoutGrid },
  { href: '/compose', label: '新建发布', icon: PenSquare },
  { href: '/schedule', label: '定时发布', icon: Clock },
  { href: '/accounts', label: '账号管理', icon: Users },
  { href: '/history', label: '发布历史', icon: History },
  { href: '/matrix', label: '全球社媒', icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-900 text-gray-100">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
          <Share2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold">SocialHub</div>
          <div className="text-xs text-gray-400">多平台社媒发布</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 px-6 py-4">
        <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400">
          <div className="mb-1 font-medium text-gray-300">适配器架构 v1.0</div>
          已集成 8 个平台,可扩展任意社媒
        </div>
      </div>
    </aside>
  );
}