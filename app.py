import os
import http.server
import socketserver

port = int(os.environ.get("PORT", 8080))

class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status": "ok", "service": "SCRUM-268 ETL Pipeline"}')

if __name__ == "__main__":
    with socketserver.TCPServer(("", port), HealthHandler) as httpd:
        print(f"Serving at port {port}")
        httpd.serve_forever()
