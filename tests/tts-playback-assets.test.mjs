import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../public/tts/',import.meta.url);
test('each comparison has a lightweight MP3 and retains the audited original',async()=>{
 const data=JSON.parse(await readFile(new URL('assets/catalog.json',root),'utf8'));
 assert.equal(data.samples.length,23);
 for(const sample of data.samples){
  const original=await readFile(new URL(sample.file,root));
  assert.equal(createHash('sha256').update(original).digest('hex'),sample.audioHash,sample.id);
  const playback=sample.playbackFile||sample.file;
  assert.match(playback,/\.mp3$/);
  const info=await stat(new URL(playback,root));assert.ok(info.size>0);
  if(sample.file.endsWith('.wav'))assert.ok(info.size<original.length/2,sample.id+' should avoid the large WAV transfer');
 }
 for(const file of Object.values(data.referencePlayback)){
  assert.match(file,/\.mp3$/);assert.ok((await stat(new URL(file,root))).size>0);
 }
});
