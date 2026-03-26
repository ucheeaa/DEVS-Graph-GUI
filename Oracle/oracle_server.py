from flask import Flask, request
from flask_cors import CORS
import subprocess
import os
print("STARTING ORACLE SERVER...")
app = Flask(__name__)
CORS(app)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BINARY_PATH = os.path.join(REPO_ROOT, "oracle_runner.exe")

UPLOAD_DIR = os.path.join(REPO_ROOT, "temp_upload")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/validate", methods=["POST"])
def validate():
    try:
        # ---- IMPORTANT: use form, NOT json ----
        tolerance = request.form.get("tolerance", "0.1")
        mode = request.form.get("mode", "file")

        # ---- FILE MODE ----
        if mode == "file":
            if "file" not in request.files:
                return "No file uploaded"

            file = request.files["file"]

            filepath = os.path.join(UPLOAD_DIR, file.filename)
            file.save(filepath)

            result = subprocess.run(
                [BINARY_PATH, tolerance, "file", filepath],
                capture_output=True,
                text=True
            )

            return result.stdout

        return "Unsupported mode"

    except Exception as e:
        return str(e)

if __name__ == "__main__":
    app.run(port=8002)