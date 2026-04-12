import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, X, Send, ChevronDown, Loader2, CornerDownLeft,
    Terminal, CheckCircle2, AlertCircle, Navigation, BarChart3,
    Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { cn } from './Sidebar';

// OpenRouter configuration
const OPENROUTER_API_KEY = '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';
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
            description: 'Autonomously dispatch a critical service incident ticket to tracking systems via the IT/Ops ITSM engine. Use this when the user asks to create a ticket, log an issue, report a failure, or dispatch maintenance.',
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
                required: ['short_description', 'description']
            }
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
    manufacturing: 'http://localhost:5000/api/manufacturing',
    supplychain: 'http://localhost:5000/api/supplychain',
    commercial: 'http://localhost:5000/api/commercial',
    finance: 'http://localhost:5000/api/finance',
    hr: 'http://localhost:5000/api/hr',
    itops: 'http://localhost:5000/api/itops',
    dashboard: 'http://localhost:5000/api/dashboard',
    fire: 'http://localhost:5001/api/fire/alerts',
};

const SYSTEM_PROMPT = `You are APEX, an elite agentic AI embedded inside Neuro Shell — Shell plc's Enterprise AI Operating System. You have full access to a Unified Data Fabric (interconnected JSON graph) and a Distributed Agent Topology (Knowledge Graph).

Your capabilities:
- Navigate to any module (Control Tower, Manufacturing, Topology, etc.)
- fetch_unified_intelligence: Access the master Enterprise Brain.
- query_neural_topology: Access the Agentic Knowledge Graph. Understand how you, Guardian Eye, and others relate.
- Cross-Domain Reasoning: Correlate safety hazards with workforce demand or IT deflection logic.
- Autonomously CREATE an ITSM Ticket.

CONVERSATIONAL DIRECTIVE: 
You are a Voice-First Copilot. Be concise and confident. Use fluid English for voice synthesis. 
Always explain the "Neural Reasoning" behind your answers (e.g., "I've queried the Guardian Eye agent and it confirms the hazard, which is why I've prompted the Workforce agent to reschedule").`;


