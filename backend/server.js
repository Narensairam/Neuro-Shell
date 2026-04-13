const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;
const DB_PATH = path.join(__dirname, 'unified_core.json');
const DB_GRAPH_PATH = path.join(__dirname, 'agent_graph.json');

app.use(cors());
app.use(express.json());

// Helper to read DB
const readDB = (targetPath = DB_PATH) => {
  try {
    const data = fs.readFileSync(targetPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database:', err);
    return {};
  }
};


// Helper to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
  }
};

app.get('/api/test', (req, res) => {
  res.json({ message: 'hello world' });
});

// --- API ENDPOINTS ---

// Master God View (Unified Graph)
app.get('/api/unified', (req, res) => {
  res.json(readDB());
});

// Agentic Knowledge Graph Topology
app.get('/api/kg/agents', (req, res) => {
  res.json(readDB(DB_GRAPH_PATH));
});

app.get('/api/dashboard', (req, res) => {
  const db = readDB();
  res.json({
    ...db.enterprise,
    modules: [
        { id: 'mfg', name: 'Manufacturing & Plant Ops', status: db.industrial_ops?.refineries?.[0]?.status || 'Active', health: db.industrial_ops?.refineries?.[0]?.health || 95 },
        { id: 'scl', name: 'Supply Chain & Logistics', status: 'Active', health: db.global_logistics?.route_efficiency || 88 },
        { id: 'com', name: 'Commercial & Trading', status: 'High Volatility', health: db.energy_trading_risk?.pricing_optimization_lift ? 80 : 76 },
        { id: 'it', name: 'IT Ops & Cybersecurity', status: 'Active', health: db.system_ops_cyber?.incident_deflection_rate || 82 },
    ]
  });
});

app.get('/api/manufacturing', (req, res) => {
  console.log('GET /api/manufacturing called');
  const db = readDB();
  const ops = db.industrial_ops || {};
  const responseData = {
    yieldOptimization: ops.overall_yield || 0,
    unplannedDowntimeReduction: 22,
    activeSites: ops.active_refineries || 0,
    alerts: (ops.safety_alerts || []).map(a => ({ severity: a.severity, message: a.message })),
    chartData: [
        { time: '00:00', yield: 92 }, { time: '04:00', yield: 94 }, { time: '08:00', yield: 93 },
        { time: '12:00', yield: 95 }, { time: '16:00', yield: 94 }, { time: '20:00', yield: 96 }
    ]
  };
  console.log('Sending response:', JSON.stringify(responseData).substring(0, 100));
  res.json(responseData);
});

app.get('/api/supplychain', (req, res) => {
  const db = readDB();
  const log = db.global_logistics || {};
  res.json({
    optimalRoutesAdopted: log.route_efficiency || 0,
    inventoryChart: [
        { day: 'D1', level: 85 }, { day: 'D2', level: 78 }, { day: 'D3', level: 92 },
        { day: 'D4', level: 88 }, { day: 'D5', level: 74 }, { day: 'D6', level: 60 },
        { day: 'D7', level: 82 }, { day: 'D8', level: 85 }, { day: 'D9', level: 78 },
        { day: 'D10', level: 92 }, { day: 'D11', level: 88 }, { day: 'D12', level: 74 },
        { day: 'D13', level: 60 }, { day: 'D14', level: 82 }
    ],
    logisticsAlerts: [
        { type: 'Weather', message: 'Heavy seas in North Atlantic impacting tanker routes.', severity: 'Medium' },
        { type: 'Infrastructure', message: 'Scheduled maintenance at Rotterdam Berth 4 delayed by 12h.', severity: 'Low' },
        { type: 'Customs', message: 'New EU Carbon border adjustment protocol causing LASH delays in Hamburg.', severity: 'High' }
    ]
  });
});

app.get('/api/finance', (req, res) => {
  const db = readDB();
  const fin = db.group_finance || {};
  res.json({
    closeCycleDays: fin.close_cycle_days || 0,
    autoReconRate: fin.auto_recon_rate || 0,
    anomaliesDetected: 3,
    reconChart: [
        { day: 'D-7', volume: 400 }, { day: 'D-6', volume: 300 }, { day: 'D-5', volume: 500 },
        { day: 'D-4', volume: 450 }, { day: 'D-3', volume: 600 }, { day: 'D-2', volume: 550 },
        { day: 'D-1', volume: 650 }, { day: 'D-0', volume: 700 }
    ],
    transactionsToReview: [
        { entity: 'Shell Energy Europe', reason: 'Unmatched metadata', value: '$1.2M' },
        { entity: 'Equilon Enterprises', reason: 'Tax variance', value: '$450k' }
    ]
  });
});

app.get('/api/hr', (req, res) => {
  const db = readDB();
  const hr = db.workforce_hse || {};
  res.json({
    incidentReduction: hr.recordable_incident_reduction || 0,
    reskillingEmployees: hr.reskilling_index || 0,
    predictiveSafetyAlerts: 12,
    safetyChart: [
        { month: 'Jan', incidents: 45 }, { month: 'Feb', incidents: 38 }, { month: 'Mar', incidents: 32 },
        { month: 'Apr', incidents: 28 }, { month: 'May', incidents: 24 }
    ]
  });
});

app.get('/api/itops', (req, res) => {
  const db = readDB();
  const it = db.system_ops_cyber || {};
  res.json({
    ticketsDeflected: it.incident_deflection_rate || 0,
    threatsNeutralized: it.threat_neutralization_count || 0,
    appRationalization: 1425,
    ticketChart: [
        { hour: '08:00', aiResolved: 40, manual: 10 },
        { hour: '12:00', aiResolved: 65, manual: 15 },
        { hour: '16:00', aiResolved: 55, manual: 12 },
        { hour: '20:00', aiResolved: 30, manual: 5 }
    ]
  });
});

app.get('/api/commercial', (req, res) => {
    const db = readDB();
    const com = db.energy_trading_risk || {};
    res.json({
        pricingAlpha: com.pricing_optimization_lift || 0,
        arbitrageDetected: 14.2,
        pricingChart: Array.from({ length: 12 }).map((_, i) => ({
            time: `${8 + i}:00`,
            forecast: 80 + Math.sin(i / 2) * 4,
            actual: 80 + Math.sin(i / 2) * 4 + (Math.random() - 0.5) * 1.5
        }))
    });
});

// Sync Endpoint for External AI Agents (Fire, ITSM, etc)
app.post('/api/sync', (req, res) => {
  const { domain, data } = req.body;
  if (!domain || !data) return res.status(400).json({ error: 'Missing domain or data' });
  
  const db = readDB();
  db[domain] = { ...db[domain], ...data };
  db.enterprise.last_sync = new Date().toISOString();
  
  writeDB(db);
  res.json({ success: true, domain });
});

app.listen(port, () => {
  console.log(`Unified Core Logic listening on port ${port}`);
});

