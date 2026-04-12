from __future__ import annotations

from datetime import datetime

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from src.itsm_engine import (
    ITSMOrchestrator,
    compute_priority,
    infer_issue_type,
    merge_tickets_on_disk,
    next_ticket_id,
    persist_tickets,
)
from src.ot_security.ot_anomaly_detector import detect_ot_anomalies
from src.ot_security.ot_compliance_mapper import add_compliance
from src.ot_security.ot_data_simulator import OTSimConfig, simulate_ot_telemetry
from src.ot_security.ot_threat_classifier import add_threat_labels
from src.predictive_aiops.failure_risk import calculate_failure_probability
from src.predictive_aiops.multi_metric_trend import predict_multi_metric
from src.predictive_monitoring.data_generator import GeneratorConfig, generate_infra_metrics
from src.shadow_it.shadow_data_simulator import ShadowSimConfig, generate_shadow_data
from src.shadow_it.shadow_detector import detect_shadow_it


st.set_page_config(page_title="Shell EOS | Industrial ITSM", layout="wide", page_icon="🔘")

# Custom CSS for Shell EOS Premium Aesthetic
st.markdown(
    """
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        
        .block-container { padding-top: 1rem; padding-bottom: 2rem; background-color: #f8fafc; }
        
        /* Sidebar Styling */
        [data-testid="stSidebar"] {
            background-color: #ffffff !important;
            border-right: 1px solid #e2e8f0;
            padding-top: 2rem;
        }
        [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
            color: #475569 !important;
            font-size: 0.75rem !important;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }
        
        /* Card Styling */
        .signal-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            transition: transform 0.2s ease;
        }
        .signal-card:hover { border-color: #cbd5e1; }
        
        .signal-label {
            color: #64748b;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .signal-value {
            color: #0f172a;
            font-size: 2rem;
            font-weight: 800;
            margin: 0.5rem 0;
        }
        .signal-sub { color: #94a3b8; font-size: 0.75rem; }
        
        /* Branding Header */
        .top-bar {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.75rem 1.5rem;
            margin: -6rem -5rem 2rem -5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand-text { color: #DD1D21; font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em; }
        .platform-tag { color: #94a3b8; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; }
        
        /* Status Badges */
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            margin-left: 0.5rem;
        }
        .badge-green { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .badge-yellow { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
        .badge-red { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        /* Forms & Inputs */
        div[data-testid="stForm"] {
            border: none !important;
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
    </style>
    """,
    unsafe_allow_html=True,
)


