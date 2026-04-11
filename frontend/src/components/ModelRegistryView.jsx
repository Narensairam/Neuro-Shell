export function ModelRegistryView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <span className="text-[21px]">◉</span> Model Registry
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">47 models in production · Full lifecycle governance · No model &gt;90 days without validation</div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-md font-mono text-[10px] tracking-widest uppercase font-bold hover:bg-gray-50">Export Registry</button>
                    <button className="px-4 py-1.5 bg-shell-yellow text-black font-bold border-none rounded-md font-mono text-[10px] tracking-widest uppercase hover:bg-amber-400">
                        + Register Model
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-extrabold text-[15px] text-shell-darkText">Production Models</h2>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest border border-green-200">47 Active</span>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {[
                            { score: 97, name: 'Predictive Maintenance — Pernis Refinery Units', meta: 'Manufacturing · Deployed 45d ago · Owner: K.Visser', acc: '97.2%', status: 'g' },
                            { score: 94, name: 'Marine Route Optimizer — LNG Fleet Global', meta: 'Supply Chain · Deployed 62d ago · Owner: R.Chen', acc: '94.8%', status: 'g' },
                            { score: 91, name: 'L1 Ticket Classifier — Global IT Helpdesk', meta: 'IT Ops · Deployed 38d ago · Owner: M.Obi', acc: '91.4%', status: 'g' },
                            { score: 89, name: 'Safety Incident Predictor — Upstream Operations', meta: 'HR/Safety · Deployed 29d ago · Owner: A.Mehta', acc: '89.7%', status: 'g' },
                            { score: 83, name: 'Intercompany Reconciliation Agent', meta: 'Finance · Deployed 71d ago · Owner: S.Park', acc: '83.1%', status: 'o' },
                            { score: 78, name: 'Demand Forecasting — Retail Fuels EMEA', meta: 'Supply Chain · Deployed 88d ago · Owner: F.Müller', acc: '78.4%', status: 'o' },
                            { score: 61, name: 'Carbon Credit Price Predictor — Pilot', meta: 'Trading · Deployed 14d ago · Owner: T.Okonkwo', acc: '61.2%', status: 'r' },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[15px] border 
                                    ${m.status === 'g' ? 'bg-green-50 text-green-600 border-green-200' :
                                        m.status === 'o' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            'bg-red-50 text-red-600 border-red-200'}`}>
                                    {m.score}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-bold text-shell-darkText">{m.name}</div>
                                    <div className="font-mono text-[10px] text-gray-500 mt-0.5">{m.meta}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[19px] font-extrabold leading-none ${m.status === 'g' ? 'text-green-600' : m.status === 'o' ? 'text-amber-500' : 'text-red-500'}`}>{m.acc}</div>
                                    <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Accuracy</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h2 className="font-extrabold text-[15px] mb-4">Model Health</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[11px] text-gray-500 font-medium">Healthy (&gt;85%)</span>
                                    <span className="font-mono text-[10px] text-gray-500">38 models</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[81%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[11px] text-gray-500 font-medium">Warning (70–85%)</span>
                                    <span className="font-mono text-[10px] text-gray-500">7 models</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-shell-yellow w-[15%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[11px] text-gray-500 font-medium">Critical (&lt;70%)</span>
                                    <span className="font-mono text-[10px] text-gray-500">2 models</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[4%]"></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h2 className="font-extrabold text-[15px] mb-4">Governance Gates</h2>
                        <div className="space-y-2 text-[12px]">
                            <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tier 1 (Safety-Critical)</span><span className="font-mono text-red-600 font-bold">12 models</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tier 2 (Financial)</span><span className="font-mono text-amber-600 font-bold">18 models</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tier 3 (Advisory)</span><span className="font-mono text-green-600 font-bold">17 models</span></div>
                            <div className="flex justify-between pt-1"><span className="text-gray-500">Bias audit (30d)</span><span className="font-mono text-shell-yellow font-bold">41 / 47</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
