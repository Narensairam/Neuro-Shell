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
} from 'lucide-react';

const GOVERNANCE_URL =
    import.meta.env.VITE_GOVERNANCE_API_URL || 'http://localhost:5003';

function normalizeDashboard(raw) {
    if (!raw) return null;
    if (raw.model_registry && raw.registered_models) {
        return {
            registered_models: raw.registered_models,
            compliance_score: raw.compliance_score,
            bias_alerts: raw.bias_alerts,
            pending_audits: raw.pending_audits,
            pending_audit_next_model: raw.pending_audit_next_model,
            models: raw.model_registry.map((m) => ({
                model_name: m.model,
                risk_tier: m.risk_tier,
                version: m.version,
                accuracy: m.accuracy,
                last_audit: m.last_audit,
                status: m.status,
            })),
            audit_logs: (raw.audit_logs || []).map((l) => ({
                time: l.time,
                action: l.action,
                regulation: l.law,
            })),
        };
    }
    if (raw.registered_models && Array.isArray(raw.models) && !raw.model_registry) {
        return {
            registered_models: raw.registered_models,
            compliance_score: raw.compliance_score,
            bias_alerts: raw.bias_alerts,
            pending_audits: raw.pending_audits,
            pending_audit_next_model: raw.pending_audit_next_model ?? null,
            models: raw.models,
            audit_logs: raw.audit_logs || [],
        };
    }
    return {
        registered_models: {
            total: raw.models?.length ?? 0,
            tier1: 0,
            tier2: 0,
            tier3: 0,
        },
        compliance_score: raw.compliance_score,
        bias_alerts: raw.bias_alerts,
        pending_audits: raw.pending_audits,
        pending_audit_next_model: null,
        models: (raw.models || []).map((m) => ({
            model_name: m.model_name,
            risk_tier: m.risk_tier,
            version: m.version,
            accuracy:
                typeof m.accuracy === 'number'
                    ? `${(m.accuracy * 100).toFixed(0)}%`
                    : String(m.accuracy),
            last_audit: m.last_audit,
            status: m.status,
        })),
        audit_logs: (raw.audit_logs || []).map((l) => ({
            time: l.timestamp || l.time,
            action: l.action,
            regulation: l.regulation || l.law,
        })),
    };
}

const MOCK_FALLBACK = {
    registered_models: { total: 147, tier1: 12, tier2: 40, tier3: 87 },
    compliance_score: 96.4,
    bias_alerts: 2,
    pending_audits: 8,
    pending_audit_next_model: 'HR Screening Model',
    models: [
        {
            model_name: 'Compressor Failure Predictor',
            risk_tier: 'Tier 2',
            version: '3.2.1',
            accuracy: '94%',
            last_audit: '2 days ago',
            status: 'Compliant',
        },
        {
            model_name: 'HR Screening Model',
            risk_tier: 'Tier 1',
            version: '1.8.3',
            accuracy: '88%',
            last_audit: 'Today',
            status: 'Under Review',
        },
        {
            model_name: 'Trading Arbitrage Detector',
            risk_tier: 'Tier 1 (High Risk)',
            version: '2.4.0',
            accuracy: '91%',
            last_audit: '1 week ago',
            status: 'Compliant',
        },
        {
            model_name: 'IT Ticket Classifier',
            risk_tier: 'Tier 3',
            version: '4.1.0',
            accuracy: '89%',
            last_audit: '3 days ago',
            status: 'Compliant',
        },
    ],
    audit_logs: [
        {
            time: '14:32',
            action: 'Model retrained — Compressor Failure Predictor',
            regulation: 'EU AI Act Art.9',
        },
        {
            time: '13:15',
            action: 'Bias audit completed — HR Screening Model',
            regulation: 'EU AI Act Art.10',
        },
        {
            time: '11:48',
            action: 'Access reviewed — Trading Agent v2.4',
            regulation: 'SOX Section 404',
        },
    ],
};

function tierBadgeClass(tier) {
    const t = String(tier || '');
    if (t.includes('Tier 1')) {
        return 'bg-red-50 text-red-700 border border-red-200';
    }
    if (t.includes('Tier 2')) {
        return 'bg-amber-50 text-amber-800 border border-amber-200';
    }
    return 'bg-gray-100 text-gray-700 border border-gray-200';
}

function tierDisplayLabel(tier) {
    const t = String(tier || '');
    if (t === 'Tier 1') return 'Tier 1 (High Risk)';
    return t;
}

