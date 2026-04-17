import { useState, useEffect, useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
    Zap, Activity, Users, FileText, ArrowUpRight, TrendingUp, AlertCircle, 
    ShieldCheck, Target, Layers, ChevronRight, Info, ArrowRight, Gauge, 
    TrendingDown, Globe, Briefcase, Scale, ShieldAlert
} from 'lucide-react';
import { crisisEventBus } from '../context/CrisisEventBus';
import { CONFIG } from '../config';

/* 
  DATA AUGMENTATION HELPERS
*/
const generateTrendData = (baseValue, variancePercent = 0.05, points = 12) => {
    return Array.from({ length: points }).map((_, i) => ({
        time: `${8 + i}:00`,
        value: baseValue * (1 + (Math.random() - 0.5) * variancePercent),
        forecast: baseValue * (1 + (Math.random() - 0.5) * variancePercent * 1.5)
    }));
};

/* 
  PREMIUM VISUAL COMPONENTS - ALIGNED WITH CONTROL TOWER STYLING
*/

// ─── Demand vs Price Bell Curve ───────────────────────────────────────────────
const DemandCurveChart = ({ data, currentPrice, aiPrice }) => {
    const chartData = useMemo(() => {
        if (data?.demand_curve?.length) {
            return data.demand_curve.map(d => ({ price: d.price, demand: d.demand }));
        }
        const ai   = aiPrice ?? 1250;
        const peak = ai * 1.02;
        const sigma = peak * 0.14;          // bell width
        const start = peak - 2.6 * sigma;   // left tail
        const step  = (5.2 * sigma) / 12;   // 13 points across ±2.6σ
        return Array.from({ length: 13 }, (_, i) => {
            const p = start + i * step;
            const d = 100 * Math.exp(-0.5 * ((p - peak) / sigma) ** 2);
            return { price: Math.round(p), demand: Math.round(d * 10) / 10 };
        });
    }, [data, currentPrice, aiPrice]);

    const cur = data?.current_price ?? currentPrice ?? 1100;
    const ai  = data?.ai_recommended_price ?? aiPrice ?? 1250;

    return (
        <div className="relative h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#003a70" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#003a70" stopOpacity={0}    />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="price"
                        tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: 'Price', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#9ca3af' }}
                    />
                    <YAxis
                        tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: 'Demand', angle: -90, position: 'insideLeft', offset: 20, fontSize: 9, fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }}
                        formatter={(v) => [`${v}`, 'Demand']}
                        labelFormatter={(l) => `Price: ₹${l}`}
                    />
                    <Area
                        type="monotone"
                        dataKey="demand"
                        stroke="#003a70"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#demandGrad)"
                        dot={{ r: 4, fill: '#003a70', strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Revenue Peak badge */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-shell-blue text-white font-mono text-[9px] font-bold rounded-full shadow-md uppercase tracking-widest whitespace-nowrap">
                Revenue Peak
            </div>

            {/* AI Price badge */}
            <div className="absolute bottom-12 right-[28%] flex items-center gap-1.5 px-2.5 py-1 bg-shell-blue text-white font-mono text-[9px] font-bold rounded shadow-md whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-blue-300 shrink-0" />
                AI Price ₹{Math.round(ai).toLocaleString()}
            </div>

            {/* Current Price badge */}
            <div className="absolute bottom-6 right-[8%] flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white font-mono text-[9px] font-bold rounded shadow-md whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-red-200 shrink-0" />
                Current Price ₹{Math.round(cur).toLocaleString()}
            </div>
        </div>
    );
};

