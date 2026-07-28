/*************************************************************
 * dev-server.mjs
 *
 * Minimal dev server for LITW studies.
 * Serves static files from the current directory so shared
 * resources (js/, templates/, css/) are available, while
 * redirecting / to the specified study's index.html.
 *
 * Usage: node dev-server.mjs <study-name> [port]
 *        npm run dev <study-name>
 *
 * Examples:
 *   node dev-server.mjs study-base
 *   node dev-server.mjs study-cats 9090
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const PORT = parseInt(process.argv[3] || process.env.PORT || 8080);
const STUDY = process.argv[2];

if (!STUDY) {
    console.error("\n  Usage: node dev-server.mjs <study-name> [port]\n");
    console.error("  Example: node dev-server.mjs study-base\n");
    process.exit(1);
}

const MIME = {
    '.html': 'text/html',
    '.mjs':  'text/javascript',
    '.js':   'text/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
};

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let method = req.method;

    // ── API endpoints ───────────────────────────────────────

    // POST /service/<id>/data/ — log submitted data
    if (method === 'POST' && url.match(/^\/service\/[^/]+\/data\/?$/)) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                let data = JSON.parse(body);
                console.log(JSON.stringify(data, null, 2));
                console.log('─────────────────────────────\n');
            } catch (e) {
                // ignore malformed data silently
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok (dev placeholder)' }));
        });
        return;
    }

    // GET /config/<id>/study_references — fake recommendations
    let refMatch = url.match(/^\/config\/([^/]+)\/study_references$/);
    if (method === 'GET' && refMatch) {
        let fakeRefs = [
            {
                URL: `/${STUDY}/`,
                LOGO_URL: '../img/LITW-logo2020.png',
                SLOGAN: '🔬 LITW Study (dev placeholder)',
                DESCRIPTION: 'This is a local development server. Study recommendations will appear here when deployed.'
            },
            {
                URL: `/${STUDY}/`,
                LOGO_URL: '../img/LITW-logo2020.png',
                SLOGAN: '🧪 Dev mode',
                DESCRIPTION: 'Replace this with real study recommendations from the LITW API server.'
            }
        ];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(fakeRefs));
        return;
    }

    // ── Static files ────────────────────────────────────────

    // Redirect / to the selected study
    if (url === '/' || url === '') {
        res.writeHead(302, { Location: `/${STUDY}/` });
        return res.end();
    }

    let filePath = path.join(ROOT, url);
    if (!path.extname(filePath)) filePath = path.join(filePath, 'index.html');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end(`404 — ${url}`);
        }
        let ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`\n  🧪 LITW dev server — serving "${STUDY}"\n`);
    console.log(`     http://localhost:${PORT}/\n`);

    // Check study_id
    let studyFile = path.join(ROOT, STUDY, 'study-manager.mjs');
    try {
        let src = fs.readFileSync(studyFile, 'utf-8');
        let match = src.match(/study_id\s*:\s*"([^"]+)"/);
        if (match) {
            let sid = match[1];
            let uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRe.test(sid)) {
                console.log('  ⚠️  ALERT: before deployment your study needs a valid UUID');
                console.log(`     provided by the LabintheWild study server manager instead`);
                console.log(`     of the current \`config.study_id\`: ${sid}\n`);
            }
        }
    } catch (e) {
        // study-manager.mjs not found — skip check
    }

    console.log('─── Study data submission ───');
});
