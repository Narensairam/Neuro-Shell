import { useState, useEffect } from 'react';
import { Layers, Activity, ShieldAlert, Search, Globe, Cpu, Binary, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

export function ITOpsAgent({ setCurrentView }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('http://localhost:5004/api/metrics/summary');
                if (res.ok) {
                    const data = await res.json();
                    setSummary(data);
                }
            } catch (err) {
                console.error("Failed to fetch ITOps summary:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
        const interval = setInterval(fetchSummary, 15000); // 15 sec refresh
        return () => clearInterval(interval);
    }, []);

    const ModuleCard = ({ title, description, icon: Icon, tag, value, trend, trendColor = 'text-green-600', targetView }) => (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-shell-yellow transition-all h-full">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-shell-yellow to-transparent opacity-20"></div>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-shell-darkText group-hover:bg-shell-yellow/10 transition-colors">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">{tag}</span>
                        <span className="font-mono text-[14px] font-extrabold text-shell-darkText mt-0.5">{value}</span>
                    </div>
                </div>
                
                <h3 className="text-[15px] font-extrabold text-shell-darkText tracking-tight uppercase mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 text-[11px] font-medium leading-relaxed tracking-tight line-clamp-2 uppercase opacity-80">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <button 
                    onClick={() => targetView && setCurrentView(targetView)}
                    className="font-mono text-[9px] font-black text-shell-darkText uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-shell-yellow transition-colors"
                >
                    Access Hub <ChevronRight className="w-2.5 h-2.5" />
                </button>
                <div className={`font-mono text-[9px] font-bold ${trendColor} bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-widest`}>
                    {trend}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6 pt-0">
            {/* Standardized Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-[25px] font-extrabold leading-tight text-shell-darkText">Command Hub</h1>
                    <div className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mt-1">
                        Shell plc · IT Infrastructure & Industrial AIOps · Environment: Alpha Production
                    </div>
                </div>
                <div className="flex gap-16 items-center shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[9px] font-black text-gray-400 uppercase tracking-widest">Platform Status</span>
                        <div className="flex gap-2 items-center mt-1">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>Operational
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[9px] font-black text-gray-400 uppercase tracking-widest">Deflection Rate</span>
                        <span className="text-[28px] font-extrabold text-shell-darkText leading-none mt-1">
                            {summary?.deflection_rate || '--'}<span className="text-[14px] text-gray-400 font-normal ml-0.5">%</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <ModuleCard 
                        title="Ticket Intelligence"
                        description="Enterprise service incident ingestion with embedded semantic deflection logic."
                        icon={Layers}
                        tag="Incidents"
                        value={loading ? '...' : `${summary?.total_tickets || 0}`}
                        trend="+12% Vol"
                        targetView="alerts"
                    />
                    <ModuleCard 
                        title="Predictive Monitoring"
                        description="Forensic telemetry auditing with equipment-level failure probability forecasting."
                        icon={Activity}
                        tag="Metrics"
                        value="4.2k/sec"
                        trend="Healthy"
                        targetView="digitaltwin"
                    />
                    <ModuleCard 
                        title="OT Threat Detection"
                        description="Cyber-physical event detection for industrial protocol streams (OPC-UA, Modbus)."
                        icon={ShieldAlert}
                        tag="Security"
                        value={loading ? '...' : `${summary?.ot_threats || 0}`}
                        trendColor="text-red-600"
                        trend="Critical"
                        targetView="compliance"
                    />
                    <ModuleCard 
                        title="Asset Audit Discovery"
                        description="Automated digital perimeter scanning to locate unmanaged shadow infrastructure."
                        icon={Search}
                        tag="Assets"
                        value={loading ? '...' : `${summary?.shadow_devices || 0}`}
                        trend="Syncing"
                        targetView="digitaltwin"
                    />
                </div>

                <div className="grid grid-cols-4 gap-4 px-2 mb-4">
                    {[
                        { label: 'Cloud Latency', value: '14ms', icon: Globe },
                        { label: 'Compute Usage', value: '42%', icon: Cpu },
                        { label: 'Data Efficacy', value: '98%', icon: Binary },
                        { label: 'Compliance', value: 'ISO-27001', icon: ShieldCheck }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100">
                            <div className="w-9 h-9 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-mono text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                <span className="text-[16px] font-extrabold text-shell-darkText uppercase mt-1.5">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Automation Tip Card matching the new look */}
                <div className="bg-amber-50/40 border border-amber-200 rounded-lg p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-shell-yellow flex items-center justify-center text-shell-darkText shadow-sm">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-extrabold text-[14px] text-shell-darkText uppercase tracking-tight">Closed-Loop Automation Active</div>
                            <div className="font-mono text-[10px] text-amber-700 tracking-widest uppercase mt-0.5">Deflecting 1.2k human interactions per hour via Neural Orchestrator</div>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-shell-darkText text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-black transition-colors">
                        Configure Automation
                    </button>
                </div>
            </div>
        </div>
    );
}
