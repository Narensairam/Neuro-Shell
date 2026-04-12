import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from 'react';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

import {
    LayoutDashboard,
    Database,
    Bell,
    Network,
    Factory,
    Ship,
    TrendingUp,
    CircleDollarSign,
    HardHat,
    ShieldCheck,
    Globe,
    SquareStack,
    Diamond,
    Scale,
    Users,
    DollarSign,
    HeartPulse,
    Activity,
    Flame
} from "lucide-react";

const groups = [
    {
        label: "Command",
        items: [
            { id: "command", icon: <LayoutDashboard size={18} />, label: "Control Tower", roles: ['executive', 'operator', 'datascientist', 'itops'] },
            { id: "models", icon: <Database size={18} />, label: "Model Registry", badge: "47", badgeType: "green", roles: ['executive', 'datascientist'] },
            { id: "alerts", icon: <Bell size={18} />, label: "Alert Center", badge: "3", badgeType: "red", roles: ['executive', 'operator', 'datascientist', 'itops'] },
        ]
    },
    {
        label: "Strategic Domains",
        items: [
            { id: "digitaltwin", icon: <Network size={18} />, label: "Asset Digital Twin", badge: "Live", badgeType: "green", roles: ['executive', 'operator'] },
            { id: "manufacturing", icon: <Factory size={18} />, label: "Industrial Ops & Refining", roles: ['executive', 'operator'] },
            { id: "supplychain", icon: <Ship size={18} />, label: "Global Logistics & Marine", roles: ['executive', 'operator'] },
            { id: "commercial", icon: <TrendingUp size={18} />, label: "Energy Trading & Risk", roles: ['executive', 'operator'] },
            { id: "finance", icon: <CircleDollarSign size={18} />, label: "Group Finance & Strategy", roles: ['executive'] },
            { id: "hr", icon: <HardHat size={18} />, label: "Workforce & HSE Safety", roles: ['executive', 'operator'] },
            { id: "itops", icon: <ShieldCheck size={18} />, label: "System Ops & Cyber", roles: ['executive', 'itops'] },
            { id: "governance", icon: <Scale size={18} />, label: "Governance and Compliance", badge: "Active", badgeType: "green", roles: ['executive', 'datascientist', 'itops'] }
        ]
    },
    {
        label: "Intelligence",
        items: [
            { id: "topology", icon: <Network size={18} />, label: "Agentic Topology", roles: ['executive', 'itops', 'datascientist'] },
            { id: "roi", icon: <DollarSign size={18} />, label: "ROI Dashboard", roles: ['executive'] }
        ]
    }
];

