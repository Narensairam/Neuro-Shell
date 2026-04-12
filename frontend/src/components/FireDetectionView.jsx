import { useEffect, useState, useRef } from 'react';
import {
    AlertTriangle,
    Flame,
    Shield,
    LayoutGrid,
    Video,
    HardHat,
    Cpu,
    Activity,
    Bot,
    Loader2,
    ExternalLink,
    X
} from 'lucide-react';
import { crisisEventBus } from '../context/CrisisEventBus';

const FIRE_UI_ORIGIN = import.meta.env.VITE_FIRE_DETECTION_URL || 'http://localhost:5002';
const NEURO_SHELL_ORIGIN = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

export function FireDetectionView() {
    const [stats, setStats] = useState({
        compliance_rate_pct: 0,
        ppe_violations: 0,
        fire_hazards: 0
    });
    const [alerts, setAlerts] = useState([]);
    const [fireAlert, setFireAlert] = useState(null);
    const [time, setTime] = useState('');
    const [retryKey, setRetryKey] = useState(0);
    const fireAlertTimeout = useRef(null);
    const orchestratorTriggered = useRef(false);

    // Crisis Orchestrator Bridge
    useEffect(() => {
        if (fireAlert && !orchestratorTriggered.current) {
            orchestratorTriggered.current = true;
            // Delay slightly to allow the UI to show before jumping
            setTimeout(() => {
                 crisisEventBus.dispatch('CRISIS_FIRE_DETECTED', fireAlert);
            }, 3000);
        }
    }, [fireAlert]);

    // Clock
    useEffect(() => {
        const updateClock = () => setTime(new Date().toLocaleTimeString());
        const t = setInterval(updateClock, 1000);
        updateClock();
        return () => clearInterval(t);
    }, []);

    // Lifecycle
    useEffect(() => {
        let isCancelled = false;

        // Start python process
        fetch(`${NEURO_SHELL_ORIGIN}/api/fire/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        }).catch(err => console.error("Failed to start fire detection node:", err));

        const pollData = async () => {
            if (isCancelled) return;
            try {
                const statsRes = await fetch(`${NEURO_SHELL_ORIGIN}/api/fire/stats`);
                if (statsRes.ok) setStats(await statsRes.json());

                const alertsRes = await fetch(`${NEURO_SHELL_ORIGIN}/api/fire/alerts`);
                if (alertsRes.ok) {
                    const data = await alertsRes.json();
                    setAlerts(data);

                    setRetryKey(prev => prev === 0 ? Date.now() : prev);

                    const fire = data.find(a => a.type === 'FIRE');
                    if (fire) {
                        setFireAlert({
                            camera_id: fire.camera_id,
                            confidence: Math.round(fire.confidence * 100)
                        });
                        if (fireAlertTimeout.current) clearTimeout(fireAlertTimeout.current);
                        fireAlertTimeout.current = setTimeout(() => setFireAlert(null), 5000);
                    }
                }
            } catch (err) {
                // Ignore errors gracefully as python server takes time to start
            }
        };

        const t = setInterval(pollData, 3000);
        pollData();

        return () => {
            isCancelled = true;
            clearInterval(t);
            // Stop python process immediately on unmount via non-blocking Beacon
            navigator.sendBeacon(`${NEURO_SHELL_ORIGIN}/api/fire/stop`, 'stop');
        };
    }, []);

    const isCritical = stats.fire_hazards > 0;

    return (
        <div className="flex-1 w-full h-full bg-slate-50 text-shell-darkText font-sans overflow-hidden flex flex-col select-none relative animate-in fade-in duration-300">
            {/* Global Fire Alert Overlay */}
            {fireAlert && (
                <div className="absolute top-6 right-6 z-[50] animate-pulse">
                    <div className="bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.6)] border-2 border-red-400 rounded-lg p-5 flex items-start gap-4 min-w-[360px]">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-inner">
                            <Flame className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 pr-6 relative">
                                <AlertTriangle className="w-4 h-4 text-white" />
                                <h3 className="text-white font-black text-lg tracking-widest uppercase">FIRE DETECTED</h3>
                                <button
                                    onClick={() => {
                                        setFireAlert(null);
                                        fetch(`${NEURO_SHELL_ORIGIN}/api/fire/normalize`, { method: 'POST' }).catch(() => { });
                                    }}
                                    className="absolute right-0 top-0 text-white/70 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-red-100 font-mono text-xs uppercase tracking-widest mb-2">
                                Node: {fireAlert.camera_id} // CONFIDENCE: {fireAlert.confidence}%
                            </div>
                            <button 
                                onClick={() => crisisEventBus.dispatch('CRISIS_FIRE_DETECTED', fireAlert)}
                                className="text-white font-bold text-[10px] bg-red-800 hover:bg-black px-3 py-1.5 rounded inline-flex items-center gap-2 transition-colors uppercase tracking-widest shadow-md border border-red-500/50"
                            >
                                <Cpu className="w-3.5 h-3.5 text-red-500" />
                                Initiate Agentic Swarm Workflow
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden min-h-0 pt-4">

                {/* Main Content */}
                <main className="flex-1 bg-slate-50 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-shell-red" />
                            <h2 className="text-sm font-black uppercase tracking-tighter">Live Surveillance Grid — 04 Monitoring Nodes</h2>
                        </div>
                    </div>

                    {/* Cam Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'CAM_01', zone: 'ZONE-A', type: 'live' },
                            { id: 'CAM_07', zone: 'ZONE-B', type: 'ppe' },
                            { id: 'CAM_11', zone: 'ZONE-C', type: 'intrusion' },
                            { id: 'CAM_02', zone: 'ZONE-D', type: 'clear' }
                        ].map((cam, idx) => (
                            <div key={cam.id} className={`relative aspect-[16/9.5] ${cam.type === 'live' ? 'bg-black/5 border-slate-200' : 'bg-[#0b0c10] border-transparent shadow-xl'} rounded-xl overflow-hidden border shadow-sm group flex items-center justify-center`}>

                                {cam.type === 'live' && (
                                    <>
                                        <img
                                            key={`${cam.id}-${retryKey}`}
                                            src={`${FIRE_UI_ORIGIN}/video_feed/${cam.id}?t=${retryKey}`}
                                            className="absolute inset-0 w-full h-full object-cover z-0 bg-black/10"
                                            alt={`Feed ${cam.id}`}
                                        />
                                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            {cam.id} / {cam.zone}
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            REC
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 h-12 flex items-end z-10">
                                            <div className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                LIVE FEED — Refinery North Gate
                                            </div>
                                        </div>
                                    </>
                                )}

                                {cam.type === 'ppe' && (
                                    <>
                                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            {cam.id} / {cam.zone}
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                            REC
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center gap-16 translate-y-2">
                                            <div className="flex flex-col items-center opacity-80">
                                                <div className="w-9 h-9 rounded-full bg-[#834f3c]"></div>
                                                <div className="w-10 h-20 bg-[#354363] rounded-t-lg mt-1"></div>
                                                <div className="flex gap-2">
                                                    <div className="w-4 h-12 bg-[#25304a]"></div>
                                                    <div className="w-4 h-12 bg-[#25304a]"></div>
                                                </div>
                                                <div className="absolute w-32 h-5 bg-[#2a3652] -z-10 top-20 rounded-sm"></div>
                                            </div>
                                            <div className="flex flex-col items-center opacity-80">
                                                <div className="w-10 h-6 outline outline-4 outline-[#0b0c10] rounded-t-full bg-[#ffc300] border-b-4 border-[#ff5733] relative">
                                                    <div className="absolute -bottom-3 inset-x-0 h-4 bg-[#f8b284] rounded-b-full"></div>
                                                </div>
                                                <div className="w-10 h-20 bg-[#354363] rounded-t-md mt-4"></div>
                                                <div className="flex gap-2">
                                                    <div className="w-4 h-12 bg-[#25304a]"></div>
                                                    <div className="w-4 h-12 bg-[#25304a]"></div>
                                                </div>
                                                <div className="absolute w-32 h-5 bg-[#2a3652] -z-10 top-20 rounded-sm"></div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 h-9 bg-[#d97706] flex items-center px-4 z-20">
                                            <div className="text-[10px] font-black text-white uppercase tracking-wider">
                                                <AlertTriangle className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                                                PPE VIOLATION — Worker without helmet · Zone B · Conf: 87%
                                            </div>
                                        </div>
                                    </>
                                )}

                                {cam.type === 'intrusion' && (
                                    <>
                                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            {cam.id} / {cam.zone}
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                            REC
                                        </div>
                                        <div className="absolute inset-5 border border-dashed border-[#b91c1c]/40 flex flex-col p-3 z-0">
                                            <div className="text-[10px] font-mono text-[#7f1d1d] font-bold uppercase tracking-widest mt-6 bg-[#0b0c10] px-2 self-start absolute -top-9">RESTRICTED — HIGH RISK</div>
                                            <div className="flex-1 flex items-center justify-around translate-y-[15%] px-5">
                                                <div className="w-20 h-20 rounded-full border border-blue-900/10 flex items-center justify-center text-[8px] text-[#25304a] font-black tracking-widest">CHEM STORE</div>
                                                <div className="flex flex-col items-center opacity-60">
                                                    <div className="w-7 h-7 rounded-full bg-[#25304a]"></div>
                                                    <div className="w-9 h-14 bg-[#25304a] rounded-t-lg mt-1 relative">
                                                        <div className="absolute top-2 -left-2 w-3 h-10 bg-[#1c2438] rounded-l-md"></div>
                                                        <div className="absolute top-2 -right-2 w-3 h-10 bg-[#1c2438] rounded-r-md"></div>
                                                    </div>
                                                </div>
                                                <div className="w-20 h-20 rounded-full border border-blue-900/10 flex items-center justify-center text-[8px] text-[#25304a] font-black tracking-widest">CHEMICAL</div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 h-9 bg-[#2563eb] flex items-center px-4 z-20">
                                            <div className="text-[10px] font-black text-white uppercase tracking-wider flex items-center">
                                                <AlertTriangle className="w-3.5 h-3.5 text-[#ffc300] inline mr-2 -mt-0.5 opacity-80" />
                                                INTRUSION — Restricted Chemical Zone · Conf: 88%
                                            </div>
                                        </div>
                                    </>
                                )}

                                {cam.type === 'clear' && (
                                    <>
                                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            {cam.id} / {cam.zone}
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded text-[9px] font-black text-gray-800 shadow-md uppercase font-mono z-10">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                            REC
                                        </div>
                                        <div className="absolute inset-0 flex items-end justify-center gap-16 pb-12">
                                            <div className="absolute inset-x-0 bottom-8 h-24 flex items-end justify-around opacity-5">
                                                <div className="w-20 h-full bg-white"></div>
                                                <div className="w-16 h-16 bg-white"></div>
                                                <div className="w-24 h-20 bg-white"></div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-16 bg-[#12141a]"></div>
                                            <div className="flex flex-col items-center relative z-10 scale-[0.8] translate-y-3">
                                                <div className="w-10 h-6 outline outline-4 outline-[#0b0c10] rounded-t-full bg-[#ffc300] border-b-4 border-[#ff5733] relative">
                                                    <div className="absolute -bottom-3 inset-x-0 h-4 bg-[#f8b284] rounded-b-full"></div>
                                                </div>
                                                <div className="w-10 h-16 bg-[#354363] rounded-t-md mt-4"></div>
                                                <div className="absolute w-20 h-4 bg-[#2a3652] -z-10 top-16 rounded-sm"></div>
                                            </div>
                                            <div className="flex flex-col items-center relative z-10">
                                                <div className="w-10 h-6 outline outline-4 outline-[#0b0c10] rounded-t-full bg-[#ffc300] border-b-4 border-[#ff5733] relative">
                                                    <div className="absolute -bottom-3 inset-x-0 h-4 bg-[#f8b284] rounded-b-full"></div>
                                                </div>
                                                <div className="w-10 h-20 bg-[#354363] rounded-t-md mt-4"></div>
                                                <div className="absolute w-24 h-5 bg-[#2a3652] -z-10 top-16 rounded-sm"></div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 h-9 bg-[#10b981] flex items-center px-4 z-20">
                                            <div className="text-[10px] font-black text-white uppercase tracking-wider">
                                                ✓ ALL CLEAR — 2 workers · Full PPE compliant · No hazards
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:scale-[1.02] cursor-default">
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Safety Compliance</div>
                            <div className="text-2xl font-black text-green-600">{stats.compliance_rate_pct || 100}%</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:scale-[1.02] cursor-default">
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">PPE Violations</div>
                            <div className="text-2xl font-black text-orange-500">{stats.ppe_violations || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:scale-[1.02] cursor-default">
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Fire Hazards</div>
                            <div className="text-2xl font-black text-red-600">{stats.fire_hazards || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:scale-[1.02] cursor-default">
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Node Status</div>
                            <div className={`text-2xl font-black uppercase ${isCritical ? 'text-red-600' : 'text-blue-600'}`}>{isCritical ? 'CRITICAL' : 'Clear'}</div>
                        </div>
                    </div>
                </main>

                {/* Right Panel Telemetry */}
                <aside className="w-[340px] bg-white border-l border-gray-200 flex flex-col relative z-20 shrink-0">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider">AI Copilot</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span className="text-[9px] font-bold text-green-600 uppercase">Streaming Telemetry</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                <div className="grid grid-cols-4 bg-slate-100/50 p-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Time</span>
                                    <span>Node</span>
                                    <span className="col-span-2 text-right">Event Status</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {alerts.length > 0 ? (
                                        alerts.slice(0, 15).map((a, i) => {
                                            const isFire = a.type === 'FIRE';
                                            return (
                                                <div key={i} className="grid grid-cols-4 p-2 text-[10px] items-center hover:bg-white transition-colors">
                                                    <span className="font-mono text-slate-400">{a.timestamp}</span>
                                                    <span className="font-black">{a.camera_id}</span>
                                                    <span className={`col-span-2 text-right font-bold ${isFire ? 'text-red-600' : 'text-orange-500'}`}>
                                                        {isFire ? 'FIRE DETECTED' : 'PPE VIOLATION'} {Math.round(a.confidence * 100)}%
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-slate-300">
                                            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Awaiting Datastream...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
