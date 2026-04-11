export function ChangeAdoptionView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <span className="text-[21px]">👥</span> Change & Adoption
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Platform Onboarding · Upskilling · Engagement</div>
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Business Users Active</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">12.5<span className="text-[15px] text-gray-400 font-normal ml-1">K</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1">↑ 18% MoM</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Training Completed</div>
                    <div className="text-[31px] font-extrabold text-blue-600 leading-none">4,800<span className="text-[15px] text-gray-400 font-normal ml-1">hrs</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">AI literacy program</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Executive Sponsors</div>
                    <div className="text-[31px] font-extrabold text-shell-yellow leading-none">18<span className="text-[15px] text-gray-400 font-normal ml-1">VPs</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Pledging direct pipeline KPIs</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Sentiment Score</div>
                    <div className="text-[31px] font-extrabold text-green-600 leading-none">4.2<span className="text-[15px] text-gray-400 font-normal ml-1">/5</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Last survey: Month 4</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">Adoption Heatmap by Domain</h2>
                    <div className="space-y-4">
                        {[
                            { name: 'Manufacturing & Operations', pct: 78, c: 'text-green-700 bg-green-100', bg: 'bg-green-500' },
                            { name: 'IT & Cybersecurity', pct: 85, c: 'text-green-700 bg-green-100', bg: 'bg-green-500' },
                            { name: 'Supply Chain', pct: 62, c: 'text-amber-700 bg-amber-100', bg: 'bg-shell-yellow' },
                            { name: 'Trading', pct: 45, c: 'text-amber-700 bg-amber-100', bg: 'bg-shell-yellow' },
                            { name: 'Finance', pct: 22, c: 'text-red-700 bg-red-100', bg: 'bg-red-500' },
                        ].map((pr, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[12px] text-gray-700 font-medium">{pr.name}</span>
                                    <span className={`px-2 py-[1px] rounded-full font-mono text-[9px] tracking-widest font-bold ${pr.c}`}>{pr.pct}% Adopted</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${pr.bg}`} style={{ width: `${pr.pct}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">Resistance & Friction Points</h2>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-md">
                            <div className="text-[13px] font-bold mb-1">Finance Division Resistance</div>
                            <div className="text-[11px] text-gray-500">Concerns over AI auto-reconciliation accuracy limiting adoption of the AI ledger tool. Trust building needed through shadowed pilots.</div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-md">
                            <div className="text-[13px] font-bold mb-1">OT Field Worker Training</div>
                            <div className="text-[11px] text-gray-500">Shift supervisors report lack of time to learn the new predictive maintenance interface. Action: Mobile-first 5-min micro-trainings.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
