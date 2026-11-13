'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Bot, ArrowRight, RefreshCw, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { useAuth } from '@/lib/context/AuthContext';
import { AiInsightResponse } from '@/types/financial';

export function AiInsightWidget() {
  const { summary, goals } = useFinance();
  const { profile } = useAuth();
  const [insight, setInsight] = useState<AiInsightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          goals,
          userProfile: profile,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setInsight(json.data);
      }
    } catch (e) {
      console.error('Failed to load AI insights', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [summary.totalIncome, summary.totalExpenses, summary.currentPortfolioValue]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100/50 via-emerald-100/30 to-transparent rounded-full blur-2xl -z-0 pointer-events-none" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">AI Wealth Intelligence</h3>
            <p className="text-[11px] text-slate-500">Autonomous synthesis of your financial patterns</p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Regenerate Insights"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      <div className="mt-4 relative z-10">
        {loading ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
          </div>
        ) : insight ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Rating: Grade {insight.healthGrade}
                </span>
                <span className="text-[11px] text-slate-400">Score {insight.healthScore}/100</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {insight.summary}
              </p>
            </div>

            {insight.savingsRecommendations && insight.savingsRecommendations.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-500" /> Key Recommendation
                </p>
                <div className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{insight.savingsRecommendations[0]}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Click regenerate to analyze your current numbers.
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Powered by Gemini AI</span>
          <Link
            href="/advisor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open AI Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
