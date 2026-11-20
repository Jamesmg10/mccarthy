/* One query, one results region. Credentials live only in this mounted form. */
window.attachSemanticSearch = function ({ query, records, renderCard, root }) {
  const C = window.HiveMindCore, esc = C.escapeHTML;
  root.innerHTML = `<form class="search" id="search-form" novalidate>
    <label class="sr" for="query">Search My Library</label>
    <input id="query" name="query" value="${esc(query)}" maxlength="500" placeholder="What do you remember about the source?" required>
    <button type="submit">Search</button></form>
    <div class="search-controls"><div class="field"><label for="search-mode">Search mode</label>
    <select id="search-mode"><option value="word">Word match · on this device</option><option value="semantic">By meaning · OpenAI</option></select></div></div>
    <section class="access-panel" id="ai-access" hidden><h2>Meaning-based search</h2>
    <p class="help">Your query, selected saved notes and project labels are sent to OpenAI through our server. URLs and article text are not sent. This does not read or summarize articles.</p>
    <div class="field"><label for="reviewer-code">Reviewer demo access code — not an OpenAI API key</label><input id="reviewer-code" type="password" autocomplete="off" minlength="32" maxlength="256"></div>
    <details><summary>Choose sources to search <span id="selection-count"></span></summary><p class="help">The pilot supports 1–20 selected sources and 16,000 total context characters. Your full library is retained.</p>
    <div class="actions"><button type="button" class="secondary" id="select-all">Select all</button><button type="button" class="secondary" id="clear-selection">Clear selection</button></div>
    <div class="source-picker">${records.map((r,i) => `<label class="source-choice"><input type="checkbox" name="source" value="${i}" checked><span>${esc(r.title)}${C.recordIssue(r) ? ` — ${esc(C.recordIssue(r))}` : ''}</span></label>`).join('')}</div></details>
    <label class="consent"><input id="consent" type="checkbox">I agree to send the selected notes, project labels and my query to OpenAI. They contain no sensitive data.</label>
    </section>
    <p id="search-help" class="help">Word matching searches saved titles, notes, project labels and URLs. Choose By meaning for contextual retrieval.</p>
    <div class="search-status" role="status" aria-live="polite"></div><div class="search-results" aria-label="Search results"></div>`;
  const form = root.querySelector('#search-form'), input = root.querySelector('#query');
  const mode = root.querySelector('#search-mode'), access = root.querySelector('#ai-access');
  const status = root.querySelector('.search-status'), results = root.querySelector('.search-results');
  const button = form.querySelector('button'), consent = root.querySelector('#consent');
  let controller = null, sequence = 0, disposed = false;
  const selected = () => [...root.querySelectorAll('input[name="source"]:checked')].map(el => records[Number(el.value)]);
  const count = () => { root.querySelector('#selection-count').textContent = `(${selected().length} selected)`; };
  function invalidate(message) {
    sequence++; controller?.abort(); controller = null; button.disabled = false;
    results.replaceChildren(); status.textContent = message;
  }
  const globalInput = document.getElementById('global-query');
  if (globalInput) globalInput.value = query;
  const onEdit = () => { if (globalInput) globalInput.value = input.value; invalidate('Query changed. Search again to see current results.'); };
  const onGlobalEdit = () => { input.value = globalInput.value; invalidate('Query changed. Search again to see current results.'); };
  input.addEventListener('input', onEdit); globalInput?.addEventListener('input', onGlobalEdit);
  mode.addEventListener('change', () => {
    invalidate('Search mode changed. Submit your query to continue.');
    access.hidden = mode.value !== 'semantic'; consent.checked = false;
    button.textContent = mode.value === 'semantic' ? 'Search by meaning' : 'Search';
    root.querySelector('#search-help').textContent = mode.value === 'semantic'
      ? 'Results will be ranked against the selected saved context. Similarity is not proof of an article claim.'
      : 'Word matching searches saved titles, notes, project labels and URLs. No AI request is made.';
  });
  access.addEventListener('change', event => {
    if (event.target.name === 'source') { count(); consent.checked = false; invalidate('Selection changed. Review consent and search again.'); }
  });
  for (const [id,checked] of [['select-all',true],['clear-selection',false]]) root.querySelector(`#${id}`).addEventListener('click', () => {
    root.querySelectorAll('input[name="source"]').forEach(el => { el.checked = checked; });
    consent.checked = false; count(); invalidate('Selection changed. Review consent and search again.');
  });
  function wordSearch(q) {
    const matches = C.wordMatches(q, records);
    status.textContent = `${matches.length} word match${matches.length === 1 ? '' : 'es'} for “${q}”. No AI was used.`;
    results.innerHTML = matches.length ? matches.map(({record,evidence}) => renderCard(record,
      `Word match: ${evidence.map(e => `${e.field} contains ${e.terms.join(', ')}`).join('; ')}.`)).join('')
      : '<div class="empty"><h2>No word matches</h2><p>Try different words, or choose By meaning to search saved context.</p></div>';
  }
  async function submit(event) {
    event?.preventDefault(); if (disposed) { status.textContent = 'Reload to search the current library.'; return; } invalidate('');
    const q = input.value.trim(), issue = C.queryIssue(input.value);
    if (issue) { status.textContent = issue; input.focus(); return; }
    // Read the visible value at submission, never a query captured at mount time.
    try { history.replaceState(null, '', `#search/${encodeURIComponent(q)}`); } catch { /* isolated test hosts may disallow history */ }
    const globalQuery = document.getElementById('global-query'); if (globalQuery) globalQuery.value = q;
    if (mode.value === 'word') { wordSearch(q); return; }
    const codeInput = root.querySelector('#reviewer-code'), code = codeInput.value.trim();
    if (/^sk-/i.test(code)) { status.textContent = 'Do not enter an OpenAI API key here. Use the separate reviewer code.'; codeInput.value = ''; return; }
    if (code.length < 32 || code.length > 256) { status.textContent = 'Enter the separate reviewer access code (32–256 characters).'; codeInput.focus(); return; }
    if (!consent.checked) { status.textContent = 'Review and accept the OpenAI disclosure before searching by meaning.'; consent.focus(); return; }
    let payload;
    try { payload = C.semanticPayload(input.value, selected()); }
    catch (error) {
      status.textContent = error.message; access.querySelector('details').open = true;
      const invalid = selected().filter(r => C.recordIssue(r));
      results.innerHTML = invalid.map(r => `<p><a href="#edit/${encodeURIComponent(r.id)}">Edit ${esc(r.title)}</a> — ${esc(C.recordIssue(r))}</p>`).join('');
      return;
    }
    const ticket = sequence, snapshot = new Map(selected().map(r => [r.id,r]));
    const active = new AbortController(); controller = active;
    const timeout = setTimeout(() => active.abort(), 20000);
    button.disabled = true; status.textContent = 'Searching selected saved context by meaning…';
    try {
      const response = await fetch('/api/search', { method:'POST', signal:active.signal,
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${code}`}, body:JSON.stringify(payload) });
      let data;
      try { data = await response.json(); } catch { throw new Error('AI endpoint unavailable. Choose Word match to search on this device.'); }
      if (!response.ok) throw new Error(data.error || 'AI search unavailable.');
      if (data.mode !== 'semantic' || !Array.isArray(data.matches)) throw new Error('Invalid AI response.');
      if (disposed || ticket !== sequence || !root.isConnected) return;
      const seen = new Set();
      for (const match of data.matches) {
        if (!snapshot.has(match.id) || !Number.isFinite(match.score) || seen.has(match.id)) throw new Error('Invalid match returned.');
        seen.add(match.id);
      }
      results.innerHTML = data.matches.length ? data.matches.map(match => {
        const r = snapshot.get(match.id);
        return renderCard(r, `Meaning-based candidate. Saved note: “${r.whySaved}” Project: “${r.project || 'Unassigned'}”. No article text was read.`);
      }).join('') : '<div class="empty"><h2>No meaning-based candidates</h2><p>No selected source passed the pilot threshold. Try another query or Word match. This does not prove no relevant source exists.</p></div>';
      status.textContent = `Meaning-based ranking: ${data.matches.length} candidate(s) for “${q}”. Check the saved context; the pilot threshold is not calibrated.`;
    } catch (error) {
      if (!disposed && ticket === sequence && root.isConnected) { results.replaceChildren(); status.textContent = error.name === 'AbortError'
        ? 'AI search stopped or timed out. Retry or choose Word match. Your records are unchanged.' : error.message; }
    } finally {
      clearTimeout(timeout);
      if (ticket === sequence && !disposed) { button.disabled = false; controller = null; }
    }
  }
  form.addEventListener('submit', submit); count();
  if (query.trim() && !C.queryIssue(query)) wordSearch(query.trim());
  else status.textContent = 'Enter a remembered phrase to search your saved research.';
  return () => { disposed = true; sequence++; controller?.abort(); globalInput?.removeEventListener('input', onGlobalEdit); root.querySelector('#reviewer-code').value = ''; };
};
