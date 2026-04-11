import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info, Handshake, Scale, AlertTriangle, Globe } from 'lucide-react';

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

    useEffect(() => {
        fetch('http://localhost:5000/api/commercial')
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(MOCK_COMMERCIAL));
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <TrendingUp className="w-7 h-7 text-blue-500" />
                        Commercial & Trading Intelligence
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">6 commodity classes: Crude · Gas · LNG · Refined Products · Power · Carbon Credits</div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-blue-200">Building</span>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Pricing Engine Alpha</div>
                        <div className="text-[31px] font-extrabold text-blue-600 leading-none">+{data.pricingAlpha}<span className="text-[15px] text-blue-400 font-normal ml-1">%</span></div>
                        <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trading Signal</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Arbitrage Identified</div>
                        <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.arbitrageDetected}<span className="text-[15px] font-normal ml-1">M$</span></div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">Global Market Arbs / 24h</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Hedge Ratio Efficiency</div>
                        <div className="text-[31px] font-extrabold text-blue-500 leading-none">84.2<span className="text-[15px] font-normal ml-1">%</span></div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">Risk Mitigation Target: 85%</div>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight">Pricing Forecast Accuracy</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-[9px] font-bold text-gray-400">ACTUAL</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span><span className="text-[9px] font-bold text-gray-400">FORECAST</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.pricingChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        label={{ value: 'Market Time', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        domain={['dataMin - 5', 'dataMax + 5']}
                                        label={{ value: 'Index Price ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="forecast" stroke="#bfdbfe" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" /> Market Exposure
                        </h4>
                        <div className="space-y-4">
                            {[
                                { desk: 'Refined Products', volume: '14.2M bbl', risk: 'Low' },
                                { desk: 'Crude Hub', volume: '22.4M bbl', risk: 'Medium' },
                                { desk: 'European Power', volume: '840 GWh', risk: 'High' },
                            ].map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                                    <div>
                                        <div className="text-[11px] font-bold text-gray-700">{d.desk}</div>
                                        <div className="text-[9px] text-gray-400 font-mono tracking-tighter">{d.volume}</div>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${d.risk === 'Low' ? 'bg-green-100 text-green-700' : d.risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{d.risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-900 text-white rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                            <Handshake className="w-6 h-6 text-blue-200" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">Contract Compliance OS</div>
                            <div className="text-[10px] text-blue-300 font-medium">Automatic extraction of 1,200+ term sheets active.</div>
                        </div>
                    </div>
                    <button onClick={() => setCurrentView('compliance')} className="px-6 py-2 bg-white text-blue-900 text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-blue-50 transition-colors">
                        Access Module
                    </button>
                </div>
            </div>
        </div>
    );
}
