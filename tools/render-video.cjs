// Render a deterministic input replay through the exact shipped engine, at 1x speed.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{once}=require('node:events');
const {createCanvas,GlobalFonts}=require('C:/Users/ayura/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const {Game,render}=require('../engine.js');
const out=path.resolve(process.argv[2]||'../campaigns/2026-09-17-jelly-tower');fs.mkdirSync(out,{recursive:true});
const ffmpeg=process.argv[3];if(!ffmpeg)throw Error('Pass ffmpeg executable path as argument 3');
GlobalFonts.registerFromPath('C:/Windows/Fonts/arialbd.ttf','Campaign');
const fps=30,W=1080,H=1920,c=createCanvas(W,H),ctx=c.getContext('2d'),surface=createCanvas(480,800),sc=surface.getContext('2d');
const g=new Game(917);g.reset();const targets=[0,0,0,18,-14,0,0,20,0,-9,0,260];let finishAt=null;const taps=[],frames=[];
// Record input times first. No changes to physics, scores or outcomes.
for(let frame=0;frame<fps*50;frame++){
 for(let sub=0;sub<2;sub++){if(g.state==='playing'&&!g.drop&&g.cooldown<=0){const top=g.blocks.at(-1),offset=targets[g.count];const target=offset===260?5:top.x+offset;if(Math.abs(g.moving.x-target)<g.speed/60+.2){if(g.tap())taps.push(g.time);}}g.update(1/60);}
 if(g.state==='over'&&finishAt===null)finishAt=g.time+1.8;
 if(finishAt&&g.time>=finishAt)break;
}
if(g.state!=='over')throw Error('Replay must reach a real miss');
const duration=g.time,events=g.events;
fs.writeFileSync(path.join(out,'replay.json'),JSON.stringify({seed:917,fps,duration,taps,events,description:'Scripted inputs using the released game simulation at real time; no fabricated score.'},null,2));
// Original synthesized pop sounds; no third-party music.
const rate=48000,samples=Math.ceil(duration*rate),wav=Buffer.alloc(44+samples*2);wav.write('RIFF');wav.writeUInt32LE(36+samples*2,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*2,40);
for(const e of events){const f=e.type==='miss'?100:e.type==='cut'?230:e.type==='tap'?330:520+(e.count%5)*90;const len=e.type==='miss'?.4:.16;for(let j=0;j<len*rate;j++){const i=Math.floor(e.time*rate)+j;if(i>=samples)break;const t=j/rate,v=Math.sin(2*Math.PI*f*t)*Math.exp(-t*23)*.18;const prev=wav.readInt16LE(44+i*2);wav.writeInt16LE(Math.max(-32767,Math.min(32767,prev+Math.round(v*32767))),44+i*2);}}
fs.writeFileSync(path.join(out,'pops.wav'),wav);
const startFrame=210;
const proc=spawn(ffmpeg,['-y','-f','rawvideo','-pix_fmt','rgba','-s',W+'x'+H,'-r',String(fps),'-i','pipe:0','-ss',String(startFrame/fps),'-i',path.join(out,'pops.wav'),'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-shortest',path.join(out,'jelly-tower-001.mp4')],{stdio:['pipe','ignore','pipe'],windowsHide:true});let err='';proc.stderr.on('data',b=>{err+=b.toString();if(err.length>8000)err=err.slice(-8000);});proc.stdin.on('error',()=>{});
function label(text,x,y,size,color='#49374e'){ctx.fillStyle=color;ctx.font='bold '+size+'px Campaign, sans-serif';ctx.textAlign='center';ctx.fillText(text,x,y);}
(async()=>{g.reset();let next=0;const total=Math.ceil(duration*fps);
for(let frame=0;frame<total;frame++){
 for(let sub=0;sub<2;sub++){if(next<taps.length&&g.time>=taps[next]-.00001){g.tap();next++;}g.update(1/60);}
 if(frame<startFrame)continue;
 render(sc,g,480,800);ctx.fillStyle='#fcf6eb';ctx.fillRect(0,0,W,H);ctx.drawImage(surface,0,-220,1080,1800);
 label('CAN YOU STACK 12?',540,195,64);label('JELLY TOWER',540,268,26,'#9f84bb');
 ctx.textAlign='left';ctx.fillStyle='#5e4868';ctx.font='bold 90px Campaign';ctx.fillText(String(g.count).padStart(2,'0'),115,442);ctx.font='28px Campaign';ctx.fillStyle='#a18aa0';ctx.fillText('/ 12',242,437);
 const caption=g.state==='over'?'SO CLOSE. YOUR TURN.':g.count<3?'TAP. STACK. WOBBLE.':g.count<7?'DON’T LOSE YOUR JELLY.':'ONE MORE LAYER…';
 ctx.fillStyle='#fcf6ebeb';ctx.beginPath();ctx.roundRect(90,1620,900,135,30);ctx.fill();label(caption,540,1678,38);label('Free browser game · K_games',540,1726,25,'#91778c');
 label('mrbeside.github.io/orbit-flip',540,1820,29,'#81638f');
 if(frame===Math.floor(total*.55)){fs.writeFileSync(path.join(out,'cover.png'),c.toBuffer('image/png'));}
 if([startFrame,Math.floor(total*.5),total-10].includes(frame))fs.writeFileSync(path.join(out,'qa-'+frame+'.png'),c.toBuffer('image/png'));
 const bytes=Buffer.from(ctx.getImageData(0,0,W,H).data);if(!proc.stdin.write(bytes))await once(proc.stdin,'drain');if(frame%180===0)console.log('Rendered '+frame+'/'+total);
}
proc.stdin.end();const [code]=await once(proc,'close');if(code)throw Error(err);console.log(JSON.stringify({duration,frames:total,score:g.count,state:g.state,output:path.join(out,'jelly-tower-001.mp4')}));})().catch(e=>{console.error(e);proc.kill();process.exitCode=1;});
