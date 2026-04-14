import { useEffect, useState, lazy, Suspense } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Ticket, Monitor, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { ITOpsAgent } from './ITOpsAgent';
import { ITSMHubView } from './itops/ITSMHubView';
import { OTThreatView } from './itops/OTThreatView';
import { PredictiveMonitoringView } from './itops/PredictiveMonitoringView';
import { ShadowITView } from './itops/ShadowITView';

const EMPTY_ITOPS = {
    ticketsDeflected: 0,
    threatsNeutralized: 0,
    appRationalization: 0,
    ticketChart: []
};

const TABS = [
    { id: 'overview',   label: 'AIOps Engine' },
    { id: 'itsm',       label: 'ITSM Hub' },
    { id: 'ot',         label: 'OT Threats' },
    { id: 'predictive', label: 'Predictive' },
    { id: 'shadow',     label: 'Shadow IT' },
];

export function ITOpsView({ setCurrentView }) {
    const [data, setData] = useState(EMPTY_ITOPS);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        let isMounted = true;
        fetch('http://localhost:5007/api/itops')
            .then(res => res.json())
            .then(d => { if (isMounted) setData(d); })
            .catch(() => { if (isMounted) setData(EMPTY_ITOPS); });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const handleDemoTab = (e) => {
            if (e.detail?.view === 'itops' && e.detail?.tab) {
                setActiveTab(e.detail.tab);
            }
        };
        window.addEventListener('DEMO_GOTO_TAB', handleDemoTab);
        return () => window.removeEventListener('DEMO_GOTO_TAB', handleDemoTab);
    }, []);

    if (!data) return null;

    // Full-screen sub-modules (hide header + tabs when active)
    const isFullModule = ['itsm', 'ot', 'predictive', 'shadow'].includes(activeTab);

    const renderTab = () => {
        switch (activeTab) {
            case 'itsm':       return <ITSMHubView />;
            case 'ot':         return <OTThreatView />;
            case 'predictive': return <PredictiveMonitoringView />;
            case 'shadow':     return <ShadowITView />;
            default:           return null;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col pt-6 px-6">
            {/* ── Header (always visible) ── */}
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight text-shell-darkText">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                        IT Operations & Cybersecurity
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Multi-cloud · Hybrid Infrastructure · Neural Governance Layer</div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>System Live
                    </span>
                </div>
            </header>

            {/* ── Tab Bar ── */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-200 px-1 shrink-0 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-4 whitespace-nowrap transition-all duration-300 border-b-2 
                            ${activeTab === tab.id
                                ? 'border-shell-yellow text-shell-darkText'
                                : 'border-transparent text-gray-400 hover:text-gray-700'}
                        `}
                    >
                        <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? '' : 'opacity-60'}`}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            {activeTab === 'overview' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">L1 Ticket Deflection</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.ticketsDeflected}<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> AI SELF-SERVICE ACTIVE
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Threats Neutralized</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.threatsNeutralized.toLocaleString()}</div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">24H SIEM DEPLOYMENT CYCLE</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">App Rationalization</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">{data.appRationalization}<span className="text-[15px] text-gray-400 font-normal ml-1">nodes</span></div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">LEGACY DECOMMISSIONING</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <h3 className="text-[15px] font-extrabold text-shell-darkText mb-6 uppercase tracking-tight flex items-center gap-2">
                                <Activity className="w-4 h-4 text-shell-yellow" /> Autonomous Resolution Trend
                            </h3>
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
                                        <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="aiResolved" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorAi)" />
                                        <Area type="monotone" dataKey="manual" stroke="#cbd5e1" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-shell-yellow" /> Critical Infrastructure Health
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { name: 'SAP ERP Cluster', region: 'Azure West Europe', status: 'Operational' },
                                    { name: 'Oracle DB Primary', region: 'Amsterdam DC', status: 'Operational' },
                                    { name: 'Neuro Shell Edge', region: 'Singapore Refinery', status: 'Latency Alert' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-shell-yellow transition-colors">
                                        <div>
                                            <div className="text-[11px] font-bold text-shell-darkText uppercase tracking-tight">{s.name}</div>
                                            <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">{s.region}</div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${s.status === 'Operational' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{s.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 relative overflow-hidden group hover:border-shell-yellow transition-all">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                <Ticket className="w-6 h-6 text-shell-yellow" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest text-shell-darkText">AI Agent Assist Protocol</div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Deflecting 42% of human interactions via GenAI.</div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 relative overflow-hidden group hover:border-shell-yellow transition-all">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-100 group-hover:bg-green-100 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest text-shell-darkText">SIEM Automation Engine</div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Zero-day response finalized in 14.2 seconds.</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    {renderTab()}
                </div>
            )}
        </div>
    );
}

