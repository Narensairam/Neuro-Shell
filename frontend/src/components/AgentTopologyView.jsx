import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Activity, Cpu, Shield, Database, Zap, Sparkles } from 'lucide-react';

const NODE_RADIUS = 35;

const FALLBACK_GRAPH = {
    nodes: [
        { id: "APEX", type: "Orchestrator", name: "APEX Master Brain", domain: "Enterprise-Wide", port: 5000, capabilities: ["Navigation", "Reasoning"], status: "Online", glow: "#dd1d21" },
        { id: "GUARDIAN_EYE", type: "Safety Agent", name: "Guardian Eye", domain: "Fire Safety", port: 5001, capabilities: ["CV Detection"], status: "Online", glow: "#ef4444" },
        { id: "WORKFORCE_ML", type: "HR Agent", name: "Workforce Predictor", domain: "HR Demand", port: 5003, capabilities: ["Forecasting"], status: "Online", glow: "#f59e0b" },
        { id: "ITSM_DISPATCH", type: "Ops Agent", name: "ITOps Dispatcher", domain: "IT Operations", port: 5004, capabilities: ["Ticketing"], status: "Online", glow: "#22c55e" },
        { id: "COMMERCIAL_SAGE", type: "Trading Agent", name: "Commercial Sage", domain: "Trading", port: 5005, capabilities: ["Pricing"], status: "Online", glow: "#3b82f6" }
    ],
    edges: [
        { source: "APEX", target: "GUARDIAN_EYE", relation: "ORCHESTRATES" },
        { source: "APEX", target: "WORKFORCE_ML", relation: "ORCHESTRATES" },
        { source: "APEX", target: "ITSM_DISPATCH", relation: "ORCHESTRATES" },
        { source: "APEX", target: "COMMERCIAL_SAGE", relation: "ORCHESTRATES" }
    ]
};

