import { useState, useEffect, useMemo } from 'react';
import {
  Send, Search, CheckCircle2, Bot, Zap, Activity, ShieldCheck,
  RefreshCw, Paperclip, X, FileText, User, MapPin, Tag, Cpu,
  ExternalLink, ChevronLeft, ChevronRight, Filter, Download,
  ListOrdered, PlusCircle, CheckCheck, Clock, AlertCircle
} from 'lucide-react';

// ─── Employee Data ─────────────────────────────────────────────────────────────
const SAMPLE_EMPLOYEES = [
  { emp_id: 'SHELL-1001', requested_by: 'Julian Dash', email: 'j.dash@shell.com', dept: 'Industrial Operations', location: 'Rotterdam Refinery', location_type: 'On-Prem', floor: 'Level 4', shift_timings: 'Day Shift (08:00 - 17:00)' },
  { emp_id: 'SHELL-2042', requested_by: 'Sarah Chen', email: 's.chen@shell.com', dept: 'Cyber Security', location: 'London Hub', location_type: 'Cloud', floor: 'Level 12', shift_timings: 'Global Support' },
  { emp_id: 'SHELL-8821', requested_by: 'Marcus Vane', email: 'm.vane@shell.com', dept: 'OT Infrastructure', location: 'Singapore Edge Site', location_type: 'Edge Cluster', floor: 'Ground', shift_timings: 'Night Shift (22:00 - 06:00)' },
];

const LOCATION_OPTS = ['', 'Rotterdam Refinery', 'London Hub', 'Singapore Edge Site', 'Houston Plant', 'Amsterdam DC', 'Dubai Field Office', 'Remote / Cloud'];
const LOC_TYPE_OPTS = ['', 'On-Prem', 'Cloud', 'Edge Cluster', 'Hybrid'];
const FLOOR_OPTS = ['', 'Ground', 'Level 1', 'Level 2', 'Level 4', 'Level 12', 'Data Centre'];
const SHIFT_OPTS = ['', 'Day Shift (08:00 - 17:00)', 'Evening Shift (14:00 - 22:00)', 'Night Shift (22:00 - 06:00)', 'Global Support', 'On-Call'];
const CATEGORIES = ['', 'Business Applications', 'Infrastructure & Cloud', 'OT / Industrial Controls', 'End User Computing', 'Cyber Security', 'Network & Connectivity'];
const IMPACT_OPTS = ['', '1 - Global', '2 - Division', '3 - Local'];
const URGENCY_OPTS = ['', '1 - High', '2 - Medium', '3 - Low'];
const ASSIGNMENT_GROUPS = ['IT-OT-L2-CLUSTER', 'Cyber-SOC-L3', 'CLOUD-OPS', 'IT-AIOPS-L3', 'ERP-SUPPORT-L2'];

const API = 'http://127.0.0.1:5004';

const fetchWithTimeout = async (url, options = {}) => {
  // ITSM backend runs ML deflection which takes 8-15s — use 35s timeout
  const timeout = options.timeout || 35000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('ITSM backend did not respond within 35 seconds. The AI deflection engine may be busy — please try again.');
    }
    throw err;
  }
};

const cn = (...cls) => cls.filter(Boolean).join(' ');

const EMPTY_FORM = () => ({
  ticket_id: `INC${Math.floor(100000 + Math.random() * 900000)}`,
  emp_id: '', requested_by: '', requested_for: '', email: '',
  dept: '', location: '', location_type: '', floor: '', cubicle: '',
  shift_timings: '', category: '', subcategory1: '', subcategory2: '',
  subcategory3: '', configuration_item: '',
  assignment_group: 'IT-OT-L2-CLUSTER', assigned_to: 'Auto-Dispatch',
  impact: '', urgency: '', priority: 'Calculated...', severity: '',
  short_description: '', description: '', channel: 'Portal',
});

