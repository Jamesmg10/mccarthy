"""Isolated DOM regression; storage and provider mocked. No live API use or deployment.
Requires existing Python Playwright + Chromium. Run from repository root.
"""
from pathlib import Path
import json, re, os
from playwright.sync_api import sync_playwright, expect
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('HIVEMIND_EVIDENCE', str(ROOT/'test-evidence')))
OUT.mkdir(parents=True, exist_ok=True)
KEY = 'mccarthy-prototype-sources-v1'
fixture = [
 {'id':'a','url':'https://example.org/interviews','title':'Interview coding approaches','whySaved':'I saved this because it compares ways to code interviews','project':'Research Methods','createdAt':'2026-11-20T10:00:00Z'},
 {'id':'b','url':'https://example.org/thematic','title':'Thematic analysis notes','whySaved':'An outline of qualitative analysis practices','project':'Research Methods','createdAt':'2026-11-20T10:00:00Z'},
 {'id':'c','url':'https://example.org/design','title':'Designing a research question','whySaved':'Notes for the next study proposal','project':'Research Design','createdAt':'2026-11-20T10:00:00Z'},
 {'id':'d','url':'https://example.org/consent','title':'Participant consent guide','whySaved':'Planning responsible participant recruitment','project':'Research Design','createdAt':'2026-11-20T10:00:00Z'},
 {'id':'e','url':'https://example.org/garden','title':'Seasonal planting calendar','whySaved':'Garden composting tomatoes','project':'Reading Notes','createdAt':'2026-11-20T10:00:00Z'},
 {'id':'f','url':'https://example.org/archive','title':'Reading journal','whySaved':'Remember this reference for later','project':'','createdAt':'2026-11-20T10:00:00Z'}]
