// 论坛真实触屏导航：不依赖浏览器补发 click，且滚动、后台刷新不会吞掉触摸。
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const release=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
assert(release.includes('return { add, boot, lang };'),'请先构建正式版');
const html=release.replace('return { add, boot, lang };','return { add, boot, lang, debug };');
async function run(browser,name){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await context.route('http://wyjm.test/bbs',r=>r.fulfill({contentType:'text/html',body:html}));
 const p=await context.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://wyjm.test/bbs');await p.getByRole('button',{name:'新的调查',exact:true}).click();await p.getByRole('button',{name:'开始',exact:true}).click();await p.locator('.card').click();
 await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.state.stage='win';d.state.chapter='ch1';Object.assign(d.state.flags,{ch0:true,ch1:true,solved_c0_bios:true,solved_c0_login:true});for(const x of d.D.dialogues)d.state.dlg[x.id]={done:1};d.state.dlgQ={};localStorage.setItem('y2k_auto',JSON.stringify(d.state));});
 await p.reload();await p.getByRole('button',{name:'继续调查',exact:true}).click();
 await p.locator('#icons .icon').filter({hasText:'梧桐树下'}).tap();
 const ie=p.locator('.win').filter({has:p.locator('#ieaddr')}),address=ie.locator('#ieaddr');
 // 正常触摸也只能生成一条历史，不能与浏览器补发的 click 重复执行。
 let nativeCount=await p.evaluate(()=>Y2K.debug.wins().find(w=>w.key==='ie').state.hist.length);
 await ie.locator('.bbs a[href="/board.asp?id=wenxue"] b').tap();
 assert((await address.inputValue()).includes('/board.asp?id=wenxue'));
 assert.equal(await p.evaluate(()=>Y2K.debug.wins().find(w=>w.key==='ie').state.hist.length),nativeCount+1);
 await ie.locator('.bbs .nav a[href="/"]').focus();await p.keyboard.press('Enter');
 assert((await address.inputValue()).endsWith('/'),'键盘导航失效');
 await p.evaluate(()=>document.addEventListener('touchend',e=>{if(e.target.closest('.bbs a, .bbs button, .toolbar98 button, .addr button'))e.preventDefault();},{capture:true,passive:false}));
 await ie.locator('.bbs a[href="/board.asp?id=wenxue"] b').tap();
 assert((await address.inputValue()).includes('/board.asp?id=wenxue'),'板块链接触屏无响应');
 const count=await p.evaluate(()=>Y2K.debug.wins().find(w=>w.key==='ie').state.hist.length);
 await ie.locator('.bbs a[href="/thread.asp?id=1168"]').tap();
 assert((await address.inputValue()).includes('/thread.asp?id=1168'),'帖子链接触屏无响应');
 assert((await ie.locator('.post .content').first().innerText()).includes('一年里最长的白天'));
 assert.equal(await p.evaluate(()=>Y2K.debug.wins().find(w=>w.key==='ie').state.hist.length),count+1,'一次触摸不应重复导航');
 await ie.locator('.post .who a[href="/user.asp?id=wanfeng"]').first().tap();
 assert((await address.inputValue()).includes('/user.asp?id=wanfeng'),'作者链接触屏无响应');
 await ie.locator('.bbs .nav a[href="/users.asp"]').tap();await ie.locator('.bbs a[href="/user.asp?id=jia"]').first().tap();
 assert((await address.inputValue()).includes('/user.asp?id=jia'));
 await ie.locator('.bbs .nav a[href="/search.asp"]').tap();await ie.locator('#bbsq').fill('夏至');await ie.locator('.bbs').getByRole('button',{name:'搜索',exact:true}).tap();
 assert((await address.inputValue()).includes('/search.asp?q='),'论坛搜索按钮触屏无响应');
 await ie.locator('.bbs a[href="/thread.asp?id=1168"] b').tap();assert((await address.inputValue()).includes('/thread.asp?id=1168'));
 await ie.locator('.toolbar98').getByRole('button',{name:'← 后退',exact:true}).tap();assert((await address.inputValue()).includes('/search.asp?q='));
 await ie.locator('.toolbar98').getByRole('button',{name:'前进 →',exact:true}).tap();assert((await address.inputValue()).includes('/thread.asp?id=1168'));
 await ie.locator('.bbs .nav a[href="/admin/"]').tap();
 const password=await p.evaluate(()=>Y2K.debug.D.puzzles.c1_admin.answers[0]);await ie.locator('#pz_c1_admin').fill(password);await ie.locator('.bbs').getByRole('button',{name:'登录',exact:true}).tap();
 await p.waitForFunction(()=>Y2K.debug.state.flags.solved_c1_admin);
 await ie.locator('.bbs a[href="/admin/recycle.asp"]').tap();await ie.locator('.bbs a[href="/thread.asp?id=1137"]').tap();
 assert((await address.inputValue()).includes('/thread.asp?id=1137'));
 assert(await p.evaluate(()=>Y2K.debug.state.flags.seen_t1137));
 await ie.locator('.toolbar98').getByRole('button',{name:'源文件',exact:true}).tap();assert((await p.locator('.win.active pre.note').innerText()).includes('192.168.1.107'));
 await p.locator('.win.active > .titlebar').getByRole('button',{name:'关闭',exact:true}).tap();
 // 模拟对话结束引起的刷新恰好落在手指按下与松开之间。
 await ie.locator('.toolbar98').getByRole('button',{name:'主页',exact:true}).tap();
 const held=ie.locator('.bbs a[href="/board.asp?id=wenxue"]');
 await held.evaluate(el=>{window.heldLink=el;const r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'touch',pointerId:91,isPrimary:true,clientX:r.x+5,clientY:r.y+5}));Y2K.debug.setFlag('_test_bbs_hold');Y2K.debug.update();});
 assert(await p.evaluate(()=>window.heldLink.isConnected),'后台刷新移除了正在触摸的链接');
 assert(await p.evaluate(()=>Y2K.debug.wins().find(w=>w.key==='ie').refreshPending),'没有实际触发后台刷新');
 await p.evaluate(()=>{const el=window.heldLink,r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerType:'touch',pointerId:91,isPrimary:true,clientX:r.x+5,clientY:r.y+5}));});
 assert((await address.inputValue()).includes('/board.asp?id=wenxue'));
 // 在链接上滑动后松开，不能误入帖子。
 const sliding=ie.locator('.bbs a[href="/thread.asp?id=1168"]'),before=await address.inputValue();
 await sliding.evaluate(el=>{const r=el.getBoundingClientRect(),a={identifier:92,clientX:r.x+5,clientY:r.y+5},b={...a,clientY:a.clientY+70};for(const[type,point]of [['touchstart',a],['touchmove',b],['touchend',b]]){const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:[point]});Object.defineProperty(e,'changedTouches',{value:[point]});el.dispatchEvent(e);}});
 assert.equal(await address.inputValue(),before,'滚动不应打开链接');
 // 只按住正文时，刷新先延迟，松手后仍需补上，不能永远冻结窗口。
 await ie.locator('.bbs').evaluate(el=>{window.heldBody=el;el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:93,isPrimary:true}));Y2K.debug.setFlag('_test_bbs_body');Y2K.debug.update();});
 assert(await p.evaluate(()=>window.heldBody.isConnected));
 assert(await p.evaluate(()=>Y2K.debug.wins().find(w=>w.key==='ie').refreshPending));
 await p.evaluate(()=>window.heldBody.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:93,isPrimary:true})));
 await p.waitForFunction(()=>!window.heldBody.isConnected);
 assert.equal(await address.inputValue(),before);
 // 鼠标操作仍留在游戏里，不能使用真实的浏览器地址跳转。
 await ie.locator('.bbs a[href="/thread.asp?id=1168"]').click();
 assert((await address.inputValue()).includes('/thread.asp?id=1168'));
 assert.equal(p.url(),'http://wyjm.test/bbs','链接不能跳出游戏到真实网页');assert.deepEqual(errors,[]);
 await context.close();console.log(name+': 板块、帖子、作者、搜索、后台、原件源代码、刷新竞争和滚动通过');
}
(async()=>{const edge=process.env.UI_CHECK_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';const runs=[['edge',chromium,fs.existsSync(edge)?{executablePath:edge}:{}]];if(process.argv.includes('--webkit'))runs.push(['webkit',webkit,{}]);for(const[name,type,opts]of runs){const b=await type.launch({headless:true,...opts});try{await run(b,name);}finally{await b.close();}}})().catch(e=>{console.error(e);process.exitCode=1});