def render_top_header() -> None:
    st.markdown(
        """
        <div class="top-bar">
            <div>
                <span class="brand-text">Shell EOS</span>
                <div class="platform-tag">ENTERPRISE AI OPERATING SYSTEM</div>
            </div>
            <div style="display: flex;">
                <div class="badge badge-green">● 24 Models Live</div>
                <div class="badge badge-yellow">● 2 Alerts Pending</div>
                <div class="badge badge-green">SYSTEM ONLINE</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


@st.cache_data(show_spinner=False)
def load_data() -> pd.DataFrame:
    df = generate_infra_metrics(
        GeneratorConfig(servers=8, points_per_server=24 * 60, anomaly_ratio=0.12, degradation_ratio=0.20)
    )
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    return df.sort_values(["server_id", "timestamp"])


@st.cache_data(show_spinner=False)
def load_ot_data() -> pd.DataFrame:
    ot = simulate_ot_telemetry(OTSimConfig(devices=100, points_per_device=60, anomaly_ratio=0.12))
    ot = detect_ot_anomalies(ot)
    ot = add_threat_labels(ot)
    ot = add_compliance(ot)
    return ot


@st.cache_data(show_spinner=False)
def load_shadow_data() -> pd.DataFrame:
    shadow = generate_shadow_data(ShadowSimConfig(devices=300, shadow_ratio=0.2))
    alerts = detect_shadow_it(shadow)
    rows: list[dict] = []
    for row, reason, severity in alerts:
        rows.append(
            {
                "device_id": row["device_id"],
                "location": row["location"],
                "issue": reason,
                "severity": severity,
                "known": int(row["known"]),
                "network_activity": float(row["network_activity"]),
                "access_frequency": int(row["access_frequency"]),
            }
        )
    return pd.DataFrame(rows)


def ensure_state() -> ITSMOrchestrator:
    if "itsm_engine" not in st.session_state:
        st.session_state.itsm_engine = ITSMOrchestrator()
    if "tickets" not in st.session_state:
        st.session_state.tickets = merge_tickets_on_disk(st.session_state.itsm_engine)
    if "active_user" not in st.session_state:
        st.session_state.active_user = "ghuwaa00"
    return st.session_state.itsm_engine


def render_signal_card(column, label: str, value: str, subtext: str) -> None:
    column.markdown(
        f"""
        <div class="signal-card">
            <div class="signal-label">{label}</div>
            <div class="signal-value">{value}</div>
            <div class="signal-sub">{subtext}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_overview(infra_df: pd.DataFrame, ot_df: pd.DataFrame, shadow_df: pd.DataFrame) -> None:
    render_top_header()
    latest = infra_df.groupby("server_id", as_index=False).tail(1)
    avg_cpu = float(latest["cpu_usage"].mean())
    avg_mem = float(latest["memory_usage"].mean())
    threat_count = int(((ot_df["anomaly"]) & (ot_df["threat_type"] != "Normal")).sum())

    st.markdown("<h2 style='font-weight: 800; color: #0f172a;'>Control Tower</h2>", unsafe_allow_html=True)
    st.caption("Real-time platform intelligence and anomaly orchestration.")

    c1, c2, c3, c4 = st.columns(4)
    render_signal_card(c1, "Repeat Ticket Deflection", "AI Active", "42% estimated deflection rate.")
    render_signal_card(c2, "Escalation Routing", "System Live", "Automated worker dispatch engaged.")
    render_signal_card(c3, "OT Threat Center", str(threat_count), "High-risk anomalies requiring audit.")
    render_signal_card(c4, "Grid Health", f"{avg_cpu:.0f}% CPU", f"Average load across {len(latest)} nodes.")

    st.markdown("---")
    st.markdown("<h3 style='font-weight: 600; color: #1e293b;'>Domain Modules</h3>", unsafe_allow_html=True)
    
    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown(
            """
            <div class="signal-card">
                <div class="signal-label">Manufacturing & Ops</div>
                <div style="font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0;">87% Health Score</div>
                <div class="signal-sub">Refineries and production assets.</div>
            </div>
            """, unsafe_allow_html=True
        )
    with col_b:
        st.markdown(
            """
            <div class="signal-card">
                <div class="signal-label">Supply Chain</div>
                <div style="font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0;">46K Fleet Assets</div>
                <div class="signal-sub">Logistics and continuity monitoring.</div>
            </div>
            """, unsafe_allow_html=True
        )


def render_create_ticket(engine: ITSMOrchestrator) -> None:
    render_top_header()
    st.markdown("<h2 style='font-weight: 800; color: #0f172a;'>Raise Incident</h2>", unsafe_allow_html=True)
    st.caption("Standard Enterprise Template for Industrial Asset Operations.")

    impact_opts = ["1 - High", "2 - Medium", "3 - Low"]
    urgency_opts = ["1 - High", "2 - Medium", "3 - Low"]

    with st.form("create_ticket_form", clear_on_submit=False):
        col1, col2 = st.columns([1, 1], gap="large")

        with col1:
            st.markdown("##### Ticket Core & Location")
            ticket_number = st.text_input("Number", value=next_ticket_id([t["ticket_id"] for t in st.session_state.tickets]), disabled=True)
            requested_by = st.text_input("Requested By *", value=st.session_state.active_user)
            requested_for = st.text_input("Requested for *", value=st.session_state.active_user)
            location = st.text_input("Location *", value="Sadara Chemical Complex[Site] – Plant")
            floor = st.text_input("Floor", value="Ground")
            cubicle = st.text_input("Cubicle", value="R-128")
            shift_timings = st.text_input("Shift Timings *", value="7am - 3pm")
            configuration_item = st.text_input("Configuration item", value="")
            
            st.markdown("---")
            st.markdown("##### Priority Matrix")
            impact = st.selectbox("Impact *", impact_opts, index=2)
            urgency = st.selectbox("Urgency *", urgency_opts, index=1)
            priority_val = compute_priority(impact, urgency)
            st.info(f"Calculated Priority: **{priority_val}**")
            
            sadara_breach = st.text_input("Sadara Response Breach Group", value="")
            opened_by = st.text_input("Opened by", value=st.session_state.active_user, disabled=True)

        with col2:
            st.markdown("##### Timing & State")
            created_date = st.text_input("Created Date", value=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), disabled=True)
            incident_state = st.text_input("Incident state", value="New", disabled=True)
            ou = st.text_input("OU", value="Hydrocarbons Operations")
            
            st.markdown("---")
            st.markdown("##### Categorization")
            category = st.selectbox(
                "Category *",
                ["Business and Office Applications", "Infrastructure", "OT / Industrial", "Security", "End User Computing"],
            )
            subcategory1 = st.selectbox("Subcategory1 *", ["Business Applications", "Network", "Server", "Client", "OT"])
            subcategory2 = st.text_input("Subcategory2", value="Innovate@")
            subcategory3 = st.text_input("Subcategory3", value="Access Issue")
            
            st.markdown("---")
            st.markdown("##### Assignment & Flags")
            channel = st.selectbox("Channel *", ["Email", "Phone", "Portal", "Chat"])
            assignment_group = st.text_input("Assignment Group *", value="IT-CAS-HYPE-L3")
            assigned_to_preview = st.text_input("Assigned to", value="— Routing Pending —", disabled=True)
            
            a1, a2, a3 = st.columns(3)
            alert_flag = a1.selectbox("Alert *", ["Yes", "No"])
            service_request_flag = a2.selectbox("Service Request *", ["Yes", "No"])
            task_flag = a3.selectbox("Task *", ["Yes", "No"])

        st.markdown("---")
        st.markdown("##### Severity & Narrative")
        s1, s2 = st.columns([1, 3])
        severity = s1.selectbox("Severity *", ["Low", "Medium", "High", "Critical"])
        short_description = s2.text_input("Short description / Title *", placeholder="Brief summary of the issue")
        description = st.text_area("Description *", height=150, placeholder="Provide full details, error codes, and symptoms.")

        submitted = st.form_submit_button("Submit Incident", use_container_width=True)

    if submitted:
        if not short_description or not description:
            st.error("Short description and description are required.")
            return

        payload = {
            "ticket_id": ticket_number,
            "requested_by": requested_by,
            "requested_for": requested_for,
            "location": location,
            "floor": floor,
            "cubicle": cubicle,
            "shift_timings": shift_timings,
            "configuration_item": configuration_item,
            "ou": ou,
            "category": category,
            "subcategory1": subcategory1,
            "subcategory2": subcategory2,
            "subcategory3": subcategory3,
            "channel": channel,
            "assignment_group": assignment_group,
            "impact": impact,
            "urgency": urgency,
            "priority": priority_val,
            "severity": severity,
            "alert_flag": alert_flag,
            "service_request_flag": service_request_flag,
            "task_flag": task_flag,
            "short_description": short_description,
            "description": description,
        }

        ticket = engine.create_ticket(payload)
        st.session_state.tickets.insert(0, ticket)
        persist_tickets(st.session_state.tickets)

        if ticket["status"] == "Pooled":
            st.balloons()
            st.success(f"**Action Required**: {ticket_number} assigned to {ticket['assigned_to']} (Escalation Caller Agent).")
            st.markdown(f"**Worker Notification Sent**: \n> {ticket['notification']}")
        else:
            st.info(f"**AI Deflection**: {ticket_number} resolved automatically.")
            st.markdown(f"**Solution**: {ticket['resolution']}")

