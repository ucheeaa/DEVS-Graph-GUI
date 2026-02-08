from .generate_and_build import build_cadmium

from http.server import BaseHTTPRequestHandler, HTTPServer
import json

ALLOWED_ORIGIN = "http://127.0.0.1:5500"  # only allow this origin

class CadmiumHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if origin == ALLOWED_ORIGIN:
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        else:
            self.send_response(403)  # forbidden if origin not allowed
        self.end_headers()

    def do_POST(self):
        origin = self.headers.get("Origin")
        if origin != ALLOWED_ORIGIN:
            self.send_response(403)  # forbid other origins
            self.end_headers()
            return

        if self.path == "/simulation-output":
            content_length = int(self.headers["Content-Length"])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            #Test received data in console
            print("DATA === ", data)
            # Invoke the parser
            simulation_output = build_cadmium(data)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)  # only allowed origin
            self.end_headers()
            self.wfile.write(json.dumps(simulation_output).encode("utf-8"))

server = HTTPServer(("localhost", 8001), CadmiumHandler)
print("Server running on http://localhost:8001")
server.serve_forever()
