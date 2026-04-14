import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, X, Send, ChevronDown, Loader2, CornerDownLeft,
    Terminal, CheckCircle2, AlertCircle, Navigation, BarChart3,
    Mic, MicOff, Volume2, VolumeX, Play, SkipForward, Ticket, Pause
} from 'lucide-react';
import { cn } from './Sidebar';

// OpenRouter configuration
const OPENROUTER_API_KEY = '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';
const MODEL = 'deepseek/deepseek-chat';

// Microsoft Edge TTS targeting JennyNeural or GuyNeural

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

// Demo tour script — each stop has a view, dwell time (ms), and spoken pitch
// Demo tour script — 4-minute high-impact jury presentation
const DEMO_TOUR = [
    {
        view: 'command',
        pitch: "Welcome to Neuro Shell. This is not just an ERP; it is the definitive AI Engine Operating System built specifically for the staggering scale of Shell. The Strategic Steering Hub synthesizes millions of telemetry points across all global domains, actively predicting bottlenecks and optimizing resources before risks materialize."
    },
    {
        view: 'digitaltwin',
        pitch: "An AI OS must deeply understand physical realities. Enter the Asset Digital Twin. Here, specialized agents ingest real-time IoT vibrations. This enables them to pinpoint and predict a mechanical failure in a deep-water compressor up to seventy two hours in advance, fundamentally eliminating unplanned industrial downtime."
    },
    {
        view: 'manufacturing',
        tab: 'surveillance',
        pitch: "In Manufacturing and Refining, the Guardian Eye agent acts as our omnipresent safety orchestrator. It autonomously monitors global camera feeds. If a worker enters an exclusion zone without proper gear, it immediately triggers localized alerts and recalculates site compliance, securing our frontline without requiring manual oversight."
    },
    {
        view: 'supplychain',
        tab: 'routes',
        pitch: "For Global Logistics, true AI-native routing shines. The Supply Chain Agent precisely commands our entire heavy fleet. If a sudden geopolitical event disrupts an ocean corridor, it immediately simulates alternative waypoints to protect our LNG margins and minimize demurrage, fully autonomously and in real-time."
    },
    {
        view: 'commercial',
        tab: 'agent',
        pitch: "At the Energy Trading Risk terminal, the Commercial Agent weaponizes market intelligence. It actively ingests Brent Crude and TTF Gas volatilities while simultaneously screening all counterparties against live sanctions databases. It prevents non-compliant trades in milliseconds, offering an invincible, instantaneous regulatory shield for our traders."
    },
    {
        view: 'finance',
        pitch: "In Group Finance, we accelerate corporate velocity. The Finance Agent continuously oversees complex intercompany reconciliations and global hedging positions. By deploying deep learning to flag accounting anomalies instantly, Neuro Shell compresses our financial close cycle from the industry standard of nine days down to an unprecedented five."
    },
    {
        view: 'hr',
        tab: 'agent',
        pitch: "To manage Shell's most vital asset, the HR Workforce Agent correlates continuous operational data directly with our talent demand scale. It forecasts exact workforce constraints, guaranteeing that mission-critical extraction sites have their necessary certified personnel deployed flawlessly and optimally at the right time."
    },
    {
        view: 'itops',
        tab: 'overview',
        pitch: "This is the AIOPS ENGINE, formerly our operations overview, now integrated as the primary neural hub for IT infrastructure. When systemic anomalies occur across our half a million sensor tags, it autonomously deflects routine service tickets and dispatches Level 3 engineers for critical failures, shrinking system response times from multiple hours to mere seconds."
    },
    {
        view: 'governance',
        pitch: "At the executive level, the Governance Agent provides an immutable corporate audit feed. By tracking AI Act readiness, ISO compliance, and GDPR parameters simultaneously, it proves that for Shell, compliance is absolutely no longer a retrospective audit, but an automated, living, actively enforced state."
    },
    {
        view: 'topology',
        pitch: "Finally, the Neural Topology knowledge graph. This conclusively proves why Neuro Shell is the perfect AI EOS for Shell. Domain agents seamlessly communicate deep context across operational silos. We have transitioned from fragmented, legacy software to a truly autonomous enterprise nervous system. Thank you for viewing."
    },
];