export function Sidebar({ currentView, setCurrentView, role }) {
    const [hasFire, setHasFire] = useState(false);

    useEffect(() => {
        let t;
        const NEURO_SHELL_ORIGIN = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';
        const fetchFire = async () => {
            try {
                const res = await fetch(`${NEURO_SHELL_ORIGIN}/api/fire/alerts`);
                if (res.ok) {
                    const data = await res.json();
                    setHasFire(data.some(a => a.type === 'FIRE'));
                }
            } catch { setHasFire(false); }
        };
        fetchFire();
        t = setInterval(fetchFire, 2000);
        return () => clearInterval(t);
    }, []);

    const isCSuite = role === 'executive';

    // Filter groups based on the active role
    const visibleGroups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(role)).map(item => {
            if (item.id === 'alerts') {
                return { ...item, badge: hasFire ? "4" : "3" };
            }
            return item;
        })
    })).filter(group => group.items.length > 0);

    return (
        <aside className="w-[240px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col z-40 relative">
            <div className="p-4 pt-6">
                <div className="p-3 border border-amber-200 rounded-md bg-amber-50/50">
                    <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">Neuro Health</div>
                    <div className="flex items-center gap-3">
                        {/* Heart Battery SVG */}
                        <div className="relative flex-shrink-0">
                            <svg width="52" height="48" viewBox="0 0 52 48" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id="heartClip">
                                        <path d="M26 44 C26 44 4 28 4 15 C4 8.4 9.4 3 16 3 C20 3 23.5 5 26 8.4 C28.5 5 32 3 36 3 C42.6 3 48 8.4 48 15 C48 28 26 44 26 44 Z" />
                                    </clipPath>
                                    <linearGradient id="heartFill" x1="0" y1="1" x2="0" y2="0">
                                        <stop offset="0%" stopColor="#22c55e" />
                                        <stop offset="87%" stopColor="#22c55e" />
                                        <stop offset="87%" stopColor="#f3f4f6" />
                                        <stop offset="100%" stopColor="#f3f4f6" />
                                    </linearGradient>
                                </defs>
                                {/* Heart fill (battery level) */}
                                <rect x="0" y="0" width="52" height="48" fill="url(#heartFill)" clipPath="url(#heartClip)" />
                                {/* Heart outline */}
                                <path d="M26 44 C26 44 4 28 4 15 C4 8.4 9.4 3 16 3 C20 3 23.5 5 26 8.4 C28.5 5 32 3 36 3 C42.6 3 48 8.4 48 15 C48 28 26 44 26 44 Z" fill="none" stroke="#dd1d21" strokeWidth="2.5" />
                                {/* Percentage text inside heart */}
                                <text x="26" y="26" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="800" fill="#111827" fontFamily="monospace">87%</text>
                            </svg>
                            {/* Pulsing ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-30 pointer-events-none" style={{ borderRadius: '50%', margin: '4px' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[31px] font-extrabold text-shell-yellow leading-none tracking-tighter">
                                87<span className="text-[19px] text-gray-400 font-normal">%</span>
                            </div>
                            <div className="text-[11px] text-green-600 font-medium mt-1">↑ Wave 1 — 62%</div>
                            <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Level 4 · Optimal</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 pb-4">
                {visibleGroups.map((group, i) => (
                    <div key={i} className="mb-4">
                        <div className="px-5 mb-2 font-mono text-[10px] tracking-widest uppercase text-gray-400">{group.label}</div>
                        {group.items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={cn(
                                    "flex items-center gap-3 px-5 py-2.5 cursor-pointer text-[13.5px] transition-all border-l-2",
                                    currentView === item.id
                                        ? item.id === 'commercial' 
                                            ? "bg-blue-50/50 border-shell-blue text-shell-blue font-semibold"
                                            : "bg-amber-50/50 border-shell-yellow text-shell-darkText font-semibold"
                                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-shell-darkText"
                                )}
                            >
                                <div className={cn(
                                    "w-5 text-center flex-shrink-0",
                                    currentView === item.id 
                                        ? item.id === 'commercial' ? "text-shell-blue" : "text-shell-yellow"
                                        : "text-gray-400"
                                )}>
                                    {item.icon}
                                </div>
                                <div>{item.label}</div>
                                {item.badge && (
                                    <div className={cn(
                                        "ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full font-bold",
                                        item.badgeType === 'green' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                    )}>
                                        {item.badge}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-shell-yellow to-amber-500 flex items-center justify-center font-bold text-[15px] shadow-inner text-white">
                        {role === 'executive' ? 'CE' : role === 'operator' ? 'OP' : role === 'datascientist' ? 'DS' : 'IT'}
                    </div>
                    <div>
                        <div className="text-[13px] font-semibold text-shell-darkText tracking-tight">
                            {role === 'executive' ? 'C-Suite View' : role === 'operator' ? 'Operator View' : role === 'datascientist' ? 'CoE View' : 'IT Ops View'}
                        </div>
                        <div className="font-mono text-[10.5px] text-gray-500">
                            {role === 'executive' ? 'Executive Leadership' : role === 'operator' ? 'Plant Operations' : role === 'datascientist' ? 'Data Science' : 'Systems Operations'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
