import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const script=fs.readFileSync(new URL('../public/assets/enquiry-metrics.js',import.meta.url),'utf8');
function run(navigator={}){const calls=[],listeners={};const document={visibilityState:'visible',addEventListener:(name,fn)=>listeners[name]=fn};vm.runInNewContext(script,{navigator,document,location:{origin:'https://cxoopenmic.com',pathname:'/radar/'},URL,fetch:(url,opts)=>{calls.push({url,opts,body:JSON.parse(opts.body)});return Promise.resolve();}});return {calls,listeners};}
test('counts a visible page once and only contact/sponsorship links',()=>{
 const {calls,listeners}=run();listeners.visibilitychange();assert.equal(calls.length,1);
 const click=href=>listeners.click({target:{closest:()=>({href})}});
 click('https://cxoopenmic.com/contact?topic=radar&from=radar');click('https://cxoopenmic.com/sponsorship');click('https://other.example/contact');click('https://cxoopenmic.com/privacy.html');
 assert.equal(calls.length,3);assert.equal(calls[1].body.topic,'radar');assert.equal(calls[2].body.topic,'sponsorship');assert.equal(calls[0].opts.credentials,'omit');
});
test('privacy preferences suppress events',()=>{assert.equal(run({doNotTrack:'1'}).calls.length,0);assert.equal(run({globalPrivacyControl:true}).calls.length,0);});
test('every public conversation link has page attribution and the tracking script',()=>{
 for(const [page,key] of [['index.html','home'],['radar/index.html','radar'],['amplify/index.html','amplify'],['resonance/index.html','resonance']]){
 const html=fs.readFileSync(new URL('../public/'+page,import.meta.url),'utf8');assert.match(html,/src="\/assets\/enquiry-metrics.js"/);
 const links=[...html.matchAll(/href="(\/(?:contact|sponsorship)[^"]*)"/g)];assert.ok(links.length);for(const [,link] of links)assert.match(link,new RegExp('from='+key+'$'));
 }
});
