import { Bell, Activity } from 'lucide-react';
import { cn } from './Sidebar';
import { useState, useEffect } from 'react';

const rolesList = [
    { id: 'executive', label: 'C-Suite' },
    { id: 'operator', label: 'Operator' },
    { id: 'datascientist', label: 'CoE / AI' },
    { id: 'itops', label: 'IT Ops' }
];

export function Header({ role, setRole, setCurrentView }) {
    const [hasFire, setHasFire] = useState(false);
    const [isNewAlert, setIsNewAlert] = useState(false);

    useEffect(() => {
        let t;
        const NEURO_SHELL_ORIGIN = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';
        const fetchFire = async () => {
            try {
                const res = await fetch(`${NEURO_SHELL_ORIGIN}/api/fire/alerts`);
                if (res.ok) {
                    const data = await res.json();
                    const fire = data.some(a => a.type === 'FIRE');
                    if (fire) {
                        setHasFire(prev => {
                            if (!prev) {
                                setIsNewAlert(true);
                                setTimeout(() => setIsNewAlert(false), 60000);
                            }
                            return fire;
                        });
                    } else {
                        setHasFire(false);
                        setIsNewAlert(false);
                    }
                }
            } catch { setHasFire(false); }
        };
        fetchFire();
        t = setInterval(fetchFire, 2000);
        return () => clearInterval(t);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 h-[58px] z-50 flex items-center justify-between px-5 bg-white/95 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center gap-6">
                <a href="#" className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/src/assets/shell-logo.png" alt="Neuro Shell Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[18px] leading-tight text-shell-darkText tracking-tight">Neuro <span className="text-shell-red">Shell</span></div>
                        <div className="font-mono text-[9.5px] text-gray-500 uppercase tracking-widest mt-0.5">Enterprise AI OS</div>
                    </div>
                </a>

                <div className="w-px h-6 bg-gray-200"></div>

                <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-md p-1">
                    {rolesList.map(r => (
                        <button
                            key={r.id}
                            onClick={() => { setRole(r.id); setCurrentView('command'); }}
                            className={cn(
                                "px-3 py-1 text-[10.5px] font-mono uppercase tracking-widest rounded-sm transition-all",
                                role === r.id ? "bg-shell-darkText text-shell-yellow font-semibold" : "text-gray-500 hover:text-shell-darkText"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                    47 Models Live
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-600">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        hasFire ? `bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] ${isNewAlert ? 'animate-pulse' : ''}` : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    )}></div>
                    {hasFire ? 4 : 3} Alerts
                </div>
                <button onClick={() => setCurrentView('alerts')} className="px-3 py-1.5 border border-gray-200 rounded-md font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:border-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                    ⚠ Alerts
                </button>
            </div>
        </header>
    );
}
