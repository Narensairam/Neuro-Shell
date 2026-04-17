// Gateway Configuration for Centralized API Access
// In production, BASE_URL should be the public IP or Domain of the backend server.
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5007';

export const CONFIG = {
    // Core Data
    CORE_API: `${BASE_URL}/api`,
    
    // AI Gateway Routes (Proxied through Port 5007)
    AI_ORCHESTRATOR: `${BASE_URL}/api/ai-orchestrator`,
    AI_CHAT:         `${BASE_URL}/api/ai/chat`,
    
    // Individual Agent Gateway Routes
    WORKFORCE_AGENT:  `${BASE_URL}/api/ai-agents/workforce`,
    ITOPS_AGENT:      `${BASE_URL}/api/ai-agents/itops`,
    COMMERCIAL_AGENT: `${BASE_URL}/api/ai-agents/commercial`,
    GOVERNANCE_AGENT: `${BASE_URL}/api/ai-agents/governance`,
    
    // Specialized Streams
    FIRE_STREAM:      `${BASE_URL}/api/fire-stream`,
};