def render_view_tickets(engine: ITSMOrchestrator) -> None:
    render_top_header()
    st.markdown("<h2 style='font-weight: 800; color: #0f172a;'>Management Console</h2>", unsafe_allow_html=True)
    
    col_f1, col_f2 = st.columns([2, 1])
    current_user = col_f1.text_input("Search by Requester/ID", value=st.session_state.active_user, key="user_filter")
    st.session_state.active_user = current_user

    all_tickets = pd.DataFrame(st.session_state.tickets)
    if current_user.strip():
        my_tickets = all_tickets[all_tickets["requested_by"].str.lower() == current_user.strip().lower()]
    else:
        my_tickets = all_tickets

    if my_tickets.empty:
        st.info("No tickets found for this user yet.")
    else:
        display_rows = []
        for _, row in my_tickets.iterrows():
            display_rows.append(
                {
                    "Ticket ID": row.get("ticket_id", ""),
                    "Status": row.get("status", ""),
                    "Severity": row.get("severity", ""),
                    "Assigned to": row["assigned_to"] if row.get("status") == "Pooled" else "—",
                    "AI Solution / Worker Notification": row.get("notification", "")[:80] + "..." if row.get("notification") else "—",
                    "Resolution": row["resolution"] if row.get("status") == "Deflected" else "—",
                }
            )
        st.dataframe(pd.DataFrame(display_rows), use_container_width=True, hide_index=True)

        with st.expander("Full ticket records", expanded=False):
            for idx, ticket in enumerate(my_tickets.to_dict("records")):
                title = ticket.get("short_description") or ticket.get("title") or "(no title)"
                st.markdown(f"**{ticket.get('ticket_id')} | {title}**")
                st.write(f"**Status:** {ticket.get('status')} | **Incident state:** {ticket.get('incident_state', '')}")
                st.write(
                    f"**Category:** {ticket.get('category','')} / {ticket.get('subcategory1','')} | "
                    f"**Channel:** {ticket.get('channel','')}"
                )
                if ticket.get("status") == "Pooled":
                    st.write(f"**Assigned to:** {ticket.get('assigned_to')} ({ticket.get('assigned_role')})")
                    st.write(f"**Routed by:** {ticket.get('assignment_agent')}")
                if ticket.get("status") == "Deflected":
                    st.write(f"**AI solution:** {ticket.get('resolution')}")
                    st.caption(f"Match confidence: {ticket.get('confidence')}")
                st.text_area(
                    "Notification",
                    value=str(ticket.get("notification", "")),
                    height=100,
                    disabled=True,
                    key=f"notify_{idx}_{ticket.get('ticket_id')}",
                )
                st.divider()

    with st.expander("Escalation Caller Agent — worker pool (18)", expanded=False):
        st.dataframe(engine.worker_table(), use_container_width=True, hide_index=True)


