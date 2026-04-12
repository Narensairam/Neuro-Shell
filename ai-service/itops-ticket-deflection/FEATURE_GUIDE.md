# Shell AI EOS | Complete Feature Guide

## 🚀 Platform is Running!

Your Industrial ITSM & AIOps platform is now live and ready to use.

### Access Points
- **🌐 Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **🔌 API Server**: [http://localhost:8000](http://localhost:8000)  
- **📚 API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📋 Available Features

### 1. **ITSM Hub** 
**Path**: `/itsm`  
**Purpose**: Enterprise IT Service Management with AI-powered ticket deflection

#### Features:
- **Create Service Incidents** → `/itsm/create`
  - Register new IT tickets with automated telemetry
  - Auto-population of employee information
  - Smart classification and routing
  
- **View Ticket History** → `/itsm/tickets`
  - Complete forensic audit trail
  - Deflection efficacy reports
  - Historical analytics
  
- **Predictive Analytics** → `/itsm/predictive`
  - AI failure risk prediction
  - Intelligent ticket routing
  - Resolution recommendations

**API Endpoints**:
```
GET  /api/tickets              - List all tickets
POST /api/tickets              - Create new ticket
GET  /api/workers              - List assignment groups
GET  /api/metrics/summary      - Dashboard KPIs
```

---

### 2. **OT Security Module**
**Path**: `/itsm/ot`  
**Purpose**: Operational Technology threat detection and anomaly monitoring

#### Features:
- **Real-Time Anomaly Detection**
  - Detects unusual device behavior
  - Identifies potential security threats
  - Monitor SCADA/PLC/ICS systems
  
- **Threat Classification**
  - Automatically categorizes threats
  - Assigns severity levels
  - Compliance validation (IEC 62443)
  
- **Device Telemetry**
  - Live device health monitoring
  - Anomaly scoring
  - Threat probability calculation

**API Endpoints**:
```
GET /api/operational/ot        - Get OT anomalies & threats
POST /api/ot/simulate          - Generate OT telemetry
```

**Risk Levels**:
- 🔴 **Critical** (>90): Immediate escalation required
- 🟠 **High** (70-90): Urgent investigation needed
- 🟡 **Medium** (50-70): Monitor closely
- 🟢 **Low** (<50): Standard monitoring

---

### 3. **Shadow IT Detection**
**Path**: `/itsm/shadow`  
**Purpose**: Discover and assess unauthorized cloud applications

#### Features:
- **Application Discovery**
  - Detects unauthorized SaaS apps
  - Identifies cloud usage patterns
  - Risk assessment per application
  
- **Compliance Reporting**
  - Data residency checks
  - License compliance
  - Regulatory alignment (GDPR, HIPAA, SOX)
  
- **Usage Analytics**
  - User activity tracking
  - Data flow analysis
  - Cost impact estimation

**Risk Categories**:
- **High Risk**: Unsecured data storage, non-compliant
- **Medium Risk**: Limited visibility, some compliance gaps
- **Low Risk**: Approved apps, full compliance

**API Endpoints**:
```
GET /api/operational/shadow    - Get shadow IT alerts
```

---

### 4. **Predictive Monitoring**
**Path**: `/itsm/predictive`  
**Purpose**: Infrastructure health prediction and proactive maintenance

#### Features:
- **Failure Risk Prediction**
  - CPU/Memory exhaustion detection
  - Disk space forecasting
  - Error rate trending
  - Automatic ticket generation for high-risk servers
  
- **Multi-Metric Analysis**
  - Correlates CPU, Memory, Disk, and Error metrics
  - Identifies failure patterns
  - Suggests preventive actions
  
- **Smart Ticketing**
  - Auto-creates preventive maintenance tickets
  - Intelligent assignment to L3 teams
  - 10-minute cooldown to prevent duplicates

**Metrics Tracked**:
- 📊 CPU Usage (0-100%)
- 💾 Memory Utilization (0-100%)  
- 💿 Disk Space (GB)
- ⚠️ Error Count (cumulative)
- 📈 Trend Direction (up/down/stable)

**Failure Risk Calculation**:
```
Risk Score = (CPU_usage * 0.35) + (Memory_usage * 0.35) + (Error_count * 0.30)
```

**API Endpoints**:
```
GET /api/operational/infra     - Get infrastructure metrics
POST /api/predictive/risk      - Calculate failure probability
```

---

### 5. **Master Dashboard**
**Path**: `/` (Root)  
**Purpose**: Unified command center with all platform KPIs

#### Dashboard Sections:

**System Health Pane**:
- Overall system uptime
- Active alerts count
- Service status indicators
- Health percentage (0-100%)

**Risk Index**:
- Global risk score
- Threat count
- Anomaly alerts
- Escalation queue

**Module Performance Cards**:
- ITSM: Ticket deflection rate, avg resolution time
- OT: Detection accuracy, threat count
- Shadow IT: App count, compliance score
- Predictive: Failure prevention percentage

**Quick Access**:
- Create new ticket (+ button)
- View recent incidents
- Access module hubs
- Configure settings

---

## 🔌 API Quick Reference

### Authentication
Currently using open CORS for development. Production requires API key authentication.

```
Header: X-API-Key: <your-api-key>
```

### Request/Response Format

**Create Ticket** (POST /api/tickets):
```json
{
  "requested_by": "John Doe",
  "location": "Building A",
  "category": "Infrastructure",
  "subcategory1": "Server",
  "severity": "High",
  "impact": "2 - Medium",
  "urgency": "2 - Medium",
  "short_description": "Server CPU usage critical",
  "description": "Detailed issue description",
  "configuration_item": "server-prod-01"
}
```

**Response**:
```json
{
  "ticket_id": "INC0001234",
  "created_at": "2024-04-11T10:30:00Z",
  "status": "Created",
  "assigned_to": "Aarav Menon",
  "priority": "P1"
}
```

---

## 💡 Workflow Examples

### Example 1: Proactive Failure Prevention
1. **Predictive Monitoring** identifies server with 87% CPU usage
2. **AI Engine** calculates 78% failure probability
3. **Auto-Ticket** created: `[PREVENTIVE] High failure risk detected`
4. **Escalation** to IT-AIOPS-L3 team
5. **Resolution** before outage occurs

### Example 2: Security Incident Response
1. **OT Module** detects unusual PLC communication pattern
2. **Threat Classifier** labels as `Potential Protocol Injection`
3. **Severity** marked as `High`
4. **Auto-Ticket** created for SOC team
5. **Forensic Audit** logs entire incident timeline

### Example 3: Shadow IT Compliance
1. **Detection Engine** identifies new SaaS app usage
2. **Risk Assessment** finds GDPR compliance gap
3. **Audit Alert** generated
4. **Compliance Team** notified
5. **Remediation** tracked in ticket history

---

## 📊 Data & Persistence

### Stored Data Locations
- **Tickets**: `data/itsm_tickets.json` (persistent across restarts)
- **Telemetry**: `data/*.csv` (sample data files)
- **Knowledge Base**: `data/knowledge_base.csv` (solution database)

### Data Refresh Strategy
- **OT Telemetry**: Real-time simulation with time-based seed
- **Infrastructure Metrics**: 5-minute intervals (simulated)
- **Shadow IT**: Dynamic detection on each request
- **Tickets**: Persistent JSON store with in-memory backup

---

## ⚙️ Configuration

### Backend Settings (backend/main.py)
```python
CORS_ORIGINS = ["http://localhost:3000"]
API_PORT = 8000
TICKET_COOLDOWN = 600  # 10 minutes
FAILURE_RISK_THRESHOLD = 70  # Create ticket if >= 70%
```

### Frontend Settings (frontend/.env)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

---

## 🔧 Troubleshooting

### Backend not responding
```bash
# Check if running
curl http://localhost:8000/health

# Check logs for errors
# Terminal should show FastAPI startup messages
```

### Frontend not connecting
```bash
# Verify CORS is enabled
curl -H "Origin: http://localhost:3000" http://localhost:8000/health

# Check browser console for errors (F12)
```

### Data not updating
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page (F5)
- Check if data files exist in `data/` folder

---

## 📈 Performance Tips

1. **Dashboard Loading**:
   - Hides graphs initially to load KPIs first
   - Graphs render once page is interactive

2. **Ticket Searches**:
   - Uses TF-IDF vectorization (fast)
   - Cosine similarity for matching
   - Results cached in session

3. **OT Monitoring**:
   - Processes 1000+ device telemetry per request
   - Anomaly detection in real-time
   - Efficient numpy/pandas operations

---

## 🎯 Next Steps

1. **Explore Dashboard**: Visit [http://localhost:3000](http://localhost:3000)
2. **Create Sample Ticket**: Go to `/itsm/create` and submit
3. **View Reports**: Check `/itsm/tickets` for history
4. **Check API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
5. **Monitor Systems**: Visit relevant modules for live data

---

## 📞 Support & Documentation

- **Framework**: FastAPI (Python) + Next.js (JavaScript)
- **Database**: JSON file storage (development)
- **ML Models**: Scikit-learn (TF-IDF, similarity)
- **UI Components**: Tailwind CSS, Lucide icons, Framer Motion

For detailed API documentation, visit: **[http://localhost:8000/docs](http://localhost:8000/docs)**

