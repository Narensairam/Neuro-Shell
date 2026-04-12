import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileWarning, Banknote, ShieldCheck, RefreshCw, ShoppingCart, CreditCard, Plane, TrendingUp } from 'lucide-react';

const EMPTY_FINANCE = {
    closeCycleDays: 0,
    autoReconRate: 0,
    anomaliesDetected: 0,
    reconChart: [],
    transactionsToReview: []
};

export function FinanceView() {
    const [data, setData] = useState(EMPTY_FINANCE);

    useEffect(() => {
        let isMounted = true;
        fetch('http://localhost:5000/api/finance')
            .then(res => res.json())
            .then(d => { if (isMounted) setData(d); })
            .catch(() => { if (isMounted) setData(EMPTY_FINANCE); });
        return () => { isMounted = false; };
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <Banknote className="w-7 h-7 text-amber-500" />
                        Finance & Accounting
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Intercompany Reconciliation · Financial Close</div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-amber-200">Processing Q3</span>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Financial Close Cycle</div>
                        <div className="text-[31px] font-extrabold text-amber-500 leading-none">{data.closeCycleDays}<span className="text-[15px] text-amber-400 font-normal ml-1">days</span></div>
                        <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Target met</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Auto-Reconciliation Rate</div>
                        <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.autoReconRate}<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">Wave 1 Deployment Baseline</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Audit Anomalies</div>
                        <div className="text-[31px] font-extrabold text-red-600 leading-none">{data.anomaliesDetected}</div>
                        <div className="font-mono text-[10px] text-red-500 mt-1 font-bold italic">Requires validation</div>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-[13px] font-extrabold text-shell-darkText mb-6 uppercase tracking-tight">Autonomous Reconciliation Volume</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.reconChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        label={{ value: 'Day Index', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                        label={{ value: 'Volume', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
                                    />
                                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="stepAfter" dataKey="volume" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                            <FileWarning className="w-4 h-4 text-red-500" /> Pending Review
                        </h4>
                        <div className="divide-y divide-gray-100">
                            {data.transactionsToReview.map((t, i) => (
                                <div key={i} className="py-3 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors px-1 rounded-md">
                                    <div className="flex-1">
                                        <div className="text-[11px] font-black text-shell-darkText uppercase tracking-tight">{t.entity}</div>
                                        <div className="text-[10px] text-gray-400 tracking-wide">{t.reason}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[11px] font-black text-shell-darkText">{t.value}</div>
                                        <div className="text-[8px] font-bold text-blue-600 uppercase">Review →</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                            <RefreshCw className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-shell-darkText">Monthly Close OS</div>
                            <div className="text-[10px] text-gray-400">Automated ledger consolidation active for 92 global entities.</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-shell-darkText">Fraud Detection AI</div>
                            <div className="text-[10px] text-gray-400">Pattern-matching engine running on all B2B transactions.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
