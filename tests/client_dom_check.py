"""Offline component check: no navigation, OpenAI call, or real browser storage.
Requires Python Playwright and Chromium. This is NOT an end-to-end acceptance test.
Run from repository root: python tests/client_dom_check.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json, os
ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    page = browser.new_page()
    page.set_content('<main id="app"><form class="search"></form></main>')
    page.add_script_tag(content=(ROOT/'ai-search.js').read_text())
    page.evaluate('''() => {
      window.sent = [];
      window.fetch = async (url, options) => {
        window.sent.push({url, headers: options.headers, body: JSON.parse(options.body)});
        return {ok: true, json: async () => ({mode:'semantic', matches:[{id:'a',score:.8}]})};
      };
      window.attachSemanticSearch({query:'interview coding approaches',
        records:[{id:'a', whySaved:'My exact note', project:'Methods', url:'https://private.example'}],
        renderCard: () => '<article>Saved source</article>',root:document.querySelector('#app')});
    }''')
    page.get_by_label('Reviewer demo access code', exact=False).fill('x'*40)
    page.get_by_role('checkbox').check()
    page.get_by_role('button', name='Search by meaning').click()
    expect(page.get_by_role('status')).to_contain_text('Meaning-based ranking: 1 candidate')
    expect(page.locator('.ai-results')).to_contain_text('My exact note')
    sent = page.evaluate('window.sent')
    assert len(sent)==1 and sent[0]['url']=='/api/search'
    assert 'url' not in sent[0]['body']['records'][0]
    assert sent[0]['body']['consent'] is True
    print('PASS client consent form, sanitized payload and grounded result rendering (mock transport)')
    page.get_by_label('Reviewer demo access code', exact=False).fill('sk-'+'a'*40)
    page.get_by_role('button', name='Search by meaning').click()
    expect(page.get_by_role('status')).to_contain_text('Do not enter an OpenAI API key')
    assert len(page.evaluate('window.sent'))==1
    print('PASS API-key-shaped input rejected before request')
    page.get_by_label('Reviewer demo access code', exact=False).fill('x'*40)
    page.evaluate("window.fetch = async () => ({ok:false,json:async()=>({error:'Provider unavailable'})})")
    page.get_by_role('button', name='Search by meaning').click()
    expect(page.get_by_role('status')).to_contain_text('Provider unavailable')
    expect(page.get_by_role('button',name='Search by meaning')).to_be_enabled()
    print('PASS failure message and retry control (mock transport)')
    browser.close()
