import { useEffect, useState } from 'react';
import { crisisEventBus } from '../context/CrisisEventBus';
import { ShieldAlert, Users, Truck, DollarSign, ArrowRight, Activity, Zap, CheckCircle } from 'lucide-react';

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
            }, 3000);
        };

        const handleWorkforce = (data) => {
            setActiveAlert({
                title: 'NOTIFICATION SENT',
                message: 'Contractor notified successfully. Resource mobilization initiated.',
                icon: CheckCircle,
                classes: {
                    border: 'border-green-600',
                    bgAccent: 'bg-green-50',
                    borderAccent: 'border-green-100',
                    text: 'text-green-600',
                    textHeading: 'text-green-700',
                    bgLine: 'bg-green-500'
                }
            });
            setTimeout(() => {
                setActiveAlert(null);
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
        <div className="fixed top-6 right-6 z-[99999] animate-in slide-in-from-right-10 fade-in duration-500">
            <div className={`bg-white border-l-4 ${activeAlert.classes.border} rounded shadow-xl p-3 flex items-center gap-3 max-w-[320px] relative overflow-hidden`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeAlert.classes.bgAccent}`}>
                    <Icon className={`w-4 h-4 ${activeAlert.classes.text}`} />
                </div>
                <div className="flex-1">
                    <h3 className={`${activeAlert.classes.textHeading} font-black text-[10px] tracking-widest uppercase font-mono leading-none mb-1`}>{activeAlert.title}</h3>
                    <div className="text-gray-700 font-bold text-[12px] uppercase tracking-tight leading-tight">
                        {activeAlert.message}
                    </div>
                </div>
            </div>
        </div>
    );
}
