// 剧情改写的兼容性检查：谜题、旧存档会话位置、取字原文和证据时钟。
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.join(__dirname,'..'), chunks=[];
for(const name of ['base','ch0','ch1','ch2','ch3','ch4','ch5','ch6','story'])vm.runInNewContext(fs.readFileSync(path.join(root,'src/content',name+'.js'),'utf8'),{Y2K:{add:o=>chunks.push(o)}});
const data={puzzles:{},boards:{},dialogues:[],collectibles:{},files:[],readings:[],journal:{},mails:[],threads:[],gx:[],logs:[]};
for(const o of chunks){for(const k of ['puzzles','boards','collectibles','journal'])Object.assign(data[k],o[k]||{});for(const k of ['dialogues','files','readings'])data[k].push(...(o[k]||[]));data.mails.push(...(o.bbs?.mails||[]));data.threads.push(...(o.bbs?.threads||[]));data.gx.push(...(o.gexun?.logs||[]));data.logs.push(...(o.bbs?.loginLog||[]));}
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/story-contract.json'),'utf8'));
const plain=x=>JSON.parse(JSON.stringify(x));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const action=a=>a?Object.fromEntries(Object.entries(a).filter(([k])=>k!=='toast')):undefined;
const shape=d=>({trigger:d.trigger,contact:d.contact,steps:d.steps.map(s=>({type:s.npc!==undefined?'npc':s.me!==undefined?'me':s.sys!==undefined?'sys':null,wait:s.wait,needs:s.needs,source:s.needs?s.source:undefined,puzzle:s.puzzle,action:action(s.action),choice:s.choice?.map(o=>({replies:(o.reply||[]).length,action:action(o.action)}))}))});
for(const[id,h]of Object.entries(baseline.puzzles))assert.equal(hash(data.puzzles[id]),h,'谜题原始规则变化 '+id);
for(const[id,b]of Object.entries(baseline.boards)){const v=data.boards[id];assert.deepEqual(plain({slots:v.slots,words:v.words,requires:v.requires,onSolve:action(v.onSolve),placeholders:[...v.text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(x=>x[1]).sort()}),b,'推理板规则变化 '+id);}
for(const[id,s]of Object.entries(baseline.dialogues)){const d=data.dialogues.find(d=>d.id===id);assert.deepEqual(plain(shape(d)),s,'旧存档会话位置变化 '+id);}
for(const[id,p]of Object.entries(baseline.poems))assert.equal(data.collectibles[id].text,p,'取字或诗稿原文变化 '+id);
assert.deepEqual(plain(data.logs),baseline.clockLogs,'证据时钟变化');
for(const d of data.dialogues.filter(d=>d.contact==='heman'))for(const s of d.steps){for(const text of [s.npc,...(s.choice||[]).flatMap(o=>o.reply||[])])if(text)assert(!text.includes('再'),'何蔓输入习惯：'+d.id+' '+text);}
for(const l of data.gx.filter(l=>l.contact==='qingman'))for(const line of l.lines.filter(l=>l.who==='them'))assert(!line.text.includes('再'),'何蔓旧聊天：'+l.id);
assert.equal(data.readings.length,6);assert.equal(Object.keys(data.puzzles).length,44);assert.equal(Object.keys(data.collectibles).length,12);
for(const r of data.readings){assert(r.source&&r.chapter&&r.requires,'旧事缺少来历或开放条件 '+r.id);assert(!r.onOpen&&!r.onSolve&&!r.lock,'可选阅读不应增加通关条件 '+r.id);if(r.file)assert(data.files.some(f=>f.id===r.file),'旧事原件缺失 '+r.id);}
const all=JSON.stringify(data.readings);assert(!all.includes('3132636459'),'旧事不应提前泄露终章钥匙');
const early=data.readings.filter(r=>['ch1','ch2','ch3'].includes(r.chapter));assert(!JSON.stringify(early).includes('韩立是'),'不能提前揭露父女身份');
const allowed=new Set(['file','url','item','gx','board','chat','mail']);
for(const [chapter,j]of Object.entries(data.journal)){assert(j.question&&j.steps.length,'缺少章节方向 '+chapter);for(const s of j.steps){assert(s.until&&s.text&&allowed.has(s.source.type));if(s.source.type==='file')assert(data.files.some(f=>f.id===s.source.id),'方向原件不存在 '+s.source.id);if(s.source.type==='board')assert(data.boards[s.source.id]);}}
const letter=data.files.find(f=>f.id==='c6_f_letter').text;
assert(letter.includes('4 月 1 日')&&letter.includes('17:30 前')&&letter.includes('6 月 20 日'));
assert(!data.readings.find(r=>r.id==='r6_margin').requires.includes('ch1'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/photo-manifest.json'),'utf8'));
assert(manifest.deskmates.prompt.includes('April 9')&&manifest.deskmates.targets[0].id==='c1_photo_deskmates');
const draft=chunks.flatMap(o=>o.userExtras||[]).find(x=>x.id==='c6_ux_draft');
assert(data.mails.find(x=>x.id==='story_delivered_draft').body.includes(draft.html),'隐藏结局投递的必须是完整原稿');
console.log('通过：44 个谜题、5 个推理板、59 段旧会话位置、12 首诗、时钟记录及新旧事条件。');
