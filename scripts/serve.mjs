import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const portFlagIndex = args.indexOf('--port');
const port = portFlagIndex >= 0 ? Number(args[portFlagIndex + 1]) || 8000 : 8000;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8']
]);

function getContentType(filePath) {
  return contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

async function resolveFile(requestPath) {
  const safePath = decodeURIComponent(requestPath).replace(/^\/+/, '');
  const candidate = path.resolve(rootDir, safePath || 'index.html');

  if (!candidate.startsWith(rootDir + path.sep) && candidate !== rootDir) {
    return null;
  }

  try {
    const fileStat = await stat(candidate);

    if (fileStat.isDirectory()) {
      return path.join(candidate, 'index.html');
    }

    return candidate;
  } catch {
    return safePath.endsWith('/') || safePath === ''
      ? path.join(candidate, 'index.html')
      : candidate;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const filePath = await resolveFile(url.pathname);

    if (!filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 - Forbidden');
      return;
    }

    let finalPath = filePath;

    try {
      const fileStat = await stat(finalPath);
      if (fileStat.isDirectory()) {
        finalPath = path.join(finalPath, 'index.html');
      }
    } catch {
      // Fall through to 404 below.
    }

    try {
      const body = await readFile(finalPath);
      res.writeHead(200, { 'Content-Type': getContentType(finalPath) });
      res.end(body);
    } catch {
      const fallback = path.join(rootDir, 'index.html');
      try {
        const body = await readFile(fallback);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(body);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - Not Found');
      }
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`500 - ${error.message}`);
  }
});

server.listen(port, () => {
  console.log(`Arkhai Wiki rodando em http://localhost:${port}/`);
  console.log('Use Ctrl+C para parar.');
});
