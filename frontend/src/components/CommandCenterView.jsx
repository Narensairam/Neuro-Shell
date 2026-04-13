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
                    console.log('[DEBUG] CommandCenter received unified data:', data);
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
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-6 pt-2 h-full overflow-y-auto pb-4">
            {/* STANDARD HEADER REVERTED */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-[24px] font-black tracking-tighter uppercase text-shell-darkText leading-none">Control Tower</h1>
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mt-1 opacity-70">Shell plc · Neural Operating System · Live Intelligence</div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded text-[10px] font-mono tracking-tighter uppercase font-black shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>System Optimized
                    </span>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <div onClick={() => setCurrentView('models')} className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">AI Models <span className="text-[9px] opacity-60 font-black">P99: 42ms</span></div>
                    <div className="text-[28px] font-black text-shell-darkText leading-none">47<span className="text-[14px] text-shell-mutedText font-normal ml-1">live</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-2 uppercase font-black">↑ +12 Node Deployment</div>
                </div>
                <div onClick={() => setCurrentView('manufacturing')}  className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">Downtime ↓ <span className="text-[9px] opacity-60 font-black">Loss: -14%</span></div>
                    <div className="text-[28px] font-black text-shell-darkText leading-none">{stats?.unplanned_downtime_reduction || 22}<span className="text-[14px] text-shell-mutedText font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-2 uppercase font-black">Target 35% · On Track</div>
                </div>
                <div onClick={() => setCurrentView('finance')} className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">OpEx Gains <span className="text-[9px] opacity-60 font-black">Yield: 8.2%</span></div>
                    <div className="text-[28px] font-black text-shell-darkText leading-none">${stats?.innovation_budget_freed || 84}<span className="text-[14px] text-shell-mutedText font-normal ml-1">M</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-2 uppercase font-black">↑ +14% Performance</div>
                </div>
                <div onClick={() => setCurrentView('alerts')} className={`rounded-lg p-4 relative overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-md ${isNewAlert ? 'bg-red-600 border-red-500 animate-pulse' : 'bg-white border border-red-100'}`}>
                    <div className={`font-mono text-[10px] tracking-widest uppercase mb-2 font-black ${isNewAlert ? 'text-white' : 'text-red-500'}`}>Tier 1 Alerts</div>
                    <div className={`text-[28px] font-black leading-none ${isNewAlert ? 'text-white' : 'text-shell-darkText'}`}>{fireAlert ? 4 : 3}<span className="text-[14px] opacity-40 ml-1">open</span></div>
                    <div className={`font-mono text-[10px] mt-2 flex items-center gap-1.5 font-black ${isNewAlert ? 'text-white' : 'text-red-600'}`}>
                        {fireAlert ? <Flame size={12} className="animate-bounce" /> : <AlertTriangle size={12} />}
                        {fireAlert ? 'FIRE DETECTED' : 'HAZARD DETECTED'}
                    </div>
                </div>
            </div>

            {/* TRANSFORMATION ROADMAP */}
            <div className="flex relative mb-4 gap-2">
                {[
                    { wave: "Wave 0", title: "Discovery", period: "M 1-3", pct: 100, color: "bg-green-500" },
                    { wave: "Wave 1", title: "Foundation", period: "M 4-12", pct: 62, color: "bg-shell-yellow" },
                    { wave: "Wave 2", title: "Scale/Embed", period: "M 13-24", pct: 0, color: "bg-blue-400" },
                    { wave: "Wave 3", title: "Independence", period: "M 25-36", pct: 0, color: "bg-gray-200" }
                ].map((step, idx) => (
                    <div key={idx} className={`flex-1 p-2 border border-gray-100 rounded-lg ${step.pct === 100 ? 'bg-green-50/20' : step.pct > 0 ? 'bg-amber-50/20' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-1">
                             <span className="font-mono text-[9px] text-shell-mutedText uppercase font-black tracking-widest">{step.wave}</span>
                             <span className="font-mono text-[9px] text-shell-mutedText font-bold">{step.period}</span>
                        </div>
                        <div className="font-black text-[12px] text-shell-darkText uppercase truncate">{step.title}</div>
                        <div className="h-1 bg-gray-100 mt-2 rounded-full overflow-hidden">
                             <div className={`h-full ${step.color} transition-all duration-1000`} style={{ width: `${step.pct}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TRIPARTITE INTELLIGENCE GRID */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* 1. EXECUTIVE ESG & SAFETY PORTAL (Business Knowledge) */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col group h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-red-600 w-4 h-4" />
                            <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">ESG & Safety Control</h2>
                        </div>
                        <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold uppercase tracking-wider">Group Compliance: Active</div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                        {/* A. SAFETY PERFORMANCE CARD */}
                        <div className="p-4 bg-red-50/30 border border-red-100 rounded group hover:bg-white hover:border-red-500 transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-black text-red-700 uppercase tracking-tight">Safety Performance</span>
                                <div className="text-[9px] font-mono text-gray-500 uppercase font-bold">Target: 0 Incidents</div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-[24px] font-black text-shell-darkText leading-none">8,420<span className="text-[12px] text-shell-mutedText font-normal ml-1">hrs</span></div>
                                    <div className="text-[10px] font-mono text-red-600 uppercase font-black mt-1">Incident-Free Operations</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[16px] font-black text-green-600">↑ 14%</div>
                                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter leading-none font-bold">vs Trend</div>
                                </div>
                            </div>
                        </div>

                        {/* B. SUSTAINABILITY & CARBON TRACKER */}
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded group hover:border-shell-yellow transition-all">
                             <div className="text-[11px] font-black text-shell-darkText uppercase tracking-tight mb-3">Sustainability Mix</div>
                             <div className="space-y-3">
                                 <div>
                                     <div className="flex justify-between items-center text-[10px] uppercase font-black mb-1.5">
                                         <span className="text-shell-mutedText">CO2 Offset Progress</span>
                                         <span className="text-shell-darkText">62.4%</span>
                                     </div>
                                     <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                         <div className="h-full bg-green-500 w-[62%]"></div>
                                     </div>
                                 </div>
                                 <div>
                                     <div className="flex justify-between items-center text-[10px] uppercase font-black mb-1.5">
                                         <span className="text-shell-mutedText">Renewable Mix %</span>
                                         <span className="text-shell-darkText">28.0%</span>
                                     </div>
                                     <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                         <div className="h-full bg-shell-yellow w-[28%]"></div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* C. WORKFORCE RESKILLING PORTAL */}
                        <div className="p-4 bg-blue-50/30 border border-blue-100 rounded group hover:bg-white hover:border-blue-500 transition-all">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-black text-blue-800 uppercase tracking-tight">Workforce Future-Skills</span>
                                <Zap className="w-3 h-3 text-blue-500" />
                             </div>
                             <div className="text-[22px] font-black text-shell-darkText leading-none">74<span className="text-[12px] text-shell-mutedText font-normal ml-1">% reskilling index</span></div>
                             <p className="text-[10px] text-blue-600 font-black uppercase mt-2">↑ +4.2% Growth / AI-Native Training</p>
                        </div>

                        {/* D. GLOBAL MARKET INTELLIGENCE (Enhanced Size) */}
                        <div className="p-4 bg-gray-900 border border-gray-800 rounded group hover:border-white transition-all">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-black text-shell-yellow uppercase tracking-widest">Global Market Intelligence</span>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-shell-yellow/10 rounded-sm border border-shell-yellow/20">
                                    <TrendingUp className="w-4 h-4 text-shell-yellow" />
                                    <span className="text-[9px] font-black text-shell-yellow uppercase">Live</span>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                 <div className="border-l-2 border-gray-800 pl-3">
                                     <div className="text-[10px] font-mono text-gray-500 uppercase leading-none mb-2 font-bold">Brent Crude</div>
                                     <div className="text-[20px] font-black text-white">$82.41<span className="text-[11px] text-green-500 ml-1.5 font-black">↑ 1.2%</span></div>
                                 </div>
                                 <div className="border-l-2 border-gray-800 pl-3">
                                     <div className="text-[10px] font-mono text-gray-500 uppercase leading-none mb-2 font-bold">Gas (TTF)</div>
                                     <div className="text-[20px] font-black text-white">€28.90<span className="text-[11px] text-red-500 ml-1.5 font-black">↓ 0.8%</span></div>
                                 </div>
                                 <div className="border-l-2 border-gray-800 pl-3">
                                     <div className="text-[10px] font-mono text-gray-500 uppercase leading-none mb-2 font-bold">LNG (JKM)</div>
                                     <div className="text-[20px] font-black text-white">$10.04<span className="text-[11px] text-green-500 ml-1.5 font-black">↑ 0.4%</span></div>
                                 </div>
                                 <div className="border-l-2 border-gray-800 pl-3">
                                     <div className="text-[10px] font-mono text-gray-500 uppercase leading-none mb-2 font-bold">Carbon (ETS)</div>
                                     <div className="text-[20px] font-black text-white">€54.12<span className="text-[11px] text-gray-400 ml-1.5 font-black">→ 0.0%</span></div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 2. STRATEGIC PORTFOLIO PULSE (Executive Insights) */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-shell-yellow rounded-lg flex items-center justify-center"><BarChart3 size={14} className="text-gray-900" /></div>
                             <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Strategic Portfolio Pulse</h2>
                        </div>
                        <span className="text-[9px] font-mono text-shell-mutedText uppercase font-bold tracking-widest">Enterprise Sync: T+0</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                        {/* 1. PRODUCTION & REFINING PILLAR */}
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg group hover:border-shell-yellow transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[11px] font-black text-shell-darkText uppercase tracking-tight">Production & Refining</div>
                                <span className="font-mono text-[9px] px-2 py-0.5 bg-green-50 text-green-700 rounded-sm font-bold uppercase">Optimal</span>
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="text-[18px] font-black text-shell-darkText">96.4%<span className="text-[10px] text-shell-mutedText ml-1 lowercase font-normal">thru-put</span></div>
                                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"><div className="h-full bg-green-500 w-[96%]"></div></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[14px] font-bold text-shell-darkText">$4.2M</div>
                                    <div className="text-[8px] font-mono text-gray-400 uppercase tracking-tighter">Opex Offset</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-shell-mutedText leading-relaxed border-l-2 border-shell-yellow pl-3">
                                <span className="font-bold text-shell-darkText">Neural Insight:</span> Predictive maintenance on CDU-4 successfully averted 14h of potential thermal downtime.
                            </p>
                        </div>

                        {/* 2. FINANCIAL OPS PILLAR (Moved Higher) */}
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg group hover:border-shell-yellow transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[11px] font-black text-shell-darkText uppercase tracking-tight">Financial Operations</div>
                                <span className="font-mono text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-sm font-bold uppercase">Closing</span>
                            </div>
                            <div className="flex items-center justify-between">
                                 <div>
                                    <div className="text-[16px] font-black text-shell-darkText">Day 2.4 / Cycle</div>
                                    <div className="text-[8px] font-mono text-gray-400 uppercase tracking-tighter leading-none mt-1">Group Reconciliation Status</div>
                                 </div>
                                 <div className="flex gap-1">
                                     {[...Array(5)].map((_, i) => (
                                         <div key={i} className={`w-2 h-4 rounded-sm ${i < 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                     ))}
                                 </div>
                            </div>
                        </div>

                        {/* 3. TRADING & ARBITRAGE PILLAR */}
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg group hover:border-shell-yellow transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[11px] font-black text-shell-darkText uppercase tracking-tight">Trading & Arbitrage</div>
                                <span className="font-mono text-[9px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm font-bold uppercase">Optimizing</span>
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="text-[18px] font-black text-shell-darkText">+8.2%<span className="text-[10px] text-shell-mutedText ml-1 lowercase font-normal">spread yield</span></div>
                                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"><div className="h-full bg-shell-yellow w-[82%]"></div></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[14px] font-bold text-shell-darkText">$12.8M</div>
                                    <div className="text-[8px] font-mono text-gray-400 uppercase tracking-tighter">Capture Value</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-shell-mutedText leading-relaxed border-l-2 border-shell-yellow pl-3">
                                <span className="font-bold text-shell-darkText">Neural Insight:</span> AI identified Brent/WTI spread anomaly; executed real-time diversion of 2 VLCC tankers.
                            </p>
                        </div>

                        {/* 4. LOGISTICS & SUPPLY PILLAR */}
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg group hover:border-shell-yellow transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[11px] font-black text-shell-darkText uppercase tracking-tight">Logistics & Supply</div>
                                <span className="font-mono text-[9px] px-2 py-0.5 bg-green-50 text-green-700 rounded-sm font-bold uppercase">Steady</span>
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="text-[18px] font-black text-shell-darkText">102<span className="text-[10px] text-shell-mutedText ml-1 lowercase font-normal">assets en route</span></div>
                                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"><div className="h-full bg-green-500 w-[88%]"></div></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[14px] font-bold text-shell-darkText">98%</div>
                                    <div className="text-[8px] font-mono text-gray-400 uppercase tracking-tighter">ETA Accuracy</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                         <div className="flex gap-1.5 grayscale opacity-30">
                             <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
                             <div className="w-2.5 h-2.5 rounded-sm bg-shell-yellow"></div>
                             <div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div>
                         </div>
                         <span className="text-[8px] font-mono text-shell-mutedText uppercase font-bold tracking-tighter italic">Neuro-Sync Phase III Integrated</span>
                    </div>
                </div>

                {/* 3. NEURAL INCIDENT FEED (Integrated & On-screen) */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-black text-[14px] text-shell-darkText uppercase tracking-tight flex items-center gap-2">
                            <Bell className="w-4 h-4 text-shell-yellow" /> Neural Feed
                        </h2>
                        <span onClick={() => setCurrentView('alerts')} className="font-mono text-[9px] text-blue-600 uppercase tracking-widest cursor-pointer hover:underline font-bold">ALL LOGS</span>
                    </div>
                    
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                        <div className="flex gap-4 p-4 rounded-lg bg-red-50/50 border-l-[3px] border-l-red-500">
                            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                            <div>
                                <div className="text-[13px] font-black text-shell-darkText leading-none">Industrial OT Disconnect</div>
                                <div className="text-[10px] text-shell-mutedText uppercase mt-1 tracking-tight font-black">Critical · Site Rotterdam</div>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-lg bg-amber-50/50 border-l-[3px] border-l-shell-yellow">
                            <TrendingUp className="w-5 h-5 shrink-0 text-shell-yellow" />
                            <div>
                                <div className="text-[13px] font-black text-shell-darkText leading-none">Market Volatility Detected</div>
                                <div className="text-[10px] text-shell-mutedText uppercase mt-1 tracking-tight font-black">Warning · Brent Spreads Spike</div>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-lg bg-green-50/50 border-l-[3px] border-l-green-500">
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
                            <div>
                                <div className="text-[13px] font-black text-shell-darkText leading-none">Finance Hub Sync</div>
                                <div className="text-[10px] text-shell-mutedText uppercase mt-1 tracking-tight font-black">Optimal · Reconciliation Complete</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg bg-blue-50/50 border-l-2 border-l-blue-500">
                            <Info className="w-4 h-4 shrink-0 text-blue-500" />
                            <div>
                                <div className="text-[11px] font-bold text-shell-darkText">Agent Mesh Expansion</div>
                                <div className="text-[9px] text-shell-mutedText uppercase mt-0.5 tracking-tight font-medium">Info · APEX Node Scaled</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border-l-2 border-l-gray-400 opacity-60">
                            <Activity className="w-4 h-4 shrink-0 text-gray-500" />
                            <div>
                                <div className="text-[11px] font-bold text-gray-500">Scheduled Model Re-train</div>
                                <div className="text-[9px] text-gray-400 uppercase mt-0.5 tracking-tight font-medium">System · 14.02.26 Routine</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                         <div className="bg-gray-900 rounded-lg p-4 text-center">
                             <div className="text-[10px] font-black text-shell-yellow uppercase tracking-[0.2em] mb-2">Total Threats Neutralized</div>
                             <div className="text-2xl font-black text-white">4,902</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
