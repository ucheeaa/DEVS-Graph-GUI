from flask import Flask, request
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BINARY_PATH = os.path.join(REPO_ROOT, "oracle_runner.exe")

@app.route("/validate", methods=["POST"])
def validate():
    try:
        data = request.json

        tolerance = str(data.get("tolerance", 0.1))
        mode = data.get("mode", "folder")
        path = data.get("path", "simulation_results")

        result = subprocess.run(
            [BINARY_PATH, tolerance, mode, path],
            capture_output=True,
            text=True
        )

        return result.stdout

    except Exception as e:
        return str(e)

if __name__ == "__main__":
    app.run(port=8002)