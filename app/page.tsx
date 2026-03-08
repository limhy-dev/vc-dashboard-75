'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Activity,
  Filter,
  Star,
  Award,
  Calendar,
  Percent,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SalesRow {
  date: string;
  product: string;
  channel: string;
  orders: number;
  revenue: number;
  cost: number;
  visitors: number;
  customers: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

function KpiCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-textSecondary">{title}</h3>
        <div className="p-2 bg-indigo-50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between self-stretch">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function SimpleInsightCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border/50 rounded-xl p-4 flex items-center gap-4 transition-all hover:border-indigo-100 hover:bg-indigo-50/20">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary/60">{title}</p>
        <p className="text-sm font-bold text-textPrimary leading-tight">{value}</p>
        {subtitle && <p className="text-[10px] text-indigo-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

function CardSection({ title, items, borderColor, textColor, dotColor }: { title: string; items: string[]; borderColor: string; textColor: string; dotColor: string }) {
  return (
    <div className={`bg-white p-5 rounded-xl border shadow-sm ${borderColor}`}>
      <h3 className={`font-semibold mb-4 ${textColor}`}>{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start gap-2.5">
            <span className={`${dotColor} shrink-0 select-none`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [aiInsights, setAiInsights] = useState<{ alerts: string[], opportunities: string[], suggestions: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetch('/api/sales')
      .then(res => res.ok ? res.json() : res.json().then(e => { throw new Error(e.error) }))
      .then(d => {
        const sorted = [...new Set(d.map((x: any) => x.date))].sort().reverse();
        if (sorted.length) {
          // Set to last 30 days if possible, or just the full range
          setStartDate(String(sorted[Math.min(30, sorted.length - 1)]));
          setEndDate(String(sorted[0]));
        }
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setFetchError(e.message || 'API Error');
        setLoading(false);
      });
  }, []);

  const uniqueProducts = useMemo(() => ['All', ...new Set(data.map(d => d.product).filter(Boolean))], [data]);
  const uniqueChannels = useMemo(() => ['All', ...new Set(data.map(d => d.channel).filter(Boolean))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchDate = row.date >= startDate && row.date <= endDate;
      const matchProduct = selectedProduct === 'All' || row.product === selectedProduct;
      const matchChannel = selectedChannel === 'All' || row.channel === selectedChannel;
      return matchDate && matchProduct && matchChannel;
    });
  }, [data, startDate, endDate, selectedProduct, selectedChannel]);

  const kpis = useMemo(() => {
    const rev = filteredData.reduce((s, r) => s + r.revenue, 0);
    const ord = filteredData.reduce((s, r) => s + r.orders, 0);
    const cst = filteredData.reduce((s, r) => s + r.cost, 0);
    return { rev, ord, prf: rev - cst, aov: ord > 0 ? rev / ord : 0 };
  }, [filteredData]);

  const simpleInsights = useMemo(() => {
    if (!filteredData.length) return null;
    const pRev: any = {};
    const cRev: any = {};
    const dRev: any = {};
    filteredData.forEach(r => {
      pRev[r.product] = (pRev[r.product] || 0) + r.revenue;
      cRev[r.channel] = (cRev[r.channel] || 0) + r.revenue;
      dRev[r.date] = (dRev[r.date] || 0) + r.revenue;
    });
    const bestP = Object.keys(pRev).reduce((a, b) => pRev[a] > pRev[b] ? a : b);
    const bestC = Object.keys(cRev).reduce((a, b) => cRev[a] > cRev[b] ? a : b);
    const bestD = Object.keys(dRev).reduce((a, b) => dRev[a] > dRev[b] ? a : b);
    return { bestP, bestC, bestD };
  }, [filteredData]);

  const trendData = useMemo(() => {
    const g = filteredData.reduce((acc: any, r) => {
      acc[r.date] = (acc[r.date] || 0) + r.revenue;
      return acc;
    }, {});
    return Object.entries(g).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const handleAi = async () => {
    setIsAiLoading(true);
    setAiError('');
    try {
      const prompt = `Based on this data: $${kpis.rev.toLocaleString()} revenue, ${kpis.ord} orders, $${kpis.prf.toLocaleString()} profit. Top product: ${simpleInsights?.bestP}. Top channel: ${simpleInsights?.bestC}. Provide 3 short bullet points each for 'alerts', 'opportunities', 'suggestions' in JSON format.`;

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, prompt })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI Error');
      }
      setAiInsights(await res.json());
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading && !fetchError) return <div className="min-h-screen flex items-center justify-center"><Activity className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {fetchError && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">Error: {fetchError}</div>}
        {aiError && <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">AI Warning: {aiError}</div>}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-3xl font-bold text-textPrimary">Advance Intelligence Dashboard</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 card">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 text-sm border rounded bg-white" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 text-sm border rounded bg-white" />
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="p-2 text-sm border rounded bg-white">
              {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} className="p-2 text-sm border rounded bg-white">
              {uniqueChannels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Revenue" value={`$${kpis.rev.toLocaleString()}`} icon={<DollarSign className="text-blue-600" />} />
          <KpiCard title="Orders" value={kpis.ord.toLocaleString()} icon={<ShoppingCart className="text-emerald-600" />} />
          <KpiCard title="Profit" value={`$${kpis.prf.toLocaleString()}`} icon={<TrendingUp className="text-violet-600" />} />
          <KpiCard title="AOV" value={`$${kpis.aov.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={<Activity className="text-amber-600" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SimpleInsightCard title="Best Product" value={simpleInsights?.bestP || '-'} icon={<Star className="text-amber-500" />} />
          <SimpleInsightCard title="Best Channel" value={simpleInsights?.bestC || '-'} icon={<Award className="text-blue-500" />} />
          <SimpleInsightCard title="Best Day" value={simpleInsights?.bestD || '-'} icon={<Calendar className="text-emerald-500" />} />
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-600 w-5 h-5" />
              <h2 className="text-xl font-bold">AI Business Strategist</h2>
            </div>
            <div className="flex gap-2">
              <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="p-2 text-sm border rounded bg-white">
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fastest)</option>
                <option value="gemini-3.1-pro">Gemini 3.1 Pro (Advanced reasoning)</option>
                <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              </select>
              <button
                onClick={handleAi}
                disabled={isAiLoading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <><Activity className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Generate Insights'}
              </button>
            </div>
          </div>

          {aiInsights ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSection title="Alerts" items={aiInsights.alerts} borderColor="border-red-100" textColor="text-red-700" dotColor="text-red-500" />
              <CardSection title="Opportunities" items={aiInsights.opportunities} borderColor="border-emerald-100" textColor="text-emerald-700" dotColor="text-emerald-500" />
              <CardSection title="Suggestions" items={aiInsights.suggestions} borderColor="border-blue-100" textColor="text-blue-700" dotColor="text-blue-500" />
            </div>
          ) : (
            <div className="h-48 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-textSecondary bg-gray-50/50">
              <Activity className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm font-medium">Click "Generate Insights" to run AI analysis</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">Revenue Growth Trend</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000) + 'k' : v}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
