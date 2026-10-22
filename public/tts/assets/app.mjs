import {models,modelById} from './models.mjs';
import {estimateQuote} from './estimate_quote.mjs';

const BASE='/tts/', $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toFixed(5).replace(/0+$/,'').replace(/\.$/,'');
const duration=s=>`${Math.floor(s/60)}分${String(Math.round(s%60)).padStart(2,'0')}秒`;
const oldKey='tts-listening-20261020-compact35-v1',longKey='tts-listening-long-20261022-v1';
function readStore(key){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
const scores={short:readStore(oldKey),long:readStore(longKey)};
let data,state,visible=[],blind=false;
function routeState(){
 const p=new URLSearchParams(location.search),hash=location.hash;
 let s={teacher:document.body.dataset.teacher||'cai',mode:'long',source:35};
 if(['cai','cainew','zhangwei'].includes(hash.slice(1))){s.mode='short';s.teacher=hash==='#zhangwei'?'zhangwei':'cai';s.source=hash==='#cainew'?35:10;}
 if(['cai','zhangwei'].includes(p.get('teacher')))s.teacher=p.get('teacher');
 if(['short','long'].includes(p.get('mode')))s.mode=p.get('mode');
 if(['10','35'].includes(p.get('source')))s.source=Number(p.get('source'));
 if(s.teacher==='zhangwei')s.source=10;
 return s;
}
function shareState(){const u=new URL(location.href);u.searchParams.set('teacher',state.teacher);u.searchParams.set('mode',state.mode);u.searchParams.set('source',String(state.source));u.hash='listen';history.replaceState(null,'',u);}
function feedbackKey(s){return s.mode==='short'?s.person+'-'+s.code:s.id;}
function rating(s,dimension){return scores[s.mode][feedbackKey(s)+'-'+dimension]||'';}
function review(s){
 if(s.mode==='short')return '';
 if(s.teacher==='cai'&&s.model==='cosy-flash')return '<div class="finding warning"><strong>试听反馈：后段声音有变化。</strong> 这份9段拼接样音暂不用于长课程；原因尚未确定，不代表所有Flash生成都会变声。</div>';
 if(s.teacher==='cai'&&s.model==='realtime')return '<div class="finding"><strong>试听反馈：情绪偏平。</strong> 价格较低，但重音、停顿与讲课感染力仍需老师判断。</div>';
 return '<p class="quiet">已生成完整样音，尚未完成整篇人工听验；请特别比较中段和结尾。</p>';
}
function sampleHTML(s){
 const m=modelById[s.model],isLong=s.mode==='long',cost=s.cost==null?'算力另计':`¥${money(s.cost)}`;
 const code=`样音 ${s.code}`,method=isLong?(s.requests===1?'整篇1次生成':'9段分别生成后拼接'):'短稿1次生成';
 const costLabel=s.cost==null?'自部署费用另算':'本条样音合成测算';
 const options=['<option value="">未评分</option>',...[1,2,3,4,5].map(n=>`<option value="${n}">${n}分</option>`)].join('');
 const anchor=s.model==='cosy-flash'?'sample-cosyvoice-v3.5-flash':'sample-'+s.model;
 return `<article class="sample" id="${anchor}" data-sample="${esc(s.id)}">
 <div class="sample-top"><div><p class="vendor identity">${esc(m.vendor)}</p><h3><span class="identity">${esc(m.name)}</span><span class="blind-name" ${blind?'':'hidden'}>${code}</span></h3></div><div class="cost sample-cost"><strong>${cost}</strong><span>${costLabel}</span></div></div>
 <p class="sample-meta">${duration(s.seconds)} · ${method} · ${isLong?'1000个汉字':'107个汉字'}</p>
 <audio controls preload="metadata" src="${BASE+esc(s.file)}" aria-label="${blind?code:esc(m.name)}，${state.teacher==='cai'?'蔡老师':'张伟老师'}${isLong?'长稿':'短稿'}"></audio>
 ${isLong?`<div class="play-tools"><button class="jump" data-seek="0">听开头</button><button class="jump" data-seek="${Math.max(0,s.seconds/2-8).toFixed(2)}">听中段</button><button class="jump" data-seek="${Math.max(0,s.seconds-32).toFixed(2)}">听后段</button><a class="download" href="${BASE+esc(s.file)}" download>下载样音</a></div>`:''}
 ${review(s)}
 <div class="sample-facts"><div><strong>${esc(m.price)}</strong><small>${s.model==='realtime'?'本轮样本折算，不是固定单价':s.model==='youdao'?'项目5折报价；非官网统一价':s.model.endsWith('open')?'官方在线演示；私有化成本另算':'纯汉字基准；标点英数另计'}</small></div><p>${esc(m.limit)}<small>音色复刻：${esc(m.clone)}</small></p></div>
 <details class="model-detail"><summary>费用怎么算？这次怎么测的？</summary><p>${esc(s.costBasis)}</p><p>${esc(m.conversion)}</p><p>${esc(m.detail)}</p><p class="quiet">${s.cost==null?'本次为官方在线演示。':'以上为成功样音费用测算，未抵扣试用额度，不是账单实扣；失败请求或返工另计。'}</p><a href="#price-${m.id}">查看官方规格、原声要求与来源</a></details>
 <details class="review-form"><summary>留下听感（可选，1–5分，5分最好）</summary><div class="review-fields"><label>自然讲解 <select data-score="natural" aria-label="${code}自然讲解">${options}</select></label><label>像本人 <select data-score="similar" aria-label="${code}像本人">${options}</select></label></div><label class="quiet" for="note-${esc(s.id)}">停顿、重音、读音或变声位置</label><textarea id="note-${esc(s.id)}" data-score="note" maxlength="2000" placeholder="例如：3分14秒后音色变化；某处停顿不自然"></textarea></details>
 </article>`;
}
function render(){
 document.querySelectorAll('audio').forEach(a=>a.pause());
 const teacher=state.teacher==='cai'?'蔡老师':'张伟老师',isLong=state.mode==='long';
 const person=state.teacher==='zhangwei'?'zhangwei':state.source===35?'cainew':'cai';
 visible=data.samples.filter(s=>s.teacher===state.teacher&&s.mode===state.mode&&(isLong||s.sourceSeconds===state.source));
 const order=['youdao','realtime','cosy-flash','qwen-plus','cosy-plus','cosy-open','youdao-open'];
 visible.sort((a,b)=>order.indexOf(a.model)-order.indexOf(b.model));
 document.querySelectorAll('button[data-teacher]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.teacher===state.teacher)));
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
 $('#source-choice').hidden=isLong||state.teacher!=='cai';$('#source').value=String(state.source);
 const sourceSeconds=isLong?(state.teacher==='cai'?35:10):state.source;
 $('#context-title').textContent=`${teacher} · ${sourceSeconds}秒原声 · ${isLong?'1000字长稿':'短稿'} · ${visible.length}款模型`;
 $('#context-notes').textContent=isLong?'同一份1000汉字讲稿，含标点换行共1105字符。生成方式各有不同，请结合下面的标记比较。':'同一份107汉字短稿，含标点共118字符。短稿用于比较音色，长稿更能观察情绪和音色是否持续稳定。';
 $('#reference-note').textContent=state.teacher==='cai'&&sourceSeconds===35?'本组上传源文件相同，均为会议录音3分40秒至4分15秒。部分阿里复刻接口默认最多使用10秒有效提示。':'本组使用同一份'+sourceSeconds+'秒原声；不同老师、不同源文件的结果不作为单一模型变量比较。';
 const refPerson=isLong?(state.teacher==='cai'?'cainew':'zhangwei'):person;
 $('#reference-audio').src=BASE+data.references[refPerson];
 $('#reference-audio').setAttribute('aria-label',teacher+'原声');
 $('#script').textContent=isLong?data.longText:data.shortText;
 $('#result-count').textContent=`${teacher} / ${isLong?'长稿':'短稿'}试听`;
 $('#round-note').textContent=isLong?(state.teacher==='zhangwei'?'张伟老师本轮补测3款；千问TTS Plus与CosyVoice Plus只有短稿样音。':'本轮共5款云模型；开源版只有10秒原声的短稿结果。'):(person==='cai'?'本组有2款开源演示样音；Realtime短稿在“35秒原声”组。':state.teacher==='zhangwei'?'张伟老师Realtime目前只有长稿样音。':'开源版短稿在“10秒原声”组。');
 $('#samples').innerHTML=visible.map(sampleHTML).join('');
 $('#samples').classList.toggle('blind',blind);
 visible.forEach(s=>{
  const card=document.querySelector(`[data-sample="${s.id}"]`);
  card.querySelectorAll('[data-score]').forEach(el=>{el.value=rating(s,el.dataset.score);el.addEventListener('input',()=>save(s,el.dataset.score,el.value));});
 });
 bindAudio();
}
function save(s,dimension,value){
 scores[s.mode][feedbackKey(s)+'-'+dimension]=value;
 try{localStorage.setItem(s.mode==='short'?oldKey:longKey,JSON.stringify(scores[s.mode]));$('#feedback-status').textContent='听感已保存在当前浏览器，可导出。';}
 catch{$('#feedback-status').textContent='浏览器未允许保存，请用下方导出按钮保留听感。';}
}
function bindAudio(){
 document.querySelectorAll('audio').forEach(a=>{
  if(a.dataset.bound)return;a.dataset.bound='yes';
  a.addEventListener('play',()=>{document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause();});a.closest('.sample')?.classList.add('is-playing');});
  for(const event of ['pause','ended'])a.addEventListener(event,()=>a.closest('.sample')?.classList.remove('is-playing'));
  a.addEventListener('error',()=>{$('#feedback-status').textContent='音频暂未加载成功，请检查网络或刷新页面。';});
 });
 document.querySelectorAll('[data-seek]').forEach(b=>b.addEventListener('click',async()=>{
  const a=b.closest('.sample').querySelector('audio');const seconds=Number(b.dataset.seek);
  try{if(a.readyState===0){await new Promise((resolve,reject)=>{a.addEventListener('loadedmetadata',resolve,{once:true});a.addEventListener('error',reject,{once:true});a.load();});}a.currentTime=Math.min(seconds,Math.max(0,a.duration-1));await a.play();}
  catch{$('#feedback-status').textContent='未能播放，请使用音频播放器重试。';}
 }));
}
function renderPrices(){
 $('#price-directory').innerHTML=models.map(m=>`<article class="price-row" id="price-${m.id}"><div><span class="price-label">${esc(m.vendor)}</span><h3>${esc(m.name)}</h3></div><div><span class="price-label">长期合成费用</span><div class="price-value">${esc(m.price)}</div><p class="quiet">${esc(m.conversion)}</p></div><div><span class="price-label">音色复刻与长稿</span><p>${esc(m.clone)}</p><p>${esc(m.limit)}</p></div><details><summary>查看限制、原声要求、小语种与官方来源</summary><div class="detail-body"><p><strong>文本限制：</strong>${esc(m.detail)}</p><p><strong>原声要求：</strong>${esc(m.reference)}</p><p><strong>计费口径：</strong>${esc(m.billing)}</p><p><strong>小语种：</strong>${esc(m.language)}</p><div class="source-links">${m.sources.map(([title,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(title)} ↗</a>`).join('')}</div></div></details></article>`).join('');
}
function updateQuote(){
 try{
  const q=estimateQuote($('#quote-text').value,$('#quote-minutes').value);$('#quote-error').textContent='';
  if(!q){$('#quote-output').innerHTML='<p>粘贴中文讲稿后，显示两家供应商的估价。</p>';$('#quote-count').textContent='尚未输入讲稿';return;}
  $('#quote-count').textContent=`${q.han}个汉字 / 含标点换行共${q.characters}字符`;
  $('#quote-output').innerHTML=`<div class="quote-provider"><span>有道 Pro · 项目5折</span><strong>约 ¥${money(q.youdao)}</strong><p class="quiet">按${q.characters}字符 × 1元/万字符；音色定制免费。每段不超过600字符。</p></div><div class="quote-provider"><span>阿里 千问3.0 Realtime Flash</span><strong>约 ¥${money(q.realtimeLow)}–${money(q.realtimeHigh)}</strong><p class="quiet">按预计${q.minutes}分钟音频 + 中文样本的输入Token比例估算；不是官方保证区间。克隆费0元。</p></div>${q.requiresSplitting?'<p class="error">预计可能触及单次Token限制，需要分段生成和复听。</p>':''}`;
 }catch(e){$('#quote-error').textContent=e.message;$('#quote-output').textContent='请调整输入后查看估价。';$('#quote-count').textContent='';}
}
function exportRatings(){
 const ratings=data.samples.map(s=>({...s,speaker:s.teacher==='cai'?'蔡老师':'张伟老师',natural:rating(s,'natural')?Number(rating(s,'natural')):null,similar:rating(s,'similar')?Number(rating(s,'similar')):null,note:rating(s,'note')}));
 const blob=new Blob([JSON.stringify({date:new Date().toISOString(),selection:state,score_scale:'1-5,higherisbetter',ratings},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='教学声音试听反馈.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 $('#feedback-status').textContent='已导出本浏览器记录的全部长短稿听感。';
}
async function init(){
 const response=await fetch(BASE+'assets/catalog.json?v=20261022a');if(!response.ok)throw new Error('样音目录加载失败');data=await response.json();state=routeState();render();renderPrices();
 document.querySelectorAll('button[data-teacher]').forEach(b=>b.addEventListener('click',()=>{state.teacher=b.dataset.teacher;if(state.teacher==='zhangwei')state.source=10;else state.source=35;render();shareState();}));
 document.querySelectorAll('button[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;render();shareState();}));
 $('#source').addEventListener('change',e=>{state.source=Number(e.target.value);render();shareState();});
 $('#blind').addEventListener('click',()=>{blind=!blind;$('#blind').textContent=blind?'显示模型与价格':'隐藏型号，盲听比较';$('#blind').setAttribute('aria-pressed',String(blind));render();});
 $('#export').addEventListener('click',exportRatings);
 $('#copy-link').addEventListener('click',async()=>{shareState();try{await navigator.clipboard.writeText(location.href);$('#feedback-status').textContent='已复制当前老师与稿件的试听链接。';}catch{$('#feedback-status').textContent='请复制浏览器地址栏链接分享。';}});
 $('#quote-text').addEventListener('input',()=>{const n=Array.from($('#quote-text').value).filter(c=>/\p{Script=Han}/u.test(c)).length;if(n)$('#quote-minutes').value=Math.max(.1,Math.round(n/250*10)/10);updateQuote();});
 $('#quote-minutes').addEventListener('input',updateQuote);
 $('#load-example').addEventListener('click',()=>{$('#quote-text').value=data.longText;$('#quote-minutes').value=4;updateQuote();});
 window.addEventListener('popstate',()=>{state=routeState();render();});
 window.addEventListener('hashchange',()=>{if(['#cai','#cainew','#zhangwei'].includes(location.hash)){const u=new URL(location.href);u.search='';history.replaceState(null,'',u);state=routeState();render();}});
 if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});
 $('#updated').textContent='2026.10.22';updateQuote();
}
init().catch(()=>{$('#samples').innerHTML='<p class="error">样音目录未能加载，请刷新页面。也可以先阅读下方费用说明。</p>';$('#feedback-status').textContent='如持续加载失败，请检查网络。';});