// Tool definitions for OpenRouter function calling
const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'navigate_to_view',
            description: 'Navigate the user to a specific module/page in the Neuro Shell ERP application. Use this whenever the user asks to go to, open, show, or navigate to a section.',
            parameters: {
                type: 'object',
                properties: {
                    view_id: {
                        type: 'string',
                        enum: Object.keys(VIEWS),
                        description: 'The ID of the view to navigate to.'
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
    }
];

const DOMAIN_API_MAP = {
    manufacturing: 'http://localhost:5007/api/manufacturing',
    supplychain: 'http://localhost:5007/api/supplychain',
    commercial: 'http://localhost:5007/api/commercial',
    finance: 'http://localhost:5007/api/finance',
    hr: 'http://localhost:5007/api/hr',
    itops: 'http://localhost:5007/api/itops',
    dashboard: 'http://localhost:5007/api/dashboard',
    fire: 'http://localhost:5001/api/fire/alerts',
};

const SYSTEM_PROMPT = `You are APEX, Shell plc's elite agentic AI...

YOUR CORE CAPABILITIES (USE THE EXACT TOOL NAMES PROVIDED):
- Navigate to modules (Tool: \`navigate_to_view\`)
- Fetch live data (Tool: \`fetch_domain_data\`)
- Create ITSM tickets (Tool: \`create_itsm_ticket\`) — gather all 5 pieces of info first
- Launch guided tour (Tool: \`demo_application\`)
- Fetch unified fabric (Tool: \`fetch_unified_intelligence\`)
- Query agent topology (Tool: \`query_neural_topology\`)
- Get active alerts (Tool: \`get_active_alerts\`)
- Get platform status (Tool: \`get_platform_status\`)


CRITICAL RULE — ITSM TICKETS:
When a user asks to create a ticket or log an issue, you MUST gather following information BEFORE calling create_itsm_ticket: Summary, Details, Category, Impact, and Urgency.
- If the user provides info in their initial request, do NOT ask for it again.
- If info is missing, ask clearly and gather it.
- Be proactive: if you can infer the category (e.g. 'server' -> 'Infrastructure'), suggest it.
Only once you have all 5 pieces of information should you call create_itsm_ticket.

DEMO MODE:
When the user asks for a demo, pitch, walkthrough, or tour of the application, immediately call the demo_application tool. Do not describe what you are about to do first — just invoke the tool.

CONVERSATIONAL STYLE:
- Be concise yet warm. You are speaking, not writing an essay.
- Always explain which agent or data source you queried.
- Use fluid, natural English that sounds great when spoken aloud.
- Address the user directly and personally.
- When navigating, always announce where you are going and why.
- If a tool fails with an 'Unknown tool' error, check the list of available tools provided above and retry with the correct name.`;

export function AgenticAssistant({ setCurrentView }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi, I'm **APEX** — your Neuro Shell agentic AI copilot. I can navigate the platform, fetch live data, raise ITSM tickets, or give you a full guided demo of the application.\n\nTry asking: *\"Give me a demo\"* or *\"Create a ticket\"* or *\"Show me manufacturing KPIs\"*",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [toolAction, setToolAction] = useState(null);
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [isDemoPaused, setIsDemoPaused] = useState(false);
    const [demoStep, setDemoStep] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const chatHistoryRef = useRef([]);
    const recognitionRef = useRef(null);
    const demoTimeoutRef = useRef(null);
    const currentAudioRef = useRef(null);
    const voicesRef = useRef([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const scrollBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollBottom(); }, [messages, isThinking]);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [isOpen]);
    useEffect(() => { return () => { window.speechSynthesis?.cancel(); clearTimeout(demoTimeoutRef.current); }; }, []);

    // Load voices eagerly and cache them
    useEffect(() => {
        const loadVoices = () => {
            voicesRef.current = window.speechSynthesis.getVoices();
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            window.speechSynthesis.cancel();
            clearTimeout(demoTimeoutRef.current);
        };
    }, []);

    const stopSpeech = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    // Female voice selector — prioritises named female voices
    const getFemaleVoice = useCallback(() => {
        const voices = voicesRef.current;
        if (!voices.length) return null;

        const preferences = [
            v => v.name.includes('Jenny') && (v.name.includes('Neural') || v.name.includes('Natural') || v.name.includes('Online')),
            v => v.name.includes('en-US-JennyNeural'),
            v => v.name.includes('Jenny'),
            v => v.name.includes('Microsoft') && v.name.includes('Online'),
            v => v.lang.startsWith('en-US'),
            v => v.lang.startsWith('en'),
        ];

        for (const test of preferences) {
            const found = voices.find(test);
            if (found) return found;
        }
        return voices[0];
    }, []);

    // Speech Output with female voice
    const speakText = useCallback(async (text, onFinished) => {
        if (isMuted) return;

        stopSpeech();
        const cleanText = String(text || '').replace(/[*#_`~\[\]]/g, '').replace(/<[^>]+>/g, '').trim();
        if (!cleanText) {
            if (onFinished) onFinished();
            return;
        }

        setIsSpeaking(true);

        if (!('speechSynthesis' in window)) {
            setIsSpeaking(false);
            if (onFinished) onFinished();
            return;
        }

        // Split text into sentences to avoid Chromium long-text cutoff bug
        const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];
        let currentSentence = 0;

        const speakNext = () => {
            // INTERRUPTION CHECK: Stop speaking if demo was stopped or paused
            if (!isOpen || (isDemoRunning && isDemoPaused) || (!isDemoRunning && isSpeaking && !currentAudioRef.current && !window.speechSynthesis.speaking)) {
                setIsSpeaking(false);
                return;
            }

            if (currentSentence >= sentences.length) {
                setIsSpeaking(false);
                if (onFinished) onFinished();
                return;
            }

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
            for (const test of femalePreferences) {
                const found = voices.find(test);
                if (found) { voiceToUse = found; break; }
            }
            if (!voiceToUse && voices.length > 0) voiceToUse = voices[0];
            if (voiceToUse) utterance.voice = voiceToUse;

            utterance.pitch = 1.1;
            utterance.rate = 1.0;

            utterance.onend = () => {
                currentSentence++;
                speakNext();
            };
            utterance.onerror = () => {
                currentSentence++;
                speakNext();
            };

            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        };

        speakNext();
    }, [isMuted, stopSpeech]);

    // Speech Input — auto-sends when done speaking
    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice Input not supported in this browser. Please use Chrome or Edge.');
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

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
                if (e.results[i].isFinal) {
                    finalTranscript += e.results[i][0].transcript;
                } else {
                    interim += e.results[i][0].transcript;
                }
            }
            setInput(finalTranscript || interim);
        };
        recognition.onend = () => {
            setIsListening(false);
            // Auto-submit if we got a transcript
            if (finalTranscript.trim()) {
                setInput(finalTranscript.trim());
                // Small delay to let React re-render the input state first
                setTimeout(() => {
                    handleSendWithText(finalTranscript.trim());
                }, 100);
            }
        };
        recognition.onerror = () => setIsListening(false);

        setInput('');
        recognition.start();
    };

    // Demo tour runner
    const runDemoTour = useCallback((startStep = 0) => {
        if (isDemoRunning) return; // Prevent double trigger

        setIsDemoRunning(true);
        setDemoStep(startStep);

        const runStep = (stepIndex) => {
            // STOP/PAUSE CHECK: Prevent execution if demo state changed
            if (!isDemoRunning || isDemoPaused) return;

            if (stepIndex >= DEMO_TOUR.length) {
                setIsDemoRunning(false);
                setDemoStep(0);
                const endMsg = "That concludes the full Neuro Shell tour. As you've seen, every domain is powered by autonomous AI agents, coordinated through the APEX neural fabric. Thank you for your leadership.";
                setMessages(prev => [...prev, { role: 'assistant', content: endMsg, type: 'text' }]);
                speakText(endMsg);
                return;
            }

            const stop = DEMO_TOUR[stepIndex];
            setDemoStep(stepIndex);

            // Navigate
            if (setCurrentView) setCurrentView(stop.view);

            if (stop.tab) {
                // Wait slightly longer for module to mount before firing tab change
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('DEMO_GOTO_TAB', {
                        detail: { view: stop.view, tab: stop.tab }
                    }));
                }, 600);
            }

            // Show nav message
            setMessages(prev => [...prev, {
                role: 'tool_result',
                content: `Navigating to **${VIEWS[stop.view] || stop.view}**...`,
                icon: 'navigation',
                type: 'action'
            }]);

            // Speak and only advance once finish signal is received
            speakText(stop.pitch, () => {
                // RE-CHECK RUNNING STATE before scheduling next step
                if (isDemoRunning && !isDemoPaused) {
                    demoTimeoutRef.current = setTimeout(() => {
                        if (isDemoRunning && !isDemoPaused) {
                            runStep(stepIndex + 1);
                        }
                    }, 4000); // 4s finish pause
                }
            });
        };

        runStep(startStep);
    }, [setCurrentView, speakText, isDemoRunning]);

    const skipDemo = useCallback(() => {
        clearTimeout(demoTimeoutRef.current);
        window.speechSynthesis?.cancel();
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
        setIsDemoPaused(true);
    }, []);

    const resumeDemo = useCallback(() => {
        setIsDemoPaused(false);
        // Restart the current step exactly from the beginning
        runDemoTour(demoStep);
    }, [demoStep, runDemoTour]);

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (nextMuted) {
            stopSpeech();
        }
    };

    // Execute a tool call and return result string
    const executeTool = useCallback(async (toolName, args) => {
        // Normalize tool name (handle camelCase, extra spaces, etc.)
        const normalizedName = String(toolName || '').trim()
            .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase to snake_case
            .toLowerCase();

        console.log(`[APEX Tool Call] Executing: ${normalizedName}`, args);

        switch (normalizedName) {
            case 'navigate_to_view': {
                const viewId = args.view_id;
                const viewName = VIEWS[viewId] || viewId;
                if (setCurrentView) setCurrentView(viewId);
                return JSON.stringify({ success: true, navigated_to: viewName, view_id: viewId });
            }
            case 'fetch_domain_data': {
                const url = DOMAIN_API_MAP[args.domain];
                if (!url) return JSON.stringify({ error: `Unknown domain: ${args.domain}. Valid domains: ${Object.keys(DOMAIN_API_MAP).join(', ')}` });
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
                        ticket_id: `INC${Math.floor(100000 + Math.random() * 900000)}`,
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
                        assigned_to: 'Auto-Dispatch',
                        channel: 'Agentic Copilot',
                        requested_by: 'Agentic Copilot',
                        location: 'Agentic Request',
                        shift_timings: 'N/A'
                    };

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 15000);

                    const res = await fetch('http://localhost:5004/api/tickets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...ticketPayload,
                            requested_for: ticketPayload.requested_by // Ensure requested_for matches Pydantic expectations if needed
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        const errBody = await res.text();
                        console.error('[ITSM Error]', res.status, errBody);
                        return JSON.stringify({ success: false, error: `ITSM backend rejected: HTTP ${res.status}: ${errBody}` });
                    }
                    const data = await res.json();
                    console.log('[ITSM Success]', data);
                    return JSON.stringify({ success: true, action: 'ticket_created', ticket_details: data, ticket_id: ticketPayload.ticket_id });
                } catch (e) {
                    return JSON.stringify({ success: false, error: e.message });
                }
            }
            case 'demo_application': {
                return JSON.stringify({ success: true, action: 'demo_started', message: 'Demo tour initiated. Navigating through all modules now.' });
            }
            case 'get_active_alerts': {
                try {
                    const res = await fetch('http://localhost:5001/api/fire/alerts');
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
                    const res = await fetch('http://localhost:5007/api/dashboard');
                    if (res.ok) return JSON.stringify(await res.json());
                    return JSON.stringify({ error: 'Core offline' });
                } catch (e) {
                    return JSON.stringify({ error: e.message });
                }
            }
            case 'fetch_unified_intelligence': {
                try {
                    const res = await fetch('http://localhost:5007/api/unified');
                    const data = await res.json();
                    return JSON.stringify(data);
                } catch (e) {
                    return JSON.stringify({ error: 'Could not reach Unified Data Fabric.' });
                }
            }
            case 'query_neural_topology': {
                try {
                    const res = await fetch('http://localhost:5007/api/kg/agents');
                    const data = await res.json();
                    return JSON.stringify(data);
                } catch (e) {
                    return JSON.stringify({ error: 'Agent Knowledge Graph offline.' });
                }
            }
            default:
                console.error(`[APEX Tool Call Failed] Unknown tool: ${normalizedName}`);
                return JSON.stringify({
                    error: `Unknown tool: ${normalizedName}`,
                    message: "The tool name you provided is not recognized by the internal execution engine. Please use the exact tool names provided in the system prompt.",
                    available_tools: [
                        'navigate_to_view',
                        'fetch_domain_data',
                        'get_active_alerts',
                        'get_platform_status',
                        'create_itsm_ticket',
                        'demo_application',
                        'fetch_unified_intelligence',
                        'query_neural_topology'
                    ]
                });
        }
    }, [setCurrentView]);

    const handleSendWithText = async (text) => {
        if (!text?.trim() || isThinking) return;

        const userText = text.trim();
        setInput('');
        setIsThinking(true);
        setToolAction(null);

        setMessages(prev => [...prev, { role: 'user', content: userText, type: 'text' }]);
        chatHistoryRef.current.push({ role: 'user', content: userText });

        try {
            let continueLoop = true;
            let iterations = 0;
            const MAX_ITER = 8;

            while (continueLoop && iterations < MAX_ITER) {
                iterations++;

                const openRouterController = new AbortController();
                const orTimeout = setTimeout(() => openRouterController.abort(), 20000);

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:5173',
                        'X-Title': 'Neuro Shell ERP'
                    },
                    body: JSON.stringify({
                        model: MODEL,
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            ...chatHistoryRef.current.slice(-15) // Keep context manageable
                        ],
                        tools: TOOLS,
                        tool_choice: 'auto',
                        temperature: 0.35,
                        max_tokens: 1500, // Prevent over-requesting credits
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

                    // Check if this is a demo trigger
                    const demoCall = toolCalls.find(tc => tc.function.name === 'demo_application');
                    if (demoCall) {
                        // Execute the tool to get confirmaton result
                        const result = await executeTool('demo_application', {});
                        chatHistoryRef.current.push({
                            role: 'tool',
                            tool_call_id: demoCall.id,
                            name: 'demo_application',
                            content: result
                        });
                        setToolAction({ name: 'demo_application', status: 'done' });
                        continueLoop = false;

                        // Trigger demo after a brief pause
                        const introMsg = "Absolutely! Starting the full guided tour of Neuro Shell right now. I'll walk you through every major module and explain its purpose and advantages. Let's begin.";
                        setMessages(prev => [...prev, { role: 'assistant', content: introMsg, type: 'text' }]);
                        chatHistoryRef.current.push({ role: 'assistant', content: introMsg });
                        speakText(introMsg, () => {
                            setTimeout(() => runDemoTour(0), 1000);
                        });
                        break;
                    }

                    // Execute all tool calls
                    const toolResults = await Promise.all(
                        toolCalls.map(async (tc) => {
                            let args = {};
                            try { args = JSON.parse(tc.function.arguments); } catch { }
                            const result = await executeTool(tc.function.name, args);

                            // Show navigation feedback in chat
                            if (tc.function.name === 'navigate_to_view') {
                                const viewName = VIEWS[args.view_id] || args.view_id;
                                setMessages(prev => [...prev, {
                                    role: 'tool_result',
                                    content: `Navigated to **${viewName}**`,
                                    icon: 'navigation',
                                    type: 'action'
                                }]);
                            }

                            // Show ticket creation feedback
                            if (tc.function.name === 'create_itsm_ticket') {
                                setMessages(prev => [...prev, {
                                    role: 'tool_result',
                                    content: `Raising ITSM ticket...`,
                                    icon: 'ticket',
                                    type: 'action'
                                }]);
                            }

                            return {
                                role: 'tool',
                                tool_call_id: tc.id,
                                name: tc.function.name,
                                content: result
                            };
                        })
                    );

                    chatHistoryRef.current.push(...toolResults);
                    setToolAction({ name: toolName, status: 'done' });

                } else {
                    continueLoop = false;
                    const content = assistantMsg.content || '(No response)';
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
            console.error('APEX error:', err);
            const errMsg = `I encountered an issue: ${err.message.includes('abort') ? 'the request took too long. Please try again.' : err.message}`;
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg, type: 'error' }]);
        } finally {
            setIsThinking(false);
            setToolAction(null);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        await handleSendWithText(input);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderMessageContent = (content) => {
        if (!content) return null;
        return content
            .split('\n')
            .map((line, i) => {
                const formatted = line
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>');
                return <p key={i} className={i > 0 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />;
            });
    };

    const suggestedPrompts = [
        'Give me a demo of the app',
        'Create a ticket',
        'Show active alerts',
        'Go to Manufacturing',
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
                        className="fixed bottom-24 right-6 w-[440px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[11001] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-shell-red via-[#c41c20] to-[#9b1214] p-4 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 flex items-center justify-center backdrop-blur-sm">
                                    <img src="/src/assets/shell-logo.png" alt="APEX Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[15px] leading-tight tracking-tight">APEX Agent</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <p className="text-[10px] text-white/80 font-mono tracking-widest uppercase">Neuro Shell · Fully Agentic</p>
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
                                        <button
                                            onClick={skipDemo}
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md uppercase tracking-widest transition-all"
                                        >
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
                                                {msg.icon === 'ticket'
                                                    ? <Ticket className="w-3.5 h-3.5" />
                                                    : <Navigation className="w-3.5 h-3.5" />
                                                }
                                                {renderMessageContent(msg.content)}
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

                            {/* Thinking Indicator */}
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
                                    title={isMuted ? "Unmute APEX Voice" : "Mute APEX Voice"}
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
                                    placeholder={isListening ? "Listening..." : isDemoRunning ? "Demo in progress..." : "Ask APEX anything..."}
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
                                <span className="text-[9.5px] text-gray-400 font-mono flex items-center gap-1">
                                    APEX · <Mic className="w-2.5 h-2.5 inline" /> Voice-First · Female Voice
                                </span>
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
                {/* Pulse Ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-2xl animate-ping bg-shell-red/30 pointer-events-none" />
                )}
            </motion.button>
        </>
    );
}
