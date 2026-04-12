import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Factory, ShieldAlert, TrendingUp, Settings, Wrench, CheckCircle, HeartPulse } from 'lucide-react';
import { FireDetectionView } from './FireDetectionView';

const EMPTY_DATA = {
    yieldOptimization: 0,
    unplannedDowntimeReduction: 0,
    activeSites: 0,
    alerts: [],
    chartData: []
};

export function ManufacturingView({ setCurrentView }) {
    const [data, setData] = useState(EMPTY_DATA);
    const [activeTab, setActiveTab] = useState('analytics');

    useEffect(() => {
        let isMounted = true;
        fetch('http://localhost:5000/api/manufacturing')
            .then(res => res.json())
            .then(resData => {
                if (isMounted) setData(resData);
            })
            .catch(() => {
                if (isMounted) setData(EMPTY_DATA);
            });
        return () => { isMounted = false; };
    }, []);


    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <Factory className="w-7 h-7 text-shell-red" />
                        Manufacturing & Plant Operations
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Yield optimization · Real-time OT Link · Wave 1 Target</div>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-white text-shell-darkText shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Operational Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('surveillance')}
                        className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'surveillance' ? 'bg-shell-red text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        AI Surveillance
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                {activeTab === 'analytics' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Yield Optimization</div>
                                <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.yieldOptimization}<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                                <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> AI tuned +1.2%</div>
                            </div>
                            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-5">
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Unplanned Downtime Drop</div>
                                <div className="text-[31px] font-extrabold text-green-600 leading-none">−{data.unplannedDowntimeReduction}<span className="text-[15px] text-green-400 font-normal ml-1">%</span></div>
                                <div className="font-mono text-[10px] text-gray-500 mt-1">Target: −35%</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Active Connected Sites</div>
                                <div className="text-[31px] font-extrabold text-shell-yellow leading-none">{data.activeSites}<span className="text-[15px] text-gray-400 font-normal ml-1">/50+</span></div>
                                <div className="font-mono text-[10px] text-gray-500 mt-1">OT-AI link active</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
                                <h2 className="font-extrabold text-[15px] text-shell-darkText mb-4">Live Yield Analytics</h2>
                                <div className="flex-1 min-h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs><linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dd1d21" stopOpacity={0.3} /><stop offset="95%" stopColor="#dd1d21" stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="time"
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickLine={{ stroke: '#e5e7eb' }}
                                                label={{ value: 'Time (24h)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickLine={{ stroke: '#e5e7eb' }}
                                                domain={['dataMin - 10', 'dataMax + 10']}
                                                label={{ value: 'Yield %', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
                                            />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="yield" stroke="#dd1d21" strokeWidth={2} fillOpacity={1} fill="url(#colorM)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h2 className="font-extrabold text-[13px] mb-3">AI Model Pipeline</h2>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Automated Scenario Scheduling', stat: 'Live', color: 'bg-green-500', pct: 85, c: 'text-green-700 bg-green-100' },
                                            { name: 'Downtime Reduction Insights', stat: 'Live', color: 'bg-green-500', pct: 78, c: 'text-green-700 bg-green-100' },
                                            { name: 'Predictive Catalyst Usage', stat: 'Training', color: 'bg-shell-yellow', pct: 45, c: 'text-amber-700 bg-amber-100' },
                                            { name: 'Condition Based Maintenance', stat: 'Pilot', color: 'bg-blue-400', pct: 28, c: 'text-blue-700 bg-blue-100' },
                                            { name: 'Unified Op Decision Support', stat: 'Active', color: 'bg-green-500', pct: 92, c: 'text-green-700 bg-green-100' }
                                        ].map((pr, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[11px] text-gray-500 font-medium">{pr.name}</span>
                                                    <span className={`px-2 py-[1px] rounded-full font-mono text-[8px] uppercase tracking-widest font-bold ${pr.c}`}>{pr.stat}</span>
                                                </div>
                                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${pr.color}`} style={{ width: `${pr.pct}%` }}></div></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-5 border-t-4 border-t-shell-red">
                                    <h2 className="font-extrabold text-[13px] mb-3 flex items-center gap-1.5 text-red-600">
                                        <ShieldAlert className="w-4 h-4" /> Priority Alerts
                                    </h2>
                                    <div className="space-y-2">
                                        {data.alerts.map((alert, i) => (
                                            <div key={i} className={`p-2.5 rounded-md border-l-2 ${alert.severity === 'high' ? "bg-red-50/50 border-red-500" : "bg-amber-50/50 border-amber-500"}`}>
                                                <div className="flex items-start gap-1.5">
                                                    <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${alert.severity === 'high' ? "text-red-500" : "text-amber-500"}`} />
                                                    <div>
                                                        <h4 className={`text-[11px] font-bold capitalize ${alert.severity === 'high' ? "text-red-700" : "text-amber-700"}`}>{alert.severity} Priority</h4>
                                                        <p className={`text-[11px] mt-0.5 leading-snug ${alert.severity === 'high' ? "text-red-600" : "text-amber-700"}`}>{alert.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md font-mono text-[9px] text-green-700 leading-snug">
                                            <CheckCircle className="w-4 h-4 inline-block align-text-bottom mr-1" /> AI Insight: Pump P-204 at Pernis showing bearing wear signature — 14-day maintenance window recommended.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ERP Business Processes */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
                            <h2 className="font-extrabold text-[15px] mb-4">ERP Core Processes (S/4HANA Status)</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div onClick={() => setCurrentView('erp')} className="p-4 border border-gray-100 rounded-md bg-gray-50/50 hover:border-amber-300 transition-colors cursor-pointer group flex items-center gap-4">
                                    <Settings className="w-8 h-8 group-hover:scale-110 transition-transform text-shell-darkText shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-[13px]">Plan to Produce (P2P)</div>
                                        <div className="font-mono text-[10px] text-gray-500">Production Planning (PP)</div>
                                        <div className="flex justify-between items-center mt-2"><span className="text-[11px] font-bold text-green-600">Live</span><span className="text-[11px] text-gray-400">85%</span></div>
                                        <div className="mt-1 h-1 bg-gray-200 rounded-full"><div className="h-full bg-green-500 w-[85%]"></div></div>
                                    </div>
                                </div>
                                <div onClick={() => setCurrentView('erp')} className="p-4 border border-gray-100 rounded-md bg-gray-50/50 hover:border-amber-300 transition-colors cursor-pointer group flex items-center gap-4">
                                    <Wrench className="w-8 h-8 group-hover:scale-110 transition-transform text-shell-darkText shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-[13px]">Enterprise Asset Mgmt (EAM)</div>
                                        <div className="font-mono text-[10px] text-gray-500">Plant Maintenance (PM)</div>
                                        <div className="flex justify-between items-center mt-2"><span className="text-[11px] font-bold text-green-600">Live</span><span className="text-[11px] text-gray-400">92%</span></div>
                                        <div className="mt-1 h-1 bg-gray-200 rounded-full"><div className="h-full bg-green-500 w-[92%]"></div></div>
                                    </div>
                                </div>
                                <div onClick={() => setCurrentView('erp')} className="p-4 border border-gray-100 rounded-md bg-gray-50/50 hover:border-amber-300 transition-colors cursor-pointer group flex items-center gap-4">
                                    <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform text-shell-darkText shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-[13px]">Quality Management (QM)</div>
                                        <div className="font-mono text-[10px] text-gray-500">Inspections · AI Defect</div>
                                        <div className="flex justify-between items-center mt-2"><span className="text-[11px] font-bold text-amber-600">Phased</span><span className="text-[11px] text-gray-400">60%</span></div>
                                        <div className="mt-1 h-1 bg-gray-200 rounded-full"><div className="h-full bg-shell-yellow w-[60%]"></div></div>
                                    </div>
                                </div>
                                <div onClick={() => setCurrentView('erp')} className="p-4 border border-gray-100 rounded-md bg-gray-50/50 hover:border-amber-300 transition-colors cursor-pointer group flex items-center gap-4">
                                    <HeartPulse className="w-8 h-8 group-hover:scale-110 transition-transform text-shell-darkText shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-[13px]">EHS Management</div>
                                        <div className="font-mono text-[10px] text-gray-500">Incidents · Environment</div>
                                        <div className="flex justify-between items-center mt-2"><span className="text-[11px] font-bold text-amber-600">Phased</span><span className="text-[11px] text-gray-400">45%</span></div>
                                        <div className="mt-1 h-1 bg-gray-200 rounded-full"><div className="h-full bg-amber-500 w-[45%]"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <FireDetectionView />
                    </div>
                )}
            </div>
        </div>
    );
}