// ─── Competitor Mini Sparkline ────────────────────────────────────────────────
const CompetitorSparkline = () => {
    const sparkData = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
        i,
        v: 1180 + Math.sin(i / 2.5) * 30 + i * 3,
    })), []);
    return (
        <div className="h-[70px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                        <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}    />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2} fill="url(#compGrad)" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// ─── Main Pricing Intelligence Dashboard ──────────────────────────────────────
const PricingIntelligence = ({ data }) => {
    const [sliderPrice, setSliderPrice] = useState(null);

    const cur        = data?.current_price          ?? 1100;
    const ai         = data?.ai_recommended_price   ?? 1250;
    const pct        = data?.price_change_pct       ?? 13.6;
    const revImpact  = data?.revenue_impact_pct     ?? 12.4;
    const marginChg  = data?.margin_change_pct      ?? 6.8;
    const demandFc   = data?.demand_forecast_units  ?? 14500;
    const confidence = data?.ai_confidence_pct      ?? 93;
    const compAvg    = data?.competitor_avg_price   ?? 1220;
    const percentile = data?.our_percentile         ?? 85;

    const activePrice  = sliderPrice ?? ai;
    const projRevenue  = data?.projected_revenue_m  ?? ((demandFc * activePrice) / 1_000_000).toFixed(1);
    const projMargin   = data?.expected_margin_pct  ?? 28.2;
    const demandEst    = data?.demand_estimate_units ?? demandFc;

    const whyReasons   = data?.why_reasons ?? [
        'Rising demand trend',
        'Competitor prices increased',
        'Cost of raw materials up',
    ];
    const insightsText = data?.ai_insights_text ??
        'AI has identified increased competitor prices and a strong demand trend, recommending a price adjustment to maximize revenue.';
    const riskAlerts   = data?.risk_alerts ?? [
        { level: 'warning', label: 'Competitor',   text: 'Price Drop Risk'    },
        { level: 'warning', label: 'Supply Chain', text: 'Constraints'        },
        { level: 'info',    label: 'Demand',       text: 'Volatility Warning' },
    ];

    const riskIcon = (level) => {
        if (level === 'critical') return '🔴';
        if (level === 'warning')  return '⚠️';
        return '🔽';
    };

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ── KPI Banner ── */}
            <div className="bg-green-900 rounded-lg px-4 py-2.5 flex items-center gap-4 flex-nowrap shadow-md overflow-x-auto">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                        <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                    <span className="font-mono text-[9px] text-green-300 uppercase tracking-widest whitespace-nowrap">AI Recommended Price</span>
                    <span className="text-white font-extrabold text-[16px] tracking-tight whitespace-nowrap">₹{Math.round(ai).toLocaleString()}</span>
                </div>
                <div className="h-5 w-px bg-green-600 shrink-0" />
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-green-300 font-mono text-[9px] uppercase whitespace-nowrap">+ Revenue Impact</span>
                    <span className="text-white font-extrabold font-mono text-[13px]">+{revImpact}%</span>
                </div>
                <div className="h-5 w-px bg-green-600 shrink-0" />
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-green-200 font-mono text-[9px] uppercase whitespace-nowrap">• Margin Change</span>
                    <span className="text-white font-extrabold font-mono text-[13px]">+{marginChg}%</span>
                </div>
                <div className="h-5 w-px bg-green-600 shrink-0" />
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-green-200 font-mono text-[9px] uppercase whitespace-nowrap">• Demand Forecast</span>
                    <span className="text-white font-extrabold font-mono text-[13px]">{demandFc.toLocaleString()} Units</span>
                </div>
                <div className="h-5 w-px bg-green-600 shrink-0" />
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-green-200 font-mono text-[9px] uppercase whitespace-nowrap">• AI Confidence</span>
                    <span className="text-white font-extrabold font-mono text-[13px]">{confidence}%</span>
                </div>
            </div>

            {/* ── Top Row ── */}
            <div className="grid grid-cols-[240px_1fr_230px] gap-3">

                {/* Price Recommendation */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-40" />
                    <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4">Price Recommendation</h3>
                    <div className="space-y-3 mb-4">
                        <div>
                            <span className="font-mono text-[12px] text-gray-500">Current Price: </span>
                            <span className="font-mono text-[14px] font-bold text-shell-darkText">₹{Math.round(cur).toLocaleString()}</span>
                        </div>
                        <div>
                            <div className="font-mono text-[12px] text-gray-500">AI Suggested Price:</div>
                            <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="font-mono text-[20px] font-extrabold text-shell-darkText">₹{Math.round(ai).toLocaleString()}</span>
                                <span className="font-mono text-[12px] text-green-600 font-bold">(+{pct}%)</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="font-mono text-[12px] font-bold text-shell-darkText mb-2">Why this price?</div>
                        <ul className="space-y-2">
                            {whyReasons.map((r, i) => (
                                <li key={i} className="flex items-center gap-2 text-[12px] font-mono text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-shell-blue shrink-0" />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Demand vs Price Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-40" />
                    <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-2">Demand vs Price</h3>
                    <div className="h-[230px]">
                        <DemandCurveChart data={data} currentPrice={cur} aiPrice={ai} />
                    </div>
                </div>

                {/* Competitor Pricing */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-40" />
                    <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4">Competitor Pricing</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="font-mono text-[12px] text-gray-500">Avg. Market Price:</div>
                            <div className="font-mono text-[26px] font-extrabold text-shell-darkText leading-none mt-1">₹{Math.round(compAvg).toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="font-mono text-[12px] text-gray-500">Our Position:</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[17px] font-extrabold text-shell-darkText">{percentile}<sup className="text-[12px]">th</sup> Percentile</span>
                                <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />
                            </div>
                        </div>
                    </div>
                    <CompetitorSparkline />
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-[240px_1fr_230px] gap-3">

                {/* Margin & Revenue Simulator */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-40" />
                    <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4">Margin &amp; Revenue Simulator</h3>
                    <div className="mb-4">
                        <div className="font-mono text-[12px] text-gray-500 mb-1.5">
                            Adjust Price: <span className="font-bold text-shell-darkText">₹{Math.round(activePrice).toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min={Math.round(cur * 0.80)}
                            max={Math.round(cur * 1.40)}
                            step={10}
                            value={Math.round(activePrice)}
                            onChange={e => setSliderPrice(Number(e.target.value))}
                            className="w-full accent-shell-blue cursor-pointer"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[12px] text-gray-500">Projected Revenue:</span>
                            <span className="font-mono text-[12px] font-bold text-shell-darkText">₹{projRevenue}M</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[12px] text-gray-500">Expected Margin:</span>
                            <span className="font-mono text-[12px] font-bold text-shell-darkText">{projMargin}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[12px] text-gray-500">Demand Estimate:</span>
                            <span className="font-mono text-[12px] font-bold text-shell-darkText">{demandEst.toLocaleString()} Units</span>
                        </div>
                    </div>
                </div>

                {/* AI Insights + Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden flex flex-col gap-4">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-40" />
                    <div>
                        <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-3">AI Insights</h3>
                        <p className="font-mono text-[13px] text-gray-600 leading-relaxed">{insightsText}</p>
                    </div>
                    <div>
                        <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-3">Actions</h3>
                        <div className="flex flex-wrap gap-2">
                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-shell-blue text-white font-mono text-[11px] font-black uppercase tracking-widest rounded hover:bg-blue-800 transition-colors shadow-sm">
                                <ChevronRight className="w-3.5 h-3.5" /> Approve AI Price
                            </button>
                            <button className="px-4 py-2.5 bg-green-600 text-white font-mono text-[11px] font-black uppercase tracking-widest rounded hover:bg-green-700 transition-colors shadow-sm">
                                Run Simulation
                            </button>
                            <button className="px-4 py-2.5 bg-red-500 text-white font-mono text-[11px] font-black uppercase tracking-widest rounded hover:bg-red-600 transition-colors shadow-sm">
                                Override Price
                            </button>
                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-shell-darkText border border-gray-300 font-mono text-[11px] font-black uppercase tracking-widest rounded hover:bg-gray-50 transition-colors shadow-sm">
                                <FileText className="w-3.5 h-3.5" /> Export Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Risk Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-40" />
                    <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4">Risk Alerts</h3>
                    <div className="space-y-4">
                        {riskAlerts.map((alert, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="text-[17px] leading-none mt-0.5 shrink-0">{riskIcon(alert.level)}</span>
                                <div>
                                    <span className="font-mono text-[12px] font-extrabold text-shell-darkText uppercase">{alert.label} </span>
                                    <span className="font-mono text-[12px] text-gray-600">{alert.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MarketTerminal = ({ data }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-4 gap-4">
            {[
                { label: 'Signal Intensity', value: data?.opportunities_found ?? '0', sub: 'Detected Zones', color: 'text-shell-darkText' },
                { label: 'Delta Target', value: `+$${data?.best_opportunity?.estimated_pnl ?? '0.00'}`, sub: 'Max Alpha', color: 'text-green-600' },
                { label: 'Market Sentiment', value: data?.market_sentiment ?? 'BULLISH', sub: 'Neural Bias', color: data?.market_sentiment === 'bullish' ? 'text-green-600' : 'text-blue-600' },
                { label: 'Neural Precision', value: '98.4%', sub: 'Ensemble Score', color: 'text-shell-blue' }
            ].map((kpi, i) => (
                <div key={i} className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20" />
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">{kpi.label}</div>
                    <div className={`text-[31px] font-extrabold leading-none uppercase ${kpi.color}`}>{kpi.value}</div>
                    <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">{kpi.sub}</div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight">Live Arbitrage Scanner</h3>
                        <div className="font-mono text-[9.5px] text-gray-500 tracking-widest uppercase mt-1">Global Node Monitoring Pulse: Active</div>
                    </div>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest animate-pulse border border-green-200">Live</span>
                </div>
                <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-4 bg-gray-50 font-mono text-[9px] text-gray-400 uppercase tracking-widest">
                        <span>Strategy Node</span>
                        <span className="text-center">Entry</span>
                        <span className="text-center">Exit</span>
                        <span className="text-right">Est. Delta</span>
                    </div>
                    {data?.opportunities?.map((opp, i) => (
                        <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-5 hover:bg-gray-50 group items-center transition-colors">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-extrabold text-shell-darkText group-hover:text-shell-yellow transition-colors uppercase tracking-tight">{opp.type}</span>
                                <span className="font-mono text-[9px] text-gray-400 uppercase">Neural Router X-{i+1}</span>
                            </div>
                            <div className="text-center">
                                <span className="px-2.5 py-1 bg-gray-50 text-shell-darkText border border-gray-200 rounded font-mono text-[10px] uppercase font-bold">{opp.buy}</span>
                            </div>
                            <div className="text-center">
                                <span className="px-2.5 py-1 bg-gray-100 text-green-700 border border-green-200 rounded font-mono text-[10px] uppercase font-bold">{opp.sell}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[21px] font-extrabold text-green-600 font-mono tracking-tighter">+${opp.estimated_pnl}</span>
                            </div>
                        </div>
                    )) || <div className="p-12 text-center font-mono text-[10px] text-gray-400 uppercase tracking-widest">Scanning markets...</div>}
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20" />
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <Zap className="w-3 h-3 text-shell-yellow" /> Strategic Protocol
                        </h4>
                        <Layers className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="space-y-6 flex-1">
                        {data?.ai_recommendations?.map((rec, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-shell-blue mt-1.5 shrink-0" />
                                <p className="text-[12px] font-mono text-shell-darkText leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 w-full py-4 bg-shell-darkText text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-black transition-all flex items-center justify-center gap-2 border border-gray-800 shadow-lg">
                        Initiate Deployment <ArrowRight className="w-4 h-4 text-shell-blue" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const ChurnRiskCenter = ({ data }) => {
    const riskScore = data?.churn_risk_score ?? 0;
    const historyData = useMemo(() => generateTrendData(riskScore, 0.2), [riskScore]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20" />
                    <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mb-10">Risk Probability Index</span>
                    
                    <div className="relative w-56 h-56">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="112" cy="112" r="104" strokeWidth="8" stroke="#f1f5f9" fill="transparent" />
                            <circle 
                                cx="112" cy="112" r="104" 
                                strokeWidth="10" 
                                stroke={riskScore > 60 ? '#ef4444' : riskScore > 30 ? '#003a70' : '#22c55e'} 
                                fill="transparent" 
                                strokeDasharray={2 * Math.PI * 104}
                                strokeDashoffset={2 * Math.PI * 104 * (1 - riskScore / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[52px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">{riskScore}<span className="text-[20px]">%</span></span>
                            <div className={`mt-4 px-3 py-1 rounded border font-mono text-[9px] uppercase font-bold tracking-widest ${data?.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {data?.priority ?? 'NORMAL'} PRIORITY
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-8 w-full pt-8 border-t border-gray-100">
                        <div className="text-center border-r border-gray-100">
                            <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Risk Exposure</span>
                            <span className="text-[14px] font-extrabold text-shell-darkText uppercase tracking-tight">{data?.risk_level ?? 'DORMANT'}</span>
                        </div>
                        <div className="text-center">
                            <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Impact Level</span>
                            <span className="text-[14px] font-extrabold text-shell-blue uppercase tracking-tight">HIGH ALPHA</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20" />
                    <h4 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-4">Probability Evolution</h4>
                    <div className="h-[100px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <Area type="monotone" dataKey="value" stroke="#003a70" fill="#eff6ff" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20" />
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-[15px] font-extrabold text-shell-darkText uppercase tracking-tight">Strategic Retention Protocol</h3>
                        <div className="font-mono text-[9.5px] text-gray-400 tracking-widest uppercase mt-1">Neural Prediction V2.4</div>
                    </div>
                    <Users className="w-6 h-6 text-shell-blue" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                    <div className="space-y-8">
                        <div>
                            <h4 className="font-mono text-[10px] text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TrendingDown className="w-3.5 h-3.5" /> Core Churn Drivers
                            </h4>
                            <div className="space-y-3">
                                {data?.primary_drivers?.map((driver, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[12px] font-extrabold text-shell-darkText uppercase tracking-tight">{driver}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-mono text-[10px] text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-3.5 h-3.5" /> Behavioral Warnings
                            </h4>
                            <div className="space-y-3">
                                {data?.ai_insights?.warning_signs?.map((sign, i) => (
                                    <div key={i} className="p-3 bg-blue-50 border border-blue-100/50 rounded flex items-start gap-2">
                                        <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-tight leading-snug">{sign}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
                        <div>
                            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block mb-4">Ensemble Strategy</span>
                            <p className="text-[12px] font-mono text-shell-darkText leading-relaxed mb-8">
                                {data?.ai_insights?.retention_strategy ?? 'The agent is formulating a bespoke engagement path to optimize retention coefficients.'}
                            </p>
                            <div className="p-5 bg-white border border-gray-100 rounded shadow-sm">
                                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-2">Estimated Recovery ROI</div>
                                <div className="text-[18px] font-extrabold text-shell-darkText tracking-tight uppercase">{data?.ai_insights?.expected_impact ?? 'Analyzing...'}</div>
                            </div>
                        </div>
                        <button className="mt-8 w-full py-4 bg-shell-blue text-white text-[10px] font-black uppercase tracking-widest rounded shadow-md hover:bg-blue-800 transition-colors border border-blue-900">
                            Launch Engagement Protocol
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContractRiskVector = ({ data }) => {
    const radarData = [
        { subject: 'Legal Compliance', A: 85, B: 110, fullMark: 150 },
        { subject: 'Force Majeure', A: 65, B: 130, fullMark: 150 },
        { subject: 'Liabilities', A: 95, B: 130, fullMark: 150 },
        { subject: 'Counterparty', A: 75, B: 100, fullMark: 150 },
        { subject: 'Ops Risk', A: 90, B: 90, fullMark: 150 },
        { subject: 'Payment Terms', A: 85, B: 85, fullMark: 150 },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20" />
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-[15px] font-extrabold text-shell-darkText uppercase tracking-tight">Contract Risk Vector Map</h3>
                        <span className="font-mono text-[9.5px] text-gray-400 tracking-widest uppercase mt-1">Multi-Dimensional Legal Audit Protocol</span>
                    </div>
                    <Scale className="w-6 h-6 text-shell-blue" />
                </div>
                
                <div className="flex-1 min-h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold', fontFamily: 'monospace' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar name="Neuro AI" dataKey="A" stroke="#003a70" fill="#003a70" fillOpacity={0.4} />
                            <Radar name="Market Avg" dataKey="B" stroke="#94a3b8" fill="transparent" fillOpacity={0} strokeDasharray="4 4" />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                    <div className="text-center border-r border-gray-100">
                        <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-1">Risk Score</div>
                        <div className={`text-[24px] font-extrabold leading-none ${data?.risk_level === 'high' ? 'text-red-600' : 'text-green-600'}`}>{data?.risk_level === 'high' ? '84.2' : '12.4'}</div>
                    </div>
                    <div className="text-center border-r border-gray-100">
                        <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-1">Exposure</div>
                        <div className="text-[24px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">${((data?.estimated_value_at_risk_usd ?? 0) / 1000).toFixed(0)}K</div>
                    </div>
                    <div className="text-center">
                        <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-1">Leverage</div>
                        <div className="text-[24px] font-extrabold text-shell-blue leading-none">8.4<span className="text-[12px] font-normal text-gray-400">/10</span></div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-shell-blue" />
                        </div>
                        <div>
                            <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none bg-gray-50 px-2 py-0.5 rounded">{data?.contract_id ?? 'PENDING ANALYSIS'}</span>
                            <h3 className="text-[18px] font-extrabold text-shell-darkText uppercase tracking-tight mt-1">{data?.counterparty ?? 'Entity Identification...'}</h3>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h4 className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-3">Executive Summary</h4>
                            <p className="text-[12px] font-mono text-shell-darkText leading-relaxed border-l-2 border-shell-blue pl-4 py-1">
                                {data?.contract_summary ?? 'Extracting legal dynamics...'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-4">Critical Clause Audit</h4>
                            {data?.key_risks?.map((risk, i) => (
                                <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded hover:border-shell-blue transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-mono text-[10px] font-black uppercase text-shell-darkText tracking-widest">{risk?.clause}</span>
                                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-black border ${risk?.risk_score > 60 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>RISK: {risk?.risk_score}</span>
                                    </div>
                                    <p className="text-[11px] font-extrabold text-shell-darkText uppercase tracking-tight leading-snug">
                                        {risk?.recommendation}
                                    </p>
                                </div>
                            ))}
                        </div>
                         <div className="pt-6 border-t border-gray-100 mt-6">
                             <h4 className="font-mono text-[9.5px] text-gray-400 uppercase tracking-widest mb-2">Strategy Vector</h4>
                             <p className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight leading-snug">
                                 {data?.recommendation ?? 'Awaiting tactical generation...'}
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export function CommercialAgent() {
    const [activeAgent, setActiveAgent] = useState('pricing');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const agents = [
        { id: 'pricing', label: 'Pricing Hub', icon: Target },
        { id: 'arbitrage', label: 'Market Scanner', icon: Globe },
        { id: 'churn', label: 'Churn Predictor', icon: Users },
        { id: 'contract', label: 'Contract Audit', icon: ShieldCheck },
    ];

    const runAgent = async (agentKey) => {
        setLoading(true);
        setResult(null);
        
        let payload = {};
        if (agentKey === 'pricing') {
            payload = { commodity: "Brent Crude", market_data: { current_price: 1100, spot_price: 1100, volatility: 0.15 } };
        } else if (agentKey === 'arbitrage') {
            payload = { market_prices: { "Rotterdam": 85.50, "Singapore": 88.20, "Houston": 84.10 } };
        } else if (agentKey === 'churn') {
            payload = { customer_data: { customer_id: "CUST-892", segment: "B2B", years_customer: 5 } };
        } else {
            payload = { contract_id: "CTR-2026-X", counterparty: "Global Logistics", contract_text: "Standard LNG supply with net-30 terms and force majeure clause." };
        }

        if (agentKey === 'pricing' && crisisEventBus.getLast('CRISIS_SUPPLY_DELAYED')) {
            // Crisis Orchestrator Simulation Response
            setTimeout(() => {
                setResult({
                    current_price: 1100,
                    ai_recommended_price: 1310,
                    price_change_pct: 19.1,
                    revenue_impact_pct: 17.4,
                    margin_change_pct: 9.6,
                    demand_forecast_units: 12800,
                    ai_confidence_pct: 91,
                    competitor_avg_price: 1280,
                    our_percentile: 92,
                    projected_revenue_m: 16.8,
                    expected_margin_pct: 31.4,
                    demand_estimate_units: 12800,
                    why_reasons: ['Severe supply disruption detected', 'Logistics rerouting in progress', 'Scarcity premium applied'],
                    ai_insights_text: 'CRITICAL SUPPLY CONSTRAINT: Neural engine has intercepted a severed logistics route (Fire Damage) reducing global supply availability by 4.2%. Applying a severe scarcity premium.',
                    risk_alerts: [
                        { level: 'critical', label: 'Supply Route',  text: 'Severed – Fire Damage'    },
                        { level: 'critical', label: 'Allocation',    text: 'Scarcity Premium Active'    },
                        { level: 'warning',  label: 'Geopolitical',  text: 'Tension Escalation Risk'    },
                    ],
                    // legacy
                    technical_price_usd: 1100,
                    ai_adjusted_price_usd: 1310,
                    reasoning: 'CRITICAL SUPPLY CONSTRAINT: Neural engine has intercepted a severed logistics route.',
                    risk_factors: ['Severe Supply Disruption', 'Logistics Rerouting Delay', 'Geopolitical Tension'],
                });
                setLoading(false);
            }, 1500);
            return;
        }

        try {
            const res = await fetch(`${CONFIG.COMMERCIAL_AGENT}/api/${agentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`Agent Protocol Offline: ${res.status}`);
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ error: `Agent Protocol failed to respond: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runAgent(activeAgent);
    }, [activeAgent]);

    const handleAgentSwitch = (agentId) => {
        if (loading) return;
        setResult(null);
        setLoading(true);
        setActiveAgent(agentId);
    };

    const renderResults = () => {
        if (loading || !result) return (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500">
                <div className="relative mb-8 text-shell-blue">
                    <Activity className="w-12 h-12 animate-pulse" />
                    <div className="absolute -inset-4 border border-shell-blue rounded-full animate-ping opacity-20" />
                </div>
                <div className="text-center">
                    <h3 className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-shell-darkText mb-1">Neural Stream Active</h3>
                    <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Orchestrating {activeAgent} models...</p>
                </div>
            </div>
        );

        if (result.error) return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-12 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mb-6 border border-red-100">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-[15px] font-extrabold uppercase tracking-tight text-shell-darkText mb-2">Protocol Header Divergence</h2>
                <div className="font-mono text-[10px] text-red-600 uppercase tracking-widest">{result.error}</div>
                <button onClick={() => runAgent(activeAgent)} className="mt-8 px-6 py-2 bg-shell-darkText text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded hover:bg-black transition-colors">
                    Retry Agent Initialization
                </button>
            </div>
        );

        try {
            switch(activeAgent) {
                case 'pricing':   return <PricingIntelligence data={result} />;
                case 'arbitrage': return <MarketTerminal data={result} />;
                case 'churn':     return <ChurnRiskCenter data={result} />;
                case 'contract':  return <ContractRiskVector data={result} />;
                default:          return <div className="p-20 text-center font-mono text-[10px] tracking-widest uppercase text-gray-300">System Standby</div>;
            }
        } catch (e) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-20 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-6" />
                    <h3 className="text-[18px] font-extrabold uppercase text-shell-darkText">Interface Protocol Failure</h3>
                    <p className="font-mono text-[10px] text-red-500 uppercase tracking-widest mt-2 font-bold">Structural anomaly in {activeAgent} stream data.</p>
                </div>
            );
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col pt-0 px-1">
            {/* Agent Control Bar */}
            <div className="flex items-center gap-1 mb-2 border-b border-gray-200 shrink-0">
                {agents.map((agent) => (
                    <button
                        key={agent.id}
                        disabled={loading && activeAgent !== agent.id}
                        onClick={() => handleAgentSwitch(agent.id)}
                        className={`
                            group px-6 py-4 transition-all duration-300 border-b-2 
                            ${activeAgent === agent.id 
                                ? 'border-shell-blue text-shell-darkText' 
                                : 'border-transparent text-gray-400 hover:text-gray-700'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <agent.icon className={`w-4 h-4 ${activeAgent === agent.id ? 'text-shell-blue' : 'text-gray-300'}`} />
                            <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${activeAgent === agent.id ? '' : 'opacity-60'}`}>
                                {agent.label}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-12">
                {renderResults()}
            </div>
        </div>
    );
}
