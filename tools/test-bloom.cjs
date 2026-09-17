const assert=require('node:assert/strict'),{Game}=require('../experiments/jelly-bloom/engine.js');
const g=new Game();g.reset();function land(offset){g.cooldown=0;g.moving.x=g.blocks.at(-1).x+offset;assert(g.tap());for(let i=0;i<80&&g.drop;i++)g.update(1/60);}
land(60);assert.equal(g.blocks.at(-1).w,160);land(0);land(0);assert.equal(g.blocks.at(-1).w,160);land(0);assert.equal(g.blocks.at(-1).w,196);assert.equal(g.lastResult,'bloom');assert.equal(g.blooms,1);
land(0);land(0);land(0);assert.equal(g.blocks.at(-1).w,220);assert.equal(g.blooms,2);land(24);assert.equal(g.combo,0);assert.equal(g.blocks.at(-1).w,196);
g.pause();const old=JSON.stringify(g);g.update(.03);assert.equal(JSON.stringify(g),old);assert(!g.tap());g.resume();while(g.count<12)land(0);assert.equal(g.state,'won');assert(g.blocks.every(b=>b.w<=220&&b.x>=5&&b.x+b.w<=475));g.reset();assert.equal(g.blooms,0);assert.equal(g.combo,0);
console.log('PASS bloom recovery at 3, cap 220, cut breaks streak, pause, win, bounds, reset.');
