'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  Lightbulb,
  FileText,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useFinance } from '@/lib/context/FinanceContext';
import { useAuth } from '@/lib/context/AuthContext';
import { AiInsightResponse, ChatMessage } from '@/types/financial';
import { formatINR } from '@/lib/calculations/currencyFormatter';

const PRESET_QUESTIONS = [
  'How can I reduce my monthly expenses?',
  'How much should I save every month?',
  'Which expense category is consuming most of my money?',
  'How can I achieve my savings goal faster?',
  'Give me a summary of my financial performance.',
  'What improvements can I make to my monthly budget?',
];

export default function AdvisorPage() {
  const { summary, goals, budget } = useFinance();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'advisor' | 'report'>('advisor');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello ${profile?.full_name || 'there'}! I am your AI Wealth Advisor on Life Plan 360°.

I have analyzed your real financial records:
• Recorded Inflow: **${formatINR(summary.totalIncome)}**
• Total Outflow: **${formatINR(summary.totalExpenses)}**
• Savings Rate: **${summary.savingsRate.toFixed(1)}%**
• Portfolio Value: **${formatINR(summary.currentPortfolioValue)}**
• Net Worth: **${formatINR(summary.netWorth)}**

Ask me anything about budgeting, reducing discretionary costs, growing your savings, or optimizing your retirement plan!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [insights, setInsights] = useState<AiInsightResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch synthesized report
  const fetchReport = async () => {
    setInsightsLoading(true);
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
      const data = await res.json();
      if (data.success && data.data) {
        setInsights(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          financialSummary: summary,
          userProfile: profile,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        'I have analyzed your request based on your current financial records. Please ensure your inputs and records are up to date.';

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Unable to reach AI advisory service at the moment. Please verify your GEMINI_API_KEY configuration.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const copyReport = () => {
    if (!insights) return;
    const reportText = `
LIFE PLAN 360° - FINANCIAL INTELLIGENCE REPORT
Date: ${new Date().toLocaleDateString('en-IN')}
User: ${profile?.full_name || 'Client'}
Health Score: ${insights.healthScore}/100 (Grade ${insights.healthGrade})

EXECUTIVE SUMMARY:
${insights.summary}

KEY HIGHLIGHTS:
${insights.keyHighlights?.map((h) => `• ${h}`).join('\n')}

SPENDING PATTERNS:
${insights.spendingPatterns?.map((s) => `• ${s}`).join('\n')}

SAVINGS RECOMMENDATIONS:
${insights.savingsRecommendations?.map((r) => `• ${r}`).join('\n')}

BUDGET IMPROVEMENTS:
${insights.budgetImprovements?.map((b) => `• ${b}`).join('\n')}

RETIREMENT READINESS:
${insights.retirementInsights}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Financial Advisor
            </h1>
            <Badge variant="emerald" size="sm">
              <Sparkles className="w-3 h-3" /> Gemini Neural Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized wealth intelligence, spending diagnosis, and conversational financial planning
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'advisor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversational Advisor
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diagnostic Report
          </button>
        </div>
      </div>

      {activeTab === 'advisor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Conversation (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm h-[680px] overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Life Plan 360° AI Advisor
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time Financial Model Active</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      role: 'assistant',
                      content: `Conversation reset. How can I help you plan your wealth today?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
                title="Clear conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/60'
                    }`}
                  >
                    <div className="whitespace-pre-line prose-sm">{m.content}</div>
                    <div
                      className={`text-[10px] text-right ${
                        m.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3 text-xs items-center text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 text-slate-500">
                    <span className="inline-flex gap-1 items-center">
                      Analyzing portfolio data & compounding metrics
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-6 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question about your savings, budget, or investments..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputValue.trim() || isSending}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </div>
          </div>

          {/* Right Live Portfolio Context Card (1 Col) */}
          <div className="space-y-4">
            <Card title="Advisor Portfolio Context">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Savings Rate</span>
                  <strong className="text-slate-900">{summary.savingsRate.toFixed(1)}%</strong>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Budget Consumed</span>
                  <strong className="text-slate-900">
                    {summary.budgetUtilizationPct.toFixed(0)}%
                  </strong>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Portfolio Value</span>
                  <strong className="text-blue-600">
                    {formatINR(summary.currentPortfolioValue)}
                  </strong>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Debt</span>
                  <strong className="text-rose-600">{formatINR(summary.totalLiabilities)}</strong>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Net Worth</span>
                  <strong className="text-emerald-600">{formatINR(summary.netWorth)}</strong>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> AI Safety & Privacy
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Insights are educational calculations based on your stored data. The system never accesses your banking credentials or gives speculative stock tips.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Diagnostic Report Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Wealth Diagnosis & Health Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed report generated by Gemini AI analyzing all 6 financial modules
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyReport}
                icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Report'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={fetchReport}
                isLoading={insightsLoading}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Re-Analyze Portfolio
              </Button>
            </div>
          </div>

          {insights ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
              {/* Score Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0b1329] to-[#16285c] text-white">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Comprehensive Health Assessment
                  </span>
                  <h2 className="text-xl font-bold mt-1">Financial Wellness Rating</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {insights.summary}
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <span className="text-3xl font-extrabold text-white">
                      Grade {insights.healthGrade}
                    </span>
                    <span className="block text-[11px] text-emerald-400 font-semibold mt-0.5">
                      Score: {insights.healthScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Key Highlights */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Portfolio Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {insights.keyHighlights?.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Spending Pattern Analysis */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Spending Pattern & Outflow Analysis
                </h4>
                <div className="space-y-2">
                  {insights.spendingPatterns?.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-900">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Savings Recommendations */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  High-Impact Savings & SIP Recommendations
                </h4>
                <div className="space-y-2">
                  {insights.savingsRecommendations?.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900">
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Budget Improvements & Retirement Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Budget Optimization</h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                    {insights.budgetImprovements?.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Retirement Compounding View</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {insights.retirementInsights}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Report is currently loading...
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
