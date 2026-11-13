'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PieChart,
  Wallet,
  Target,
  Hourglass,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useFinance } from '@/lib/context/FinanceContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Income', href: '/income', icon: TrendingUp },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Budget', href: '/budget', icon: PieChart },
  { name: 'Investments', href: '/investments', icon: Wallet },
  { name: 'Savings Goals', href: '/goals', icon: Target },
  { name: 'Retirement Planning', href: '/retirement', icon: Hourglass },
  { name: 'Financial Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Financial Advisor', href: '/advisor', icon: Bot, isAIPill: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { isDemo } = useAuth();
  const { resetToDemoData } = useFinance();

  const handleLinkClick = () => {
    if (mobileOpen) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b1329] text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-extrabold text-lg tracking-wider">360°</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-white font-bold text-base leading-tight tracking-tight">
                  Life Plan 360°
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Wealth & Advisory
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Database Connection Badge */}
        {!collapsed && (
          <div className="mx-4 mt-3 px-3 py-1.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Database:</span>
            </div>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                isSupabaseConfigured && !isDemo
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
              }`}
            >
              {isSupabaseConfigured && !isDemo ? 'Supabase Live' : 'Demo / Local'}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/80'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
                {!collapsed && item.isAIPill && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Reset / Sample Data Action */}
        <div className="p-3 border-t border-slate-800/80">
          {!collapsed ? (
            <button
              onClick={() => {
                if (window.confirm('Reset demo portfolio with fresh sample Indian wealth data?')) {
                  resetToDemoData();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Reset Sample Data</span>
            </button>
          ) : (
            <button
              onClick={() => resetToDemoData()}
              className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-xl"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