export function AgentTopologyView() {
    const [graph, setGraph] = useState(FALLBACK_GRAPH);
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [pulsePos, setPulsePos] = useState(0);
    const [unifiedData, setUnifiedData] = useState(null);

    useEffect(() => {
        const fetchUnified = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/unified');
                if (res.ok) {
                    const data = await res.json();
                    setUnifiedData(data);
                }
            } catch (err) {
                console.warn("Unified sync failed:", err);
            }
        };
        fetchUnified();
        const intv = setInterval(fetchUnified, 5000);
        return () => clearInterval(intv);
    }, []);

    useEffect(() => {
        let isMounted = true;
        fetch('http://localhost:5007/api/kg/agents')
            .then(res => res.json())
            .then(data => {
                if (isMounted && data && data.nodes && data.nodes.length > 0) {
                    setGraph(data);
                }
            })
            .catch(err => {
                console.warn("KG Fetch failed, using fallback:", err);
            });

        const interval = setInterval(() => {
            setPulsePos(p => (p + 0.05) % 1.5);
        }, 50);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Simple fixed layout for 5 agents in a circular/pentagon formation
    const layoutNodes = useMemo(() => {
        if (!graph.nodes.length) return [];
        const centerX = 350;
        const centerY = 280;
        const radius = 220;

        return graph.nodes.map((node, i) => {
            if (node.id === 'APEX') return { ...node, x: centerX, y: centerY };
            
            const angle = ((i - 1) * (2 * Math.PI)) / (graph.nodes.length - 1);
            return {
                ...node,
                x: centerX + radius * Math.cos(angle - Math.PI / 2),
                y: centerY + radius * Math.sin(angle - Math.PI / 2)
            };
        });
    }, [graph.nodes]);

    const getEdgeLine = (edge) => {
        const source = layoutNodes.find(n => n.id === edge.source);
        const target = layoutNodes.find(n => n.id === edge.target);
        if (!source || !target) return null;
        return { x1: source.x, y1: source.y, x2: target.x, y2: target.y, id: `${edge.source}-${edge.target}` };
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] p-8 animate-in fade-in duration-700">
            <header className="mb-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                        <Network className="w-6 h-6 text-shell-yellow" />
                    </div>
                    <div>
                        <h1 className="text-[26px] font-black text-shell-darkText tracking-tight uppercase">Agentic Neural Topology</h1>
                        <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">Knowledge Graph · Distributed AI Fabric · multi-agent mesh</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 grid grid-cols-[1fr_340px] gap-8">
                {/* Graph Visualization Canvas */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
                    
                    <svg className="w-full h-full relative z-10 select-none" viewBox="0 0 700 560">
                        {/* Edges */}
                        {graph.edges.map(edge => {
                            const line = getEdgeLine(edge);
                            if (!line) return null;
                            const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
                            
                            return (
                                <g key={line.id}>
                                    <line 
                                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                                        stroke={isHighlighted ? '#dd1d21' : '#e2e8f0'} 
                                        strokeWidth={isHighlighted ? 2 : 1}
                                        className="transition-all duration-300"
                                        strokeDasharray="4 4"
                                    />
                                    {/* Neural Pulse Animation */}
                                    <motion.circle 
                                        r="3" 
                                        fill="#dd1d21" 
                                        initial={{ opacity: 0 }}
                                        animate={{ 
                                            cx: [line.x1, line.x2], 
                                            cy: [line.y1, line.y2],
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{ 
                                            duration: 2, 
                                            repeat: Infinity, 
                                            ease: "linear",
                                            delay: Math.random() * 2
                                        }}
                                    />
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {layoutNodes.map(node => (
                            <motion.g 
                                key={node.id} 
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={() => setSelectedNode(node)}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Outer Glow */}
                                <circle 
                                    cx={node.x} cy={node.y} r={NODE_RADIUS + 8} 
                                    fill={node.glow} 
                                    fillOpacity="0.08"
                                    className="animate-pulse"
                                />
                                
                                {/* Node Main Body */}
                                <circle 
                                    cx={node.x} cy={node.y} r={NODE_RADIUS} 
                                    fill="white" 
                                    stroke={hoveredNode === node.id || selectedNode?.id === node.id ? node.glow : '#e2e8f0'} 
                                    strokeWidth="3"
                                    className="filter drop-shadow-sm transition-colors duration-300"
                                />
                                
                                {/* Icon/Content */}
                                <foreignObject x={node.x - 20} y={node.y - 20} width="40" height="40">
                                    <div className="w-full h-full flex items-center justify-center">
                                        {node.id === 'APEX' ? <Sparkles className="w-7 h-7" style={{ color: node.glow }} /> : <Cpu className="w-5 h-5 text-gray-400" />}
                                    </div>
                                </foreignObject>

                                {/* Label */}
                                <text 
                                    x={node.x} y={node.y + 55} 
                                    textAnchor="middle" 
                                    className="font-mono text-[10px] font-black uppercase tracking-widest fill-shell-darkText"
                                >
                                    {node.name}
                                </text>
                            </motion.g>
                        ))}
                    </svg>
                    
                    <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 p-3 rounded-2xl z-20">
                         <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div><span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Master</span></div>
                         <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Service</span></div>
                         <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div><span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Sync Active</span></div>
                    </div>
                </div>

                {/* Node Detail Sidebar */}
                <div className="flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {selectedNode ? (
                            <motion.div 
                                key={selectedNode.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest`} style={{ backgroundColor: `${selectedNode.glow}15`, color: selectedNode.glow }}>
                                        {selectedNode.type}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-green-600 uppercase">Live</span>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-shell-darkText leading-tight mb-2">{selectedNode.name}</h2>
                                <p className="text-gray-400 text-[12px] font-medium mb-6">Autonomous agent specialized in {selectedNode.domain} domain management.</p>

                                <div className="space-y-6">
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Zap className="w-3.5 h-3.5" /> Core Capabilities
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNode.capabilities.map((cap, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600">
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Database className="w-3.5 h-3.5" /> Neural Endpoint
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-3 font-mono text-[11px] text-shell-yellow overflow-hidden text-ellipsis">
                                            HTTP://LOCALHOST:{selectedNode.port}/API/AGENT
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <button className="w-full py-3 bg-shell-red text-white rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-red-500/20 hover:bg-black transition-colors">
                                        Force Re-Calibration
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
                                <Activity className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
                                <h3 className="font-bold text-gray-400 text-[13px] uppercase tracking-widest">Neural Selection Required</h3>
                                <p className="text-gray-400 text-[11px] mt-2 leading-relaxed">Select a neural agent node to analyze its operational parameters and connectivity data.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Quick Stats Integrated */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden relative group hover:border-shell-yellow transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-16 h-16 text-shell-darkText" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-shell-mutedText uppercase tracking-[0.2em] mb-4">Fabric Health Index</div>
                            <div className="text-4xl font-black text-shell-darkText mb-1">
                                {unifiedData?.enterprise?.health_index || '98.4'}
                                <span className="text-lg text-gray-400 font-normal ml-1">%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-1000" 
                                    style={{ width: `${unifiedData?.enterprise?.health_index || 98.4}%` }}
                                ></div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Real-time Fabric Sync Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
