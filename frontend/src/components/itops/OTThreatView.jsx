import { useState, useEffect, useMemo } from 'react';
import {
 ShieldAlert, ShieldCheck, Cpu, Activity, Ticket, TrendingUp,
 ArrowUpRight, RefreshCw, AlertTriangle, History, Search,
 X, Zap, AlertCircle, Settings, ChevronRight, Bot, ExternalLink, Info
} from 'lucide-react';
import {
 PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const API = 'http://localhost:5004';

const fetchWithTimeout = async (url, options = {}) => {
  const timeout = options.timeout || 2000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetchWithTimeout(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const cn = (...cls) => cls.filter(Boolean).join(' ');

const IEC_MAPPING = {
 'Firmware Tampering': 'Access Control (SR 1)',
 'Unauthorized Access Attack': 'System Integrity (SR 3)',
 'Denial of Service (DoS)': 'Resource Availability (SR 7)',
 'Command Injection': 'Information Flow (SR 4)',
 'Normal': 'Standard Compliance',
};

// ─── Mock Data (used when backend is offline) ──────────────────────────────────
const MOCK_OT_THREATS = [
 { device_id: 'plc_001', threat_type: 'Unauthorized Access Attack', severity: 'Critical', packet_rate: 8421, failed_commands: 14, unauthorized_access_attempts: 9, command_type: 'WRITE', firmware_change_flag: 1, iec_category: 'System Integrity (SR 3)' },
 { device_id: 'plc_002', threat_type: 'Firmware Tampering', severity: 'Critical', packet_rate: 6740, failed_commands: 8, unauthorized_access_attempts: 3, command_type: 'CONFIG', firmware_change_flag: 1, iec_category: 'Access Control (SR 1)' },
 { device_id: 'plc_003', threat_type: 'Command Injection', severity: 'High', packet_rate: 3920, failed_commands: 5, unauthorized_access_attempts: 2, command_type: 'EXEC', firmware_change_flag: 0, iec_category: 'Information Flow (SR 4)' },
 { device_id: 'plc_017', threat_type: 'Denial of Service (DoS)', severity: 'High', packet_rate: 12500, failed_commands: 21, unauthorized_access_attempts: 0, command_type: 'FLOOD', firmware_change_flag: 0, iec_category: 'Resource Availability (SR 7)' },
 { device_id: 'plc_034', threat_type: 'Unauthorized Access Attack', severity: 'High', packet_rate: 4100, failed_commands: 6, unauthorized_access_attempts: 4, command_type: 'READ', firmware_change_flag: 0, iec_category: 'System Integrity (SR 3)' },
 { device_id: 'plc_058', threat_type: 'Command Injection', severity: 'Medium', packet_rate: 2200, failed_commands: 3, unauthorized_access_attempts: 1, command_type: 'EXEC', firmware_change_flag: 0, iec_category: 'Information Flow (SR 4)' },
];

const MOCK_SUMMARY = { total_tickets: 47, deflection_rate: 42.8, critical_alerts: 3, ot_threats: 6, shadow_devices: 18, avg_resolution_time_hrs: 4.2 };

// ─── KPI Cards ─────────────────────────────────────────────────────────────────
function OTKpiCards({ totalDevices, activeThreats, criticalAlerts, ticketsGenerated }) {
 const cards = [
 { label: 'Total PLC Devices', value: totalDevices, icon: Cpu, color: 'text-gray-900', bg: 'bg-gray-50', trend: '+2 added today' },
 { label: 'Active Threats', value: activeThreats, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', trend: '3 needs investigation', isWarning: activeThreats > 0 },
 { label: 'Critical Alerts', value: criticalAlerts, icon: Activity, color: 'text-red-600', bg: 'bg-red-100/50', trend: 'Immediate Action Required', isCritical: criticalAlerts > 0 },
 { label: 'Tickets Generated', value: ticketsGenerated, icon: Ticket, color: 'text-gray-900', bg: 'bg-gray-50', trend: '45% Auto-Deflected' },
 ];

 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {cards.map((card, idx) => (
 <div key={idx} className={cn('p-5 rounded-xl bg-white border shadow-sm relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-md', card.isCritical ? 'border-red-200 shadow-red-100/50' : 'border-gray-200')}>
 <div className={cn('absolute top-0 left-0 w-full h-1', card.isWarning || card.isCritical ? 'bg-red-500' : 'bg-shell-yellow')} />
 <div className="flex items-start justify-between mb-5">
 <div className={cn('p-3 rounded-xl', card.bg)}>
 <card.icon className={cn('w-5 h-5', card.color)} />
 </div>
 {(card.isWarning || card.isCritical) ? (
 <div className="px-2.5 py-1 rounded-full bg-red-100 border border-red-200 flex items-center gap-1.5 animate-pulse">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
 <span className="text-xs font-semibold text-red-600 ">High Risk</span>
 </div>
 ) : (
 <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-shell-yellow transition-colors" />
 )}
 </div>
 <div>
 <span className="text-xs font-semibold text-gray-400 block mb-1">{card.label}</span>
 <div className="flex items-end gap-2">
 <span className={cn('text-3xl font-semibold er ', card.color)}>{card.value}</span>
 <span className="text-xs font-bold text-gray-400 mb-1">Units</span>
 </div>
 </div>
 <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2">
 <TrendingUp className="w-3 h-3 text-gray-300" />
 <span className="text-xs font-bold text-gray-400 ">{card.trend}</span>
 </div>
 </div>
 ))}
 </div>
 );
}

// ─── Threat Table ──────────────────────────────────────────────────────────────
function OTThreatTable({ threats, onRowClick, selectedDeviceId }) {
 const [filter, setFilter] = useState('all');

 const processed = useMemo(() => threats.map(t => ({
 ...t,
 iec_category: IEC_MAPPING[t.threat_type] || 'Standard Monitoring',
 occurrences: Math.floor(Math.random() * 8) + 1,
 status: t.severity === 'Critical' ? 'Active' : (Math.random() > 0.5 ? 'Investigating' : 'Resolved'),
 })), [threats]);

 const filtered = processed.filter(t => {
 if (filter === 'critical') return t.severity === 'Critical';
 if (filter === 'high') return t.severity === 'High' || t.severity === 'Critical';
 return true;
 });

 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
 <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <h3 className="text-sm font-semibold text-gray-900 ">Live Threat Feed</h3>
 <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
 {['all', 'high', 'critical'].map(mode => (
 <button key={mode} onClick={() => setFilter(mode)}
 className={cn('px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
 filter === mode ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600')}>
 {mode}
 </button>
 ))}
 </div>
 </div>
 <div className="relative">
 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
 <input type="text" placeholder="Search node ID..." className="bg-gray-50/50 border border-gray-100 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-shell-yellow/20 w-52" />
 </div>
 </div>

 <div className="overflow-x-auto flex-1">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-gray-50/30">
 {['Asset ID', 'Vector', 'IEC 62443 Category', 'Severity', 'Freq.', 'Status'].map(h => (
 <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-400 border-b border-gray-50 ">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filtered.map((t, idx) => (
 <tr key={t.device_id + idx} onClick={() => onRowClick(t)}
 className={cn('group hover:bg-gray-50/80 cursor-pointer transition-colors',
 selectedDeviceId === t.device_id ? 'bg-gray-50 shadow-[inset_4px_0_0_0_#FFD500]' : '',
 t.severity === 'Critical' ? 'bg-red-50/30' : '')}>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <div className={cn('w-2 h-2 rounded-full shrink-0',
 t.severity === 'Critical' ? 'bg-red-500 animate-ping' : t.severity === 'High' ? 'bg-orange-500' : 'bg-emerald-500')} />
 <span className="text-xs font-semibold text-gray-900 ">{t.device_id}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-xs font-bold text-gray-700 er">{t.threat_type}</td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <ShieldCheck className="w-3 h-3 text-gray-300" />
 <span className="text-xs font-semibold text-gray-400 ">{t.iec_category}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold border',
 t.severity === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
 t.severity === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100')}>
 {t.severity}
 </span>
 </td>
 <td className="px-6 py-4 text-center">
 <span className="text-sm font-semibold text-gray-900 border border-gray-100 px-2 py-1 rounded-md bg-white shadow-sm">{t.occurrences}x</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <span className={cn('text-xs font-semibold ',
 t.status === 'Active' ? 'text-red-500' : t.status === 'Investigating' ? 'text-orange-400' : 'text-emerald-500')}>
 {t.status}
 </span>
 <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-400 ">
 <div className="flex gap-6">
 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical Threats Active</span>
 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-200" /> Total Scanned Assets: 100+</span>
 </div>
 <span>Sync Interval: 15s · IEC 62443 Compliance: 94.2%</span>
 </div>
 </div>
 );
}

// ─── OT Risk Visuals ───────────────────────────────────────────────────────────
function OTRiskVisuals({ threats }) {
 const [heatmap, setHeatmap] = useState([]);

 const chartData = useMemo(() => {
 const counts = {};
 (threats || []).forEach(t => { if (t?.threat_type) counts[t.threat_type] = (counts[t.threat_type] || 0) + 1; });
 return Object.entries(counts).map(([name, value]) => ({ name, value }));
 }, [threats]);

 useEffect(() => {
 setHeatmap(Array.from({ length: 48 }, (_, i) => {
 const r = Math.random();
 return { id: `PLC-${100 + i}`, risk: r > 0.8 ? 'High' : r > 0.5 ? 'Medium' : 'Low' };
 }));
 }, []);

 const COLORS = ['#e60000', '#ffcc00', '#0f172a', '#3b82f6'];

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
 <div className="flex items-center justify-between mb-5">
 <div>
 <h3 className="text-sm font-semibold text-gray-900 ">Threat Distribution</h3>
 <p className="text-xs font-bold text-gray-400 mt-1">AI Classification Profile</p>
 </div>
 <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
 <Info className="w-3.5 h-3.5 text-gray-300" />
 </div>
 </div>
 <div className="flex-1 min-h-[200px]">
 {chartData.length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
 {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
 </Pie>
 <Tooltip />
 <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: '' }} />
 </PieChart>
 </ResponsiveContainer>
 ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">No Threat Data</div>}
 </div>
 </div>

 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
 <div className="flex items-center justify-between mb-5">
 <h3 className="text-sm font-semibold text-gray-900 ">Fleet Heatmap</h3>
 <span className="text-xs font-semibold text-gray-400 ">{threats.length} Threats · {heatmap.length} Nodes</span>
 </div>
 <div className="grid grid-cols-8 gap-1.5">
 {heatmap.map(a => (
 <div key={a.id} title={`${a.id}: ${a.risk}`}
 className={cn('aspect-square rounded cursor-pointer transition hover:scale-110',
 a.risk === 'High' ? 'bg-red-500' : a.risk === 'Medium' ? 'bg-shell-yellow' : 'bg-emerald-500')} />
 ))}
 </div>
 <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
 {[['bg-red-500', 'High'], ['bg-shell-yellow', 'Medium'], ['bg-emerald-500', 'Low']].map(([bg, label]) => (
 <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 ">
 <div className={cn('w-2 h-2 rounded-sm', bg)} /> {label}
 </span>
 ))}
 </div>
 </div>
 </div>
 );
}

// ─── OT Detail Drawer ──────────────────────────────────────────────────────────
function OTDetailDrawer({ threat, onClose }) {
 if (!threat) return null;
 return (
 <>
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" onClick={onClose} />
 <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-white z-[111] shadow-2xl border-l border-gray-100 p-10 overflow-y-auto">
 <div className="flex items-center justify-between mb-10">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-xl">
 <ShieldAlert className="w-6 h-6" />
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900 ">Threat Intelligence</h3>
 <p className="text-xs text-gray-400 font-semibold mt-0.5">DEVICE ID: #{threat.device_id}</p>
 </div>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><X className="w-5 h-5" /></button>
 </div>

 <div className="space-y-8">
 <div className="p-5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className={cn('w-2.5 h-2.5 rounded-full', threat.severity === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500')} />
 <span className="text-sm font-semibold text-gray-900 ">{threat.severity} Severity Encounter</span>
 </div>
 <div className="flex items-center gap-2 text-emerald-600">
 <ShieldCheck className="w-4 h-4" />
 <span className="text-xs font-semibold text-gray-400 ">IEC 62443 Aligned</span>
 </div>
 </div>

 <div>
 <h1 className="text-xl font-semibold text-gray-900 leading-tight">{threat.threat_type}</h1>
 <span className="mt-2 inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500">{threat.iec_category}</span>
 </div>

 <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-50">
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-gray-400"><Activity className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Traffic Analysis</span></div>
 <p className="text-xs font-semibold text-gray-900 ">Packet Rate: <span className="text-red-500">{(threat.packet_rate || 0).toFixed(0)} PPS</span></p>
 <p className="text-xs font-semibold text-gray-900 ">Failed Commands: <span className="text-orange-500">{threat.failed_commands || 0} / cycle</span></p>
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-gray-400"><Cpu className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Vulnerability</span></div>
 <p className="text-xs font-semibold text-gray-900 ">Auth Attempts: <span className={threat.unauthorized_access_attempts > 0 ? 'text-red-500' : ''}>{threat.unauthorized_access_attempts || 0}</span></p>
 <p className="text-xs font-semibold text-gray-900 ">Firmware Mod: <span className={threat.firmware_change_flag > 0 ? 'text-red-500' : 'text-emerald-500'}>{threat.firmware_change_flag > 0 ? 'Detected' : 'Clean'}</span></p>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 "><Zap className="w-3.5 h-3.5 text-shell-yellow" /> Root Cause Intelligence</h4>
 <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-gray-100 pl-4">
 "System observed anomaly in {threat.threat_type} behavior. Pattern matches {(threat.severity || '').toLowerCase()}-profile exploit signature."
 </p>
 </div>

 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2 "><AlertCircle className="w-3.5 h-3.5" /> Operational Impact</h4>
 <p className="text-xs font-bold text-gray-400 leading-relaxed ">
 Potential process shutdown or controller failure. High risk on node {threat.device_id}.
 </p>
 </div>

 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-blue-600 flex items-center gap-2 "><Settings className="w-3.5 h-3.5" /> Countermeasures</h4>
 <div className="space-y-2">
 {['Isolate Node', 'Firmware Reset', 'Credential Rotate'].map(a => (
 <div key={a} className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all group">
 <span className="text-xs font-semibold text-gray-900 ">{a}</span>
 <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
 </div>
 ))}
 </div>
 </div>

 <div className="p-6 rounded-xl bg-gray-900 text-white space-y-4 relative overflow-hidden">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-shell-yellow"><Bot className="w-4 h-4" /><span className="text-xs font-semibold ">Automated AIOps Response</span></div>
 <span className="text-xs font-semibold text-gray-500 ">INC-#6742</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-shell-yellow ">Status:</span>
 <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-semibold text-shell-yellow">Deflected</span>
 </div>
 <p className="text-xs text-gray-400 leading-relaxed ">
 "AI Monitoring matched threat pattern to known signature from firmware build #92. Ticket deflected."
 </p>
 </div>

 <div className="flex gap-4">
 <button className="flex-1 py-3 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors shadow-lg">Acknowledge Threat</button>
 <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><ExternalLink className="w-4 h-4" /></button>
 </div>
 </div>
 </div>
 </>
 );
}

// ─── Main OT Threat View ────────────────────────────────────────────────────────
export function OTThreatView() {
 const [threats, setThreats] = useState([]);
 const [summary, setSummary] = useState(null);
 const [loading, setLoading] = useState(true);
 const [selectedThreat, setSelectedThreat] = useState(null);
 const [lastRefreshed, setLastRefreshed] = useState(new Date());

 const fetchData = async () => {
 try {
 setLoading(true);
 const [otRes, sumRes] = await Promise.all([
 fetchWithTimeout(`${API}/api/operational/ot`),
 fetchWithTimeout(`${API}/api/metrics/summary`),
 ]);
 const otData = otRes.ok ? await otRes.json() : null;
 const sumData = sumRes.ok ? await sumRes.json() : null;
 setThreats(Array.isArray(otData) && otData.length > 0 ? otData : MOCK_OT_THREATS);
 setSummary(sumData && sumData.total_tickets > 0 ? sumData : MOCK_SUMMARY);
 setLastRefreshed(new Date());
 } catch {
 setThreats(MOCK_OT_THREATS);
 setSummary(MOCK_SUMMARY);
 } finally { setLoading(false); }
 };

 useEffect(() => {
 fetchData();
 const id = setInterval(fetchData, 15000);
 return () => clearInterval(id);
 }, []);

 const criticalCount = threats.filter(t => t.severity === 'Critical').length;

 return (
 <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-semibold text-gray-900 ">
 OT Cyber <span className="text-gray-300 font-light">Threat Detection</span>
 </h2>
 <div className="flex items-center gap-2 mt-1 text-gray-400">
 <span className="text-xs font-semibold ">AI-Driven Industrial Security</span>
 <div className="w-1.5 h-1.5 rounded-full bg-shell-yellow" />
 <span className="text-xs font-semibold ">IEC 62443 Standard</span>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className={cn('px-4 py-2 rounded-xl border flex items-center gap-2',
 criticalCount > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600')}>
 {criticalCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
 <span className="text-xs font-semibold ">{criticalCount > 0 ? 'Under Attack' : 'Secure'}</span>
 </div>
 <button onClick={fetchData} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white transition-all">
 <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
 </button>
 </div>
 </div>

 <OTKpiCards totalDevices={124} activeThreats={threats.length} criticalAlerts={criticalCount} ticketsGenerated={summary?.total_tickets || 0} />

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <OTThreatTable threats={threats} onRowClick={setSelectedThreat} selectedDeviceId={selectedThreat?.device_id} />
 <OTRiskVisuals threats={threats} />
 </div>

 {/* Status Footer */}
 <div className="flex items-center justify-between p-6 rounded-xl bg-gray-900 text-white relative overflow-hidden">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-3">
 <Zap className="w-5 h-5 text-shell-yellow" />
 <div>
 <p className="text-xs font-semibold text-gray-500 ">AIOps Engine</p>
 <p className="text-xs font-semibold ">Proactive Shield Active</p>
 </div>
 </div>
 <div className="h-6 w-px bg-white/10" />
 <div className="flex items-center gap-2 text-gray-400">
 <History className="w-4 h-4" />
 <span className="text-sm font-bold ">Last Sync: {lastRefreshed.toLocaleTimeString()}</span>
 </div>
 </div>
 <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-shell-yellow">
 IEC 62443 Level 4 Secured
 </div>
 </div>

 {/* Detail Drawer */}
 {selectedThreat && <OTDetailDrawer threat={selectedThreat} onClose={() => setSelectedThreat(null)} />}
 </div>
 );
}
