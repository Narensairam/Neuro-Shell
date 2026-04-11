import { useEffect, useState } from 'react';
import { Factory, Ship, TrendingUp, CircleDollarSign, HardHat, ShieldCheck, Flame, Bell, Info, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function CommandCenterView() {
    const [fireAlert, setFireAlert] = useState(null);
    const [isNewAlert, setIsNewAlert] = useState(false);

    useEffect(() => {
        let t;
        const NEURO_SHELL_ORIGIN = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';
        const fetchFire = async () => {
            try {
                const res = await fetch(`${NEURO_SHELL_ORIGIN}/api/fire/alerts`);
                if (res.ok) {
                    const data = await res.json();
                    const fire = data.find(a => a.type === 'FIRE');
                    if (fire) {
                        setFireAlert(prev => {
                            if (!prev) {
                                setIsNewAlert(true);
                                setTimeout(() => setIsNewAlert(false), 60000);
                            }
                            return fire;
                        });
                    } else {
                        setFireAlert(null);
                        setIsNewAlert(false);
                    }
                }
            } catch { setFireAlert(null); }
        };
        fetchFire();
        t = setInterval(fetchFire, 2000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold leading-tight">Control Tower</h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Shell plc · Enterprise AI Operating System · Real-time Platform Intelligence</div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-mono text-[9.5px] tracking-widest uppercase font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>Platform Online
                    </span>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div onClick={() => setCurrentView('models')} className="bg-amber-50/30 border border-amber-200 rounded-lg p-5 relative overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-50"></div>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5 group-hover:text-amber-700 transition-colors">AI Models in Production</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">47<span className="text-[15px] text-gray-400 font-normal ml-1">live</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1">↑ +12 this month · Target 200+</div>
                    {/* Fake Sparkline */}
                    <div className="flex items-end gap-[2px] h-6 mt-3">
                        {[30, 45, 40, 60, 55, 70, 85, 100].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] transition-all ${i === 7 ? 'bg-green-500' : 'bg-green-200'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Unplanned Downtime Reduction</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">22<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1">↑ Target: 35% · On Track</div>
                    <div className="flex items-end gap-[2px] h-6 mt-3">
                        {[20, 30, 42, 38, 55, 62, 70, 85].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] transition-all ${i === 7 ? 'bg-shell-yellow' : 'bg-amber-100'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">IT Budget Freed for Innovation</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">$84<span className="text-[15px] text-gray-400 font-normal ml-1">M</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1">↑ Target: $200M in 24 months</div>
                    <div className="flex items-end gap-[2px] h-6 mt-3">
                        {[15, 25, 35, 40, 52, 58, 70, 82].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] transition-all ${i === 7 ? 'bg-shell-yellow' : 'bg-amber-100'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div onClick={() => setCurrentView('alerts')} className={`border rounded-lg p-5 relative overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${isNewAlert ? 'bg-red-600 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse' : 'bg-red-50/40 border-red-200 group'}`}>
                    <div className={`font-mono text-[10px] tracking-widest uppercase mb-1.5 ${isNewAlert ? 'text-white' : 'text-gray-500 group-hover:text-red-700 transition-colors'}`}>Critical Alerts Active</div>
                    <div className={`text-[31px] font-extrabold leading-none ${isNewAlert ? 'text-white' : 'text-red-600'}`}>{fireAlert ? 4 : 3}<span className={`text-[15px] font-normal ml-1 ${isNewAlert ? 'text-white/70' : 'text-red-400'}`}>open</span></div>
                    <div className={`font-mono text-[10px] mt-1 flex items-center gap-1 ${isNewAlert ? 'text-white font-bold' : 'text-red-600'}`}>
                        {fireAlert ? <Flame className="w-3.5 h-3.5 animate-pulse" /> : ''}
                        {fireAlert ? 'FIRE DETECTED · ' : ''}
                        <AlertTriangle className="w-3 h-3" /> OT Disconnect · <ShieldCheck className="w-3 h-3" /> AI Gov
                    </div>
                    <div className="flex items-end gap-[2px] h-6 mt-3">
                        {[80, 70, 90, 65, 85, 72, 88, 100].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t-sm min-h-[2px] transition-all ${i === 7 ? 'bg-red-500' : 'bg-red-200'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WAVE TRACKER */}
            <div className="flex relative mb-4">
                {[
                    { wave: "Wave 0", title: "Discovery", period: "Months 1–3", pct: 100, active: false, done: true, color: "bg-green-500" },
                    { wave: "Wave 1", title: "Foundation", period: "Months 4–12", pct: 62, active: true, done: false, color: "bg-shell-yellow" },
                    { wave: "Wave 2", title: "Scale & Embed", period: "Months 13–24", pct: 0, active: false, done: false, color: "bg-blue-500" },
                    { wave: "Wave 3", title: "Independence", period: "Months 25–36", pct: 0, active: false, done: false, color: "bg-green-500" }
                ].map((step, idx) => (
                    <div key={idx} className="flex-1 relative group cursor-pointer hover:-translate-y-0.5 transition-transform">
                        <div className={`p-4 border-y border-l ${idx === 3 ? 'border-r rounded-r-lg' : ''} ${idx === 0 ? 'rounded-l-lg' : ''} 
              ${step.active ? 'bg-amber-50/50 border-amber-300' : step.done ? 'bg-green-50/40 border-green-200' : 'bg-white border-gray-200'}`}>
                            <div className="font-mono text-[9.5px] text-gray-500 tracking-widest uppercase">{step.wave}</div>
                            <div className="font-extrabold text-[14px] my-1">{step.title}</div>
                            <div className="font-mono text-[10px] text-gray-400">{step.period}</div>
                            <div className={`font-extrabold text-[21px] mt-2 ${step.done ? 'text-green-600' : step.active ? 'text-shell-yellow' : 'text-gray-300'}`}>
                                {step.pct}<span className="text-[13px] text-gray-400 font-normal">%</span>
                            </div>
                            <div className="h-0.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className={`h-full ${step.color} rounded-full transition-all duration-1000 w-[${step.pct}%]`} style={{ width: `${step.pct}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT SPLIT */}
            <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                {/* DOMAIN GRID */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-extrabold text-[15px] text-shell-darkText flex items-center gap-2">AI Domain Performance</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div onClick={() => setCurrentView('manufacturing')} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-shell-yellow hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50/30 group relative overflow-hidden">
                            <Factory className="w-6 h-6 mb-2 text-shell-darkText" />
                            <div className="font-extrabold text-[13.5px] mb-1">Manufacturing</div>
                            <div className="font-mono text-[9.5px] text-gray-500">50+ refineries · 22% downtime ↓</div>
                            <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest">Active</span></div>
                            <div className="h-[2px] bg-gray-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-shell-yellow w-[62%]"></div></div>
                        </div>
                        <div onClick={() => setCurrentView('supplychain')} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-shell-yellow hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50/30 group relative overflow-hidden">
                            <Ship className="w-6 h-6 mb-2 text-shell-darkText" />
                            <div className="font-extrabold text-[13.5px] mb-1">Supply Chain</div>
                            <div className="font-mono text-[9.5px] text-gray-500">46K stations · 8% fleet savings</div>
                            <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest">Live</span></div>
                            <div className="h-[2px] bg-gray-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-green-500 w-[78%]"></div></div>
                        </div>
                        <div onClick={() => setCurrentView('commercial')} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-shell-yellow hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50/30 group relative overflow-hidden">
                            <TrendingUp className="w-6 h-6 mb-2 text-shell-darkText" />
                            <div className="font-extrabold text-[13.5px] mb-1">Trading</div>
                            <div className="font-mono text-[9.5px] text-gray-500">6 commodity classes · AI pricing</div>
                            <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest">Building</span></div>
                            <div className="h-[2px] bg-gray-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-blue-400 w-[35%]"></div></div>
                        </div>
                        <div onClick={() => setCurrentView('finance')} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-shell-yellow hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50/30 group relative overflow-hidden">
                            <CircleDollarSign className="w-6 h-6 mb-2 text-shell-darkText" />
                            <div className="font-extrabold text-[13.5px] mb-1">Finance</div>
                            <div className="font-mono text-[9.5px] text-gray-500">1,000+ entities · 9-day close</div>
                            <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest">Active</span></div>
                            <div className="h-[2px] bg-gray-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-shell-yellow w-[48%]"></div></div>
                        </div>
                        <div onClick={() => setCurrentView('hr')} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-shell-yellow hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50/30 group relative overflow-hidden">
                            <HardHat className="w-6 h-6 mb-2 text-shell-darkText" />
                            <div className="font-extrabold text-[13.5px] mb-1">HR & Safety</div>
                            <div className="font-mono text-[9.5px] text-gray-500">86K employees · 18% incident ↓</div>
                            <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest">Active</span></div>
                            <div className="h-[2px] bg-gray-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-shell-yellow w-[54%]"></div></div>
                        </div>
                        <div onClick={() => setCurrentView('itops')} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-shell-yellow hover:-translate-y-0.5 hover:shadow-md transition-all bg-gray-50/30 group relative overflow-hidden">
                            <ShieldCheck className="w-6 h-6 mb-2 text-shell-darkText" />
                            <div className="font-extrabold text-[13.5px] mb-1">IT / Cyber</div>
                            <div className="font-mono text-[9.5px] text-gray-500">50K tickets/mo · 42% deflected</div>
                            <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest">Live</span></div>
                            <div className="h-[2px] bg-gray-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-green-500 w-[85%]"></div></div>
                        </div>
                    </div>
                </div>

                {/* ALERTS FEED */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-extrabold text-[15px] text-shell-darkText flex items-center gap-2">Alert Center</div>
                        <span onClick={() => setCurrentView('alerts')} className="font-mono text-[10px] text-gray-500 tracking-widest uppercase cursor-pointer hover:text-shell-yellow">All →</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {fireAlert && (
                            <div className={`flex gap-2.5 transition-all duration-300 rounded-md ${isNewAlert ? 'p-3 border-2 border-red-600 bg-red-700 text-white animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'p-2.5 border-l-4 border-l-red-500 bg-gray-50'}`}>
                                <Flame className={isNewAlert ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0 text-red-600"} />
                                <div>
                                    <div className={`text-[12px] leading-snug font-black uppercase tracking-tight ${isNewAlert ? '' : 'text-red-700'}`}>CRITICAL ALERT: FIRE</div>
                                    <div className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${isNewAlert ? 'text-white/90' : 'text-gray-500'}`}>Node {fireAlert.camera_id} · Evacuation Protocol Active</div>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2.5 p-2.5 rounded-md border-l-4 border-l-red-500 bg-gray-50">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <div>
                                <div className="text-[12px] leading-snug"><b className="text-shell-darkText">OT Disconnect:</b> 492K sensor tags offline from EOS AI layer</div>
                                <div className="font-mono text-[9.5px] text-gray-500 mt-1">Critical · 50+ sites affected</div>
                            </div>
                        </div>
                        <div className="flex gap-2.5 p-2.5 rounded-md border-l-4 border-l-red-500 bg-gray-50">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-red-600" />
                            <div>
                                <div className="text-[12px] leading-snug"><b className="text-shell-darkText">AI Governance:</b> 200+ models without lifecycle management</div>
                                <div className="font-mono text-[9.5px] text-gray-500 mt-1">Critical · EU AI Act exposure</div>
                            </div>
                        </div>
                        <div className="flex gap-2.5 p-2.5 rounded-md border-l-4 border-l-amber-500 bg-gray-50">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                            <div>
                                <div className="text-[12px] leading-snug"><b className="text-shell-darkText">Finance Close:</b> Still at 9 days · target is 5–7 days</div>
                                <div className="font-mono text-[9.5px] text-gray-500 mt-1">Warning · SOX audit risk</div>
                            </div>
                        </div>
                        <div className="flex gap-2.5 p-2.5 rounded-md border-l-4 border-l-green-500 bg-gray-50">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                            <div>
                                <div className="text-[12px] leading-snug"><b className="text-shell-darkText">L1 Ticket Deflection:</b> AI self-service reached 42%</div>
                                <div className="font-mono text-[9.5px] text-gray-500 mt-1">Good · Target 65% by Month 12</div>
                            </div>
                        </div>
                        <div className="flex gap-2.5 p-2.5 rounded-md border-l-4 border-l-blue-500 bg-gray-50">
                            <Info className="w-4 h-4 shrink-0 text-blue-500" />
                            <div>
                                <div className="text-[12px] leading-snug"><b className="text-shell-darkText">CoE Milestone:</b> Shell AI Director onboarded</div>
                                <div className="font-mono text-[9.5px] text-gray-500 mt-1">Info · Phase 2 transition started</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
