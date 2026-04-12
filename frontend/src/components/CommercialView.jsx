import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info, Handshake, Scale, AlertTriangle, Globe, Activity } from 'lucide-react';
import { CommercialAgent } from './CommercialAgent';

const MOCK_COMMERCIAL = {
    pricingAlpha: 2.4,
    arbitrageDetected: 14.2,
    pricingChart: Array.from({ length: 12 }).map((_, i) => ({
        time: `${8 + i}:00`,
        forecast: 80 + Math.sin(i / 2) * 4,
        actual: 80 + Math.sin(i / 2) * 4 + (Math.random() - 0.5) * 1.5
    }))
};

export function CommercialView({ setCurrentView }) {
    const [data, setData] = useState(MOCK_COMMERCIAL);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetch('http://localhost:5000/api/commercial')
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(MOCK_COMMERCIAL));
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col pt-6 px-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight text-shell-darkText">
                        <TrendingUp className="w-7 h-7 text-shell-yellow" />
                        Commercial & Trading Intelligence
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Crude · Gas · LNG · Refined Products · Power · Carbon Credits</div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-shell-yellow animate-pulse"></div>Engineering Phase
                    </span>
                </div>
            </header>

            <div className="flex items-center gap-1 mb-6 border-b border-gray-200 px-1 shrink-0">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-4 transition-all duration-300 border-b-2 
                        ${activeTab === 'overview' 
                            ? 'border-shell-yellow text-shell-darkText' 
                            : 'border-transparent text-gray-400 hover:text-gray-700'}
                    `}
                >
                    <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${activeTab === 'overview' ? '' : 'opacity-60'}`}>
                        Market Overview
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('agent')}
                    className={`px-6 py-4 transition-all duration-300 border-b-2 
                        ${activeTab === 'agent' 
                            ? 'border-shell-yellow text-shell-darkText' 
                            : 'border-transparent text-gray-400 hover:text-gray-700'}
                    `}
                >
                    <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${activeTab === 'agent' ? '' : 'opacity-60'}`}>
                        Trading AI Agents
                    </span>
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Pricing Engine Alpha</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none">+{data.pricingAlpha}<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> TRADING SIGNAL ACTIVE
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Arbitrage Identified</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">{data.arbitrageDetected}<span className="text-[15px] text-gray-400 font-normal ml-1">M$</span></div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">GLOBAL MARKET ARBS / 24H CYCLE</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Hedge Ratio Efficiency</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">84.2<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">MITIGATION TARGET: 85.0%</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[15px] font-extrabold text-shell-darkText uppercase tracking-tight flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-shell-yellow" /> Pricing Forecast Accuracy
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-shell-yellow"></span><span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-widest">ACTUAL</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-200"></span><span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-widest">FORECAST</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.pricingChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="time"
                                            tick={{ fontSize: 9, fill: '#6b7280', fontFamily: 'monospace' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 9, fill: '#6b7280', fontFamily: 'monospace' }}
                                            axisLine={false}
                                            tickLine={false}
                                            domain={['dataMin - 5', 'dataMax + 5']}
                                        />
                                        <Tooltip 
                                            contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                                        />
                                        <Line type="monotone" dataKey="actual" stroke="#003a70" strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="forecast" stroke="#bfdbfe" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-blue to-transparent opacity-20"></div>
                            <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-shell-blue" /> Neural Market Exposure
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { desk: 'Refined Products', volume: '14.2M bbl', risk: 'Low' },
                                    { desk: 'Crude Hub', volume: '22.4M bbl', risk: 'Medium' },
                                    { desk: 'European Power', volume: '840 GWh', risk: 'High' },
                                ].map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-shell-yellow transition-colors">
                                        <div>
                                            <div className="text-[11px] font-bold text-shell-darkText uppercase tracking-tight">{d.desk}</div>
                                            <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">{d.volume}</div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${d.risk === 'Low' ? 'bg-green-100 text-green-700 border-green-200' : d.risk === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{d.risk}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-shell-darkText text-white rounded-lg p-6 flex items-center justify-between border border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-40"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Handshake className="w-6 h-6 text-shell-yellow" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest leading-none mb-1">Contract Compliance OS</div>
                                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Automatic extraction of 1,200+ term sheets active.</div>
                            </div>
                        </div>
                        <button onClick={() => setCurrentView('compliance')} className="px-6 py-2 bg-shell-yellow text-shell-darkText text-[10px] font-black uppercase tracking-widest rounded shadow-xl hover:bg-amber-400 transition-colors">
                            Access Module
                        </button>
                    </div>
                </div>
            ) : (
                <CommercialAgent />
            )}
        </div>
    );
}
