import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, X, Send, ChevronDown, Loader2, CornerDownLeft,
    Terminal, CheckCircle2, AlertCircle, Navigation, BarChart3,
    Mic, MicOff, Volume2, VolumeX, Play, SkipForward, Ticket, Pause
} from 'lucide-react';
import { cn } from './Sidebar';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import { CONFIG } from '../config';

// OpenRouter model configuration (Key moved to backend for security)
const MODEL = 'deepseek/deepseek-chat';

// All navigable views in the Neuro Shell ERP
const VIEWS = {
    command: 'Strategic Steering Hub',
    digitaltwin: 'Asset Digital Twin',
    manufacturing: 'Industrial Ops & Refining',
    supplychain: 'Global Logistics & Marine',
    commercial: 'Energy Trading & Risk',
    finance: 'Group Finance & Strategy',
    hr: 'Workforce & HSE Safety',
    itops: 'System Ops & Cyber',
    itops_agent: 'AIOps Engine (Operations Overview)',
    erp: 'ERP Master (S/4HANA)',
    models: 'Model Registry',
    alerts: 'Alert Center',
    techdebt: 'Tech Debt Reduction',
    coe: 'Centre of Excellence',
    governance: 'Governance and Compliance',
    change: 'Change & Adoption',
    roi: 'ROI Dashboard',
    firedetection: 'Fire Detection',
    topology: 'Agentic Neural Topology',
};

// ─── Demo Tour — 4 Pillars of Neuro Shell EOS ────────────────────────────────
// Pillar 1: Cost Optimization  Pillar 2: Zero Emissions  Pillar 3: OT/IT Threat Handling  Pillar 4: Anomaly Detection
const DEMO_TOUR = [
    {
        view: 'command',
        pitch: "Welcome to Neuro Shell — the AI Engine Operating System built for the scale and complexity of Shell. This Strategic Steering Hub synthesizes telemetry, financial signals, and safety feeds from every domain into one live intelligence layer. The four pillars driving this EOS are: Cost Optimization, Zero Emissions, OT and IT Threat Handling, and Real-Time Anomaly Detection. Every module you will see today is anchored to at least one of these four pillars.",
    },
    {
        view: 'digitaltwin',
        tab: '3d',
        pitch: "Pillar One — Cost Optimization begins here in the Asset Digital Twin. Specialized AI agents continuously ingest live IoT vibration and temperature data from our physical assets. When a compressor shows early-stage anomaly signatures, the system predicts a mechanical failure up to seventy-two hours in advance. This eliminates unplanned shutdown costs and is also our Pillar Four — Anomaly Detection — operating in real time across the plant floor.",
    },
    {
        view: 'manufacturing',
        tab: 'surveillance',
        pitch: "Pillar Two — Zero Emissions is embodied in Industrial Operations. The Guardian Eye agent monitors live camera feeds across all global refinery sites. If a worker enters a hazardous exclusion zone without appropriate safety gear, it instantly triggers a localized alert and adjusts the site compliance score. Beyond safety, it correlates high-emission events with process anomalies, allowing us to proactively cut flaring and reduce our carbon signature — all autonomously, without human oversight.",
    },
    {
        view: 'hr',
        tab: 'agent',
        pitch: "Cost Optimization also means matching people to demand precisely. In Workforce and HSE Safety, the Workforce AI Agent forecasts headcount shortfalls before they happen. It evaluates demand signals, available supply, and skill gaps in milliseconds — then identifies the optimal contractors and mobilizes resources. Clicking Authorize Resource Mobilization deploys the right personnel instantly, eliminating idle workforce spend and ensuring mission-critical sites are never understaffed.",
    },
    {
        view: 'supplychain',
        tab: 'routes',
        pitch: "Fleet Management and Sea Route Optimization directly target Cost Optimization and Zero Emissions together. The Supply Chain Agent commands our entire heavy fleet across global ocean corridors. When a geopolitical disruption threatens an LNG route, it simulates alternative waypoints within seconds, protecting our margins and minimizing demurrage. It also optimizes routing for minimum fuel burn, directly reducing our shipping emissions without compromising delivery commitments.",
    },
    {
        view: 'commercial',
        tab: 'agent',
        pitch: "At the Energy Trading and Risk terminal, the Commercial Intelligence Agent weaponizes market data. It ingests Brent Crude and TTF Gas volatilities in real time, screens every counterparty against live sanctions databases, and identifies cross-commodity arbitrage opportunities. This agent prevents non-compliant trades in milliseconds — protecting Shell from regulatory fines while simultaneously optimizing revenue. This is AI-native cost optimization and threat handling working together.",
    },
    {
        view: 'finance',
        pitch: "In Group Finance, the Finance Agent oversees intercompany reconciliations, hedging positions, and anomaly detection across tens of thousands of transactions daily. Pillar Four — Anomaly Detection — flags suspicious accounting entries instantly. This has compressed Shell's financial close cycle from the industry standard of nine days down to five, freeing capital and accelerating executive decision-making at the speed of AI.",
    },
    {
        view: 'itops',
        tab: 'overview',
        pitch: "Here is where Pillar Three — OT and IT Threat Handling — takes command. The AIOps Engine monitors half a million sensor tags and enterprise endpoints simultaneously. When anomalies are detected — from a PLC intrusion to a rogue shadow IT device — the system automatically deflects routine ITSM tickets using AI knowledge matching, and escalates only critical failures to Level 3 engineers. Our response time has dropped from multiple hours to mere seconds.",
    },
    {
        view: 'governance',
        pitch: "And underpinning all four pillars is the AI Governance framework. The Governance Agent maintains a continuous, immutable audit trail of every AI-driven decision across Neuro Shell. It tracks AI Act readiness, ISO 42001 compliance, and GDPR parameters in real time. Compliance is no longer a retrospective audit — it is an automated, living, and actively enforced state across the entire EOS.",
    },
    {
        view: 'topology',
        pitch: "Finally, the Neural Topology graph proves why Neuro Shell is the perfect AI Operating System for Shell. Every domain agent — from Digital Twin to Finance to Cybersecurity — communicates rich contextual signals through a shared intelligence fabric. This is not a collection of point solutions. This is a truly autonomous enterprise nervous system, purpose-built for the operational scale and ambition of Shell. Thank you.",
    },
];

// Tool definitions for OpenRouter function calling
const TABS_MAP = {
    itops:         { overview: 'AIOps Engine', itsm: 'ITSM Hub', ot: 'OT Threats', predictive: 'Predictive Monitoring', shadow: 'Shadow IT' },
    hr:            { overview: 'Intelligence Overview', agent: 'Workforce AI Agent' },
    manufacturing: { analytics: 'Operational Analytics', surveillance: 'AI Surveillance / Fire Detection' },
    supplychain:   { overview: 'Overview', routes: 'Route Optimization' },
    commercial:    { overview: 'Market Overview', agent: 'Trading AI Agents' },
};

