const assert=require('node:assert/strict');
const {Game}=require('../engine.js');
function finishDrop(g){for(let i=0;i<80&&g.drop;i++)g.update(1/60);}
let g=new Game();g.reset();g.moving.x=130;g.tap();finishDrop(g);assert.equal(g.count,1);assert.equal(g.perfect,1);assert.equal(g.blocks.at(-1).w,220);
g.cooldown=0;g.moving.x=150;g.tap();finishDrop(g);assert.equal(g.blocks.at(-1).w,200);assert.equal(g.scraps.length,1);assert.equal(g.combo,0);
g.cooldown=0;g.moving.x=450;g.tap();finishDrop(g);assert.equal(g.state,'over');assert.equal(g.count,2);
g.reset();assert.equal(g.count,0);assert.equal(g.scraps.length,0);assert.equal(g.blocks.at(-1).w,220);
g.pause();const old=JSON.stringify(g);g.update(.03);assert.equal(JSON.stringify(g),old);assert.equal(g.tap(),false);g.resume();assert.equal(g.state,'playing');
for(let n=0;n<12;n++){g.cooldown=0;g.moving.x=g.blocks.at(-1).x;assert.equal(g.tap(),true);assert.equal(g.tap(),false);finishDrop(g);}assert.equal(g.state,'won');assert.equal(g.count,12);assert.equal(g.perfect,12);assert.equal(g.tap(),false);
const a=new Game(10),b=new Game(10);a.reset();b.reset();for(let i=0;i<80;i++){a.update(1/60);b.update(1/60);}assert.deepEqual(a,b);
const fs=require('node:fs'),vm=require('node:vm');const source=fs.readFileSync(require.resolve('../game.js'),'utf8');const chunk=source.slice(source.indexOf('const keys='),source.indexOf('const read='));const data=vm.runInNewContext(chunk+';({keys,translations})');for(const [lang,values]of Object.entries(data.translations)){assert.equal(values.length,data.keys.length,lang);assert(values.every(v=>typeof v==='string'&&v.length));}
console.log('PASS: perfect landing, clipping, miss, reset, pause, duplicate input, 12-layer win, deterministic replay, 5-language completeness.');
