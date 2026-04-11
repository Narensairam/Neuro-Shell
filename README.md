

## 🚀 Quick Start

To run the full application stack, you need to start three separate services. Open three terminal windows:

### 1. Enterprise Backend (Port 5000)
Provides the core operational data APIs for all domains.
```bash
cd backend
node server.js
```

### 2. AI Reasoning Service (Port 5001)
Proxies requests to OpenRouter and manages real-time hazard alerts.
```bash
cd ai-service
node server.js
```

### 3. Neuro Shell Frontend (Port 5173)
The high-fidelity React dashboard and APEX Agent interface.
```bash
cd frontend
npm install   # If running for the first time
npm run dev
```

The application will be available at: **http://localhost:5173/**

---

## 🤖 APEX Agentic AI
The application features **APEX**, a fully agentic AI assistant powered by **DeepSeek V3** via OpenRouter.
- **Location**: Floating button in the bottom right corner.
- **Capabilities**: Navigation, live data fetching across all domains, and alert monitoring.
- **API Key**: The OpenRouter key is configured in `frontend/src/components/AgenticAssistant.jsx`.

## 📂 Project Structure
- `frontend/`: React application (Vite, Lucide Icons, Recharts, Tailwind CSS).
- `backend/`: Node.js server providing operational domain data.
- `ai-service/`: Node.js server for AI orchestration and fire hazard telemetry.

## 📊 Domain Modules
- **Control Tower**: Global enterprise status overview.
- **Manufacturing**: Real-time yield and asset performance.
- **Supply Chain**: Global logistics and maritime tracking.
- **Finance**: Automated reconciliation and close-cycle monitoring.
- **HR & Safety**: Personnel health and safety incident trends.
- **IT / Cyber**: Autonomous resolution and platform health.
- **Alert Center**: Critical operational events feed.

---