def render_predictive_maintenance(infra_df: pd.DataFrame) -> None:
    st.subheader("Predictive Maintenance")
    servers = sorted(infra_df["server_id"].unique())
    focus_server = st.selectbox("Asset / Server", servers, index=0)
    history_points = st.slider("History Window", min_value=30, max_value=240, value=90, step=10)
    future_steps = st.slider("Forecast Horizon", min_value=5, max_value=30, value=10, step=5)

    srv = infra_df[infra_df["server_id"] == focus_server].tail(history_points).copy()
    mm_df = pd.DataFrame(
        {
            "cpu": srv["cpu_usage"].astype(float).values,
            "memory": srv["memory_usage"].astype(float).values,
            "errors": srv["error_count"].astype(float).values,
        }
    )
    pred = predict_multi_metric(mm_df, future_steps=future_steps)
    risk = calculate_failure_probability(pred)

    idx_hist = np.arange(len(mm_df))
    idx_future = np.arange(len(mm_df), len(mm_df) + future_steps)
    fig_pred = go.Figure()
    fig_pred.add_trace(go.Scatter(x=idx_hist, y=mm_df["cpu"], name="CPU History", mode="lines"))
    fig_pred.add_trace(go.Scatter(x=idx_future, y=pred["cpu"], name="CPU Forecast", mode="lines+markers"))
    fig_pred.add_trace(go.Scatter(x=idx_hist, y=mm_df["memory"], name="Memory History", mode="lines"))
    fig_pred.add_trace(go.Scatter(x=idx_future, y=pred["memory"], name="Memory Forecast", mode="lines+markers"))
    fig_pred.add_trace(go.Scatter(x=idx_hist, y=mm_df["errors"], name="Errors History", mode="lines", yaxis="y2"))
    fig_pred.add_trace(go.Scatter(x=idx_future, y=pred["errors"], name="Errors Forecast", mode="lines+markers", yaxis="y2"))
    fig_pred.update_layout(
        height=520,
        xaxis_title="Time Index",
        yaxis_title="CPU / Memory",
        yaxis2=dict(title="Errors", overlaying="y", side="right"),
        paper_bgcolor="#f8fafc",
        plot_bgcolor="#f8fafc",
    )
    st.plotly_chart(fig_pred, use_container_width=True)

    gauge = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=risk,
            title={"text": "Failure Probability"},
            gauge={
                "axis": {"range": [0, 100]},
                "bar": {"color": "#1d6fa5"},
                "steps": [
                    {"range": [0, 40], "color": "#d8efe3"},
                    {"range": [40, 70], "color": "#f6e1b5"},
                    {"range": [70, 100], "color": "#f0c0b4"},
                ],
            },
        )
    )
    gauge.update_layout(height=300, paper_bgcolor="#f8fafc")
    st.plotly_chart(gauge, use_container_width=True)

    if risk > 60:
        st.warning(f"High risk detected for {focus_server} ({risk}%).")
        if st.button(f"Generate ITSM Ticket for {focus_server}", key="pm_ticket_btn"):
            tid = next_ticket_id([t["ticket_id"] for t in st.session_state.tickets])
            payload = {
                "ticket_id": tid,
                "requested_by": st.session_state.active_user,
                "category": "Infrastructure",
                "subcategory1": "Server",
                "severity": "High" if risk > 80 else "Medium",
                "short_description": f"Predictive Maintenance Alert: {focus_server} failure risk {risk}%",
                "description": f"Predictive models forecast a {risk}% probability of failure for {focus_server} based on CPU/Memory/Error trends. Immediate inspection recommended.",
                "issue_type": "Hardware",
            }
            ticket = engine.create_ticket(payload)
            st.session_state.tickets.insert(0, ticket)
            persist_tickets(st.session_state.tickets)
            st.success(f"Ticket {tid} created and synced with ITSM.")


