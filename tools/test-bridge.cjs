const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),{Game}=require('../experiments/jelly-bridge/engine.js');
function settle(g){for(let n=0;n<1500&&!['waiting','won','over'].includes(g.state);n++)g.update(1/60);}
function cross(g,length){assert(g.tap());g.length=length;assert(g.tap());assert(!g.tap());settle(g);}
let g=new Game();g.reset();cross(g,145);assert.equal(g.count,1);assert.equal(g.perfect,1);assert.equal(g.state,'waiting');assert.equal(g.camera,g.current.x+g.current.w-130);
for(const length of [0,99,191,320]){g.reset();cross(g,length);assert.equal(g.state,'over');assert.equal(g.count,0);}
for(const length of [100,190]){g.reset();cross(g,length);assert.equal(g.count,1);}
g.reset();g.tap();g.update(.02);g.pause();const frozen=JSON.stringify(g);g.update(1);assert.equal(JSON.stringify(g),frozen);assert(!g.tap());g.resume();assert.equal(g.state,'growing');g.update(.03);assert(g.length>0);
g.reset(true);g.tap();for(let i=0;i<60;i++)g.update(1/60);assert(Math.abs(g.length-65)<.01);g.reset();g.tap();for(let i=0;i<1000;i++)g.update(1/60);assert.equal(g.length,320);
g.reset();for(let n=0;n<6;n++)cross(g,g.next.x+g.next.w/2-g.current.x-g.current.w);assert.equal(g.state,'won');assert.equal(g.count,6);assert.equal(g.perfect,6);assert(!g.tap());g.reset();assert.equal(g.events.length,0);assert.equal(g.count,0);
const src=fs.readFileSync(require.resolve('../experiments/jelly-bridge/game.js'),'utf8');const t=vm.runInNewContext(src.slice(src.indexOf('const strings='),src.indexOf('const read='))+';strings');for(const v of Object.values(t))assert.equal(v.length,18);
console.log('PASS: bridge endpoints, misses, center reward, all six stages, camera, pause, growth speeds/cap, input locking, reset, five languages.');
