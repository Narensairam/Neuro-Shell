import { useEffect, useState } from 'react';
import { Factory, Ship, TrendingUp, TrendingDown, CircleDollarSign, HardHat, ShieldCheck, Flame, Bell, Info, AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, BarChart3, Globe2, Activity, Zap, Cpu, Layers, X, Target, Leaf, ShieldAlert, LineChart, Wind, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteOptimizationView } from './RouteOptimizationView';
import { HRWorkforceAgent } from './HRWorkforceAgent';

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

    // NEW: KPI Detail State
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [kpiIndex, setKpiIndex] = useState(0);
    const [itOpsData, setItOpsData] = useState([
        { device_id: 'PLC-GEN-01', anomaly: false, severity: 'Normal', threat_type: 'Safe Pattern' },
        { device_id: 'PLC-GEN-02', anomaly: false, severity: 'Normal', threat_type: 'Safe Pattern' }
    ]);
    const [infraData, setInfraData] = useState([
        { server_id: 'SRV-GEN-01', anomaly: false, failure_risk: 8, cpu_usage: 42, memory_usage: 55 }
    ]);
    const [summaryMetrics, setSummaryMetrics] = useState({
        ot_threats: 4,
        deflection_rate: 64.2,
        critical_alerts: 3
    });

    useEffect(() => {
        const fetchUnified = async () => {
            try {
                const res = await fetch('http://localhost:5007/api/dashboard');
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

        const fetchAgentMetrics = async () => {
            console.log('[Control Tower] Refreshing agent telemetry...');
            try {
                const [summaryRes, itOpsRes, infraRes] = await Promise.all([
                    fetch('http://localhost:5004/api/metrics/summary').catch(e => ({ ok: false, error: e })),
                    fetch('http://localhost:5004/api/operational/ot').catch(e => ({ ok: false, error: e })),
                    fetch('http://localhost:5004/api/operational/infra').catch(e => ({ ok: false, error: e }))
                ]);

                if (summaryRes.ok) {
                    const data = await summaryRes.json();
                    console.log('[Control Tower] Agent Summary:', data);
                    setStats(prev => ({
                        ...prev,
                        otThreats: data.ot_threats || prev.otThreats,
                        anomalies: data.critical_alerts || prev.anomalies
                    }));
                }

                if (itOpsRes.ok) {
                    const data = await itOpsRes.json();
                    console.log('[Control Tower] OT Security Loaded:', data.length);
                    setItOpsData(data.length > 0 ? data : [
                        { device_id: 'PLC-DXB-042', anomaly: true, severity: 'Critical', threat_type: 'Unrecognized Protocol Scan' },
                        { device_id: 'PLC-RTM-001', anomaly: false, severity: 'Normal', threat_type: 'Neural Sync Active' },
                        { device_id: 'PLC-SG-011', anomaly: false, severity: 'Normal', threat_type: 'Optimal State' }
                    ]);
                }
                
                if (infraRes.ok) {
                    const data = await infraRes.json();
                    console.log('[Control Tower] Infra Health Loaded:', data.length);
                    setInfraData(data.length > 0 ? data : [
                        { server_id: 'SRV-DXB-001', anomaly: false, failure_risk: 12, cpu_usage: 44.2, memory_usage: 62.1, network_latency: 12 },
                        { server_id: 'SRV-RTM-044', anomaly: true, failure_risk: 88, cpu_usage: 94.5, memory_usage: 88.2, network_latency: 310 },
                        { server_id: 'SRV-SG-092', anomaly: false, failure_risk: 5, cpu_usage: 22.0, memory_usage: 34.1, network_latency: 8 }
                    ]);
                }
            } catch (err) { 
                console.error('[Control Tower] Metrics fetch error:', err);
                setInfraData([
                    { server_id: 'SRV-FAILSAFE-01', anomaly: false, failure_risk: 10, cpu_usage: 45, memory_usage: 60, network_latency: 15 },
                    { server_id: 'SRV-FAILSAFE-02', anomaly: false, failure_risk: 15, cpu_usage: 50, memory_usage: 55, network_latency: 18 }
                ]);
            }
        };

        fetchUnified();
        fetchAgents();
        fetchAgentMetrics();

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
                                setTimeout(() => setIsNewAlert(false), 8000);
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
            fetchAgentMetrics();
        }, 5000);
        return () => clearInterval(t);
    }, []);

    const handleKpiClick = (id, index) => {
        setSelectedKpi(id);
        setKpiIndex(index);
    };

    const getHeatmapColor = (health) => {
        if (health >= 95) return 'bg-green-500';
        if (health >= 85) return 'bg-shell-yellow';
        return 'bg-red-500';
    };

    const KpiCard = ({ label, value, trend, icon: Icon, color, onClick }) => (
        <div onClick={onClick} className={`bg-white border ${color} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
                <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-[10px] font-mono text-gray-400 mt-1">{trend}</div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-6 pt-2 h-full overflow-y-auto pb-4">
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
            <div className="grid grid-cols-4 gap-4 mb-6">
                {/* 1. Overall Gains */}
                <div 
                    onClick={() => handleKpiClick('gains', 0)} 
                    className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">
                        Overall Gains <span className="text-[9px] opacity-60 font-black">ROI: 14.2%</span>
                    </div>
                    <div className="text-[28px] font-black text-shell-darkText leading-none">
                        ${stats?.innovation_budget_freed || 84}<span className="text-[14px] text-shell-mutedText font-normal ml-1">M</span>
                    </div>
                    <div className="font-mono text-[10px] text-green-600 mt-2 uppercase font-black">↑ Collective Savings</div>
                </div>

                {/* 2. CO2 Emission */}
                <div 
                    onClick={() => handleKpiClick('co2', 1)} 
                    className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all text-cyan-600"
                >
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">
                        CO2 Emission ↓ <span className="text-[9px] opacity-60 font-black font-mono">Net Zero Path</span>
                    </div>
                    <div className="text-[28px] font-black leading-none text-cyan-700">
                        12.4<span className="text-[14px] text-shell-mutedText font-normal ml-1">kT</span>
                    </div>
                    <div className="font-mono text-[10px] text-cyan-600 mt-2 uppercase font-black">↓ Optimization Results</div>
                </div>

                {/* 3. OT Threat Detection */}
                <div 
                    onClick={() => handleKpiClick('threats', 2)} 
                    className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">
                        OT Threats <span className="text-[9px] opacity-60 font-black">SOC Monitor</span>
                    </div>
                    <div className="text-[28px] font-black text-shell-darkText leading-none">
                        {stats.otThreats || 0}<span className="text-[14px] text-shell-mutedText font-normal ml-1">active</span>
                    </div>
                    <div className="font-mono text-[10px] text-red-600 mt-2 uppercase font-black">Shield Active</div>
                </div>

                {/* 4. Anomaly Detection */}
                <div 
                    onClick={() => handleKpiClick('anomalies', 3)} 
                    className="bg-white border border-gray-100 rounded-lg p-4 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                    <div className="font-mono text-[10px] text-shell-mutedText tracking-widest uppercase mb-2 flex justify-between font-bold">
                        Anomalies <span className="text-[9px] opacity-60 font-black font-mono">Predictive AI</span>
                    </div>
                    <div className="text-[28px] font-black text-shell-darkText leading-none">
                        {infraData.filter(i => i.anomaly).length || 2}<span className="text-[14px] text-shell-mutedText font-normal ml-1">risk</span>
                    </div>
                    <div className="font-mono text-[10px] text-amber-600 mt-2 uppercase font-black">Asset Monitoring</div>
                </div>
            </div>

            {/* MAIN DASHBOARD GRID — matches wireframe layout */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '3fr 2fr' }}>

                {/* ── LEFT COLUMN ── */}
                <div className="flex flex-col gap-4">

                    {/* Route Optimization Map (large) */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden" style={{ height: '420px' }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <Ship className="text-shell-blue w-4 h-4" />
                                <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Route Optimization Agent</h2>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-sm border border-green-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">AIS Live</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <RouteOptimizationView embedded={true} />
                        </div>
                    </div>

                    {/* Bottom row: Market Intelligence + Agent Topology */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Market Intelligence */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-shell-yellow" />
                                    <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Market Intelligence</h2>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-shell-yellow/10 rounded border border-shell-yellow/20">
                                    <span className="text-[9px] font-black text-shell-yellow uppercase">Live</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                {[
                                    { label: 'Brent Crude', val: '$82.41', trend: '↑ 1.2%', up: true },
                                    { label: 'Gas (TTF)', val: '€28.90', trend: '↓ 0.8%', up: false },
                                    { label: 'LNG (JKM)', val: '$10.04', trend: '↑ 0.4%', up: true },
                                    { label: 'Carbon (ETS)', val: '€54.12', trend: '→ 0.0%', up: null },
                                ].map((item, i) => (
                                    <div key={i} className="border-l-2 border-gray-200 pl-3">
                                        <div className="text-[9px] font-mono text-gray-500 uppercase leading-none mb-1 font-bold">{item.label}</div>
                                        <div className="text-[16px] font-black text-shell-darkText leading-none">
                                            {item.val}
                                            <span className={`text-[10px] ml-1.5 font-black ${item.up === true ? 'text-green-500' : item.up === false ? 'text-red-500' : 'text-gray-400'}`}>{item.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Telemetry */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-shell-blue" />
                                    <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">System Telemetry</h2>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-shell-blue/10 rounded border border-shell-blue/20">
                                    <span className="text-[9px] font-black text-shell-blue uppercase">Inference</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                {[
                                    { label: 'Cloud Load', val: '42.1%', trend: '↓ 5.4%', up: true },
                                    { label: 'Edge Nodes', val: '8,492', trend: '↑ 122', up: true },
                                    { label: 'Data Ingest', val: '1.2 PB', trend: '↑ 20TB', up: null },
                                    { label: 'Neural Sync', val: '0.4ms', trend: '→ 0.0', up: true },
                                ].map((item, i) => (
                                    <div key={i} className="border-l-2 border-gray-200 pl-3">
                                        <div className="text-[9px] font-mono text-gray-500 uppercase leading-none mb-1 font-bold">{item.label}</div>
                                        <div className="text-[16px] font-black text-shell-darkText leading-none">
                                            {item.val}
                                            <span className={`text-[10px] ml-1.5 font-black ${item.up === true ? 'text-green-500' : item.up === false ? 'text-red-500' : 'text-gray-400'}`}>{item.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Global Yield Analysis Chart */}
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col flex-1 min-h-[160px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <LineChart className="text-shell-blue w-4 h-4" />
                                <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Global Optimization Yield</h2>
                            </div>
                            <div className="text-[16px] font-black text-green-600 leading-none flex items-end gap-1">
                                +14.2% <span className="text-[9px] text-gray-400 font-mono mb-0.5 uppercase tracking-widest">vs prev 24h</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end gap-1.5 pt-2 relative">
                            {/* Subtle grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
                                <div className="border-t border-dashed border-gray-100 w-full h-0"></div>
                                <div className="border-t border-dashed border-gray-100 w-full h-0"></div>
                                <div className="border-t border-dashed border-gray-100 w-full h-0 mt-auto"></div>
                            </div>
                            
                            {/* CSS bar chart */}
                            {[40, 42, 38, 55, 62, 58, 70, 75, 68, 85, 88, 92, 90, 94, 89, 96, 95, 98].map((val, i) => (
                                <div key={i} className="flex-1 bg-gray-50 rounded-t relative group overflow-hidden" style={{ height: '100%' }}>
                                    <div className={`absolute bottom-0 w-full transition-all duration-1000 ${val > 88 ? 'bg-green-500' : val > 60 ? 'bg-shell-blue' : 'bg-shell-yellow'}`} style={{ height: `${val}%` }}></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                            <span>T-24H</span>
                            <span>T-18H</span>
                            <span>T-12H</span>
                            <span>T-6H</span>
                            <span className="text-shell-blue">LIVE</span>
                        </div>
                    </div>

                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="flex flex-col gap-4">

                    {/* Demand Planning Agent (Workforce AI) */}
                    <div className={`border rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0 transition-all duration-500 ${isNewAlert ? 'bg-red-50/30 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white border-gray-100'}`} style={{ height: '420px' }}>
                        <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${isNewAlert ? 'border-red-200 bg-red-100/50' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-2">
                                <Users className={`w-4 h-4 ${isNewAlert ? 'text-red-600 animate-pulse' : 'text-amber-500'}`} />
                                <h2 className={`text-[14px] font-black uppercase tracking-tight ${isNewAlert ? 'text-red-700' : 'text-shell-darkText'}`}>
                                    {isNewAlert ? 'EMERGENCY WORKFORCE DEMAND' : 'Workforce Management'}
                                </h2>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border ${isNewAlert ? 'bg-red-600 text-white border-red-700' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isNewAlert ? 'bg-white animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{isNewAlert ? 'CRITICAL RESPONSE' : 'Wave 1'}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <HRWorkforceAgent embedded={true} fireAlertActive={isNewAlert} />
                        </div>
                    </div>

                    {/* Alerts Feed */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden flex-1">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Alert Center Feed</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold border border-red-200 rounded font-mono text-[9px] tracking-widest uppercase">3 Critical</span>
                                <span onClick={() => setCurrentView('alerts')} className="font-mono text-[9px] text-blue-600 uppercase tracking-widest cursor-pointer hover:underline font-bold">View All</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {fireAlert && (
                                <div className={`flex gap-3 rounded-lg transition-all duration-300 ${isNewAlert ? 'p-3 border-2 border-red-600 bg-red-700 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'p-3 border-l-[3px] border-l-red-600 bg-red-50'}`}>
                                    <Flame className={`w-4 h-4 shrink-0 mt-0.5 ${isNewAlert ? 'text-white' : 'text-red-600'}`} />
                                    <div>
                                        <div className={`text-[12px] font-black uppercase tracking-tight leading-tight ${isNewAlert ? 'text-white' : 'text-red-700'}`}>CRITICAL: Live Fire Detected</div>
                                        <div className={`text-[10px] mt-0.5 ${isNewAlert ? 'text-white/80' : 'text-gray-600'}`}>Cam {fireAlert.camera_id} · {Math.round(fireAlert.confidence * 100)}% confidence · Suppression active</div>
                                        <div className={`font-mono text-[9px] mt-1 font-bold uppercase ${isNewAlert ? 'text-white/70' : 'text-red-600'}`}>HSE Emergency · Priority 1</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 p-3 rounded-lg border-l-[3px] border-l-red-500 bg-red-50/40">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                <div>
                                    <div className="text-[12px] font-black text-shell-darkText leading-tight">OT / IT Disconnect</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5 leading-snug">492K+ sensor tags offline. Predictive maintenance severely limited.</div>
                                    <div className="font-mono text-[9px] text-red-600 mt-1 font-bold uppercase">Critical · Owner: CTO</div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg border-l-[3px] border-l-red-500 bg-red-50/40">
                                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                <div>
                                    <div className="text-[12px] font-black text-shell-darkText leading-tight">AI Governance Gap</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5 leading-snug">153 AI projects with no lifecycle management. EU AI Act exposure.</div>
                                    <div className="font-mono text-[9px] text-red-600 mt-1 font-bold uppercase">Critical · Owner: CDO</div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg border-l-[3px] border-l-red-500 bg-red-50/40">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                <div>
                                    <div className="text-[12px] font-black text-shell-darkText leading-tight">Finance Close Cycle</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5 leading-snug">Month-end close averaging 9 days vs 5–7 day target. SOX audit risk.</div>
                                    <div className="font-mono text-[9px] text-red-600 mt-1 font-bold uppercase">Critical · Owner: CFO</div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg border-l-[3px] border-l-amber-400 bg-amber-50/40">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                                <div>
                                    <div className="text-[12px] font-black text-shell-darkText leading-tight">Interco Reconciliation Drift</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5 leading-snug">Model accuracy at 83.1%, below 87% threshold. Retraining queued.</div>
                                    <div className="font-mono text-[9px] text-amber-600 mt-1 font-bold uppercase">Warning · Owner: CoE</div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg border-l-[3px] border-l-amber-400 bg-amber-50/40">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                                <div>
                                    <div className="text-[12px] font-black text-shell-darkText leading-tight">ABAP Assessment Lag</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5 leading-snug">Only 31% of 500+ ABAP programs assessed. S/4HANA migration risk.</div>
                                    <div className="font-mono text-[9px] text-amber-600 mt-1 font-bold uppercase">Warning · Owner: CTO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI ADOPTION & METRICS ROW */}
            <div className="grid grid-cols-2 gap-4">
                 {/* 1. ENTERPRISE AI ADOPTION HEATMAP */}
                 <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col min-h-[260px]">
                     <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                             <Cpu className="text-blue-600 w-4 h-4" />
                             <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Enterprise AI Heatmap</h2>
                         </div>
                         <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold uppercase tracking-wider">Live Inference</div>
                     </div>
                     <div className="grid grid-cols-4 gap-2 flex-1 relative z-10">
                         {heatmap.map((item, i) => (
                             <div key={i} className={`p-3 rounded-lg border flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-default ${getHeatmapColor(item.health) === 'bg-green-500' ? 'bg-green-50 border-green-100' : getHeatmapColor(item.health) === 'bg-shell-yellow' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                                 <div className="text-[10px] font-black text-gray-800 uppercase tracking-tighter leading-[1.1] mb-2">{item.label}</div>
                                 <div className="flex items-end justify-between mt-auto">
                                     <div>
                                         <div className={`text-[16px] font-black leading-none ${getHeatmapColor(item.health) === 'bg-green-500' ? 'text-green-700' : getHeatmapColor(item.health) === 'bg-shell-yellow' ? 'text-amber-700' : 'text-red-700'}`}>{item.health}%</div>
                                         <div className="text-[8px] font-mono text-gray-500 uppercase font-bold tracking-widest mt-0.5">Health</div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-[12px] font-bold text-gray-600 leading-none">{item.load}%</div>
                                         <div className="text-[7px] font-mono text-gray-400 uppercase font-bold tracking-widest mt-0.5">Load</div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* 2. AI ADOPTION METRICS & AGENT STATUS */}
                 <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col min-h-[260px] relative overflow-hidden">
                     {/* decorative grid background */}
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                     
                     <div className="flex items-center justify-between mb-5 relative z-10">
                         <div className="flex items-center gap-2">
                             <Activity className="text-shell-blue w-4 h-4" />
                             <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight">Adoptive Agent Topology</h2>
                         </div>
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-sm border border-green-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest">Mesh Active</span>
                         </div>
                     </div>

                     <div className="flex gap-4 mb-4 border-b border-gray-100 pb-4 relative z-10 shrink-0">
                         <div className="flex-1">
                             <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1 font-bold">Network Latency</div>
                             <div className="text-[20px] font-black text-shell-darkText leading-none flex items-end gap-1">
                                {agentSummary?.avg_latency || '142ms'}
                                <span className="text-[10px] text-green-600 font-mono mb-0.5">optimal</span>
                             </div>
                         </div>
                         <div className="flex-1">
                             <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1 font-bold">Inference Success</div>
                             <div className="text-[20px] font-black text-green-600 leading-none">{agentSummary?.success_rate || '99.8%'}</div>
                         </div>
                         <div className="flex-1">
                             <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1 font-bold">Active Cores</div>
                             <div className="text-[20px] font-black text-shell-darkText leading-none">1,024</div>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar relative z-10">
                         {agents.map((agent, i) => (
                             <div key={i} className="flex items-center justify-between p-2.5 rounded bg-gray-50/50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setCurrentView('topology')}>
                                 <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${agent.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                     <div>
                                         <div className="text-[11px] font-bold text-shell-darkText tracking-tight">{agent.name}</div>
                                         <div className="text-[9px] font-mono text-shell-mutedText uppercase mt-0.5 tracking-tighter">Port: {agent.port} · {agent.capabilities?.length || 0} Skills</div>
                                     </div>
                                 </div>
                                 <div className="text-[9px] font-mono bg-white border border-gray-200 text-shell-mutedText px-2 py-1 rounded uppercase font-bold tracking-widest shadow-sm">
                                     {agent.type}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>


            </div>
            {/* KPI DETAIL POPOVER (ANCHORED RELATIVE TO CARDS) */}
            <AnimatePresence>
                {selectedKpi && (
                    <div className="fixed inset-0 z-[100] flex items-start pointer-events-none">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedKpi(null)}
                            className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] pointer-events-auto"
                        />
                        <motion.div 
                            initial={{ scale: 0.98, opacity: 0, y: -5 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: -5 }}
                            style={{ 
                                left: `calc(4.5% + (${kpiIndex} * 24.3%))`,
                                top: '180px'
                            }}
                            className="absolute w-[340px] bg-white border border-slate-200 rounded-lg overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.15)] z-10 pointer-events-auto"
                        >
                            {/* Pure Info Header */}
                            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        selectedKpi === 'gains' ? 'bg-yellow-500' : 
                                        selectedKpi === 'co2' ? 'bg-cyan-500' : 
                                        selectedKpi === 'threats' ? 'bg-red-500' : 'bg-amber-500'
                                    }`}></div>
                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em]">
                                        {selectedKpi === 'gains' && 'Gains Synthesis'}
                                        {selectedKpi === 'co2' && 'Carbon Telemetry'}
                                        {selectedKpi === 'threats' && 'OT Security Feed'}
                                        {selectedKpi === 'anomalies' && 'Predictive Intelligence'}
                                    </h3>
                                </div>
                                <button onClick={() => setSelectedKpi(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar">
                                {selectedKpi === 'gains' && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Finance Hub', val: '$24.2M', trend: '+2.1%' },
                                                { label: 'Supply Chain', val: '$18.5M', trend: '+4.5%' },
                                                { label: 'Manufacturing', val: '$32.8M', trend: '+6.0%' },
                                                { label: 'Trading Desk', val: '$9.0M', trend: '+1.2%' }
                                            ].map((item, i) => (
                                                <div key={i} className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                                    <div className="text-[8px] text-slate-500 uppercase font-black mb-1">{item.label}</div>
                                                    <div className="text-[14px] font-black text-slate-800 font-mono tracking-tighter">{item.val}</div>
                                                    <div className="text-[7px] text-green-600 font-mono font-bold mt-0.5">{item.trend} optimization</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-slate-900 p-3 rounded mt-2">
                                            <div className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-1.5">Total Aggregated Savings</div>
                                            <div className="text-[20px] font-black text-white font-mono tracking-tight">$84.51 <span className="text-[10px] text-yellow-400 font-normal">million USD</span></div>
                                            <div className="mt-2 text-white/30 text-[7px] font-mono leading-tight uppercase font-bold">Synchronized via APEX Neural Mesh Proxy</div>
                                        </div>
                                    </div>
                                )}

                                {selectedKpi === 'co2' && (
                                    <div className="space-y-4">
                                        <div className="bg-cyan-50/50 border border-cyan-100 p-3 rounded">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[8px] text-cyan-700 uppercase font-black tracking-widest">Sustainability Target</span>
                                                <span className="text-[10px] font-black text-cyan-800 font-mono">74.2%</span>
                                            </div>
                                            <div className="h-1.5 bg-cyan-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 w-[74%]"></div>
                                            </div>
                                            <div className="mt-2 text-[14px] font-black text-slate-800 font-mono leading-none">12.42 <span className="text-[9px] text-slate-500 font-normal">/ 16.7 kT</span></div>
                                        </div>

                                        <div className="space-y-1.5">
                                            {[
                                                { label: 'Maritime Route Vectoring', val: '4.2 kT', color: 'text-cyan-600' },
                                                { label: 'Advanced Thermal Recovery', val: '5.1 kT', color: 'text-amber-600' },
                                                { label: 'Hybrid Mesh Grid Mix', val: '3.1 kT', color: 'text-blue-600' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50/30 rounded border border-slate-100">
                                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                                                    <span className={`text-[12px] font-black font-mono ${item.color}`}>{item.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedKpi === 'threats' && (
                                    <div className="space-y-2">
                                        {(itOpsData.filter(t => t.anomaly).length > 0 ? itOpsData.filter(t => t.anomaly) : itOpsData.slice(0, 3)).map((threat, i) => (
                                            <div key={i} className={`border rounded p-2.5 transition-all ${threat.anomaly ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/30 border-slate-100'}`}>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <div className="text-[10px] font-black text-slate-800 font-mono tracking-tight uppercase">{threat.device_id}</div>
                                                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${threat.severity === 'Critical' ? 'bg-red-600 text-white' : (threat.anomaly ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500')}`}>
                                                        {threat.severity || (threat.anomaly ? 'Anomaly' : 'Safe')}
                                                    </span>
                                                </div>
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mb-2">{threat.threat_type || 'Monitored Channel'}</div>
                                                <div className="flex gap-1.5">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div key={i} className={`h-0.5 flex-1 rounded-full ${i < (threat.anomaly ? 4 : 1) ? (threat.anomaly ? 'bg-red-500' : 'bg-blue-400') : 'bg-slate-200'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {itOpsData.length === 0 && (
                                            <div className="py-10 text-center text-slate-300 uppercase font-black tracking-[0.2em] text-[10px]">
                                                Shield Status: Nominal
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedKpi === 'anomalies' && (
                                    <div className="space-y-2">
                                        {(infraData.filter(i => i.anomaly).length > 0 ? infraData.filter(i => i.anomaly) : infraData.slice(0, 3)).map((anom, i) => (
                                            <div key={i} className={`border rounded p-3 transition-all ${anom.anomaly ? 'bg-amber-50/30 border-amber-100' : 'bg-slate-50/30 border-slate-100'}`}>
                                                <div className="flex justify-between items-center mb-3 text-slate-800">
                                                    <span className="text-[10px] font-black font-mono uppercase truncate">{anom.server_id}</span>
                                                    <span className={`text-[10px] font-black font-mono ${anom.anomaly ? 'text-amber-600' : 'text-slate-400'}`}>
                                                        {anom.failure_risk?.toFixed(0) || anom.risk_score || 0}% RISK
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="p-2 border border-slate-100 rounded bg-white">
                                                        <div className="text-[7px] text-slate-400 uppercase font-black mb-0.5">Avg CPU</div>
                                                        <div className="text-[14px] font-black text-slate-800 font-mono">{anom.cpu_usage?.toFixed(1)}%</div>
                                                    </div>
                                                    <div className="p-2 border border-slate-100 rounded bg-white">
                                                        <div className="text-[7px] text-slate-400 uppercase font-black mb-0.5">Avg MEM</div>
                                                        <div className="text-[14px] font-black text-slate-800 font-mono">{anom.memory_usage?.toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-[8px] font-mono text-slate-400 uppercase font-bold tracking-widest text-right italic">
                                                    {anom.anomaly ? 'AI Est. MTBF: 4h 12m' : 'Status: Optimal'}
                                                </div>
                                            </div>
                                        ))}
                                        {infraData.length === 0 && (
                                            <div className="py-10 text-center text-slate-300 uppercase font-black tracking-[0.2em] text-[10px]">
                                                No Anomalies Detected
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
