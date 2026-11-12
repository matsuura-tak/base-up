import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');
const distDir = path.join(webRoot, 'dist');
const budgetPath = path.join(webRoot, 'lighthouse-budget.json');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  process.stderr.write('dist/index.html not found. Run `npm run build` first.\n');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()',
  'X-Frame-Options': 'DENY',
};

function resolveChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  try {
    const pwChromium = execFileSync(
      process.execPath,
      ['-e', "import('@playwright/test').then(m => process.stdout.write(m.chromium.executablePath()))"],
      { cwd: path.join(webRoot, 'tests/acceptance'), encoding: 'utf8' },
    ).trim();
    if (pwChromium && fs.existsSync(pwChromium)) {
      return pwChromium;
    }
  } catch {
    /* Fall through to system Chrome discovery */
  }
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(macChrome)) {
    return macChrome;
  }
  return undefined;
}

function runLighthouseCli(targetUrl, env) {
  const cliBin = path.join(webRoot, 'node_modules/lighthouse/cli/index.js');
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        cliBin,
        targetUrl,
        '--quiet',
        '--output=json',
        '--output-path=stdout',
        '--only-categories=performance,accessibility',
        `--budget-path=${budgetPath}`,
        '--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage',
      ],
      { env, stdio: ['ignore', 'pipe', 'pipe'] },
    );

    const stdoutChunks = [];
    const stderrChunks = [];
    child.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk) => stderrChunks.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      const stdoutText = Buffer.concat(stdoutChunks).toString('utf8');
      const stderrText = Buffer.concat(stderrChunks).toString('utf8');
      if (code !== 0) {
        reject(new Error(`Lighthouse exited with code ${String(code)}: ${stderrText}`));
        return;
      }
      resolve(stdoutText);
    });
  });
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url || '/', 'http://127.0.0.1');
  const rel = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
  const candidate = path.resolve(distDir, rel);
  if (rel && candidate.startsWith(distDir) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate).toLowerCase();
    const buf = fs.readFileSync(candidate);
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': String(buf.byteLength),
    });
    res.end(buf);
    return;
  }
  const indexBuf = fs.readFileSync(path.join(distDir, 'index.html'));
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': String(indexBuf.byteLength),
  });
  res.end(indexBuf);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const addr = server.address();
const port = typeof addr === 'object' && addr ? addr.port : 4173;
const baseOrigin = `http://127.0.0.1:${String(port)}`;
const auditRoutes = ['/', '/combinator?stage=1', '/fermi?stage=1', '/diagnostic'];

try {
  const chromePath = resolveChromePath();
  const env = { ...process.env };
  if (chromePath) {
    env.CHROME_PATH = chromePath;
  }

  for (const routePath of auditRoutes) {
    const targetUrl = `${baseOrigin}${routePath}`;
    const rawJson = await runLighthouseCli(targetUrl, env);
    const lhr = JSON.parse(rawJson);

    const perfScore = Math.round((lhr.categories.performance.score ?? 0) * 100);
    const a11yScore = Math.round((lhr.categories.accessibility.score ?? 0) * 100);
    const lcpMs = Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? 0);
    const clsVal = Number((lhr.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(4));
    const tbtMs = Math.round(lhr.audits['total-blocking-time']?.numericValue ?? 0);

    process.stdout.write(
      `Lighthouse (${routePath}): Performance=${String(perfScore)}, Accessibility=${String(a11yScore)}, LCP=${String(lcpMs)}ms, TBT=${String(tbtMs)}ms, CLS=${String(clsVal)}\n`,
    );

    if (perfScore < 90 || a11yScore < 100 || lcpMs > 2500 || clsVal > 0.1) {
      process.stderr.write(
        `Lighthouse budget failed on ${routePath}: expected Performance>=90, Accessibility=100, LCP<=2500ms, CLS<=0.1\n`,
      );
      process.exitCode = 1;
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
