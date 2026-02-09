from .generate_and_build import build_cadmium
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import json

ALLOWED_ORIGIN = "http://localhost:5500"  # your GUI origin


class CadmiumHandler(BaseHTTPRequestHandler):

    # -----------------------------
    # Handle preflight OPTIONS
    # -----------------------------
    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if origin == ALLOWED_ORIGIN:
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
        else:
            self.send_response(403)
            self.end_headers()

    # -----------------------------
    # Handle POST requests
    # -----------------------------
    def do_POST(self):
        origin = self.headers.get("Origin")
        if origin != ALLOWED_ORIGIN:
            self.send_response(403)
            self.end_headers()
            return

        if self.path == "/simulation-output":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            print("Received data:", data)
            print("Starting Cadmium build...")

            try:
                # Blocking call to build_cadmium
                simulation_output = build_cadmium(data)
            except Exception as e:
                print("Error during build_cadmium:", e)
                simulation_output = {"error": str(e)}

            # Send response safely
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
            self.end_headers()

            try:
                self.wfile.write(json.dumps(simulation_output).encode("utf-8"))
            except ConnectionAbortedError:
                print("Client disconnected before response could be sent.")

            print("Cadmium build finished.")


# -----------------------------
# Threaded HTTP server
# -----------------------------
class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True  # ensures threads exit on server shutdown


# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    server = ThreadedHTTPServer(("localhost", 8001), CadmiumHandler)
    print("Cadmium_Builder server running on http://localhost:8001")
    server.serve_forever()
