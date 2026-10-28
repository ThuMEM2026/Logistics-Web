// Keep the native player, start playback in the user's click, and recover a
// failed connection without asking the user to reload the entire comparison.
export function createAudioPlayer(audio, {report=()=>{}, onPlay=()=>{}, slowMs=15000}={}) {
 let seek=null, position=0, timer;
 const listeners=[];
 const listen=(event,fn)=>{audio.addEventListener(event,fn);listeners.push([event,fn]);};
 const clear=()=>{clearTimeout(timer);timer=undefined;};
 const slow=()=>{clear();timer=setTimeout(()=>report('加载较慢，可重试播放，或下载后试听。',true),slowMs);};
 const applySeek=()=>{
  if(seek===null||audio.readyState<1)return;
  const end=Number.isFinite(audio.duration)?Math.max(0,audio.duration-.05):seek;
  audio.currentTime=Math.min(seek,end);position=audio.currentTime;seek=null;
 };
 const failed=()=>{
  clear();
  const code=audio.error?.code;
  const message=code===3?'音频解码失败，请重试或下载后试听。':code===4?'音频未能读取，请重试或下载后试听。':'音频连接中断，请重试播放，或下载后试听。';
  report(message,true);
 };
 listen('loadedmetadata',applySeek);
 listen('timeupdate',()=>{if(Number.isFinite(audio.currentTime))position=audio.currentTime;});
 listen('play',()=>{onPlay();if(audio.readyState<3){report('正在加载音频…',false);slow();}});
 listen('playing',()=>{clear();report('',false);});
 listen('waiting',()=>{if(!audio.paused){report('正在缓冲音频…',false);slow();}});
 listen('stalled',()=>{if(!audio.paused)slow();});
 listen('pause',clear);listen('ended',clear);listen('error',failed);
 async function playAt(seconds=audio.currentTime||0) {
  seek=Math.max(0,Number(seconds)||0);
  if(audio.error)audio.load();
  applySeek();report('正在加载音频…',false);slow();
  try {
   // Do not wait for metadata before play(): that loses the user gesture on
   // some mobile browsers. loadedmetadata applies the requested seek instead.
   await audio.play();
   if(audio.readyState>=3){clear();report('',false);}
  } catch(error) {
   clear();
   if(error?.name==='AbortError')return;
   if(error?.name==='NotAllowedError')report('请点击播放器中的播放按钮。',false);
   else failed();
  }
 }
 return {
  playAt,
  retry(){const resume=seek??position;audio.load();return playAt(resume);},
  dispose(){clear();for(const [event,fn] of listeners)audio.removeEventListener(event,fn);}
 };
}

export function attachAudioPlayers(root=document) {
 const players=new Map(),cleanups=[];
 for(const audio of root.querySelectorAll('audio')) {
  const controls=document.createElement('div');controls.className='playback-status';
  controls.innerHTML='<span role="status"></span><button type="button" class="small-button" hidden>重试播放</button>';
  audio.after(controls);
  const label=controls.querySelector('span'),button=controls.querySelector('button');
  const player=createAudioPlayer(audio,{
   report(message,retry){label.textContent=message;button.hidden=!retry;controls.hidden=!message;},
   onPlay(){for(const other of root.querySelectorAll('audio'))if(other!==audio)other.pause();}
  });
  controls.hidden=true;button.addEventListener('click',()=>player.retry());
  players.set(audio,player);cleanups.push(()=>{player.dispose();controls.remove();});
 }
 return {players,dispose(){cleanups.forEach(fn=>fn());}};
}
