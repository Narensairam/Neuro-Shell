from flask import Blueprint, jsonify
from agent.governance_agent import GovernanceAgent
from data.models_data import models_data
 
 
governance = Blueprint("governance", __name__)
 
 
@governance.route("/dashboard", methods=["GET"])
def dashboard():

    agent = GovernanceAgent(models_data)
    pending_queue = agent.pending_audits()

    response = {

        "registered_models": agent.calculate_registered_models(),

        "compliance_score": agent.compliance_score(),

        "bias_alerts": agent.calculate_bias_alerts(),

        "pending_audits": len(pending_queue),

        "pending_audit_next_model": pending_queue[0] if pending_queue else None,

        "model_registry": agent.model_registry_status(),

        "audit_logs": agent.audit_logs()

    }

    return jsonify(response)