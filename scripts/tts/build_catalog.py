"""Normalize existing published test records; never generates or alters audio."""
import json
from pathlib import Path
from posixpath import normpath

ROOT = Path(__file__).resolve().parents[2] / 'public/tts'
m = json.loads((ROOT / 'display-manifest.json').read_text())
c = json.loads((ROOT / 'long/compare/comparison.json').read_text())
z = json.loads((ROOT / 'long/zhangwei/comparison.json').read_text())
ids = {'A':'cosy-plus','B':'youdao','C':'qwen-plus','D':'cosy-flash','E':'cosy-open','F':'youdao-open','G':'realtime'}
longids = {'qwen-audio-3.0-realtime-flash':'realtime','qwen-audio-3.0-tts-plus':'qwen-plus','cosyvoice-v3.5-plus':'cosy-plus','cosyvoice-v3.5-flash':'cosy-flash','youdao-pro':'youdao'}
samples = []
for r in m['results']:
 samples.append(dict(id=r['person']+'-'+r['blind_code'], teacher='zhangwei' if r['person']=='zhangwei' else 'cai', person=r['person'], mode='short', code=r['blind_code'], model=ids[r['blind_code']], sourceSeconds=35 if r['person']=='cainew' else 10, file=r['file'], seconds=r['seconds'], cost=r['cost_estimate']['tts_cny'], requests=1, costBasis=r['cost_estimate']['rate_note'], audioHash=r['audio_sha256'], referenceHash=r['reference_sha256'], textHash=r['text_sha256']))
for teacher,data,prefix,source in [('cai',c,'long/compare/',35),('zhangwei',z,'long/zhangwei/',10)]:
 for r in data['records']:
  model=longids[r['model']]
  file=normpath(prefix+r['file'])
  cost=r.get('cost_cny',r.get('tts_list_price_cny'))
  if teacher=='cai' and model=='youdao':cost=.1105
  samples.append(dict(id=teacher+'-long-'+model,teacher=teacher,person=teacher,mode='long',model=model,code={'cosy-plus':'A','youdao':'B','qwen-plus':'C','cosy-flash':'D','realtime':'G'}[model],sourceSeconds=source,file=file,seconds=r['seconds'],cost=cost,requests=r['request_count'],costBasis=r['cost_basis'],audioHash=r.get('published_audio_sha256',r.get('audio_sha256')),referenceHash=r['reference_sha256'],textHash=r['text_sha256']))
refs={}
for person in ('cai','cainew','zhangwei'):
 r=next(r for r in m['results'] if r['person']==person)
 refs[person]=r['reference_file']
out=dict(updated='2026-10-22',shortText=m['text'],longText=c['text'],references=refs,samples=samples)
(ROOT/'assets/catalog.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(f"Catalog: {len(samples)} samples, 15 short + 8 long; no audio modified")
