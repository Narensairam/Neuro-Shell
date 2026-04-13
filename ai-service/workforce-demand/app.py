from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
from ml_engine import WorkforceIntelligenceSystem

app = Flask(__name__)
CORS(app)
ml_system = WorkforceIntelligenceSystem()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/scenario/fire", methods=["POST"])
def scenario_fire():
    # Simulate a high-impact fire alert during a holiday
    data = ml_system.process_event("Fire Alert", "HIGH", base_workers=12, leave_count=2, holiday_flag=1)
    return jsonify(data)

@app.route("/api/scenario/holiday_shortage", methods=["POST"])
def scenario_holiday():
    # Simulate a medium maintenance task during severe holiday shortage
    data = ml_system.process_event("Maintenance", "MEDIUM", base_workers=8, leave_count=0, holiday_flag=1)
    return jsonify(data)

@app.route("/api/scenario/default", methods=["POST"])
def scenario_default():
    # Regular day operations
    data = ml_system.process_event("Normal Operations", "LOW", base_workers=25, leave_count=2, holiday_flag=0)
    return jsonify(data)

@app.route("/api/scenario/maintenance", methods=["POST"])
def scenario_maintenance():
    # Standard maintenance on a normal day
    data = ml_system.process_event("Equipment Failure", "MEDIUM", base_workers=15, leave_count=1, holiday_flag=0)
    return jsonify(data)

@app.route("/api/scenario/live", methods=["GET"])
def scenario_live():
    try:
        response = requests.get('http://127.0.0.1:5007/fire', timeout=2)
        if response.status_code == 200:
            api_data = response.json()
            if api_data.get("event") == "fire":
                severity = api_data.get("severity", "HIGH")
                # Map severity to numeric value
                severity_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
                severity_num = severity_map.get(severity, 3)
                
                # Trigger workforce ML model
                data = ml_system.process_event("Fire Alert", severity, base_workers=15, leave_count=1, holiday_flag=0)
                data["external_severity_num"] = severity_num
                data["camera_location"] = api_data.get("location")
                data["api_confidence"] = api_data.get("confidence")
                return jsonify(data)
            else:
                return jsonify({"event": "none", "message": "No active alerts"})
    except requests.exceptions.RequestException as e:
        return jsonify({"event": "error", "message": "Could not connect to external Fire API."}), 500
    
    return jsonify({"event": "none"})

if __name__ == "__main__":
    print("Starting Shell EOS AI Intelligence Server on port 5003...")
    app.run(debug=True, port=5003)
