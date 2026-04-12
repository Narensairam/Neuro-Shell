import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import math

class WorkforceIntelligenceSystem:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.le_event = LabelEncoder()
        self.le_severity = LabelEncoder()
        
        # Setup contractor pool
        self.contractors_df = pd.DataFrame([
            {"name": "XYZ Services", "score": 9.2, "availability": "High", "specialties": ["Fire", "Maintenance"]},
            {"name": "Alpha Safety Ltd", "score": 8.8, "availability": "Medium", "specialties": ["PPE", "Safety"]},
            {"name": "Global Riggers", "score": 9.5, "availability": "Low", "specialties": ["Equipment Failure", "Maintenance"]},
            {"name": "QuickResponse Team", "score": 7.9, "availability": "High", "specialties": ["Fire", "Intrusion"]}
        ])

        self._train_model()

    def _train_model(self):
        """Generates synthetic historical data and trains the RF model for demand prediction."""
        np.random.seed(42)
        n_samples = 1000

        events = ["Fire Alert", "Maintenance", "PPE Violation", "Equipment Failure", "Intrusion"]
        severities = ["LOW", "MEDIUM", "HIGH"]

        data = {
            "event_type": np.random.choice(events, n_samples),
            "severity": np.random.choice(severities, n_samples),
            "available_workers": np.random.randint(2, 50, n_samples),
            "holiday_flag": np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
        }
        df = pd.DataFrame(data)

        # Baseline logic to create the "ground truth" labels we map to historical "required_workers"
        def calculate_base_demand(row):
            base = 2
            if row["event_type"] == "Fire Alert": base += 5
            if row["event_type"] == "Equipment Failure": base += 4
            if row["event_type"] == "Maintenance": base += 3
            if row["severity"] == "HIGH": base += 4
            if row["severity"] == "MEDIUM": base += 2
            return base + np.random.randint(0, 2)  # add slight noise

        df["required_workers"] = df.apply(calculate_base_demand, axis=1)

        # Encode categorical features
        df["event_type_enc"] = self.le_event.fit_transform(df["event_type"])
        df["severity_enc"] = self.le_severity.fit_transform(df["severity"])

        # Train model
        X = df[["event_type_enc", "severity_enc", "available_workers", "holiday_flag"]]
        y = df["required_workers"]
        self.model.fit(X, y)
        print("ML Model Trained.")

    def run_demand_engine(self, event_type, severity, available_workers, holiday_flag):
        """1. Demand Prediction Engine"""
        try:
            evt_enc = self.le_event.transform([event_type])[0]
        except ValueError:
            evt_enc = 0 # Default if unseen
            
        try:
            sev_enc = self.le_severity.transform([severity])[0]
        except ValueError:
            sev_enc = 0
            
        x_pred = pd.DataFrame([[evt_enc, sev_enc, available_workers, holiday_flag]], 
                              columns=["event_type_enc", "severity_enc", "available_workers", "holiday_flag"])
        
        pred_demand = self.model.predict(x_pred)[0]
        return math.ceil(pred_demand)

    def run_availability_engine(self, base_total, leave_count, holiday_flag):
        """2. Availability Engine"""
        available = base_total - leave_count
        if holiday_flag:
            available = int(available * 0.6) # 40% drop in availability on holidays
        return available

    def run_skill_mapping(self, event_type, required_workers):
        """3. Skill Mapping Engine"""
        skills = {}
        if "Fire" in event_type:
            skills["Safety Officer"] = max(1, int(required_workers * 0.4))
            skills["Engineer"] = max(1, int(required_workers * 0.3))
            skills["Supervisor"] = 1
            skills["General Hand"] = max(0, required_workers - sum(skills.values()))
        elif "Maintenance" in event_type or "Failure" in event_type:
            skills["Engineer"] = max(1, int(required_workers * 0.6))
            skills["Technician"] = max(1, int(required_workers * 0.3))
            skills["Supervisor"] = 1
        else:
            skills["Security"] = max(1, int(required_workers * 0.5))
            skills["Safety Officer"] = max(1, int(required_workers * 0.3))
            skills["Supervisor"] = 1
            
        return skills

    def run_contractor_intelligence(self, event_type):
        """4. Contractor Intelligence"""
        # Score prioritizing
        available_contractors = self.contractors_df[self.contractors_df["availability"] != "Low"]
        
        # Sort by score
        best = available_contractors.sort_values(by="score", ascending=False).iloc[0]
        return {
            "name": best["name"],
            "score": best["score"],
            "status": "Recommended"
        }

    def run_predictive_safety_engine(self, gap, severity):
        """5. Predictive Safety Engine"""
        if gap >= 4 or (gap >= 2 and severity == "HIGH"):
            return "HIGH"
        elif gap >= 1 or severity == "HIGH":
            return "MEDIUM"
        return "LOW"

    def process_event(self, event_type, severity, base_workers, leave_count, holiday_flag):
        """6. Unified Decision Engine"""
        
        available = self.run_availability_engine(base_workers, leave_count, holiday_flag)
        demand = self.run_demand_engine(event_type, severity, available, holiday_flag)
        
        gap = max(0, demand - available)
        
        skills_req = self.run_skill_mapping(event_type, demand)
        risk = self.run_predictive_safety_engine(gap, severity)
        
        contractor = None
        recommendation = "Standard operations."
        explanation = "Workforce levels meet predicted demand."
        
        if gap > 0:
            contractor = self.run_contractor_intelligence(event_type)
            if holiday_flag:
                explanation = f"Reduced workforce due to holiday combined with {severity} severity event."
                recommendation = f"Deploy backup shift + trigger {contractor['name']} contract."
            else:
                explanation = f"Sudden demand spike from {severity} severity {event_type}."
                recommendation = f"Mobilize cross-trained staff and ready {contractor['name']}."

        if risk == "HIGH":
            explanation += " Critical understaffing flagged."

        return {
            "event": event_type,
            "severity": severity,
            "required_workers": demand,
            "available_workers": available,
            "gap": gap,
            "skills_required": skills_req,
            "contractor": contractor["name"] if contractor else "None Required",
            "contractor_details": contractor,
            "risk_level": risk,
            "confidence": "92%", # Mock confidence score of the ensemble
            "explanation": explanation,
            "recommendation": recommendation,
            "holiday_mode": holiday_flag
        }

# For local testing
if __name__ == "__main__":
    system = WorkforceIntelligenceSystem()
    out = system.process_event("Fire Alert", "HIGH", base_workers=10, leave_count=2, holiday_flag=1)
    import json
    print(json.dumps(out, indent=2))
