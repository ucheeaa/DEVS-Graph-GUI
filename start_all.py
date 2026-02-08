import subprocess
import sys

processes = []

# Start Python server 1
processes.append(subprocess.Popen(
    [sys.executable, "-m", "DEVSMap_to_Cadmium_Parser.server"]
))

# Start Python server 2
processes.append(subprocess.Popen(
    [sys.executable, "-m", "Cadmium_Builder.server"]
))

# # Start GUI servers (example: using VS Code Live Server or http.server)
# processes.append(subprocess.Popen(
#     [sys.executable, "-m", "http.server", "5500"],
#     cwd="gui1"
# ))

# processes.append(subprocess.Popen(
#     [sys.executable, "-m", "http.server", "5501"],
#     cwd="gui2"
# ))

print("All servers started.")
print("Press Ctrl+C to stop them.")

try:
    for p in processes:
        p.wait()
except KeyboardInterrupt:
    print("Shutting down servers...")
    for p in processes:
        p.terminate()
