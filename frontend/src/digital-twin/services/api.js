import { mockNodes, mockEdges, defaultKPIs } from './mockData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async fetchPlantData() {
    await delay(800);
    return {
      nodes: JSON.parse(JSON.stringify(mockNodes)),
      edges: JSON.parse(JSON.stringify(mockEdges)),
      kpis: { ...defaultKPIs }
    };
  },

  async simulateRestructuring(nodes, edges, params) {
    await delay(1200);

    const activeNodes = nodes.filter(
      (n) => n.data.metadata.status !== 'offline'
    ).length;
    const totalNodes = nodes.length;
    const uptimeFactor = totalNodes > 0 ? activeNodes / totalNodes : 0;

    const baseThroughput = 125000;
    const newThroughput =
      baseThroughput *
      params.flowRateMultiplier *
      (params.loadFactor / 100) *
      uptimeFactor;

    const criticalNodes = nodes.filter(
      (n) => n.data.metadata.status === 'critical'
    ).length;
    const warningNodes = nodes.filter(
      (n) => n.data.metadata.status === 'warning'
    ).length;

    let riskScore =
      criticalNodes * 15 +
      warningNodes * 5 +
      (params.flowRateMultiplier > 1.5 ? 20 : 0);
    if (params.maintenanceMode) riskScore -= 10;
    riskScore = Math.max(0, Math.min(100, riskScore));

    const efficiency = Math.min(
      99.9,
      87.3 * (params.loadFactor / 100) * (1.2 - riskScore / 200)
    );

    return {
      efficiency: Number(efficiency.toFixed(1)),
      throughput: Math.round(newThroughput),
      riskScore: Math.round(riskScore),
      energyConsumption: Number(
        (45.2 * params.flowRateMultiplier * (params.loadFactor / 100)).toFixed(1)
      ),
      uptime: Number((96.8 * uptimeFactor).toFixed(1)),
      emissions: Number(
        (12.4 * params.flowRateMultiplier * (params.loadFactor / 80)).toFixed(1)
      )
    };
  }
};