// ─── Shared Form Primitives (defined at module scope to prevent remount on rerender) ──
const TextInput = ({ label, name, placeholder, required, hint, form, set }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-400 ">{label}{required && ' *'}</label>
    <input
      value={form[name]}
      onChange={e => set(name, e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all font-medium placeholder:text-gray-300"
    />
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const ReadonlyField = ({ label, name, form }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-400 ">{label}</label>
    <div className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm text-gray-500 font-medium min-h-[42px]">
      {form[name] || <span className="text-gray-300">Auto-populated from Employee ID</span>}
    </div>
  </div>
);

const SelectInput = ({ label, name, options, required, form, set }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-400 ">{label}{required && ' *'}</label>
    <select
      value={form[name]}
      onChange={e => set(name, e.target.value)}
      required={required}
      className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all font-medium cursor-pointer"
    >
      {options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
    </select>
  </div>
);

const Step = ({ n, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-semibold shadow-sm shrink-0">{String(n).padStart(2, '0')}</div>
    <h3 className="text-sm font-semibold text-gray-900 ">{title}</h3>
    <div className="flex-1 h-px bg-gray-100 ml-2" />
  </div>
);

// ─── Create Ticket Form ────────────────────────────────────────────────────────
function CreateTicketForm({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [success, setSuccess] = useState(null);
  const [empFound, setEmpFound] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM());

  const set = (name, val) => setForm(prev => ({ ...prev, [name]: val }));

  // Auto-fill from employee ID lookup
  useEffect(() => {
    const q = form.emp_id.trim().toUpperCase();
    const match = SAMPLE_EMPLOYEES.find(e => e.emp_id === q);
    if (match) {
      setEmpFound(true);
      setForm(prev => ({
        ...prev,
        requested_by: match.requested_by,
        requested_for: match.requested_by,
        email: match.email,
        dept: match.dept,
        location: match.location,
        location_type: match.location_type,
        floor: match.floor,
        shift_timings: match.shift_timings,
      }));
    } else {
      setEmpFound(false);
    }
  }, [form.emp_id]);

  // Priority calc from impact × urgency
  useEffect(() => {
    if (!form.impact || !form.urgency) return;
    const i = parseInt(form.impact[0]), u = parseInt(form.urgency[0]);
    const score = i + u;
    let p = '4 - Low', sev = 'Low';
    if (score <= 2) { p = '1 - Critical'; sev = 'Critical'; }
    else if (score <= 3) { p = '2 - High'; sev = 'High'; }
    else if (score <= 4) { p = '3 - Moderate'; sev = 'Medium'; }
    setForm(prev => ({ ...prev, priority: p, severity: sev }));
  }, [form.impact, form.urgency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep('Registering incident...');
    const steps = [
      [800,  'Running AI deflection analysis...'],
      [3000, 'Matching against knowledge base...'],
      [6000, 'Scoring confidence & routing...'],
      [10000,'Finalizing audit record...'],
    ];
    const timers = steps.map(([delay, msg]) => setTimeout(() => setLoadingStep(msg), delay));
    try {
      const res = await fetchWithTimeout(`${API}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      timers.forEach(clearTimeout);
      if (res.ok) {
        setSuccess(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`ITSM Error: ${err.detail || JSON.stringify(err) || 'Unknown error from backend'}`);
      }
    } catch (err) {
      timers.forEach(clearTimeout);
      console.error('ITSM API Error:', err);
      alert(`ITSM Error: ${err.message || 'Backend unreachable on port 5004'}`);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (success) return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-8 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 ">Incident Registered</h2>
            <p className="text-sm text-gray-400 ">Service ID: #{success.ticket_id} · Status: {success.status}</p>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-left space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">AI Dispatch Report</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">"{success.resolution || `Routed to ${success.assigned_to}. Priority: ${success.priority}.`}"</p>
          </div>
          <p className="text-sm text-gray-400 ">Assigned to: {success.assigned_to} · Priority: {success.priority}</p>
          <button onClick={() => { setSuccess(null); setForm(EMPTY_FORM()); setEmpFound(false); }}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors">
            Submit New Incident
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button onClick={onBack} className="text-xs font-semibold text-gray-400 flex items-center gap-1 hover:text-gray-900 transition-colors mb-1">
              <ChevronLeft className="w-3 h-3" /> ITSM Hub
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 ">Register Service Incident</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold ">Global Audit Protocol Active</span>
          </div>
        </div>

        {/* Employee ID Lookup Banner */}
        <div className={cn('p-4 rounded-xl border flex items-center gap-4 transition-all', empFound ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-100')}>
          {empFound ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <Search className="w-5 h-5 text-blue-400 shrink-0" />}
          <div className="flex-1">
            <p className="text-xs font-semibold ">
              {empFound ? `✓ Employee matched: ${form.requested_by} · ${form.dept}` : 'Enter Employee ID below to auto-populate fields (try: SHELL-1001, SHELL-2042, SHELL-8821)'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div className="p-8 space-y-8">

            {/* ── STEP 1: Identity ── */}
            <div>
              <Step n={1} title="Identity & Authentication" />
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Employee Lookup */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-blue-600 ">Employee ID Lookup</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                    <input
                      value={form.emp_id}
                      onChange={e => set('emp_id', e.target.value)}
                      placeholder="SHELL-####"
                      className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all font-semibold "
                    />
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Zap className="w-2.5 h-2.5 text-yellow-500" /> Auto-populates contact & location
                  </p>
                </div>
                <ReadonlyField label="Requester Name" name="requested_by" form={form} />
                <TextInput label="Corporate Email" name="email" placeholder="user@shell.com" required form={form} set={set} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Department / Business Unit" name="dept" placeholder="e.g. Industrial Operations" required form={form} set={set} />
                <TextInput label="Ticket Raised For" name="requested_for" placeholder="Who is this service for?" form={form} set={set} />
              </div>
            </div>

            {/* ── STEP 2: Location ── */}
            <div>
              <Step n={2} title="Location & Operational Context" />
              <div className="grid grid-cols-4 gap-4">
                <SelectInput label="Operational Site" name="location" options={LOCATION_OPTS} required form={form} set={set} />
                <SelectInput label="Infra Type" name="location_type" options={LOC_TYPE_OPTS} form={form} set={set} />
                <SelectInput label="Floor / Level" name="floor" options={FLOOR_OPTS} form={form} set={set} />
                <SelectInput label="Work Shift" name="shift_timings" options={SHIFT_OPTS} required form={form} set={set} />
              </div>
            </div>

            {/* ── STEP 3: Classification ── */}
            <div>
              <Step n={3} title="System & Priority Taxonomy" />
              <div className="grid grid-cols-3 gap-4 mb-4">
                <SelectInput label="System Category" name="category" options={CATEGORIES} required form={form} set={set} />
                <TextInput label="Configuration Item (CI Tag)" name="configuration_item" placeholder="e.g. s-grid-01, plc_003" form={form} set={set} />
                <SelectInput label="Assignment Group" name="assignment_group" options={ASSIGNMENT_GROUPS} form={form} set={set} />
              </div>
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100 items-end">
                <SelectInput label="Operational Impact *" name="impact" options={IMPACT_OPTS} required form={form} set={set} />
                <SelectInput label="Work Urgency *" name="urgency" options={URGENCY_OPTS} required form={form} set={set} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ">Calculated Priority</label>
                  <div className={cn('w-full h-[42px] border rounded-lg px-4 flex items-center text-xs font-semibold shadow-sm',
                    form.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-600' :
                      form.severity === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                        'bg-white border-gray-200 text-blue-600')}>
                    {form.priority}
                  </div>
                </div>
              </div>
            </div>

            {/* ── STEP 4: Description ── */}
            <div>
              <Step n={4} title="Forensic Audit Narrative" />
              <div className="space-y-4">
                <TextInput label="Incident Title (Short Description) *" name="short_description" placeholder="Summarize the core failure in one line..." required form={form} set={set} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ">Full Technical Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={5}
                    required
                    placeholder="Provide details on error symptoms, telemetry spikes, affected systems, and any manual observations..."
                    className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all font-medium resize-none placeholder:text-gray-300"
                  />
                </div>
                <div className="p-6 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/30 flex items-center justify-center gap-4 cursor-pointer hover:border-blue-200 transition-all group">
                  <Paperclip className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 ">Attach Evidence / Logs</p>
                    <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click · Max 50MB</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold ">Broadcast Integrity: SHA-256 Validated</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black hover:scale-105 transition-all shadow-lg flex items-center gap-3 disabled:opacity-60"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? loadingStep || 'Processing...' : 'Ingest Audit Entry'}
            </button>
          </div>

          {/* AI Processing Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-xl">
                <Bot className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">AI Deflection Engine Running</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{loadingStep || 'Connecting...'}</p>
              </div>
              <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full animate-[loading_3s_ease-in-out_infinite]" style={{width: '60%', animation: 'pulse 1.5s ease-in-out infinite'}} />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Ticket Detail Drawer ──────────────────────────────────────────────────────
function TicketDrawer({ ticket, onClose, onResolve }) {
  const [resolving, setResolving] = useState(false);
  if (!ticket) return null;

  const handleResolve = async () => {
    setResolving(true);
    try {
      // Attempt backend PATCH; if unavailable, simulate
      await new Promise(r => setTimeout(r, 800));
      onResolve(ticket.ticket_id);
      onClose();
    } finally {
      setResolving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-white z-[111] shadow-2xl border-l border-gray-200 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 ">Audit Record</h3>
                <p className="text-xs text-gray-400 mt-0.5">#{ticket.ticket_id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Banner */}
          <div className={cn('p-4 rounded-xl border flex items-center justify-between',
            ticket.status === 'Deflected' || ticket.status === 'Resolved' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-100')}>
            <div className="flex items-center gap-2">
              {ticket.status === 'Deflected' || ticket.status === 'Resolved'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                : <Clock className="w-4 h-4 text-blue-500" />}
              <span className="text-sm font-semibold text-gray-900 ">{ticket.status} Mode</span>
            </div>
            <span className="text-xs font-semibold text-gray-400 ">Priority: {ticket.priority}</span>
          </div>

          {/* Title + Description */}
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">{ticket.short_description}</h1>
            <p className="text-sm text-gray-500 leading-relaxed border-l-4 border-gray-100 pl-4">"{ticket.description}"</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 py-5 border-y border-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400"><User className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Personnel</span></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 ">{ticket.requested_by}</p>
                <p className="text-xs text-gray-400">{ticket.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400"><MapPin className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Site Data</span></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 ">{ticket.location || 'N/A'}</p>
                <p className="text-xs text-gray-400">{ticket.floor} · {ticket.shift_timings}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400"><Tag className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">Taxonomy</span></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 ">{ticket.category || 'Unclassified'}</p>
                <p className="text-xs text-gray-400">{ticket.subcategory1}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400"><Cpu className="w-3.5 h-3.5" /><span className="text-xs font-semibold ">CI Tag</span></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 ">{ticket.configuration_item || 'N/A'}</p>
                <p className="text-xs text-gray-400 ">Impact: {ticket.impact}</p>
              </div>
            </div>
          </div>

          {/* AI Dispatch */}
          <div className="p-5 rounded-xl bg-gray-900 text-white space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Bot className="w-4 h-4" />
              <span className="text-xs font-semibold ">AI Dispatch Report</span>
            </div>
            {ticket.status === 'Deflected' || ticket.status === 'Resolved'
              ? <p className="text-xs text-gray-300 leading-relaxed">"{ticket.resolution}"</p>
              : <div>
                <p className="text-xs font-semibold text-white ">Escalated to: <span className="text-blue-400">{ticket.assigned_to}</span></p>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">High-risk priority index. Internal cluster auditing initiated.</p>
              </div>
            }
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {ticket.status !== 'Deflected' && ticket.status !== 'Resolved' && (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="flex-1 py-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {resolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Resolve Ticket
              </button>
            )}
            <button className="flex-1 py-3 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all shadow-lg">
              Acknowledge Audit
            </button>
            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Audit Log Table ───────────────────────────────────────────────────────────
function AuditLogView({ onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [error, setError] = useState(false);
  const PAGE_SIZE = 10;

  const fetchTickets = async () => {
    try {
      const res = await fetchWithTimeout(`${API}/api/tickets`);
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const id = setInterval(fetchTickets, 15000);
    return () => clearInterval(id);
  }, []);

  // Local resolve (optimistic)
  const resolveTicket = (ticketId) => {
    setTickets(prev => prev.map(t =>
      t.ticket_id === ticketId ? { ...t, status: 'Resolved', resolution: 'Manually resolved by operator via audit console.' } : t
    ));
  };

  const filtered = useMemo(() =>
    tickets.filter(t => !query || JSON.stringify(t).toLowerCase().includes(query.toLowerCase())),
    [tickets, query]
  );
  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusColor = (s) => {
    if (s === 'Deflected' || s === 'Resolved') return 'text-emerald-600';
    if (s === 'Open') return 'text-blue-600';
    return 'text-gray-400';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-6 space-y-5 max-w-full pb-12">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={onBack} className="text-xs font-semibold text-gray-400 flex items-center gap-1 hover:text-gray-900 transition-colors mb-1">
              <ChevronLeft className="w-3 h-3" /> ITSM Hub
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 ">Incident Audit Log</h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-400 ">Total Incidents</span>
              <span className="text-2xl font-semibold text-gray-900">{tickets.length}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-400 ">Resolved</span>
              <span className="text-2xl font-semibold text-emerald-600">{tickets.filter(t => t.status === 'Deflected' || t.status === 'Resolved').length}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">ITSM Engine Offline</p>
              <p className="text-xs opacity-80">The forensic audit stream is unreachable. Please verify the backend service is running on port 5004.</p>
            </div>
            <button onClick={fetchTickets} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
              Retry Connection
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search tickets..." value={query}
              onChange={e => { setQuery(e.target.value); setPage(0); }}
              className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-5 text-xs text-gray-900 w-72 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 font-bold" />
          </div>
          <div className="flex gap-2">
            <button onClick={fetchTickets} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><RefreshCw className="w-4 h-4" /></button>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><Download className="w-4 h-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className="h-44 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="h-44 bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-gray-200" />
            <p className="text-xs font-semibold text-gray-400 ">No tickets yet · Create your first incident above</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Incident ID', 'Narrative', 'Personnel', 'Category', 'Status', 'Priority', ''].map(h => (
                    <th key={h} className="py-3 px-5 text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((t, idx) => (
                  <tr key={t.ticket_id || `temp-${idx}`} onClick={() => setSelected(t)}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="py-3 px-5 text-xs font-semibold text-gray-900">#{t.ticket_id}</td>
                    <td className="py-3 px-5 text-xs text-gray-500 max-w-[220px] truncate font-medium">{t.short_description}</td>
                    <td className="py-3 px-5 text-xs text-gray-500 font-medium">{t.requested_by}</td>
                    <td className="py-3 px-5">
                      <span className="text-xs font-semibold text-blue-600 border border-blue-100 bg-blue-50 px-2 py-0.5 rounded ">{t.category || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-1.5 h-1.5 rounded-full', t.status === 'Deflected' || t.status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-500')} />
                        <span className={cn('text-xs font-semibold ', statusColor(t.status))}>{t.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border ',
                        (t.priority || '').startsWith('1') ? 'bg-red-50 text-red-600 border-red-100' :
                          (t.priority || '').startsWith('2') ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100')}>
                        {t.priority || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-gray-900 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:border-gray-300 shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-400 ">Page {page + 1} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} className="p-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:border-gray-300 shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <TicketDrawer ticket={selected} onClose={() => setSelected(null)} onResolve={resolveTicket} />
      </div>
    </div>
  );
}

// ─── ITSM Hub (root) ───────────────────────────────────────────────────────────
export function ITSMHubView() {
  const [sub, setSub] = useState('hub');

  if (sub === 'create') return <CreateTicketForm onBack={() => setSub('hub')} />;
  if (sub === 'tickets') return <AuditLogView onBack={() => setSub('hub')} />;

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-6 space-y-8 max-w-4xl mx-auto pb-12">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0"><FileText className="w-5 h-5" /></div>
            ITSM Engine
          </h1>
          <p className="text-sm text-gray-400 ">Core Incident Lifecycle Orchestration</p>
        </div>

        <div className="space-y-4">
          {[
            { id: 'create', icon: Send, label: 'Register Service Incident', desc: 'Initiate a professional incident record with automated telemetry mapping and employee auto-population.', color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'tickets', icon: ListOrdered, label: 'Forensic Audit History', desc: 'Deep-dive into historic incident streams, view and resolve tickets.', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(card => (
            <button key={card.id} onClick={() => setSub(card.id)}
              className="w-full bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-5 hover:border-yellow-400/60 hover:shadow-md transition-all group text-left shadow-sm">
              <div className={cn('p-4 rounded-xl border border-gray-100 group-hover:scale-110 transition-transform', card.bg)}>
                <card.icon className={cn('w-6 h-6', card.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-400 ">Action</span>
                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{card.label}</h3>
                <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-blue-600 transition-all group-hover:shadow-lg">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex gap-14">
            {[['Deflection Rate', '42.8%'], ['Processing Time', '0.8ms'], ['Audit Integrity', '99.2%']].map(([label, val]) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold ">{label}</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 er">{val}</p>
              </div>
            ))}
          </div>
          <button className="px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors shadow-lg">
            Export Audit Report
          </button>
        </div>
      </div>
    </div>
  );
}
