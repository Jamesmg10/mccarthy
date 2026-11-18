/* Optional AI panel for Search Results. No API keys or access codes are persisted. */
window.attachSemanticSearch = function ({ query, records, renderCard, root }) {
  const panel = document.createElement('section');
  panel.className = 'card';
  panel.innerHTML = `<h2>Optional meaning-based search</h2>
    <p>This sends your search, saved notes and project labels to OpenAI through our server.
    URLs and article text are not sent. This does not summarize or read articles.</p>
    <form>
      <label for="reviewer-code">Reviewer demo access code — not an OpenAI API key</label>
      <input id="reviewer-code" type="password" autocomplete="off" minlength="32" maxlength="256" required>
      <label class="consent"><input name="consent" type="checkbox" required>
      I agree to send these notes, project labels and my query to OpenAI. They contain no sensitive data.</label>
      <button type="submit">Search by meaning</button>
    </form>
    <p class="muted">Up to 20 records; setup and reviewer code required. Saved notes remain unchanged.</p>
    <div class="ai-status" role="status" aria-live="polite"></div>
    <div class="ai-results"></div>`;
  root.querySelector('form.search').after(panel);
  const form = panel.querySelector('form');
  const status = panel.querySelector('.ai-status');
  const results = panel.querySelector('.ai-results');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const code = form.querySelector('#reviewer-code').value;
    if (code.startsWith('sk-')) { status.textContent = 'Do not enter an OpenAI API key here. Use the separate reviewer code.'; return; }
    if (!query.trim() || !records.length || records.length > 20) {
      status.textContent = 'Enter a query and use a library of 1–20 records for this pilot.'; return;
    }
    if (!form.elements.namedItem('consent').checked) return;
    const button = form.querySelector('button'); button.disabled = true;
    status.textContent = 'Searching saved context by meaning…'; results.replaceChildren();
    const controller = new AbortController();
    const cancel = () => controller.abort();
    window.addEventListener('hashchange', cancel, { once: true });
    const timeout = setTimeout(cancel, 20000);
    try {
      const response = await fetch('/api/search', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${code}` },
        body: JSON.stringify({ query, consent: true, records: records.map(r => ({
          id: r.id, whySaved: r.whySaved, project: r.project || ''
        })) })
      });
      let data;
      try { data = await response.json(); }
      catch { throw new Error('AI endpoint unavailable on this host. Local word matching remains below.'); }
      if (!response.ok) throw new Error(data.error || 'AI search unavailable.');
      if (data.mode !== 'semantic' || !Array.isArray(data.matches)) throw new Error('Invalid AI response.');
      if (!panel.isConnected) return;
      const known = new Map(records.map(record => [record.id, record]));
      for (const match of data.matches) {
        const record = known.get(match.id);
        if (!record || !Number.isFinite(match.score)) throw new Error('Invalid match returned.');
        const wrapper = document.createElement('div'); wrapper.innerHTML = renderCard(record);
        const why = document.createElement('p');
        why.textContent = `Why this matches: meaning similarity to your saved note and project. Saved note: “${record.whySaved}” Project: “${record.project || 'Unassigned'}”. No article text was read.`;
        wrapper.querySelector('article').append(why); results.append(wrapper);
      }
      status.textContent = data.matches.length
        ? `Meaning-based ranking: ${data.matches.length} candidate(s). Check the saved context yourself; similarity is not proof. The pilot threshold is not yet calibrated.`
        : 'No candidates passed the pilot similarity threshold. This does not prove no relevant source exists.';
    } catch (error) {
      if (panel.isConnected) { results.replaceChildren(); status.textContent = error.name === 'AbortError'
        ? 'AI search stopped or timed out. Local word matching remains below.' : error.message; }
    } finally {
      clearTimeout(timeout); window.removeEventListener('hashchange', cancel);
      if (panel.isConnected) button.disabled = false;
    }
  });
};
