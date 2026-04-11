import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HeartPulse, ShieldAlert, CheckCircle2, Award, Clock, Banknote, ShieldCheck } from 'lucide-react';

const MOCK_HR = {
    incidentReduction: 42,
    reskillingEmployees: 4150,
    predictiveSafetyAlerts: 18,
    safetyChart: Array.from({ length: 12 }).map((_, i) => ({ month: `M${i + 1}`, incidents: Math.floor(15 - i * 0.8 + Math.random() * 3) }))
};

export function HRView() {
    const [data, setData] = useState(MOCK_HR);

    useEffect(() => {
        fetch('http://localhost:5000/api/hr')
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(MOCK_HR));
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <HeartPulse className="w-7 h-7 text-amber-600" />
                        HR & Safety Intelligence
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Workforce Planning · Predictive Health & Safety</div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-amber-200">Wave 1 Active</span>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Incident Rate Reduction</div>
                        <div className="text-[31px] font-extrabold text-green-600 leading-none">−{data.incidentReduction}<span className="text-[15px] text-green-400 font-normal ml-1">%</span></div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">Target: −30%</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Employees Reskilled</div>
                        <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.reskillingEmployees.toLocaleString()}</div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">AI OS Deployment Wave</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Predictive Safety Alerts</div>
                        <div className="text-[31px] font-extrabold text-amber-600 leading-none">{data.predictiveSafetyAlerts}</div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">Actionable Intelligence</div>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-[13px] font-extrabold text-shell-darkText mb-6 uppercase tracking-tight">Safety Incident Optimization Trend</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.safetyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        label={{ value: 'Month', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        domain={[0, 'auto']}
                                        label={{ value: 'Incidents', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="incidents" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-600" /> HSE Critical Alerts
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-md">
                                <ShieldCheck className="w-5 h-5 text-red-600 shrink-0" />
                                <div className="text-[11px] text-red-900 font-bold leading-snug">Heat stress risk detected at Jurong Island site (Station B)</div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-md">
                                <Award className="w-5 h-5 text-blue-600 shrink-0" />
                                <div className="text-[11px] text-blue-900 font-bold leading-snug">1,000,000 hours LTI-free achieved at Scotford Refinery</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-[11px] font-extrabold text-shell-darkText uppercase tracking-widest mb-4">Training Completion Rate</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Cyber Security Awareness', val: 97, color: 'bg-green-500' },
                                { label: 'Diversity & Inclusion', val: 82, color: 'bg-blue-500' },
                                { label: 'Data Privacy (GDPR)', val: 91, color: 'bg-green-500' },
                            ].map((t, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[11px] font-mono mb-1">
                                        <span className="text-gray-500">{t.label}</span>
                                        <span className="font-bold">{t.val}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1 rounded-full">
                                        <div className={`${t.color} h-1 rounded-full text-white text-[10px]`} style={{ width: `${t.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-center">
                        <div className="text-center">
                            <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <div className="text-[11px] font-black uppercase text-gray-400">Shift Handover OS</div>
                            <div className="text-[10px] text-gray-300">Live AI consolidation of shift logs active.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
