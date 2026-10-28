import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioPlayer} from '../public/tts/assets/audio-player.mjs';

class AudioStub extends EventTarget {
 readyState=0;duration=230;currentTime=0;paused=true;error=null;plays=0;loads=0;
 play(){this.plays++;this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}
 load(){this.loads++;this.currentTime=0;this.readyState=0;this.error=null;}
 emit(type){this.dispatchEvent(new Event(type));}
}
test('a jump starts play during the click, then seeks when metadata arrives',async()=>{
 const audio=new AudioStub(),player=createAudioPlayer(audio);
 const pending=player.playAt(180);
 assert.equal(audio.plays,1,'must not wait for metadata and lose the mobile user gesture');
 audio.readyState=1;audio.emit('loadedmetadata');await pending;
 assert.equal(audio.currentTime,180);player.dispose();
});
test('retry reloads a failed connection and resumes from the last position',async()=>{
 const audio=new AudioStub(),reports=[],player=createAudioPlayer(audio,{report:(...args)=>reports.push(args)});
 audio.readyState=4;audio.currentTime=72;audio.emit('timeupdate');
 audio.error={code:2};audio.emit('error');assert.equal(reports.at(-1)[1],true);
 await player.retry();assert.equal(audio.loads,1);
 audio.readyState=1;audio.emit('loadedmetadata');assert.equal(audio.currentTime,72);
 audio.emit('playing');assert.deepEqual(reports.at(-1),['',false]);player.dispose();
});
test('a slow connection offers recovery and playing clears that warning',async()=>{
 const audio=new AudioStub(),reports=[],player=createAudioPlayer(audio,{slowMs:10,report:(...args)=>reports.push(args)});
 await player.playAt();await new Promise(resolve=>setTimeout(resolve,25));
 assert.equal(reports.at(-1)[1],true);
 audio.emit('playing');assert.deepEqual(reports.at(-1),['',false]);player.dispose();
});
test('a browser permission rejection asks for a click, not a network retry',async()=>{
 const audio=new AudioStub(),reports=[];audio.play=()=>Promise.reject({name:'NotAllowedError'});
 const player=createAudioPlayer(audio,{report:(...args)=>reports.push(args)});await player.playAt();
 assert.match(reports.at(-1)[0],/播放按钮/);assert.equal(reports.at(-1)[1],false);player.dispose();
});
