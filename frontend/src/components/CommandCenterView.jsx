import { useEffect, useState } from 'react';
import { Factory, Ship, TrendingUp, CircleDollarSign, HardHat, ShieldCheck, Flame, Bell, Info, AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, BarChart3, Globe2, Activity, Zap, Cpu } from 'lucide-react';

export function CommandCenterView({ setCurrentView }) {
    const [fireAlert, setFireAlert] = useState(null);
    const [isNewAlert, setIsNewAlert] = useState(false);
    
    // FALLBACK DATA to ensure the Control Tower is never empty
    const [stats, setStats] = useState({ 
        revenue_annual: 282500, 
        unplanned_downtime_reduction: 22, 
        innovation_budget_freed: 84.5 
    });
    const [heatmap, setHeatmap] = useState([
        { id: "refining", label: "CDU Refining", health: 96, load: 82 },
        { id: "trading", label: "Arbitrage", health: 88, load: 94 },
        { id: "logistics", label: "LNG Logistics", health: 92, load: 75 },
        { id: "safety", label: "HSE Monitoring", health: 98, load: 40 },
        { id: "finance", label: "Group Close", health: 75, load: 90 },
        { id: "cyber", label: "Threat Scan", health: 95, load: 65 },
        { id: "hr", label: "Reskilling", health: 85, load: 30 },
        { id: "contracts", label: "AI Contracts", health: 90, load: 50 }
    ]);
    const [agents, setAgents] = useState([
        { id: "APEX", name: "APEX Master Brain", status: "Online", type: "Orchestrator", port: 5000, capabilities: [1,2,3] },
        { id: "GUARDIAN_EYE", name: "Guardian Eye", status: "Online", type: "Safety Agent", port: 5001, capabilities: [1,2,3] },
        { id: "COMMERCIAL_SAGE", name: "Commercial Sage", status: "Online", type: "Trading Agent", port: 5005, capabilities: [1,2,3] },
        { id: "WORKFORCE_ML", name: "Workforce Predictor", status: "Online", type: "HR Agent", port: 5003, capabilities: [1,2] },
        { id: "ITSM_DISPATCH", name: "ITOps Dispatcher", status: "Online", type: "Ops Agent", port: 5004, capabilities: [1,2] }
    ]);
    const [agentSummary, setAgentSummary] = useState({ 
        avg_latency: "142ms", 
        success_rate: "99.8%" 
    });

    useEffect(() => {
        const fetchUnified = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/unified');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.enterprise) {
                        if (data.enterprise.stats) setStats(data.enterprise.stats);
                        if (data.enterprise.process_heatmap) setHeatmap(data.enterprise.process_heatmap);
                        if (data.enterprise.agent_metrics) setAgentSummary(data.enterprise.agent_metrics);
                    }
                }
            } catch (err) { /* Fetch failed, UI remains stable with fallbacks */ }
        };
        
        const fetchAgents = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/kg/agents');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.nodes) setAgents(data.nodes);
                }
            } catch (err) { /* Fetch failed, UI remains stable with fallbacks */ }
        };

        fetchUnified();
        fetchAgents();

        let t;
        const NEURO_SHELL_ORIGIN = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';
        const fetchFire = async () => {
            try {
                const res = await fetch(`${NEURO_SHELL_ORIGIN}/api/fire/alerts`);
                if (res.ok) {
                    const data = await res.json();
                    const fire = data.find(a => a.type === 'FIRE');
                    if (fire) {
                        setFireAlert(prev => {
                            if (!prev) {
                                setIsNewAlert(true);
                                setTimeout(() => setIsNewAlert(false), 60000);
                            }
                            return fire;
                        });
                    } else {
                        setFireAlert(null);
                        setIsNewAlert(false);
                    }
                }
            } catch { setFireAlert(null); }
        };
        fetchFire();
        t = setInterval(() => {
            fetchFire();
            fetchUnified();
            fetchAgents();
        }, 5000);
        return () => clearInterval(t);
    }, []);

    const getHeatmapColor = (health) => {
        if (health >= 95) return 'bg-green-500';
        if (health >= 85) return 'bg-shell-yellow';
        return 'bg-red-500';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-8 pt-4">
            {/* STANDARD HEADER REVERTED */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[28px] font-black tracking-tight uppercase text-shell-darkText leading-none">Control Tower</h1>
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-[0.2em] uppercase mt-2">Shell plc · Enterprise AI Operating System · Real-time Intelligence Hub</div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-mono text-[10px] tracking-widest uppercase font-bold shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>System Optimized
                    </span>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div onClick={() => setCurrentView('models')} className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-1.5">AI Models in Production</div>
                    <div className="text-[31px] font-black text-shell-darkText leading-none">47<span className="text-[15px] text-gray-400 font-normal ml-1">live</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1 uppercase font-bold">↑ +12 / Wave 1 Deployment</div>
                    <div className="flex items-end gap-[2px] h-6 mt-3 opacity-30">
                        {[30, 45, 40, 60, 55, 70, 85, 100].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] ${i === 7 ? 'bg-green-500' : 'bg-gray-300'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div onClick={() => setCurrentView('manufacturing')}  className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-1.5">Unplanned Downtime ↓</div>
                    <div className="text-[31px] font-black text-shell-darkText leading-none">{stats?.unplanned_downtime_reduction || 22}<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1 uppercase font-bold">Target 35% · On Track</div>
                    <div className="flex items-end gap-[2px] h-6 mt-3 opacity-30">
                        {[20, 30, 42, 38, 55, 62, 70, 85].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] ${i === 7 ? 'bg-shell-yellow' : 'bg-gray-300'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div onClick={() => setCurrentView('finance')} className="bg-white border border-gray-100 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-1.5">Innovation OpEx Gains</div>
                    <div className="text-[31px] font-black text-shell-darkText leading-none">${stats?.innovation_budget_freed || 84}<span className="text-[15px] text-gray-400 font-normal ml-1">M</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1 uppercase font-bold">↑ +14% / Q1 Performance</div>
                    <div className="flex items-end gap-[2px] h-6 mt-3 opacity-30">
                        {[15, 25, 35, 40, 52, 58, 70, 82].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] ${i === 7 ? 'bg-shell-yellow' : 'bg-gray-300'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div onClick={() => setCurrentView('alerts')} className={`rounded-xl p-5 relative overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-md ${isNewAlert ? 'bg-red-600 border-red-500 animate-pulse' : 'bg-white border border-red-100'}`}>
                    <div className={`font-mono text-[10px] tracking-widest uppercase mb-1.5 ${isNewAlert ? 'text-white' : 'text-red-500'}`}>Active Tier 1 Alerts</div>
                    <div className={`text-[31px] font-black leading-none ${isNewAlert ? 'text-white' : 'text-shell-darkText'}`}>{fireAlert ? 4 : 3}<span className="text-[15px] opacity-40 ml-1">open</span></div>
                    <div className={`font-mono text-[10px] mt-1 flex items-center gap-1 font-bold ${isNewAlert ? 'text-white' : 'text-red-600'}`}>
                        {fireAlert ? <Flame size={14} className="animate-bounce" /> : <AlertTriangle size={14} />}
                        {fireAlert ? 'EMERGENCY FIRE · ' : 'HAZARD DETECTED'}
                    </div>
                </div>
            </div>

            {/* TRANSFORMATION ROADMAP */}
            <div className="flex relative mb-4 gap-1">
                {[
                    { wave: "Wave 0", title: "Discovery", period: "M 1-3", pct: 100, color: "bg-green-500" },
                    { wave: "Wave 1", title: "Foundation", period: "M 4-12", pct: 62, color: "bg-shell-yellow" },
                    { wave: "Wave 2", title: "Scale/Embed", period: "M 13-24", pct: 0, color: "bg-blue-400" },
                    { wave: "Wave 3", title: "Independence", period: "M 25-36", pct: 0, color: "bg-gray-200" }
                ].map((step, idx) => (
                    <div key={idx} className={`flex-1 p-3 border border-gray-100 rounded-lg ${step.pct === 100 ? 'bg-green-50/30' : step.pct > 0 ? 'bg-amber-50/30' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-1">
                             <span className="font-mono text-[9px] text-shell-mutedText uppercase font-bold tracking-widest">{step.wave}</span>
                             <span className="font-mono text-[9px] text-gray-400">{step.period}</span>
                        </div>
                        <div className="font-black text-[11px] text-shell-darkText uppercase truncate">{step.title}</div>
                        <div className="h-0.5 bg-gray-100 mt-2 rounded-full overflow-hidden">
                             <div className={`h-full ${step.color} transition-all duration-1000`} style={{ width: `${step.pct}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* METRICS & HEATMAP SECTION */}
            <div className="grid grid-cols-[1fr_360px] gap-4 mb-4">
                {/* AGENT PERFORMANCE METRICS */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="text-shell-yellow w-5 h-5" />
                            <h2 className="text-[15px] font-black text-shell-darkText uppercase tracking-tight">Agent Performance Analytics</h2>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <div className="text-[9px] font-mono text-shell-mutedText uppercase">Avg Latency</div>
                                <div className="text-[13px] font-black text-green-600">{agentSummary?.avg_latency || '142ms'}</div>
                            </div>
                            <div className="text-right border-l border-gray-100 pl-4">
                                <div className="text-[9px] font-mono text-shell-mutedText uppercase">Success Rate</div>
                                <div className="text-[13px] font-black text-green-600">{agentSummary?.success_rate || '99.8%'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 h-full">
                        {agents.map(agent => (
                            <div key={agent.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:bg-white hover:border-shell-yellow hover:shadow-sm transition-all cursor-pointer">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                                        <Zap size={12} className="text-gray-300" />
                                    </div>
                                    <div className="text-[11px] font-black text-shell-darkText leading-tight">{agent.name}</div>
                                    <div className="text-[9px] font-mono text-shell-mutedText uppercase mt-1 truncate">{agent.type}</div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-shell-mutedText">ID: {agent.port || 'Core'}</span>
                                        <span className="text-[10px] font-bold text-blue-600">Active</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PROCESS HEATMAP */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 bg-shell-yellow rounded flex items-center justify-center"><BarChart3 size={12} className="text-gray-900" /></div>
                             <h2 className="text-[14px] font-black text-white uppercase tracking-tight">Enterprise Process Heatmap</h2>
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">Real-time Intensity</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 flex-1">
                        {heatmap.map(process => (
                            <div key={process.id} className="group relative">
                                <div className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 cursor-pointer ${getHeatmapColor(process.health)}`}>
                                     <div className="text-white/20 font-black text-[20px] select-none">{process.health}</div>
                                </div>
                                {/* Hover Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-3 py-1.5 rounded-md text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20 uppercase tracking-tighter">
                                    {process.label} · Load {process.load}%
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                         <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-sm bg-green-500"></div>
                             <div className="w-2 h-2 rounded-sm bg-shell-yellow"></div>
                             <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                         </div>
                         <span className="text-[9px] font-mono text-gray-400 uppercase">Operational Health Index</span>
                    </div>
                </div>
            </div>

            {/* LOWER ALERT FEED */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-[14px] text-shell-darkText uppercase tracking-tight flex items-center gap-2"><Bell className="w-4 h-4 text-shell-yellow" /> Neural Incident Feed</h2>
                    <span onClick={() => setCurrentView('alerts')} className="font-mono text-[9px] text-shell-mutedText uppercase tracking-widest cursor-pointer hover:text-shell-yellow transition-colors underline underline-offset-4 font-bold">Comprehensive Logs →</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border-l-4 border-l-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <div>
                            <div className="text-[12px] font-bold text-shell-darkText">Industrial OT Disconnect</div>
                            <div className="text-[10px] text-shell-mutedText uppercase mt-0.5">Critical · 492,000 Tags Offline @ Site Rotterdam</div>
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border-l-4 border-l-shell-yellow">
                        <TrendingUp className="w-4 h-4 shrink-0 text-shell-yellow" />
                        <div>
                            <div className="text-[12px] font-bold text-shell-darkText">Arbitrage Yield Detected</div>
                            <div className="text-[10px] text-shell-mutedText uppercase mt-0.5">Opportunity · +$2.4M identified across Brent/WTI Spreads</div>
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border-l-4 border-l-green-500">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                        <div>
                            <div className="text-[12px] font-bold text-shell-darkText">Finance Hub Optimized</div>
                            <div className="text-[10px] text-shell-mutedText uppercase mt-0.5">Success · Auto-Reconciliation rate reached 96.8% globally</div>
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border-l-4 border-l-blue-500">
                        <Info className="w-4 h-4 shrink-0 text-blue-500" />
                        <div>
                            <div className="text-[12px] font-bold text-shell-darkText">Agent Mesh Expansion</div>
                            <div className="text-[10px] text-shell-mutedText uppercase mt-0.5">Info · 5 AI Agents synchronized with Unified Core</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
