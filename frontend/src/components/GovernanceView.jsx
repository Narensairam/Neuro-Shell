import { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheck,
    Scale,
    AlertOctagon,
    FileCheck,
    Search,
    Filter,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Database,
    Factory,
    CircleDollarSign,
    ShieldAlert,
    Zap,
    Users,
    Activity,
    Globe
} from 'lucide-react';

const UNIFIED_API_URL = 'http://localhost:5007/api/unified';

// Fallback data if backend is unreachable
const ENTRPRISE_FALLBACK = {
    enterprise_score: 97.2,
    critical_risks: 1,
    active_audits: 14,
    domains: {
      neural_ai: {
        status: "Healthy",
        score: 96.4,
        regulations: ["EU AI Act", "NIST", "Ethics Board"],
        metrics: { "registered_models": 147, "bias_alerts": 2 }
      },
      industrial_qhse: {
        status: "Safe",
        score: 98.2,
        regulations: ["HSE PPE", "ISO 50001", "EU ETS"],
        metrics: { "sites_compliant": 51, "emissions_offsets": "92%" }
      },
      trade_financial: {
        status: "Review",
        score: 94.5,
        regulations: ["SOX 404", "Sanctions", "REMIT"],
        metrics: { "sanctions_cleared": "100%", "trading_anomalies": 3 }
      },
      system_cyber: {
        status: "Secure",
        score: 99.1,
        regulations: ["ISO 27001", "IEC 62443", "GDPR"],
        metrics: { "patches_verified": "100%", "access_reviews": 420 }
      }
    },
    audit_trail: [
       { id: "A-7741", time: "14:32", domain: "Neural AI", action: "Model retrained — Compressor Failure Predictor", regulation: "EU AI Act Art.9", status: "Success" },
       { id: "A-7740", time: "13:15", domain: "Trade & Finance", action: "Sanctions screening auto-refresh", regulation: "OFAC / REMIT", status: "Success" },
       { id: "A-7739", time: "12:45", domain: "Industrial", action: "PPE Violation detection — Pernis Zone 4", regulation: "HSE Protocol", status: "Alert" },
       { id: "A-7738", time: "11:20", domain: "Cyber", action: "Patch MS-2026-08 deployment verified", regulation: "ISO 27001", status: "Success" },
       { id: "A-7737", time: "09:12", domain: "Finance", action: "Quarterly SOX accessibility review", regulation: "SOX 404", status: "Partial" }
    ]
};

const MODEL_DATA_FALLBACK = [
    { model_name: 'Compressor Failure Predictor', risk_tier: 'Tier 2', version: '3.2.1', accuracy: '94%', last_audit: '2 days ago', status: 'Compliant' },
    { model_name: 'HR Screening Model', risk_tier: 'Tier 1', version: '1.8.3', accuracy: '88%', last_audit: 'Today', status: 'Under Review' },
    { model_name: 'Trading Arbitrage Detector', risk_tier: 'Tier 1', version: '2.4.0', accuracy: '91%', last_audit: '1 week ago', status: 'Compliant' },
    { model_name: 'IT Ticket Classifier', risk_tier: 'Tier 3', version: '4.1.0', accuracy: '89%', last_audit: '3 days ago', status: 'Compliant' },
];

