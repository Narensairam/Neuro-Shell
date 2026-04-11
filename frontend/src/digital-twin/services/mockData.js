export const mockNodes = [
  {
    id: 'node-1',
    type: 'equipment',
    position: { x: 100, y: 250 },
    data: {
      label: 'Crude Storage Tank A',
      type: 'tank',
      metadata: {
        capacity: 500000,
        pressure: 14.7,
        temperature: 25,
        status: 'online'
      }
    }
  },
  {
    id: 'node-2',
    type: 'equipment',
    position: { x: 300, y: 250 },
    data: {
      label: 'Main Feed Pump',
      type: 'pump',
      metadata: {
        flowRate: 125000,
        pressure: 150,
        temperature: 30,
        status: 'online'
      }
    }
  },
  {
    id: 'node-3',
    type: 'equipment',
    position: { x: 500, y: 250 },
    data: {
      label: 'Pre-Heater Train',
      type: 'heater',
      metadata: { pressure: 145, temperature: 350, status: 'warning' }
    }
  },
  {
    id: 'node-4',
    type: 'equipment',
    position: { x: 700, y: 250 },
    data: {
      label: 'Atmospheric Distillation',
      type: 'reactor',
      metadata: {
        capacity: 150000,
        pressure: 25,
        temperature: 370,
        status: 'online'
      }
    }
  },
  {
    id: 'node-5',
    type: 'equipment',
    position: { x: 950, y: 50 },
    data: {
      label: 'Light Naphtha Line',
      type: 'pipeline',
      metadata: {
        flowRate: 25000,
        pressure: 20,
        temperature: 80,
        status: 'online'
      }
    }
  },
  {
    id: 'node-6',
    type: 'equipment',
    position: { x: 950, y: 150 },
    data: {
      label: 'Heavy Naphtha Line',
      type: 'pipeline',
      metadata: {
        flowRate: 30000,
        pressure: 22,
        temperature: 120,
        status: 'online'
      }
    }
  },
  {
    id: 'node-7',
    type: 'equipment',
    position: { x: 950, y: 250 },
    data: {
      label: 'Kerosene Stripper',
      type: 'separator',
      metadata: {
        capacity: 40000,
        pressure: 18,
        temperature: 200,
        status: 'online'
      }
    }
  },
  {
    id: 'node-8',
    type: 'equipment',
    position: { x: 950, y: 350 },
    data: {
      label: 'Diesel Stripper',
      type: 'separator',
      metadata: {
        capacity: 45000,
        pressure: 15,
        temperature: 280,
        status: 'critical'
      }
    }
  },
  {
    id: 'node-9',
    type: 'equipment',
    position: { x: 950, y: 450 },
    data: {
      label: 'Residue Pump',
      type: 'pump',
      metadata: {
        flowRate: 20000,
        pressure: 180,
        temperature: 340,
        status: 'online'
      }
    }
  },
  {
    id: 'node-10',
    type: 'equipment',
    position: { x: 1150, y: 250 },
    data: {
      label: 'Kerosene Storage',
      type: 'tank',
      metadata: {
        capacity: 100000,
        pressure: 14.7,
        temperature: 40,
        status: 'online'
      }
    }
  },
  {
    id: 'node-11',
    type: 'equipment',
    position: { x: 1150, y: 350 },
    data: {
      label: 'Diesel Storage',
      type: 'tank',
      metadata: {
        capacity: 150000,
        pressure: 14.7,
        temperature: 45,
        status: 'offline'
      }
    }
  },
  {
    id: 'node-12',
    type: 'equipment',
    position: { x: 400, y: 150 },
    data: {
      label: 'Bypass Valve A',
      type: 'valve',
      metadata: {
        flowRate: 0,
        pressure: 150,
        temperature: 30,
        status: 'offline'
      }
    }
  }];


export const mockEdges = [
  {
    id: 'e1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true,
    data: { flowRate: 125000, material: 'Crude' }
  },
  {
    id: 'e2-3',
    source: 'node-2',
    target: 'node-3',
    animated: true,
    data: { flowRate: 125000, material: 'Crude' }
  },
  {
    id: 'e3-4',
    source: 'node-3',
    target: 'node-4',
    animated: true,
    data: { flowRate: 125000, material: 'Heated Crude' }
  },
  {
    id: 'e4-5',
    source: 'node-4',
    target: 'node-5',
    animated: true,
    data: { flowRate: 25000, material: 'Light Naphtha' }
  },
  {
    id: 'e4-6',
    source: 'node-4',
    target: 'node-6',
    animated: true,
    data: { flowRate: 30000, material: 'Heavy Naphtha' }
  },
  {
    id: 'e4-7',
    source: 'node-4',
    target: 'node-7',
    animated: true,
    data: { flowRate: 35000, material: 'Kerosene' }
  },
  {
    id: 'e4-8',
    source: 'node-4',
    target: 'node-8',
    animated: true,
    data: { flowRate: 40000, material: 'Diesel' }
  },
  {
    id: 'e4-9',
    source: 'node-4',
    target: 'node-9',
    animated: true,
    data: { flowRate: 20000, material: 'Residue' }
  },
  {
    id: 'e7-10',
    source: 'node-7',
    target: 'node-10',
    animated: true,
    data: { flowRate: 35000, material: 'Kerosene' }
  },
  {
    id: 'e8-11',
    source: 'node-8',
    target: 'node-11',
    animated: false,
    data: { flowRate: 0, material: 'Diesel' }
  },
  {
    id: 'e2-12',
    source: 'node-2',
    target: 'node-12',
    animated: false,
    data: { flowRate: 0, material: 'Crude' }
  },
  {
    id: 'e12-4',
    source: 'node-12',
    target: 'node-4',
    animated: false,
    data: { flowRate: 0, material: 'Crude' }
  }];


export const defaultKPIs = {
  efficiency: 87.3,
  throughput: 125000,
  riskScore: 23,
  energyConsumption: 45.2,
  uptime: 96.8,
  emissions: 12.4
};

