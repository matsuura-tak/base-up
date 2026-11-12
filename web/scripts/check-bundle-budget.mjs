import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, '../dist/assets');

const JS_GZIP_LIMIT_BYTES = 120 * 1024; // 122,880 bytes (ADR-001)
const CSS_GZIP_LIMIT_BYTES = 20 * 1024; // 20,480 bytes (ADR-001)

if (!fs.existsSync(assetsDir)) {
  process.stderr.write(`Bundle budget check failed: missing ${assetsDir}\n`);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsFiles = files.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
const cssFiles = files.filter((f) => f.endsWith('.css'));

if (jsFiles.length === 0) {
  process.stderr.write('Bundle budget check failed: no JS bundle emitted in dist/assets\n');
  process.exit(1);
}

if (jsFiles.length > 1) {
  process.stderr.write(
    `Bundle budget check failed: expected single JS bundle (ADR-001), found ${jsFiles.length}: ${jsFiles.join(', ')}\n`,
  );
  process.exit(1);
}

let totalJsRaw = 0;
let totalJsGzip = 0;
for (const file of jsFiles) {
  const buf = fs.readFileSync(path.join(assetsDir, file));
  totalJsRaw += buf.byteLength;
  totalJsGzip += zlib.gzipSync(buf, { level: 9 }).byteLength;
}

let totalCssRaw = 0;
let totalCssGzip = 0;
for (const file of cssFiles) {
  const buf = fs.readFileSync(path.join(assetsDir, file));
  totalCssRaw += buf.byteLength;
  totalCssGzip += zlib.gzipSync(buf, { level: 9 }).byteLength;
}

const jsKb = (totalJsGzip / 1024).toFixed(2);
const cssKb = (totalCssGzip / 1024).toFixed(2);

process.stdout.write(
  `Bundle budget check: JS raw=${totalJsRaw}B gzip=${totalJsGzip}B (${jsKb} KB / 120.00 KB), CSS raw=${totalCssRaw}B gzip=${totalCssGzip}B (${cssKb} KB / 20.00 KB)\n`,
);

if (totalJsGzip > JS_GZIP_LIMIT_BYTES) {
  process.stderr.write(
    `Bundle budget exceeded: JS gzip ${totalJsGzip}B > limit ${JS_GZIP_LIMIT_BYTES}B\n`,
  );
  process.exit(1);
}

if (totalCssGzip > CSS_GZIP_LIMIT_BYTES) {
  process.stderr.write(
    `Bundle budget exceeded: CSS gzip ${totalCssGzip}B > limit ${CSS_GZIP_LIMIT_BYTES}B\n`,
  );
  process.exit(1);
}
