#!/usr/bin/env python3
"""Local test server that behaves like Cloudflare Pages: unknown paths serve index.html.
Run:  python3 tools/serve.py        then open http://localhost:8000
(The plain `python3 -m http.server` cannot open links such as /inbound/compare directly.)"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.translate_path(self.path.split('?')[0].split('#')[0])
        if not os.path.exists(path) and not os.path.splitext(path)[1]:
            self.path = '/index.html'
        return super().send_head()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', PORT), Handler) as httpd:
    print(f'Serving on http://localhost:{PORT}  (Ctrl+C to stop)')
    httpd.serve_forever()
