import time
from flask import Flask, jsonify, render_template, Response
from event_engine import GLOBAL_ALERTS, GLOBAL_STATS, GLOBAL_FRAMES

app = Flask(__name__)

@app.route('/')
def dashboard():
    return render_template('index.html')

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify(GLOBAL_ALERTS)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify(GLOBAL_STATS)

@app.route('/api/normalize', methods=['POST'])
def normalize():
    from event_engine import STATE_LOCK
    with STATE_LOCK:
        GLOBAL_ALERTS.clear()
        GLOBAL_STATS["fire_hazards"] = 0
    return jsonify({"status": "ok"})

def generate_frames(camera_id):
    """
    Generator yielding jpeg encoded frames for standard stream logic.
    """
    while True:
        frame = GLOBAL_FRAMES.get(camera_id)
        if frame is None:
            time.sleep(0.1)
            continue
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        # Limiting rate ensures it doesn't overload older browsers
        time.sleep(0.03)

@app.route('/video_feed/<camera_id>')
def video_feed(camera_id):
    return Response(generate_frames(camera_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

def run_flask_app(host, port):
    app.run(host=host, port=port, debug=False, use_reloader=False)

if __name__ == '__main__':
    from config import AppConfig
    run_flask_app(AppConfig.FLASK_HOST, AppConfig.FLASK_PORT)
