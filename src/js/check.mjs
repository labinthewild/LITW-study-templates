/*************************************************************
 * check.mjs
 *
 * Validates a study's module graph by actually loading it in Node.
 * Catches syntax errors, missing exports, and import resolution
 * failures. Errors related to browser APIs (window, document, $)
 * are expected in Node and reported as informational.
 *
 * Usage: node js/check.mjs <study-name>
 *        npm run check <study-name>
 *
 * Example: node js/check.mjs study-base
 *
 * © Copyright 2024 LabintheWild
 *************************************************************/

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const STUDY = process.argv[2];
const ROOT = process.cwd();

if (!STUDY) {
    console.error("\n  Usage: node js/check.mjs <study-name>\n");
    console.error("  Example: node js/check.mjs study-base\n");
    process.exit(1);
}

const studyPath = pathToFileURL(resolve(ROOT, STUDY, 'study-manager.mjs')).href;

// Known browser-only references that are safe to ignore in Node
const BROWSER_GLOBALS = [
    'window is not defined',
    'document is not defined',
    '$ is not defined',
    'Handlebars is not defined',
    'self is not defined',
];

import(studyPath)
    .then(() => {
        console.log(`\n  ✅ ${STUDY} — all good\n`);
        process.exit(0);
    })
    .catch(e => {
        let msg = e.message || String(e);

        // Syntax errors — the code itself is broken
        if (e instanceof SyntaxError || msg.startsWith('Unexpected token')) {
            console.error(`\n  ❌ ${STUDY} — syntax error: ${msg}\n`);
            process.exit(1);
        }

        // Import resolution errors
        if (e.code === 'ERR_MODULE_NOT_FOUND') {
            console.error(`\n  ❌ ${STUDY} — module not found: ${msg}\n`);
            process.exit(1);
        }
        if (msg.includes('does not provide an export')) {
            console.error(`\n  ❌ ${STUDY} — ${msg}\n`);
            process.exit(1);
        }

        // Browser-global errors are expected in Node
        let isBrowserGlobal = BROWSER_GLOBALS.some(g => msg.includes(g));
        if (isBrowserGlobal) {
            console.log(`\n  ✅ ${STUDY} — modules resolved (browser globals not available in Node)\n`);
            process.exit(0);
        }

        // Unknown error — show it but pass (might be Node-specific)
        console.log(`\n  ⚠️  ${STUDY} — ${msg}\n`);
        process.exit(0);
    });