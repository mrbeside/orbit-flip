'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const copy = {
    en: {arcade:'THE ONE-TAP ARCADE',score:'SCORE',best:'PERSONAL BEST',quick:'SMALL GAME. BIG JUST-ONE-MORE.',tagline:'One tap. Two orbits.<br>How long can you stay in motion?',play:'LET’S PLAY',startHint:'or press SPACE to start',retry:'ONE MORE GO',paused:'TAKE A BREATHER',pauseTitle:'In a holding orbit.',resume:'KEEP GOING',ready:'READY WHEN YOU ARE',switch:'TAP TO SWITCH',switchHelp:'Find your flow between orbits.',avoid:'DODGE THE RED',avoidHelp:'A little space goes a long way.',collect:'CHASE THE GOLD',collectHelp:'Each star adds 5 points.',footer:'NO DOWNLOADS. JUST ONE MORE TRY.',running:'TAP / SPACE TO SWITCH · P TO PAUSE',end:'Out of orbit.',nice:'NICE RUN',record:'NEW PERSONAL BEST',detail:'{time}s in orbit · {stars} stars collected',pause:'Pause',soundOn:'Mute sound',soundOff:'Enable sound'},
    ja: {arcade:'ワンタップ・アーケード',score:'スコア',best:'自己ベスト',quick:'シンプルなのに、もう一回。',tagline:'タップひとつ。ふたつの軌道。<br>どこまで回り続けられる？',play:'プレイする',startHint:'スペースキーでもスタート',retry:'もう一回',paused:'ちょっとひと休み',pauseTitle:'軌道上で待機中。',resume:'つづける',ready:'いつでもスタート',switch:'タップで切り替え',switchHelp:'ふたつの軌道を行き来しよう。',avoid:'赤をよける',avoidHelp:'ぶつかったらゲームオーバー。',collect:'星を集める',collectHelp:'星ひとつで5ポイント。',footer:'ダウンロード不要。あと一回だけ。',running:'タップ / スペースで切替 · Pで一時停止',end:'軌道から離脱。',nice:'ナイスプレイ',record:'自己ベスト更新！',detail:'{time}秒間 · 星を{stars}個獲得',pause:'一時停止',soundOn:'音をオフ',soundOff:'音をオン'},
    es: {arcade:'ARCADE DE UN TOQUE',score:'PUNTOS',best:'RÉCORD PERSONAL',quick:'PEQUEÑO JUEGO. UNA PARTIDA MÁS.',tagline:'Un toque. Dos órbitas.<br>¿Cuánto tiempo puedes aguantar?',play:'JUGAR',startHint:'o pulsa ESPACIO para empezar',retry:'OTRA PARTIDA',paused:'TOMA UN RESPIRO',pauseTitle:'En órbita de espera.',resume:'CONTINUAR',ready:'TODO LISTO',switch:'TOCA PARA CAMBIAR',switchHelp:'Muévete entre las órbitas.',avoid:'EVITA EL ROJO',avoidHelp:'Mantén la distancia.',collect:'ATRAPA EL ORO',collectHelp:'Cada estrella suma 5 puntos.',footer:'SIN DESCARGAS. UNA PARTIDA MÁS.',running:'TOCA / ESPACIO: CAMBIAR · P: PAUSA',end:'Fuera de órbita.',nice:'BIEN JUGADO',record:'NUEVO RÉCORD',detail:'{time}s en órbita · {stars} estrellas',pause:'Pausar',soundOn:'Silenciar',soundOff:'Activar sonido'},
    pt: {arcade:'ARCADE DE UM TOQUE',score:'PONTOS',best:'RECORDE PESSOAL',quick:'JOGO PEQUENO. SÓ MAIS UMA.',tagline:'Um toque. Duas órbitas.<br>Quanto tempo você consegue ficar?',play:'JOGAR',startHint:'ou pressione ESPAÇO para começar',retry:'MAIS UMA VEZ',paused:'HORA DE RESPIRAR',pauseTitle:'Em órbita de espera.',resume:'CONTINUAR',ready:'TUDO PRONTO',switch:'TOQUE PARA MUDAR',switchHelp:'Alterne entre as órbitas.',avoid:'DESVIE DO VERMELHO',avoidHelp:'Mantenha uma boa distância.',collect:'PEGUE O OURO',collectHelp:'Cada estrela vale 5 pontos.',footer:'SEM DOWNLOADS. SÓ MAIS UMA.',running:'TOQUE / ESPAÇO: MUDAR · P: PAUSA',end:'Fora de órbita.',nice:'BOA PARTIDA',record:'NOVO RECORDE',detail:'{time}s em órbita · {stars} estrelas',pause:'Pausar',soundOn:'Silenciar',soundOff:'Ativar som'},
    fr: {arcade:'L’ARCADE EN UN GESTE',score:'SCORE',best:'RECORD PERSONNEL',quick:'PETIT JEU. ENCORE UNE PARTIE.',tagline:'Un geste. Deux orbites.<br>Combien de temps tiendras-tu ?',play:'JOUER',startHint:'ou appuie sur ESPACE',retry:'ENCORE UNE FOIS',paused:'UNE PETITE PAUSE',pauseTitle:'En orbite d’attente.',resume:'CONTINUER',ready:'PRÊT À JOUER',switch:'TOUCHE POUR CHANGER',switchHelp:'Passe d’une orbite à l’autre.',avoid:'ÉVITE LE ROUGE',avoidHelp:'Garde tes distances.',collect:'ATTRAPE L’OR',collectHelp:'Chaque étoile vaut 5 points.',footer:'AUCUN TÉLÉCHARGEMENT. ENCORE UNE.',running:'TOUCHER / ESPACE : CHANGER · P : PAUSE',end:'Sortie d’orbite.',nice:'BIEN JOUÉ',record:'NOUVEAU RECORD',detail:'{time}s en orbite · {stars} étoiles',pause:'Pause',soundOn:'Couper le son',soundOff:'Activer le son'}
  };
  const read = (key, fallback) => {try {return localStorage.getItem(key) ?? fallback;} catch {return fallback;}};
  const save = (key, value) => {try {localStorage.setItem(key, value);} catch { /* Play remains available when storage is disabled. */ }};
  let lang = read('orbit-language', navigator.language.slice(0,2));
  if (!copy[lang]) lang = 'en';
  let best = Math.max(0,Number(read('orbit-best','0')) || 0), muted = read('orbit-sound','off') !== 'on';
  let state = 'ready', score = 0, elapsed = 0, stars = 0, angle = -Math.PI/2, lane = 1, radial = 1;
  let objects = [], particles = [], nextSpawn = 1, last = 0, idle = 0, width = 0, height = 0, radii = [0,0], audio;
  let newRecord = false, feedbackUntil = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function translate() {
    document.documentElement.lang = lang;
    $('language').value = lang;
    document.querySelectorAll('[data-text]').forEach(el => el.innerHTML = copy[lang][el.dataset.text]);
    $('pause').setAttribute('aria-label',copy[lang].pause);
    updateSound(); updateStatus();
    if (state === 'over') showResult();
  }
  function updateSound() {
    $('sound').setAttribute('aria-label',copy[lang][muted?'soundOff':'soundOn']);
    $('sound').setAttribute('aria-pressed',String(!muted));
    $('sound').querySelector('.slash').hidden = !muted;
  }
  function tone(frequency, duration=.08, type='sine') {
    if (muted) return;
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(()=>{});
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = type; osc.frequency.setValueAtTime(frequency,audio.currentTime);
      gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
      osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);
    } catch { /* Audio support is optional. */ }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(); width=rect.width; height=rect.height;
    const dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width*dpr);canvas.height = Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const outer = Math.min(width*.41,height*.405,211);radii = [outer*.68,outer];
  }
  new ResizeObserver(resize).observe(canvas);
  function updateScore() {$('score').textContent=String(score).padStart(3,'0');$('best').textContent=String(best).padStart(3,'0');}
  function updateStatus() {$('status').textContent = copy[lang][state==='playing'?'running':state==='paused'?'paused':'ready'];}
  function start() {
    state='playing';score=0;elapsed=0;stars=0;angle=-Math.PI/2;lane=1;radial=1;objects=[];particles=[];nextSpawn=.85;newRecord=false;
    $('overlay').hidden=true;$('pause').hidden=false;$('centerMark').hidden=false;$('feedback').textContent='';updateScore();updateStatus();tone(440);
  }
  function flip() {if(state!=='playing')return;lane=1-lane;tone(lane?420:330,.05);}
  function pause() {
    if(state!=='playing')return;state='paused';$('overlay').hidden=false;$('intro').hidden=true;$('result').hidden=true;$('paused').hidden=false;$('pause').hidden=true;updateStatus();$('resume').focus();
  }
  function resume() {if(state!=='paused')return;state='playing';$('overlay').hidden=true;$('pause').hidden=false;last=performance.now();updateStatus();}
  function showResult() {
    $('resultLabel').textContent=copy[lang][newRecord?'record':'nice'];$('resultTitle').textContent=copy[lang].end;
    $('finalScore').textContent=score;$('resultDetail').textContent=copy[lang].detail.replace('{time}',Math.floor(elapsed)).replace('{stars}',stars);
  }
  function end() {
    state='over';newRecord=score>best;if(newRecord){best=score;save('orbit-best',String(best));}updateScore();
    $('overlay').hidden=false;$('intro').hidden=true;$('paused').hidden=true;$('result').hidden=false;$('pause').hidden=true;$('feedback').textContent='';showResult();updateStatus();tone(100,.3,'triangle');$('retry').focus();
  }
  function position(a,r) {return {x:width/2+Math.cos(a)*r,y:height/2+Math.sin(a)*r};}
  function burst(x,y,color) {if(reducedMotion)return;for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2;particles.push({x,y,vx:Math.cos(a)*55,vy:Math.sin(a)*55,life:.55,color});}}
  function update(dt) {
    elapsed+=dt;const speed=Math.min(2.15,1.03+elapsed*.012);angle+=speed*dt;
    radial+=(lane-radial)*Math.min(1,dt*22);
    nextSpawn-=dt;
    if(nextSpawn<=0){
      const targetLane=Math.random()<.5?0:1;
      // Hazards arrive one at a time, with at least 0.8 seconds between them.
      objects.push({angle:angle+1.8,lane:targetLane,type:'danger',done:false});
      objects.push({angle:angle+1.8,lane:1-targetLane,type:'star',done:false});
      nextSpawn=Math.max(.8,1.5-elapsed*.007)+Math.random()*.18;
    }
    const p=position(angle,radii[0]+radial*(radii[1]-radii[0]));
    for(const object of objects){
      if(object.done)continue;
      const o=position(object.angle,radii[object.lane]);
      const distance=Math.hypot(p.x-o.x,p.y-o.y);
      if(distance < (object.type==='danger'?18:23)) {
        object.done=true;
        if(object.type==='danger'){burst(p.x,p.y,'#ff6b81');end();return;}
        stars++;tone(760,.12);burst(o.x,o.y,'#ffca69');$('feedback').textContent='+5 ✦';feedbackUntil=elapsed+.6;
      }
    }
    objects=objects.filter(o=>!o.done && o.angle>angle-.45);
    score=Math.floor(elapsed)+stars*5;updateScore();
    if(elapsed>feedbackUntil)$('feedback').textContent='';
  }
  function dot(a,r,size,color,glow=0) {const p=position(a,r);ctx.shadowBlur=glow;ctx.shadowColor=color;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  function star(x,y,size) {ctx.fillStyle='#ffca69';ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;const r=i%2?size*.33:size;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
  function render(dt) {
    ctx.clearRect(0,0,width,height);
    // A quiet star chart gives the playfield depth without image downloads.
    ctx.fillStyle='#768797';for(let i=0;i<42;i++){const x=(i*137.37+31)%width,y=(i*79.31+17)%height;ctx.globalAlpha=.12+(i%3)*.05;ctx.fillRect(x,y,1,1);}ctx.globalAlpha=1;
    for(const r of radii){ctx.beginPath();ctx.arc(width/2,height/2,r,0,Math.PI*2);ctx.strokeStyle='#455349';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(width/2,height/2,r+5,0,Math.PI*2);ctx.strokeStyle='#3c49392a';ctx.stroke();}
    const demo=state==='ready';const a=demo?idle*.16-.6:angle;
    const r=demo?radii[1]:radii[0]+radial*(radii[1]-radii[0]);
    if(state!=='over'){
      for(let i=15;i>0;i--){ctx.globalAlpha=(1-i/16)*.27;dot(a-i*.022,r,Math.max(2,7-i*.28),'#c5f970');}ctx.globalAlpha=1;
      dot(a,r,9,'#c5f970',20);dot(a,r,3,'#f0ffc9');
    }
    const visible=demo?[{angle:2.5+idle*.04,lane:1,type:'danger'},{angle:4.05,lane:0,type:'danger'},{angle:.55,lane:0,type:'star'},{angle:5.4,lane:1,type:'star'}]:objects;
    for(const o of visible){if(o.done)continue;const p=position(o.angle,radii[o.lane]);if(o.type==='star'){star(p.x,p.y,10);}else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(o.angle+Math.PI/4);ctx.fillStyle='#ff6b81';ctx.shadowColor='#ff6b8160';ctx.shadowBlur=12;ctx.fillRect(-7,-7,14,14);ctx.restore();}}
    if(state!=='paused')for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.globalAlpha=Math.max(0,p.life/.55);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
  }
  function frame(now){const dt=Math.min((now-last)/1000 || 0,.033);last=now;if(!reducedMotion)idle+=dt;if(state==='playing')update(dt);render(dt);requestAnimationFrame(frame);}
  $('play').addEventListener('click',start);$('retry').addEventListener('click',start);$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);
  canvas.addEventListener('pointerdown',event=>{if(event.button===0){event.preventDefault();flip();}});
  // The central decoration must not swallow touches on the canvas.
  $('sound').addEventListener('click',()=>{muted=!muted;save('orbit-sound',muted?'off':'on');updateSound();tone(600);});
  $('language').addEventListener('change',event=>{lang=event.target.value;save('orbit-language',lang);translate();});
  document.addEventListener('keydown',event=>{
    if(event.target.tagName==='SELECT'||event.repeat)return;
    if(event.code==='Space'){event.preventDefault();if(state==='ready'||state==='over')start();else if(state==='paused')resume();else flip();}
    if(event.code==='KeyP'||event.code==='Escape'){event.preventDefault();state==='playing'?pause():resume();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('blur',pause);
  translate();updateScore();resize();requestAnimationFrame(frame);
})();
