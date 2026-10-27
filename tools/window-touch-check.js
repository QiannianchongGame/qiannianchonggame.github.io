// 窗口按钮的触摸回归：覆盖浏览器不补发 click、重复 click 和触摸取消。
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const release=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const html=release.replace('return { add, boot, lang };','return { add, boot, lang, debug };');
async function setup(browser,mobile=true){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:950},hasTouch:mobile,isMobile:mobile});
 await context.route('http://wyjm.test/touch',r=>r.fulfill({contentType:'text/html',body:html}));
 const p=await context.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://wyjm.test/touch');await p.getByRole('button',{name:'新的调查',exact:true}).click();await p.getByRole('button',{name:'开始',exact:true}).click();await p.locator('.card').click();
 await p.evaluate(()=>{const d=Y2K.debug;d.flush();d.state.stage='win';d.state.chapter='ch1';Object.assign(d.state.flags,{ch0:true,ch1:true,solved_c0_bios:true,solved_c0_login:true});for(const x of d.D.dialogues)d.state.dlg[x.id]={done:1};d.state.dlgQ={};localStorage.setItem('y2k_auto',JSON.stringify(d.state));});
 await p.reload();await p.getByRole('button',{name:'继续调查',exact:true}).click();
 return{context,p,errors};
}
async function touch(browser,name){
 const {context,p,errors}=await setup(browser);
 await p.locator('#icons .icon').filter({hasText:'我的文档'}).tap();
 const win=p.locator('.win.active'),bar=win.locator(':scope > .titlebar');
 // 部分触屏手势可完成 touchend，却没有后续 click。不要只测试自动补发点击的模拟器。
 await p.evaluate(()=>document.addEventListener('touchend',e=>{if(e.target.closest('.tbb, .toolbar98 button, .viewer-toolbar button'))e.preventDefault();},{capture:true,passive:false}));
 for(let i=0;i<3;i++){
  await bar.getByRole('button',{name:'还原',exact:true}).tap();
  assert(!(await win.evaluate(e=>e.classList.contains('max'))),'触屏松手没有触发还原：按钮仍只依赖 click');
  await bar.getByRole('button',{name:'最大化',exact:true}).tap();
  assert(await win.evaluate(e=>e.classList.contains('max')),'触屏松手没有触发最大化');
 }
 await bar.getByRole('button',{name:'最小化',exact:true}).tap();assert(!(await win.isVisible()),'触屏松手没有最小化');
 await p.locator('#tasks .task').filter({hasText:'我的文档'}).tap();assert(await win.isVisible());
 // 没有 PointerEvent 的触摸事件回退，以及浏览器随后补发的重复点击。
 const toggle=bar.getByRole('button',{name:'还原',exact:true});
 await toggle.evaluate(el=>{
  const r=el.getBoundingClientRect(),point={identifier:42,clientX:r.x+r.width/2,clientY:r.y+r.height/2};
  for(const type of ['touchstart','touchend']){const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:type==='touchstart'?[point]:[]});Object.defineProperty(e,'changedTouches',{value:[point]});el.dispatchEvent(e);}
  el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
 });
 assert(!(await win.evaluate(e=>e.classList.contains('max'))),'同一次触摸被执行两次');
 // 明确的键盘操作不受刚刚的触屏去重影响。
 await bar.getByRole('button',{name:'最大化',exact:true}).focus();await p.keyboard.press('Enter');assert(await win.evaluate(e=>e.classList.contains('max')));
 await bar.getByRole('button',{name:'还原',exact:true}).evaluate(el=>{
  const r=el.getBoundingClientRect(),a={identifier:43,clientX:r.x+10,clientY:r.y+10},b={...a,clientX:a.clientX-60};
  for(const[type,point]of [['touchstart',a],['touchmove',b],['touchend',b]]){const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:[point]});Object.defineProperty(e,'changedTouches',{value:[point]});el.dispatchEvent(e);}
 });
 assert(await win.evaluate(e=>e.classList.contains('max')),'滑走的触摸不应当成点击');
 await bar.getByRole('button',{name:'关闭',exact:true}).tap();assert.equal(await p.locator('.win').count(),0,'触屏松手没有关闭');
 await p.evaluate(()=>Y2K.debug.openFile('c1_photo_open'));
 const image=p.locator('.win.active'),canvas=image.locator('.imgview .canvas'),before=(await canvas.boundingBox()).width;
 await image.locator('.toolbar98').getByRole('button',{name:'放大 +',exact:true}).tap();assert((await canvas.boundingBox()).width>before,'照片放大按钮未响应');
 const enlarged=(await canvas.boundingBox()).width;
 await image.locator('.toolbar98').getByRole('button',{name:'缩小 −',exact:true}).tap();assert((await canvas.boundingBox()).width<enlarged,'照片缩小按钮未响应');
 await image.locator('.toolbar98').getByRole('button',{name:'全屏查看',exact:true}).tap();assert(await p.locator('.viewer').isVisible());
 const out=p.locator('.viewer output'),v=parseFloat(await out.innerText());
 await p.locator('.viewer').getByRole('button',{name:'放大 +',exact:true}).tap();assert(parseFloat(await out.innerText())>v);
 await p.locator('.viewer').getByRole('button',{name:'关闭',exact:true}).tap();assert.equal(await p.locator('.viewer').count(),0);
 await image.locator(':scope > .titlebar').getByRole('button',{name:'关闭',exact:true}).tap();assert.equal(await p.locator('.win').count(),0);
 assert.deepEqual(errors,[]);await context.close();console.log(name+': 不补发 click、触摸回退、去重、滑动取消、键盘及照片按钮通过');
}
(async()=>{
 const edge=process.env.UI_CHECK_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const runs=[['edge',chromium,fs.existsSync(edge)?{executablePath:edge}:{}]];if(process.argv.includes('--webkit'))runs.push(['webkit',webkit,{}]);
 for(const[name,type,opts]of runs){const b=await type.launch({headless:true,...opts});try{await touch(b,name);}finally{await b.close();}}
})().catch(e=>{console.error(e);process.exitCode=1});
