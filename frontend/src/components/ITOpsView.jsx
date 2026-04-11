import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ServerCrash, Bug, ShoppingCart, Ticket, Search, Monitor, TrendingUp } from 'lucide-react';

const MOCK_ITOPS = {
    ticketsDeflected: 48,
    threatsNeutralized: 1450,
    appRationalization: 12,
    ticketChart: Array.from({ length: 12 }).map((_, i) => ({
        hour: `${i * 2}:00`,
        aiResolved: Math.floor(Math.random() * 40 + 60),
        manual: Math.floor(Math.random() * 20 + 10)
    }))
};

export function ITOpsView() {
    const [data, setData] = useState(MOCK_ITOPS);

    useEffect(() => {
        fetch('http://localhost:5000/api/itops')
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(MOCK_ITOPS));
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                        IT Operations & Cybersecurity
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Multi-cloud + on-prem + edge · Highest Maturity</div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-green-200">System Live</span>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">L1 Ticket Deflection</div>
                        <div className="text-[31px] font-extrabold text-green-700 leading-none">{data.ticketsDeflected}<span className="text-[15px] text-green-500 font-normal ml-1">%</span></div>
                        <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> AI Self-Service</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Threats Neutralized</div>
                        <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.threatsNeutralized.toLocaleString()}</div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">24h SIEM Cycle</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">App Rationalization</div>
                        <div className="text-[31px] font-extrabold text-green-600 leading-none">{data.appRationalization}<span className="text-[15px] font-normal ml-1">apps</span></div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">Legacy Decommissioning</div>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-[13px] font-extrabold text-shell-darkText mb-6 uppercase tracking-tight">Autonomous IT Resolution Trend</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.ticketChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        label={{ value: 'Time (24h)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        label={{ value: 'Tickets', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="aiResolved" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorAi)" />
                                    <Area type="monotone" dataKey="manual" stroke="#cbd5e1" strokeWidth={2} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-green-600" /> Active System Health
                        </h4>
                        <div className="space-y-4">
                            {[
                                { name: 'SAP ERP Cluster', region: 'Azure West Europe', status: 'Healthy' },
                                { name: 'Oracle DB Primary', region: 'Amsterdam DC', status: 'Healthy' },
                                { name: 'Neuro Shell Edge', region: 'Singapore Refinery', status: 'Latency Alert' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                                    <div>
                                        <div className="text-[11px] font-bold text-gray-700">{s.name}</div>
                                        <div className="text-[9px] text-gray-400 font-mono tracking-tighter">{s.region}</div>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${s.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                            <Ticket className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-shell-darkText">AI Agent Assist</div>
                            <div className="text-[10px] text-gray-400">GenAI drafting responses for 82% of incoming support tickets.</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-shell-darkText">SIEM Automation</div>
                            <div className="text-[10px] text-gray-400">Zero-day threat response time reduced to 14.2 seconds.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
