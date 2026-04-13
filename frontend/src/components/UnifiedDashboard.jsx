import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './Sidebar';

export function UnifiedDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5007/api/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shell-red"></div>
            </div>
        );
    }

    // Dummy chart data for rendering
    const chartData = Array.from({ length: 7 }).map((_, i) => ({
        name: `Day ${i + 1}`,
        value: 4000 + Math.random() * 2000,
    }));

    const metrics = [
        { label: 'Global Revenue ($M)', value: data.revenue, trend: '+2.4%', icon: TrendingUp },
        { label: 'Plant Efficiency', value: `${data.efficiency}%`, trend: '+1.1%', icon: Activity },
        { label: 'Active Incidents', value: data.incidents, trend: '-2', icon: AlertTriangle, alert: data.incidents > 0 },
        { label: 'Production (BPD)', value: data.production.toLocaleString(), trend: '+5%', icon: CheckCircle },
    ];

    return (
        <div className="space-y-6 pb-20">
            <header className="mb-8">
                <h1 className="text-[31px] font-bold text-gray-900 tracking-tight">{data.title}</h1>
                <p className="text-gray-500 mt-1">Real-time enterprise overview and aggregated AI insights.</p>
            </header>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={cn(
                            "glass-panel p-5 relative overflow-hidden group",
                            metric.alert && "border-shell-red/50 bg-red-50/50"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <metric.icon className={cn("w-5 h-5", metric.alert ? "text-shell-red" : "text-gray-600")} />
                            </div>
                            <span className={cn("text-[13px] font-semibold px-2 py-1 rounded-full",
                                metric.trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {metric.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-[15px] font-medium">{metric.label}</h3>
                        <p className="text-[25px] font-bold text-gray-900 mt-1">{metric.value}</p>

                        {/* Decorative background element */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6 lg:col-span-2 flex flex-col hidden sm:flex"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-[19px] font-semibold text-gray-900">Total Enterprise Value Generation</h2>
                            <p className="text-[15px] text-gray-500">AI-optimized outcomes tracking</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 text-[15px] rounded-md px-3 py-1.5 focus:ring-shell-yellow focus:border-shell-yellow outline-none text-gray-700">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <div className="h-72 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dd1d21" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbce07" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#dd1d21" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Modules Status List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel p-6 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[19px] font-semibold text-gray-900">Module Health</h2>
                        <div className="text-[13px] bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                            System: {data.overallHealth}
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                        {data.modules.map((mod, i) => (
                            <div key={mod.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="text-[15px] font-semibold text-gray-800">{mod.name}</h4>
                                    <p className="text-[13px] text-gray-500">{mod.status}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[15px] font-medium">{mod.health}%</span>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full", mod.health < 80 ? "bg-shell-red" : mod.health < 90 ? "bg-shell-yellow" : "bg-green-500")}
                                            style={{ width: `${mod.health}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
