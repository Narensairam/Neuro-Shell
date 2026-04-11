import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export function ROIDashboardView() {
    const data = [
        { name: 'Supply Chain', value: 45 },
        { name: 'Manufacturing', value: 35 },
        { name: 'IT Ops', value: 15 },
        { name: 'HR/Safety', value: 5 },
    ];
    const COLORS = ['#22c55e', '#fbce07', '#3b82f6', '#f97316'];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[25px] font-extrabold flex items-center gap-2 tracking-tight">
                        <span className="text-[21px]">$</span> ROI Dashboard
                    </h1>
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">Value Realization Tracking · Target $2B</div>
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Value Delivered YTD</div>
                    <div className="text-[31px] font-extrabold text-green-600 leading-none">$180<span className="text-[15px] text-gray-400 font-normal ml-1">M</span></div>
                    <div className="font-mono text-[10px] text-green-600 mt-1">↑ Above target by 12%</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Cost to Serve Reduction</div>
                    <div className="text-[31px] font-extrabold text-shell-darkText leading-none">4.2<span className="text-[15px] text-gray-400 font-normal ml-1">%</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Enterprise-wide</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">Working Capital Freed</div>
                    <div className="text-[31px] font-extrabold text-shell-yellow leading-none">$62<span className="text-[15px] text-gray-400 font-normal ml-1">M</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Via better demand sensing</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1.5">IT Budget Reinvested</div>
                    <div className="text-[31px] font-extrabold text-blue-600 leading-none">$84<span className="text-[15px] text-gray-400 font-normal ml-1">M</span></div>
                    <div className="font-mono text-[10px] text-gray-500 mt-1">Tech debt rationalization</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">Value by Domain</h2>
                    <div className="flex items-center h-[200px]">
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie data={data} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 pl-4 space-y-3">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div><div className="text-[13px] font-bold w-24">Supply Chain</div><div className="font-mono text-[11px] text-gray-500">$81M</div></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-shell-yellow"></div><div className="text-[13px] font-bold w-24">Manufacturing</div><div className="font-mono text-[11px] text-gray-500">$63M</div></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div><div className="text-[13px] font-bold w-24">IT Ops</div><div className="font-mono text-[11px] text-gray-500">$27M</div></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500"></div><div className="text-[13px] font-bold w-24">HR / Safety</div><div className="font-mono text-[11px] text-gray-500">$9M</div></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-extrabold text-[15px] mb-4">Top Value Drivers</h2>
                    <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-2">
                            <div className="text-[13px] font-bold">Unplanned Downtime Reduction (Manufacturing)</div>
                            <div className="flex justify-between items-end mt-1">
                                <div className="text-[11px] text-gray-500">Targeting 35% reduction</div>
                                <div className="font-mono text-[12px] font-bold text-green-600">+$42M YTD</div>
                            </div>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <div className="text-[13px] font-bold">Marine Fleet Route Optimization (Supply Chain)</div>
                            <div className="flex justify-between items-end mt-1">
                                <div className="text-[11px] text-gray-500">Saving 8.2% on fuel costs</div>
                                <div className="font-mono text-[12px] font-bold text-green-600">+$38M YTD</div>
                            </div>
                        </div>
                        <div className="border-b border-gray-100 pb-2">
                            <div className="text-[13px] font-bold">L1 Ticket Deflection (IT Operations)</div>
                            <div className="flex justify-between items-end mt-1">
                                <div className="text-[11px] text-gray-500">42% automated resolution</div>
                                <div className="font-mono text-[12px] font-bold text-green-600">+$18M YTD</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
