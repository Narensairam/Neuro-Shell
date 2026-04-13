import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    HeartPulse, ShieldAlert, CheckCircle2, Award, Clock, Banknote, 
    ShieldCheck, Search, Activity 
} from 'lucide-react';
import { HRWorkforceAgent } from './HRWorkforceAgent';

const EMPTY_HR = {
    incidentReduction: 0,
    reskillingEmployees: 0,
    predictiveSafetyAlerts: 0,
    safetyChart: []
};

export function HRView() {
    const [data, setData] = useState(EMPTY_HR);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/hr');
                if (res.ok && isMounted) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.warn("HR API link inactive.");
                if (isMounted) setData(EMPTY_HR);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const handleDemoTab = (e) => {
            if (e.detail?.view === 'hr' && e.detail?.tab) {
                setActiveTab(e.detail.tab);
            }
        };
        window.addEventListener('DEMO_GOTO_TAB', handleDemoTab);
        return () => window.removeEventListener('DEMO_GOTO_TAB', handleDemoTab);
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col pt-6 px-6">
            {/* Header section synchronized with Control Tower */}
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight text-shell-darkText uppercase">
                        <HeartPulse className="w-7 h-7 text-amber-600" />
                        HR & Safety Intelligence
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">
                        Workforce Planning · Predictive Health & Safety · Shell CoE
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>Wave 1 Active
                    </span>
                </div>
            </header>

            {/* Tab Navigation synchronized with AI Agents style */}
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
                        Intelligence Overview
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
                        Workforce AI Agent
                    </span>
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-10">
                    {/* KPI Cards section */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Incident Rate Reduction</div>
                            <div className="text-[31px] font-extrabold text-green-600 leading-none">
                                −{data.incidentReduction}<span className="text-[15px] text-green-400 font-normal ml-1">%</span>
                            </div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">TARGET: −30.0% PERFORMANCE</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Employees Reskilled</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">
                                {data.reskillingEmployees.toLocaleString()}
                            </div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">NEURO SHELL DEPLOYMENT WAVE</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Predictive Safety Alerts</div>
                            <div className="text-[31px] font-extrabold text-amber-600 leading-none">
                                {data.predictiveSafetyAlerts}
                            </div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">ACTIONABLE INTELLIGENCE STREAM</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 mb-4">
                        {/* Main Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <h3 className="text-[15px] font-extrabold text-shell-darkText mb-6 uppercase tracking-tight flex items-center gap-2">
                                <Search className="w-4 h-4 text-shell-yellow" /> Safety Incident Optimization Trend
                            </h3>
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
                                            tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                                        />
                                        <Area type="monotone" dataKey="incidents" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sidebar alert panel */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-red-500 to-transparent opacity-10"></div>
                            <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-600" /> HSE Critical Alerts
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-md hover:border-red-300 transition-colors">
                                    <ShieldCheck className="w-5 h-5 text-red-600 shrink-0" />
                                    <div className="text-[11px] text-red-900 font-bold leading-snug uppercase tracking-tight">Heat stress risk detected at Jurong Island site (Station B)</div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-md hover:border-blue-300 transition-colors">
                                    <Award className="w-5 h-5 text-blue-600 shrink-0" />
                                    <div className="text-[11px] text-blue-900 font-bold leading-snug uppercase tracking-tight">1.2M hours LTI-free achieved at Scotford Refinery</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Training list */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden group hover:border-shell-yellow transition-all">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <h4 className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-6 flex items-center justify-between">
                                Training Completion Indices <div className="h-px w-24 bg-gray-100"></div>
                            </h4>
                            <div className="space-y-5">
                                {[
                                    { label: 'Cyber Security Awareness', val: 97, color: 'bg-green-500' },
                                    { label: 'Diversity & Inclusion', val: 82, color: 'bg-shell-yellow' },
                                    { label: 'Data Privacy (GDPR)', val: 91, color: 'bg-green-500' },
                                ].map((t, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[11px] font-extrabold mb-1.5 uppercase tracking-tight text-shell-darkText">
                                            <span>{t.label}</span>
                                            <span className="font-mono text-gray-400">{t.val}%</span>
                                        </div>
                                        <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">
                                            <div className={`${t.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${t.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Handover card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-center relative overflow-hidden group hover:border-shell-yellow transition-all">
                             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                             <div className="text-center">
                                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-shell-yellow/10 transition-colors">
                                    <Clock className="w-6 h-6 text-gray-400 group-hover:text-shell-yellow transition-colors" />
                                </div>
                                <div className="text-[11px] font-extrabold uppercase text-shell-darkText tracking-widest">Shift Handover OS</div>
                                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-1">Live AI consolidation active</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <HRWorkforceAgent />
            )}
        </div>
    );
}
