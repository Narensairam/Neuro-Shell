import { useEffect, useState } from 'react';
import { crisisEventBus } from '../context/CrisisEventBus';
import { ShieldAlert, Users, Truck, DollarSign, ArrowRight, Activity, Zap } from 'lucide-react';

export function CrisisOrchestrator({ setCurrentView }) {
    const [activeAlert, setActiveAlert] = useState(null);

    useEffect(() => {
        const handleFire = (data) => {
            setActiveAlert({
                title: 'CRISIS PIPELINE TRIGGERED',
                message: 'Damage assessed. Routing constraint to HR Workforce Agent...',
                icon: ShieldAlert,
                classes: {
                    border: 'border-red-600',
                    bgAccent: 'bg-red-50',
                    borderAccent: 'border-red-100',
                    text: 'text-red-600',
                    textHeading: 'text-red-700',
                    bgLine: 'bg-red-500'
                }
            });
            setTimeout(() => {
                setActiveAlert(null);
                setCurrentView('hr');
            }, 3000);
        };

        const handleWorkforce = (data) => {
            setActiveAlert({
                title: 'WORKFORCE DEPLOYED',
                message: 'Contractors En Route. Supply Chain Disruption Detected. Routing...',
                icon: Truck,
                classes: {
                    border: 'border-amber-600',
                    bgAccent: 'bg-amber-50',
                    borderAccent: 'border-amber-100',
                    text: 'text-amber-600',
                    textHeading: 'text-amber-700',
                    bgLine: 'bg-amber-500'
                }
            });
            setTimeout(() => {
                setActiveAlert(null);
                setCurrentView('supplychain');
            }, 3000);
        };

        const handleSupply = (data) => {
            setActiveAlert({
                title: 'SUPPLY CHAIN COMPROMISED',
                message: 'Forwarding material constraints to Commercial Pricing Engine...',
                icon: DollarSign,
                classes: {
                    border: 'border-blue-600',
                    bgAccent: 'bg-blue-50',
                    borderAccent: 'border-blue-100',
                    text: 'text-blue-600',
                    textHeading: 'text-blue-700',
                    bgLine: 'bg-blue-500'
                }
            });
            setTimeout(() => {
                setActiveAlert(null);
                setCurrentView('commercial');
            }, 3000);
        };

        crisisEventBus.on('CRISIS_FIRE_DETECTED', handleFire);
        crisisEventBus.on('CRISIS_WORKFORCE_DEPLOYED', handleWorkforce);
        crisisEventBus.on('CRISIS_SUPPLY_DELAYED', handleSupply);

        return () => {
            crisisEventBus.remove('CRISIS_FIRE_DETECTED', handleFire);
            crisisEventBus.remove('CRISIS_WORKFORCE_DEPLOYED', handleWorkforce);
            crisisEventBus.remove('CRISIS_SUPPLY_DELAYED', handleSupply);
        };
    }, [setCurrentView]);

    if (!activeAlert) return null;

    const Icon = activeAlert.icon;

    return (
        <div className="fixed top-20 right-1/2 translate-x-1/2 z-[99999] animate-in slide-in-from-top-10 fade-in duration-500">
            <div className={`bg-white border-b-4 ${activeAlert.classes.border} rounded-lg shadow-2xl p-5 flex items-start gap-4 min-w-[420px] relative overflow-hidden group`}>
                <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${activeAlert.classes.bgLine} opacity-60`}></div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${activeAlert.classes.bgAccent} border ${activeAlert.classes.borderAccent}`}>
                    <Icon className={`w-6 h-6 ${activeAlert.classes.text}`} />
                </div>
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className={`w-3.5 h-3.5 ${activeAlert.classes.text} animate-pulse`} />
                        <h3 className={`${activeAlert.classes.textHeading} font-black text-[13px] tracking-widest uppercase font-mono`}>{activeAlert.title}</h3>
                    </div>
                    <div className="text-gray-700 font-extrabold text-[15px] uppercase tracking-tight leading-snug">
                        {activeAlert.message}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-gray-400" />
                        <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Multi-Agent Sync Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
