import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ship, Clock, AlertTriangle, Package, Truck, ClipboardList, Globe, TrendingUp, Map, BarChart2, Cpu } from 'lucide-react';
import { RouteOptimizationView } from './RouteOptimizationView';
import { crisisEventBus } from '../context/CrisisEventBus';

const EMPTY_SC = {
    optimalRoutesAdopted: 0,
    inventoryChart: [],
    logisticsAlerts: []
};

export function SupplyChainView() {
    const [data, setData] = useState(EMPTY_SC);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        let isMounted = true;
        fetch('http://localhost:5000/api/supplychain')
            .then(res => res.json())
            .then(d => { 
                if (isMounted) {
                    // Injecting Crisis logic on top of live data
                    if (crisisEventBus.getLast('CRISIS_WORKFORCE_DEPLOYED')) {
                        return {
                            ...d,
                            logisticsAlerts: [
                                { 
                                    type: 'Infrastructure Damage', 
                                    message: 'Fire Incident has severed primary route access to Zone D logistics node. 48hr delay expected.', 
                                    severity: 'High',
                                    isCrisis: true
                                },
                                ...d.logisticsAlerts
                            ]
                        };
                    }
                    setData(d); 
                }
            })
            .catch(() => { if (isMounted) setData(EMPTY_SC); });

        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const handleDemoTab = (e) => {
            if (e.detail?.view === 'supplychain' && e.detail?.tab) {
                setActiveTab(e.detail.tab);
            }
        };
        window.addEventListener('DEMO_GOTO_TAB', handleDemoTab);
        return () => window.removeEventListener('DEMO_GOTO_TAB', handleDemoTab);
    }, []);

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full overflow-hidden flex flex-col p-6">
            <header className="flex justify-between items-start mb-6 shrink-0 px-1">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <Ship className="w-7 h-7 text-shell-yellow" />
                        Supply Chain & Logistics
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Marine Route Optimization · Demand Sensing</div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold border border-green-200">System Live</span>
            </header>

            {/* Horizontal Tabs */}
            <div className="flex gap-0 border-b border-gray-200 shrink-0">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart2 },
                    { id: 'routes', label: 'Route Optimization', icon: Map },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id
                            ? 'border-shell-yellow text-shell-darkText'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'routes' ? (
                <div className="flex-1 min-h-0">
                    <RouteOptimizationView />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4 pt-4">
                    <div className="grid grid-cols-5 gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Fleet Cost Reduction</div>
                            <div className="text-[31px] font-extrabold text-green-600 leading-none">8.2<span className="text-[15px] text-green-400 font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> AI optimized</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">On-Time Shipment</div>
                            <div className="text-[31px] font-extrabold text-blue-600 leading-none">94.2<span className="text-[15px] font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-blue-500 mt-1 uppercase font-bold tracking-tighter">↑ Target Achieved</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Contractor Adherence</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none">88.5<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-amber-600 mt-1 uppercase font-bold tracking-tighter">! Audit Needed</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Route Adoption Rate</div>
                            <div className="text-[31px] font-extrabold text-shell-darkText leading-none">{data.optimalRoutesAdopted}<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                            <div className="font-mono text-[10px] text-gray-500 mt-1">AI Recommendation Engine</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Carbon Footprint Saved</div>
                            <div className="text-[31px] font-extrabold text-cyan-600 leading-none">12.4<span className="text-[15px] font-normal ml-1">kT</span></div>
                            <div className="font-mono text-[10px] text-gray-500 mt-1">Emission Reduction Pathway</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_340px] gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-[13px] font-extrabold text-shell-darkText mb-6 uppercase tracking-tight">Inventory Health Intelligence</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.inventoryChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="day"
                                            tick={{ fontSize: 10, fill: '#6b7280' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                            tickLine={{ stroke: '#e5e7eb' }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: '#6b7280' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                            tickLine={{ stroke: '#e5e7eb' }}
                                            label={{ value: 'Stock Level', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
                                        />
                                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="level" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-shell-yellow" /> Logistics Alerts
                            </h4>
                            <div className="space-y-4">
                                {data.logisticsAlerts.map((a, i) => (
                                    <div key={i} className={`p-4 rounded-lg border flex gap-3 ${a.severity === 'High' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                        <div className="p-2 bg-white rounded-md border border-gray-200 h-fit">
                                            {a.type === 'Weather' ? <Clock className="w-4 h-4 text-blue-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-[11px] font-bold uppercase tracking-tight mb-0.5 ${a.severity === 'High' ? 'text-red-700' : 'text-amber-700'}`}>{a.type} Event</div>
                                            <div className={`text-[10px] leading-relaxed ${a.severity === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{a.message}</div>
                                            {a.isCrisis && (
                                                <button 
                                                    onClick={() => crisisEventBus.dispatch('CRISIS_SUPPLY_DELAYED', true)}
                                                    className="mt-3 text-white font-bold text-[9px] bg-red-800 hover:bg-black px-3 py-1.5 rounded inline-flex items-center gap-2 transition-colors uppercase tracking-widest shadow-md border border-red-500/50"
                                                >
                                                    <Cpu className="w-3 h-3 text-red-500" />
                                                    Route Constraint to Pricing Engine
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5 lg:col-span-2">
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[13px] font-extrabold text-shell-darkText uppercase tracking-tight">Operational Adherence & Contractor Sync</h4>
                                <div className="font-mono text-[10px] text-blue-600 font-bold uppercase py-1 px-3 bg-blue-50 rounded border border-blue-100 italic">Neural Adherence Enabled</div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {[
                                        { label: 'Maersk Global Fleet', adherence: '96%', items: '42 assets en route', color: 'bg-green-500' },
                                        { label: 'Shell Maritime (Self)', adherence: '98%', items: '24 assets en route', color: 'bg-green-500' },
                                        { label: 'Independent Contractors', adherence: '74%', items: '36 assets en route', color: 'bg-amber-500' }
                                    ].map((fleet, i) => (
                                        <div key={i} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-black text-slate-700 uppercase">{fleet.label}</span>
                                                <span className={`text-[11px] font-black font-mono ${parseInt(fleet.adherence) > 90 ? 'text-green-600' : 'text-amber-600'}`}>{fleet.adherence}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${fleet.color} transition-all duration-1000`} style={{ width: fleet.adherence }}></div>
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">{fleet.items}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-center">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Average Fleet Adherence</div>
                                    <div className="flex justify-center items-end gap-2 mb-4">
                                        <div className="text-[42px] font-black text-slate-800 leading-none tracking-tighter">88.5<span className="text-[18px] text-slate-400 ml-1 font-normal">%</span></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase border-b border-white/50 pb-1.5">
                                            <span className="text-slate-400">Total Shipments (MT)</span>
                                            <span className="text-slate-800">1.2M</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase border-b border-white/50 pb-1.5">
                                            <span className="text-slate-400">Target Sync Rate</span>
                                            <span className="text-slate-800">92.0%</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase">
                                            <span className="text-slate-400">Neural Confidence</span>
                                            <span className="text-green-600 font-mono">High (99%)</span>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h4 className="text-[11px] font-extrabold text-shell-darkText uppercase tracking-widest mb-4">Port Operations MTTR</h4>
                            <div className="space-y-3">
                                {['Rotterdam', 'Singapore', 'Houston', 'Dubai'].map((port, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-gray-500">{port}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 bg-gray-100 h-1 rounded-full overflow-hidden">
                                                <div className="bg-shell-yellow h-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-shell-darkText font-mono">2.4h</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-5 border-t border-gray-100">
                                <h4 className="text-[11px] font-extrabold text-shell-darkText uppercase tracking-widest mb-4 text-center">Marine Supply Resilience</h4>
                                <div className="text-center">
                                    <div className="text-[31px] font-black text-green-600 leading-none">99.9<span className="text-[14px] text-green-400 font-normal ml-1">%</span></div>
                                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter mt-1">Cross-Fleet Availability</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
