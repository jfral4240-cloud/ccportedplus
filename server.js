const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.zip': 'application/zip',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Decode URI
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch (e) {}

  let filePath = path.join(ROOT, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const serve = (fp) => {
    const ext = path.extname(fp).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  };

  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.access(indexPath, fs.constants.F_OK, (err2) => {
        if (err2) {
          res.writeHead(403, { 'Content-Type': 'text/html' });
          res.end('<h1>403 Forbidden</h1>');
        } else {
          serve(indexPath);
        }
      });
    } else {
      serve(filePath);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CCPorted+ static server running on http://0.0.0.0:${PORT}`);
});
