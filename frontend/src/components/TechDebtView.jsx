export function TechDebtView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <span className="text-[21px]">▣</span> Tech Debt Reduction
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Application Rationalization · S/4HANA Clean Core Migration</div>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Legacy Apps Decommissioned</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">42<span className="text-[15px] text-gray-400 font-normal ml-1">/ 180 Target</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3"><div className="h-full bg-shell-yellow w-[23%]"></div></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">S/4HANA Clean Core Readiness</div>
                    <div className="text-[31px] font-extrabold text-green-600 leading-none">55<span className="text-[15px] text-green-600 font-normal ml-1">%</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3"><div className="h-full bg-green-500 w-[55%]"></div></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Custom Code Migrated to BTP</div>
                    <div className="text-[31px] font-extrabold text-shell-yellow leading-none">1,200<span className="text-[15px] text-gray-400 font-normal ml-1">objects</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3"><div className="h-full bg-shell-yellow w-[38%]"></div></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">ERP Modernization Roadmap</h2>
                    <table className="w-full text-left text-[13px] text-gray-600">
                        <thead>
                            <tr className="border-b border-gray-100 text-[10px] font-mono uppercase text-gray-400 tracking-widest">
                                <th className="pb-2 font-normal">Initiative</th>
                                <th className="pb-2 font-normal">Q1 '26</th>
                                <th className="pb-2 font-normal">Q2 '26</th>
                                <th className="pb-2 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50">
                                <td className="py-2.5 font-bold">Finance Data Migration</td>
                                <td>✅ 100%</td><td>—</td><td className="text-green-600 font-mono text-[10px] tracking-widest font-bold">Done</td>
                            </tr>
                            <tr className="border-b border-gray-50">
                                <td className="py-2.5 font-bold">Supply Chain ABAP Convert</td>
                                <td>⏳ 80%</td><td>⏳ 20%</td><td className="text-amber-500 font-mono text-[10px] tracking-widest font-bold">In-Prog</td>
                            </tr>
                            <tr className="border-b border-gray-50">
                                <td className="py-2.5 font-bold">HR SuccessFactors Sync</td>
                                <td>—</td><td>🚀 Start</td><td className="text-blue-500 font-mono text-[10px] tracking-widest font-bold">Planned</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 font-bold">Legacy DB Archiving</td>
                                <td>—</td><td>—</td><td className="text-gray-400 font-mono text-[10px] tracking-widest font-bold">Backlog</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">Tech Debt Cost Savings</h2>
                    <div className="flex gap-4 items-center">
                        <div className="w-[120px] h-[120px] rounded-full border-[10px] border-amber-100 flex items-center justify-center relative">
                            <div className="absolute inset-0 border-[10px] border-shell-yellow rounded-full border-r-transparent border-t-transparent origin-center -rotate-45"></div>
                            <div className="text-center">
                                <div className="text-[21px] font-extrabold leading-none">$84M</div>
                                <div className="text-[9px] font-mono tracking-widest text-gray-400 mt-1 uppercase">Saved YTD</div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 text-[13px]">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="font-bold">License Consolidation</span>
                                <span className="text-green-600">$42M</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="font-bold">Server Decommissioning</span>
                                <span className="text-green-600">$28M</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="font-bold">Support Contract Rationalization</span>
                                <span className="text-green-600">$14M</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
