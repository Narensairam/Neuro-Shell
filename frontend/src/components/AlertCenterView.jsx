import { useEffect, useState } from 'react';
import { Bell, Flame, AlertCircle, AlertTriangle, CheckCircle2, TrendingUp, CircleDollarSign, Factory, Ship, HardHat, ShieldCheck, Scale } from 'lucide-react';

export function AlertCenterView() {
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
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <Bell className="w-6 h-6 text-amber-500" /> Alert Center
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Real-time programme & operational intelligence</div>
                </div>
                <button className="px-4 py-1.5 bg-red-100 text-red-700 font-bold border border-red-200 rounded-md font-mono text-[10px] tracking-widest uppercase">
                    3 Critical Open
                </button>
            </header>

            <div className="grid grid-cols-[1fr_400px] gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] text-shell-darkText mb-4">Active Alerts Feed</h2>
                    <div className="space-y-3">
                        {fireAlert && (
                            <div className={`flex gap-3 transition-all duration-300 rounded-md ${isNewAlert ? 'p-4 border-2 border-red-600 bg-red-700 text-white animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'p-3 border-l-4 border-l-red-500 bg-gray-50'}`}>
                                <Flame className={isNewAlert ? "w-6 h-6 shrink-0 mt-0.5" : "w-5 h-5 shrink-0 mt-0.5 text-red-600"} />
                                <div>
                                    <div className={`leading-snug font-black uppercase tracking-tight ${isNewAlert ? 'text-[14px]' : 'text-[13px] text-red-700'}`}>CRITICAL: LIVE FIRE DETECTED</div>
                                    <div className={`leading-snug mt-1 ${isNewAlert ? 'text-[13px] opacity-90' : 'text-[13px] text-gray-800'}`}>Visual confirmation on Node {fireAlert.camera_id} ({Math.round(fireAlert.confidence * 100)}% confidence). Automated suppression and evacuation protocols active.</div>
                                    <div className={`font-mono text-[10px] mt-2 inline-block ${isNewAlert ? 'bg-white/20 px-2 py-0.5 rounded' : 'text-red-700'}`}>HSE EMERGENCY · PRIORITY 1</div>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3 p-3 rounded-md border-l-4 border-l-red-500 bg-gray-50">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                            <div>
                                <div className="text-[13px] leading-snug"><b className="text-shell-darkText">OT / IT Disconnect:</b> 492,000+ sensor tags across 50+ global sites remain disconnected from EOS AI layer. Predictive maintenance severely limited.</div>
                                <div className="font-mono text-[10px] text-gray-500 mt-2">Critical · Remediation plan required · Owner: CTO</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-md border-l-4 border-l-red-500 bg-gray-50">
                            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                            <div>
                                <div className="text-[13px] leading-snug"><b className="text-shell-darkText">AI Governance Gap:</b> 153 AI projects have no model lifecycle management, no drift detection, no owner assignment. EU AI Act exposure.</div>
                                <div className="font-mono text-[10px] text-gray-500 mt-2">Critical · 90-day Ethics Framework overdue · Owner: CDO</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-md border-l-4 border-l-red-500 bg-gray-50">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                            <div>
                                <div className="text-[13px] leading-snug"><b className="text-shell-darkText">Finance Close Cycle:</b> Month-end close still averaging 9 business days against 5-7 day target. 1,000+ legal entities still on manual reconciliation.</div>
                                <div className="font-mono text-[10px] text-gray-500 mt-2">Critical · SOX audit risk · Owner: CFO</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-md border-l-4 border-l-amber-500 bg-gray-50">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                            <div>
                                <div className="text-[13px] leading-snug"><b className="text-shell-darkText">Interco Reconciliation Model:</b> Accuracy drifted to 83.1%, below 87% threshold. Retraining scheduled.</div>
                                <div className="font-mono text-[10px] text-gray-500 mt-2">Warning · Retrain queue: 3 days · Owner: CoE</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-md border-l-4 border-l-amber-500 bg-gray-50">
                            <Scale className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                            <div>
                                <div className="text-[13px] leading-snug"><b className="text-shell-darkText">ABAP Assessment:</b> Only 31% of 500+ custom ABAP programs assessed. S/4HANA migration risk.</div>
                                <div className="font-mono text-[10px] text-gray-500 mt-2">Warning · Month 12 milestone at risk · Owner: CTO</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] text-shell-darkText mb-4">Alert Summary by Domain</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                                <th className="pb-3 font-normal">Domain</th>
                                <th className="pb-3 font-normal">Crit</th>
                                <th className="pb-3 font-normal">Warn</th>
                                <th className="pb-3 font-normal">Good</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] text-gray-600 font-mono">
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-sans font-medium text-shell-darkText">Manufacturing</td>
                                <td className="text-red-500 font-bold">1</td><td className="text-amber-500 font-bold">2</td><td className="text-green-500">3</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-sans font-medium text-shell-darkText">Supply Chain</td>
                                <td className="text-gray-300">0</td><td className="text-amber-500 font-bold">1</td><td className="text-green-500">4</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-sans font-medium text-shell-darkText">Finance</td>
                                <td className="text-red-500 font-bold">1</td><td className="text-amber-500 font-bold">1</td><td className="text-green-500">2</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-sans font-medium text-shell-darkText">Trading</td>
                                <td className="text-gray-300">0</td><td className="text-amber-500 font-bold">1</td><td className="text-gray-300">1</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-sans font-medium text-shell-darkText">HR / Safety</td>
                                <td className="text-gray-300">0</td><td className="text-gray-300">0</td><td className="text-green-500">3</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-3 font-sans font-medium text-shell-darkText">IT / Cyber</td>
                                <td className="text-gray-300">0</td><td className="text-gray-300">0</td><td className="text-green-500">5</td>
                            </tr>
                            <tr>
                                <td className="py-3 font-sans font-medium text-shell-darkText">Governance</td>
                                <td className="text-red-500 font-bold">1</td><td className="text-amber-500 font-bold">1</td><td className="text-gray-300">0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
