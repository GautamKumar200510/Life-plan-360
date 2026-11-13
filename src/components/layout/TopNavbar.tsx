'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatINR } from '@/lib/calculations/currencyFormatter';

interface TopNavbarProps {
  onToggleMobile: () => void;
  collapsed: boolean;
}

export function TopNavbar({ onToggleMobile, collapsed }: TopNavbarProps) {
  const { user, profile, logout, isDemo } = useAuth();
  const { summary } = useFinance();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const notifications = [
    {
      id: 1,
      title: 'Budget Optimization Insight',
      message: `Your savings rate is ${summary.savingsRate.toFixed(1)}%. Review monthly surplus in Advisor.`,
      time: '10m ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'Upcoming Goal Target',
      message: 'Emergency fund target progress reached 80%.',
      time: '2h ago',
      type: 'success',
    },
    {
      id: 3,
      title: 'Portfolio Valuation',
      message: `Net Worth reached ${formatINR(summary.netWorth, { compact: true })}.`,
      time: '1d ago',
      type: 'wealth',
    },
  ];

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onToggleMobile}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search */}
          <div className="relative w-full hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions, funds, goals..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Right: Date selector, Currency Tag, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Current Date Display */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{todayStr}</span>
          </div>

          {/* Currency Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span>₹ INR</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <Link
                    href="/advisor"
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    View All in AI Advisor <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {profile?.full_name || 'My Account'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {isDemo ? 'Demo Mode' : profile?.email || 'Logged In'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {profile?.full_name || 'Life Plan User'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isDemo ? 'Sandbox Portfolio' : 'Supabase Protected'}</span>
                  </div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </Link>

                <Link
                  href="/advisor"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                >
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>AI Financial Insights</span>
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
