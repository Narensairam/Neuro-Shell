from flask import Flask
from flask_cors import CORS
from routes.governance_routes import governance


app = Flask(__name__)
CORS(app)


app.register_blueprint(governance, url_prefix="/governance")


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5006)