export function GovernanceView() {
    const [activeTab, setActiveTab] = useState('summary');
    const [data, setData] = useState(ENTRPRISE_FALLBACK);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(UNIFIED_API_URL);
                if (res.ok) {
                    const json = await res.json();
                    if (json.governance_compliance) {
                        setData(json.governance_compliance);
                    }
                }
            } catch (e) {
                console.error('Governance sync failed, using fallbacks');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { id: 'summary', label: 'Enterprise Summary', icon: <Globe size={14} /> },
        { id: 'neural', label: 'Neural & AI', icon: <Zap size={14} /> },
        { id: 'industrial', label: 'Industrial & QHSE', icon: <Factory size={14} /> },
        { id: 'financial', label: 'Trade & Financial', icon: <CircleDollarSign size={14} /> },
        { id: 'cyber', label: 'System & Cyber', icon: <ShieldAlert size={14} /> },
        { id: 'compliance', label: 'Compliance Matrix', icon: <Scale size={14} /> }
    ];

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-shell-red rounded-full" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <Scale className="w-7 h-7 text-shell-red" />
                        Governance & Compliance
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Shell plc · Global Regulatory Tracking & Audit Intelligence</div>
                </div>
                <span className="px-3 py-1 bg-red-50 text-shell-red rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-red-100">Audit Status: Active</span>
            </header>

            <div className={`flex-1 px-1 flex flex-col ${activeTab === 'summary' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar pb-8'}`}>

            {/* TAB STRIP */}
            <div className="flex bg-gray-50 p-0.5 rounded-lg mb-4 w-fit border border-gray-200 shadow-sm shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-shell-darkText shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* GLOBAL KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
                <div className="bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-md transition-shadow">
                    <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1 flex justify-between">
                        Compliance Score <ShieldCheck className="text-green-500 w-3.5 h-3.5" />
                    </div>
                    <div className="text-[26px] font-black text-green-600 leading-none">{data.enterprise_score}%</div>
                    <div className="font-mono text-[8px] text-gray-400 mt-1 uppercase tracking-widest">Enterprise Avg</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-md transition-shadow">
                    <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1 flex justify-between">
                        Critical Risks <AlertOctagon className="text-red-500 w-3.5 h-3.5" />
                    </div>
                    <div className={`text-[26px] font-black leading-none ${data.critical_risks > 0 ? 'text-red-600' : 'text-shell-darkText'}`}>{data.critical_risks}</div>
                    <div className="font-mono text-[8px] text-red-400 mt-1 uppercase tracking-widest">Attention Req</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-md transition-shadow">
                    <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1 flex justify-between">
                        Active Audits <FileCheck className="text-blue-500 w-3.5 h-3.5" />
                    </div>
                    <div className="text-[26px] font-black text-blue-600 leading-none">{data.active_audits}</div>
                    <div className="font-mono text-[8px] text-gray-400 mt-1 uppercase tracking-widest">In Process</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-md transition-shadow">
                    <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1 flex justify-between">
                        Regulatory Delta <Activity className="text-shell-yellow w-3.5 h-3.5" />
                    </div>
                    <div className="text-[26px] font-black text-shell-darkText leading-none">+12.4%</div>
                    <div className="font-mono text-[8px] text-gray-400 mt-1 uppercase tracking-widest">YoY Progress</div>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-4 flex-1 h-0">
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500 items-stretch h-full overflow-hidden">
                        {/* LEFT HALF: 2x2 COMPLIANCE QUADRANT */}
                        <div className="grid grid-cols-2 gap-3 h-full overflow-hidden">
                            {Object.entries(data.domains).map(([key, domain]) => (
                                <div key={key} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-shell-yellow transition-all group shadow-sm flex flex-col justify-between">
                                    <div className="min-h-0 flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start mb-2 shrink-0">
                                            <h3 className="text-[12px] font-black text-shell-darkText uppercase tracking-tight">{key.replace('_', ' & ')}</h3>
                                            <div className="text-right">
                                                <div className="text-[22px] font-black text-shell-darkText leading-none">{domain.score}%</div>
                                                <div className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${domain.status === 'Healthy' || domain.status === 'Safe' || domain.status === 'Secure' ? 'text-green-500' : 'text-amber-500'}`}>{domain.status}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {domain.regulations.map(reg => (
                                                <span key={reg} className="text-[7.5px] font-mono font-black bg-gray-50 text-gray-400 px-1 border border-gray-100 uppercase tracking-tighter shrink-0">{reg}</span>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 shrink-0">
                                            {Object.entries(domain.metrics).map(([mKey, mVal]) => (
                                                <div key={mKey}>
                                                    <div className="text-[8.5px] font-mono text-gray-400 uppercase font-black tracking-widest leading-none mb-1">{mKey.replace('_', ' ')}</div>
                                                    <div className="text-[13px] font-black text-shell-darkText">{mVal}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT HALF: FULL-WIDTH INTELLIGENCE LOG */}
                        <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-[14px] font-black text-shell-darkText uppercase tracking-tight leading-none">Intelligence Log</h2>
                                    <p className="text-[8.5px] text-gray-400 font-bold mt-1 uppercase tracking-widest leading-none">Global Event Telemetry</p>
                                </div>
                                <Activity className="w-4 h-4 text-shell-red opacity-30" />
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                                {data.audit_trail.map((log) => (
                                    <div key={log.id} className="p-3 border border-gray-50 rounded-lg hover:bg-gray-50 transition-all group flex gap-3">
                                        <div className="w-10 text-center shrink-0 border-r border-gray-100 pr-3">
                                            <div className="text-[10px] font-black text-shell-darkText leading-none font-mono">{log.time}</div>
                                            <div className="text-[7.5px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Event</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <span className="text-[9px] font-black text-shell-red uppercase tracking-widest">{log.domain}</span>
                                                <span className={`px-1 rounded-[2px] text-[7.5px] font-black uppercase tracking-widest ${log.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {log.status === 'Success' ? 'Verified' : 'Alert'}
                                                </span>
                                            </div>
                                            <div className="text-[12px] font-black text-shell-darkText mb-0.5 truncate">{log.action}</div>
                                            <div className="text-[8.5px] text-gray-400 font-black uppercase tracking-tighter italic whitespace-nowrap overflow-hidden text-ellipsis">Reg: {log.regulation} · ID: {log.id}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-gray-50 border-t border-gray-100 shrink-0">
                                <button className="w-full py-2.5 bg-shell-darkText text-shell-yellow rounded-lg font-black text-[10px] uppercase tracking-widest hover:opacity-95 transition-all">Download Audit Pack</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'neural' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h2 className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">AI Model Compliance Registry</h2>
                                <button className="text-[9px] font-extrabold uppercase tracking-widest text-shell-red hover:underline decoration-2 underline-offset-4">Export Audit Log →</button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-5 py-3">Model Instance</th>
                                        <th className="px-5 py-3">Risk Tier</th>
                                        <th className="px-5 py-3 text-center">Accuracy</th>
                                        <th className="px-5 py-3">Last Audit</th>
                                        <th className="px-5 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {MODEL_DATA_FALLBACK.map((m, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-[12px] text-shell-darkText">{m.model_name}</div>
                                                <div className="text-[9px] font-mono text-gray-400 mt-1 uppercase tracking-tight">v{m.version} · AI-CORE-{1024 + i}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${m.risk_tier === 'Tier 1' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {m.risk_tier}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono text-[11px] font-bold text-shell-darkText">{m.accuracy}</td>
                                            <td className="px-5 py-4 text-[10px] text-gray-400 font-medium">{m.last_audit}</td>
                                            <td className="px-5 py-4 text-right">
                                                {m.status === 'Compliant' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-widest bg-green-50 text-green-700 border border-green-100">
                                                        Compliant
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
                                                        Under Review
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'industrial' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                             <h3 className="text-[12px] font-extrabold uppercase text-gray-500 mb-6 tracking-tight">QHSE Site Compliance</h3>
                             <div className="space-y-4">
                                {['Pernis Refinery', 'Bukom Island Hub', 'Singapore Chemical', 'Deer Park Facility'].map((site, i) => (
                                    <div key={i} className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-extrabold text-gray-400 text-[11px] uppercase tracking-tighter">{site[0]}{site[1]}</div>
                                            <div>
                                                <div className="text-[12px] font-bold text-shell-darkText">{site}</div>
                                                <div className="text-[9px] font-mono text-gray-400 mt-0.5 uppercase tracking-widest">ISO 50001 · EU ETS Verified</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                             <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: i === 1 ? '82%' : '100%' }}></div>
                                             </div>
                                             <span className="text-[10px] font-bold text-shell-darkText">{i === 1 ? '82%' : '100%'}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-5 border-t-2 border-t-red-500">
                             <h3 className="text-[12px] font-extrabold uppercase text-red-600 mb-4 tracking-tight flex items-center gap-2">
                                <ShieldAlert size={15} /> Technical Safety Audits
                             </h3>
                             <div className="space-y-3">
                                 <div className="p-3 bg-red-50/50 rounded-lg border-l-2 border-l-red-500 px-4">
                                     <div className="text-[11px] font-bold text-red-800 uppercase tracking-tight">PPE Compliance Variance</div>
                                     <p className="text-[11px] text-red-600 mt-1 leading-snug">Autonomous monitoring detected PPE deviation in Pernis Refinery Zone 4 (Distillation Unit). AI corrective action dispatched.</p>
                                     <div className="mt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">
                                         <span>ID: HSE-7742</span>
                                         <span>12m ago</span>
                                     </div>
                                 </div>
                                 <div className="p-3 bg-gray-50/50 rounded-lg border-l-2 border-l-gray-300 px-4 opacity-75">
                                     <div className="text-[11px] font-bold text-gray-800 uppercase tracking-tight">Vessel Inspection</div>
                                     <p className="text-[11px] text-gray-500 mt-1 leading-snug">Bukom Island Hub vessel PV-102 completed autonomous drone inspection. Compliance score: 100%.</p>
                                     <div className="mt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                         <span>ID: HSE-7738</span>
                                         <span>Yesterday</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">SOX 404 Controls</div>
                                <div className="text-[28px] font-extrabold text-shell-darkText leading-none">96.8%</div>
                                <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden"><div className="h-full bg-green-500 w-[96.8%]"></div></div>
                                <div className="text-[9px] text-gray-400 font-bold mt-2 font-mono uppercase tracking-tight">Target: 100% / Auto-Recon</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Sanctions Screening</div>
                                <div className="text-[28px] font-extrabold text-green-600 leading-none">CLEARED</div>
                                <div className="h-1 bg-green-500/20 rounded-full mt-4 overflow-hidden"><div className="h-full bg-green-500 w-full"></div></div>
                                <div className="text-[9px] text-gray-400 font-bold mt-2 font-mono uppercase tracking-tight">OFAC / EU / UN Scans: Pass</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Trading Anomalies</div>
                                <div className="text-[28px] font-extrabold text-amber-500 leading-none">{data.domains.trade_financial.metrics.trading_anomalies}</div>
                                <div className="h-1 bg-amber-500/20 rounded-full mt-4 overflow-hidden"><div className="h-full bg-amber-500 w-[40%]"></div></div>
                                <div className="text-[9px] text-gray-400 font-bold mt-2 font-mono uppercase tracking-tight">Under Active Investigation</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                             <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                 <h3 className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">REMIT Regulatory Submissions</h3>
                             </div>
                             <table className="w-full text-[12px] text-left">
                                 <thead className="text-[9px] uppercase font-bold text-gray-400 border-b border-gray-50 bg-white">
                                     <tr>
                                         <th className="px-5 py-3">Submission Type</th>
                                         <th className="px-5 py-3">Period</th>
                                         <th className="px-5 py-3">Status</th>
                                         <th className="px-5 py-3 text-right">Submission ID</th>
                                      </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {[
                                         { type: 'Quarterly Price Disclosure', period: 'Q1 2026', status: 'Submitted', id: 'RM-2026-001' },
                                         { type: 'Market Integrity Audit', period: 'Feb 2026', status: 'Pending Approval', id: 'RM-2026-042' },
                                         { type: 'Sanctions Clearance Log', period: 'Weekly', status: 'Submitted', id: 'RM-2026-992' }
                                     ].map((rep, i) => (
                                         <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                             <td className="px-5 py-4 font-bold text-shell-darkText">{rep.type}</td>
                                             <td className="px-5 py-4 font-mono text-gray-400 uppercase text-[10px]">{rep.period}</td>
                                             <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${rep.status.includes('Sub') ? 'text-green-600 bg-green-50 border-green-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>{rep.status}</span></td>
                                             <td className="px-5 py-4 text-right font-mono text-gray-400 text-[10px]">{rep.id}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                    </div>
                )}

                {activeTab === 'compliance' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1.5">SOX Auto-Recon</div>
                                <div className="text-[28px] font-extrabold text-amber-500 leading-none">64<span className="text-[14px] font-normal ml-0.5">%</span></div>
                                <div className="font-mono text-[9px] text-amber-600 mt-2 font-bold italic tracking-tight">⚠ Below Target (90%)</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1.5">GDPR Erasure SLAs</div>
                                <div className="text-[28px] font-extrabold text-green-600 leading-none">99.8<span className="text-[14px] font-normal ml-0.5">%</span></div>
                                <div className="font-mono text-[10px] text-gray-400 mt-2">Within 30-day window</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1.5">Penetration Tests</div>
                                <div className="text-[28px] font-extrabold text-shell-darkText leading-none">100<span className="text-[14px] font-normal ml-0.5">%</span></div>
                                <div className="font-mono text-[10px] text-gray-400 mt-2">Core Layer Verified</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="font-mono text-[9px] text-gray-500 tracking-widest uppercase mb-1.5">ISO 27001 Validation</div>
                                <div className="text-[28px] font-extrabold text-green-600 leading-none">Pass</div>
                                <div className="font-mono text-[10px] text-gray-400 mt-2">Renewed Q1 2026</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="font-extrabold text-[13px] uppercase text-shell-darkText tracking-tight mb-6 px-1">Global Regulatory Framework Progress</h2>
                            <div className="space-y-6 px-1">
                                {[
                                    { name: 'EU AI Act', progress: 65, status: 'Readiness' },
                                    { name: 'SEC Cyber Disclosures', progress: 100, status: 'Prepared' },
                                    { name: 'UK Data Protection', progress: 95, status: 'Scoped' }
                                ].map((reg, i) => (
                                    <div key={i} className="flex items-center gap-6 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="w-[140px] font-bold text-[12px] text-shell-darkText">{reg.name}</div>
                                        <div className="flex-1">
                                            <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                                <div className={`h-full ${reg.progress === 100 ? 'bg-green-500' : 'bg-shell-yellow'}`} style={{ width: `${reg.progress}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="w-[110px] text-right font-mono text-[10px] text-gray-400 uppercase tracking-widest font-bold">{reg.progress}% {reg.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'cyber' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                         <div className="bg-gray-900 rounded-lg p-8 shadow-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                              <ShieldCheck size={64} className="text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                              <h3 className="text-white text-[22px] font-extrabold uppercase tracking-tight">ISO 27001 Certified</h3>
                              <p className="text-gray-400 mt-2 text-[12px] max-w-xs leading-relaxed">Enterprise AI OS security architecture fully compliant with international info-sec standards.</p>
                              <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                        <div className="text-green-500 font-extrabold text-2xl">100%</div>
                                        <div className="text-gray-500 text-[9px] uppercase font-bold mt-1 tracking-widest">Patches Verified</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                        <div className="text-white font-extrabold text-2xl">SOC2</div>
                                        <div className="text-gray-500 text-[9px] uppercase font-bold mt-1 tracking-widest">Type II Compliant</div>
                                    </div>
                              </div>
                         </div>

                         <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
                             <h3 className="text-[12px] font-extrabold uppercase text-gray-500 mb-6 tracking-tight px-1">Infrastructure Access Audit</h3>
                             <div className="space-y-2 flex-1">
                                 {[
                                     { user: 'CE-Admin', action: 'Policy Update', site: 'Rotterdam Hub', status: 'Verified' },
                                     { user: 'Agent-APEX', action: 'Key Refresh', site: 'Neural Core', status: 'System' },
                                     { user: 'OP-Dash', action: 'Access Grant', site: 'Singapore Site', status: 'Pending' },
                                     { user: 'DS-Root', action: 'Root Revoke', site: 'Trading Node', status: 'Critical' }
                                 ].map((log, i) => (
                                     <div key={i} className="flex items-center justify-between p-3 border border-gray-50 rounded-lg hover:bg-gray-50/50 transition-all cursor-pointer group">
                                         <div className="flex items-center gap-3">
                                             <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`}></div>
                                             <div>
                                                 <div className="text-[11px] font-bold text-shell-darkText">{log.user} · {log.action}</div>
                                                 <div className="text-[9px] font-mono text-gray-400 uppercase mt-0.5 tracking-tighter">{log.site}</div>
                                             </div>
                                         </div>
                                         <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${log.status === 'Verified' || log.status === 'System' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{log.status}</span>
                                     </div>
                                 ))}
                             </div>
                             <div className="mt-6">
                                 <button className="w-full py-3 bg-shell-darkText text-shell-yellow rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity">Global Access Review</button>
                             </div>
                         </div>
                    </div>
                )}

                {/* UNIVERSAL AUDIT LOG (Only visible in drill-down tabs) */}
                {activeTab !== 'summary' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-8 px-1">
                            <div>
                                <h2 className="text-[16px] font-extrabold text-shell-darkText uppercase tracking-tight">Enterprise Audit Intelligence Log</h2>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-widest">Universal Telemetry Feed · ISO & Regulatory Events</p>
                            </div>
                            <div className="flex gap-2">
                                 <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] w-48 focus:outline-none focus:border-shell-red transition-all" />
                                 </div>
                                 <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"><Filter size={14} className="text-gray-500" /></button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {data.audit_trail.map((log) => (
                                <div key={log.id} className="flex items-center justify-between gap-4 p-3 border border-transparent hover:border-gray-100 hover:bg-gray-50/50 rounded-lg transition-all group">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-10 text-center">
                                            <div className="text-[11px] font-extrabold text-shell-darkText leading-none font-mono">{log.time}</div>
                                            <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Today</div>
                                        </div>
                                        <div className="w-px h-6 bg-gray-100"></div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-shell-red uppercase tracking-widest min-w-[90px]">{log.domain}</span>
                                                <span className="text-[12px] font-bold text-shell-darkText">{log.action}</span>
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-medium mt-0.5 uppercase tracking-widest">Reg: {log.regulation} · Log ID: {log.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                         <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${log.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                             {log.status === 'Success' ? 'Verified' : log.status}
                                         </span>
                                         <ArrowUpRight className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 border-2 border-dashed border-gray-100 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:border-shell-yellow hover:text-shell-darkText transition-all">Download Full Enterprise Compliance Report (PDF/JSON)</button>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
