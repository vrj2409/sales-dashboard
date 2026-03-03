#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

os.chdir('dist')

print("=" * 60)
print("🚀 Sales Dashboard Server")
print("=" * 60)
print(f"\n📊 Dashboard: http://localhost:{PORT}")
print(f"\n✅ Server running on port {PORT}")
print("\n⚠️  Press Ctrl+C to stop\n")
print("=" * 60)

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped")
