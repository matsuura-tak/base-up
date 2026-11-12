import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../../../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

const port = Number(process.env.PORT || 4173);
const host = '127.0.0.1';

const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()',
  'X-Frame-Options': 'DENY',
});

const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
});

function sendResponse(res, method, statusCode, contentType, bodyBuffer) {
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    'Content-Type': contentType,
    'Content-Length': String(bodyBuffer.byteLength),
    'Cache-Control': 'no-store',
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  res.end(bodyBuffer);
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    sendResponse(res, method, 405, 'text/plain; charset=utf-8', Buffer.from('Method Not Allowed', 'utf8'));
    return;
  }

  let pathname = '/';
  try {
    const parsed = new URL(req.url || '/', `http://${host}:${port}`);
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    sendResponse(res, method, 400, 'text/plain; charset=utf-8', Buffer.from('Bad Request', 'utf8'));
    return;
  }

  if (pathname === '/__health') {
    sendResponse(res, method, 200, 'text/plain; charset=utf-8', Buffer.from('ok', 'utf8'));
    return;
  }

  if (!fs.existsSync(indexHtmlPath)) {
    sendResponse(
      res,
      method,
      404,
      'text/plain; charset=utf-8',
      Buffer.from('Not Built Yet: web/dist/index.html does not exist', 'utf8'),
    );
    return;
  }

  const relativePath = pathname.replace(/^\/+/, '');
  const candidatePath = path.resolve(distDir, relativePath);
  const relativeFromDist = path.relative(distDir, candidatePath);

  if (relativeFromDist.startsWith('..') || path.isAbsolute(relativeFromDist)) {
    sendResponse(res, method, 403, 'text/plain; charset=utf-8', Buffer.from('Forbidden', 'utf8'));
    return;
  }

  if (relativePath.length > 0 && fs.existsSync(candidatePath)) {
    const stat = fs.statSync(candidatePath);
    if (stat.isFile()) {
      const ext = path.extname(candidatePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(candidatePath);
      sendResponse(res, method, 200, mimeType, content);
      return;
    }
  }

  const hasExtension = path.extname(pathname).length > 0;
  if (!hasExtension) {
    const indexBuffer = fs.readFileSync(indexHtmlPath);
    sendResponse(res, method, 200, 'text/html; charset=utf-8', indexBuffer);
    return;
  }

  sendResponse(res, method, 404, 'text/plain; charset=utf-8', Buffer.from('Not Found', 'utf8'));
});

server.listen(port, host, () => {
  process.stdout.write(`serve-dist listening on http://${host}:${port} (dist: ${distDir})\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      process.exit(0);
    });
  });
}
