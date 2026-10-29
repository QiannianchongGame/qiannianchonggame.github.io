// 中文剧情、渐进呈现、可选阅读、结局及真实触屏窗口操作。
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const release=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const html=release.replace('return { add, boot, lang };','return { add, boot, lang, debug };');
async function game(browser,mobile=true){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:950},hasTouch:mobile,isMobile:mobile});
 // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
 await context.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
 await context.route('http://wyjm.test/story',r=>r.fulfill({contentType:'text/html',body:html}));
 const p=await context.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://wyjm.test/story');await p.getByRole('button',{name:'新的调查',exact:true}).click();await p.getByRole('button',{name:'开始',exact:true}).click();await p.locator('.card').click();
 await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.state.stage='win';d.state.chapter='ch1';Object.assign(d.state.flags,{ch0:true,ch1:true,solved_c0_bios:true,solved_c0_login:true});for(const x of d.D.dialogues){d.state.dlg[x.id]={done:1};}d.state.dlgQ={};localStorage.setItem('y2k_auto',JSON.stringify(d.state));});
 await p.reload();await p.getByRole('button',{name:'继续调查',exact:true}).click();return{context,p,errors};
}
async function presentation(browser,name){
 const {context,p,errors}=await game(browser);await p.locator('#phoneFab').tap();await p.locator('#phTabs button').nth(3).tap();
 assert(await p.locator('.ph-journal').isVisible());assert((await p.locator('.ph-journal').innerText()).includes('林晚的旧事在电脑里留下了哪些记录'));
 assert(!(await p.locator('#phBody').innerText()).includes('韩立是林晚的父亲'));
 await p.locator('.ph-note-tabs').getByRole('button',{name:/旧事/}).tap();assert.equal(await p.locator('.ph-reading-tile').count(),0);
 await p.evaluate(()=>{Y2K.debug.state.flags.solved_c1_gexun=true;Y2K.debug.renderPhone();});
 assert.equal(await p.locator('.ph-reading-tile').count(),1);const before=await p.evaluate(()=>Y2K.debug.state.newNotes);
 await p.locator('.ph-reading-tile').tap();assert(await p.locator('.ph-reading svg[data-photo="deskmates"]').isVisible());
 if(process.env.STORY_SCREENSHOT)await p.locator('#phone').screenshot({path:path.join(process.env.STORY_SCREENSHOT,name+'-story-reading.png')});
 assert((await p.locator('.ph-reading').innerText()).includes('不许登校刊'));assert.equal(await p.evaluate(()=>Y2K.debug.state.newNotes),before);
 await p.getByRole('button',{name:'返回',exact:true}).tap();assert.equal(await p.locator('.ph-reading-tile small').innerText(),'已读');
 await p.evaluate(()=>{const d=Y2K.debug;d.flush();Object.assign(d.state.flags,{ch2:true,ch3:true,ch4:true,ch5:true});d.state.chapter='ch5';d.state.notes=['c0_n_tag','c2_n_notes','c5_n_letter'];d.state.noteCh={c0_n_tag:'ch5',c2_n_notes:'ch5',c5_n_letter:'ch5'};d.ui.noteTab='clues';d.ui.clueScope='all';d.renderPhone();});
 assert.equal(await p.locator('.ph-clue-group').count(),3);
 const groups=await p.locator('.ph-clue-group').evaluateAll(xs=>xs.map(x=>({label:x.querySelector('summary').textContent,open:x.open})));
 assert(groups.find(x=>x.label.includes('第五章')).open);assert(!groups.find(x=>x.label.includes('第二章')).open);
 await p.getByRole('combobox',{name:'线索范围'}).selectOption('ch2');await p.locator('[data-note="c2_n_notes"]').getByRole('button',{name:'查看原件'}).tap();
 assert(await p.locator('.win.active .titlebar').isVisible());assert.equal(await p.locator('#phone').evaluate(x=>x.classList.contains('open')),false);
 const win=p.locator('.win.active');let button=win.getByRole('button',{name:'还原',exact:true});
 const size=await button.boundingBox();assert(size.width>=44&&size.height>=36,'触屏窗口按钮需有足够点击面积');
 for(let i=0;i<5;i++){
  await win.getByRole('button',{name:'还原',exact:true}).tap({position:{x:5,y:5}});assert(!(await win.evaluate(x=>x.classList.contains('max'))));
  await win.getByRole('button',{name:'最大化',exact:true}).tap({position:{x:38,y:28}});assert(await win.evaluate(x=>x.classList.contains('max')));
 }
 await win.getByRole('button',{name:'最小化',exact:true}).tap();assert.equal(await win.isVisible(),false);
 await p.locator('#tasks .task').filter({hasText:'12.31.txt'}).tap();assert(await win.isVisible());
 await win.getByRole('button',{name:'关闭',exact:true}).tap({position:{x:38,y:28}});assert.equal(await p.locator('.win').count(),0);
 assert.deepEqual(errors,[]);await context.close();console.log(name+': 章节方向、旧事开放、无阅读负担、来源回看与触屏按钮通过');
}
async function ending(browser,name,route){
 const {context,p,errors}=await game(browser);
 await p.evaluate(()=>{
  const d=Y2K.debug;d.flush();d.fast(true);d.state.chapter='ch6';
  for(let i=0;i<=6;i++)d.state.flags['ch'+i]=true;
  Object.assign(d.state.flags,{seen_c6_f_letter:true,solved_c6_p_zip:true});
  for(const id of ['c6_d_choice','c6_d_end_b','c6_d_xuning2','c6_d_confront','c6_d_xuning3'])delete d.state.dlg[id];
  d.state.dlgQ={};d.ui.tab='msg';d.ui.chat='heman';d.update();
 });
 await p.locator('#phoneFab').tap();await p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='choice');
 const options=p.locator('#phFoot button');await options.nth(route==='B'?0:1).tap();
 if(route==='C'){
  await p.locator('#phTabs button').nth(0).tap(); await p.locator('.ph-item').filter({has:p.locator('b',{hasText:/^许宁$/})}).tap();
  await p.waitForFunction(()=>Y2K.debug.state.wait.xuning?.type==='reply'); await p.locator('#phFoot button').tap();
  await p.waitForFunction(()=>Y2K.debug.state.wait.xuning?.type==='reply'); await p.locator('#phFoot button').tap();
  await p.locator('#phTabs button').nth(0).tap(); await p.locator('.ph-item').filter({has:p.locator('b',{hasText:/^何蔓$/})}).tap();
  await p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='puzzle');await p.locator('#phFoot button').tap();
  const answers=await p.evaluate(()=>Y2K.debug.D.puzzles.c6_p_evidence.answerSet);
  for(const answer of answers)await p.getByRole('checkbox',{name:answer,exact:true}).check();
  await p.locator('#modal').getByRole('button',{name:'确定',exact:true}).tap();
  await p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='choice');await p.locator('#phFoot button').first().tap();
 }
 await p.locator('.ending').waitFor({state:'visible'});assert.equal(await p.locator('.ending h1').innerText(),route==='C'?'归零':'格式化');
 if(await p.locator('.finish-review').count())await p.locator('.finish-review-skip').tap();
 if(route==='C'){
  assert((await p.locator('.ending').innerText()).includes('6 月 21 日'));
  await p.getByRole('button',{name:'回到 3 号机',exact:true}).tap();
  await p.locator('#phTabs button').nth(3).tap();await p.locator('.ph-note-tabs').getByRole('button',{name:/旧事/}).tap();
  assert((await p.locator('#phBody').innerText()).includes('日记旁的一页纸'));
  await p.evaluate(()=>{const d=Y2K.debug;d.state.collected=Object.keys(d.D.collectibles);d.state.flags.collected_all=true;d.openIE('/user.asp?id=wanfeng');});
  await p.getByRole('button',{name:'收起',exact:true}).tap();
  await p.locator('.bbs').getByRole('button',{name:'草稿箱（1）',exact:true}).tap();
  await p.locator('#pz_c6_p_wanfeng').fill('820916');await p.locator('#modal').getByRole('button',{name:'确定',exact:true}).tap();
  await p.locator('.ending').waitFor({state:'visible'});assert.equal(await p.locator('.ending h1').innerText(),'晚风');
  if(await p.locator('.finish-review').count())await p.locator('.finish-review-skip').tap();
  await p.getByRole('button',{name:'回到 3 号机',exact:true}).tap();
  assert(await p.evaluate(()=>Y2K.debug.state.flags.ending_H&&Y2K.debug.test(Y2K.debug.D.mails.find(m=>m.id==='story_delivered_draft').requires)));
 }
 assert.deepEqual(errors,[]);await context.close();console.log(name+': 真实对质作答与结局 '+route+' 通过');
}

