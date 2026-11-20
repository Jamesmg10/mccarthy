/* Graph relationships come only from saved project or PARA collection fields.
   No inference, provider calls or browsing telemetry. */
window.mountKnowledgeGraph = function ({records,root}) {
  const C = window.HiveMindCore, esc = C.escapeHTML, PAGE_SIZE = 24;
  const S = window.HiveMindSecondMind;
  let grouping = 'project', includeArchived = false;
  let filter = '', page = 0, view = window.innerWidth < 700 ? 'list' : 'graph', selectedId = null, zoom = 1;
  function groupFor(r) {
    if (grouping === 'para') { const g=S.group(r); return g ? {...g,id:'collection:'+g.key} : null; }
    return (r.project || '').trim() ? {key:r.project,id:'project:'+r.project,label:r.project,kind:'project'} : null;
  }
  function options() { const groups=new Map(); for(const r of records){const g=groupFor(r);if(g)groups.set(g.key,g.label);}return [...groups].sort((a,b)=>a[1].localeCompare(b[1])); }

  const byId = new Map(records.map(r => [r.id,r]));
  function selectedRecords() { return records.filter(r => (includeArchived || S.bucket(r) !== 'archives') && (!filter || (filter === 'u:' ? !groupFor(r) : groupFor(r)?.key === filter.slice(2)))); }
  function short(value,max=24) { return value.length > max ? value.slice(0,max - 1) + '…' : value; }
  function diagram(model,visible) {
    const groups = new Map();
    for (const r of visible) { const id=groupFor(r)?.id || '';if(!groups.has(id))groups.set(id,[]);groups.get(id).push(r); }
    const n = groups.size, height = n <= 4 ? 600 : Math.ceil(n / 3) * 270;
    const presets = {1:[[450,280]],2:[[245,300],[655,300]],3:[[240,175],[660,175],[450,455]],4:[[240,170],[660,170],[240,455],[660,455]]};
    const locations = new Map(); let index = 0;
    for (const [name,items] of groups) {
      const [x,y] = n <= 4 ? presets[n][index] : [150 + (index % 3) * 300,135 + Math.floor(index / 3) * 270];
      if (name) locations.set(name,{x,y});
      const radius = n === 1 ? 190 : n <= 4 ? 105 : 85;
      items.forEach((r,i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i / items.length);
        // For dense single-project pages use two concentric rings, no edges between sources.
        const ring = items.length > 12 && i % 2 ? radius * .6 : radius;
        locations.set(`source:${r.id}`,{x:x + Math.cos(angle) * ring,y:y + Math.sin(angle) * ring});
      }); index++;
    }
    const lines = model.edges.map(edge => {
      const a=locations.get(edge.from),b=locations.get(edge.to);
      return `<line class="graph-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"><title>${esc(edge.evidence.value)}: saved ${grouping === 'para' ? 'PARA collection' : 'project'} membership</title></line>`;
    }).join('');
    const nodes = model.nodes.map((node,i) => {
      const pos = locations.get(node.id), project = node.kind !== 'source';
      return `<g class="graph-node ${node.kind}${selectedId === node.id ? ' selected' : ''}" data-node="${i}" role="button" tabindex="0" aria-label="${esc(node.kind + ': ' + node.label + '. Show details')}" aria-controls="graph-detail" transform="translate(${pos.x} ${pos.y})">
        <title>${esc(node.label)}</title>${project ? '<circle class="node-shape" r="29"/>' : '<rect class="node-shape" x="-16" y="-18" width="32" height="36" rx="3"/>'}
        <text class="glyph" y="6" aria-hidden="true">${project ? '◇' : '▤'}</text><text class="label" y="${project ? 47 : 35}" aria-hidden="true">${esc(short(node.label))}</text></g>`;
    }).join('');
    return `<svg id="graph-svg" viewBox="0 0 900 ${height}" role="group" aria-labelledby="graph-title graph-description"><title id="graph-title">Saved-source organization graph</title><desc id="graph-description">Circles are saved groups and rectangles are sources. Lines represent explicit saved membership only. Tab to nodes and press Enter to inspect. The Connections list offers the same sources without a diagram.</desc><g>${lines}${nodes}</g></svg>`;
  }
  function detail(model) {
    const node = model.nodes.find(n => n.id === selectedId);
    if (!node) return '<p class="eyebrow">CONNECTION DETAILS</p><h2>Your research, connected</h2><p>Select a project or source to see its saved context.</p><p class="help">Every line here comes from a project label or PARA collection you saved. There are no AI-inferred topics or relationships in this first version.</p>';
    if (node.kind !== 'source') {
      const members = records.filter(r => (includeArchived || S.bucket(r) !== 'archives') && groupFor(r)?.id === node.id);
      return `<p class="eyebrow">${grouping === 'para' ? 'SAVED PARA COLLECTION' : 'SAVED PROJECT LABEL'}</p><h2>${esc(node.label)}</h2><p class="meta">${members.length} source${members.length === 1 ? '' : 's'} in your library</p><div class="notice"><strong>Connection basis</strong><p>${grouping === 'para' ? 'Each linked source has this exact saved category and collection.' : 'Each linked source has this exact project label.'} Shared membership is not a claim that the articles agree.</p></div><h3>Saved sources</h3><ul>${members.map(r => `<li><a href="#details/${encodeURIComponent(r.id)}">${esc(r.title)}</a></li>`).join('')}</ul>`;
    }
    const r = byId.get(node.recordId), project = groupFor(r)?.label || '';
    return `<p class="eyebrow">SAVED SOURCE</p><h2>${esc(r.title)}</h2><p class="source-domain">${esc(new URL(r.url).hostname)}</p><h3>Your original note</h3><p class="quote">${esc(r.whySaved)}</p><h3>Connection basis</h3><p class="help">${project.trim() ? `Your saved ${grouping === 'para' ? 'PARA category and collection' : 'project field'} is “${esc(project)}”. No semantic relationship has been inferred.` : 'This source has no saved membership for the selected grouping. It is shown without a connection.'}</p><div class="actions"><a class="button" href="#details/${encodeURIComponent(r.id)}">View source details</a><a class="button secondary" href="${esc(C.safeURL(r.url))}" target="_blank" rel="noopener noreferrer">Open Original ↗</a></div>`;
  }
  let model = {nodes:[],edges:[]};
  function draw() {
    const matching = selectedRecords(), totalPages = Math.max(1,Math.ceil(matching.length / PAGE_SIZE));
    page = Math.min(page,totalPages - 1);
    const visible = matching.slice(page * PAGE_SIZE,(page + 1) * PAGE_SIZE); model = grouping === 'para' ? S.buildGraph(visible) : C.buildGraph(visible);
    if (!model.nodes.some(n => n.id === selectedId)) selectedId = null;
    root.innerHTML = `<div class="section-bar"><div class="segmented" role="group" aria-label="Graph presentation"><button type="button" data-view="graph" aria-pressed="${view === 'graph'}">Graph View</button><button type="button" data-view="list" aria-pressed="${view === 'list'}">Connections list</button></div><span class="meta">Saved-field relationships · Local preview</span></div>
      <div class="toolbar"><p class="stats">${matching.length ? `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + visible.length} of ${matching.length}` : '0'} sources · ${model.edges.length} saved links on this page</p><div class="field"><label for="graph-grouping">Group connections by</label><select id="graph-grouping"><option value="project">Saved project labels</option><option value="para">Second Mind collections</option></select></div><label class="consent"><input id="graph-archives" type="checkbox">Include archived sources</label><div class="field"><label for="graph-project">Filter by saved group</label><select id="graph-project"><option value="">All groups</option><option value="u:">No group assigned</option>${options().map(([key,label]) => `<option value="${esc('p:' + key)}">${esc(label)}</option>`).join('')}</select></div></div>` +
      (!visible.length ? `<div class="empty"><h2>${records.length ? 'No sources in this selection' : 'A graph starts with your sources'}</h2><p>Save research links with project labels to see their connections. Nothing is generated or seeded for you.</p><a class="button" href="#save">Save Source</a></div>` :
      `<div class="graph-layout"><div class="graph-main"><div class="graph-canvas" ${view === 'list' ? 'hidden' : ''}>${diagram(model,visible)}</div><div class="connection-list" ${view === 'graph' ? 'hidden' : ''}>
      ${visible.map(r => `<div class="connection-row"><button type="button" data-node="${model.nodes.findIndex(n => n.id === 'source:' + r.id)}" aria-controls="graph-detail">${esc(r.title)}</button><p>${groupFor(r) ? `Saved in ${grouping === 'para' ? 'collection' : 'project'}: ${esc(groupFor(r).label)}` : 'No group assigned · no connection'}</p><a href="#details/${encodeURIComponent(r.id)}">Source Details</a></div>`).join('')}</div>
      <div class="graph-tools"><div class="legend"><span class="project-key">Saved group</span><span class="source-key">Source</span><span>— Saved membership</span></div>${view === 'graph' ? '<div class="actions"><button type="button" class="secondary" data-zoom="in" aria-label="Zoom in">+</button><button type="button" class="secondary" data-zoom="out" aria-label="Zoom out">−</button><button type="button" class="secondary" data-zoom="reset">Reset view</button></div>' : ''}</div></div>
      <aside class="graph-detail" id="graph-detail" tabindex="-1">${detail(model)}</aside></div>
      <div class="toolbar"><p class="help">${view === 'graph' ? 'Select a node to inspect evidence. Use the list for full source names and keyboard browsing.' : 'The list and graph show the same saved records and explicit memberships.'}</p><div class="pagination"><button type="button" class="secondary" data-page="prev" ${page === 0 ? 'disabled' : ''}>Previous</button><span>Page ${page + 1} of ${totalPages}</span><button type="button" class="secondary" data-page="next" ${page >= totalPages - 1 ? 'disabled' : ''}>Next</button></div></div>`);
    root.querySelector('#graph-project').value = filter;
    root.querySelector('#graph-grouping').value=grouping;
    root.querySelector('#graph-archives').checked=includeArchived;
    zoom = 1;
  }
  function select(index) {
    const node = model.nodes[index]; if (!node) return;
    selectedId = node.id;
    const pane = root.querySelector('#graph-detail'); pane.innerHTML = detail(model);
    root.querySelectorAll('.graph-node').forEach(el => el.classList.toggle('selected',model.nodes[Number(el.dataset.node)]?.id === selectedId));
    // Focus the evidence rather than requiring a keyboard user to traverse the whole SVG.
    pane.focus({preventScroll:true});
  }
  function onClick(event) {
    const target = event.target.closest('[data-node],[data-view],[data-page],[data-zoom]'); if (!target || !root.contains(target)) return;
    if (target.dataset.node !== undefined) { select(Number(target.dataset.node)); return; }
    if (target.dataset.view) { view = target.dataset.view; draw(); root.querySelector(`[data-view="${view}"]`).focus(); return; }
    if (target.dataset.page) { page += target.dataset.page === 'next' ? 1 : -1; selectedId = null; draw(); root.querySelector('[data-view]').focus(); return; }
    const svg = root.querySelector('#graph-svg'); if (!svg) return;
    const original = svg.viewBox.baseVal; const centerX=original.x + original.width / 2, centerY=original.y + original.height / 2;
    if (target.dataset.zoom === 'reset') { draw(); root.querySelector('[data-zoom="reset"]').focus(); return; }
    const nextZoom = Math.max(.75,Math.min(1.75,zoom + (target.dataset.zoom === 'in' ? .25 : -.25)));
    const factor = zoom / nextZoom, width=original.width * factor, h=original.height * factor;
    svg.setAttribute('viewBox',`${centerX - width / 2} ${centerY - h / 2} ${width} ${h}`); zoom = nextZoom;
  }
  const onKey = event => { const node = event.target.closest('[data-node]'); if (node?.tagName.toLowerCase() === 'g' && ['Enter',' '].includes(event.key)) { event.preventDefault(); select(Number(node.dataset.node)); } };
  const onChange = event => { if(event.target.id==='graph-grouping'){grouping=event.target.value;filter='';page=0;selectedId=null;draw();root.querySelector('#graph-grouping').focus();return;} if(event.target.id==='graph-archives'){includeArchived=event.target.checked;page=0;selectedId=null;draw();root.querySelector('#graph-archives').focus();return;} if (event.target.id === 'graph-project') { filter=event.target.value; page=0;selectedId=null;draw();root.querySelector('#graph-project').focus(); } };
  root.addEventListener('click',onClick); root.addEventListener('keydown',onKey); root.addEventListener('change',onChange); draw();
  return () => { root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKey);root.removeEventListener('change',onChange); };
};
