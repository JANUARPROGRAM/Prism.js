#!/usr/bin/env node
/**
 * Zero-dependency static file server for local development.
 * Serves the repository root so examples can import `../../src/index.js` as
 * native ES modules (no build step needed).
 *
 *   npm run dev                 -> http://localhost:8080/
 *   npm run dev -- --port 3000
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.md': 'text/markdown; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.obj': 'text/plain; charset=utf-8',
	'.gltf': 'model/gltf+json',
	'.glb': 'model/gltf-binary',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
};

function parseArgs(argv) {
	const options = { port: Number(process.env.PORT) || 8080, host: 'localhost' };
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === '--port') options.port = Number(argv[++i]);
		else if (argv[i] === '--host') options.host = argv[++i];
	}
	if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
		console.error('Vertex dev server: --port must be an integer between 0 and 65535.');
		process.exit(1);
	}
	return options;
}

function send(res, status, body, headers = {}) {
	res.writeHead(status, { 'Cache-Control': 'no-cache', ...headers });
	res.end(body);
}

async function handle(req, res) {
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
	}

	let pathname;
	try {
		pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
	} catch {
		return send(res, 400, 'Bad Request');
	}

	if (pathname === '/') return send(res, 302, '', { Location: '/examples/' });

	// Never serve dotfiles/directories such as .git.
	if (pathname.split('/').some((segment) => segment.startsWith('.'))) {
		return send(res, 404, 'Not Found');
	}

	let filePath = resolve(join(ROOT, pathname));
	if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
		return send(res, 403, 'Forbidden');
	}

	try {
		const info = await stat(filePath);
		if (info.isDirectory()) {
			// Relative URLs inside index.html only resolve against a trailing slash.
			if (!pathname.endsWith('/')) return send(res, 301, '', { Location: `${pathname}/` });
			filePath = join(filePath, 'index.html');
		}
		const body = await readFile(filePath);
		const type = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
		return send(res, 200, req.method === 'HEAD' ? '' : body, { 'Content-Type': type });
	} catch (error) {
		if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return send(res, 404, 'Not Found');
		console.error(error);
		return send(res, 500, 'Internal Server Error');
	}
}

const { port, host } = parseArgs(process.argv.slice(2));
const server = createServer((req, res) => {
	handle(req, res).catch((error) => {
		console.error(error);
		send(res, 500, 'Internal Server Error');
	});
});

server.on('error', (error) => {
	if (error.code === 'EADDRINUSE') {
		console.error(`Vertex dev server: port ${port} is already in use. Try --port <number>.`);
	} else {
		console.error(error);
	}
	process.exit(1);
});

server.listen(port, host, () => {
	console.log(`Vertex dev server: http://${host}:${server.address().port}/`);
});
