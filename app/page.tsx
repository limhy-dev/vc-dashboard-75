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

// KpiCard Component
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

// SimpleInsightCard Component
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

export default function Dashboard() {
    const [data, setData] = useState<SalesRow[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('All');
    const [selectedChannel, setSelectedChannel] = useState('All');

    // AI Insights State
    const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite-preview');
    const [aiInsights, setAiInsights] = useState<{ alerts: string[], opportunities: string[], suggestions: string[] } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        fetch('/api/sales')
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to fetch') });
                return response.json();
            })
            .then(parsedData => {
                const sortedDates = [...new Set(parsedData.map((d: any) => d.date))].sort();
                if (sortedDates.length > 0) {
                    setStartDate(String(sortedDates[0]));
                    setEndDate(String(sortedDates[sortedDates.length - 1]));
                }
                setData(parsedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data from API:', error);
                setFetchError(error.message || 'Could not connect to the sales API. Is the server running?');
                setLoading(false);
            });
    }, []);

    // Use memos for metrics and charts
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
        const totalRevenue = filteredData.reduce((sum, row) => sum + row.revenue, 0);
        const totalOrders = filteredData.reduce((sum, row) => sum + row.orders, 0);
        const totalCost = filteredData.reduce((sum, row) => sum + row.cost, 0);
        const totalProfit = totalRevenue - totalCost;
        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return { totalRevenue, totalOrders, totalProfit, aov };
    }, [filteredData]);

    const simpleInsights = useMemo(() => {
        if (filteredData.length === 0) return null;
        const productRevs: any = {};
        const channelRevs: any = {};
        const dayRevs: any = {};
        const channelConv: any = {};

        filteredData.forEach(row => {
            productRevs[row.product] = (productRevs[row.product] || 0) + row.revenue;
            channelRevs[row.channel] = (channelRevs[row.channel] || 0) + row.revenue;
            dayRevs[row.date] = (dayRevs[row.date] || 0) + row.revenue;
            if (!channelConv[row.channel]) channelConv[row.channel] = { visitors: 0, customers: 0 };
            channelConv[row.channel].visitors += (row.visitors || 0);
            channelConv[row.channel].customers += (row.customers || row.orders || 0);
        });

        const bestProduct = Object.keys(productRevs).reduce((a, b) => productRevs[a] > productRevs[b] ? a : b);
        const bestChannel = Object.keys(channelRevs).reduce((a, b) => channelRevs[a] > channelRevs[b] ? a : b);
        const highestDay = Object.keys(dayRevs).reduce((a, b) => dayRevs[a] > dayRevs[b] ? a : b);

        let bestConvChannel = '';
        let highestConv = -1;
        for (const [channel, stats] of Object.entries<any>(channelConv)) {
            const conv = stats.visitors > 0 ? stats.customers / stats.visitors : 0;
            if (conv > highestConv) {
                highestConv = conv;
                bestConvChannel = channel;
            }
        }

        return {
            bestProduct,
            bestChannel,
            highestDay,
            bestConvChannel,
            highestConvRate: (highestConv * 100).toFixed(1) + '%'
        };
    }, [filteredData]);

    const trendData = useMemo(() => {
        const grouped = filteredData.reduce((acc: any, row) => {
            if (!acc[row.date]) acc[row.date] = { date: row.date, revenue: 0 };
            acc[row.date].revenue += row.revenue;
            return acc;
        }, {});
        return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredData]);

    const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const formatNumber = (val: number) => val.toLocaleString();

    const generateAiInsights = async () => {
        setIsAiLoading(true);
        setAiError('');

        try {
            const summary = `
        Total Revenue: ${formatCurrency(kpis.totalRevenue)}
        Total Orders: ${kpis.totalOrders}
        Total Profit: ${formatCurrency(kpis.totalProfit)}
        AOV: ${formatCurrency(kpis.aov)}
        Best Product: ${simpleInsights?.bestProduct}
        Best Channel: ${simpleInsights?.bestChannel}
        Highest Revenue Day: ${simpleInsights?.highestDay}
        Highest Conv. Rate Channel: ${simpleInsights?.bestConvChannel} (${simpleInsights?.highestConvRate})
      `;

            const prompt = `Here is a summary of our business metrics based on the current data:\n${summary}\n\nPlease analyze this and provide exactly 3 sections: Alerts, Opportunities, and Suggestions. Keep each insight short, clear, and business-oriented. Reply ONLY with valid JSON matching this schema exactly: {"alerts": ["string"], "opportunities": ["string"], "suggestions": ["string"]}`;

            const res = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: selectedModel, prompt })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to generate insights.');
            }

            const parsed = await res.json();
            setAiInsights(parsed);
        } catch (err: any) {
            setAiError(err.message || 'An error occurred during AI analysis. Check server configuration.');
        } finally {
            setIsAiLoading(false);
        }
    };

    if (loading && !fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Activity size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10 font-sans text-textPrimary">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
                {fetchError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-2">⚠️ Database Connection Issue</span>
                        <span>{fetchError}</span>
                        <span className="mt-2 text-xs opacity-75 italic">Tip: Check your `.env` configuration on Vercel or locally.</span>
                    </div>
                )}

                {/* Header & Filters */}
                <header className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-textPrimary">Business Intelligence Dashboard</h1>
                            <p className="text-textSecondary mt-1">Advanced metrics and AI insights driven by real-time data.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 card bg-surface">
                        {/* Filter Inputs (same logic as App.tsx) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-textSecondary uppercase">Start Date</label>
                            <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-textSecondary uppercase">End Date</label>
                            <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-textSecondary uppercase">Product</label>
                            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white">
                                {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-textSecondary uppercase">Channel</label>
                            <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)} className="p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white">
                                {uniqueChannels.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </header>

                {/* Dash Grid Logic... */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Total Revenue" value={formatCurrency(kpis.totalRevenue)} icon={<DollarSign size={20} className="text-primary" />} />
                    <KpiCard title="Total Orders" value={formatNumber(kpis.totalOrders)} icon={<ShoppingCart size={20} className="text-success" />} />
                    <KpiCard title="Total Profit" value={formatCurrency(kpis.totalProfit)} icon={<TrendingUp size={20} className="text-emerald-500" />} />
                    <KpiCard title="AOV" value={formatCurrency(kpis.aov)} icon={<Activity size={20} className="text-indigo-500" />} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SimpleInsightCard title="Best Product" value={simpleInsights?.bestProduct || '-'} icon={<Star size={18} className="text-yellow-500" />} />
                    <SimpleInsightCard title="Best Channel" value={simpleInsights?.bestChannel || '-'} icon={<Award size={18} className="text-purple-500" />} />
                    <SimpleInsightCard title="Best Revenue Day" value={simpleInsights?.highestDay || '-'} icon={<Calendar size={18} className="text-blue-500" />} />
                    <SimpleInsightCard title="Top Conv. Rate" value={simpleInsights?.highestConvRate || '-'} subtitle={simpleInsights?.bestConvChannel} icon={<Percent size={18} className="text-emerald-500" />} />
                </div>

                {/* AI Insight Section Redesign */}
                <div className="card p-6 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/60 shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                <Sparkles size={20} className="text-indigo-600" />
                                AI Strategy Insights
                            </h2>
                            <p className="text-sm text-indigo-700/80 mt-1">Vercel production model: {selectedModel}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="p-2 border border-indigo-200 rounded-lg text-sm bg-white text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shrink-0" >
                                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite</option>
                                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            </select>
                            <button onClick={generateAiInsights} disabled={isAiLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0">
                                {isAiLoading ? 'Analyzing...' : 'Generate New Insights'}
                            </button>
                        </div>
                    </div>
                    {aiError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{aiError}</div>}
                    {aiInsights && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-500">
                            <CardSection title="Alerts" items={aiInsights.alerts} borderColor="border-red-100" textColor="text-red-700" dotColor="text-red-500" />
                            <CardSection title="Opportunities" items={aiInsights.opportunities} borderColor="border-emerald-100" textColor="text-emerald-700" dotColor="text-emerald-500" />
                            <CardSection title="Suggestions" items={aiInsights.suggestions} borderColor="border-blue-100" textColor="text-blue-700" dotColor="text-blue-500" />
                        </div>
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card p-6 pb-2 lg:col-span-3 h-[400px]">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-textPrimary">Performance Visualization</h2>
                            <p className="text-textSecondary text-sm">Revenue trend across filtered timeframe</p>
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v) => formatCurrency(Number(v))} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardSection({ title, items, borderColor, textColor, dotColor }: any) {
    return (
        <div className={`bg-white p-5 rounded-xl border ${borderColor} shadow-sm`}>
            <h3 className={`font-semibold ${textColor} mb-4`}>{title}</h3>
            <ul className="space-y-3">
                {items.map((item: any, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2.5">
                        <span className={`${dotColor} shrink-0 select-none">•</span> <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
