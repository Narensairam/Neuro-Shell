/**
 * Neuro Shell — Route Optimization Agent
 * Real-time AIS vessel tracking via AISStream.io WebSocket.
 * Falls back to enriched simulation if no API key is set.
 */

const express = require('express');
const router = express.Router();
const WebSocket = require('ws');

// ─── Vessel Configuration ─────────────────────────────────────────────────────
// These are real Shell tanker MMSIs for AISStream subscription
const TRACKED_VESSELS = [
    {
        mmsi: '235091488',
        name: 'MT Turmoil',
        type: 'LNG Tanker',
        flag: '🇬🇧',
        cargo: 'Liquefied Natural Gas',
        cargoTonnage: 138000,
        origin: { name: 'Rotterdam, NL', lat: 51.9225, lng: 4.4792 },
        destination: { name: 'Yokohama, JP', lat: 35.4437, lng: 139.6380 },
        color: '#facc15',
        plannedWaypoints: [
            [51.9, 4.5], [49.5, -3.5], [45.0, -8.0], [38.0, -10.0], [35.8, -6.0], [36.5, 2.0], [37.5, 12.0], [34.0, 25.0], [31.5, 32.0],
            [29.0, 33.0], [20.0, 39.0], [12.5, 44.0], [10.0, 60.0], [5.0, 80.0], [0.0, 95.0], [-5.0, 105.0], 
            [6.0, 115.0], [20.0, 120.0], [30.0, 130.0], [35.4, 139.6]
        ],
        optimizedWaypoints: [
            [51.9, 4.5], [49.5, -3.5], [45.0, -8.0], [38.0, -10.0], [30.0, -15.0], [15.0, -20.0], [0.0, -15.0], [-15.0, -5.0],
            [-30.0, 10.0], [-36.0, 20.0], [-34.0, 30.0], [-25.0, 50.0], [-15.0, 70.0], [-5.0, 90.0], [-5.0, 105.0], 
            [6.0, 115.0], [20.0, 120.0], [30.0, 130.0], [35.4, 139.6]
        ]
    },
    {
        mmsi: '244820778',
        name: 'MT Serenity',
        type: 'VLCC Crude Tanker',
        flag: '🇳🇱',
        cargo: 'Crude Oil',
        cargoTonnage: 299000,
        origin: { name: 'Ras Tanura, SA', lat: 26.6443, lng: 50.1532 },
        destination: { name: 'Houston, US', lat: 29.7604, lng: -95.3698 },
        color: '#f97316',
        plannedWaypoints: [
            [26.6, 50.1], [24.0, 59.8], [14.0, 54.0], [12.5, 44.0], [20.0, 39.0], [29.0, 33.0], [31.5, 32.0],
            [35.0, 20.0], [38.0, 5.0], [35.8, -6.0], [30.0, -25.0], [25.0, -50.0], [25.0, -75.0], [24.0, -82.0], [25.0, -85.0], [29.7, -95.3]
        ],
        optimizedWaypoints: [
            [26.6, 50.1], [24.0, 59.8], [14.0, 54.0], [5.0, 50.0], [-5.0, 42.0], [-20.0, 35.0], [-32.0, 30.0],
            [-36.0, 20.0], [-30.0, 0.0], [-15.0, -20.0], [0.0, -40.0], [15.0, -60.0], [25.0, -75.0], [24.0, -82.0], [25.0, -85.0], [29.7, -95.3]
        ]
    },
    {
        mmsi: '477996000',
        name: 'MT Navigator',
        type: 'Chemical Tanker',
        flag: '🇭🇰',
        cargo: 'Petrochemicals',
        cargoTonnage: 48000,
        origin: { name: 'Singapore, SG', lat: 1.3521, lng: 103.8198 },
        destination: { name: 'Rotterdam, NL', lat: 51.9225, lng: 4.4792 },
        color: '#06b6d4',
        plannedWaypoints: [
            [1.3, 103.8], [6.0, 95.0], [10.0, 80.0], [12.5, 60.0], [12.5, 44.0], [20.0, 39.0], [29.0, 33.0], [31.5, 32.0],
            [35.0, 20.0], [38.0, 0.0], [35.8, -6.0], [45.0, -8.0], [49.5, -3.5], [51.9, 4.5]
        ],
        optimizedWaypoints: [
            [1.3, 103.8], [-2.0, 95.0], [-15.0, 75.0], [-25.0, 55.0], [-34.0, 35.0], [-36.0, 20.0], [-30.0, 10.0],
            [-15.0, -5.0], [0.0, -15.0], [15.0, -20.0], [30.0, -15.0], [38.0, -10.0], [45.0, -8.0], [49.5, -3.5], [51.9, 4.5]
        ]
    },
    {
        mmsi: '636015815',
        name: 'MT Resilience',
        type: 'Product Tanker',
        flag: '🇱🇷',
        cargo: 'Refined Products',
        cargoTonnage: 75000,
        origin: { name: 'Houston, US', lat: 29.7604, lng: -95.3698 },
        destination: { name: 'Durban, ZA', lat: -29.8587, lng: 31.0218 },
        color: '#a855f7',
        plannedWaypoints: [
            [29.7, -95.3], [25.0, -85.0], [24.0, -82.0], [25.0, -75.0], [15.0, -60.0], [0.0, -40.0],
            [-15.0, -20.0], [-30.0, 0.0], [-35.0, 15.0], [-33.0, 25.0], [-29.8, 31.0]
        ],
        optimizedWaypoints: [
            [29.7, -95.3], [25.0, -85.0], [24.0, -82.0], [25.0, -75.0], [15.0, -65.0], [-5.0, -45.0],
            [-22.0, -25.0], [-35.0, -5.0], [-38.0, 15.0], [-33.0, 25.0], [-29.8, 31.0]
        ]
    },
    {
        mmsi: '311000233',
        name: 'MT Valor',
        type: 'LPG Carrier',
        flag: '🇧🇸',
        cargo: 'Liquefied Petroleum Gas',
        cargoTonnage: 52000,
        origin: { name: 'Abu Dhabi, AE', lat: 24.4539, lng: 54.3773 },
        destination: { name: 'Amsterdam, NL', lat: 52.3676, lng: 4.9041 },
        color: '#22c55e',
        plannedWaypoints: [
            [24.4, 54.3], [24.0, 59.8], [14.0, 54.0], [12.5, 44.0], [20.0, 39.0], [29.0, 33.0], [31.5, 32.0],
            [35.0, 20.0], [38.0, 0.0], [35.8, -6.0], [45.0, -8.0], [49.5, -3.5], [52.3, 4.9]
        ],
        optimizedWaypoints: [
            [24.4, 54.3], [24.0, 59.8], [14.0, 54.0], [5.0, 50.0], [-5.0, 42.0], [-20.0, 35.0], [-32.0, 30.0],
            [-36.0, 20.0], [-30.0, 10.0], [-15.0, -5.0], [0.0, -15.0], [15.0, -20.0], [30.0, -15.0], [38.0, -10.0], 
            [45.0, -8.0], [49.5, -3.5], [52.3, 4.9]
        ]
    }
];

