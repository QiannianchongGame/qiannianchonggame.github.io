'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require(require.resolve('playwright',{paths:[__dirname,'D:/Users/shark/Desktop/千年虫2/tools']}));
const root=path.resolve(__dirname,'..'),release=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=release.replace('const debug = {','const debug = { askPuzzle, gxSearch, showEnding,').replace('return { add, boot, lang };','return { add, boot, lang, debug };');
const output=path.join(root,'test-results/input-touch');fs.mkdirSync(output,{recursive:true});
const report=[];
async function run(browser,label,viewport){
 const context=await browser.newContext({viewport,isMobile:true,hasTouch:true});
 await context.addInitScript(()=>{
  sessionStorage.setItem('y2k_author_note_seen','1');
  window.cancelInputDefault=false;
  // Model iPad gestures for which no native click/focus follows touchend.
  window.addEventListener('touchend',e=>{if(window.cancelInputDefault&&e.target.closest('input,textarea'))e.preventDefault();},{capture:true,passive:false});
 });
 await context.route('http://input.test/',r=>r.fulfill({contentType:'text/html',body:html}));
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);
 try{
  await p.goto('http://input.test/');await p.getByRole('button',{name:'新的调查',exact:true}).tap();
  await p.locator('#nick').tap();await p.keyboard.insertText('平板测试');assert.equal(await p.locator('#nick').inputValue(),'平板测试');
  await p.getByRole('button',{name:'开始',exact:true}).tap();await p.locator('.card').tap();
  await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.state.stage='win';d.state.chapter='ch1';Object.assign(d.state.flags,{ch0:true,ch1:true,solved_c0_bios:true,solved_c0_login:true});for(const x of d.D.dialogues)d.state.dlg[x.id]={done:1};d.state.dlgQ={};localStorage.setItem('y2k_auto',JSON.stringify(d.state));});
  await p.reload();await p.getByRole('button',{name:'继续调查',exact:true}).tap();
  await p.locator('#icons .icon').filter({hasText:'梧桐树下'}).tap();
  const ie=p.locator('.win').filter({has:p.locator('#ieaddr')});await ie.locator('.bbs .nav a[href="/admin/"]').tap();
  const password=p.locator('#pz_c1_admin');
  await password.evaluate(el=>{window.originalPassword=el;el.blur();window.cancelInputDefault=true;});
  await password.tap();assert(await password.evaluate(el=>document.activeElement===el),'Input must focus during trusted touchend even when the browser does not generate a click');
  await p.keyboard.insertText('first-draft');assert.equal(await password.inputValue(),'first-draft');
  // Background chat and evidence refreshes must retain the exact input node,
  // its current draft, focus and selection while the player is typing.
  await p.evaluate(()=>{const d=Y2K.debug;d.setFlag('_input_refresh_test');d.update();});await p.waitForTimeout(500);
  assert(await p.evaluate(()=>window.originalPassword.isConnected&&document.activeElement===window.originalPassword));assert.equal(await password.inputValue(),'first-draft');
  await p.evaluate(()=>window.cancelInputDefault=false);
  await password.evaluate(el=>{const r=el.getBoundingClientRect(),point={identifier:801,clientX:r.x+8,clientY:r.y+8};window.holdPoint=point;const e=new Event('touchstart',{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:[point]});el.dispatchEvent(e);});
  await p.waitForTimeout(650);assert.equal(await p.locator('.ctx').count(),0,'Long-pressing an input must retain native selection/paste instead of opening desktop context menu');
  await password.evaluate(el=>{const e=new Event('touchend',{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:[]});Object.defineProperty(e,'changedTouches',{value:[window.holdPoint]});el.dispatchEvent(e);});
  // Enter during Chinese/Japanese IME composition must not submit the answer.
  await password.evaluate(el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true})));
  assert.equal(await ie.locator('.msg').innerText(),'');
  await password.selectText();await p.keyboard.insertText(await p.evaluate(()=>Y2K.debug.D.puzzles.c1_admin.answers[0]));await p.keyboard.press('Enter');
  await p.waitForFunction(()=>Y2K.debug.state.flags.solved_c1_admin);
  // Address, forum search and both administrator log filters use actual controls.
  for(const selector of ['#ieaddr']){await p.locator(selector).tap();assert(await p.locator(selector).evaluate(el=>document.activeElement===el));}
  await p.evaluate(()=>Y2K.debug.ieGo('http://192.168.1.103/search.asp'));await p.locator('#bbsq').tap();assert(await p.locator('#bbsq').evaluate(el=>document.activeElement===el),'forum search focus: '+await p.evaluate(()=>document.activeElement?.outerHTML));await p.keyboard.insertText('夏至');assert.equal(await p.locator('#bbsq').inputValue(),'夏至');
  await p.evaluate(()=>{const d=Y2K.debug;for(const token of (d.D.adminSections.logs||'').match(/[a-zA-Z0-9_]+/g)||[])d.state.flags[token]=true;d.ieGo('http://192.168.1.103/admin/log.asp');});
  for(const [selector,value]of [['#lgu','wanfeng'],['#lgd','2000-01-01']]){await p.locator(selector).tap();await p.keyboard.insertText(value);assert.equal(await p.locator(selector).inputValue(),value);}
  // Every production text/multi-field puzzle, including BIOS, restored files,
  // archive passwords and phone answers, must accept input by tap + typing.
  const puzzles=await p.evaluate(()=>Object.entries(Y2K.debug.D.puzzles).filter(([,p])=>!p.kind||['text','multi'].includes(p.kind)).map(([id])=>id));let fields=0;
  for(const id of puzzles){
   await p.evaluate(id=>{Y2K.debug.flush();Y2K.debug.askPuzzle(id);},id);
   const inputs=p.locator('#modal input[type="text"]');for(let i=0;i<await inputs.count();i++){
    const input=inputs.nth(i);await input.tap();assert(await input.evaluate(el=>document.activeElement===el),id+' focus');await p.keyboard.insertText('输入-test');assert.equal(await input.inputValue(),'输入-test',id+' typed value');fields++;
   }await p.evaluate(()=>Y2K.debug.closeModal());
  }
  await p.evaluate(()=>Y2K.debug.gxSearch(Y2K.debug.wins().find(w=>w.key==='ie')));await p.locator('#gxq').tap();await p.keyboard.insertText('晚风');assert.equal(await p.locator('#gxq').inputValue(),'晚风');await p.evaluate(()=>Y2K.debug.closeModal());
  await p.evaluate(()=>{const d=Y2K.debug;d.ui.tab='notes';d.ui.noteTab='clues';d.renderPhone();});
  await p.locator('.ph-note-tabs').getByRole('button',{name:/线索/}).tap();
  const notes=p.getByRole('searchbox',{name:'搜索 线索'});await notes.tap();await p.keyboard.insertText('线索测试');assert.equal(await notes.inputValue(),'线索测试');
  await p.locator('#phTabs button').nth(2).tap();const items=p.getByRole('searchbox',{name:'搜索 物品'});await items.tap();await p.keyboard.insertText('物品测试');assert.equal(await items.inputValue(),'物品测试');
  await p.evaluate(()=>{const d=Y2K.debug;d.ui.tab='menu';d.ui.menuView='code';d.renderPhone();});
  const save=p.locator('#loadCode');await save.tap();await p.keyboard.insertText('存档草稿');await p.evaluate(()=>Y2K.debug.renderPhone());assert.equal(await save.inputValue(),'存档草稿');assert(await save.evaluate(el=>el===document.activeElement));
  assert(await p.locator('#saveCode').evaluate(el=>el.readOnly&&el.value.length>0));
  await p.getByRole('button',{name:'返回标题画面',exact:true}).tap();await p.getByRole('button',{name:'读取存档',exact:true}).tap();
  await p.locator('#titleCode').tap();await p.keyboard.insertText('导入草稿');assert.equal(await p.locator('#titleCode').inputValue(),'导入草稿');await p.locator('.title-panel-close').tap();
  await p.getByRole('button',{name:'继续调查',exact:true}).tap();await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.showEnding('A');});
  const review=p.locator('#finish-review-input');await review.tap();await p.keyboard.insertText('平板留言测试');assert.equal(await review.inputValue(),'平板留言测试');
  await p.screenshot({path:path.join(output,label+'-'+viewport.width+'.png')});assert.deepEqual(errors,[]);
  report.push({browser:label,viewport,passed:true,puzzleForms:puzzles.length,textFields:fields,checks:['trusted touch focus without click','native input long press','background refresh retains draft','IME composition','admin login','address and search','log filters','all text puzzles','chat search','nickname','phone clue and item search','save-code textareas and read-only copy','title import textarea','ending review textarea']});
 }finally{await context.close();}
}
(async()=>{for(const[label,type,opts]of [['WebKit',webkit,{}],['Edge',chromium,{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}]]){const b=await type.launch({headless:true,...opts});try{for(const viewport of [{width:1366,height:1024},{width:1024,height:1366}])await run(b,label,viewport);}finally{await b.close();}}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));});
