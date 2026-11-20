import test from 'node:test';
import assert from 'node:assert/strict';
import '../core.js';
import { validatePayload } from '../netlify/functions/semantic-search.mjs';
const C = globalThis.HiveMindCore;
const source = (overrides={}) => ({id:'a',url:'https://example.org/a',title:'A source',whySaved:'  Original note\nunchanged  ',project:'Methods',createdAt:'2026-11-20T12:00:00Z',...overrides});
function storage(raw=null) { let value=raw; return {getItem:()=>value,setItem:(_,v)=>{value=v;}}; }
test('source validation rejects whitespace and existing server size limits', () => {
  for (const r of [source({whySaved:' \n '}),source({whySaved:'x'.repeat(2001)}),source({project:'p'.repeat(201)})]) assert.ok(C.recordIssue(r));
  assert.equal(C.recordIssue(source()),'');
});
test('client payload validates against unchanged server and preserves note bytes', () => {
  const r=source(); const p=C.semanticPayload(' interview methods ',[r]);
  const validated=validatePayload(p);
  assert.equal(validated.records[0].whySaved,r.whySaved); assert.equal(p.query,'interview methods');
  assert.ok(!('url' in p.records[0])); assert.ok(!('title' in p.records[0]));
});
test('empty, oversized and duplicate selections fail without silent truncation', () => {
  for (const rows of [[],Array.from({length:21},(_,i)=>source({id:String(i)})),[source(),source()]]) assert.throws(()=>C.semanticPayload('query',rows));
});
test('query and total context budgets match server limits', () => {
  assert.throws(()=>C.semanticPayload('x'.repeat(501),[source()]));
  assert.throws(()=>C.semanticPayload('query',Array.from({length:10},(_,i)=>source({id:String(i),whySaved:'x'.repeat(1900)}))));
  assert.equal(C.queryIssue(' \n '),'Enter a search of 1–500 characters.');
});
test('boundary lengths remain accepted by the server', () => {
  const p=C.semanticPayload('q'.repeat(500),[source({whySaved:'n'.repeat(2000),project:'p'.repeat(200)})]);
  assert.doesNotThrow(()=>validatePayload(p));
});
test('legacy invalid note is readable for explicit repair', () => {
  const r=source({whySaved:'x'.repeat(2001),extra:'retain'}),s=storage(JSON.stringify([r]));
  assert.deepEqual(C.readLibrary(s).records,[r]); assert.throws(()=>C.semanticPayload('query',[r]));
});
test('corrupt or unsupported storage is not silently replaced', () => {
  for (const raw of ['{','{}',JSON.stringify([source(),source()]),JSON.stringify([source({url:'javascript:alert(1)'})])]) {
    const s=storage(raw);assert.throws(()=>C.readLibrary(s));assert.equal(s.getItem(),raw);
  }
});
test('same-origin storage contract and unknown fields remain unchanged', () => {
  const r=source({custom:{keep:true}}),raw=JSON.stringify([r]),s=storage(raw);
  const read=C.readLibrary(s); assert.equal(read.raw,raw);assert.equal(C.KEY,'mccarthy-prototype-sources-v1');
  C.writeLibrary(s,read.records,raw);assert.deepEqual(JSON.parse(s.getItem()),[r]);
});
test('concurrent-tab changes block writes without data loss', () => {
  const s=storage('[]');s.setItem(C.KEY,'["new-data"]');
  assert.throws(()=>C.writeLibrary(s,[source()],'[]'),/another tab/);assert.equal(s.getItem(),'["new-data"]');
});
test('graph edges each have actual saved-field evidence', () => {
  const rows=[source(),source({id:'b',title:'B'}),source({id:'c',project:'History'})];
  const graph=C.buildGraph(rows);assert.equal(graph.nodes.length,5);assert.equal(graph.edges.length,3);
  for (const e of graph.edges) {
    const r=rows.find(r=>r.id===e.evidence.recordId);
    assert.equal(e.evidence.value,r.project);assert.equal(e.evidence.field,'project');
    assert.equal(e.kind,'saved_project_membership');assert.equal(e.to,`project:${r.project}`);
  }
});
test('unassigned sources have nodes but no invented edges', () => {
  const g=C.buildGraph([source({project:''}),source({id:'b',project:'  '})]);
  assert.equal(g.nodes.length,2);assert.deepEqual(g.edges,[]);
});
test('graph preserves label identity and does not merge projects by guessed similarity', () => {
  const rows=[source({project:'Methods'}),source({id:'b',project:'methods'})], before=JSON.stringify(rows);
  assert.equal(C.buildGraph(rows).nodes.filter(n=>n.kind==='project').length,2);assert.equal(JSON.stringify(rows),before);
});
test('graph namespace prevents source/project ID collision', () => {
  const g=C.buildGraph([source({id:'Methods',project:'Methods'})]);
  assert.equal(new Set(g.nodes.map(n=>n.id)).size,2);
});
test('empty graph stays empty; no seeded demo nodes', () => assert.deepEqual(C.buildGraph([]),{nodes:[],edges:[]}));
test('escaped notes and safe links cannot introduce HTML or script URLs', () => {
  assert.equal(C.safeURL('javascript:alert(1)'),null);assert.equal(C.safeURL('ftp://example.org'),null);
  assert.equal(C.escapeHTML('<script>" &'), '&lt;script&gt;&quot; &amp;');
});
test('word matching includes titles and cites only matched saved fields', () => {
  const matches=C.wordMatches('archaeology',[source({title:'Archaeology notebook'}),source({id:'b'})]);
  assert.equal(matches.length,1);assert.equal(matches[0].evidence[0].field,'title');
});
