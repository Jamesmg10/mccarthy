import { mkdir, rm, copyFile } from 'node:fs/promises';
const dist = new URL('../dist/', import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
// Allowlist only browser assets; do not publish server code, docs, tests or .env files.
for (const file of ['index.html', 'styles.css', 'app.js', 'ai-search.js', 'core.js', 'knowledge-graph.js']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(file, dist));
}
console.log('Built six static assets. Server functions are deployed separately by Netlify.');