// ─── Vessel State (in-memory store) ──────────────────────────────────────────
const vesselState = {};

// Traffic hotspots that trigger AI rerouting
const TRAFFIC_HOTSPOTS = [
    { name: 'Strait of Malacca', lat: 2.5, lng: 102.0, severity: 'HIGH', type: 'congestion', delay: '+18h' },
    { name: 'Gulf of Aden (Piracy Zone)', lat: 12.5, lng: 47.5, severity: 'HIGH', type: 'piracy', delay: '+14h' },
    { name: 'Suez Canal', lat: 30.5, lng: 32.3, severity: 'MEDIUM', type: 'congestion', delay: '+6h' },
    { name: 'English Channel', lat: 50.5, lng: 1.5, severity: 'MEDIUM', type: 'traffic', delay: '+4h' },
    { name: 'Cape of Good Hope', lat: -34.5, lng: 19.5, severity: 'LOW', type: 'weather', delay: '+2h' },
];

// Initialize with simulated data
function initVesselState() {
    TRACKED_VESSELS.forEach((v, i) => {
        const totalWps = v.optimizedWaypoints.length;
        const progress = [0.15, 0.4, 0.6, 0.25, 0.75][i];
        const wpIdx = Math.floor(progress * totalWps);
        const pos = v.optimizedWaypoints[Math.min(wpIdx, totalWps - 1)];
        const trail = v.optimizedWaypoints.slice(0, Math.max(2, wpIdx + 1));
        const remaining = v.optimizedWaypoints.slice(Math.max(0, wpIdx));

        const daysRemaining = Math.round((1 - progress) * 28 + 2);
        const eta = new Date();
        eta.setDate(eta.getDate() + daysRemaining);

        // Enriched data fields
        const reroutingData = [
            { status: 'None', reason: '', trafficZone: '', detour: '' },
            { status: 'ACTIVE', reason: 'Typhoon Hagibis', trafficZone: 'Gulf of Aden — piracy advisory', detour: '+480 nm via southern corridor', costImpact: '+$42,000' },
            { status: 'None', reason: '', trafficZone: 'Suez Canal — 8h backlog', detour: '' },
            { status: 'ACTIVE', reason: 'Piracy Advisory', trafficZone: 'Gulf of Aden — high-risk zone', detour: '+620 nm via Cape of Good Hope', costImpact: '+$58,000' },
            { status: 'None', reason: '', trafficZone: 'Strait of Hormuz — moderate congestion', detour: '' },
        ][i];

        // Cost & fuel savings from AI route optimization
        const fuelBaseline = Math.round(3200 * (1 + 0.12)); // what unoptimized route would have consumed
        const fuelOptimized = 3200;
        const fuelSavedMT = Math.round((fuelBaseline - fuelOptimized) * (1 - progress));
        const fuelSavedPct = ((fuelBaseline - fuelOptimized) / fuelBaseline * 100).toFixed(1);
        const costPerMT = 650; // $/MT bunker fuel
        const costSaved = Math.round(fuelSavedMT * costPerMT);
        const timeSavedHours = [18, 0, 12, 0, 22][i];

        vesselState[v.mmsi] = {
            ...v,
            lat: pos[0],
            lng: pos[1],
            speed: (Math.random() * 4 + 12).toFixed(1),
            heading: Math.round(Math.random() * 360),
            trail,
            remaining,
            progress: Math.round(progress * 100),
            eta: eta.toISOString(),
            etaFormatted: eta.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            etaTime: eta.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
            fuelRate: (Math.random() * 15 + 40).toFixed(1),
            fuelConsumed: Math.round(progress * 3200),
            fuelTotal: 3200,
            fuelSavedMT,
            fuelSavedPct,
            costSaved,
            timeSavedHours,
            reroutingStatus: reroutingData.status !== 'None' ? `ACTIVE — ${reroutingData.reason}` : 'None',
            reroutingReason: reroutingData.reason,
            reroutingDetour: reroutingData.detour,
            trafficZone: reroutingData.trafficZone,
            nearbyHotspots: TRAFFIC_HOTSPOTS.filter(h =>
                Math.abs(h.lat - pos[0]) < 15 && Math.abs(h.lng - pos[1]) < 20
            ).map(h => `${h.name} (${h.type})`).join(', ') || 'Clear',
            weatherAdvisory: i === 1 ? 'Tropical Storm region, +2 day reroute' : i === 0 ? 'Moderate seas, Beaufort 5' : 'Clear',
            status: 'UNDERWAY',
            dataSource: 'SIMULATED',
            lastUpdated: new Date().toISOString(),
        };
    });
}

