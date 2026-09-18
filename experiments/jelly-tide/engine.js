(function(r,f){if(typeof module==='object')module.exports=f();else r.Bridge=f();})(typeof window!=='undefined'?window:this,function(){
'use strict';
const course=[[100,90],[145,72],[85,58],[170,64],[120,48],[160,46]];
class Game {
 constructor(){this.reset();this.state='ready';}
 reset(slow=false){this.slow=slow;this.time=0;this.count=0;this.perfect=0;this.current={x:10,w:120};this.next={x:230,w:90};this.nextBaseX=230;this.tideTime=0;this.camera=0;this.length=0;this.angle=0;this.playerX=108;this.playerY=480;this.phase=0;this.state='waiting';this.events=[];this.bridges=[];this.particles=[];this.result='';}
 emit(type){this.events.push({type,time:this.time,count:this.count,length:this.length});}
 tap(){if(this.state==='waiting'){this.state='growing';this.emit('grow');return true;}if(this.state==='growing'){this.state='falling';this.phase=0;this.emit('drop');return true;}return false;}
 pause(){if(['ready','over','won','paused'].includes(this.state))return false;this.beforePause=this.state;this.state='paused';return true;}
 resume(){if(this.state==='paused'){this.state=this.beforePause;return true;}return false;}
 update(dt){if(this.state==='paused')return;dt=Math.max(0,Math.min(dt,.034));this.time+=dt;
 if(this.state==='waiting'||this.state==='growing'){this.tideTime+=dt*(this.slow?.55:1);this.next.x=this.nextBaseX+Math.sin(this.tideTime*1.8)*30;}
 if(this.state==='growing')this.length=Math.min(320,this.length+dt*(this.slow?65:125));
 else if(this.state==='falling'){this.phase+=dt;this.angle=Math.min(Math.PI/2,this.phase/.48*Math.PI/2);if(this.phase>=.48){const end=this.current.x+this.current.w+this.length;this.success=end>=this.next.x&&end<=this.next.x+this.next.w;this.centered=this.success&&Math.abs(end-(this.next.x+this.next.w/2))<=8;this.walkTarget=this.success?this.next.x+this.next.w/2:end+20;this.state='crossing';}}
 else if(this.state==='crossing'){this.playerX=Math.min(this.walkTarget,this.playerX+dt*190);if(this.playerX>=this.walkTarget){if(!this.success){this.state='sinking';this.phase=0;this.result='miss';this.emit('miss');}else{this.count++;if(this.centered)this.perfect++;this.result=this.centered?'perfect':'land';this.emit(this.result);this.bridges.push({x:this.current.x+this.current.w,length:this.length});for(let i=0;i<20;i++)this.particles.push({x:this.playerX,y:445,vx:Math.sin(i*2.4)*100,vy:-60-i*5,life:1.2});if(this.count===6){this.state='won';this.emit('won');}else{this.old=this.current;this.current=this.next;const [gap,w]=course[this.count];this.next={x:this.current.x+this.current.w+gap,w};this.nextBaseX=this.next.x;this.tideTime=0;this.scrollFrom=this.camera;this.scrollTo=this.current.x+this.current.w-130;this.phase=0;this.state='scrolling';}}}}
 else if(this.state==='sinking'){this.phase+=dt;this.playerY=480+650*this.phase*this.phase;if(this.phase>.72)this.state='over';}
 else if(this.state==='scrolling'){this.phase+=dt;const a=Math.min(1,this.phase/.6),ease=a*a*(3-2*a);this.camera=this.scrollFrom+(this.scrollTo-this.scrollFrom)*ease;if(a===1){this.state='waiting';this.length=0;this.angle=0;this.playerX=this.current.x+this.current.w-22;}}
 for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);
 }
}
function rounded(c,x,y,w,h,r=12){c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function actor(c,x,y,t,move,still){const bounce=still?0:Math.sin(t*(move?18:4))*(move?4:1.5);c.save();c.translate(x,y+bounce);c.fillStyle='#684b9822';c.beginPath();c.ellipse(0,3,23,6,0,0,Math.PI*2);c.fill();c.fillStyle='#ac8bea';rounded(c,-22,-42,44,40,12);c.fillStyle='#d6c1fa';rounded(c,-22,-42,44,12,7);c.fillStyle='#49385c';c.beginPath();c.arc(-8,-21,2.4,0,7);c.arc(8,-21,2.4,0,7);c.fill();c.strokeStyle='#49385c';c.lineWidth=2;c.beginPath();c.arc(0,-18,4,0,Math.PI);c.stroke();c.restore();}
function render(c,g,w,h,opt={}){const scale=Math.min(w/480,h/720);c.fillStyle='#f9f3e9';c.fillRect(0,0,w,h);c.save();c.translate((w-scale*480)/2,(h-scale*720)/2);c.scale(scale,scale);
const bg=c.createLinearGradient(0,0,0,720);bg.addColorStop(0,'#faf3e9');bg.addColorStop(1,'#dcefeb');c.fillStyle=bg;c.fillRect(0,0,480,720);
c.fillStyle='#ffffff90';for(let i=0;i<4;i++){const x=((i*160-g.camera*.15)%650+650)%650-80;rounded(c,x,165+(i%2)*74,100,22,20);}
c.fillStyle='#9ccfc3';c.beginPath();c.moveTo(0,650);for(let x=0;x<=480;x+=12)c.lineTo(x,646+Math.sin(x/70+(opt.still?0:g.time)) *7);c.lineTo(480,720);c.lineTo(0,720);c.fill();
const platform=b=>{const x=b.x-g.camera;if(x>500||x+b.w<0)return;c.fillStyle='#d3ad8a';rounded(c,x,480,b.w,230,13);c.fillStyle='#83cbae';rounded(c,x-2,478,b.w+4,20,8);c.fillStyle='#bbecd3';rounded(c,x-2,474,b.w+4,9,4);c.fillStyle='#ffffff35';rounded(c,x+9,514,5,105,2);};if(g.old)platform(g.old);platform(g.current);platform(g.next);
for(const b of g.bridges){c.fillStyle='#dfaa65';rounded(c,b.x-g.camera,476,b.length,7,3);}
const origin=g.current.x+g.current.w-g.camera;
if(!['scrolling','won'].includes(g.state)){c.save();c.translate(origin,480);c.rotate(g.angle);c.fillStyle='#e4b56f';rounded(c,-4,-Math.max(1,g.length),8,Math.max(1,g.length),4);c.restore();}
if(['waiting','growing','paused'].includes(g.state)){const end=origin+g.length,inside=end>=g.next.x-g.camera&&end<=g.next.x+g.next.w-g.camera;c.setLineDash([4,5]);c.strokeStyle=inside?'#2c8269':'#9b87b0';c.lineWidth=2;c.beginPath();c.moveTo(origin,546);c.lineTo(end,546);c.stroke();c.setLineDash([]);c.fillStyle=inside?'#2c8269':'#9b87b0';c.beginPath();c.arc(end,546,5,0,7);c.fill();}
if(['waiting','growing','paused'].includes(g.state)){c.strokeStyle='#558b8d';c.lineWidth=2;c.setLineDash([3,4]);c.beginPath();c.moveTo(g.nextBaseX-g.camera-30,570);c.lineTo(g.nextBaseX+g.next.w-g.camera+30,570);c.stroke();c.setLineDash([]);c.fillStyle='#558b8d';c.textAlign='center';c.font='bold 17px sans-serif';const ax=g.next.x+g.next.w/2-g.camera;c.beginPath();c.moveTo(ax-12,594);c.lineTo(ax+12,594);c.moveTo(ax-7,589);c.lineTo(ax-12,594);c.lineTo(ax-7,599);c.moveTo(ax+7,589);c.lineTo(ax+12,594);c.lineTo(ax+7,599);c.stroke();}
const mid=g.next.x+g.next.w/2-g.camera;c.fillStyle='#fff9d6';rounded(c,mid-8,468,16,8,3);c.strokeStyle='#997044';c.lineWidth=2;c.beginPath();c.moveTo(mid,468);c.lineTo(mid,442);c.stroke();c.fillStyle='#e1a85c';c.beginPath();c.moveTo(mid,443);c.lineTo(mid+16,449);c.lineTo(mid,455);c.fill();
actor(c,g.playerX-g.camera,g.playerY,g.time,g.state==='crossing',opt.still);
if(!opt.still)for(const p of g.particles){c.globalAlpha=Math.min(1,p.life);c.fillStyle='#9980cb';c.fillRect(p.x-g.camera,p.y,5,5);}c.globalAlpha=1;
c.fillStyle='#4c3b60';c.textAlign='left';c.font='bold 44px sans-serif';c.fillText(String(g.count).padStart(2,'0'),30,78);c.font='16px sans-serif';c.fillText('/ 6',95,74);c.textAlign='right';c.fillStyle='#517d6c';c.font='bold 13px sans-serif';c.fillText(g.slow?'SLOW TIDE':'MOVING ISLAND',448,69);
if(g.result==='perfect'&&['scrolling','won'].includes(g.state)){c.textAlign='center';c.fillStyle='#397861';c.font='bold 24px sans-serif';c.fillText('PERFECT!',240,310);}if(g.state==='won'){c.textAlign='center';c.fillStyle='#4c3b60';c.font='bold 27px sans-serif';c.fillText('SWEET CROSSING!',240,350);}
c.restore();}
return {Game,render,course};});

