/** Reviewer-only semantic-search pilot. No database or article fetching. */
import { timingSafeEqual } from 'node:crypto';

const MAX_BODY_BYTES = 65536;
const MAX_RECORDS = 20;
const MAX_TEXT_CHARS = 16000;
const MODELS = new Set(['text-embedding-3-small', 'text-embedding-3-large']);

function json(status, value) {
  return new Response(JSON.stringify(value), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'
  }});
}
function authorized(provided, expected) {
  const left = Buffer.from(provided || '');
  const right = Buffer.from(`Bearer ${expected}`);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function validatePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request.');
  if (value.consent !== true) throw new Error('Explicit consent to send saved context is required.');
  if (typeof value.query !== 'string' || !value.query.trim() || value.query.length > 500) {
    throw new Error('Query must contain 1–500 characters.');
  }
  if (!Array.isArray(value.records) || value.records.length < 1 || value.records.length > MAX_RECORDS) {
    throw new Error('Semantic pilot supports 1–20 saved records per request.');
  }
  const ids = new Set();
  const records = value.records.map(record => {
    if (!record || typeof record.id !== 'string' || !record.id || record.id.length > 100 || ids.has(record.id)) {
      throw new Error('Each record needs a unique identifier.');
    }
    ids.add(record.id);
    if (typeof record.whySaved !== 'string' || !record.whySaved.trim() || record.whySaved.length > 2000) {
      throw new Error('Each saved note must contain 1–2,000 characters.');
    }
    if (record.project !== undefined && (typeof record.project !== 'string' || record.project.length > 200)) {
      throw new Error('Project must be text of at most 200 characters.');
    }
    // Explicit allowlist: never send URLs, full articles, arbitrary fields, or IDs to OpenAI.
    return { id: record.id, whySaved: record.whySaved, project: record.project || '' };
  });
  const inputs = [value.query.trim(), ...records.map(r => `Saved note: ${r.whySaved}\nProject: ${r.project}`)];
  if (inputs.reduce((count, text) => count + text.length, 0) > MAX_TEXT_CHARS) {
    throw new Error('Saved context exceeds the 16,000-character pilot limit.');
  }
  return { records, inputs };
}
export function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || a.length !== b.length) throw new Error('Invalid vectors.');
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) throw new Error('Invalid vector value.');
    dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2;
  }
  if (!aa || !bb || !Number.isFinite(dot + aa + bb)) throw new Error('Invalid vector norm.');
  return Math.max(-1, Math.min(1, dot / Math.sqrt(aa * bb)));
}
export function rankMatches(records, data, threshold) {
  if (!Array.isArray(data) || data.length !== records.length + 1) throw new Error('Missing embeddings.');
  const vectors = new Map();
  for (const item of data) {
    if (!Number.isInteger(item?.index) || item.index < 0 || item.index > records.length || vectors.has(item.index)) {
      throw new Error('Invalid embedding indices.');
    }
    vectors.set(item.index, item.embedding);
  }
  const query = vectors.get(0);
  return records.map((record, index) => ({
    id: record.id,
    score: cosine(query, vectors.get(index + 1)),
    evidence: { note: record.whySaved, project: record.project },
    explanation: 'Ranked by meaning similarity to your saved note and project. No article text was read.'
  })).filter(result => result.score >= threshold).sort((a, b) => b.score - a.score).slice(0, 5)
    .map(result => ({ ...result, score: Number(result.score.toFixed(4)) }));
}
async function readLimitedBody(request) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) return '';
  let size = 0; const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks).toString('utf8');
}
/** Dependency injection keeps tests offline: tests supply a fake fetch and fake env. */
export function createHandler({ env = process.env, fetchImpl = globalThis.fetch, log = console.info } = {}) {
  return async function handler(request) {
    if (request.method !== 'POST') return json(405, { error: 'POST required.' });
    const model = env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    const threshold = Number(env.SEMANTIC_MIN_SCORE || '0.35');
    if (env.AI_ENABLED !== 'true' || !env.OPENAI_API_KEY || !env.ALLOWED_ORIGIN ||
        !env.DEMO_ACCESS_TOKEN || env.DEMO_ACCESS_TOKEN.length < 32 ||
        !MODELS.has(model) || !Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      return json(503, { error: 'AI search is not configured. Local word matching is still available.' });
    }
    if (request.headers.get('origin') !== env.ALLOWED_ORIGIN) return json(403, { error: 'Origin not allowed.' });
    if (!authorized(request.headers.get('authorization'), env.DEMO_ACCESS_TOKEN)) {
      return json(401, { error: 'Valid reviewer access code required. Do not enter an OpenAI API key.' });
    }
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return json(415, { error: 'JSON required.' });
    }
    let payload;
    try { payload = JSON.parse(await readLimitedBody(request)); }
    catch (error) { return json(error.message === 'BODY_TOO_LARGE' ? 413 : 400, { error: 'Invalid or oversized JSON body.' }); }
    let validated;
    try { validated = validatePayload(payload); }
    catch (error) { return json(400, { error: error.message }); }
    const { records, inputs } = validated;
    const started = Date.now();
    try {
      // One bounded batch, no automatic retries or page fetches. API key remains server-side.
      const response = await fetchImpl('https://api.openai.com/v1/embeddings', {
        method: 'POST', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model, input: inputs, encoding_format: 'float' })
      });
      if (!response.ok) {
        // Do not echo provider bodies: they can contain sensitive request information.
        return json(response.status === 429 ? 429 : 502, {
          error: response.status === 429 ? 'AI rate or quota limit reached. Try local word matching.' : 'AI provider unavailable. Try local word matching.'
        });
      }
      const result = await response.json();
      const matches = rankMatches(records, result.data, threshold);
      const inputTokens = Number.isSafeInteger(result.usage?.prompt_tokens) ? result.usage.prompt_tokens : null;
      log(JSON.stringify({ event: 'semantic_search', model, records: records.length,
        input_tokens: inputTokens, latency_ms: Date.now() - started }));
      return json(200, { mode: 'semantic', model, evidenceBasis: 'user_note_and_project',
        threshold, thresholdCalibrated: false, matches, usage: { inputTokens } });
    } catch (error) {
      return json(error.name === 'TimeoutError' || error.name === 'AbortError' ? 504 : 502,
        { error: 'AI search could not complete. Your saved records are unchanged.' });
    }
  };
}
export default createHandler();
// Verify host enforcement before enabling paid API traffic. This is not a dollar cap.
export const config = { path: '/api/search', rateLimit: {
  action: 'rate_limit', windowLimit: 10, windowSize: 60, aggregateBy: ['domain']
}};
