/* A local PARA + CODE adaptation. No inference, migration or provider calls. */
(function (root) {
  'use strict';
  const C = root.HiveMindCore;
  const categories = Object.freeze({
    projects: {name:'Projects', description:'Active efforts with a finish line.', hint:'Which outcome will this help you deliver?'},
    areas: {name:'Areas', description:'Ongoing responsibilities you want to maintain.', hint:'Which responsibility or standard does this support?'},
    resources: {name:'Resources', description:'Topics you may return to in the future.', hint:'Which topic makes this useful to keep?'}
  });
  const empty = () => ({version:1,category:'inbox',collection:'',purpose:'',excerpt:'',locator:'',takeaway:'',nextAction:'',archived:false});
  const limits = Object.freeze({collection:200,purpose:500,excerpt:3000,locator:300,takeaway:2000,nextAction:500});
  function issue(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) return 'Unsupported Second Mind metadata; nothing has been changed.';
    if (!['inbox',...Object.keys(categories)].includes(value.category) || typeof value.archived !== 'boolean') return 'Invalid organization settings.';
    for (const [field,max] of Object.entries(limits)) if (typeof value[field] !== 'string' || value[field].length > max) return `${field} must contain at most ${max.toLocaleString()} characters.`;
    if (value.category !== 'inbox' && !value.collection.trim()) return 'Name the project, area or resource topic, or leave this source in Inbox.';
    if (value.category === 'inbox' && value.collection !== '') return 'Choose a category for the collection, or clear the collection name.';
    if (value.excerpt.trim() && !value.locator.trim()) return 'Add a page, section or other locator for your excerpt.';
    return '';
  }
  function read(record) {
    if (!Object.hasOwn(record,'secondMind')) return {value:empty(),error:'',legacy:true};
    const error = issue(record.secondMind);
    return {value:error ? empty() : record.secondMind,error,legacy:false};
  }
  function update(record,values,now=new Date().toISOString()) {
    const current=read(record); if (current.error) throw new Error(current.error);
    const next={...current.value,...values,version:1};
    const error=issue(next); if (error) throw new Error(error);
    return {...record,secondMind:{...next,updatedAt:now}};
  }
  function archive(record,archived,now=new Date().toISOString()) {
    const current=read(record);if(current.error)throw new Error(current.error);
    return update(record,{archived,archivedAt:archived?now:null},now);
  }
  function bucket(record) { const state=read(record); return state.error?'inbox':state.value.archived?'archives':state.value.category; }
  function label(record) {
    const {value,error}=read(record);
    if(error)return 'Organization needs review';
    const placement=value.category==='inbox'?'Inbox':`${categories[value.category].name} · ${value.collection}`;
    return value.archived?`Archived · ${placement}`:placement;
  }
  function group(record) {
    const {value,error}=read(record);
    if(error||value.category==='inbox')return null;
    return {key:JSON.stringify([value.category,value.collection]),label:`${categories[value.category].name} · ${value.collection}`,kind:value.category,
      evidence:{recordId:record.id,field:'secondMind.collection',value:value.collection,category:value.category,archived:value.archived}};
  }
  function counts(records) {
    const result={inbox:0,projects:0,areas:0,resources:0,archives:0};
    for(const record of records)result[bucket(record)]++;
    return result;
  }
  function buildGraph(records) {
    const nodes=[],edges=[],groups=new Set();
    for(const record of records){
      nodes.push({id:`source:${record.id}`,kind:'source',label:record.title,recordId:record.id});
      const g=group(record);if(!g)continue;
      const id=`collection:${g.key}`;
      if(!groups.has(id)){groups.add(id);nodes.push({id,kind:g.kind,label:g.label,groupKey:g.key});}
      edges.push({from:`source:${record.id}`,to:id,kind:'saved_para_membership',evidence:g.evidence});
    }
    return {nodes,edges};
  }
  function wordFields(record) {
    const {value,error}=read(record);if(error)return [];
    return [['collection',value.collection],['purpose',value.purpose],['your takeaway',value.takeaway],['your excerpt',value.excerpt],['next action',value.nextAction]];
  }
  const mdText = value => String(value??'').replace(/([\\`*_{}\[\]<>#])/g,'\\$1');
  function brief(records,title='Research brief',synthesis='') {
    if(!records.length)throw new Error('Select at least one source.');
    if(records.length>50)throw new Error('Select at most 50 sources for one brief. No sources were removed.');
    if(typeof title!=='string'||title.length>240||typeof synthesis!=='string'||synthesis.length>6000)throw new Error('The title or synthesis is too long.');
    const lines=[`# ${mdText(title.trim()||'Research brief')}`,'','Your working notes and source references. No AI synthesis or verification of source content.','', '## Your synthesis',synthesis||'(Add your own synthesis.)',''];
    for(const r of records){
      const {value,error}=read(r);if(error)throw new Error(`${r.title}: ${error}`);
      lines.push(`## ${mdText(r.title)}`,`Source URL: ${C.safeURL(r.url)}`,`Saved: ${mdText(r.createdAt||'Date unavailable')}`,`Organization: ${mdText(label(r))}`,'','### Original why-saved note',r.whySaved,'');
      if(value.purpose)lines.push('### Purpose',value.purpose,'');
      if(value.excerpt)lines.push('### User-supplied excerpt (not independently verified)',`Locator: ${mdText(value.locator)}`,value.excerpt,'');
      if(value.takeaway)lines.push('### Your takeaway',value.takeaway,'');
      if(value.nextAction)lines.push('### Next use',value.nextAction,'');
    }
    return lines.join('\n');
  }
  root.HiveMindSecondMind=Object.freeze({categories,limits,empty,issue,read,update,archive,bucket,label,group,counts,buildGraph,wordFields,brief});
})(globalThis);
