/* Explicit, local-only organization and writing tools. Original notes stay separate. */
(function () {
  'use strict';
  const C=window.HiveMindCore,S=window.HiveMindSecondMind,esc=C.escapeHTML;
  const href=id=>`#details/${encodeURIComponent(id)}`;
  const heading=(title,text)=>`<div class="page-head"><div><p class="eyebrow">SECOND MIND</p><h1>${esc(title)}</h1><p>${esc(text)}</p></div><a class="button" href="#save">+ Save Source</a></div>`;
  const steps=()=>`<div class="code-steps" aria-label="Capture Organize Distill Express"><a href="#save"><strong>1. Capture</strong><span>Keep a source and its context.</span></a><a href="#mind/inbox"><strong>2. Organize</strong><span>File it for your next use.</span></a><a href="#mind/distill"><strong>3. Distill</strong><span>Write what matters in your words.</span></a><a href="#mind/express"><strong>4. Express</strong><span>Bring your notes into a brief.</span></a></div>`;
  function download(text,name,type) {
    const url=URL.createObjectURL(new Blob([text],{type})),link=document.createElement('a');
    link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  window.mountSecondMind = function({root,snapshot,view='',renderCard}) {
    const rows=snapshot.records,totals=S.counts(rows);
    if(view==='express'){
      root.innerHTML=heading('Express','Turn selected sources and your own takeaways into a working brief.')+steps()+
        `<p class="notice">This is a local writing tool, not an AI summary. Excerpts and takeaways are user-authored and not independently verified. Exporting does not send anything to OpenAI.</p><form id="brief-form"><div class="card"><div class="field"><label for="brief-title">Brief title</label><input id="brief-title" maxlength="240" value="Research brief"></div><div class="field"><label for="brief-synthesis">Your synthesis <span class="muted">(optional)</span></label><textarea id="brief-synthesis" maxlength="6000" placeholder="What do these sources help you explain?"></textarea><p class="help">Your draft stays in this page until you export it. It is not saved automatically.</p></div><fieldset><legend>Choose sources (1–50, including archived sources)</legend>${rows.map(r=>`<label class="source-choice"><input type="checkbox" name="brief-source" value="${esc(r.id)}"><span>${esc(r.title)}<small>${esc(S.label(r))}</small></span></label>`).join('')||'<p>Your library is empty. Save a source first.</p>'}</fieldset><div class="actions"><button type="submit">Build brief</button></div><p id="brief-status" role="status"></p></div></form><section id="brief-output" class="card" hidden><h2>Your source-linked brief</h2><p class="help">Review before using. Download saves the exact text below; changes to the source selection clear this preview.</p><label for="brief-text">Brief text (Markdown)</label><textarea id="brief-text" rows="16" readonly></textarea><button id="brief-download" type="button">Download brief (.md)</button></section>`;
      const form=root.querySelector('#brief-form'),output=root.querySelector('#brief-output'),text=root.querySelector('#brief-text'),status=root.querySelector('#brief-status');
      let current='';
      form.addEventListener('input',()=>{current='';output.hidden=true;status.textContent='Draft changed. Build the brief to refresh it.';});
      form.addEventListener('submit',event=>{event.preventDefault();try{
        const selected=new Set([...form.querySelectorAll('[name="brief-source"]:checked')].map(el=>el.value));
        current=S.brief(rows.filter(r=>selected.has(r.id)),root.querySelector('#brief-title').value,root.querySelector('#brief-synthesis').value);
        text.value=current;output.hidden=false;status.textContent=`Brief prepared from ${selected.size} selected sources. Download to keep a copy.`;
      }catch(e){current='';output.hidden=true;status.textContent=e.message;}});
      root.querySelector('#brief-download').addEventListener('click',()=>{if(current)download(current,'hivemind-research-brief.md','text/markdown;charset=utf-8');});
      return ()=>{};
    }
    const meta=S.categories[view],title=meta?.name||({inbox:'Inbox',archives:'Archives',distill:'Distill'}[view]||'Second Mind');
    const description=meta?.description||({inbox:'Unfiled sources. Choose a useful home when you are ready.',archives:'Inactive material, preserved for later. Restore it without losing its context.',distill:'Active sources without a personal takeaway. Open one to capture the essence.'}[view]||'Organize for action. Keep the thinking that makes your sources useful.');
    root.innerHTML=heading(title,description)+steps()+(!view?`<div class="para-grid">${['inbox','projects','areas','resources','archives'].map(k=>`<a class="card para-stat" href="#mind/${k}"><strong>${k==='inbox'?'Inbox':k==='archives'?'Archives':S.categories[k].name}</strong><span>${totals[k]}</span></a>`).join('')}</div><p class="help">PARA-inspired organization. Existing bookmarks are not classified or rewritten automatically. Each source has one primary collection; its original project label remains separate for current AI retrieval.</p>`:'')+
      `<div class="toolbar"><p class="stats" id="mind-count"></p>${meta?'<div class="field"><label for="mind-collection">Collection</label><select id="mind-collection"><option value="">All collections</option></select></div>':''}<button id="library-export" class="secondary" type="button">Export library backup</button></div><div id="mind-results"></div><p class="help">Adapted from Tiago Forte’s PARA and CODE methods. Takeaways are your own thinking, not generated article summaries.</p>`;
    const filter=root.querySelector('#mind-collection');
    const matches=r=>!view?true:view==='distill'?S.bucket(r)!=='archives'&&!S.read(r).value.takeaway.trim():S.bucket(r)===view;
    if(filter)for(const name of [...new Set(rows.filter(matches).map(r=>S.read(r).value.collection))].sort()){const opt=document.createElement('option');opt.value=name;opt.textContent=name;filter.append(opt);}
    function draw(){const chosen=rows.filter(r=>matches(r)&&(!filter?.value||S.read(r).value.collection===filter.value));root.querySelector('#mind-count').textContent=`${chosen.length} saved sources · On this device`;const output=root.querySelector('#mind-results');output.className='source-list';output.innerHTML=chosen.length?chosen.slice().reverse().map(r=>renderCard(r)).join(''):'<div class="empty"><h2>No sources in this view</h2><p>Open a source to organize it, add a takeaway, or restore it from Archives.</p><a href="#library">Go to My Library</a></div>';}
    filter?.addEventListener('change',draw);draw();
    root.querySelector('#library-export').addEventListener('click',()=>download(JSON.stringify(rows,null,2),'hivemind-library-backup.json','application/json'));
    return ()=>{};
  };
  window.mountSecondMindEditor = function({root,snapshot,record,onSaved}) {
    const {value,error}=S.read(record);
    if(error){root.innerHTML=`<div class="card"><h2>Second Mind</h2><p class="notice error" role="alert">${esc(error)} Original source data remains available. Export a backup and review this record before changing its organization.</p></div>`;return ()=>{};}
    const field=(key,label,help,max,textarea=false)=>`<div class="field"><label for="mind-${key}">${label}</label>${textarea?`<textarea id="mind-${key}" name="${key}" maxlength="${max}">${esc(value[key])}</textarea>`:`<input id="mind-${key}" name="${key}" maxlength="${max}" value="${esc(value[key])}">`}<p class="help">${help}</p></div>`;
    root.innerHTML=`<section class="card"><p class="eyebrow">CAPTURE → ORGANIZE → DISTILL → EXPRESS</p><h2>Make this source useful</h2><p>Your original why-saved note stays unchanged. These optional fields are saved only in this browser and are not sent to the current meaning-based search.</p>${value.archived?'<p class="notice">This source is archived. Its category and context are preserved.</p>':''}<form id="mind-form" novalidate>
      <fieldset><legend>Organize</legend><div class="field"><label for="mind-category">Primary home</label><select id="mind-category" name="category"><option value="inbox">Inbox — decide later</option>${Object.entries(S.categories).map(([k,v])=>`<option value="${k}">${v.name} — ${v.description}</option>`).join('')}</select></div>
      ${field('collection','Project, area or resource topic','One primary collection for this source. Use the same exact name to connect sources in the graph.',200)}
      ${field('purpose','Purpose or intended outcome','For a project, name the finish line. For an area, name the ongoing responsibility. For a resource, note its possible future use.',500)}
      </fieldset><fieldset><legend>Distill</legend>${field('excerpt','Permitted source excerpt (optional)','Paste only material you may store. This is user-supplied text; HiveMind does not fetch or verify the article.',3000,true)}
      ${field('locator','Excerpt location','Required with an excerpt: page, section, timestamp or other location in the original source.',300)}
      ${field('takeaway','Your takeaway (optional)','In your own words, what matters? This is not an AI-generated summary.',2000,true)}
      </fieldset><fieldset><legend>Express</legend>${field('nextAction','How will you use this? (optional)','For example: compare these coding approaches in my methodology draft.',500)}
      <a href="#mind/express">Build a source-linked brief</a></fieldset><div id="mind-error" role="alert"></div><div class="actions"><button type="submit">Save Second Mind notes</button><button class="secondary" type="reset">Discard unsaved changes</button><button class="secondary" id="mind-archive" type="button">${value.archived?'Restore source':'Archive source'}</button></div><p class="help">Archive / Restore applies to saved information only. Save or discard edits first.</p></form></section>`;
    const form=root.querySelector('#mind-form'),category=form.elements.namedItem('category');category.value=value.category;
    let dirty=false;const archiveButton=root.querySelector('#mind-archive');
    function markDirty(){dirty=true;archiveButton.disabled=true;}
    form.addEventListener('input',markDirty);form.addEventListener('change',markDirty);
    form.addEventListener('reset',()=>{setTimeout(()=>{category.value=value.category;dirty=false;archiveButton.disabled=false;root.querySelector('#mind-error').textContent='';},0);});
    function save(next){try{const updated=snapshot.records.map(r=>r.id===record.id?next:r);C.writeLibrary(localStorage,updated,snapshot.raw);onSaved();}catch(e){root.querySelector('#mind-error').innerHTML=`<p class="notice error">${esc(e.message||'Could not save. Your existing data is unchanged.')}</p>`;}}
    form.addEventListener('submit',event=>{event.preventDefault();try{const values={category:category.value};for(const key of Object.keys(S.limits))values[key]=form.elements.namedItem(key).value;save(S.update(record,values));}catch(e){root.querySelector('#mind-error').innerHTML=`<p class="notice error">${esc(e.message)}</p>`;}});
    archiveButton.addEventListener('click',()=>{if(dirty)return;try{save(S.archive(record,!value.archived));}catch(e){root.querySelector('#mind-error').textContent=e.message;}});
    return ()=>{};
  };
})();
