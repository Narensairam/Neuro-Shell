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

const UNIFIED_API_URL = 'http://localhost:5000/api/unified';

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
        { id: 'cyber', label: 'System & Cyber', icon: <ShieldAlert size={14} /> }
    ];

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-shell-red rounded-full" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-y-auto pr-2 custom-scrollbar p-6">
            <header className="mb-8">
                <h1 className="text-[31px] font-black tracking-tight text-shell-darkText flex items-center gap-3">
                    <Scale className="w-8 h-8 text-shell-red" />
                    Governance and Compliance
                </h1>
                <p className="text-gray-500 font-medium text-[13px] mt-1 uppercase tracking-wider">Shell plc · Global Regulatory Tracking & Audit Intelligence</p>
            </header>

            {/* TAB STRIP */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-8 w-fit border border-gray-200 shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-shell-darkText shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* GLOBAL KPIs (Always Visible top of summary or domain summary) */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase font-bold">Total Compliance Score</div>
                        <ShieldCheck className="text-green-500 w-5 h-5" />
                    </div>
                    <div className="text-[35px] font-black text-green-600 leading-none">{data.enterprise_score}%</div>
                    <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">Enterprise Average</div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase font-bold">Critical Risks</div>
                        <AlertOctagon className="text-red-500 w-5 h-5" />
                    </div>
                    <div className={`text-[35px] font-black leading-none ${data.critical_risks > 0 ? 'text-red-600' : 'text-shell-darkText'}`}>{data.critical_risks}</div>
                    <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">Immediate Attention Req</div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase font-bold">Active Audits</div>
                        <FileCheck className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="text-[35px] font-black text-blue-600 leading-none">{data.active_audits}</div>
                    <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">Queue in Process</div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase font-bold">Regulatory Delta</div>
                        <Activity className="text-shell-yellow w-5 h-5" />
                    </div>
                    <div className="text-[35px] font-black text-shell-darkText leading-none">+12.4%</div>
                    <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">Year-on-Year Improvement</div>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-8 pb-12">
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-500">
                        {Object.entries(data.domains).map(([key, domain]) => (
                            <div key={key} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-shell-yellow transition-all group">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-[16px] font-black text-shell-darkText uppercase tracking-tight">{key.replace('_', ' & ')}</h3>
                                        <div className="flex gap-2 mt-1">
                                            {domain.regulations.map(reg => (
                                                <span key={reg} className="text-[8px] font-mono font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">{reg}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[25px] font-black text-shell-darkText">{domain.score}%</div>
                                        <div className={`text-[9px] font-black uppercase ${domain.status === 'Healthy' || domain.status === 'Safe' || domain.status === 'Secure' ? 'text-green-500' : 'text-amber-500'}`}>{domain.status}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    {Object.entries(domain.metrics).map(([mKey, mVal]) => (
                                        <div key={mKey}>
                                            <div className="text-[9px] font-mono text-gray-400 uppercase font-bold">{mKey.replace('_', ' ')}</div>
                                            <div className="text-[15px] font-black text-shell-darkText">{mVal}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'neural' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-[13px] font-black uppercase text-gray-600 tracking-wider">AI Model Compliance Registry</h2>
                                <button className="text-[10px] font-black uppercase tracking-widest text-shell-red hover:underline decoration-2 underline-offset-4">Export Audit Log →</button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Model Instance</th>
                                        <th className="px-6 py-4">Risk Tier</th>
                                        <th className="px-6 py-4">Accuracy</th>
                                        <th className="px-6 py-4">Last Audit</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {MODEL_DATA_FALLBACK.map((m, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[12px]">{m.model_name}</div>
                                                <div className="text-[9px] font-mono text-gray-400 mt-1 uppercase">v{m.version} · AI-CORE-{1024 + i}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${m.risk_tier === 'Tier 1' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {m.risk_tier} (HR)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[11px] font-bold text-shell-darkText">{m.accuracy}</td>
                                            <td className="px-6 py-4 text-[10px] text-gray-500 font-medium">{m.last_audit}</td>
                                            <td className="px-6 py-4 text-right">
                                                {m.status === 'Compliant' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200">
                                                        <CheckCircle2 size={10} /> Compliant
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock size={10} /> Under Review
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
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-500">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                             <h3 className="text-[13px] font-black uppercase text-gray-500 mb-6 tracking-wide">QHSE Site Compliance</h3>
                             <div className="space-y-6">
                                {['Pernis Refinery', 'Bukom Island Hub', 'Singapore Chemical', 'Deer Park Facility'].map((site, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400 text-[12px]">{site[0]}{site[1]}</div>
                                            <div>
                                                <div className="text-[12px] font-bold">{site}</div>
                                                <div className="text-[9px] font-mono text-gray-400 mt-1 uppercase">ISO 50001 · EU ETS Verified</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                             <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: i === 1 ? '82%' : '100%' }}></div>
                                             </div>
                                             <span className="text-[11px] font-black text-shell-darkText">{i === 1 ? '82%' : '100%'}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm border-t-4 border-t-red-500">
                             <h3 className="text-[13px] font-black uppercase text-red-600 mb-4 tracking-wide flex items-center gap-2">
                                <ShieldAlert size={16} /> Technical Safety Audits
                             </h3>
                             <div className="space-y-4">
                                 <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                     <div className="text-[11px] font-black text-red-800 uppercase">PPE Compliance Variance</div>
                                     <p className="text-[11px] text-red-600 mt-1">Autonomous monitoring detected PPE deviation in Pernis Refinery Zone 4 (Distillation Unit). AI-Led corrective action dispatched.</p>
                                     <div className="mt-3 flex justify-between items-center text-[9px] font-bold text-red-400 uppercase">
                                         <span>ID: HSE-7742</span>
                                         <span>12 minutes ago</span>
                                     </div>
                                 </div>
                                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="text-[11px] font-black text-gray-800 uppercase">Pressure Vessel Inspection</div>
                                     <p className="text-[11px] text-gray-500 mt-1">Bukom Island Hub vessel PV-102 completed autonomous drone inspection. Compliance score: 100%.</p>
                                     <div className="mt-3 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase">
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
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">SOX 404 Controls</div>
                                <div className="text-[28px] font-black text-shell-darkText">96.8%</div>
                                <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden"><div className="h-full bg-green-500 w-[96.8%]"></div></div>
                                <div className="text-[9px] text-gray-400 font-bold mt-2 font-mono uppercase">Target: 100% / Auto-Recon</div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Sanctions Screening</div>
                                <div className="text-[28px] font-black text-green-600">CLEARED</div>
                                <div className="h-1 bg-green-500 rounded-full mt-4"></div>
                                <div className="text-[9px] text-gray-400 font-bold mt-2 font-mono uppercase">OFAC / EU / UN Scans: Pass</div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Trading Anomalies</div>
                                <div className="text-[28px] font-black text-amber-500">{data.domains.trade_financial.metrics.trading_anomalies}</div>
                                <div className="h-1 bg-amber-500 rounded-full mt-4"></div>
                                <div className="text-[9px] text-gray-400 font-bold mt-2 font-mono uppercase">Under Active Investigation</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                             <h3 className="text-[13px] font-black uppercase text-gray-500 mb-6 tracking-wide">REMIT Regulatory Submissions</h3>
                             <table className="w-full text-[12px]">
                                 <thead className="text-[9px] uppercase font-black text-gray-400 border-b border-gray-50">
                                     <tr>
                                         <th className="py-3">Submission Type</th>
                                         <th className="py-3">Period</th>
                                         <th className="py-3">Status</th>
                                         <th className="py-3 text-right">Submission ID</th>
                                      </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-50">
                                     {[
                                         { type: 'Quarterly Price Disclosure', period: 'Q1 2026', status: 'Submitted', id: 'RM-2026-001' },
                                         { type: 'Market Integrity Audit', period: 'Feb 2026', status: 'Pending Approval', id: 'RM-2026-042' },
                                         { type: 'Sanctions Clearance Log', period: 'Weekly', status: 'Submitted', id: 'RM-2026-992' }
                                     ].map((rep, i) => (
                                         <tr key={i} className="hover:bg-gray-50/50 transition-colors font-medium">
                                             <td className="py-4">{rep.type}</td>
                                             <td className="py-4 font-mono text-gray-400 uppercase">{rep.period}</td>
                                             <td className="py-4"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${rep.status.includes('Sub') ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>{rep.status}</span></td>
                                             <td className="py-4 text-right font-mono text-gray-400">{rep.id}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                    </div>
                )}

                {activeTab === 'cyber' && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-500">
                         <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                              <ShieldCheck size={80} className="text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                              <h3 className="text-white text-[25px] font-black uppercase tracking-tight">ISO 27001 Certified</h3>
                              <p className="text-gray-400 mt-2 text-[13px] max-w-xs">Shell Enterprise AI OS security architecture fully compliant with international info-sec standards.</p>
                              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="text-green-500 font-black text-2xl">100%</div>
                                        <div className="text-gray-500 text-[9px] uppercase font-bold mt-1">Patches Verified</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="text-white font-black text-2xl">SOC2</div>
                                        <div className="text-gray-500 text-[9px] uppercase font-bold mt-1">Type II Compliant</div>
                                    </div>
                              </div>
                         </div>

                         <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
                             <h3 className="text-[13px] font-black uppercase text-gray-500 mb-6 tracking-wide">Infrastructure Access Audit</h3>
                             <div className="space-y-4">
                                 {[
                                     { user: 'CE-Admin', action: 'Global Policy Update', site: 'Rotterdam Hub', status: 'Verified' },
                                     { user: 'Agent-APEX', action: 'Key Refresh', site: 'Neural Core', status: 'System' },
                                     { user: 'OP-Dash', action: 'Access Grant', site: 'Singapore Site', status: 'Pending' },
                                     { user: 'DS-Root', action: 'API Key Revoke', site: 'Trading Node', status: 'Critical' }
                                 ].map((log, i) => (
                                     <div key={i} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                                         <div className="flex items-center gap-3">
                                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                             <div>
                                                 <div className="text-[12px] font-bold text-shell-darkText">{log.user} · {log.action}</div>
                                                 <div className="text-[9px] font-mono text-gray-400 uppercase mt-0.5">{log.site}</div>
                                             </div>
                                         </div>
                                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${log.status === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{log.status}</span>
                                     </div>
                                 ))}
                             </div>
                             <div className="mt-auto pt-6">
                                 <button className="w-full py-3 bg-shell-darkText text-shell-yellow rounded-xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity">Global Access Review</button>
                             </div>
                         </div>
                    </div>
                )}

                {/* UNIVERSAL AUDIT LOG (Always Footer) */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[18px] font-black text-shell-darkText uppercase tracking-tight">Enterprise Audit Intelligence Log</h2>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5 uppercase tracking-widest">Universal Telemetry Feed · ISO & Regulatory Events</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Filter audit trail..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] w-64 focus:outline-none focus:border-shell-red transition-all" />
                             </div>
                             <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"><Filter size={16} className="text-gray-500" /></button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {data.audit_trail.map((log) => (
                            <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border border-gray-50 rounded-2xl hover:border-shell-yellow transition-all group">
                                <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                                    <div className="w-12 text-center">
                                        <div className="text-[11px] font-black text-gray-700 leading-none">{log.time}</div>
                                        <div className="text-[8px] font-mono text-gray-400 mt-1 uppercase tracking-tighter">12 APR 26</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-shell-red uppercase tracking-widest">{log.domain}</span>
                                            <span className="text-gray-300">/</span>
                                             <span className="text-[13px] font-bold text-shell-darkText">{log.action}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-widest">Regulation: {log.regulation} · Log ID: {log.id}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                         {log.status === 'Success' ? <div className="flex items-center gap-1"><CheckCircle2 size={10} /> Verified</div> : <div className="flex items-center gap-1"><ShieldAlert size={10} /> {log.status}</div>}
                                     </span>
                                     <ArrowUpRight className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[11px] font-black text-gray-400 uppercase tracking-widest hover:border-shell-yellow hover:text-shell-darkText transition-all">Download Full Enterprise Compliance Report (PDF/JSON)</button>
                </div>
            </div>
        </div>
    );
}
