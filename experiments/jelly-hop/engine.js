(function(r,f){if(typeof module==='object')module.exports=f();else r.Hop=f();})(typeof window!=='undefined'?window:this,function(){
'use strict';
const course=[[100,90],[145,72],[85,58],[170,64],[120,48],[160,46]];
class Game{
constructor(){this.reset();this.state='ready';}
reset(slow=false){this.slow=slow;this.time=0;this.aimTime=0;this.range=70;this.count=0;this.perfect=0;this.current={x:10,w:120};this.next={x:230,w:90};this.old=null;this.camera=0;this.playerX=108;this.playerY=480;this.phase=0;this.state='waiting';this.events=[];this.particles=[];this.result='';}
emit(type){this.events.push({type,time:this.time,count:this.count,range:this.range});}
tap(){if(this.state!=='waiting')return false;this.startX=this.playerX;this.lockedRange=this.range;this.phase=0;this.state='flight';this.emit('jump');return true;}
pause(){if(['ready','over','won','paused'].includes(this.state))return false;this.beforePause=this.state;this.state='paused';return true;}
resume(){if(this.state!=='paused')return false;this.state=this.beforePause;return true;}
update(dt){if(['paused','ready','over'].includes(this.state))return;dt=Math.max(0,Math.min(.034,dt));this.time+=dt;
if(this.state==='waiting'){this.aimTime+=dt*(this.slow?.55:1);this.range=70+260*(1-Math.cos(this.aimTime*2.1))/2;}
else if(this.state==='flight'){this.phase+=dt;const a=Math.min(1,this.phase/1.05);this.playerX=this.startX+this.lockedRange*a;this.playerY=480-4*140*a*(1-a);if(a===1){this.success=this.playerX>=this.next.x&&this.playerX<=this.next.x+this.next.w;if(!this.success){this.state='sinking';this.phase=0;this.result='miss';this.emit('miss');}else{this.count++;const centered=Math.abs(this.playerX-(this.next.x+this.next.w/2))<=8;if(centered)this.perfect++;this.result=centered?'perfect':'land';this.emit(this.result);for(let i=0;i<20;i++)this.particles.push({x:this.playerX,y:445,vx:Math.sin(i*2.4)*100,vy:-60-i*5,life:1.2});this.phase=0;this.state=this.count===6?'won':'settling';if(this.state==='won')this.emit('won');}}}
else if(this.state==='settling'){this.phase+=dt;if(this.phase>=.35){this.old=this.current;this.current=this.next;const [gap,w]=course[this.count];this.next={x:this.current.x+this.current.w+gap,w};this.scrollFrom=this.camera;this.scrollTo=this.current.x+this.current.w-130;this.repositionFrom=this.playerX;this.phase=0;this.state='scrolling';}}
else if(this.state==='scrolling'){this.phase+=dt;const a=Math.min(1,this.phase/.65),ease=a*a*(3-2*a);this.camera=this.scrollFrom+(this.scrollTo-this.scrollFrom)*ease;this.playerX=this.repositionFrom+(this.current.x+this.current.w-22-this.repositionFrom)*ease;if(a===1){this.state='waiting';this.aimTime=0;this.range=70;}}
else if(this.state==='sinking'){this.phase+=dt;this.playerY=480+650*this.phase*this.phase;if(this.phase>.72)this.state='over';}
for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);
}}
function rounded(c,x,y,w,h,r=12){c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function actor(c,x,y,t,move,still){const bounce=still?0:Math.sin(t*(move?18:4))*(move?4:1.5);c.save();c.translate(x,y+bounce);c.fillStyle='#684b9822';c.beginPath();c.ellipse(0,3,23,6,0,0,Math.PI*2);c.fill();c.fillStyle='#ac8bea';rounded(c,-22,-42,44,40,12);c.fillStyle='#d6c1fa';rounded(c,-22,-42,44,12,7);c.fillStyle='#49385c';c.beginPath();c.arc(-8,-21,2.4,0,7);c.arc(8,-21,2.4,0,7);c.fill();c.strokeStyle='#49385c';c.lineWidth=2;c.beginPath();c.arc(0,-18,4,0,Math.PI);c.stroke();c.restore();}
function render(c,g,w,h,opt={}){const scale=Math.min(w/480,h/720);c.fillStyle='#f9f3e9';c.fillRect(0,0,w,h);c.save();c.translate((w-scale*480)/2,(h-scale*720)/2);c.scale(scale,scale);
const bg=c.createLinearGradient(0,0,0,720);bg.addColorStop(0,'#faf3e9');bg.addColorStop(1,'#dcefeb');c.fillStyle=bg;c.fillRect(0,0,480,720);
c.fillStyle='#ffffff90';for(let i=0;i<4;i++){const x=((i*160-g.camera*.15)%650+650)%650-80;rounded(c,x,165+(i%2)*74,100,22,20);}
c.fillStyle='#9ccfc3';c.beginPath();c.moveTo(0,650);for(let x=0;x<=480;x+=12)c.lineTo(x,646+Math.sin(x/70+(opt.still?0:g.time)) *7);c.lineTo(480,720);c.lineTo(0,720);c.fill();
const platform=b=>{const x=b.x-g.camera;if(x>500||x+b.w<0)return;c.fillStyle='#d3ad8a';rounded(c,x,480,b.w,230,13);c.fillStyle='#83cbae';rounded(c,x-2,478,b.w+4,20,8);c.fillStyle='#bbecd3';rounded(c,x-2,474,b.w+4,9,4);c.fillStyle='#ffffff35';rounded(c,x+9,514,5,105,2);};if(g.old)platform(g.old);platform(g.current);platform(g.next);
if(['waiting','paused'].includes(g.state)){const end=g.playerX+g.range,inside=end>=g.next.x&&end<=g.next.x+g.next.w;c.fillStyle=inside?'#327d66':'#9676be';for(let i=1;i<=20;i++){const a=i/20;c.beginPath();c.arc(g.playerX-g.camera+g.range*a,480-4*140*a*(1-a),i===20?7:3,0,Math.PI*2);c.fill();}c.strokeStyle=c.fillStyle;c.lineWidth=2;c.beginPath();c.ellipse(end-g.camera,480,12,5,0,0,Math.PI*2);c.stroke();}
const mid=g.next.x+g.next.w/2-g.camera;c.fillStyle='#fff9d6';rounded(c,mid-8,468,16,8,3);c.strokeStyle='#997044';c.lineWidth=2;c.beginPath();c.moveTo(mid,468);c.lineTo(mid,442);c.stroke();c.fillStyle='#e1a85c';c.beginPath();c.moveTo(mid,443);c.lineTo(mid+16,449);c.lineTo(mid,455);c.fill();
actor(c,g.playerX-g.camera,g.playerY,g.time,g.state==='flight',opt.still);
if(!opt.still)for(const p of g.particles){c.globalAlpha=Math.min(1,p.life);c.fillStyle='#9980cb';c.fillRect(p.x-g.camera,p.y,5,5);}c.globalAlpha=1;
c.fillStyle='#4c3b60';c.textAlign='left';c.font='bold 44px sans-serif';c.fillText(String(g.count).padStart(2,'0'),30,78);c.font='16px sans-serif';c.fillText('/ 6',95,74);c.textAlign='right';c.fillStyle='#517d6c';c.font='bold 13px sans-serif';c.fillText(g.slow?'SLOW AIM':'TAP TO HOP',448,69);
if(g.result==='perfect'&&['scrolling','won'].includes(g.state)){c.textAlign='center';c.fillStyle='#397861';c.font='bold 24px sans-serif';c.fillText('PERFECT!',240,310);}if(g.state==='won'){c.textAlign='center';c.fillStyle='#4c3b60';c.font='bold 27px sans-serif';c.fillText('HAPPY LANDINGS!',240,350);}
c.restore();}
return {Game,render,course};});
