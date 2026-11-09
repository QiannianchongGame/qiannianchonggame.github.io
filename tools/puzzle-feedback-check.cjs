'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {webkit}=require('playwright');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('const debug = {','const debug = { askPuzzle, renderScreen,').replace('return { add, boot, lang };','return { add, boot, lang, debug };');
(async()=>{
 const browser=await webkit.launch({headless:true});
 try{for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:950},hasTouch:width===390,isMobile:width===390});
  try{
   await context.addInitScript(()=>sessionStorage.setItem('y2k_author_note_seen','1'));
   await context.route('**/*',r=>r.request().url()==='http://feedback.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
   await p.goto('http://feedback.test/');await p.getByRole('button',{name:'新的调查',exact:true}).click();await p.getByRole('button',{name:'开始',exact:true}).click();await p.locator('.card').click();
   await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.fast(true);for(const x of d.D.dialogues)d.state.dlg[x.id]={done:1};d.state.dlgQ={};d.state.wait={};Object.assign(d.state.flags,{dlg_c0_d_hello:true,dlg_c0_d_bios:true});for(let i=2;i<=6;i++)d.state.flags['ch'+i]=true;});
   const submit=async(id,scope=p)=>{
    const q=await p.evaluate(id=>{const q=Y2K.debug.D.puzzles[id];return {kind:q.kind||'text',answer:q.answers?.[0],index:q._ai,set:q._as,fields:q.fields?.map(f=>f.answers[0])};},id);
    if(q.kind==='text'){await scope.locator('#pz_'+id).fill(q.answer);await scope.locator('#pz_'+id).press('Enter');}
    else{
     if(q.kind==='multi')for(let i=0;i<q.fields.length;i++)await scope.locator('#pz_'+id+'_'+i).fill(q.fields[i]);
     if(q.kind==='choice')await scope.locator('#pz_'+id+'_'+q.index).check();
     if(q.kind==='pick')for(const i of q.set)await scope.locator('#pz_'+id+'_'+i).check();
     await scope.getByRole('button',{name:'确定',exact:true}).click();
    }
   };
   const act=async locator=>width===390?locator.tap():locator.click();
   await act(p.getByRole('button',{name:'开机',exact:true}));await submit('c0_bios');
   await p.waitForTimeout(1300);assert(await p.locator('.bios-pass .msg.ok').isVisible(),'BIOS feedback must wait for the player');assert.equal(await p.locator('#pz_c0_login').count(),0);
   await act(p.locator('[data-puzzle-ack=c0_bios]'));await p.locator('#pz_c0_login').waitFor();await submit('c0_login');
   await p.waitForTimeout(1300);assert(await p.locator('.login98 .msg.ok').isVisible(),'login feedback must wait for the player');assert.equal(await p.evaluate(()=>!!Y2K.debug.state.flags.ch1),false,'chapter cannot advance while reading');
   assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('y2k_auto')).flags.solved_c0_login),'answer saves before acknowledgment');
   await act(p.locator('[data-puzzle-ack=c0_login]'));await p.locator('#desktop').waitFor();await p.locator('.card').waitFor();await act(p.locator('.card'));
   await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.state.chapter='ch6';for(const c of d.D.chapters)d.state.flags[c.id]=true;d.state.wait={};window.ackCount=0;});
   const ids=await p.evaluate(()=>Object.keys(Y2K.debug.D.puzzles));
   for(let i=0;i<ids.length;i++){
    const id=ids[i];await p.evaluate(id=>{const d=Y2K.debug;d.flush();d.closeOverlay();delete d.state.flags['solved_'+id];d.askPuzzle(id,()=>window.ackCount++);},id);
    await submit(id,p.locator('#modal'));
    await p.waitForTimeout(i===0?1300:60);
    assert(await p.locator('#modal .msg.ok').isVisible(),id+' success stays visible');
    assert.equal(await p.evaluate(()=>window.ackCount),i,id+' callback is deferred');
    await p.evaluate(()=>{window.heldForm=document.querySelector('#modal .pz');Y2K.debug.update();});
    assert(await p.locator('[data-puzzle-ack="'+id+'"]').isVisible(),id+' background refresh preserves feedback');
    if(i%4===0)await act(p.locator('[data-puzzle-ack="'+id+'"]'));
    else if(i%4===1)await act(p.locator('#modal .titlebar').getByRole('button',{name:'关闭',exact:true}));
    else if(i%4===2)await p.keyboard.press('Escape');
    else if(width===390)await p.locator('#modal .shade').tap({position:{x:2,y:2}});
    else await p.locator('#modal .shade').click({position:{x:2,y:2}});
    assert.equal(await p.locator('#modal .pz').count(),0,id+' closes by user action');
    await p.evaluate(()=>window.heldForm.acknowledge());assert.equal(await p.evaluate(()=>window.ackCount),i+1,id+' callback runs once');
   }
   // An inline administrator form also needs to retain its success text.
   await p.evaluate(()=>{const d=Y2K.debug;d.flush();delete d.state.flags.solved_c1_admin;d.openIE('/admin/');});
   await submit('c1_admin');await p.waitForTimeout(1300);assert(await p.locator('.bbs .msg.ok').isVisible());
   await p.evaluate(()=>{const d=Y2K.debug;d.update();d.wins().find(w=>w.key==='ie').refresh(true);});assert(await p.locator('[data-puzzle-ack=c1_admin]').isVisible());
   await act(p.locator('[data-puzzle-ack=c1_admin]'));assert.equal(await p.locator('#pz_c1_admin').count(),0,'administrator opens only after acknowledgment');
   assert.deepEqual(errors,[]);console.log(width+': PASS BIOS/login chapter transition, autosave before closing, all '+ids.length+' puzzle forms, 4 close methods, once-only callbacks and inline login');
  }finally{await context.close();}
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
