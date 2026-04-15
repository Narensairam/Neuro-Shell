import { useState, useEffect, useRef } from 'react';
import { 
    Users, AlertTriangle, BrainCircuit, Zap, ArrowRight, ShieldAlert,
    HardHat, Globe, CheckCircle2
} from 'lucide-react';
import { crisisEventBus } from '../context/CrisisEventBus';

// Animated counter hook — smoothly animates numbers between values
function useAnimatedNumber(target, duration = 1200) {
    const [current, setCurrent] = useState(target);
    const startRef = useRef(target);
    const startTimeRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const start = startRef.current;
        if (start === target) return;
        startTimeRef.current = null;
        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCurrent(Math.round(start + (target - start) * eased));
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
            else startRef.current = target;
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);

    return current;
}

export function HRWorkforceAgent({ embedded = false, fireAlertActive = false }) {
    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mobilized, setMobilized] = useState(false);
    const [mobilizing, setMobilizing] = useState(false);

    const runScenario = async (slug) => {
        setLoading(true);
        setError(null);
        setMobilized(false);
        try {
            const res = await fetch(`http://127.0.0.1:5003/api/scenario/${slug}`, { method: 'POST' });
            if (!res.ok) throw new Error("Workforce Protocol Timeout - Verify Port 5003");
            const data = await res.json();
            setScenario({
                title: slug === 'holiday_shortage' ? 'Holiday Protocol' : slug === 'default' ? 'Regular Operations' : slug.charAt(0).toUpperCase() + slug.slice(1) + " Alert",
                risk: String(data.risk_level || 'UNKNOWN'),
                demand: Number(data.required_workers || 0),
                available: Number(data.available_workers || 0),
                gap: Number(data.gap || 0),
                skills: data.skills_required ? Object.keys(data.skills_required) : [],
                recommendation: String(data.recommendation || 'No automated recommendation available.'),
                explanation: String(data.explanation || 'Protocol standby.'),
                contractor: data.contractor_details || { name: 'None Required', score: 0, status: 'N/A' },
                isHoliday: data.holiday_mode === 1
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fireAlertActive || crisisEventBus.getLast('CRISIS_FIRE_DETECTED')) {
            runScenario('fire');
        } else {
            runScenario('default');
        }
    }, [fireAlertActive]);

    const handleMobilize = () => {
        if (!scenario || mobilized) return;
        setMobilizing(true);
        setTimeout(() => {
            setMobilizing(false);
            setMobilized(true);
            crisisEventBus.dispatch('CRISIS_WORKFORCE_DEPLOYED', { scenario: scenario.title });
        }, 1800);
    };

    // When mobilized: available → demand, gap → 0, risk → MANAGED
    const displayAvailable = mobilized ? scenario?.demand : scenario?.available;
    const displayGap = mobilized ? 0 : scenario?.gap;
    const displayRisk = mobilized ? 'MANAGED' : scenario?.risk;
    const animatedAvailable = useAnimatedNumber(displayAvailable || 0);
    const animatedGap = useAnimatedNumber(displayGap || 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6 pt-0">
            {!embedded && (
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-[25px] font-extrabold leading-tight text-shell-darkText uppercase tracking-tight">Workforce AI Terminal</h1>
                        <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mt-1">
                            Shell plc · HR Intelligence & Resource Allocation · <span className="text-shell-yellow">Wave 1 Deployment</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => runScenario('fire')} disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                            <ShieldAlert className="w-3.5 h-3.5" /> Fire Alert
                        </button>
                        <button onClick={() => runScenario('maintenance')} disabled={loading}
                            className="px-4 py-2 bg-shell-darkText text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded hover:bg-black transition-colors flex items-center gap-2 shadow-sm">
                            <Zap className="w-3.5 h-3.5" /> Maintenance
                        </button>
                        <button onClick={() => runScenario('holiday_shortage')} disabled={loading}
                            className="px-4 py-2 bg-amber-500 text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm">
                            <Globe className="w-3.5 h-3.5" /> Holiday Protocol
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <BrainCircuit className="w-12 h-12 text-shell-yellow animate-pulse mb-4" />
                        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.3em]">Synthesizing Resource Vectors...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] border border-red-200 rounded-lg bg-red-50/30">
                        <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                        <h3 className="text-[15px] font-extrabold text-shell-darkText uppercase tracking-tight">Agent Protocol Failure</h3>
                        <p className="font-mono text-[10px] text-red-600 uppercase tracking-widest mt-1">{error}</p>
                    </div>
                ) : scenario ? (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">

                        {/* ── Mobilization Success Banner ─────────────────────── */}
                        {mobilized && (
                            <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                <div>
                                    <div className="text-[12px] font-extrabold text-green-800 uppercase tracking-tight">Resource Mobilization Complete</div>
                                    <div className="font-mono text-[9px] text-green-600 uppercase tracking-widest mt-0.5">
                                        {scenario.contractor.name} · ETA: 45 min · Gap Closed · All roles filled
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── KPI Grid ─────────────────────────────────────────── */}
                        <div className={`grid ${embedded ? 'grid-cols-4 gap-2' : 'grid-cols-1 md:grid-cols-4 gap-4'}`}>
                            {/* Risk */}
                            <div className={`bg-white border border-gray-200 ${embedded ? 'p-2' : 'p-5'} rounded-lg relative overflow-hidden transition-all duration-700`}>
                                <div className={`absolute top-0 left-0 right-0 h-[1.5px] transition-colors duration-700 ${mobilized ? 'bg-green-500' : 'bg-red-600'} opacity-60`} />
                                <div className={`font-mono ${embedded ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1.5'} text-gray-500 tracking-widest uppercase flex justify-between`}>
                                    Risk <HardHat className="w-3 h-3 opacity-30" />
                                </div>
                                <div className={`${embedded ? 'text-[18px]' : 'text-[31px]'} font-extrabold leading-none uppercase transition-colors duration-700 ${mobilized ? 'text-green-600' : (displayRisk === 'HIGH' ? 'text-red-600' : 'text-amber-600')}`}>
                                    {displayRisk}
                                </div>
                                {!embedded && <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Severity Classification</div>}
                            </div>

                            {/* Demand */}
                            <div className={`bg-white border border-gray-200 ${embedded ? 'p-2' : 'p-5'} rounded-lg relative overflow-hidden`}>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20" />
                                <div className={`font-mono ${embedded ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1.5'} text-gray-500 tracking-widest uppercase`}>Demand</div>
                                <div className={`${embedded ? 'text-[18px]' : 'text-[31px]'} font-extrabold text-shell-darkText leading-none font-mono tracking-tighter`}>
                                    {scenario.demand}
                                </div>
                                {!embedded && <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Required Headcount</div>}
                            </div>

                            {/* Available — animates up to demand on mobilize */}
                            <div className={`bg-white ${mobilized ? 'border-green-300' : 'border-gray-200'} border ${embedded ? 'p-2' : 'p-5'} rounded-lg relative overflow-hidden transition-all duration-700`}>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20" />
                                <div className={`font-mono ${embedded ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1.5'} text-gray-500 tracking-widest uppercase`}>Available</div>
                                <div className={`${embedded ? 'text-[18px]' : 'text-[31px]'} font-extrabold leading-none font-mono tracking-tighter transition-colors duration-700 ${mobilized ? 'text-green-600' : 'text-shell-darkText'}`}>
                                    {animatedAvailable}
                                </div>
                                {!embedded && <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Headcount On-Site</div>}
                            </div>

                            {/* Gap — animates down to 0 on mobilize */}
                            <div className={`bg-white ${mobilized ? 'border-green-300' : 'border-gray-200'} border ${embedded ? 'p-2' : 'p-5'} rounded-lg relative overflow-hidden transition-all duration-700`}>
                                <div className={`absolute top-0 left-0 right-0 h-[1.5px] transition-colors duration-700 ${mobilized ? 'bg-green-500' : 'bg-amber-500'} opacity-60`} />
                                <div className={`font-mono ${embedded ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1.5'} text-gray-500 tracking-widest uppercase`}>Gap</div>
                                <div className={`${embedded ? 'text-[18px]' : 'text-[31px]'} font-extrabold leading-none font-mono tracking-tighter transition-colors duration-700 ${mobilized ? 'text-green-600' : 'text-red-600'}`}>
                                    {animatedGap}
                                </div>
                                {!embedded && <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Deployment Delta</div>}
                            </div>
                        </div>

                        {/* ── Main Cards ───────────────────────────────────────── */}
                        <div className={`grid ${embedded ? 'grid-cols-2 gap-2 mt-2 h-[270px]' : 'grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-stretch'}`}>

                            {/* AI Recommendation */}
                            <div className={`bg-white border border-gray-200 rounded-lg ${embedded ? 'p-3' : 'p-6'} relative overflow-hidden shadow-sm flex flex-col h-full`}>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-30" />
                                <div className={`flex items-center justify-between ${embedded ? 'mb-2' : 'mb-8'}`}>
                                    <div>
                                        <h3 className={`${embedded ? 'text-[11px]' : 'text-[15px]'} font-extrabold text-shell-darkText uppercase tracking-tight`}>AI Recommendation</h3>
                                        <div className={`font-mono ${embedded ? 'text-[8px] mt-0.5' : 'text-[9.5px] mt-1'} text-gray-400 tracking-widest uppercase`}>
                                            Scenario: {scenario.title} {scenario.isHoliday && <span className="text-amber-600 ml-1">● Holiday</span>}
                                        </div>
                                    </div>
                                </div>

                                <p className={`${embedded ? 'text-[10px] mb-2 leading-snug pl-2' : 'text-[14px] mb-6 leading-relaxed pl-4 line-clamp-3'} font-extrabold text-shell-darkText border-l-2 border-shell-yellow py-0.5 uppercase tracking-tight`}>
                                    {scenario.recommendation}
                                </p>

                                <div className={`overflow-y-auto no-scrollbar ${embedded ? 'mb-1' : 'mb-6'}`}>
                                    <div className={`bg-gray-50 rounded-lg border border-gray-100 ${embedded ? 'p-2' : 'p-5'}`}>
                                        <h4 className={`font-mono ${embedded ? 'text-[8px] mb-1' : 'text-[9px] mb-4'} text-gray-400 uppercase tracking-widest`}>Neural Logic Stream</h4>
                                        <p className={`${embedded ? 'text-[8px] leading-tight' : 'text-[12px] leading-relaxed'} font-mono text-shell-darkText`}>
                                            {scenario.explanation}
                                        </p>
                                    </div>
                                </div>

                                {!embedded && (
                                    <button
                                        onClick={handleMobilize}
                                        disabled={mobilized || mobilizing}
                                        className={`w-full py-4 font-mono text-[10px] uppercase font-black tracking-widest rounded flex items-center justify-center gap-2 border shadow-md shrink-0 mt-auto transition-all duration-500 ${
                                            mobilized
                                                ? 'bg-green-600 border-green-600 text-white cursor-default'
                                                : mobilizing
                                                    ? 'bg-shell-darkText border-gray-800 text-white opacity-70 cursor-wait'
                                                    : 'bg-shell-darkText border-gray-800 text-white hover:bg-black'
                                        }`}
                                    >
                                        {mobilized ? (
                                            <><CheckCircle2 className="w-4 h-4 text-white" /> Mobilization Complete</>
                                        ) : mobilizing ? (
                                            <><BrainCircuit className="w-4 h-4 text-shell-yellow animate-pulse" /> Authorizing Deployment...</>
                                        ) : (
                                            <>Authorize Resource Mobilization <ArrowRight className="w-4 h-4 text-shell-yellow" /></>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Skill-Set Grid + Contractor Intel */}
                            <div className={`bg-white border border-gray-200 rounded-lg ${embedded ? 'p-3' : 'p-6'} relative shadow-sm h-full flex flex-col no-scrollbar overflow-y-auto`}>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20" />
                                <div className={`flex items-center justify-between ${embedded ? 'mb-2' : 'mb-8'}`}>
                                    <h3 className={`${embedded ? 'text-[11px]' : 'text-[15px]'} font-extrabold text-shell-darkText uppercase tracking-tight`}>Skill-Set Grid</h3>
                                </div>

                                <div className={`flex flex-wrap ${embedded ? 'gap-1 mb-3' : 'gap-2 mb-8'} content-start`}>
                                    {scenario.skills.map((skill, i) => (
                                        <span key={i} className={`bg-gray-50 text-shell-darkText border border-gray-200 rounded font-mono uppercase font-bold tracking-widest hover:border-shell-yellow ${embedded ? 'px-1.5 py-0.5 text-[7px]' : 'px-2.5 py-1 text-[9px]'}`}>
                                            {skill}
                                        </span>
                                    ))}
                                    {scenario.skills.length === 0 && (
                                        <div className="w-full flex flex-col items-center justify-center opacity-30 py-2">
                                            <span className="font-mono text-[8px] uppercase tracking-widest">Scanning...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Contractor Intelligence Hub */}
                                <div className={`${embedded ? 'mb-2 p-2' : 'mb-8 p-5'} bg-gray-50/50 rounded-lg border border-gray-100 shadow-inner mt-auto`}>
                                    <h4 className={`${embedded ? 'text-[9px] mb-1.5' : 'text-[11px] mb-5'} font-extrabold text-shell-darkText uppercase tracking-tight`}>Contractor Intel</h4>
                                    <div className={`${embedded ? 'flex justify-between items-center' : 'space-y-4'}`}>
                                        <div className="flex items-center gap-2">
                                            {!embedded && (
                                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-100">
                                                    <Globe className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                            <div>
                                                <div className={`${embedded ? 'text-[10px]' : 'text-[13px]'} font-extrabold text-shell-darkText tracking-tight uppercase leading-none`}>{scenario.contractor.name}</div>
                                                <div className={`font-mono ${embedded ? 'text-[7.5px]' : 'text-[9px]'} text-gray-400 uppercase tracking-widest mt-1`}>
                                                    Status: <span className="text-green-600 font-bold">{mobilized ? 'Deployed ✓' : scenario.contractor.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`${embedded ? '' : 'flex items-center justify-between pt-3 border-t border-gray-100/50'}`}>
                                            {!embedded && <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Neural Match Score</div>}
                                            <div className={`${embedded ? 'text-[14px]' : 'text-[18px]'} font-extrabold text-shell-darkText leading-none font-mono tracking-tighter`}>
                                                {scenario.contractor.score}<span className={`${embedded ? 'text-[8px]' : 'text-[10px]'} opacity-40`}>/10</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${embedded ? 'pt-1.5' : 'pt-8 border-t border-gray-100'} shrink-0`}>
                                    <div className={`flex items-center justify-between font-mono ${embedded ? 'text-[8px] mb-1' : 'text-[10px] mb-3'} text-gray-400 uppercase tracking-widest`}>
                                        <span>Match Confidence</span>
                                        <span className="text-shell-darkText font-extrabold">98.4%</span>
                                    </div>
                                    <div className={`w-full ${embedded ? 'h-1' : 'h-1.5'} bg-gray-50 rounded-full overflow-hidden border border-gray-100`}>
                                        <div className="h-full bg-shell-yellow w-[98%] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(251,206,7,0.4)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[440px] border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                        <Users className="w-12 h-12 text-gray-200 mb-4 animate-pulse" />
                        <h3 className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Terminal Standby</h3>
                        <p className="font-mono text-[9px] text-gray-300 uppercase tracking-widest text-center px-20">
                            The Neural Workforce engine is awaiting instruction. <br/>
                            Initializing secure platform handshake protocols...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
