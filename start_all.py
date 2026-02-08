import subprocess
import sys
import os

# -----------------------------
# Base directory (repo root)
# -----------------------------
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))

processes = []

# -----------------------------
# Start Python server 1
# -----------------------------
server1_module = "DEVSMap_to_Cadmium_Parser.server"
processes.append(subprocess.Popen(
    [sys.executable, "-m", server1_module],
    cwd=REPO_ROOT  # MUST be repo root for module imports
))

# -----------------------------
# Start Python server 2
# -----------------------------
server2_module = "Cadmium_Builder.server"
processes.append(subprocess.Popen(
    [sys.executable, "-m", server2_module],
    cwd=REPO_ROOT  # MUST be repo root for module imports
))

# -----------------------------
# Optional: start GUI servers
# Uncomment if needed
# -----------------------------
# gui1_dir = os.path.join(REPO_ROOT, "gui1")
# processes.append(subprocess.Popen(
#     [sys.executable, "-m", "http.server", "5500"],
#     cwd=gui1_dir
# ))

# gui2_dir = os.path.join(REPO_ROOT, "gui2")
# processes.append(subprocess.Popen(
#     [sys.executable, "-m", "http.server", "5501"],
#     cwd=gui2_dir
# ))

print("All servers started.")
print("Press Ctrl+C to stop them.")

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