export function GovernanceView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${GOVERNANCE_URL}/governance/dashboard`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setData(normalizeDashboard(json));
                setUsingFallback(false);
            } catch (e) {
                console.error('Governance agent unreachable:', e);
                setData(normalizeDashboard(MOCK_FALLBACK));
                setUsingFallback(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const reg = data?.registered_models;

    const tierSubtext = useMemo(() => {
        if (!reg) return '';
        return `${reg.tier1} Tier 1 · ${reg.tier2} Tier 2 · ${reg.tier3} Tier 3`;
    }, [reg]);

    const pendingSubtext = useMemo(() => {
        if (!data?.pending_audit_next_model) return 'Queue from Tier 1 registry';
        return `Next: ${data.pending_audit_next_model}`;
    }, [data]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-shell-red rounded-full" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-y-auto pr-1">
            <header className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight text-shell-darkText">
                        <Scale className="w-7 h-7 text-shell-red" />
                        Governance &amp; Compliance
                    </h1>
                    <p className="text-[12px] text-gray-500 mt-1 max-w-2xl">
                        AI model registry · Bias monitoring · SOX &amp; EU AI Act
                        compliance
                    </p>
                    {usingFallback && (
                        <p className="text-[10px] font-mono text-amber-700 mt-2 uppercase tracking-wider">
                            Demo data — start Neuro Shell AI service (port 5003) for
                            live agent output
                        </p>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">
                            Registered Models
                        </div>
                        <Database className="w-4 h-4 text-shell-yellow" />
                    </div>
                    <div className="text-[31px] font-black text-shell-darkText leading-none">
                        {reg?.total ?? '—'}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 font-medium">
                        {tierSubtext}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">
                            Compliance Score
                        </div>
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-[31px] font-black text-green-600 leading-none">
                        {data.compliance_score}%
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2">
                        SOX + EU AI Act combined
                    </div>
                </div>

                <div
                    className={`bg-white border rounded-lg p-5 shadow-sm ${data.bias_alerts > 0 ? 'border-amber-200' : 'border-gray-200'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">
                            Bias Alerts
                        </div>
                        <AlertOctagon
                            className={`w-4 h-4 ${data.bias_alerts > 0 ? 'text-amber-600' : 'text-gray-300'}`}
                        />
                    </div>
                    <div
                        className={`text-[31px] font-black leading-none ${data.bias_alerts > 0 ? 'text-amber-600' : 'text-shell-darkText'}`}
                    >
                        {data.bias_alerts}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2">
                        Under investigation
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">
                            Pending Audits
                        </div>
                        <FileCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-[31px] font-black text-blue-600 leading-none">
                        {data.pending_audits}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2">{pendingSubtext}</div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-sm mb-6">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <h2 className="font-extrabold text-[13px] uppercase tracking-wider text-gray-600">
                        AI Model Registry
                    </h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search registry..."
                                className="pl-7 pr-2 py-1 bg-white border border-gray-200 rounded text-[10px] w-48 focus:outline-none focus:border-shell-red transition-colors"
                            />
                        </div>
                        <button
                            type="button"
                            className="p-1 border border-gray-200 rounded hover:bg-gray-100"
                            aria-label="Filter"
                        >
                            <Filter className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[720px]">
                        <thead className="bg-white border-b border-gray-100">
                            <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-5 py-3">Model</th>
                                <th className="px-5 py-3 text-center">Risk Tier</th>
                                <th className="px-5 py-3 text-center">Version</th>
                                <th className="px-5 py-3 text-right">Accuracy</th>
                                <th className="px-5 py-3">Last Audit</th>
                                <th className="px-5 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.models.map((m, i) => (
                                <tr
                                    key={`${m.model_name}-${i}`}
                                    className="hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-bold text-shell-darkText flex items-center gap-1.5">
                                                {m.model_name}
                                                <ArrowUpRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-mono">
                                                ID: AI-{1000 + i}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${tierBadgeClass(m.risk_tier)}`}
                                        >
                                            {tierDisplayLabel(m.risk_tier)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center font-mono text-[10px] text-gray-600">
                                        {m.version}
                                    </td>
                                    <td className="px-5 py-4 text-right font-mono text-[11px] font-bold text-shell-darkText">
                                        {m.accuracy}
                                    </td>
                                    <td className="px-5 py-4 text-[10px] text-gray-500 font-medium">
                                        {m.last_audit}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {m.status === 'Compliant' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Compliant
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-100">
                                                <Clock className="w-3 h-3" />
                                                {m.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mb-4">
                    Compliance audit log
                </div>
                <div className="space-y-3">
                    {data.audit_logs.map((log, i) => (
                        <div
                            key={`${log.time}-${i}`}
                            className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0"
                        >
                            <span className="font-mono text-[11px] text-gray-500 w-14 shrink-0">
                                {log.time}
                            </span>
                            <span className="text-[12px] font-semibold text-shell-darkText flex-1 min-w-[200px]">
                                {log.action}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                                {log.regulation}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
