"""Local isolated browser checks. Synthetic records; storage/network mocked; no API use."""
from pathlib import Path
import json, re, os
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('HIVEMIND_EVIDENCE', str(ROOT/'test-evidence/second-mind')))
OUT.mkdir(parents=True,exist_ok=True)
KEY='mccarthy-prototype-sources-v1'
fixture=[{'id':'a','url':'https://example.org/methods','title':'Qualitative coding methods','whySaved':'  Original note\nwith exact whitespace  ','project':'Research Methods','createdAt':'2026-11-20T10:00:00Z','custom':{'keep':True}}, {'id':'b','url':'https://example.org/design','title':'Research design guide','whySaved':'Compare research designs','project':'Research Methods','createdAt':'2026-11-20T10:00:00Z'}]
checks=[];errors=[]
def passed(name):checks.append({'name':name,'result':'PASS'})
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},accept_downloads=True)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(re.sub(r'<script[^>]*>.*?</script>','',(ROOT/'index.html').read_text(),flags=re.S))
 page.add_style_tag(content=(ROOT/'styles.css').read_text())
 page.evaluate('''([rows,key])=>{window.memory=new Map([[key,JSON.stringify(rows)]]);window.sent=[];Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.memory.get(k)??null,setItem:(k,v)=>window.memory.set(k,v)},configurable:true});window.fetch=async()=>{window.sent.push('unexpected');throw new Error('No network allowed');};}''',[fixture,KEY])
 for file in ['core.js','second-mind.js','second-mind-ui.js','ai-search.js','knowledge-graph.js','app.js']:page.add_script_tag(content=(ROOT/file).read_text())
 def route(v):page.evaluate('(v)=>{location.hash=v}',v);page.wait_for_timeout(70)
 def rows():return page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
 def save():page.get_by_role('button',name='Save Second Mind notes',exact=True).click();page.wait_for_timeout(90)
 raw=page.evaluate('(k)=>localStorage.getItem(k)',KEY)
 route('#mind');expect(page.get_by_role('heading',name='Second Mind',exact=True)).to_be_visible()
 route('#mind/inbox');assert page.locator('#mind-results article').count()==2
 assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==raw;passed('legacy sources are visible in Inbox with zero storage writes')
 route('#details/a');page.select_option('#mind-category','projects');page.fill('#mind-collection','Thesis methodology');page.fill('#mind-purpose','Complete my methodology chapter')
 page.fill('#mind-excerpt','A permitted excerpt supplied by the researcher.');save();expect(page.locator('#mind-error')).to_contain_text('locator');assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==raw;passed('excerpt without location blocked without changing original data')
 page.fill('#mind-locator','Section: analysis approach');page.fill('#mind-takeaway','  Compare reflexive approaches before choosing a method.  ');page.fill('#mind-nextAction','Use this comparison in the methodology draft');save()
 expect(page.locator('#app')).to_contain_text('Second Mind notes saved')
 after=rows()[0]
 for key,value in fixture[0].items():assert after[key]==value
 assert after['secondMind']['category']=='projects';assert after['secondMind']['takeaway'].startswith('  ');assert rows()[1]==fixture[1];passed('organization and distillation persist without changing original note, URL, context, ID, date or unknown fields')
 route('#mind/projects');assert page.locator('#mind-results article').count()==1
 page.select_option('#mind-collection','Thesis methodology');assert page.locator('#mind-results article').count()==1
 route('#mind/inbox');assert page.locator('#mind-results article').count()==1
 route('#mind/distill');assert page.locator('#mind-results article').count()==1;passed('Projects, Inbox, collection filtering and Distill queue reflect actual saved metadata')
 route('#search/reflexive');expect(page.locator('.search-results')).to_contain_text('your takeaway');assert page.evaluate('window.sent.length')==0;passed('local word search retrieves user takeaway without a provider call')
 route('#graph');page.select_option('#graph-grouping','para');assert page.locator('.graph-node.projects').count()==1;assert page.locator('.graph-edge').count()==1
 page.locator('.graph-node.projects').focus();page.keyboard.press('Enter');expect(page.locator('#graph-detail')).to_contain_text('exact saved category and collection');passed('PARA graph and keyboard inspector show explicit saved membership evidence')
 page.screenshot(path=str(OUT/'para-graph-desktop.png'),full_page=True)
 route('#details/a');page.fill('#mind-takeaway','Unsaved change');expect(page.locator('#mind-archive')).to_be_disabled();page.get_by_role('button',name='Discard unsaved changes').click();page.wait_for_timeout(60);assert page.input_value('#mind-takeaway')==after['secondMind']['takeaway'];expect(page.locator('#mind-archive')).to_be_enabled();passed('archive cannot silently discard a dirty form; reset restores saved notes')
 page.get_by_role('button',name='Archive source',exact=True).click();page.wait_for_timeout(80);assert rows()[0]['secondMind']['archived'];route('#mind/archives');assert page.locator('#mind-results article').count()==1
 route('#graph');page.select_option('#graph-grouping','para');assert page.locator('.graph-edge').count()==0;page.check('#graph-archives');assert page.locator('.graph-edge').count()==1;passed('archived source remains in Archives and is hidden from graph until explicitly included')
 route('#details/a');page.get_by_role('button',name='Restore source',exact=True).click();page.wait_for_timeout(80);assert not rows()[0]['secondMind']['archived'];assert rows()[0]['secondMind']['collection']=='Thesis methodology';assert rows()[0]['secondMind']['takeaway']==after['secondMind']['takeaway'];passed('restore retains PARA collection, takeaway, excerpt and original source')
 route('#mind/express');page.check('[name="brief-source"][value="a"]');page.fill('#brief-synthesis','My draft comparison.');page.get_by_role('button',name='Build brief',exact=True).click()
 text=page.input_value('#brief-text');assert fixture[0]['url'] in text and fixture[0]['whySaved'] in text and 'Your takeaway' in text and 'My draft comparison.' in text;assert fixture[1]['url'] not in text
 with page.expect_download() as info:page.get_by_role('button',name='Download brief (.md)',exact=True).click()
 download=info.value;download.save_as(str(OUT/'synthetic-brief.md'));assert (OUT/'synthetic-brief.md').read_text()==text;passed('explicit brief download contains exactly selected source, original link, locator and user-authored content')
 page.fill('#brief-synthesis','Changed draft');expect(page.locator('#brief-output')).to_be_hidden();passed('changing a brief invalidates the previous export preview')
 page.get_by_role('button',name='Build brief',exact=True).click();page.screenshot(path=str(OUT/'express-desktop.png'),full_page=True)
 route('#mind');page.screenshot(path=str(OUT/'second-mind-desktop.png'),full_page=True)
 with page.expect_download() as info:page.get_by_role('button',name='Export library backup').click()
 info.value.save_as(str(OUT/'synthetic-backup.json'));assert json.loads((OUT/'synthetic-backup.json').read_text())==rows();passed('library backup includes original and Second Mind fields without mutation')
 matrix=[]
 for width in [320,390,768,1280,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for v in ['#mind','#mind/inbox','#mind/projects','#mind/areas','#mind/resources','#mind/archives','#mind/distill','#mind/express','#details/a','#graph']:
   route(v);m=page.evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})');assert m['scroll']<=m['width'],(width,v,m);matrix.append({'route':v,**m})
 passed('50 new route and viewport combinations reflow without horizontal overflow')
 page.set_viewport_size({'width':390,'height':1000});route('#mind');page.screenshot(path=str(OUT/'second-mind-mobile.png'),full_page=True)
 route('#details/a');page.screenshot(path=str(OUT/'distill-mobile.png'),full_page=True)
 # A stale snapshot must never overwrite another tab's change.
 page.fill('#mind-takeaway','stale draft');page.evaluate('''k=>{let r=JSON.parse(localStorage.getItem(k));r[1].title='Other tab change';localStorage.setItem(k,JSON.stringify(r));}''',KEY);before=rows();save();expect(page.locator('#mind-error')).to_contain_text('another tab');assert rows()==before;passed('concurrent library changes block Second Mind save without losing either draft or stored data')
 route('#library');route('#details/a');page.fill('#mind-takeaway','quota draft');page.evaluate('''()=>{window.originalSet=localStorage.setItem;localStorage.setItem=()=>{throw new Error('Storage full')};}''');save();expect(page.locator('#mind-error')).to_contain_text('Storage full');assert rows()==before;page.evaluate('localStorage.setItem=window.originalSet');passed('storage failure leaves saved metadata unchanged and input visible')
 page.evaluate('''k=>{let r=JSON.parse(localStorage.getItem(k));r[0].secondMind.version=2;localStorage.setItem(k,JSON.stringify(r));}''',KEY);route('#library');route('#details/a');expect(page.locator('#second-mind-editor')).to_contain_text('Unsupported');assert page.locator('#mind-form').count()==0;passed('unknown metadata version is not overwritten or silently reinterpreted')
 page.evaluate('''k=>{let r=JSON.parse(localStorage.getItem(k));r[0].secondMind={...HiveMindSecondMind.empty(),category:'resources',collection:'<img src=x onerror=alert(1)>',takeaway:'<script>window.hacked=true</script>'};localStorage.setItem(k,JSON.stringify(r));}''',KEY);route('#mind/resources');assert page.locator('#app img,#app script').count()==0;route('#details/a');assert page.locator('#app img,#app script').count()==0;route('#graph');page.select_option('#graph-grouping','para');assert page.locator('#app img,#app script').count()==0;passed('collection and takeaway markup stays escaped in cards, editor and graph')
 assert page.evaluate('window.sent.length')==0;assert not errors,errors;passed('Second Mind interactions issue no network requests and no browser errors')
 (OUT/'results.json').write_text(json.dumps({'scope':'Isolated Chromium with mocked localStorage and blocked provider transport; synthetic sources only; downloads observed in browser. Not hosted persistence or live API.','checks':checks,'matrix':matrix,'errors':errors},indent=2))
 for check in checks:print('PASS',check['name'])
 browser.close()
