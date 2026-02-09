import subprocess
import sys
import os

# -----------------------------
# Base directory (repo root)
# -----------------------------
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))

processes = []

# -----------------------------
# Start Python server 1 (Parser)
# -----------------------------
server1_module = "DEVSMap_to_Cadmium_Parser.server"
processes.append(subprocess.Popen(
    [sys.executable, "-m", server1_module],
    cwd=REPO_ROOT  # MUST be repo root for module imports
))

# -----------------------------
# Start Python server 2 (Cadmium_Builder)
# -----------------------------
server2_module = "Cadmium_Builder.server"
processes.append(subprocess.Popen(
    [sys.executable, "-m", server2_module],
    cwd=REPO_ROOT  # MUST be repo root for module imports
))

# -----------------------------
# Start GUI server (Python HTTP server)
# -----------------------------
gui_dir = os.path.join(REPO_ROOT, "GUI")  # your GUI folder
gui_port = "5500"

processes.append(subprocess.Popen(
    [sys.executable, "-m", "http.server", gui_port],
    cwd=gui_dir
))

# -----------------------------
# Print info
# -----------------------------
print("All servers started:")
print(f"- Parser server running")
print(f"- Cadmium_Builder server running")
print(f"- GUI server running at http://localhost:{gui_port}")
print("Press Ctrl+C to stop all servers.")

# -----------------------------
# Wait for processes / handle Ctrl+C
# -----------------------------
try:
    for p in processes:
        p.wait()
except KeyboardInterrupt:
    print("Shutting down servers...")
    for p in processes:
        p.terminate()
