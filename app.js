/* Local research workspace. Existing storage key and API contract preserved. */
(() => {
  'use strict';
  const C = window.HiveMindCore, esc = C.escapeHTML, app = document.getElementById('app');
  let cleanup = null, savedNotice = '';
  const href = id => `#details/${encodeURIComponent(id)}`;
  const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? 'Date unavailable' : d.toLocaleDateString(); };
  const domain = url => { try { return new URL(url).hostname; } catch { return 'Source'; } };
  const openLink = (r,cls='secondary') => `<a class="button ${cls}" href="${esc(C.safeURL(r.url))}" target="_blank" rel="noopener noreferrer">Open Original ↗</a>`;
  function card(r,evidence='') {
    return `<article class="card"><div class="eyebrow">${esc(r.project || 'Unassigned project')}</div><h2><a href="${href(r.id)}">${esc(r.title)}</a></h2>
      <p class="source-domain">${esc(domain(r.url))} · Saved ${esc(date(r.createdAt))}</p><p class="memory-badge">${esc(window.HiveMindSecondMind.label(r))}</p><p class="original-note">${esc(r.whySaved)}</p>
      ${evidence ? `<div class="evidence"><strong>Why this matches</strong><p>${esc(evidence)}</p></div>` : ''}
      <div class="actions"><a class="button secondary" href="${href(r.id)}">View details</a>${openLink(r)}</div></article>`;
  }
  function head(title,description,action=true) {
    return `<div class="page-head"><div><p class="eyebrow">YOUR RESEARCH WORKSPACE</p><h1>${title}</h1><p>${description}</p></div>${action ? '<a class="button" href="#save">+ Save Source</a>' : ''}</div>`;
  }
  function library(records) {
    app.innerHTML = head('My Library','Keep the source. Remember why it mattered.') +
      `<div class="toolbar"><p class="stats">${records.length} saved source${records.length === 1 ? '' : 's'} · On this device</p><div class="field"><label for="library-project">Filter by project</label><select id="library-project"><option value="">All projects</option>${[...new Set(records.map(r => r.project || '').filter(Boolean))].sort().map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></div></div><div id="library-results"></div>`;
    const output = app.querySelector('#library-results'), filter = app.querySelector('#library-project');
    function draw() {
      const rows = records.filter(r => !filter.value || r.project === filter.value).slice().reverse();
      output.className = rows.length ? 'source-list' : '';
      output.innerHTML = rows.length ? rows.map(r => card(r)).join('') : `<div class="empty"><h2>${records.length ? 'No sources in this project' : 'Your library starts here'}</h2><p>Save a research link and why it mattered. Your project labels will also connect sources in the graph.</p><a class="button" href="#save">Save your first source</a></div>`;
    }
    filter.addEventListener('change',draw); draw();
  }
  function editor(snapshot,id) {
    const original = id ? snapshot.records.find(r => r.id === id) : null;
    if (id && !original) { missing(); return; }
    const r = original || {url:'',title:'',whySaved:'',project:''};
    app.innerHTML = `<p class="breadcrumb"><a href="${original ? href(id) : '#library'}">← ${original ? 'Source Details' : 'My Library'}</a></p>` +
      head(original ? 'Edit Source' : 'Save Source','Capture the context you will want to remember.',false) +
      `<form id="saveForm" class="card editor" novalidate><div class="field"><label for="url">Source URL</label><input type="url" id="url" name="url" required value="${esc(r.url)}" placeholder="https://…"></div>
      <div class="field"><label for="title">Display title <span class="muted">(optional)</span></label><input id="title" name="title" maxlength="240" value="${esc(r.title)}" aria-describedby="title-help"><p class="help" id="title-help">Use your own title. Leaving this blank uses the website domain; HiveMind does not fetch the article title.</p></div>
      <div class="field"><label for="note">Why did you save this?</label><textarea id="note" name="note" maxlength="2000" required aria-describedby="note-help">${esc(r.whySaved)}</textarea><p class="help" id="note-help">1–2,000 characters. Your note is preserved exactly as entered.</p></div>
      <div class="field"><label for="project">Research project/topic <span class="muted">(optional)</span></label><input id="project" name="project" maxlength="200" value="${esc(r.project || '')}" placeholder="Research Methods"><p class="help">Up to 200 characters. The graph connects sources with this exact project label.</p></div>
      <div id="formError" role="alert"></div><div class="actions"><button type="submit">${original ? 'Save changes' : 'Save Source'}</button><a class="button secondary" href="${original ? href(id) : '#library'}">Cancel</a></div></form>`;
    const form = app.querySelector('#saveForm');
    form.addEventListener('submit',event => {
      event.preventDefault();
      const value = name => form.elements.namedItem(name).value;
      const url = C.safeURL(value('url').trim());
      const candidate = {whySaved:value('note'),project:value('project')};
      let error = !url ? 'Enter a valid HTTP or HTTPS URL.' : C.recordIssue(candidate);
      if (!error && value('title').length > 240) error = 'The display title exceeds 240 characters.';
      if (error) { app.querySelector('#formError').innerHTML = `<p class="notice error">${esc(error)}</p>`; return; }
      const record = {...(original || {}),id:original?.id || crypto.randomUUID(),url:original && value('url') === original.url ? original.url : url,
        title:value('title').trim() || domain(url),whySaved:candidate.whySaved,project:candidate.project,
        createdAt:original?.createdAt || new Date().toISOString()};
      try {
        const next = original ? snapshot.records.map(old => old.id === id ? record : old) : [...snapshot.records,record];
        C.writeLibrary(localStorage,next,snapshot.raw);
        savedNotice = original ? 'Changes saved. Your original source and note are available below.' : 'Source saved in this browser.';
        location.hash = href(record.id);
      } catch (e) { app.querySelector('#formError').innerHTML = `<p class="notice error">${esc(e.message || 'Unable to save. Storage may be disabled or full.')}</p>`; }
    });
  }
  function details(records,id,snapshot) {
    const r = records.find(item => item.id === id); if (!r) { missing(); return; }
    app.innerHTML = (savedNotice ? `<p class="notice" role="status">${esc(savedNotice)}</p>` : '') + '<p class="breadcrumb"><a href="#library">← My Library</a></p>' + head('Source Details','Your source and the context you saved with it.',false) +
      `<article class="card"><div class="eyebrow">SAVED SOURCE</div><h2>${esc(r.title)}</h2><p class="source-domain">${esc(domain(r.url))}</p><div class="detail-grid"><section><h3>Your original note</h3><p class="quote">${esc(r.whySaved)}</p>
      <div class="notice"><strong>AI summary unavailable</strong><p>No article has been fetched or AI summary generated. Any excerpt or takeaway below is supplied by you and has not been verified by HiveMind.</p></div></section>
      <aside class="detail-meta"><p><strong>Project</strong><br>${esc(r.project || 'Unassigned')}</p><p><strong>Saved</strong><br>${esc(date(r.createdAt))}</p><p><a href="${esc(C.safeURL(r.url))}" target="_blank" rel="noopener noreferrer">${esc(r.url)}</a></p></aside></div>
      ${C.recordIssue(r) ? `<p class="notice error">Not eligible for meaning-based search: ${esc(C.recordIssue(r))} Edit this source to correct it.</p>` : ''}
      <div class="actions">${openLink(r,'')}<a class="button secondary" href="#edit/${encodeURIComponent(r.id)}">Edit Source</a><a class="button secondary" href="#graph">Explore graph</a></div></article><div id="second-mind-editor"></div>`;
    cleanup = window.mountSecondMindEditor({root:app.querySelector('#second-mind-editor'),snapshot,record:r,onSaved:()=>{savedNotice='Second Mind notes saved in this browser.';render();}});
  }
  function missing() { app.innerHTML = head('Source not found','This source is not in the library saved in this browser.',false) + '<a class="button secondary" href="#library">Back to Library</a>'; }
  function render() {
    cleanup?.(); cleanup = null;
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1) || 'library'); } catch { missing(); return; }
    if (hash === 'app') { app.focus(); return; }
    const [page,...rest] = hash.split('/'), value = rest.join('/');
    document.querySelectorAll('[data-nav]').forEach(el => {
      if (el.dataset.nav === page || (['save','edit','details'].includes(page) && el.dataset.nav === 'library')) el.setAttribute('aria-current','page');
      else el.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-mind]').forEach(el=>{if(page==='mind'&&el.dataset.mind===value)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    app.classList.toggle('graph-page',page === 'graph');
    try {
      const snapshot = C.readLibrary(localStorage);
      if (page === 'save' || page === 'edit') editor(snapshot,page === 'edit' ? value : null);
      else if (page === 'details') details(snapshot.records,value,snapshot);
      else if (page === 'mind') {
        cleanup = window.mountSecondMind({root:app,snapshot,view:value,renderCard:card});
      } else if (page === 'search') {
        app.innerHTML = head('Search Results','Find saved research by the context you remember.',false) + '<section id="search-workspace"></section>';
        cleanup = window.attachSemanticSearch({query:value,records:snapshot.records,renderCard:card,root:app.querySelector('#search-workspace')});
        document.getElementById('global-query').value = value;
      } else if (page === 'graph') {
        app.innerHTML = head('Knowledge Graph','Explore how your saved sources connect through your research projects.') + '<section id="knowledge-workspace"></section>';
        cleanup = window.mountKnowledgeGraph({records:snapshot.records,root:app.querySelector('#knowledge-workspace')});
      } else library(snapshot.records);
    } catch (error) { app.innerHTML = head('Library unavailable','Your stored data has not been cleared or replaced.',false) + `<p class="notice error" role="alert">${esc(error.message)}</p>`; }
    savedNotice = '';
    app.focus({preventScroll:true});
  }
  document.querySelector('.skip-link').addEventListener('click',event => { event.preventDefault(); app.focus(); });
  document.getElementById('global-search').addEventListener('submit',event => {
    event.preventDefault(); const value = event.currentTarget.elements.namedItem('query').value;
    const input = event.currentTarget.elements.namedItem('query');
    input.setCustomValidity(C.queryIssue(value)); if (!input.reportValidity()) return;
    const next = `#search/${encodeURIComponent(value.trim())}`;
    if (location.hash === next) render(); else location.hash = next;
  });
  document.getElementById('global-query').addEventListener('input',event => event.target.setCustomValidity(''));
  window.addEventListener('hashchange',render);
  // Invalidate stale search snapshots without auto-saving or silently losing a dirty form.
  window.addEventListener('storage',event => {
    if (event.key !== C.KEY) return;
    cleanup?.(); cleanup = null;
    const warning = document.createElement('p'); warning.className = 'notice'; warning.setAttribute('role','alert');
    warning.textContent = 'Your library changed in another tab. Reload before saving or searching. Unsaved form text is still here.'; app.prepend(warning);
  });
  render();
})();