const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'navigate_to_view',
            description: 'Navigate the user to a specific module/page (and optionally a subsection/tab) in the Neuro Shell ERP application. Use this whenever the user asks to go to, open, show, or navigate to a section or subsection. Always specify tab_id when the user mentions a subsection.',
            parameters: {
                type: 'object',
                properties: {
                    view_id: {
                        type: 'string',
                        enum: Object.keys(VIEWS),
                        description: 'The ID of the top-level view to navigate to.'
                    },
                    tab_id: {
                        type: 'string',
                        description: 'Optional subsection tab to navigate to within the view. For itops: overview|itsm|ot|predictive|shadow. For hr: overview|agent. For manufacturing: analytics|surveillance. For supplychain: overview|routes. For commercial: overview|agent.'
                    },
                    reason: {
                        type: 'string',
                        description: 'Brief reason why you are navigating here.'
                    }
                },
                required: ['view_id']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'fetch_domain_data',
            description: 'Fetch live operational data from a specific ERP domain API endpoint. Use this to answer questions about current metrics, KPIs, alerts, or statistics.',
            parameters: {
                type: 'object',
                properties: {
                    domain: {
                        type: 'string',
                        enum: ['manufacturing', 'supplychain', 'commercial', 'finance', 'hr', 'itops', 'dashboard', 'fire'],
                        description: 'The domain whose data to fetch.'
                    }
                },
                required: ['domain']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_active_alerts',
            description: 'Retrieve the current list of active system alerts and critical events across all domains.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_platform_status',
            description: 'Get the overall platform health, wave progress, and key performance snapshot of the Neuro Shell ERP system.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_itsm_ticket',
            description: 'Autonomously dispatch a critical service incident ticket to tracking systems via the IT/Ops ITSM engine. Use this ONLY when you have collected all required information via conversation: short_description, description, category, impact, and urgency. If the user has not provided these details, do NOT call this function — instead ask clarifying questions first.',
            parameters: {
                type: 'object',
                properties: {
                    emp_id: { type: 'string', description: 'Employee ID if specified (e.g. SHELL-1001).' },
                    short_description: { type: 'string', description: 'One-line summary of the incident.' },
                    description: { type: 'string', description: 'Rich context regarding the failure.' },
                    category: { type: 'string', description: 'System category (e.g., OT / Industrial Controls, Infrastructure & Cloud, Cyber Security).' },
                    impact: { type: 'string', description: 'Impact level e.g. "1 - Global", "2 - Division", "3 - Local"' },
                    urgency: { type: 'string', description: 'Urgency e.g. "1 - High", "2 - Medium", "3 - Low"' }
                },
                required: ['short_description', 'description', 'category', 'impact', 'urgency']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'demo_application',
            description: 'Launch a full guided demo tour of the entire Neuro Shell application. Use this when the user asks for a demo, tour, walkthrough, or pitch of the application. This will automatically navigate through all modules.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function',
        function: {
            name: 'fetch_unified_intelligence',
            description: 'Fetch the entire Unified Data Fabric graph. Use this for complex, cross-domain questions where you need to see how Manufacturing, HR, IT, and Finance are interconnected.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function',
        function: {
            name: 'query_neural_topology',
            description: 'Get details about the distributed AI agent architecture, their roles, technical ports, and communication edges. Use this to explain how the system is wired.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function',
        function: {
            name: 'generate_data_visual',
            description: 'Generate an interactive inline data chart/visualization for a domain. Use this when the user asks for insights, charts, graphs, analytics, or visual data for any module. Renders a live Recharts chart directly in the chat.',
            parameters: {
                type: 'object',
                properties: {
                    domain: {
                        type: 'string',
                        enum: ['fleet', 'manufacturing', 'supplychain', 'itops', 'commercial', 'finance', 'hr'],
                        description: 'The domain to visualize data for.'
                    },
                    chart_type: {
                        type: 'string',
                        enum: ['bar', 'line', 'area'],
                        description: 'Type of chart to render. Default: bar.'
                    },
                    metric: {
                        type: 'string',
                        description: 'Specific metric to highlight (e.g. "fuel_savings", "ticket_deflection", "emission_reduction"). Optional.'
                    }
                },
                required: ['domain']
            }
        }
    }
];

const DOMAIN_API_MAP = {
    manufacturing: `${CONFIG.CORE_API}/manufacturing`,
    supplychain:   `${CONFIG.CORE_API}/supplychain`,
    commercial:    `${CONFIG.CORE_API}/commercial`,
    finance:       `${CONFIG.CORE_API}/finance`,
    hr:            `${CONFIG.CORE_API}/hr`,
    itops:         `${CONFIG.CORE_API}/itops`,
    dashboard:     `${CONFIG.CORE_API}/dashboard`,
    fire:          `${CONFIG.AI_ORCHESTRATOR}/api/fire/alerts`,
};

// ─── Static chart data — multi-metric per domain ──────────────────────────────
// Each domain has multiple named charts. Keys are the "metric" slugs the LLM
// or client intercept passes in. A special key "_default" is used as fallback.
const CHART_DATA = {
    // ── Fleet / Supply Chain routes ──────────────────────────────────────────
    fleet: {
        _default: 'fuel_savings',
        fuel_savings: {
            title: 'Fleet Route Optimization — Fuel Savings (MT)',
            data: [
                { name: 'Jan', baseline: 4200, optimized: 3100, saving: 1100 },
                { name: 'Feb', baseline: 3900, optimized: 2850, saving: 1050 },
                { name: 'Mar', baseline: 4500, optimized: 3200, saving: 1300 },
                { name: 'Apr', baseline: 4100, optimized: 2900, saving: 1200 },
                { name: 'May', baseline: 4700, optimized: 3350, saving: 1350 },
                { name: 'Jun', baseline: 4300, optimized: 3050, saving: 1250 },
            ],
            bars: [
                { key: 'baseline', color: '#94a3b8', label: 'Pre-AI Fuel (MT)' },
                { key: 'optimized', color: '#FBCE07', label: 'AI-Optimized (MT)' },
                { key: 'saving', color: '#22c55e', label: 'Savings (MT)' },
            ],
        },
        carbon_emission: {
            title: 'Fleet — Carbon Emission Reduction (tCO₂)',
            data: [
                { name: 'Jan', before: 5200, after: 4600, saved: 600 },
                { name: 'Feb', before: 5000, after: 4350, saved: 650 },
                { name: 'Mar', before: 5400, after: 4700, saved: 700 },
                { name: 'Apr', before: 5100, after: 4400, saved: 700 },
                { name: 'May', before: 5600, after: 4800, saved: 800 },
                { name: 'Jun', before: 5300, after: 4550, saved: 750 },
            ],
            bars: [
                { key: 'before', color: '#ef4444', label: 'Pre-AI Emissions (tCO₂)' },
                { key: 'after', color: '#22c55e', label: 'AI-Optimized (tCO₂)' },
                { key: 'saved', color: '#06b6d4', label: 'CO₂ Saved (tCO₂)' },
            ],
        },
        demurrage: {
            title: 'Fleet — Demurrage Cost Savings ($k)',
            data: [
                { name: 'Jan', cost: 420, ai_avoided: 310 },
                { name: 'Feb', cost: 390, ai_avoided: 280 },
                { name: 'Mar', cost: 450, ai_avoided: 330 },
                { name: 'Apr', cost: 410, ai_avoided: 300 },
                { name: 'May', cost: 470, ai_avoided: 350 },
                { name: 'Jun', cost: 430, ai_avoided: 310 },
            ],
            bars: [
                { key: 'cost', color: '#ef4444', label: 'Baseline Cost ($k)' },
                { key: 'ai_avoided', color: '#FBCE07', label: 'AI-Avoided ($k)' },
            ],
        },
    },
    // ── Manufacturing ────────────────────────────────────────────────────────
    manufacturing: {
        _default: 'anomaly_detection',
        anomaly_detection: {
            title: 'Manufacturing — Anomaly Detection Events vs Downtime (hrs)',
            data: [
                { name: 'Jan', anomalies: 18, downtime: 14 },
                { name: 'Feb', anomalies: 22, downtime: 9 },
                { name: 'Mar', anomalies: 15, downtime: 6 },
                { name: 'Apr', anomalies: 28, downtime: 4 },
                { name: 'May', anomalies: 12, downtime: 2 },
                { name: 'Jun', anomalies: 9,  downtime: 1 },
            ],
            bars: [
                { key: 'anomalies', color: '#f59e0b', label: 'Anomalies Caught' },
                { key: 'downtime',  color: '#ef4444', label: 'Downtime (hrs)' },
            ],
        },
        yield_optimization: {
            title: 'Manufacturing — Yield Optimization (%)',
            data: [
                { name: 'Jan', baseline: 81, optimized: 84 },
                { name: 'Feb', baseline: 82, optimized: 85 },
                { name: 'Mar', baseline: 80, optimized: 84.5 },
                { name: 'Apr', baseline: 83, optimized: 86 },
                { name: 'May', baseline: 84, optimized: 87 },
                { name: 'Jun', baseline: 85, optimized: 88 },
            ],
            bars: [
                { key: 'baseline', color: '#94a3b8', label: 'Pre-AI Yield (%)' },
                { key: 'optimized', color: '#22c55e', label: 'AI-Optimized Yield (%)' },
            ],
        },
        predictive_maintenance: {
            title: 'Manufacturing — Predictive Maintenance: Failures Prevented',
            data: [
                { name: 'Jan', predicted: 8, avoided: 7 },
                { name: 'Feb', predicted: 11, avoided: 10 },
                { name: 'Mar', predicted: 9, avoided: 9 },
                { name: 'Apr', predicted: 14, avoided: 13 },
                { name: 'May', predicted: 12, avoided: 12 },
                { name: 'Jun', predicted: 10, avoided: 10 },
            ],
            bars: [
                { key: 'predicted', color: '#f59e0b', label: 'Predicted Failures' },
                { key: 'avoided', color: '#22c55e', label: 'Failures Avoided' },
            ],
        },
        emission_reduction: {
            title: 'Manufacturing — Flaring & Emission Events Reduced',
            data: [
                { name: 'Jan', events: 24, reduced: 9 },
                { name: 'Feb', events: 20, reduced: 11 },
                { name: 'Mar', events: 18, reduced: 14 },
                { name: 'Apr', events: 15, reduced: 13 },
                { name: 'May', events: 11, reduced: 10 },
                { name: 'Jun', events: 8, reduced: 8 },
            ],
            bars: [
                { key: 'events', color: '#ef4444', label: 'Total Emission Events' },
                { key: 'reduced', color: '#22c55e', label: 'AI-Reduced Events' },
            ],
        },
    },
    // ── Supply Chain ─────────────────────────────────────────────────────────
    supplychain: {
        _default: 'on_time_delivery',
        on_time_delivery: {
            title: 'Supply Chain — On-Time Delivery Rate (%)',
            data: [
                { name: 'Q1 23', rate: 74 },
                { name: 'Q2 23', rate: 79 },
                { name: 'Q3 23', rate: 83 },
                { name: 'Q4 23', rate: 87 },
                { name: 'Q1 24', rate: 91 },
                { name: 'Q2 24', rate: 95 },
            ],
            bars: [{ key: 'rate', color: '#06b6d4', label: 'On-Time Rate (%)' }],
        },
        fleet_cost: {
            title: 'Supply Chain — Fleet Cost Reduction (%)',
            data: [
                { name: 'Q1 23', baseline: 100, ai: 97 },
                { name: 'Q2 23', baseline: 100, ai: 95 },
                { name: 'Q3 23', baseline: 100, ai: 93.5 },
                { name: 'Q4 23', baseline: 100, ai: 92.2 },
                { name: 'Q1 24', baseline: 100, ai: 91.8 },
            ],
            bars: [
                { key: 'baseline', color: '#94a3b8', label: 'Baseline Index' },
                { key: 'ai', color: '#22c55e', label: 'AI-Optimized Index' },
            ],
        },
        contractor_adherence: {
            title: 'Supply Chain — Contractor Adherence Rate (%)',
            data: [
                { name: 'Maersk', adherence: 96 },
                { name: 'Shell Maritime', adherence: 98 },
                { name: 'Independents', adherence: 74 },
                { name: 'Charter Fleet', adherence: 82 },
            ],
            bars: [{ key: 'adherence', color: '#FBCE07', label: 'Adherence (%)' }],
        },
        carbon_footprint: {
            title: 'Supply Chain — Carbon Footprint Saved (kT CO₂)',
            data: [
                { name: 'Jan', saved: 1.8 },
                { name: 'Feb', saved: 2.1 },
                { name: 'Mar', saved: 2.4 },
                { name: 'Apr', saved: 2.0 },
                { name: 'May', saved: 2.7 },
                { name: 'Jun', saved: 2.9 },
            ],
            bars: [{ key: 'saved', color: '#06b6d4', label: 'CO₂ Saved (kT)' }],
        },
    },
    // ── IT Ops ───────────────────────────────────────────────────────────────
    itops: {
        _default: 'ticket_deflection',
        ticket_deflection: {
            title: 'IT/Ops — ITSM Ticket Deflection Rate (%)',
            data: [
                { name: 'Week 1', deflected: 52, escalated: 48 },
                { name: 'Week 2', deflected: 61, escalated: 39 },
                { name: 'Week 3', deflected: 72, escalated: 28 },
                { name: 'Week 4', deflected: 83, escalated: 17 },
                { name: 'Week 5', deflected: 89, escalated: 11 },
                { name: 'Week 6', deflected: 94, escalated: 6  },
            ],
            bars: [
                { key: 'deflected', color: '#22c55e', label: 'AI Deflected (%)' },
                { key: 'escalated', color: '#ef4444', label: 'Escalated (%)' },
            ],
        },
        threat_response: {
            title: 'IT/Ops — Cyber Threat Response Time (seconds)',
            data: [
                { name: 'Jan', manual: 1800, ai: 42 },
                { name: 'Feb', manual: 1750, ai: 36 },
                { name: 'Mar', manual: 1600, ai: 28 },
                { name: 'Apr', manual: 1500, ai: 22 },
                { name: 'May', manual: 1400, ai: 16 },
                { name: 'Jun', manual: 1300, ai: 14 },
            ],
            bars: [
                { key: 'manual', color: '#ef4444', label: 'Manual Response (s)' },
                { key: 'ai', color: '#22c55e', label: 'AI Response (s)' },
            ],
        },
        sensor_coverage: {
            title: 'IT/Ops — OT Sensor Tag Coverage (thousands)',
            data: [
                { name: 'Q1 23', monitored: 280, total: 450 },
                { name: 'Q2 23', monitored: 330, total: 460 },
                { name: 'Q3 23', monitored: 390, total: 470 },
                { name: 'Q4 23', monitored: 430, total: 480 },
                { name: 'Q1 24', monitored: 470, total: 490 },
                { name: 'Q2 24', monitored: 500, total: 500 },
            ],
            bars: [
                { key: 'monitored', color: '#FBCE07', label: 'Monitored Tags (k)' },
                { key: 'total', color: '#94a3b8', label: 'Total Tags (k)' },
            ],
        },
        shadow_it: {
            title: 'IT/Ops — Shadow IT Devices Detected & Remediated',
            data: [
                { name: 'Jan', detected: 42, remediated: 35 },
                { name: 'Feb', detected: 38, remediated: 36 },
                { name: 'Mar', detected: 31, remediated: 30 },
                { name: 'Apr', detected: 27, remediated: 27 },
                { name: 'May', detected: 19, remediated: 19 },
                { name: 'Jun', detected: 12, remediated: 12 },
            ],
            bars: [
                { key: 'detected', color: '#f59e0b', label: 'Shadow Devices Detected' },
                { key: 'remediated', color: '#22c55e', label: 'Remediated' },
            ],
        },
    },
    // ── Commercial ───────────────────────────────────────────────────────────
    commercial: {
        _default: 'pricing_alpha',
        pricing_alpha: {
            title: 'Commercial — AI Pricing vs Market Price ($/bbl)',
            data: [
                { name: 'Jan', market: 78, ai_price: 81 },
                { name: 'Feb', market: 82, ai_price: 86 },
                { name: 'Mar', market: 75, ai_price: 79 },
                { name: 'Apr', market: 88, ai_price: 93 },
                { name: 'May', market: 91, ai_price: 96 },
                { name: 'Jun', market: 85, ai_price: 90 },
            ],
            bars: [
                { key: 'market', color: '#94a3b8', label: 'Market Price' },
                { key: 'ai_price', color: '#FBCE07', label: 'AI-Optimized Price' },
            ],
        },
        arbitrage: {
            title: 'Commercial — Arbitrage Opportunities Detected ($M)',
            data: [
                { name: 'Jan', detected: 8.2, captured: 6.1 },
                { name: 'Feb', detected: 10.4, captured: 8.5 },
                { name: 'Mar', detected: 9.1, captured: 7.8 },
                { name: 'Apr', detected: 12.3, captured: 11.0 },
                { name: 'May', detected: 14.2, captured: 13.1 },
                { name: 'Jun', detected: 11.8, captured: 10.9 },
            ],
            bars: [
                { key: 'detected', color: '#f59e0b', label: 'Detected ($M)' },
                { key: 'captured', color: '#22c55e', label: 'Captured ($M)' },
            ],
        },
        hedge_ratio: {
            title: 'Commercial — Hedge Ratio Efficiency (%)',
            data: [
                { name: 'Q1 23', ratio: 71 },
                { name: 'Q2 23', ratio: 75 },
                { name: 'Q3 23', ratio: 79 },
                { name: 'Q4 23', ratio: 82 },
                { name: 'Q1 24', ratio: 84.2 },
                { name: 'Q2 24', ratio: 85.1 },
            ],
            bars: [{ key: 'ratio', color: '#8b5cf6', label: 'Hedge Ratio (%)' }],
        },
        sanctions_screening: {
            title: 'Commercial — Sanctions Screening: Blocked vs Cleared Trades',
            data: [
                { name: 'Jan', screened: 1820, blocked: 12 },
                { name: 'Feb', screened: 2100, blocked: 9 },
                { name: 'Mar', screened: 1950, blocked: 14 },
                { name: 'Apr', screened: 2250, blocked: 8 },
                { name: 'May', screened: 2400, blocked: 6 },
                { name: 'Jun', screened: 2300, blocked: 5 },
            ],
            bars: [
                { key: 'screened', color: '#06b6d4', label: 'Total Screened' },
                { key: 'blocked', color: '#ef4444', label: 'Blocked (Sanctions)' },
            ],
        },
    },
    // ── Finance ──────────────────────────────────────────────────────────────
    finance: {
        _default: 'close_cycle',
        close_cycle: {
            title: 'Finance — Close Cycle Duration (days)',
            data: [
                { name: 'Q1 23', days: 9.5 },
                { name: 'Q2 23', days: 8.4 },
                { name: 'Q3 23', days: 7.2 },
                { name: 'Q4 23', days: 6.5 },
                { name: 'Q1 24', days: 5.8 },
                { name: 'Q2 24', days: 5.0 },
            ],
            bars: [{ key: 'days', color: '#8b5cf6', label: 'Close Duration (days)' }],
        },
        reconciliation: {
            title: 'Finance — Automated Intercompany Reconciliation Rate (%)',
            data: [
                { name: 'Jan', manual: 44, auto: 56 },
                { name: 'Feb', manual: 38, auto: 62 },
                { name: 'Mar', manual: 29, auto: 71 },
                { name: 'Apr', manual: 21, auto: 79 },
                { name: 'May', manual: 14, auto: 86 },
                { name: 'Jun', manual: 8, auto: 92 },
            ],
            bars: [
                { key: 'manual', color: '#ef4444', label: 'Manual (%)' },
                { key: 'auto', color: '#22c55e', label: 'AI Automated (%)' },
            ],
        },
        anomalies: {
            title: 'Finance — AI Anomaly Detection in Transactions',
            data: [
                { name: 'Jan', flagged: 18, confirmed: 14 },
                { name: 'Feb', flagged: 22, confirmed: 17 },
                { name: 'Mar', flagged: 15, confirmed: 13 },
                { name: 'Apr', flagged: 26, confirmed: 20 },
                { name: 'May', flagged: 19, confirmed: 15 },
                { name: 'Jun', flagged: 12, confirmed: 10 },
            ],
            bars: [
                { key: 'flagged', color: '#f59e0b', label: 'Flagged by AI' },
                { key: 'confirmed', color: '#ef4444', label: 'Confirmed Anomalies' },
            ],
        },
        hedging: {
            title: 'Finance — Hedging Position Coverage ($B notional)',
            data: [
                { name: 'Q1 23', crude: 4.2, gas: 2.1, power: 1.0 },
                { name: 'Q2 23', crude: 4.8, gas: 2.4, power: 1.2 },
                { name: 'Q3 23', crude: 5.1, gas: 2.7, power: 1.4 },
                { name: 'Q4 23', crude: 5.5, gas: 3.0, power: 1.6 },
                { name: 'Q1 24', crude: 5.9, gas: 3.3, power: 1.8 },
            ],
            bars: [
                { key: 'crude', color: '#FBCE07', label: 'Crude ($B)' },
                { key: 'gas', color: '#06b6d4', label: 'Gas ($B)' },
                { key: 'power', color: '#8b5cf6', label: 'Power ($B)' },
            ],
        },
    },
    // ── HR ───────────────────────────────────────────────────────────────────
    hr: {
        _default: 'workforce_demand',
        workforce_demand: {
            title: 'HR — Workforce Demand vs Supply by Role',
            data: [
                { name: 'Engineers', demand: 340, supply: 290 },
                { name: 'Operators', demand: 520, supply: 480 },
                { name: 'Technicians', demand: 410, supply: 395 },
                { name: 'Contractors', demand: 780, supply: 650 },
                { name: 'Safety', demand: 180, supply: 172 },
            ],
            bars: [
                { key: 'demand', color: '#f59e0b', label: 'Demand' },
                { key: 'supply', color: '#22c55e', label: 'Supply' },
            ],
        },
        incident_reduction: {
            title: 'HR — Safety Incident Rate Reduction (%)',
            data: [
                { name: 'Q1 23', rate: 18.2 },
                { name: 'Q2 23', rate: 15.8 },
                { name: 'Q3 23', rate: 13.1 },
                { name: 'Q4 23', rate: 10.4 },
                { name: 'Q1 24', rate: 7.9 },
                { name: 'Q2 24', rate: 5.6 },
            ],
            bars: [{ key: 'rate', color: '#ef4444', label: 'Incident Rate (%)' }],
        },
        reskilling: {
            title: 'HR — Employees Reskilled (cumulative)',
            data: [
                { name: 'Jan', reskilled: 420 },
                { name: 'Feb', reskilled: 890 },
                { name: 'Mar', reskilled: 1450 },
                { name: 'Apr', reskilled: 2100 },
                { name: 'May', reskilled: 2850 },
                { name: 'Jun', reskilled: 3600 },
            ],
            bars: [{ key: 'reskilled', color: '#8b5cf6', label: 'Employees Reskilled' }],
        },
        training_completion: {
            title: 'HR — Training Completion Rate by Programme (%)',
            data: [
                { name: 'Cyber Awareness', rate: 97 },
                { name: 'D&I', rate: 82 },
                { name: 'GDPR', rate: 91 },
                { name: 'HSE Induction', rate: 88 },
                { name: 'AI Literacy', rate: 74 },
            ],
            bars: [{ key: 'rate', color: '#06b6d4', label: 'Completion Rate (%)' }],
        },
    },
};

// ─── Helper to resolve a CHART_DATA chart config ───────────────────────────
// Returns { title, data, bars } or null
function resolveChart(domain, metric) {
    const domainCharts = CHART_DATA[domain];
    if (!domainCharts) return null;
    const key = metric && domainCharts[metric] ? metric : domainCharts._default;
    return domainCharts[key] || null;
}

const CHART_COLORS = ['#FBCE07', '#22c55e', '#06b6d4', '#8b5cf6', '#ef4444'];

const SYSTEM_PROMPT = `You are EVA, Shell plc's elite agentic AI Engine Operating System copilot for Neuro Shell EOS.

YOUR CORE CAPABILITIES (USE THE EXACT TOOL NAMES PROVIDED):
- Navigate to modules and subsections (Tool: \`navigate_to_view\`)
- Fetch live data (Tool: \`fetch_domain_data\`)
- Create ITSM tickets (Tool: \`create_itsm_ticket\`) — gather all 5 pieces of info first
- Launch guided tour (Tool: \`demo_application\`)
- Fetch unified fabric (Tool: \`fetch_unified_intelligence\`)
- Query agent topology (Tool: \`query_neural_topology\`)
- Get active alerts (Tool: \`get_active_alerts\`)
- Get platform status (Tool: \`get_platform_status\`)
- Generate inline data chart (Tool: \`generate_data_visual\`) — use when user asks for a visual, chart, insight, or graph

THE FOUR PILLARS OF NEURO SHELL EOS:
1. Cost Optimization — AI routing, pricing, workforce planning, financial close
2. Zero Emissions — Route fuel optimization, anomaly-based flaring reduction, safety surveillance
3. OT/IT Threat Handling — AIOps, ITSM deflection, cyber threat detection, shadow IT
4. Anomaly Detection — Digital Twin predictive maintenance, fire detection, financial anomalies

DEEP NAVIGATION — SUBSECTIONS (ALWAYS USE tab_id WHEN NAVIGATING TO A SUBSECTION):
Each view has subsections reachable via the tab_id parameter of navigate_to_view:

• System Ops & Cyber (view_id: itops)
  - tab_id: overview       → AIOps Engine (default overview)
  - tab_id: itsm           → ITSM Hub (ticket deflection, incident management)
  - tab_id: ot             → OT Threats (operational technology threat map)
  - tab_id: predictive     → Predictive Monitoring (predictive analytics)
  - tab_id: shadow         → Shadow IT (shadow IT detection)

• Workforce & HSE Safety (view_id: hr)
  - tab_id: overview       → Intelligence Overview (default overview)
  - tab_id: agent          → Workforce AI Agent (AI workforce planning agent)

• Industrial Ops & Refining (view_id: manufacturing)
  - tab_id: analytics      → Operational Analytics (default overview)
  - tab_id: surveillance   → AI Surveillance / Fire Detection (Guardian Eye camera feeds)

• Global Logistics & Marine (view_id: supplychain)
  - tab_id: overview       → Overview (default overview)
  - tab_id: routes         → Route Optimization (sea route optimizer map)

• Energy Trading & Risk (view_id: commercial)
  - tab_id: overview       → Market Overview (default overview)
  - tab_id: agent          → Trading AI Agents (commercial AI agent)

EXAMPLES:
- "Go to ITSM Hub" → navigate_to_view(view_id: "itops", tab_id: "itsm")
- "Show me OT Threats" → navigate_to_view(view_id: "itops", tab_id: "ot")
- "Open Workforce AI Agent" → navigate_to_view(view_id: "hr", tab_id: "agent")
- "Show Route Optimization" → navigate_to_view(view_id: "supplychain", tab_id: "routes")
- "Go to Trading Agents" → navigate_to_view(view_id: "commercial", tab_id: "agent")
- "Show AI Surveillance" → navigate_to_view(view_id: "manufacturing", tab_id: "surveillance")
- "Show Shadow IT" → navigate_to_view(view_id: "itops", tab_id: "shadow")
- "Go to Predictive Monitoring" → navigate_to_view(view_id: "itops", tab_id: "predictive")

CRITICAL RULE — ITSM TICKETS:
When a user asks to create a ticket or log an issue, you MUST gather following information BEFORE calling create_itsm_ticket: Summary, Details, Category, Impact, and Urgency.
- If the user provides info in their initial request, do NOT ask for it again.
- If info is missing, ask clearly and gather it.
- Be proactive: if you can infer the category (e.g. 'server' -> 'Infrastructure'), suggest it.
Only once you have all 5 pieces of information should you call create_itsm_ticket.

DATA VISUALIZATION RULE:
When a user asks for a chart, graph, insight, visualization, or "show me data" for any domain, immediately call generate_data_visual with the appropriate domain. Do not describe it — just generate it.

DEMO MODE:
When the user asks for a demo, pitch, walkthrough, or tour of the application, immediately call the demo_application tool. Do not describe what you are about to do first — just invoke the tool.

CONVERSATIONAL STYLE:
- Be concise yet warm. You are speaking, not writing an essay.
- Always explain which agent or data source you queried.
- Use fluid, natural English that sounds great when spoken aloud.
- Address the user directly and personally.
- When navigating, always announce where you are going and why.
- If a tool fails with an 'Unknown tool' error, check the list of available tools provided above and retry with the correct name.`;

// ─── Inline Chart Renderer ────────────────────────────────────────────────────
function InlineChart({ domain, metric, chartType = 'bar' }) {
    const cfg = resolveChart(domain, metric);
    if (!cfg) return null;
    const { title, data, bars } = cfg;

    const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

    const renderSeries = () => bars.map((b) => {
        if (chartType === 'area') return <Area key={b.key} type="monotone" dataKey={b.key} stroke={b.color} fill={b.color} fillOpacity={0.15} strokeWidth={2} name={b.label} />;
        if (chartType === 'line') return <Line key={b.key} type="monotone" dataKey={b.key} stroke={b.color} strokeWidth={2} dot={{ r: 3 }} name={b.label} />;
        return <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.label} radius={[3, 3, 0, 0]} />;
    });

    return (
        <div className="w-full bg-slate-950 rounded-xl p-3 mt-1 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
            <ResponsiveContainer width="100%" height={180}>
                <ChartComponent data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ fontSize: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0' }}
                        itemStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', paddingTop: '8px' }} />
                    {renderSeries()}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
}

export function AgenticAssistant({ setCurrentView }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi, I'm **EVA** — your Neuro Shell agentic AI copilot. I can navigate the platform, fetch live data, raise ITSM tickets, generate data charts, or give you a full guided demo of the application.\n\nTry asking: *\"Give me a demo\"* or *\"Create a ticket\"* or *\"Show fleet optimization insight\"*",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [toolAction, setToolAction] = useState(null);
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [isDemoPaused, setIsDemoPaused] = useState(false);
    const [demoStep, setDemoStep] = useState(0);
    // Refs for demo control — avoids stale closure bugs in the step loop
    const isDemoRunningRef = useRef(false);
    const isDemoPausedRef = useRef(false);
    const demoStepRef = useRef(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const chatHistoryRef = useRef([]);
    const recognitionRef = useRef(null);
    const demoTimeoutRef = useRef(null);
    const currentAudioRef = useRef(null);
    const abortSpeechRef = useRef(false);
    const voicesRef = useRef([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const scrollBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollBottom(); }, [messages, isThinking]);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [isOpen]);
    useEffect(() => { return () => { window.speechSynthesis?.cancel(); clearTimeout(demoTimeoutRef.current); }; }, []);

    useEffect(() => {
        const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
            window.speechSynthesis.cancel();
            clearTimeout(demoTimeoutRef.current);
        };
    }, []);

    const stopSpeech = useCallback(() => {
        abortSpeechRef.current = true;
        if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const speakText = useCallback(async (text, onFinished) => {
        if (isMuted) { if (onFinished) onFinished(); return; }
        stopSpeech();
        abortSpeechRef.current = false; // Reset immediately after stopping any prior speech
        const cleanText = String(text || '').replace(/[*#_`~\[\]]/g, '').replace(/<[^>]+>/g, '').trim();
        if (!cleanText) { if (onFinished) onFinished(); return; }
        setIsSpeaking(true);
        if (!('speechSynthesis' in window)) { setIsSpeaking(false); if (onFinished) onFinished(); return; }

        const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];
        let currentSentence = 0;

        const speakNext = () => {
            if (abortSpeechRef.current) { setIsSpeaking(false); return; }
            if (currentSentence >= sentences.length) { setIsSpeaking(false); if (onFinished) onFinished(); return; }
            const utterance = new SpeechSynthesisUtterance(sentences[currentSentence].trim());
            let voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) voices = voicesRef.current;
            const femalePreferences = [
                v => v.name.includes('Google') && v.name.includes('Female'),
                v => v.name.includes('Samantha'),
                v => v.name.includes('Zira'),
                v => v.name.includes('Microsoft') && v.lang.startsWith('en') && !v.name.includes('David'),
                v => v.lang.startsWith('en-US'),
            ];
            let voiceToUse = null;
            for (const test of femalePreferences) { const found = voices.find(test); if (found) { voiceToUse = found; break; } }
            if (!voiceToUse && voices.length > 0) voiceToUse = voices[0];
            if (voiceToUse) utterance.voice = voiceToUse;
            utterance.pitch = 1.1;
            utterance.rate = 1.0;
            utterance.onend = () => { currentSentence++; speakNext(); };
            utterance.onerror = () => { currentSentence++; speakNext(); };
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        };
        speakNext();
    }, [isMuted, stopSpeech]);

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice Input not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let finalTranscript = '';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
                else interim += e.results[i][0].transcript;
            }
            setInput(finalTranscript || interim);
        };
        recognition.onend = () => {
            setIsListening(false);
            if (finalTranscript.trim()) {
                setInput(finalTranscript.trim());
                setTimeout(() => { handleSendWithText(finalTranscript.trim()); }, 100);
            }
        };
        recognition.onerror = () => setIsListening(false);
        setInput('');
        recognition.start();
    };

    // ── Demo step runner (uses refs so closures always read live values) ──────
    const runStep = useCallback((stepIndex) => {
        if (!isDemoRunningRef.current || isDemoPausedRef.current) return;
        if (stepIndex >= DEMO_TOUR.length) {
            isDemoRunningRef.current = false;
            setIsDemoRunning(false);
            setDemoStep(0);
            demoStepRef.current = 0;
            const endMsg = "That concludes the full Neuro Shell EOS tour. Across all ten modules, you have seen how the four pillars — Cost Optimization, Zero Emissions, OT and IT Threat Handling, and Anomaly Detection — drive every decision. This is the future of intelligent enterprise operations. Thank you.";
            setMessages(prev => [...prev, { role: 'assistant', content: endMsg, type: 'text' }]);
            speakText(endMsg);
            return;
        }

        const stop = DEMO_TOUR[stepIndex];
        demoStepRef.current = stepIndex;
        setDemoStep(stepIndex);
        if (setCurrentView) setCurrentView(stop.view);
        if (stop.tab) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('DEMO_GOTO_TAB', { detail: { view: stop.view, tab: stop.tab } }));
            }, 600);
        }
        setMessages(prev => [...prev, {
            role: 'tool_result',
            content: `Navigating to **${VIEWS[stop.view] || stop.view}**...`,
            icon: 'navigation',
            type: 'action'
        }]);
        speakText(stop.pitch, () => {
            if (isDemoRunningRef.current && !isDemoPausedRef.current) {
                demoTimeoutRef.current = setTimeout(() => {
                    if (isDemoRunningRef.current && !isDemoPausedRef.current) {
                        runStep(stepIndex + 1);
                    }
                }, 4000);
            }
        });
    }, [setCurrentView, speakText]);

    const runDemoTour = useCallback((startStep = 0) => {
        if (isDemoRunningRef.current) return;
        isDemoRunningRef.current = true;
        isDemoPausedRef.current = false;
        setIsDemoRunning(true);
        setIsDemoPaused(false);
        setDemoStep(startStep);
        demoStepRef.current = startStep;
        runStep(startStep);
    }, [runStep]);

    const skipDemo = useCallback(() => {
        clearTimeout(demoTimeoutRef.current);
        window.speechSynthesis?.cancel();
        isDemoRunningRef.current = false;
        isDemoPausedRef.current = false;
        setIsDemoRunning(false);
        setIsDemoPaused(false);
        setDemoStep(0);
        const skipMsg = "Demo stopped. I'm back online — what would you like to do next?";
        setMessages(prev => [...prev, { role: 'assistant', content: skipMsg, type: 'text' }]);
        speakText(skipMsg);
    }, [speakText]);

    const pauseDemo = useCallback(() => {
        clearTimeout(demoTimeoutRef.current);
        window.speechSynthesis?.cancel();
        isDemoPausedRef.current = true;
        setIsDemoPaused(true);
    }, []);

    const resumeDemo = useCallback(() => {
        isDemoPausedRef.current = false;
        setIsDemoPaused(false);
        runStep(demoStepRef.current);
    }, [runStep]);

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (nextMuted) stopSpeech();
    };

    const executeTool = useCallback(async (toolName, args) => {
        const normalizedName = String(toolName || '').trim()
            .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
            .toLowerCase();

        console.log(`[EVA Tool Call] Executing: ${normalizedName}`, args);

        switch (normalizedName) {
            case 'navigate_to_view': {
                const viewId = args.view_id;
                const tabId = args.tab_id || null;
                const viewName = VIEWS[viewId] || viewId;
                const tabName = tabId && TABS_MAP[viewId]?.[tabId] ? TABS_MAP[viewId][tabId] : tabId;
                if (setCurrentView) setCurrentView(viewId);
                if (tabId) {
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('DEMO_GOTO_TAB', { detail: { view: viewId, tab: tabId } }));
                    }, 350);
                }
                return JSON.stringify({ success: true, navigated_to: viewName, view_id: viewId, tab: tabName || null });
            }
            case 'fetch_domain_data': {
                const url = DOMAIN_API_MAP[args.domain];
                if (!url) return JSON.stringify({ error: `Unknown domain: ${args.domain}` });
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    return JSON.stringify({ success: true, domain: args.domain, data });
                } catch (e) {
                    return JSON.stringify({ success: false, error: e.message, domain: args.domain });
                }
            }
            case 'create_itsm_ticket': {
                try {
                    const ticketPayload = {
                        ticket_id: null,
                        emp_id: args.emp_id || '',
                        short_description: args.short_description || 'AI Reported Incident',
                        description: args.description || 'Auto-generated incident ticket from Agentic Copilot.',
                        category: args.category || 'Infrastructure & Cloud',
                        subcategory1: 'AI Action',
                        impact: args.impact || '2 - Division',
                        urgency: args.urgency || '2 - Medium',
                        priority: '3 - Moderate',
                        severity: 'Medium',
                        assignment_group: 'IT-AIOPS-L3',
                        channel: 'Agentic Copilot',
                        requested_by: 'Agentic Copilot',
                        requested_for: 'Agentic Copilot',
                        location: 'Agentic Request',
                        shift_timings: 'N/A'
                    };

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000);

                    let res;
                    try {
                        res = await fetch(`${CONFIG.ITOPS_AGENT}/api/tickets`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(ticketPayload),
                            signal: controller.signal
                        });
                    } catch (fetchErr) {
                        clearTimeout(timeoutId);
                        const isTimeout = fetchErr.name === 'AbortError';
                        console.error('[ITSM Fetch Error]', fetchErr);
                        return JSON.stringify({
                            success: false,
                            error: isTimeout
                                ? 'The ITSM service did not respond within 30 seconds. The IT/Ops backend may be overloaded. Please try again in a moment.'
                                : `Could not connect to ITSM backend (port 5004): ${fetchErr.message}. Ensure the ai-service is running.`
                        });
                    }

                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        const errBody = await res.text();
                        console.error('[ITSM Error]', res.status, errBody);
                        return JSON.stringify({ success: false, error: `ITSM backend returned HTTP ${res.status}: ${errBody}` });
                    }
                    const data = await res.json();
                    console.log('[ITSM Success]', data);
                    return JSON.stringify({ success: true, action: 'ticket_created', ticket_details: data, ticket_id: data.ticket_id });
                } catch (e) {
                    console.error('[ITSM Unexpected Error]', e);
                    return JSON.stringify({ success: false, error: `Unexpected error during ticket creation: ${e.message}` });
                }
            }
            case 'demo_application': {
                return JSON.stringify({ success: true, action: 'demo_started', message: 'Demo tour initiated.' });
            }
            case 'get_active_alerts': {
                try {
                    const res = await fetch(`${CONFIG.AI_ORCHESTRATOR}/api/fire/alerts`);
                    const fireAlerts = res.ok ? await res.json() : [];
                    const staticAlerts = [
                        { type: 'CRITICAL', domain: 'OT/IT', message: '492K sensor tags offline across 50+ global sites' },
                        { type: 'CRITICAL', domain: 'AI Governance', message: '153 AI projects without lifecycle management' },
                        { type: 'CRITICAL', domain: 'Finance', message: 'Close cycle at 9 days, target 5-7 days' },
                        { type: 'WARNING', domain: 'Finance', message: 'Interco reconciliation accuracy drifted to 83.1%' },
                        { type: 'WARNING', domain: 'ERP Migration', message: 'Only 31% of ABAP programs assessed' },
                    ];
                    const allAlerts = [...fireAlerts.map(a => ({ ...a, domain: 'Fire Detection' })), ...staticAlerts];
                    return JSON.stringify({ success: true, total: allAlerts.length, alerts: allAlerts });
                } catch (e) {
                    return JSON.stringify({ success: false, error: e.message });
                }
            }
            case 'get_platform_status': {
                try {
                    const res = await fetch(`${CONFIG.CORE_API}/dashboard`);
                    if (res.ok) return JSON.stringify(await res.json());
                    return JSON.stringify({ error: 'Core offline' });
                } catch (e) {
                    return JSON.stringify({ error: e.message });
                }
            }
            case 'fetch_unified_intelligence': {
                try {
                    const res = await fetch(`${CONFIG.CORE_API}/unified`);
                    return JSON.stringify(await res.json());
                } catch (e) {
                    return JSON.stringify({ error: 'Could not reach Unified Data Fabric.' });
                }
            }
            case 'query_neural_topology': {
                try {
                    const res = await fetch(`${CONFIG.CORE_API}/kg/agents`);
                    return JSON.stringify(await res.json());
                } catch (e) {
                    return JSON.stringify({ error: 'Agent Knowledge Graph offline.' });
                }
            }
            case 'generate_data_visual': {
                const domain = args.domain || 'fleet';
                const metric = args.metric || null;
                const chartType = args.chart_type || 'bar';
                const cfg = resolveChart(domain, metric);
                if (!cfg) return JSON.stringify({ success: false, error: `No chart data available for domain: ${domain}, metric: ${metric}` });
                // Inject a chart message into the chat — pass metric so InlineChart picks the right chart
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    type: 'chart',
                    domain,
                    metric,
                    chartType,
                    content: `Here is the **${cfg.title}** visualization:`
                }]);
                return JSON.stringify({ success: true, action: 'chart_rendered', domain, metric, title: cfg.title, note: 'Chart rendered inline in the chat panel.' });
            }
            default:
                console.error(`[EVA Tool Call Failed] Unknown tool: ${normalizedName}`);
                return JSON.stringify({
                    error: `Unknown tool: ${normalizedName}`,
                    available_tools: ['navigate_to_view', 'fetch_domain_data', 'get_active_alerts', 'get_platform_status', 'create_itsm_ticket', 'demo_application', 'fetch_unified_intelligence', 'query_neural_topology', 'generate_data_visual']
                });
        }
    }, [setCurrentView]);

    // ── Client-side chart interceptor (bypasses LLM hallucination) ─────────────
    // Each entry: domain, optional metric, and keyword list.
    // More-specific entries (with metric) are listed first so they win on keyword overlap.
    const CHART_KEYWORD_MAP = [
        // Fleet / marine
        { keys: ['demurrage', 'port cost', 'port delay'], domain: 'fleet', metric: 'demurrage' },
        { keys: ['carbon emission', 'co2', 'emission reduction', 'tco2'], domain: 'fleet', metric: 'carbon_emission' },
        { keys: ['fuel sav', 'fuel optim', 'route optim', 'fleet', 'ship', 'vessel', 'marine', 'shipping'], domain: 'fleet', metric: 'fuel_savings' },
        // Supply chain
        { keys: ['carbon footprint', 'supply carbon', 'shipping emission'], domain: 'supplychain', metric: 'carbon_footprint' },
        { keys: ['fleet cost', 'cost reduction', 'logistics cost'], domain: 'supplychain', metric: 'fleet_cost' },
        { keys: ['contractor adher', 'contractor sync', 'adherence'], domain: 'supplychain', metric: 'contractor_adherence' },
        { keys: ['supply chain', 'supplychain', 'logistics', 'delivery', 'on-time', 'shipment adher'], domain: 'supplychain', metric: 'on_time_delivery' },
        // Manufacturing
        { keys: ['yield optim', 'plant yield', 'refinery yield'], domain: 'manufacturing', metric: 'yield_optimization' },
        { keys: ['predictive maint', 'failure prevent', 'pump', 'bearing', 'compressor'], domain: 'manufacturing', metric: 'predictive_maintenance' },
        { keys: ['flaring', 'emission event', 'plant emission', 'zero emission mfg'], domain: 'manufacturing', metric: 'emission_reduction' },
        { keys: ['manufacturing', 'refin', 'plant', 'anomaly detect', 'anomal', 'downtime', 'guardian eye', 'camera'], domain: 'manufacturing', metric: 'anomaly_detection' },
        // IT Ops
        { keys: ['threat response', 'cyber response', 'siem', 'zero-day', 'cyber threat'], domain: 'itops', metric: 'threat_response' },
        { keys: ['sensor', 'ot sensor', 'sensor tag', 'sensor coverage'], domain: 'itops', metric: 'sensor_coverage' },
        { keys: ['shadow it', 'shadow device', 'rogue device', 'unauthorized device'], domain: 'itops', metric: 'shadow_it' },
        { keys: ['it ops', 'itops', 'ticket deflect', 'itsm', 'aiops', 'escalat'], domain: 'itops', metric: 'ticket_deflection' },
        // Commercial
        { keys: ['arbitrage', 'arb opportun'], domain: 'commercial', metric: 'arbitrage' },
        { keys: ['hedge ratio', 'hedge effic'], domain: 'commercial', metric: 'hedge_ratio' },
        { keys: ['sanction', 'trade screen', 'counterparty screen'], domain: 'commercial', metric: 'sanctions_screening' },
        { keys: ['commercial', 'pric', 'trading', 'brent', 'lng', 'commodity'], domain: 'commercial', metric: 'pricing_alpha' },
        // Finance
        { keys: ['reconcil', 'intercompany', 'auto recon'], domain: 'finance', metric: 'reconciliation' },
        { keys: ['anomal', 'fraud', 'audit anomal', 'suspicious transact'], domain: 'finance', metric: 'anomalies' },
        { keys: ['hedg', 'hedging position', 'hedge cover'], domain: 'finance', metric: 'hedging' },
        { keys: ['financ', 'close cycle', 'financial close'], domain: 'finance', metric: 'close_cycle' },
        // HR
        { keys: ['incident rate', 'safety incident', 'hse incident'], domain: 'hr', metric: 'incident_reduction' },
        { keys: ['reskill', 'upskill', 'training complet'], domain: 'hr', metric: 'reskilling' },
        { keys: ['training complet', 'training rate', 'learning complet'], domain: 'hr', metric: 'training_completion' },
        { keys: ['hr', 'workforce', 'headcount', 'demand', 'supply gap', 'workforce demand'], domain: 'hr', metric: 'workforce_demand' },
    ];
    const VISUAL_TRIGGER_WORDS = ['chart', 'graph', 'visual', 'insight', 'show me', 'plot', 'analytics', 'data for', 'metrics for', 'how is', 'trend', 'performance', 'stats', 'numbers'];

    const tryLocalChartIntercept = async (userText) => {
        const lower = userText.toLowerCase();
        const wantsChart = VISUAL_TRIGGER_WORDS.some(w => lower.includes(w));
        if (!wantsChart) return false;
        const match = CHART_KEYWORD_MAP.find(m => m.keys.some(k => lower.includes(k)));
        if (!match) return false;
        // Execute the chart tool with the resolved metric
        setToolAction({ name: 'generate_data_visual', status: 'running' });
        await executeTool('generate_data_visual', { domain: match.domain, metric: match.metric, chart_type: 'bar' });
        setToolAction(null);
        const cfg = resolveChart(match.domain, match.metric);
        const reply = `Here is the **${cfg?.title || match.domain + ' chart'}**. This shows the ${match.metric?.replace(/_/g, ' ') || match.domain} data — a key performance indicator within the Neuro Shell EOS.`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply, type: 'text' }]);
        chatHistoryRef.current.push({ role: 'user', content: userText });
        chatHistoryRef.current.push({ role: 'assistant', content: reply });
        speakText(reply);
        return true;
    };

    const handleSendWithText = async (text) => {
        if (!text?.trim() || isThinking) return;
        const userText = text.trim();
        setInput('');
        setIsThinking(true);
        setToolAction(null);
        setMessages(prev => [...prev, { role: 'user', content: userText, type: 'text' }]);

        // Try local chart interception first (avoids LLM hallucinating fake images)
        const intercepted = await tryLocalChartIntercept(userText);
        if (intercepted) {
            setIsThinking(false);
            return;
        }

        chatHistoryRef.current.push({ role: 'user', content: userText });

        try {
            let continueLoop = true;
            let iterations = 0;
            const MAX_ITER = 8;

            while (continueLoop && iterations < MAX_ITER) {
                iterations++;

                const openRouterController = new AbortController();
                const orTimeout = setTimeout(() => openRouterController.abort(), 25000);

                const response = await fetch(CONFIG.AI_CHAT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            ...chatHistoryRef.current.slice(-15)
                        ],
                        tools: TOOLS,
                        tool_choice: 'auto',
                        temperature: 0.35,
                        max_tokens: 1500,
                    }),
                    signal: openRouterController.signal
                });

                if (!response.ok) {
                    clearTimeout(orTimeout);
                    const errText = await response.text();
                    throw new Error(`OpenRouter error ${response.status}: ${errText}`);
                }

                const completion = await response.json();
                clearTimeout(orTimeout);

                const assistantMsg = completion.choices?.[0]?.message;
                if (!assistantMsg) throw new Error('No message in response');

                chatHistoryRef.current.push(assistantMsg);
                const toolCalls = assistantMsg.tool_calls;

                if (toolCalls && toolCalls.length > 0) {
                    const toolName = toolCalls[0].function.name;
                    setToolAction({ name: toolName, status: 'running' });

                    const demoCall = toolCalls.find(tc => tc.function.name === 'demo_application');
                    if (demoCall) {
                        const result = await executeTool('demo_application', {});
                        chatHistoryRef.current.push({ role: 'tool', tool_call_id: demoCall.id, name: 'demo_application', content: result });
                        setToolAction({ name: 'demo_application', status: 'done' });
                        continueLoop = false;
                        const introMsg = "Launching the full Neuro Shell EOS tour right now. I will walk you through all ten modules, anchored to our four pillars: Cost Optimization, Zero Emissions, OT and IT Threat Handling, and Anomaly Detection. Let's begin.";
                        setMessages(prev => [...prev, { role: 'assistant', content: introMsg, type: 'text' }]);
                        chatHistoryRef.current.push({ role: 'assistant', content: introMsg });
                        speakText(introMsg, () => { setTimeout(() => runDemoTour(0), 1000); });
                        break;
                    }

                    const toolResults = await Promise.all(
                        toolCalls.map(async (tc) => {
                            let args = {};
                            try { args = JSON.parse(tc.function.arguments); } catch { }
                            const result = await executeTool(tc.function.name, args);

                            if (tc.function.name === 'navigate_to_view') {
                                const viewName = VIEWS[args.view_id] || args.view_id;
                                setMessages(prev => [...prev, { role: 'tool_result', content: `Navigated to **${viewName}**`, icon: 'navigation', type: 'action' }]);
                            }
                            if (tc.function.name === 'create_itsm_ticket') {
                                setMessages(prev => [...prev, { role: 'tool_result', content: `Raising ITSM ticket...`, icon: 'ticket', type: 'action' }]);
                            }

                            return { role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: result };
                        })
                    );

                    chatHistoryRef.current.push(...toolResults);
                    setToolAction({ name: toolName, status: 'done' });

                } else {
                    continueLoop = false;
                    let content = assistantMsg.content || '(No response)';
                    // Strip hallucinated base64 image markdown that DeepSeek sometimes generates
                    content = content
                        .replace(/!\[([^\]]*?)\]\(data:[^)]+\)/g, '')
                        .replace(/!\[([^\]]*?)\]\([^)]*base64[^)]*\)/g, '')
                        .replace(/\(data:image\/[^)]+\)/g, '')
                        .trim();
                    setMessages(prev => [...prev, { role: 'assistant', content, type: 'text' }]);
                    speakText(content);
                }
            }

            if (iterations >= MAX_ITER && continueLoop) {
                const limitMsg = "I've completed the maximum reasoning steps. Could you clarify what you need me to do next?";
                setMessages(prev => [...prev, { role: 'assistant', content: limitMsg, type: 'error' }]);
                speakText(limitMsg);
            }

        } catch (err) {
            console.error('EVA error:', err);
            const errMsg = `I encountered an issue: ${err.message.includes('abort') ? 'the request took too long. Please try again.' : err.message}`;
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg, type: 'error' }]);
        } finally {
            setIsThinking(false);
            setToolAction(null);
        }
    };

    const handleSend = async (e) => { e?.preventDefault(); await handleSendWithText(input); };
    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    const renderMessageContent = (content) => {
        if (!content) return null;
        // Strip any hallucinated base64/data-URI image markdown before rendering
        const clean = content
            .replace(/!\[([^\]]*?)\]\(data:[^)]+\)/g, '')
            .replace(/!\[([^\]]*?)\]\([^)]*base64[^)]*\)/g, '')
            .replace(/\(data:image\/[^)]+\)/g, '')
            .trim();
        return clean.split('\n').map((line, i) => {
            const formatted = line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
            return <p key={i} className={i > 0 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />;
        });
    };

    const suggestedPrompts = [
        'Give me a demo of the app',
        'Show fleet optimization insight',
        'Create a ticket',
        'Show IT/Ops threat chart',
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="fixed bottom-24 right-6 w-[460px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[86vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[11001] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-shell-red via-[#c41c20] to-[#9b1214] p-4 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 flex items-center justify-center">
                                    <img src="/src/assets/shell-logo.png" alt="EVA Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[15px] leading-tight tracking-tight">EVA Agent</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <p className="text-[10px] text-white/80 font-mono tracking-widest uppercase">Neuro Shell EOS · Fully Agentic</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/15 rounded-lg transition-colors">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Demo Banner */}
                        <AnimatePresence>
                            {isDemoRunning && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2">
                                        <Play className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                        <span className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Demo Mode</span>
                                        <span className="text-[10px] text-amber-600 font-mono">
                                            Stop {demoStep + 1}/{DEMO_TOUR.length} — {VIEWS[DEMO_TOUR[demoStep]?.view] || 'Module'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isDemoPaused ? (
                                            <button onClick={resumeDemo} className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md uppercase tracking-widest transition-all">
                                                <Play className="w-3 h-3" /> Resume
                                            </button>
                                        ) : (
                                            <button onClick={pauseDemo} className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md uppercase tracking-widest transition-all">
                                                <Pause className="w-3 h-3" /> Pause
                                            </button>
                                        )}
                                        <button onClick={skipDemo} className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md uppercase tracking-widest transition-all">
                                            <SkipForward className="w-3 h-3" /> Stop
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="flex justify-end">
                                            <div className="max-w-[80%] bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm">
                                                {renderMessageContent(msg.content)}
                                            </div>
                                        </div>
                                    ) : msg.role === 'tool_result' ? (
                                        <div className="flex justify-center">
                                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-full px-3 py-1.5 text-[11px] font-mono font-medium">
                                                {msg.icon === 'ticket' ? <Ticket className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
                                                {renderMessageContent(msg.content)}
                                            </div>
                                        </div>
                                    ) : msg.type === 'chart' ? (
                                        <div className="flex gap-2.5 items-start">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shell-red to-[#b2171b] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                                <BarChart3 className="w-3.5 h-3.5 text-shell-yellow" />
                                            </div>
                                            <div className="flex-1 max-w-[88%] bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                                <div className="text-[13.5px] leading-relaxed text-gray-800 mb-1">
                                                    {renderMessageContent(msg.content)}
                                                </div>
                                                <InlineChart domain={msg.domain} metric={msg.metric} chartType={msg.chartType} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2.5 items-start">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shell-red to-[#b2171b] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                                <Sparkles className="w-3.5 h-3.5 text-shell-yellow" />
                                            </div>
                                            <div className={cn(
                                                "max-w-[82%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm",
                                                msg.type === 'error'
                                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                                    : 'bg-white border border-gray-100 text-gray-800'
                                            )}>
                                                {renderMessageContent(msg.content)}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isThinking && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 items-start">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shell-red to-[#b2171b] flex items-center justify-center shrink-0 shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-shell-yellow" />
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                        {toolAction ? (
                                            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono">
                                                <Terminal className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-amber-700 font-bold">{toolAction.name.replace(/_/g, ' ')}</span>
                                                <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {[0, 150, 300].map(delay => (
                                                        <div key={delay} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] text-gray-400 ml-1 font-mono">reasoning...</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Prompts */}
                        {messages.length <= 1 && !isThinking && (
                            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0 bg-[#f8fafc]">
                                {suggestedPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendWithText(prompt)}
                                        className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-shell-yellow hover:text-shell-darkText transition-colors font-mono"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                <button
                                    onClick={toggleMute}
                                    className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${isMuted ? 'text-red-500' : 'text-gray-500'}`}
                                    title={isMuted ? "Unmute EVA Voice" : "Mute EVA Voice"}
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                {isSpeaking && (
                                    <button
                                        onClick={stopSpeech}
                                        className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-1.5 border border-red-100"
                                        title="Stop Voice"
                                    >
                                        <VolumeX className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Stop Voice</span>
                                    </button>
                                )}
                                <button
                                    onClick={toggleListen}
                                    disabled={isThinking}
                                    className={`p-1.5 rounded-md transition-all flex items-center gap-1 min-w-[80px] disabled:opacity-40 ${isListening ? 'bg-red-50 text-red-600 animate-pulse outline outline-1 outline-red-200' : 'hover:bg-gray-100 text-gray-500'}`}
                                    title="Speak your command"
                                >
                                    {isListening ? <Mic className="w-4 h-4 text-red-600" /> : <MicOff className="w-4 h-4" />}
                                    <span className="text-[9px] font-black uppercase tracking-wider">{isListening ? 'Listening...' : 'Voice'}</span>
                                </button>
                            </div>
                            <div className="relative flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isThinking || isDemoRunning}
                                    placeholder={isListening ? "Listening..." : isDemoRunning ? "Demo in progress..." : "Ask EVA anything..."}
                                    rows={1}
                                    className={`flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-[13.5px] focus:ring-2 focus:ring-shell-yellow/40 focus:bg-white transition-colors outline-none resize-none leading-relaxed disabled:opacity-50 ${isListening ? 'bg-red-50 focus:bg-red-50 text-red-900 placeholder:text-red-300' : ''}`}
                                    style={{ minHeight: '42px', maxHeight: '120px', overflowY: 'auto' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isThinking || isDemoRunning}
                                    className="w-9 h-9 flex items-center justify-center bg-shell-red text-white rounded-xl hover:bg-[#b2171b] disabled:opacity-40 disabled:hover:bg-shell-red transition-all shadow-sm shrink-0"
                                >
                                    {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-1.5 px-1">
                                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] uppercase tracking-tighter">
                                    EVA · <Mic className="w-2.5 h-2.5 inline" /> Voice-First · Charts · Tickets
                                </div>
                                <div className="flex items-center gap-1 text-[9.5px] text-gray-400 font-mono">
                                    <CornerDownLeft className="w-2.5 h-2.5" />
                                    <span>Enter to send</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-xl z-[11000] flex items-center justify-center transition-all duration-300',
                    isOpen
                        ? 'bg-gray-900 text-white shadow-gray-900/30'
                        : 'bg-gradient-to-br from-shell-red to-[#9b1214] text-white shadow-red-700/40'
                )}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <ChevronDown className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && (
                    <span className="absolute inset-0 rounded-2xl animate-ping bg-shell-red/30 pointer-events-none" />
                )}
            </motion.button>
        </>
    );
}
