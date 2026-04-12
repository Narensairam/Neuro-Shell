# Shell AI EOS | Platform Startup Guide

## Platform Features

This is a comprehensive **Industrial ITSM & AIOps Platform** with the following modules:

### 📊 Core Features:
1. **ITSM Hub** - Intelligent ticket management and deflection
2. **OT Security** - Operational Technology threat detection and anomaly detection
3. **Shadow IT Detection** - Identifying unauthorized cloud applications
4. **Predictive Monitoring** - Infrastructure failure risk prediction
5. **Dashboard** - Real-time KPIs and system health visualization

---

## Prerequisites

1. **Python 3.9+** - Download from https://www.python.org/
2. **Node.js 18+** - Download from https://nodejs.org/
3. **Git** (optional) - For version control

---

## Quick Start (Windows)

### Option 1: Automated Startup (Recommended)

Run the launcher script:
```bash
python launch_platform.py
```

This will:
- ✅ Install Python dependencies
- ✅ Install Node.js dependencies  
- ✅ Start FastAPI backend (http://localhost:8000)
- ✅ Start Next.js frontend (http://localhost:3000)

### Option 2: Manual Startup

**Terminal 1 - Python Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
cd backend
python main.py
```

**Terminal 2 - Node.js Frontend:**
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

---

## Access the Platform

Once both services are running:
- 🌐 **Web Interface**: http://localhost:3000
- 🔌 **API Docs**: http://localhost:8000/docs
- 📡 **Health Check**: http://localhost:8000/health

---

## Features Overview

### ITSM Module
- Create, search, and manage tickets
- AI-powered ticket deflection
- Predictive ticket routing
- Ticket history and analytics

### OT Security
- Real-time anomaly detection
- Threat classification
- Device telemetry monitoring
- Security alerts and incidents

### Shadow IT
- Cloud application discovery
- Risk assessment
- Usage analytics
- Compliance reporting

### Predictive Monitoring
- CPU/Memory/Disk trend analysis
- Failure probability calculation
- Multi-metric correlation
- Automated preventive ticketing

### Dashboard
- System health metrics
- Risk indicators
- Performance trends
- Alert summaries

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Install missing dependencies
pip install --upgrade -r requirements.txt
```

### Frontend won't start
```bash
# Clear cache and reinstall
cd frontend
rm -r node_modules package-lock.json
npm install

# Try dev server
npm run dev
```

### Slow initial startup
- First run takes 2-3 minutes as dependencies are installed
- Subsequent runs start in ~30 seconds

---

## API Endpoints

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| ITSM | `/api/itsm/tickets` | GET/POST | List/create tickets |
| ITSM | `/api/itsm/search` | POST | Search and deflect tickets |
| OT | `/api/ot/anomalies` | GET | Get detected anomalies |
| OT | `/api/ot/simulate` | POST | Generate OT telemetry |
| Shadow IT | `/api/shadow/detect` | POST | Detect shadow applications |
| Predictive | `/api/predictive/risk` | POST | Calculate failure risk |

---

## Data Files

All required data is pre-loaded:
- `data/tickets.csv` - Sample ITSM tickets
- `data/itsm_tickets.json` - Persisted ticket storage
- `data/infra_metrics.csv` - Infrastructure telemetry
- `data/ot_knowledge_base.csv` - OT threat patterns
- `data/knowledge_base.csv` - Solution knowledge base

---

## Support

Check the API documentation at `http://localhost:8000/docs` for detailed endpoint specifications.