initVesselState();

// ─── Simulate live movement ────────────────────────────────────────────────────
function simulateMovement() {
    Object.values(vesselState).forEach(v => {
        // Nudge position slightly toward next waypoint
        if (v.remaining && v.remaining.length > 1) {
            const next = v.remaining[1];
            const dlat = (next[0] - v.lat) * 0.003;
            const dlng = (next[1] - v.lng) * 0.003;
            v.lat += dlat;
            v.lng += dlng;
            v.heading = Math.round(Math.atan2(dlng, dlat) * 180 / Math.PI + 360) % 360;
            // Update trail
            const lastTrailPt = v.trail[v.trail.length - 1];
            if (Math.abs(v.lat - lastTrailPt[0]) > 0.1 || Math.abs(v.lng - lastTrailPt[1]) > 0.1) {
                v.trail.push([v.lat, v.lng]);
                if (v.trail.length > 60) v.trail.shift();
            }
        }
        v.speed = (Math.random() * 3 + 12).toFixed(1);
        v.lastUpdated = new Date().toISOString();
    });
}
setInterval(simulateMovement, 5000);

// ─── AISStream.io WebSocket (optional — set AISSTREAM_KEY env var) ─────────────
const AISSTREAM_KEY = process.env.AISSTREAM_KEY || '';

if (AISSTREAM_KEY) {
    console.log('[Route Agent] Connecting to AISStream.io...');
    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
    ws.on('open', () => {
        ws.send(JSON.stringify({
            APIKey: AISSTREAM_KEY,
            BoundingBoxes: [[[-90, -180], [90, 180]]],
            FilterMessageTypes: ['PositionReport'],
            FiltersShipMMSI: TRACKED_VESSELS.map(v => v.mmsi)
        }));
        console.log('[Route Agent] AISStream subscribed.');
    });
    ws.on('message', raw => {
        try {
            const msg = JSON.parse(raw);
            const mmsi = String(msg?.MetaData?.MMSI);
            if (vesselState[mmsi] && msg.PositionReport) {
                const pr = msg.PositionReport;
                vesselState[mmsi].lat = pr.Latitude;
                vesselState[mmsi].lng = pr.Longitude;
                vesselState[mmsi].speed = pr.SpeedOverGround?.toFixed(1) || vesselState[mmsi].speed;
                vesselState[mmsi].heading = pr.TrueHeading || pr.CourseOverGround || vesselState[mmsi].heading;
                vesselState[mmsi].lastUpdated = new Date().toISOString();
                vesselState[mmsi].dataSource = 'AIS_LIVE';
                // append trail
                vesselState[mmsi].trail.push([pr.Latitude, pr.Longitude]);
                if (vesselState[mmsi].trail.length > 60) vesselState[mmsi].trail.shift();
            }
        } catch { /* ignore parse errors */ }
    });
    ws.on('error', e => console.error('[Route Agent] AISStream error:', e.message));
    ws.on('close', () => console.log('[Route Agent] AISStream disconnected.'));
}

// ─── REST Routes ──────────────────────────────────────────────────────────────
router.get('/vessels', (req, res) => {
    res.json(Object.values(vesselState));
});

router.get('/vessels/:mmsi', (req, res) => {
    const v = vesselState[req.params.mmsi];
    if (!v) return res.status(404).json({ error: 'Vessel not found' });
    res.json(v);
});

module.exports = router;
