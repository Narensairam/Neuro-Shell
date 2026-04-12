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
    console.error('Error writing database:', err);
  }
};

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
        { id: 'mfg', name: 'Manufacturing & Plant Ops', status: db.manufacturing.sites[0].status, health: db.manufacturing.sites[0].health },
        { id: 'scl', name: 'Supply Chain & Logistics', status: 'Active', health: 88 },
        { id: 'com', name: 'Commercial & Trading', status: 'High Volatility', health: 76 },
        { id: 'it', name: 'IT Ops & Cybersecurity', status: 'Alert Level 2', health: 82 },
    ]
  });
});

app.get('/api/manufacturing', (req, res) => {
  res.json(readDB().manufacturing);
});

app.get('/api/supplychain', (req, res) => {
  res.json(readDB().supply_chain);
});

app.get('/api/finance', (req, res) => {
  res.json(readDB().finance);
});

app.get('/api/hr', (req, res) => {
  res.json(readDB().hr);
});

app.get('/api/itops', (req, res) => {
  res.json(readDB().itops);
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