def render_shadow_systems(shadow_df: pd.DataFrame) -> None:
    st.subheader("Shadow System Identification")
    st.write(f"Detected potential unmanaged systems: **{len(shadow_df)}**")
    if shadow_df.empty:
        st.info("No shadow systems found in this run.")
        return

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(
            px.histogram(
                shadow_df,
                x="severity",
                color="severity",
                category_orders={"severity": ["Low", "Medium", "High"]},
                title="Shadow System Severity",
            ),
            use_container_width=True,
        )
    with c2:
        st.plotly_chart(
            px.histogram(
                shadow_df,
                x="location",
                color="severity",
                title="Shadow Systems by Location",
            ),
            use_container_width=True,
        )
    st.dataframe(shadow_df, use_container_width=True, hide_index=True)

    if not shadow_df.empty:
        if st.button("Generate Bulk Tickets for Shadow Systems", key="shadow_ticket_btn"):
            count = 0
            for _, row in shadow_df.iterrows():
                if row["severity"] in ["High", "Medium"]:
                    tid = next_ticket_id([t["ticket_id"] for t in st.session_state.tickets])
                    payload = {
                        "ticket_id": tid,
                        "requested_by": st.session_state.active_user,
                        "category": "Security",
                        "subcategory1": "Client",
                        "severity": row["severity"],
                        "short_description": f"Shadow System Detected: {row['device_id']} at {row['location']}",
                        "description": f"Unauthorized device {row['device_id']} detected at {row['location']}. Reason: {row['issue']}. Impact: {row['network_activity']} network activity score.",
                        "issue_type": "Security",
                    }
                    ticket = engine.create_ticket(payload)
                    st.session_state.tickets.insert(0, ticket)
                    count += 1
            persist_tickets(st.session_state.tickets)
            st.success(f"Generated {count} tickets for high/medium risk shadow systems.")


