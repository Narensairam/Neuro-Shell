from datetime import datetime
 
 
class GovernanceAgent:
 
    def __init__(self, models):
 
        self.models = models
 
 
    def calculate_registered_models(self):
 
        tier1 = sum(1 for m in self.models if m["risk_tier"] == "Tier 1")
        tier2 = sum(1 for m in self.models if m["risk_tier"] == "Tier 2")
        tier3 = sum(1 for m in self.models if m["risk_tier"] == "Tier 3")
 
        return {
 
            "total": len(self.models),
            "tier1": tier1,
            "tier2": tier2,
            "tier3": tier3
        }
 
 
    def calculate_bias_alerts(self):
 
        return sum(1 for m in self.models if m["bias_alert"])
 
 
    def compliance_score(self):
 
        compliant_models = sum(
            1 for m in self.models
            if m["accuracy"] >= 85 and not m["bias_alert"]
        )
 
        score = (compliant_models / len(self.models)) * 100
 
        return round(score, 1)
 
 
    def pending_audits(self):
 
        pending = []
 
        for m in self.models:
 
            if m["risk_tier"] == "Tier 1":
 
                pending.append(m["model"])
 
        return pending
 
 
    def model_registry_status(self):
 
        registry = []
 
        for m in self.models:
 
            if m["bias_alert"]:
 
                status = "Under Review"
 
            elif m["accuracy"] >= 85:
 
                status = "Compliant"
 
            else:
 
                status = "Needs Retraining"
 
            registry.append({
 
                "model": m["model"],
                "risk_tier": m["risk_tier"],
                "version": m["version"],
                "accuracy": str(m["accuracy"]) + "%",
                "last_audit": m["last_audit"],
                "status": status
            })
 
        return registry
 
 
    def audit_logs(self):
 
        return [
 
            {
                "time": "14:32",
                "action": "Model retrained — Compressor Failure Predictor",
                "law": "EU AI Act Art.9"
            },
 
            {
                "time": "13:15",
                "action": "Bias audit completed — HR Screening Model",
                "law": "EU AI Act Art.10"
            },
 
            {
                "time": "11:48",
                "action": "Access reviewed — Trading Agent v2.4",
                "law": "SOX Section 404"
            },
 
            {
                "time": "09:22",
                "action": "Risk tier updated — Safety Prediction",
                "law": "EU AI Act Art.6"
            }
 
        ]