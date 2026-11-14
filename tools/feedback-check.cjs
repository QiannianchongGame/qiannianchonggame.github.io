// Isolated UI checks. Network requests never reach the public feedback service.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(root,'src/stats-config.json'))),base=config.allowedOrigins[0]+'/';
const shots=path.join(root,'test-results/feedback');fs.mkdirSync(shots,{recursive:true});
(async()=>{
 for(const[kind,type,options]of [['Edge',chromium,{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}],['WebKit',webkit,{}]]){
  const browser=await type.launch({headless:true,...options});
  try{
   for(const[width,height,language]of [[1440,950,'zh'],[390,844,'zh'],[320,568,'en'],[390,844,'ja'],[844,390,'zh']]){
    const ctx=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000}),p=await ctx.newPage(),errors=[];
    p.on('pageerror',e=>errors.push(e.message));
    await ctx.addInitScript(language=>{sessionStorage.setItem('y2k_author_note_seen','1');localStorage.setItem('y2k_meta',JSON.stringify({lang:language}));localStorage.setItem('y2k_slot1','saved-game-must-stay-unchanged');},language);
    const entries=Array.from({length:25},(_,i)=>({id:'entry-'+i,rating:i%10+1,message:i===0?'<img src=x onerror="window.feedbackXSS=true">\n原样显示':'留言 '+i,createdAt:1800000000000-i*1000}));
    const posts=[],accepted=new Set();let failPost=true,delayPageTwo=false;
    await ctx.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(request.url()===base)return route.fulfill({contentType:'text/html',body:html});
      if(url.origin===new URL(config.feedbackEndpoint).origin&&url.pathname==='/api/feedback'){
        if(request.method()==='POST'){
          const body=JSON.parse(request.postData());posts.push(body);
          if(!accepted.has(body.submissionId)){accepted.add(body.submissionId);entries.unshift({id:body.submissionId,rating:body.rating,message:body.message,createdAt:1800001000000});}
          if(failPost){failPost=false;return route.fulfill({status:503,contentType:'application/json',body:'{"error":"unavailable"}'});}
          return route.fulfill({contentType:'application/json',body:'{"accepted":true}'});
        }
        const page=Number(url.searchParams.get('page')||1);
        if(page===2&&delayPageTwo)await new Promise(resolve=>setTimeout(resolve,500));
        return route.fulfill({contentType:'application/json',body:JSON.stringify({page,pages:Math.ceil(entries.length/10),pageSize:10,total:entries.length,ratingCount:25,averageRating:8.4,items:entries.slice((page-1)*10,page*10)})});
      }
      return route.abort();
    });
    await p.goto(base);
    const button=p.locator('.feedback-entry-button'),song=p.locator('.song-entry');
    const bounds=await button.boundingBox(),songBounds=await song.boundingBox();
    assert(bounds.x>=songBounds.x+songBounds.width-1&&Math.abs(bounds.y-songBounds.y)<1,'Feedback beside the song');
    const bar=await p.locator('.title-topbar').boundingBox(),clock=await p.locator('#title .clock').boundingBox();assert(bar.y+bar.height<=clock.y,'Toolbar does not cover the clock');
    await button.click();const panel=p.locator('.feedback-panel');await p.waitForFunction(()=>document.querySelectorAll('.feedback-entry').length===10);
    const firstPage=await panel.locator('.feedback-entry-message').allTextContents();assert(firstPage[0].includes('<img src=x'));
    assert.equal(await p.evaluate(()=>window.feedbackXSS),undefined);assert.equal(await panel.locator('.feedback-entry img').count(),0);
    const r=await panel.boundingBox();assert(r.x>=15&&r.y>=15&&r.x+r.width<=width-15&&r.y+r.height<=height-15,'Modal stays within viewport');
    const input=panel.locator('#feedback-message');await input.fill('翻页不丢草稿');
    const next=panel.locator('.feedback-pagination button').nth(1),previous=panel.locator('.feedback-pagination button').first();
    await next.click();await p.waitForFunction(()=>document.querySelector('.feedback-entry-message').textContent==='留言 10');assert.equal(await input.inputValue(),'翻页不丢草稿');
    await next.click();await p.waitForFunction(()=>document.querySelectorAll('.feedback-entry').length===5);assert(await next.isDisabled());
    await previous.click();await p.waitForFunction(()=>document.querySelectorAll('.feedback-entry').length===10);await previous.click();await p.waitForFunction(()=>document.querySelector('.feedback-entry-message').textContent.includes('<img'));
    // A slower old request cannot replace a newer refresh response.
    delayPageTwo=true;await next.click();await panel.locator('.feedback-toolbar button').click();
    await p.waitForTimeout(650);assert((await panel.locator('.feedback-entry-message').first().textContent()).includes('<img'));
    if(language==='zh'){
      await panel.locator('.feedback-publish').click();assert.equal(posts.length,0,'Rating is required');
      await panel.locator('.feedback-ratings input[value="8"]').check();await input.fill('测试留言\n第二行');
      await panel.locator('.feedback-publish').click();await p.waitForFunction(()=>document.querySelector('.feedback-post-status').textContent.includes('未确认'));
      assert.equal(await input.inputValue(),'测试留言\n第二行');assert.equal(posts.length,1);
      await panel.locator('.feedback-publish').click();await p.waitForFunction(()=>document.querySelector('.feedback-post-status').textContent.includes('已发布'));
      assert.equal(posts.length,2);assert.equal(posts[0].submissionId,posts[1].submissionId,'Uncertain posts reuse their id');assert.equal(accepted.size,1);
      await p.waitForFunction(()=>document.querySelector('.feedback-entry-message').textContent==='测试留言\n第二行');
      assert.equal(await input.inputValue(),'');assert.equal(await p.evaluate(()=>localStorage.getItem('y2k_slot1')),'saved-game-must-stay-unchanged');
    }
    await panel.locator('.title-panel-body').evaluate(el=>el.scrollTop=0);
    if(language==='zh'&&height>500)await p.screenshot({path:path.join(shots,`${kind}-${width}.png`)});
    const close=panel.locator('.title-panel-close'),top=(await close.boundingBox()).y;await panel.locator('.title-panel-body').evaluate(el=>el.scrollTop=el.scrollHeight);assert.equal((await close.boundingBox()).y,top);
    if(width<1000)await close.tap();else await close.click();assert.equal(await panel.count(),0);assert(await button.evaluate(el=>document.activeElement===el));
    await button.click();await p.keyboard.press('Escape');assert.equal(await p.locator('.feedback-panel').count(),0);assert.deepEqual(errors,[]);await ctx.close();
   }
   // Offline pages expose no submission flow or background request.
   const ctx=await browser.newContext(),p=await ctx.newPage(),external=[];await ctx.addInitScript(()=>sessionStorage.setItem('y2k_author_note_seen','1'));
   await ctx.route('**/*',route=>{if(route.request().url().startsWith('file:'))return route.continue();external.push(route.request().url());return route.abort();});
   await p.goto(pathToFileURL(path.join(root,'千年虫.html')).href);await p.locator('.feedback-entry-button').click();await p.getByText('评分与留言仅在在线版开放。',{exact:true}).waitFor();assert.equal(await p.locator('.feedback-form').count(),0);assert.deepEqual(external,[]);await ctx.close();
   console.log(kind+' PASS: paged feedback, stale-response protection, anonymous posts, retry IDs, drafts, text safety, three languages, touch/keyboard close, saves and offline isolation');
  }finally{await browser.close();}
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