def render_ot_threats(ot_df: pd.DataFrame) -> None:
    st.subheader("OT Threat Detection")
    threats = ot_df[(ot_df["anomaly"]) & (ot_df["threat_type"] != "Normal")].copy()
    st.write(f"Detected OT threats: **{len(threats)}**")
    if threats.empty:
        st.info("No OT threats detected in this run.")
        return

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(
            px.histogram(threats, x="threat_type", color="severity", barmode="group", title="Threat Type Distribution"),
            use_container_width=True,
        )
    with c2:
        st.plotly_chart(
            px.histogram(
                threats,
                x="iec_62443_category",
                color="compliance_risk",
                barmode="group",
                title="IEC 62443 Compliance Mapping",
            ),
            use_container_width=True,
        )
    cols = [
        "timestamp",
        "device_id",
        "threat_type",
        "severity",
        "iec_62443_category",
        "compliance_risk",
    ]
    st.dataframe(threats[cols].head(250), use_container_width=True, hide_index=True)

    if not threats.empty:
        if st.button("Report High Severity Threats to ITSM", key="ot_ticket_btn"):
            count = 0
            for _, row in threats.iterrows():
                if row["severity"] in ["High", "Critical"]:
                    tid = next_ticket_id([t["ticket_id"] for t in st.session_state.tickets])
                    payload = {
                        "ticket_id": tid,
                        "requested_by": st.session_state.active_user,
                        "category": "OT / Industrial",
                        "subcategory1": "OT",
                        "severity": row["severity"],
                        "short_description": f"OT Threat Detected: {row['threat_type']} on {row['device_id']}",
                        "description": f"Anomalous activity on device {row['device_id']}. Threat Type: {row['threat_type']}. IEC 62443 Category: {row['iec_62443_category']}.",
                        "issue_type": "OT Systems",
                    }
                    ticket = engine.create_ticket(payload)
                    st.session_state.tickets.insert(0, ticket)
                    count += 1
            persist_tickets(st.session_state.tickets)
            st.success(f"Reported {count} OT threats to the Escalation Caller Agent.")


engine = ensure_state()

# Sidebar: single hub (Manufacturing / other lanes removed for now — add back later)
# Sidebar: Tiered navigation
with st.sidebar:
    st.markdown("<div style='padding: 1rem 0;'><span style='color:#DD1D21; font-weight:800; font-size:1.5rem;'>Shell EOS</span></div>", unsafe_allow_html=True)
    
    st.markdown("### COMMAND")
    main_nav = st.radio(
        "Main Navigation",
        ["Control Tower", "Manufacturing", "Supply Chain", "Industrial AI Solutions"],
        index=3,
        label_visibility="collapsed"
    )

    module = "Overview"
    if main_nav == "Industrial AI Solutions":
        st.markdown("### DOMAIN MODULES")
        module = st.radio(
            "Solutions",
            ["ITSM", "Predictive Maintenance", "Shadow System Identification", "OT Threat Detection"],
            index=0,
            key="ai_module",
            label_visibility="collapsed"
        )
    elif main_nav == "Control Tower":
        module = "Overview"
    else:
        st.info(f"Navigating to {main_nav}...")
        module = "Overview"

    itsm_action = "Create Ticket"
    if module == "ITSM":
        st.markdown("### ITSM OPS")
        itsm_action = st.radio(
            "ITSM Action",
            ["Create Ticket", "View Tickets"],
            index=0,
            key="itsm_command",
            label_visibility="collapsed"
        )

# Load heavy demo data only for views that need it (faster first paint)
if module == "Overview":
    infra_df = load_data()
    ot_df = load_ot_data()
    shadow_df = load_shadow_data()
    render_overview(infra_df, ot_df, shadow_df)
elif module == "ITSM":
    if itsm_action == "Create Ticket":
        render_create_ticket(engine)
    else:
        render_view_tickets(engine)
elif module == "Predictive Maintenance":
    render_predictive_maintenance(load_data())
elif module == "Shadow System Identification":
    render_shadow_systems(load_shadow_data())
elif module == "OT Threat Detection":
    render_ot_threats(load_ot_data())
else:
    st.error("Unknown module — please pick a tab in the sidebar.")
