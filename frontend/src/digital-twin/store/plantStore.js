import { create } from 'zustand';
import { api } from '../services/api';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';

const defaultParams = {
  flowRateMultiplier: 1.0,
  loadFactor: 100,
  maintenanceMode: false
};

export const usePlantStore = create((set, get) => ({
  nodes: [],
  edges: [],
  kpis: {
    efficiency: 0,
    throughput: 0,
    riskScore: 0,
    energyConsumption: 0,
    uptime: 0,
    emissions: 0
  },
  scenarios: [],
  activeScenarioId: null,
  comparisonScenarioId: null,
  selectedNodeId: null,
  viewMode: '2d',
  simulationParams: defaultParams,
  isSimulating: false,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const data = await api.fetchPlantData();

      const baselineScenario = {
        id: 'baseline',
        name: 'Baseline Operations',
        description: 'Current active plant configuration',
        nodes: JSON.parse(JSON.stringify(data.nodes)),
        edges: JSON.parse(JSON.stringify(data.edges)),
        kpis: { ...data.kpis },
        createdAt: new Date().toISOString(),
        isBaseline: true
      };

      set({
        nodes: data.nodes,
        edges: data.edges,
        kpis: data.kpis,
        scenarios: [baselineScenario],
        activeScenarioId: 'baseline',
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to initialize plant data', error);
      set({ isLoading: false });
    }
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (params) => {
    const newEdge = {
      ...params,
      id: `e${params.source}-${params.target}`,
      animated: true,
      data: { flowRate: 0, material: 'Unknown' }
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId
    });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      )
    });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  updateSimulationParams: (params) => {
    set({ simulationParams: { ...get().simulationParams, ...params } });
  },

  simulateRestructuring: async () => {
    set({ isSimulating: true });
    try {
      const { nodes, edges, simulationParams } = get();
      const newKpis = await api.simulateRestructuring(
        nodes,
        edges,
        simulationParams
      );
      set({ kpis: newKpis, isSimulating: false });
    } catch (error) {
      console.error('Simulation failed', error);
      set({ isSimulating: false });
    }
  },

  saveScenario: (name, description) => {
    const { nodes, edges, kpis, scenarios } = get();
    const newScenario = {
      id: `scenario-${Date.now()}`,
      name,
      description,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      kpis: { ...kpis },
      createdAt: new Date().toISOString(),
      isBaseline: false
    };
    set({
      scenarios: [...scenarios, newScenario],
      activeScenarioId: newScenario.id
    });
  },

  loadScenario: (id) => {
    const scenario = get().scenarios.find((s) => s.id === id);
    if (scenario) {
      set({
        nodes: JSON.parse(JSON.stringify(scenario.nodes)),
        edges: JSON.parse(JSON.stringify(scenario.edges)),
        kpis: { ...scenario.kpis },
        activeScenarioId: id,
        selectedNodeId: null
      });
    }
  },

  setComparisonScenario: (id) => set({ comparisonScenarioId: id })
}));
