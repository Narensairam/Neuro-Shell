require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// ─── Route Optimization Agent ──────────────────────────────────────────────────
const routeAgent = require('./routeAgent');
app.use('/api/routes', routeAgent);
// ─────────────────────────────────────────────────────────────────────────────

// ─── AI Governance Agent (auto-start on app load) ────────────────────────────
const governanceDir = path.join(__dirname, 'governance');
console.log('[Neuro Shell] Starting AI Governance Agent...');
const governanceAgent = spawn('python', ['app.py'], {
    cwd: governanceDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
});
governanceAgent.stdout.on('data', (d) => process.stdout.write(`[Governance] ${d}`));
governanceAgent.stderr.on('data', (d) => process.stdout.write(`[Governance] ${d}`));
governanceAgent.on('error', (err) => {
    if (err.code === 'ENOENT') console.warn('[Governance] ⚠ python not found in PATH');
    else console.error('[Governance] Error:', err.message);
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── Fire Detection Agent (on-demand via API) ─────────────────────────────────
let fireAgent = null;
const fireAgentDir = path.join(__dirname, 'fire-detection');

app.post('/api/fire/start', (req, res) => {
    if (fireAgent && fireAgent.exitCode === null) {
        return res.json({ status: 'already_running' });
    }
    console.log('[Neuro Shell] Starting Fire Detection Agent...');
    fireAgent = spawn('python', ['main.py'], {
        cwd: fireAgentDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
    });
    fireAgent.stdout.on('data', (d) => process.stdout.write(`[Fire] ${d}`));
    fireAgent.stderr.on('data', (d) => process.stdout.write(`[Fire] ${d}`));
    fireAgent.on('error', (err) => console.error('[Fire] Error:', err.message));
    fireAgent.on('exit', (code) => {
        console.log(`[Fire] Process exited with code ${code}`);
        fireAgent = null;
    });
    res.json({ status: 'started' });
});

app.get('/api/fire/status', (req, res) => {
    const online = fireAgent !== null && fireAgent.exitCode === null;
    res.json({ online });
});

app.get('/api/fire/stats', async (req, res) => {
    try {
        const pyRes = await fetch('http://localhost:5002/api/stats');
        res.json(await pyRes.json());
    } catch {
        res.json({});
    }
});

let cachedAlerts = [];

app.get('/api/fire/alerts', async (req, res) => {
    try {
        const pyRes = await fetch('http://localhost:5002/api/alerts');
        if (pyRes.ok) {
            const data = await pyRes.json();
            cachedAlerts = data;
            return res.json(data);
        }
        res.json(cachedAlerts);
    } catch {
        res.json(cachedAlerts);
    }
});

app.post('/api/fire/normalize', async (req, res) => {
    try {
        cachedAlerts = []; // clear global cache
        await fetch('http://localhost:5002/api/normalize', { method: 'POST' });
        res.json({ status: 'ok' });
    } catch {
        // even if python is dead, clear the cache
        cachedAlerts = [];
        res.json({ status: 'ok' });
    }
});

app.post('/api/fire/stop', (req, res) => {
    if (fireAgent) {
        try {
            if (process.platform === 'win32') {
                exec(`taskkill /pid ${fireAgent.pid} /T /F`);
            } else {
                fireAgent.kill();
            }
        } catch { }
        fireAgent = null;
    }
    res.json({ status: 'stopped' });
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── Simulated Agentic Chat Routing ──────────────────────────────────────────
const routeIntent = (message) => {
    const text = message.toLowerCase();
    if (text.includes('yield') || text.includes('pump') || text.includes('plant') || text.includes('downtime')) {
        return 'manufacturing';
    } else if (text.includes('ship') || text.includes('route') || text.includes('inventory') || text.includes('cargo')) {
        return 'supply_chain';
    } else if (text.includes('trade') || text.includes('price') || text.includes('arbitrage') || text.includes('crude')) {
        return 'commercial';
    } else if (text.includes('close') || text.includes('recon') || text.includes('finance')) {
        return 'finance';
    } else if (text.includes('ticket') || text.includes('server') || text.includes('threat') || text.includes('cyber')) {
        return 'itops';
    } else if (text.includes('safety') || text.includes('contractor') || text.includes('fatigue')) {
        return 'hr';
    }
    return 'orchestrator';
};

const agentResponses = {
    manufacturing: "Manufacturing Agent: I've analyzed the real-time OT data. Vibration in Pump P-204 at Pernis is rising. Yield models suggest a -1.2% dip if unaddressed. Recommending a maintenance window during the next 48 hours.",
    supply_chain: "Logistics Agent: Demand sensing models show optimal routing for MT Serenity avoids the SE Asia typhoon, saving 3.2 days. I've already staged the inventory updates in S/4HANA MM module.",
    commercial: "Trading Agent: I'm tracking the Brent crude forecasting models. Alpha is +2.4% today due to a cross-commodity arbitrage opportunity in European carbon credits. Q2C process auto-matched 90% of invoices.",
    finance: "Finance Agent: Financial close is currently running at 6 days against a 5-day target. AI auto-reconciliation is at 94.2%. I can automatically invoke an exception workflow for 142 anomalies if approved.",
    itops: "Cyber Agent: Our active scanners detected a Shadow IT database on offshore rig 12. I've initiated Zero-Trust throttling and auto-generated an ITSM ServiceNow ticket.",
    hr: "Welfare Agent: Shift fatigue metrics show 3 contractors exceeding heat indices. Our Energy Transition skills mapping has identified 4,150 staff ready for redeployment.",
    orchestrator: "EOS Orchestrator: I am analyzing your request across all ERP domains. Can you please specify if you want to inspect Manufacturing telemetry, Supply Chain routing, Financial closes, or IT Ops stability?"
};

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });
    console.log(`[AI-Service] Received message: "${message}"`);
    setTimeout(() => {
        const intent = routeIntent(message);
        res.json({ reply: agentResponses[intent], domain: intent });
    }, 1500);
});
// ─────────────────────────────────────────────────────────────────────────────

process.on('exit', () => {
    try { governanceAgent.kill(); } catch { }
    try { if (fireAgent) fireAgent.kill(); } catch { }
});

app.listen(port, () => {
    console.log(`Agentic AI Service running on port ${port}`);
});
