/* Shared, dependency-free client contracts. Existing records are never migrated. */
(function (root) {
  'use strict';
  const KEY = 'mccarthy-prototype-sources-v1';
  const limits = Object.freeze({ note: 2000, project: 200, query: 500, records: 20, context: 16000 });
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeURL(value) {
    try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
    catch { return null; }
  }
  function recordIssue(record) {
    if (typeof record.whySaved !== 'string' || !record.whySaved.trim()) return 'Add a note that is not only spaces.';
    if (record.whySaved.length > limits.note) return 'The note exceeds 2,000 characters.';
    if (record.project !== undefined && (typeof record.project !== 'string' || record.project.length > limits.project)) return 'The project label exceeds 200 characters or is invalid.';
    return '';
  }
  function queryIssue(query) {
    return typeof query !== 'string' || !query.trim() || query.length > limits.query ? 'Enter a search of 1–500 characters.' : '';
  }
  function semanticPayload(query, records) {
    const error = queryIssue(query); if (error) throw new Error(error);
    if (!records.length || records.length > limits.records) throw new Error('Choose 1–20 sources below. No sources will be excluded automatically.');
    const ids = new Set();
    for (const record of records) {
      if (typeof record.id !== 'string' || !record.id || record.id.length > 100 || ids.has(record.id)) throw new Error('The selection contains an invalid or duplicate source identifier.');
      ids.add(record.id);
      const issue = recordIssue(record);
      if (issue) throw new Error(`${record.title || 'Saved source'}: ${issue} Edit the source or explicitly uncheck it below.`);
    }
    const clean = records.map(r => ({ id: r.id, whySaved: r.whySaved, project: r.project || '' }));
    const text = [query.trim(), ...clean.map(r => `Saved note: ${r.whySaved}\nProject: ${r.project}`)];
    if (text.reduce((n, s) => n + s.length, 0) > limits.context) throw new Error('Selected context exceeds 16,000 characters. Choose fewer sources; nothing has been truncated.');
    return { query: query.trim(), consent: true, records: clean };
  }
  function readLibrary(storage) {
    const raw = storage.getItem(KEY);
    if (raw === null) return { records: [], raw };
    let records;
    try { records = JSON.parse(raw); } catch { throw new Error('Stored library could not be read. It has not been replaced or cleared. Restore a valid backup before saving.'); }
    const ids = new Set();
    if (!Array.isArray(records) || records.some(r => {
      const invalid = !r || typeof r.id !== 'string' || !r.id || ids.has(r.id) || typeof r.title !== 'string' || typeof r.whySaved !== 'string' || (r.project !== undefined && typeof r.project !== 'string') || !safeURL(r.url);
      if (r) ids.add(r.id); return invalid;
    })) throw new Error('The stored library contains unsupported or duplicate records. Nothing was changed. Restore a valid backup before saving.');
    return { records, raw };
  }
  function writeLibrary(storage, records, expectedRaw) {
    if (storage.getItem(KEY) !== expectedRaw) throw new Error('Your library changed in another tab. Reload and try again; this form has not been saved.');
    storage.setItem(KEY, JSON.stringify(records));
  }
  const tokens = s => [...new Set(String(s || '').toLowerCase().match(/[a-z0-9]{3,}/g) || [])].filter(w => !['the','this','that','with','from','about','saved','piece','article','because','ways'].includes(w));
  function wordMatches(query, records) {
    const terms = tokens(query);
    return records.map(record => {
      const evidence = [['title',record.title],['saved note',record.whySaved],['project',record.project],['source URL',record.url]].flatMap(([field,text]) => {
        const found = terms.filter(t => tokens(text).some(w => w === t || w.startsWith(t) || t.startsWith(w)));
        return found.length ? [{field, terms:found}] : [];
      });
      return { record, evidence, score:evidence.reduce((n,e) => n + e.terms.length, 0) };
    }).filter(r => r.score > 0).sort((a,b) => b.score - a.score);
  }
  function buildGraph(records) {
    const nodes = [], edges = [], projects = new Map();
    for (const record of records) {
      nodes.push({ id:`source:${record.id}`, kind:'source', label:record.title, recordId:record.id });
      const project = record.project || '';
      if (!project.trim()) continue;
      const id = `project:${project}`;
      if (!projects.has(id)) { const node = {id,kind:'project',label:project}; projects.set(id,node); nodes.push(node); }
      edges.push({ from:`source:${record.id}`, to:id, kind:'saved_project_membership', evidence:{ recordId:record.id, field:'project', value:project } });
    }
    return {nodes,edges};
  }
  root.HiveMindCore = Object.freeze({KEY,limits,escapeHTML,safeURL,recordIssue,queryIssue,semanticPayload,readLibrary,writeLibrary,wordMatches,buildGraph});
})(globalThis);
