import { useState, useEffect } from 'react';
import { 
    Users, AlertTriangle, CheckCircle, TrendingUp, Search, 
    BrainCircuit, Zap, ArrowRight, ShieldAlert, Target,
    HardHat, Briefcase, Award, Globe
} from 'lucide-react';
import { crisisEventBus } from '../context/CrisisEventBus';

export function HRWorkforceAgent() {
    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runScenario = async (slug) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:5003/api/scenario/${slug}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("Workforce Protocol Timeout - Verify Port 5003");
            const data = await res.json();
            
            // Comprehensive backend mapping
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

    // Auto-initialize
    useEffect(() => {
        if (crisisEventBus.getLast('CRISIS_FIRE_DETECTED')) {
            runScenario('fire');
        } else {
            runScenario('default');
        }
    }, []);

    const SkillChip = ({ name }) => (
        <span className="px-2.5 py-1 bg-gray-50 text-shell-darkText border border-gray-200 rounded font-mono text-[9px] uppercase font-bold tracking-widest hover:border-shell-yellow transition-colors">
            {name}
        </span>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6 pt-0">
            {/* Control Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-[25px] font-extrabold leading-tight text-shell-darkText uppercase tracking-tight">Workforce AI Terminal</h1>
                    <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mt-1">
                        Shell plc · HR Intelligence & Resource Allocation · <span className="text-shell-yellow">Wave 1 Deployment</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => runScenario('fire')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <ShieldAlert className="w-3.5 h-3.5" /> Fire Alert
                    </button>
                    <button 
                        onClick={() => runScenario('maintenance')}
                        disabled={loading}
                        className="px-4 py-2 bg-shell-darkText text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Zap className="w-3.5 h-3.5" /> Maintenance
                    </button>
                    <button 
                        onClick={() => runScenario('holiday_shortage')}
                        disabled={loading}
                        className="px-4 py-2 bg-amber-500 text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Globe className="w-3.5 h-3.5" /> Holiday Protocol
                    </button>
                </div>
            </div>

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
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden group">
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-red-600 opacity-60"></div>
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5 flex justify-between">
                                    Anomaly Risk <HardHat className="w-3 h-3 opacity-30" />
                                </div>
                                <div className={`text-[31px] font-extrabold leading-none uppercase ${scenario.risk === 'HIGH' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {scenario.risk}
                                </div>
                                <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Severity Classification</div>
                            </div>
                            <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Staffing Demand</div>
                                <div className="text-[31px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">
                                    {scenario.demand}
                                </div>
                                <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Required Headcount</div>
                            </div>
                            <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Availability</div>
                                <div className="text-[31px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">
                                    {scenario.available}
                                </div>
                                <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Headcount On-Site</div>
                            </div>
                            <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-amber-500 opacity-60"></div>
                                <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Resource Gap</div>
                                <div className="text-[31px] font-extrabold text-red-600 leading-none font-mono tracking-tighter">
                                    {scenario.gap}
                                </div>
                                <div className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Deployment Delta</div>
                            </div>
                        </div>

                        {/* Main Intelligence Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
                            <div className="space-y-4">
                                {/* AI Recommendation Card */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden shadow-sm">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-30"></div>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-[15px] font-extrabold text-shell-darkText uppercase tracking-tight">AI Deployment Recommendation</h3>
                                            <div className="font-mono text-[9.5px] text-gray-400 tracking-widest uppercase mt-1">
                                                Scenario: {scenario.title} {scenario.isHoliday && <span className="text-amber-600 ml-2">● Holiday Mode Active</span>}
                                            </div>
                                        </div>
                                        <Target className="w-5 h-5 text-shell-yellow" />
                                    </div>
                                    
                                    <p className="text-[14px] font-extrabold text-shell-darkText leading-relaxed mb-6 border-l-2 border-shell-yellow pl-4 py-1 uppercase tracking-tight">
                                        {scenario.recommendation}
                                    </p>
                                    
                                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-100 mb-6">
                                        <h4 className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-4">Neural Logic Stream</h4>
                                        <p className="text-[12px] font-mono text-shell-darkText leading-relaxed">
                                            {scenario.explanation}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => crisisEventBus.dispatch('CRISIS_WORKFORCE_DEPLOYED', { scenario: scenario.title })}
                                        className="w-full py-4 bg-shell-darkText text-white font-mono text-[10px] uppercase font-black tracking-widest rounded hover:bg-black transition-all flex items-center justify-center gap-2 border border-gray-800 shadow-md"
                                    >
                                        Authorize Resource Mobilization <ArrowRight className="w-4 h-4 text-shell-yellow" />
                                    </button>
                                </div>

                                {/* Contractor Intelligence Card */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden shadow-sm group">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-shell-yellow" /> Contractor Intelligence Hub
                                        </h3>
                                        <span className="font-mono text-[9px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded uppercase font-bold tracking-widest">Verified Vendor</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-8 items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 group-hover:border-shell-yellow transition-colors">
                                                <Globe className="w-8 h-8 text-gray-300 group-hover:text-shell-yellow transition-colors" />
                                            </div>
                                            <div>
                                                <div className="text-[16px] font-extrabold text-shell-darkText tracking-tight uppercase leading-none">{scenario.contractor.name}</div>
                                                <div className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mt-1.5">Strategy Node Alpha</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-l border-gray-100 pl-8">
                                            <div className="text-center">
                                                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-1">Compatability</div>
                                                <div className="text-[24px] font-extrabold text-shell-darkText leading-none font-mono tracking-tighter">
                                                    {scenario.contractor.score}<span className="text-[12px] opacity-40">/10</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-1">Status</div>
                                                <div className="text-[12px] font-extrabold text-green-600 uppercase mt-2 tracking-tight">{scenario.contractor.status}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Skill-Set Grid */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden shadow-sm h-full flex flex-col">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-[15px] font-extrabold text-shell-darkText uppercase tracking-tight">Required Skill-Set Grid</h3>
                                        <Award className="w-5 h-5 text-shell-yellow" />
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
                                        {scenario.skills.map((skill, i) => (
                                            <SkillChip key={i} name={skill} />
                                        ))}
                                        {scenario.skills.length === 0 && (
                                            <div className="w-full flex flex-col items-center justify-center py-10 opacity-30">
                                                <Search className="w-8 h-8 mb-2" />
                                                <span className="font-mono text-[10px] uppercase tracking-widest">Scanning Competencies...</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="pt-8 border-t border-gray-100">
                                        <div className="flex items-center justify-between font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-3">
                                            <span>AI Skill-Match Confidence</span>
                                            <span className="text-shell-darkText font-extrabold">98.4%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                            <div className="h-full bg-shell-yellow w-[98%] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(251,206,7,0.4)]"></div>
                                        </div>
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
