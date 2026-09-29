const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname);
const PUBLIC = path.join(ROOT, 'public');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json',
  '.css': 'text/css', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const u = url.parse(req.url);
  let p = decodeURIComponent(u.pathname);
  if (p === '/') p = '/test-tint.html';

  let filePath;
  if (p.startsWith('/models/')) {
    filePath = path.join(PUBLIC, p);
  } else if (p.startsWith('/node_modules/')) {
    filePath = path.join(ROOT, p);
  } else {
    filePath = path.join(PUBLIC, p);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404: ' + p + ' -> ' + filePath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const port = 8091;
server.listen(port, () => {
  console.log('Serving on http://127.0.0.1:' + port);
});
