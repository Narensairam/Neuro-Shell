const generateStats = () => ({
    revenue: Math.floor(Math.random() * 1000) + 500,
    downtime: Math.floor(Math.random() * 10),
    efficiency: Math.floor(Math.random() * 20) + 80,
    incidents: Math.floor(Math.random() * 5),
    production: Math.floor(Math.random() * 10000) + 50000,
});

const dashboardData = {
    title: 'Enterprise AI OS - Control Tower',
    overallHealth: 'Optimal',
    modules: [
        { id: 'mfg', name: 'Manufacturing & Plant Ops', status: 'Active', health: 95 },
        { id: 'scl', name: 'Supply Chain & Logistics', status: 'Active', health: 88 },
        { id: 'com', name: 'Commercial & Trading', status: 'High Volatility', health: 76 },
        { id: 'fin', name: 'Finance & Accounting', status: 'Processing Close', health: 99 },
        { id: 'hr', name: 'Human Resources & Safety', status: 'Active', health: 100 },
        { id: 'it', name: 'IT Ops & Cybersecurity', status: 'Alert Level 2', health: 82 },
    ]
};

const manufacturingData = {
    yieldOptimization: 94.5,
    unplannedDowntimeReduction: 38,
    activeSites: 52,
    alerts: [
        { severity: 'high', message: 'Pressure anomaly detected at Rotterdam CDU-3' },
        { severity: 'medium', message: 'Catalyst deactivation predicted in 48h (Singapore)' }
    ],
    chartData: Array.from({ length: 12 }).map((_, i) => ({ time: `${i}:00`, yield: 80 + Math.random() * 15 }))
};

const supplyChainData = {
    optimalRoutesAdopted: 88.5,
    inventoryChart: Array.from({ length: 14 }).map((_, i) => ({ day: `D${i + 1}`, level: Math.floor(400 + Math.random() * 200) })),
    logisticsAlerts: [
        { type: 'Weather', message: 'LNG tanker route adjusted for typhoon risk in SE Asia' },
        { type: 'Port', message: 'Port of Rotterdam experiencing 4h berth delay.' }
    ]
};

const commercialData = {
    pricingAlpha: 2.4,
    arbitrageDetected: 14.2,
    pricingChart: Array.from({ length: 12 }).map((_, i) => ({
        time: `${8 + i}:00`,
        forecast: 80 + Math.sin(i / 2) * 4,
        actual: 80 + Math.sin(i / 2) * 4 + (Math.random() - 0.5) * 1.5
    }))
};

const financeData = {
    closeCycleDays: 6,
    autoReconRate: 94.2,
    anomaliesDetected: 142,
    reconChart: Array.from({ length: 8 }).map((_, i) => ({ day: `D-${7 - i}`, volume: Math.floor(Math.random() * 5000 + 1000) })),
    transactionsToReview: [
        { entity: 'Singapore Hub', reason: 'Unusual transfer volume' },
        { entity: 'NL Retail', reason: 'Missing tax identifier' }
    ]
};

const hrData = {
    incidentReduction: 42,
    reskillingEmployees: 4150,
    predictiveSafetyAlerts: 18,
    safetyChart: Array.from({ length: 6 }).map((_, i) => ({ month: `M${i + 1}`, incidents: Math.floor(15 - i * 1.5 + Math.random() * 3) }))
};

const itopsData = {
    ticketsDeflected: 48,
    threatsNeutralized: 1450,
    appRationalization: 12,
    ticketChart: Array.from({ length: 12 }).map((_, i) => ({
        hour: `${i * 2}:00`,
        aiResolved: Math.floor(Math.random() * 40 + 60),
        manual: Math.floor(Math.random() * 20 + 10)
    }))
};

const agentData = {
    reply: "I am the Neuro Shell AI Agent. I monitor all domains and can orchestrate multi-agent actions. How can I assist you with the enterprise operating system today?"
};

module.exports = {
    generateStats,
    dashboardData,
    manufacturingData,
    supplyChainData,
    commercialData,
    financeData,
    hrData,
    itopsData,
    agentData
};
