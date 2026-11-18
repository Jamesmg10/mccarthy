import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, validatePayload, cosine, rankMatches, config } from '../netlify/functions/semantic-search.mjs';

const env = { AI_ENABLED: 'true', OPENAI_API_KEY: 'not-a-real-key', DEMO_ACCESS_TOKEN: 'x'.repeat(40),
  ALLOWED_ORIGIN: 'https://demo.example', OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small' };
const payload = { consent: true, query: 'interview coding approaches', records: [
  { id: 'a', whySaved: 'I saved this because it compares ways to code interviews', project: 'Research Methods', url: 'https://private.invalid', extra: 'do not send' },
  { id: 'b', whySaved: 'Plans for growing tomatoes', project: 'Garden' }
] };
function request(value = payload, overrides = {}) {
  const { headers, ...rest } = overrides;
  return new Request('https://demo.example/api/search', { method: 'POST',
    headers: { 'content-type': 'application/json', origin: env.ALLOWED_ORIGIN,
      authorization: `Bearer ${env.DEMO_ACCESS_TOKEN}`, ...headers },
    body: JSON.stringify(value), ...rest });
}
function setup(options = {}) {
  const calls = [], logs = [];
  const handler = createHandler({ env: { ...env, ...options.env }, log: text => logs.push(JSON.parse(text)),
    fetchImpl: async (url, init) => { calls.push({ url, init });
      if (options.error) throw options.error;
      return new Response(JSON.stringify(options.result || {
        data: [{ index: 2, embedding: [0, 1] }, { index: 0, embedding: [1, 0] }, { index: 1, embedding: [.9, .1] }],
        usage: { prompt_tokens: 123, total_tokens: 123 }
      }), { status: options.status || 200 });
    }
  });
  return { handler, calls, logs };
}
test('cosine measures vectors and rejects invalid inputs', () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.throws(() => cosine([0], [0])); assert.throws(() => cosine([NaN], [1]));
  assert.throws(() => cosine([1], [1, 2]));
});
test('payload allowlist excludes URLs and preserves original note', () => {
  const { inputs, records } = validatePayload(payload);
  assert.equal(records[0].whySaved, payload.records[0].whySaved);
  assert.equal(inputs.length, 3); assert.ok(!JSON.stringify(inputs).includes('private.invalid'));
  assert.ok(!JSON.stringify(inputs).includes('do not send')); assert.ok(!('url' in records[0]));
});
test('ranking uses provider indices, not array order', async () => {
  const { handler, calls, logs } = setup(); const res = await handler(request());
  assert.equal(res.status, 200); const data = await res.json();
  assert.deepEqual(data.matches.map(r => r.id), ['a']);
  assert.equal(data.matches[0].evidence.note, payload.records[0].whySaved);
  assert.match(data.matches[0].explanation, /No article text was read/);
  assert.equal(data.thresholdCalibrated, false);
  assert.equal(calls.length, 1); assert.equal(calls[0].url, 'https://api.openai.com/v1/embeddings');
  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.model, 'text-embedding-3-small'); assert.equal(sent.encoding_format, 'float');
  assert.equal(sent.input[0], payload.query);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.ok(!JSON.stringify(data).includes(env.OPENAI_API_KEY));
  assert.equal(logs[0].input_tokens, 123); assert.ok(!JSON.stringify(logs).includes('code interviews'));
});
test('disabled configuration makes no provider call', async () => {
  const { handler, calls } = setup({ env: { AI_ENABLED: 'false' } });
  assert.equal((await handler(request())).status, 503); assert.equal(calls.length, 0);
});
test('missing secret makes no provider call', async () => {
  const { handler, calls } = setup({ env: { OPENAI_API_KEY: '' } });
  assert.equal((await handler(request())).status, 503); assert.equal(calls.length, 0);
});
test('short reviewer code fails closed', async () => {
  const { handler, calls } = setup({ env: { DEMO_ACCESS_TOKEN: 'short' } });
  assert.equal((await handler(request())).status, 503); assert.equal(calls.length, 0);
});
test('wrong reviewer code rejected before OpenAI', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request(payload, { headers: { authorization: 'Bearer wrong' } }))).status, 401);
  assert.equal(calls.length, 0);
});
test('foreign origin rejected before OpenAI', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request(payload, { headers: { origin: 'https://other.example' } }))).status, 403);
  assert.equal(calls.length, 0);
});
test('GET rejected', async () => {
  const { handler, calls } = setup(); assert.equal((await handler(new Request('https://demo.example/api/search'))).status, 405);
  assert.equal(calls.length, 0);
});
test('non-JSON rejected', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request(payload, { headers: { 'content-type': 'text/plain' } }))).status, 415);
  assert.equal(calls.length, 0);
});
test('consent is mandatory', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request({ ...payload, consent: false }))).status, 400); assert.equal(calls.length, 0);
});
test('oversized body rejected before OpenAI', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request({ ...payload, junk: 'x'.repeat(66000) }))).status, 413); assert.equal(calls.length, 0);
});
test('malformed JSON rejected', async () => {
  const { handler, calls } = setup(); assert.equal((await handler(request(payload, { body: '{' }))).status, 400);
  assert.equal(calls.length, 0);
});
test('invalid query, duplicate ids, empty and oversized libraries rejected', () => {
  for (const p of [null, [], { ...payload, query: ' ' }, { ...payload, query: 'x'.repeat(501) },
    { ...payload, records: [] }, { ...payload, records: Array(21).fill(payload.records[0]) },
    { ...payload, records: [payload.records[0], payload.records[0]] }]) assert.throws(() => validatePayload(p));
});
test('invalid record types and limits rejected', () => {
  for (const bad of [null, { id: 'a', whySaved: ' ' }, { id: 'a', whySaved: 'x'.repeat(2001) },
    { id: 'a', whySaved: 'note', project: {} }, { id: 'a', whySaved: 'note', project: 'x'.repeat(201) }]) {
    assert.throws(() => validatePayload({ ...payload, records: [bad] }));
  }
});
test('total context cap prevents large batches', () => {
  const records = Array.from({ length: 10 }, (_, i) => ({ id: String(i), whySaved: 'x'.repeat(1900) }));
  assert.throws(() => validatePayload({ ...payload, records }));
});
test('invalid threshold or model fails closed', async () => {
  for (const settings of [{ SEMANTIC_MIN_SCORE: 'NaN' }, { SEMANTIC_MIN_SCORE: '2' }, { OPENAI_EMBEDDING_MODEL: 'wrong' }]) {
    const { handler, calls } = setup({ env: settings });
    assert.equal((await handler(request())).status, 503); assert.equal(calls.length, 0);
  }
});
test('provider rate limit is surfaced without sensitive provider body', async () => {
  const { handler, calls } = setup({ status: 429, result: { secret: env.OPENAI_API_KEY } });
  const res = await handler(request()); assert.equal(res.status, 429);
  assert.ok(!(await res.text()).includes(env.OPENAI_API_KEY)); assert.equal(calls.length, 1);
});
test('provider failure does not retry or leak details', async () => {
  const { handler, calls } = setup({ status: 401, result: { secret: env.OPENAI_API_KEY } });
  const res = await handler(request()); assert.equal(res.status, 502);
  assert.ok(!(await res.text()).includes(env.OPENAI_API_KEY)); assert.equal(calls.length, 1);
});
test('timeout returns useful failure without retry', async () => {
  const error = new Error('timeout'); error.name = 'TimeoutError';
  const { handler, calls } = setup({ error });
  assert.equal((await handler(request())).status, 504); assert.equal(calls.length, 1);
});
test('invalid provider vector response is rejected', async () => {
  const { handler } = setup({ result: { data: [{ index: 0, embedding: [1, 0] }] } });
  assert.equal((await handler(request())).status, 502);
  assert.throws(() => rankMatches(payload.records, [
    { index: 0, embedding: [1] }, { index: 0, embedding: [1] }, { index: 2, embedding: [1] }
  ], .35));
});
test('unrelated mock vectors produce no match', async () => {
  const { handler } = setup({ result: { data: [
    { index: 0, embedding: [1, 0] }, { index: 1, embedding: [0, 1] }, { index: 2, embedding: [-1, 0] }
  ] } });
  assert.deepEqual((await (await handler(request())).json()).matches, []);
});
test('Netlify rate-limit declaration and custom route exist (host enforcement not tested)', () => {
  assert.equal(config.path, '/api/search'); assert.equal(config.rateLimit.windowLimit, 10);
  assert.deepEqual(config.rateLimit.aggregateBy, ['domain']);
});
