import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {estimateQuote} from '../../public/tts/assets/estimate_quote.mjs';
import {models} from '../../public/tts/assets/models.mjs';
const root=fileURLToPath(new URL('../../public/tts/',import.meta.url));
const d=JSON.parse(await readFile(path.join(root,'assets/catalog.json'),'utf8'));
assert.equal(d.samples.length,23);assert.equal(d.samples.filter(s=>s.mode==='short').length,15);
assert.equal(d.samples.filter(s=>s.mode==='long').length,8);
assert.equal(new Set(d.samples.map(s=>s.id)).size,23);
assert.equal([...d.longText].filter(c=>/\p{Script=Han}/u.test(c)).length,1000);
assert.equal([...d.longText].length,1105);
assert.equal([...d.shortText].filter(c=>/\p{Script=Han}/u.test(c)).length,107);
const hash=s=>createHash('sha256').update(s).digest('hex');
for(const s of d.samples){
 assert(models.some(m=>m.id===s.model),s.id+' unknown model');
 const full=path.resolve(root,s.file);assert(full.startsWith(root),s.id+' unsafe path');
 assert.equal(hash(await readFile(full)),s.audioHash,s.id+' audio changed');
 assert.equal(hash(s.mode==='long'?d.longText:d.shortText),s.textHash,s.id+' script mismatch');
 const ref=s.teacher==='zhangwei'?'zhangwei':s.sourceSeconds===35?'cainew':'cai';
 assert.equal(hash(await readFile(path.join(root,d.references[ref]))),s.referenceHash,s.id+' reference mismatch');
}
// Same script and correct successful-sample billing across different methods.
const z=d.samples.filter(s=>s.teacher==='zhangwei'&&s.mode==='long');
assert.equal(z.find(s=>s.model==='cosy-flash').requests,1);
assert.equal(z.find(s=>s.model==='cosy-flash').cost,2105*.8/10000);
assert.equal(z.find(s=>s.model==='youdao').cost,1105/10000);
assert.equal(z.find(s=>s.model==='realtime').cost,710*1.5/1e6+2850*12/1e6);
const q=estimateQuote(d.longText,4);assert.equal(q.youdao,.1105);
assert(q.realtimeLow>.035&&q.realtimeHigh<.04);
assert.equal(estimateQuote('',4),null);assert.throws(()=>estimateQuote('English',4),RangeError);
assert.throws(()=>estimateQuote('中文',0),RangeError);
for(const route of ['index.html','long/compare/index.html','long/zhangwei/index.html','long/index.html']){
 const html=await readFile(path.join(root,route),'utf8');
 for(const [,url] of html.matchAll(/(?:href|src)="(\/tts\/[^"#?]+)(?:\?[^"#]*)?(?:#[^"]*)?"/g)){
  let file=path.join(root,url.slice(5));if(url.endsWith('/'))file=path.join(file,'index.html');
  await readFile(decodeURIComponent(file));
 }
}
console.log('PASS: 23 sample/media/script/reference hashes; 15 short + 8 long; price usage, quote boundaries and four existing routes.');
