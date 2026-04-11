const express = require('express');
const cors = require('cors');

// Import the separated data file
const mockData = require('./data');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/dashboard', (req, res) => {
  res.json({
    ...mockData.dashboardData,
    ...mockData.generateStats()
  });
});

app.get('/api/manufacturing', (req, res) => {
  res.json(mockData.manufacturingData);
});

app.get('/api/supplychain', (req, res) => {
  res.json(mockData.supplyChainData);
});

app.get('/api/commercial', (req, res) => {
  res.json(mockData.commercialData);
});

app.get('/api/finance', (req, res) => {
  res.json(mockData.financeData);
});

app.get('/api/hr', (req, res) => {
  res.json(mockData.hrData);
});

app.get('/api/itops', (req, res) => {
  res.json(mockData.itopsData);
});

// Deprecated Agent Endpoint because we moved it to the independent ai-service, but safely preserving it 
app.get('/api/agent', (req, res) => {
  res.json(mockData.agentData);
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port} and loading external data file`);
});
