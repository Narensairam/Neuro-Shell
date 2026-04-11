import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Ship, Zap, Fuel, Wind, RefreshCw, Navigation,
    AlertTriangle, Clock, Package, DollarSign, TrendingDown, Activity
} from 'lucide-react';

const AI_SERVICE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createShipIcon(color, heading, isHovered) {
    const size = isHovered ? 44 : 34;
    const pulse = isHovered ? `<circle cx="20" cy="20" r="17" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>` : '';
    const glow = isHovered ? `filter="url(#glow)"` : '';
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"
        style="transform:rotate(${heading}deg);transform-origin:center;transition:transform 0.5s">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${pulse}
      <polygon points="20,4 29,36 20,29 11,36" fill="${color}" stroke="rgba(255,255,255,0.9)"
        stroke-width="${isHovered ? 2 : 1.5}" ${glow} opacity="1"/>
    </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

// ─── Floating Tooltip (React Portal, mouse-tracked) ───────────────────────────
function FloatingTooltip({ vessel, mousePos }) {
    const v = vessel;
    if (!v || !mousePos) return null;
    const fuelPct = Math.round((v.fuelConsumed / v.fuelTotal) * 100);

    // Smart positioning — flip left/up near screen edges
    const W = window.innerWidth, H = window.innerHeight;
    const tipW = 330, tipH = 560;
    let left = mousePos.x + 18;
    let top = mousePos.y - 20;
    if (left + tipW > W - 20) left = mousePos.x - tipW - 18;
    if (top + tipH > H - 20) top = H - tipH - 20;
    if (top < 10) top = 10;

    return (
        <div
            style={{
                position: 'fixed', left, top, width: tipW, zIndex: 9999,
                pointerEvents: 'auto',
                boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 30px ${v.color}33`,
                fontFamily: 'inherit',
            }}
            className="bg-[#0f1117] border border-white/15 rounded-xl overflow-hidden text-white"
        >
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${v.color}22, ${v.color}08)`, borderBottom: `2px solid ${v.color}` }}
                className="px-4 pt-3.5 pb-2.5">
                <div className="flex items-center gap-2.5">
                    <div style={{ backgroundColor: v.color }} className="w-3 h-3 rounded-full shadow-lg flex-shrink-0"></div>
                    <span className="text-[14px] font-black tracking-tight">{v.name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase bg-white/10 text-white/80 whitespace-nowrap">{v.flag} {v.type}</span>
                </div>
                <div className="mt-1 text-[10px] text-white/50 font-mono">{v.origin?.name} → {v.destination?.name}</div>
            </div>

            <div className="px-4 py-3 space-y-3">
                {/* Route Progress */}
                <div>
                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase mb-1.5">
                        <span>Route Progress</span><span className="text-white">{v.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div style={{ width: `${v.progress || 0}%`, backgroundColor: v.color }}
                            className="h-full rounded-full transition-all duration-500"></div>
                    </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Navigation className="w-3 h-3 text-cyan-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Speed</span>
                        </div>
                        <div className="text-[14px] font-black">{v.speed} <span className="text-[10px] text-gray-400">kn</span></div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            <span className="text-[8px] text-gray-500 uppercase">ETA</span>
                        </div>
                        <div className="text-[11px] font-black leading-tight">{v.etaFormatted}</div>
                        <div className="text-[9px] text-gray-500">{v.etaTime}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5 col-span-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Package className="w-3 h-3 text-purple-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Cargo</span>
                        </div>
                        <div className="text-[11px] font-black">{v.cargo}</div>
                        <div className="text-[9px] text-gray-500">{v.cargoTonnage?.toLocaleString()} MT capacity</div>
                    </div>
                </div>

                {/* Fuel */}
                <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <Fuel className="w-3 h-3 text-orange-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Fuel Consumption</span>
                        </div>
                        <span className="text-[9px] text-gray-400">{v.fuelConsumed?.toLocaleString()} / {v.fuelTotal?.toLocaleString()} MT</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                        <div style={{ width: `${fuelPct}%` }}
                            className={`h-full rounded-full ${fuelPct > 70 ? 'bg-red-500' : fuelPct > 40 ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                    </div>
                    <div className="text-[9px] text-gray-500">{v.fuelRate} MT/day · {fuelPct}% consumed</div>
                </div>

                {/* AI Savings */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                        <TrendingDown className="w-3 h-3 text-green-400" />
                        <span className="text-[9px] font-black text-green-400 uppercase">AI Route Savings</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                                <DollarSign className="w-3 h-3 text-green-400" />
                                <span className="text-[12px] font-black text-green-400">
                                    ${v.costSaved ? (v.costSaved / 1000).toFixed(0) + 'K' : '—'}
                                </span>
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">Cost Saved</div>
                        </div>
                        <div className="text-center border-x border-white/10">
                            <div className="text-[12px] font-black text-green-400">
                                {v.fuelSavedMT ? v.fuelSavedMT + ' MT' : '—'}
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">Fuel Saved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[12px] font-black text-cyan-400">
                                {v.timeSavedHours ? v.timeSavedHours + 'h' : '—'}
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">Time Saved</div>
                        </div>
                    </div>
                </div>

                {/* Traffic & Rerouting */}
                {v.trafficZone && (
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Activity className="w-3 h-3 text-blue-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Traffic Zone</span>
                        </div>
                        <div className="text-[9px] text-blue-300">{v.trafficZone}</div>
                        {v.nearbyHotspots && v.nearbyHotspots !== 'Clear' && (
                            <div className="text-[8px] text-gray-500 mt-0.5">{v.nearbyHotspots}</div>
                        )}
                    </div>
                )}

                {v.reroutingStatus !== 'None' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[9px] font-black text-amber-300 uppercase">AI Rerouting Active</div>
                                <div className="text-[9px] text-amber-400/80">{v.reroutingReason}</div>
                                {v.reroutingDetour && (
                                    <div className="text-[8px] text-amber-500/60 mt-0.5">{v.reroutingDetour}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-[8px] text-gray-600 border-t border-white/5 pt-2 font-mono">
                    <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${v.dataSource === 'AIS_LIVE' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                        {v.dataSource === 'AIS_LIVE' ? 'AISStream Live' : 'Simulation Mode'}
                    </span>
                    <span>{v.weatherAdvisory}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Map mouse tracker ────────────────────────────────────────────────────────
function MouseTracker({ onMove }) {
    useMapEvents({ mousemove: (e) => onMove({ x: e.originalEvent.clientX, y: e.originalEvent.clientY }) });
    return null;
}

// ─── Map FlyTo ────────────────────────────────────────────────────────────────
function MapFlyTo({ vessel }) {
    const map = useMap();
    useEffect(() => {
        if (vessel) map.flyTo([vessel.lat, vessel.lng], 5, { duration: 1.2 });
    }, [vessel?.mmsi]);
    return null;
}

// ─── KPI Bar ─────────────────────────────────────────────────────────────────
function KpiBar({ vessels }) {
    const avgSpeed = vessels.length
        ? (vessels.reduce((s, v) => s + parseFloat(v.speed || 0), 0) / vessels.length).toFixed(1)
        : '--';
    const totalCostSaved = vessels.reduce((s, v) => s + (v.costSaved || 0), 0);
    const totalFuelSaved = vessels.reduce((s, v) => s + (v.fuelSavedMT || 0), 0);

    return (
        <div className="flex items-center gap-6 px-6 py-2.5 bg-[#0a0c10] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
                <Ship className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Vessels</span>
                <span className="text-[14px] font-black text-white ml-1">{vessels.length}</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Avg Speed</span>
                <span className="text-[14px] font-black text-white ml-1">{avgSpeed} <span className="text-[10px] text-gray-500">kn</span></span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Cost Saved</span>
                <span className="text-[14px] font-black text-green-400 ml-1">${(totalCostSaved / 1000).toFixed(0)}K</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
                <Fuel className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Fuel Saved</span>
                <span className="text-[14px] font-black text-orange-400 ml-1">{totalFuelSaved} <span className="text-[10px] text-gray-500">MT</span></span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">AI Rerouting</span>
                <span className="text-[13px] font-black text-amber-400 ml-1">{vessels.filter(v => v.reroutingStatus !== 'None').length} active</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-[9px] font-mono text-yellow-400 uppercase">Simulation Live</span>
                <span className="text-[8px] text-gray-600 ml-1">· Set AISSTREAM_KEY for real AIS</span>
            </div>
        </div>
    );
}

// ─── Legend ──────────────────────────────────────────────────────────────────
function MapLegend({ vessels }) {
    return (
        <div className="absolute bottom-6 left-6 z-[1000] bg-[#0a0c10]/95 backdrop-blur-md border border-white/10 rounded-xl p-3.5 min-w-[190px] shadow-2xl pointer-events-none">
            <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2.5">Fleet Legend</div>
            {vessels.map(v => (
                <div key={v.mmsi} className="flex items-center gap-2 mb-2">
                    <div style={{ backgroundColor: v.color }} className="w-2.5 h-2.5 rounded-full shrink-0"></div>
                    <span className="text-[10px] font-bold text-white truncate">{v.name}</span>
                    {v.reroutingStatus !== 'None' && (
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0 ml-auto" />
                    )}
                </div>
            ))}
            <div className="border-t border-white/10 mt-2.5 pt-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-white/40 rounded flex-shrink-0"></div>
                    <span className="text-[8px] text-gray-500">Traveled route</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 border-t-2 border-dashed border-white/25 flex-shrink-0"></div>
                    <span className="text-[8px] text-gray-500">AI optimized route</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                    <span className="text-[8px] text-gray-500">Active rerouting</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RouteOptimizationView() {
    const [vessels, setVessels] = useState([]);
    const [hoveredVessel, setHoveredVessel] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    const fetchVessels = useCallback(async () => {
        try {
            const res = await fetch(`${AI_SERVICE}/api/routes/vessels`);
            if (res.ok) {
                const data = await res.json();
                setVessels(data);
                setLoading(false);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchVessels();
        intervalRef.current = setInterval(fetchVessels, 5000);
        return () => clearInterval(intervalRef.current);
    }, [fetchVessels]);

    const handleMouseMove = useCallback((pos) => setMousePos(pos), []);
    const handleMarkerEnter = useCallback((v) => setHoveredVessel(v), []);
    const handleMarkerLeave = useCallback(() => setHoveredVessel(null), []);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#0a0c10] text-white h-full">
            <div className="text-center">
                <Ship className="w-10 h-10 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <div className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Initializing Route Intelligence...</div>
            </div>
        </div>
    );

    return (
        // This outer div fills exactly the space given by SupplyChainView, no extra padding
        <div className="flex flex-col h-full" style={{ background: '#0a0c10' }}>
            <KpiBar vessels={vessels} />

            <div className="flex-1 relative" style={{ minHeight: 0 }}>
                <MapContainer
                    center={[20, 20]}
                    zoom={3}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    preferCanvas={true}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="© CartoDB"
                        maxZoom={18}
                    />

                    <MouseTracker onMove={handleMouseMove} />
                    <MapFlyTo vessel={hoveredVessel} />

                    {vessels.map(v => (
                        <div key={v.mmsi}>
                            {v.trail?.length > 1 && (
                                <Polyline positions={v.trail}
                                    pathOptions={{ color: v.color, weight: 2.5, opacity: 0.6 }} />
                            )}
                            {v.remaining?.length > 1 && (
                                <Polyline positions={v.remaining}
                                    pathOptions={{ color: v.color, weight: 2, opacity: 0.8, dashArray: '10, 8' }} />
                            )}
                            {v.optimizedWaypoints?.length > 1 && (
                                <Polyline positions={v.optimizedWaypoints}
                                    pathOptions={{ color: v.color, weight: 1, opacity: 0.15 }} />
                            )}
                            <Marker
                                position={[v.lat, v.lng]}
                                icon={createShipIcon(v.color, v.heading, hoveredVessel?.mmsi === v.mmsi)}
                                eventHandlers={{
                                    mouseover: () => handleMarkerEnter(v),
                                    mouseout: handleMarkerLeave,
                                    click: () => handleMarkerEnter(hoveredVessel?.mmsi === v.mmsi ? null : v),
                                }}
                            />
                        </div>
                    ))}
                </MapContainer>

                <MapLegend vessels={vessels} />

                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(8,10,16,0.45) 100%)',
                        zIndex: 999
                    }} />
            </div>

            {/* Floating tooltip — rendered OUTSIDE map, in fixed position, always visible */}
            {hoveredVessel && (
                <FloatingTooltip vessel={hoveredVessel} mousePos={mousePos} />
            )}
        </div>
    );
}
