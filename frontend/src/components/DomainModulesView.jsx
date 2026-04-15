import { CheckCircle } from 'lucide-react';
export function DomainModulesView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold leading-tight -tracking-tight">AI Domain Modules</h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">6 functional transformation domains · Real-time AI inference</div>
                </div>
                <button className="px-4 py-1.5 bg-shell-yellow text-black font-bold border-none rounded-md font-mono text-[10px] tracking-widest uppercase hover:bg-amber-400 transition-colors shadow-sm">
                    Ask EVA
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* MANUFACTURING */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[14px] font-extrabold flex items-center gap-2">🏭 Manufacturing & Plant Operations</h2>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold">Wave 1 Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Unplanned Downtime</div>
                            <div className="text-[21px] font-extrabold text-green-600 leading-none">−22%</div>
                            <div className="text-[11px] text-gray-400 mt-1">Target: −35%</div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Sites Connected</div>
                            <div className="text-[21px] font-extrabold text-shell-yellow leading-none">18<span className="text-[13px] text-gray-400 font-normal">/50+</span></div>
                            <div className="text-[11px] text-gray-400 mt-1">OT-AI link active</div>
                        </div>
                    </div>
                    {/* Progress Bars */}
                    <div className="space-y-3">
                        {[
                            { name: 'Predictive Maintenance AI', stat: 'Live', color: 'bg-green-500', pct: 78, c: 'text-green-700 bg-green-100' },
                            { name: 'Yield Optimization Model', stat: 'Training', color: 'bg-shell-yellow', pct: 45, c: 'text-amber-700 bg-amber-100' },
                            { name: 'Catalyst Deactivation', stat: 'Pilot', color: 'bg-blue-400', pct: 28, c: 'text-blue-700 bg-blue-100' },
                            { name: 'LNG Train Optimization', stat: 'Design', color: 'bg-shell-yellow', pct: 15, c: 'text-amber-700 bg-amber-100' }
                        ].map((pr, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[12px] text-gray-500">{pr.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold ${pr.c}`}>{pr.stat}</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${pr.color} w-[${pr.pct}%]`} style={{ width: `${pr.pct}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-2.5 bg-green-50 border border-green-200 rounded-md font-mono text-[10px] text-green-700">
                        <CheckCircle className="w-4 h-4 inline-block align-text-bottom mr-1" /> AI Alert: Pump P-204 at Pernis showing bearing wear signature — 14-day maintenance window recommended
                    </div>
                </div>

                {/* SUPPLY CHAIN */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[14px] font-extrabold flex items-center gap-2">🚢 Supply Chain & Logistics</h2>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold">Live</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Fleet Cost Reduction</div>
                            <div className="text-[21px] font-extrabold text-green-600 leading-none">8.2%</div>
                            <div className="text-[11px] text-gray-400 mt-1">Target: 10–15%</div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Working Capital Freed</div>
                            <div className="text-[21px] font-extrabold text-shell-yellow leading-none">$62M</div>
                            <div className="text-[11px] text-gray-400 mt-1">Target: $500M+</div>
                        </div>
                    </div>
                    {/* Progress Bars */}
                    <div className="space-y-3">
                        {[
                            { name: 'Marine Route Optimization', stat: 'Live', color: 'bg-green-500', pct: 88, c: 'text-green-700 bg-green-100' },
                            { name: 'Demand-Supply Matching', stat: 'Live', color: 'bg-green-500', pct: 72, c: 'text-green-700 bg-green-100' },
                            { name: 'Tank Farm Optimizer', stat: 'Active', color: 'bg-shell-yellow', pct: 55, c: 'text-amber-700 bg-amber-100' },
                            { name: 'Wellhead-to-Station', stat: 'Building', color: 'bg-blue-400', pct: 38, c: 'text-blue-700 bg-blue-100' }
                        ].map((pr, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[12px] text-gray-500">{pr.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold ${pr.c}`}>{pr.stat}</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${pr.color} w-[${pr.pct}%]`} style={{ width: `${pr.pct}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-md font-mono text-[10px] text-amber-700">
                        ↻ Route AI: MT Serenity rerouted via Suez — saving 3.2 days · $420K fuel cost reduction
                    </div>
                </div>

                {/* FINANCE */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[14px] font-extrabold flex items-center gap-2">💰 Finance & Accounting</h2>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold">In Progress</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Financial Close (days)</div>
                            <div className="text-[21px] font-extrabold text-amber-500 leading-none">9<span className="text-[11px] text-gray-400 font-normal ml-1">target 5</span></div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Auto-Reconciliation</div>
                            <div className="text-[21px] font-extrabold text-shell-yellow leading-none">64%</div>
                            <div className="text-[11px] text-gray-400 mt-1">Target: 90%+</div>
                        </div>
                    </div>
                    {/* Progress Bars */}
                    <div className="space-y-3">
                        {[
                            { name: 'Intercompany Reconciliation', stat: 'Active', color: 'bg-shell-yellow', pct: 64, c: 'text-amber-700 bg-amber-100' },
                            { name: 'Cash Flow Forecasting', stat: 'Pilot', color: 'bg-blue-400', pct: 32, c: 'text-blue-700 bg-blue-100' },
                            { name: 'Transfer Pricing AI', stat: 'Building', color: 'bg-shell-yellow', pct: 20, c: 'text-amber-700 bg-amber-100' },
                            { name: 'Continuous Controls', stat: 'Live', color: 'bg-green-500', pct: 80, c: 'text-green-700 bg-green-100' }
                        ].map((pr, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[12px] text-gray-500">{pr.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold ${pr.c}`}>{pr.stat}</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${pr.color} w-[${pr.pct}%]`} style={{ width: `${pr.pct}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* HR & Safety */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[14px] font-extrabold flex items-center gap-2">👷 HR & Safety Intelligence</h2>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold">Wave 1</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Incident Reduction</div>
                            <div className="text-[21px] font-extrabold text-green-600 leading-none">−18%</div>
                            <div className="text-[11px] text-gray-400 mt-1">Target: −30%</div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">AI Reskilling Pathways</div>
                            <div className="text-[21px] font-extrabold text-shell-yellow leading-none">2,840</div>
                            <div className="text-[11px] text-gray-400 mt-1">Employees enrolled</div>
                        </div>
                    </div>
                    {/* Progress Bars */}
                    <div className="space-y-3">
                        {[
                            { name: 'Predictive Safety Analytics', stat: 'Active', color: 'bg-shell-yellow', pct: 60, c: 'text-amber-700 bg-amber-100' },
                            { name: 'Energy Transition Skills', stat: 'Live', color: 'bg-green-500', pct: 74, c: 'text-green-700 bg-green-100' },
                            { name: 'Workforce Forecasting', stat: 'Building', color: 'bg-blue-400', pct: 38, c: 'text-blue-700 bg-blue-100' },
                            { name: 'Contractor AI Scoring', stat: 'Design', color: 'bg-shell-yellow', pct: 15, c: 'text-amber-700 bg-amber-100' }
                        ].map((pr, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[12px] text-gray-500">{pr.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest font-bold ${pr.c}`}>{pr.stat}</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${pr.color} w-[${pr.pct}%]`} style={{ width: `${pr.pct}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
