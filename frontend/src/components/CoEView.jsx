export function CoEView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <span className="text-[21px]">◆</span> Centre of Excellence
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Cross-function AI innovation · Skunkworks · Talent Hub</div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-green-200">Phase 2 Transition</span>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Shell Secondees</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">8<span className="text-[15px] text-gray-400 font-normal ml-1">leads</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Data Scientists embedded</div>
                    <div className="text-[31px] font-extrabold text-blue-600 leading-none">42<span className="text-[15px] text-gray-400 font-normal ml-1">staff</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Generative AI Architects</div>
                    <div className="text-[31px] font-extrabold text-shell-yellow leading-none">12<span className="text-[15px] text-gray-400 font-normal ml-1">staff</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Open Skunkworks Projects</div>
                    <div className="text-[31px] font-extrabold text-amber-500 leading-none">5<span className="text-[15px] text-gray-400 font-normal ml-1">active</span></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">CoE Horizon Roadmap</h2>
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            <div className="text-[13px] font-bold text-shell-darkText">Phase 1: Foundation (Complete)</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">Establish Hub, map high-impact use cases across 6 domains, init data lake.</div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-shell-yellow rounded-full border-2 border-white shadow-sm ring-2 ring-amber-100"></div>
                            <div className="text-[13px] font-bold text-shell-darkText text-amber-600">Phase 2: Scale & Embed (Active)</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">Push 100+ models to production, train local champions, establish EU AI governance.</div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-200 rounded-full border-2 border-white"></div>
                            <div className="text-[13px] font-bold text-gray-400">Phase 3: Independence (Q4 2026)</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">Full handover of EOS layer to Shell IT staff. Complete democratization.</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-5 text-gray-100">
                    <h2 className="font-extrabold text-[15px] text-white mb-4 flex items-center gap-2"><span className="text-shell-yellow">⚡</span> Skunkworks R&D</h2>
                    <div className="space-y-4">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-[13px]">Project "DeepDrill"</span>
                                <span className="text-[9px] uppercase tracking-widest font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">NLP/Vision</span>
                            </div>
                            <div className="text-[11px] text-gray-400">Generative vision models for subterranean seismic mapping. Target 80% reduction in hit-miss ratios.</div>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-[13px]">Autonomous Agent Swarms</span>
                                <span className="text-[9px] uppercase tracking-widest font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">Orchestration</span>
                            </div>
                            <div className="text-[11px] text-gray-400">Multi-agent LangChain instances to auto-resolve 90% of Level 2 trading disputes without human review.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