async function endingA(browser,name){
 const {context,p,errors}=await game(browser);
 await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.fast(true);d.state.chapter='ch4';for(let i=0;i<=4;i++)d.state.flags['ch'+i]=true;d.state.flags.board_c4_final=true;delete d.state.dlg.c4_d_close;d.state.dlgQ={};d.ui.tab='msg';d.ui.chat='heman';d.update();});
 await p.locator('#phoneFab').tap();await p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='reply');await p.locator('#phFoot button').tap();
 await p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='choice');await p.locator('#phFoot button').first().tap();
 await p.locator('.ending').waitFor({state:'visible'});assert.equal(await p.locator('.ending h1').innerText(),'替罪羊');assert.deepEqual(errors,[]);await context.close();console.log(name+': 结局 A 实际选择通过');
}

async function perspective(browser,name){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
 await context.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
 await context.route('http://wyjm.test/story',r=>r.fulfill({contentType:'text/html',body:html}));
 const p=await context.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://wyjm.test/story');await p.evaluate(()=>Y2K.debug.fast(true));
 await p.getByRole('button',{name:'新的调查',exact:true}).click();await p.getByRole('button',{name:'开始',exact:true}).click();await p.locator('.card').click();
 await p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='evidence');
 await p.locator('#phoneFab').tap();await p.locator('#phTabs button').nth(0).tap();await p.locator('.ph-item').filter({hasText:'何蔓'}).tap();
 assert.equal(await p.getByRole('button',{name:'信我看了。',exact:true}).count(),0,'未读信不能声称已读');
 assert.equal(await p.evaluate(()=>!!Y2K.debug.state.flags.seen_c0_it_letter),false);
 await p.locator('#phFoot').getByRole('button',{name:'查看原件',exact:true}).tap();
 assert((await p.locator('#phBody').innerText()).includes('这个网名'));
 await p.locator('#phTabs button').nth(0).tap();await p.locator('.ph-item').filter({hasText:'何蔓'}).tap();
 await p.getByRole('button',{name:'信我看了。',exact:true}).tap();
 assert(await p.evaluate(()=>Y2K.debug.state.flags.seen_c0_it_letter));assert.deepEqual(errors,[]);await context.close();

 const g=await game(browser);await g.p.evaluate(()=>{const d=Y2K.debug;d.flush();d.fast(true);d.state.flags.board_c1_final=true;delete d.state.flags.dlg_c1_d_end;delete d.state.dlg.c1_d_end;d.state.dlgQ={};d.ui.tab='msg';d.ui.chat='heman';d.update();});
 await g.p.waitForFunction(()=>Y2K.debug.state.wait.heman?.type==='reply');assert.equal(await g.p.evaluate(()=>Y2K.debug.state.chapter),'ch1','收尾回复前不得跨日');
 await g.p.locator('#phoneFab').tap();await g.p.locator('#phFoot button').tap();
 await g.p.waitForFunction(()=>Y2K.debug.state.chapter==='ch2');
 const last=await g.p.evaluate(()=>Y2K.debug.state.chat.heman.filter(m=>m.ref?.d==='c1_d_end').at(-1));assert(last.at.startsWith('10月27日'),'昨晚的告别须保留昨晚的日期');
 assert.deepEqual(g.errors,[]);await g.context.close();
 for(const [id,chapter,source] of [['c5_d_xuning1',5,'c4_m_xuning1'],['c6_d_xuning1',6,'c5_f_zip']]){
  const h=await game(browser);await h.p.evaluate(({id,chapter,source})=>{
   const d=Y2K.debug;d.flush();d.fast(true);for(let i=0;i<=chapter;i++)d.state.flags['ch'+i]=true;
   d.state.chapter='ch'+chapter;d.state.flags.board_c4_final=true;delete d.state.flags['seen_'+source];
   delete d.state.dlg[id];delete d.state.flags['dlg_'+id];d.state.dlgQ={};d.ui.tab='msg';d.ui.chat='xuning';d.update();
  },{id,chapter,source});
  await h.p.waitForFunction(()=>Y2K.debug.state.wait.xuning?.type==='evidence');await h.p.locator('#phoneFab').tap();
  assert.equal(await h.p.locator('#phFoot .ph-btn').count(),0,'查阅前不应提供带未知信息的回复');
  await h.p.locator('#phFoot').getByRole('button',{name:'查看原件',exact:true}).tap();
  await h.p.waitForFunction(source=>Y2K.debug.state.flags['seen_'+source],source);
  await h.p.waitForFunction(()=>Y2K.debug.state.wait.xuning?.type==='choice');
  assert.deepEqual(h.errors,[]);await h.context.close();
 }
 console.log(name+': 新玩家先读信再回复、许宁邮件/压缩包阅读条件、章节收尾后跨日通过');
}

(async()=>{
 const edge=process.env.UI_CHECK_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const runs=[['chromium',chromium,fs.existsSync(edge)?{executablePath:edge}:{}]];if(process.argv.includes('--webkit'))runs.push(['webkit',webkit,{}]);
 for(const[name,type,opts]of runs){const b=await type.launch({headless:true,...opts});try{await endingA(b,name);if(!process.argv.includes('--a-only')){await perspective(b,name);await presentation(b,name);await ending(b,name,'C');await ending(b,name,'B');}}finally{await b.close();}}
})().catch(e=>{console.error(e);process.exitCode=1});