results=[]; errors=[]
def record(name): results.append({'test':name,'result':'PASS','scope':'isolated DOM; storage/network mocked'})
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(re.sub(r'<script[^>]*>.*?</script>','',(ROOT/'index.html').read_text(),flags=re.S))
 page.add_style_tag(content=(ROOT/'styles.css').read_text())
 page.evaluate('''([rows,key])=>{
  window.memory=new Map([[key,JSON.stringify(rows)]]); window.sent=[];
  Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.memory.get(k)??null,setItem:(k,v)=>window.memory.set(k,v)},configurable:true});
  if(!crypto.randomUUID) crypto.randomUUID=()=> 'generated-'+Math.random().toString(16).slice(2);
  window.fetch=async (url,opts)=>{window.sent.push({url,body:JSON.parse(opts.body)});return {ok:true,json:async()=>({mode:'semantic',matches:[{id:'a',score:.7}]})}};
 }''',[fixture,KEY])
 for file in ['core.js','second-mind.js','second-mind-ui.js','ai-search.js','knowledge-graph.js','app.js']: page.add_script_tag(content=(ROOT/file).read_text())
 def route(value):
  page.evaluate('(v)=>{location.hash=v}',value);page.wait_for_timeout(70)
 def semantic():
  page.select_option('#search-mode','semantic');page.fill('#reviewer-code','x'*40);page.check('#consent')
 raw=page.evaluate('(k)=>localStorage.getItem(k)',KEY)
 expect(page.get_by_role('heading',name='My Library',exact=True)).to_be_visible();record('library render')
 matrix=[]
 for width in [320,390,768,1280,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for r in ['#library','#save','#details/a','#search/interview','#graph']:
   route(r)
   metrics=page.evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})')
   assert metrics['scroll']<=metrics['width'],(width,r,metrics)
   matrix.append({'width':width,'route':r,**metrics})
 record('25 route/viewport combinations without horizontal overflow')
 assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==raw;record('rendering and graph do not mutate saved data')
 page.set_viewport_size({'width':1440,'height':1000});route('#graph')
 assert page.locator('.graph-node.source').count()==6 and page.locator('.graph-edge').count()==5
 page.locator('.graph-node.project').first.focus();page.keyboard.press('Enter')
 expect(page.locator('#graph-detail')).to_contain_text('exact project label');record('graph node keyboard selection exposes real membership evidence')
 page.screenshot(path=str(OUT/'graph-desktop.png'),full_page=True)
 page.get_by_role('button',name='Connections list',exact=True).click()
 assert page.locator('.connection-row').count()==6;record('graph/list source parity')
 page.select_option('#graph-project','u:');assert page.locator('.connection-row').count()==1
 expect(page.locator('.connection-row')).to_contain_text('no connection');record('unassigned source has no invented edge')
 page.set_viewport_size({'width':390,'height':1000});route('#library');route('#graph')
 expect(page.locator('.connection-list')).to_be_visible();page.screenshot(path=str(OUT/'graph-mobile.png'),full_page=True);record('mobile defaults to keyboard-accessible connection list')
 page.set_viewport_size({'width':1440,'height':1000});route('#library');page.screenshot(path=str(OUT/'library-desktop.png'),full_page=True)
 route('#search/interview');semantic();page.fill('#query','garden composting');page.get_by_role('button',name='Search by meaning').click()
 expect(page.locator('.search-status')).to_contain_text('garden composting')
 assert page.evaluate('window.sent.at(-1).body.query')=='garden composting';record('semantic submission uses currently visible query')
 assert page.locator('.empty').count()==0;assert page.locator('.search-results article').count()==1;record('semantic success has no contradictory word-match empty state')
 page.screenshot(path=str(OUT/'search-desktop.png'),full_page=True)
 page.fill('#global-query','shared query');assert page.input_value('#query')=='shared query'
 page.fill('#query','other direction');assert page.input_value('#global-query')=='other direction';record('header and results queries stay synchronized')
 for code in [401,503,429,502]:
  page.evaluate('(code)=>{window.fetch=async()=>({ok:false,json:async()=>({error:`Mock provider failure ${code}`})})}',code)
  page.get_by_role('button',name='Search by meaning').click()
  expect(page.locator('.search-status')).to_contain_text(f'Mock provider failure {code}')
  expect(page.get_by_role('button',name='Search by meaning')).to_be_enabled()
  assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==raw
 record('mocked 401/503/429/502 errors preserve data and allow retry')
 page.evaluate("()=>{window.fetch=async()=>{const e=new Error('timeout');e.name='AbortError';throw e}}")
 page.get_by_role('button',name='Search by meaning').click();expect(page.locator('.search-status')).to_contain_text('timed out');record('mocked abort/timeout gives honest failure')
 # Deliberately ignore abort in the mock to prove late results are ignored anyway.
 page.evaluate('''()=>{window.fetch=async()=>new Promise(resolve=>{window.resolveLate=()=>resolve({ok:true,json:async()=>({mode:'semantic',matches:[{id:'a',score:.9}]})})})}''')
 page.fill('#query','old query');page.get_by_role('button',name='Search by meaning').click();page.fill('#query','new query')
 page.evaluate('window.resolveLate()');page.wait_for_timeout(100)
 assert page.locator('.search-results article').count()==0;expect(page.locator('.search-status')).to_contain_text('Query changed');record('late response cannot overwrite edited-query results')
 route('#save');page.fill('#url','https://example.org/test');page.fill('#note','   ');page.locator('#saveForm button').click()
 expect(page.locator('#formError')).to_contain_text('not only spaces');assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==raw;record('whitespace-only note rejected without mutation')
 page.fill('#note',' Exact note\nwith spaces  ');page.fill('#title','A useful research source');page.fill('#project','Reading Notes');page.locator('#saveForm button').click();page.wait_for_timeout(100)
 expect(page.locator('#app')).to_contain_text('Source saved in this browser.')
 now=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY);assert now[-1]['whySaved']==' Exact note\nwith spaces  ';assert now[:-1]==fixture;record('save preserves original note bytes and existing records')
 route('#edit/a');page.fill('#title','Human title correction');page.locator('#saveForm button').click();page.wait_for_timeout(100)
 now=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY);assert now[0]['title']=='Human title correction';assert now[0]['whySaved']==fixture[0]['whySaved'];assert now[0]['id']=='a';record('explicit edit preserves identity and unchanged original note')
 # Legacy API-incompatible record remains in the library; preflight offers repair.
 page.evaluate('''(k)=>{const rows=JSON.parse(localStorage.getItem(k));rows.push({id:'legacy',url:'https://example.org/legacy',title:'Legacy note',whySaved:'x'.repeat(2001),project:'Methods'});localStorage.setItem(k,JSON.stringify(rows))}''',KEY)
 route('#search/legacy');semantic();before=page.evaluate('window.sent.length');page.get_by_role('button',name='Search by meaning').click()
 expect(page.locator('.search-status')).to_contain_text('exceeds 2,000');assert page.evaluate('window.sent.length')==before
 expect(page.get_by_role('link',name='Edit Legacy note')).to_be_visible();record('legacy invalid record blocks paid call with explicit repair link')
 # Reject API keys and missing consent before any request.
 route('#library');route('#search/query');semantic();page.fill('#reviewer-code','sk-'+'z'*40);page.get_by_role('button',name='Search by meaning').click()
 expect(page.locator('.search-status')).to_contain_text('Do not enter an OpenAI API key');assert page.evaluate('window.sent.length')==before;record('API-key-shaped input blocked before request')
 page.fill('#reviewer-code','x'*40);page.uncheck('#consent');page.get_by_role('button',name='Search by meaning').click()
 expect(page.locator('.search-status')).to_contain_text('accept the OpenAI disclosure');assert page.evaluate('window.sent.length')==before;record('no consent means no API request')
 # Dense libraries are explicitly paginated, not dropped.
 page.evaluate('''(k)=>{localStorage.setItem(k,JSON.stringify(Array.from({length:30},(_,i)=>({id:String(i),url:'https://example.org/'+i,title:'Source '+i,whySaved:'Note '+i,project:'Project '+(i%3)}))))}''',KEY)
 route('#graph');assert page.locator('.graph-node.source').count()==24;expect(page.locator('.pagination')).to_contain_text('Page 1 of 2')
 page.get_by_role('button',name='Next',exact=True).click();assert page.locator('.graph-node.source').count()==6;record('graph pagination accounts for all 30 sources')
 route('#search/query');semantic();before=page.evaluate('window.sent.length');page.get_by_role('button',name='Search by meaning').click()
 expect(page.locator('.search-status')).to_contain_text('Choose 1–20');assert page.evaluate('window.sent.length')==before;record('over-20 library requires explicit selection before API call')
 page.get_by_role('button',name='Clear selection',exact=True).click();page.locator('input[name=source]').first.check();page.check('#consent')
 page.evaluate('''()=>{window.fetch=async(url,opts)=>{window.sent.push({url,body:JSON.parse(opts.body)});return {ok:true,json:async()=>({mode:'semantic',matches:[]})}}}''')
 page.get_by_role('button',name='Search by meaning').click();expect(page.locator('.search-results')).to_contain_text('No meaning-based candidates')
 assert len(page.evaluate('window.sent.at(-1).body.records'))==1;record('explicit source subset is honored without changing library')
 # XSS stress stays text.
 page.evaluate('''(k)=>{localStorage.setItem(k,JSON.stringify([{id:'hostile',url:'https://example.org',title:'<img src=x onerror=alert(1)>',whySaved:'<script>window.hacked=true</script>',project:'<svg onload=alert(1)>'}]))}''',KEY)
 route('#library');assert page.locator('#app img,#app script').count()==0
 route('#graph');assert page.locator('#app img,#app script').count()==0;record('hostile labels render as text in library and graph')
 # Corrupt storage never masquerades as an empty library.
 page.evaluate('(k)=>localStorage.setItem(k,"{")',KEY);route('#library');expect(page.get_by_role('heading',name='Library unavailable')).to_be_visible();assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)=='{';record('corrupt storage fails without destructive reset')
 assert not errors,errors
 record('no browser JavaScript errors observed')
 (OUT/'dom-results.json').write_text(json.dumps({'scope':'Isolated Chromium DOM. Storage and network mocked. Synthetic example.org fixtures; not live article or hosted tests.','checks':results,'viewports':matrix,'errors':errors},indent=2))
 for r in results:print('PASS',r['test'])
 browser.close()