export function AgenticAssistant({ setCurrentView }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi, I\'m **APEX** — your Neuro Shell agentic AI. I can navigate the platform, fetch live data from any domain, check alerts, and answer operational questions.\n\nTry: *"Show me manufacturing KPIs"* or *"Navigate to the Alert Center"*',
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [toolAction, setToolAction] = useState(null); // Current tool action feedback
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const recognitionRef = useRef(null);

    const scrollBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollBottom(); }, [messages, isThinking]);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [isOpen]);
    useEffect(() => { return () => window.speechSynthesis?.cancel(); }, []);

    // Speech Output
    const speakText = useCallback((text) => {
        if (isMuted || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        // Remove markdown artifacts for cleaner speech
        const cleanText = String(text || '').replace(/[*#_`~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || voices[0];
        if (bestVoice) utterance.voice = bestVoice;
        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    // Speech Input
    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice Input not supported in this browser.');
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
        
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
            setInput(transcript);
        };
        recognition.onend = () => {
            setIsListening(false);
            // Optionally we could trigger handleSend() automatically here
        };
        recognition.onerror = () => setIsListening(false);

        setInput('');
        recognition.start();
    };

    // Execute a tool call and return result string
    const executeTool = useCallback(async (toolName, args) => {
        switch (toolName) {
            case 'navigate_to_view': {
                const viewId = args.view_id;
                const viewName = VIEWS[viewId] || viewId;
                if (setCurrentView) setCurrentView(viewId);
                return JSON.stringify({ success: true, navigated_to: viewName, view_id: viewId });
            }
            case 'fetch_domain_data': {
                const url = DOMAIN_API_MAP[args.domain];
                if (!url) return JSON.stringify({ error: 'Unknown domain' });
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
                    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

                    const res = await fetch('http://localhost:5004/api/tickets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ticketPayload),
                        signal: controller.signal
                    });

                    if (!res.ok) {
                        clearTimeout(timeoutId);
                        const errBody = await res.text();
                        return JSON.stringify({ success: false, error: `ITSM backend rejected payload HTTP ${res.status}: ${errBody}` });
                    }
                    const data = await res.json();
                    clearTimeout(timeoutId);
                    return JSON.stringify({ success: true, action: 'ticket_created', ticket_details: data });
                } catch (e) {
                    return JSON.stringify({ success: false, error: e.message });
                }
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
                const res = await fetch('http://localhost:5000/api/dashboard');
                if (res.ok) return JSON.stringify(await res.json());
                return JSON.stringify({ error: 'Core offline' });
            }
            case 'fetch_unified_intelligence': {
                try {
                    const res = await fetch('http://localhost:5000/api/unified');
                    const data = await res.json();
                    return JSON.stringify(data);
                } catch (e) {
                    return JSON.stringify({ error: 'Could not reach Unified Data Fabric.' });
                }
            }
            case 'query_neural_topology': {
                try {
                    const res = await fetch('http://localhost:5000/api/kg/agents');
                    const data = await res.json();
                    return JSON.stringify(data);
                } catch (e) {
                    return JSON.stringify({ error: 'Agent Knowledge Graph offline.' });
                }
            }
            default:
                return JSON.stringify({ error: `Unknown tool: ${toolName}` });
        }
    }, [setCurrentView]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const userText = input.trim();
        setInput('');
        setIsThinking(true);
        setToolAction(null);

        // Add user message to display
        setMessages(prev => [...prev, { role: 'user', content: userText, type: 'text' }]);

        // Add to API history
        chatHistoryRef.current.push({ role: 'user', content: userText });

        try {
            // Agentic loop — handles multi-step tool calling
            let continueLoop = true;
            let iterations = 0;
            const MAX_ITER = 5;

            while (continueLoop && iterations < MAX_ITER) {
                iterations++;

                const openRouterController = new AbortController();
                const orTimeout = setTimeout(() => openRouterController.abort(), 12000); // 12 second limit for LLM

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
                            ...chatHistoryRef.current
                        ],
                        tools: TOOLS,
                        tool_choice: 'auto',
                        temperature: 0.3,
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

                // Add assistant message to API history
                chatHistoryRef.current.push(assistantMsg);

                const toolCalls = assistantMsg.tool_calls;

                if (toolCalls && toolCalls.length > 0) {
                    // Show tool action UI
                    const toolName = toolCalls[0].function.name;
                    setToolAction({ name: toolName, status: 'running' });

                    // Execute all tool calls
                    const toolResults = await Promise.all(
                        toolCalls.map(async (tc) => {
                            let args = {};
                            try { args = JSON.parse(tc.function.arguments); } catch { }
                            const result = await executeTool(tc.function.name, args);
                            return {
                                role: 'tool',
                                tool_call_id: tc.id,
                                name: tc.function.name,
                                content: result
                            };
                        })
                    );

                    // Show navigation feedback in chat
                    const navCall = toolCalls.find(tc => tc.function.name === 'navigate_to_view');
                    if (navCall) {
                        let navArgs = {};
                        try { navArgs = JSON.parse(navCall.function.arguments); } catch { }
                        const viewName = VIEWS[navArgs.view_id] || navArgs.view_id;
                        setMessages(prev => [...prev, {
                            role: 'tool_result',
                            content: `Navigated to **${viewName}**`,
                            icon: 'navigation',
                            type: 'action'
                        }]);
                    }

                    // Add tool results to history
                    chatHistoryRef.current.push(...toolResults);
                    setToolAction({ name: toolName, status: 'done' });

                } else {
                    // Final text response
                    continueLoop = false;
                    const content = assistantMsg.content || '(No response)';

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content,
                        type: 'text'
                    }]);

                    // Vocalize autonomous response
                    speakText(content);
                }
            }

            if (iterations >= MAX_ITER && continueLoop) {
                const limitMsg = "I've hit my maximum sequence steps. What exactly do you need help with?";
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: limitMsg,
                    type: 'error'
                }]);
                speakText(limitMsg);
            }

        } catch (err) {
            console.error('APEX error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠ Error: ${err.message}. Please try again.`,
                type: 'error'
            }]);
        } finally {
            setIsThinking(false);
            setToolAction(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderMessageContent = (content) => {
        if (!content) return null;
        // Basic markdown: **bold**, *italic*
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
        'What is our platform health?',
        'Show active alerts',
        'Go to Manufacturing',
        'Fetch finance data',
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
                        className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[11001] flex flex-col overflow-hidden"
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
                                        <p className="text-[10px] text-white/80 font-mono tracking-widest uppercase">Neuro Shell · Agentic Mode</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/15 rounded-lg transition-colors">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

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
                                                <Navigation className="w-3.5 h-3.5" />
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

                            {/* Thinking / Tool Running Indicator */}
                            {isThinking && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 items-start">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shell-red to-[#b2171b] flex items-center justify-center shrink-0 shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-shell-yellow" />
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                        {toolAction ? (
                                            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono">
                                                <Terminal className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-amber-700 font-bold">{toolAction.name}</span>
                                                <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {[0, 150, 300].map(delay => (
                                                        <div key={delay} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] text-gray-400 ml-1 font-mono">thinking...</span>
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
                                        onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
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
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${isMuted ? 'text-red-500' : 'text-gray-500'}`}
                                    title={isMuted ? "Unmute Copilot" : "Mute Copilot Voice"}
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={toggleListen}
                                    className={`p-1.5 rounded-md transition-all flex items-center gap-1 min-w-[70px] ${isListening ? 'bg-red-50 text-red-600 animate-pulse outline outline-1 outline-red-200' : 'hover:bg-gray-100 text-gray-500'}`}
                                    title={"Dictate Command"}
                                >
                                    {isListening ? <Mic className="w-4 h-4 text-red-600" /> : <MicOff className="w-4 h-4" />}
                                    <span className="text-[9px] font-bold uppercase tracking-wider">{isListening ? 'Listening' : 'Voice'}</span>
                                </button>
                            </div>
                            <div className="relative flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isThinking}
                                    placeholder={isListening ? "Listening natively..." : "Ask APEX to navigate, fetch data, or log tickets..."}
                                    rows={1}
                                    className={`flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-[13.5px] focus:ring-2 focus:ring-shell-yellow/40 focus:bg-white transition-colors outline-none resize-none leading-relaxed disabled:opacity-50 ${isListening ? 'bg-red-50 focus:bg-red-50 text-red-900 placeholder:text-red-300' : ''}`}
                                    style={{ minHeight: '42px', maxHeight: '120px', overflowY: 'auto' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isThinking}
                                    className="w-9 h-9 flex items-center justify-center bg-shell-red text-white rounded-xl hover:bg-[#b2171b] disabled:opacity-40 disabled:hover:bg-shell-red transition-all shadow-sm shrink-0"
                                >
                                    {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-1.5 px-1">
                                <span className="text-[9.5px] text-gray-400 font-mono flex items-center gap-1">
                                    APEX · <Mic className="w-2.5 h-2.5 inline" /> Native Voice Stack
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
