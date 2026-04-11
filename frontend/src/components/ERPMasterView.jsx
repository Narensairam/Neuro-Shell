import { Layers, CheckCircle2, Server, Globe2 } from 'lucide-react';
import { cn } from './Sidebar';

export function ERPMasterView() {
    const processes = [
        {
            name: "Record to Report (R2R)",
            category: "Finance",
            completion: 95,
            health: "green",
            systems: ["General Ledger", "Asset Accounting", "Cost Center"],
            highlights: ["Journal automation live", "Month-end close shortened 30%"]
        },
        {
            name: "Procure to Pay (P2P)",
            category: "Sourcing & Finance",
            completion: 65,
            health: "amber",
            systems: ["Vendor Mgmt", "Purchase Orders", "Invoice Processing"],
            highlights: ["Invoice AI matching rolling out", "Pending vendor portal sync"]
        },
        {
            name: "Order to Cash (O2C)",
            category: "Commercial",
            completion: 42,
            health: "amber",
            systems: ["Sales Quotes", "Billing", "AR Collections"],
            highlights: ["Billing engine legacy transition", "S/4HANA AR activated"]
        },
        {
            name: "Hire to Retire (H2R)",
            category: "Human Resources",
            completion: 90,
            health: "green",
            systems: ["Core HR", "Payroll", "Performance"],
            highlights: ["SuccessFactors integration complete"]
        },
        {
            name: "Design to Operate (D2O)",
            category: "Manufacturing",
            completion: 88,
            health: "green",
            systems: ["Plant Maintenance (PM)", "EHS", "Production Planning"],
            highlights: ["Predictive maintenance models feeding live S/4HANA tickets"]
        },
        {
            name: "Concept to Product (C2P)",
            category: "Engineering",
            completion: 30,
            health: "red",
            systems: ["PLM", "R&D Spend", "BOM Management"],
            highlights: ["Legacy data cleansing taking longer than 60 days"]
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <Server className="w-7 h-7 text-shell-darkText" />
                        Complete ERP Core Processes (S/4HANA)
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Enterprise Master Value Chains · Global Deployment View</div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Global Migration</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-shell-yellow w-[68%]"></div>
                        </div>
                        <span className="font-bold text-[11px]">68%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {processes.map((proc, i) => (
                    <div key={i} className="bg-white border text-left border-gray-200 rounded-xl p-5 hover:border-amber-400 transition-colors shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-mono text-[9px] text-gray-400 tracking-widest uppercase mb-1">{proc.category}</div>
                                <h3 className="font-bold text-[15px] text-shell-darkText">{proc.name}</h3>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold",
                                proc.health === 'green' ? "bg-green-100 text-green-700" :
                                    proc.health === 'amber' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            )}>
                                {proc.completion}% LIVE
                            </div>
                        </div>

                        <div className="w-full h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
                            <div className={cn(
                                "h-full",
                                proc.health === 'green' ? "bg-green-500" :
                                    proc.health === 'amber' ? "bg-amber-500" : "bg-red-500"
                            )} style={{ width: `${proc.completion}%` }}></div>
                        </div>

                        <div className="mb-4 flex-1">
                            <div className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2">Deployed Modules</div>
                            <div className="flex flex-wrap gap-1.5">
                                {proc.systems.map((sys, k) => (
                                    <span key={k} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10.5px] text-gray-600 font-medium">
                                        {sys}
                                    </span>
                                ))}
                                <span className="px-2 py-1 border border-dashed border-gray-300 rounded text-[10.5px] text-gray-400">+ Modules pending</span>
                            </div>
                        </div>

                        <div className={cn(
                            "p-2.5 rounded border-l-2 text-[11px] leading-snug",
                            proc.health === 'green' ? "bg-green-50 border-green-500 text-green-800" :
                                proc.health === 'amber' ? "bg-amber-50 border-amber-500 text-amber-800" : "bg-red-50 border-red-500 text-red-800"
                        )}>
                            <div className="flex gap-1.5 items-start">
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <div>
                                    {proc.highlights.map((h, x) => <div key={x}>{h}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="font-extrabold text-[15px] mb-4 flex items-center gap-2"><Globe2 className="w-4 h-4" /> Global Instance Rollout Status</h2>
                <div className="grid grid-cols-4 gap-4 text-[15px] font-mono text-[11px]">
                    <div className="flex flex-col gap-2">
                        <div className="text-gray-500 uppercase tracking-widest font-bold">EMEA (Rotterdam)</div>
                        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded font-bold">100% Deployed — Stabilized</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-gray-500 uppercase tracking-widest font-bold">APAC (Singapore)</div>
                        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded font-bold">100% Deployed — Post Go-Live Support</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-gray-500 uppercase tracking-widest font-bold">Americas (Houston)</div>
                        <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold">Wave 2 Active — Data Migration</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-gray-500 uppercase tracking-widest font-bold">LATAM (Rio)</div>
                        <div className="p-3 bg-gray-50 text-gray-500 border border-gray-200 rounded font-bold">Wave 3 — Discovery & PlanningPhase</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
