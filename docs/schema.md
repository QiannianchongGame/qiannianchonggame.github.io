# 《千年虫》内容接口（引擎读取的数据格式）

每章内容写在 `src/content/chN.js` 一个文件里，整个文件只调用一次：

```js
Y2K.add({
  files: [...],
  bbs: { threads: [...], loginLog: [...], mails: [...], pages: [...] },
  userExtras: [...],
  gexun: { logs: [...] },
  puzzles: { ... },
  boards: { ... },
  dialogues: [ ... ],
  mails2026: [ ... ],
  items2026: [ ... ],
  notes: { ... },
  collectibles: { ... },
  endings: { ... },
  screensaver: [ ... ],
});
```
所有字段都可省略。数组会被合并，对象会按 key 合并。**公共数据（章节、BBS 板块、用户、鸽讯联系人、手机联系人、应用图标）已经在 `src/content/base.js` 里定义，各章不要重复定义。** 写之前先读 `src/content/base.js` 和 `docs/bible.md`。

---

## 1. 命名规则（必须遵守，否则会和别的章节冲突）
- 你写的每个 id（文件、谜题、推理板、对话、笔记、邮件、物品、鸽讯记录、BBS 自定义页面、userExtras、站内信）都以 `cN_` 开头，N 是章号。例：`c2_pager`、`c2_d_morning`、`c2_n_phonebooth`。
- 例外：收集品固定叫 `poem1` ~ `poem12`（按 bible 第 7 节分配）；结局固定叫 `A` `B` `C` `H`；BBS 帖子 id 是数字，必须落在本章分到的号段里（见第 5 节）。
- 自定义标记（flag）也用 `cN_` 开头，只能用字母、数字、下划线。

## 2. 标记（flag）与条件表达式
引擎维护一组标记。以下标记自动产生：
| 标记 | 何时产生 |
|---|---|
| `start` | 新游戏开始 |
| `ch0` ~ `ch6` | 该章开始（章节卡片弹出时） |
| `seen_<id>` | 玩家第一次打开某个带 id 的东西（文件、帖子 `seen_t<帖子号>`、鸽讯记录、站内信、2026 邮件、物品、自定义页面、userExtra） |
| `solved_<谜题id>` | 谜题解开 |
| `board_<推理板id>` | 推理板全部填对 |
| `col_<收集品id>` | 拿到收集品；集齐全部 12 个时另外产生 `collected_all` |
| `restored_<文件id>` | 文件从回收站还原 |
| `dlg_<对话id>` | 一段手机对话完整播完 |
| `ending_<结局id>` | 达成结局 |
| `speed_<文件id>_<速度>` | 在媒体播放器里用某个速度播放了某盘磁带，速度写法如 `speed_c4_tape_0_5`（0.5 → `0_5`，1 → `1`，1.25 → `1_25`） |

**条件表达式**（字段 `requires`、`trigger`、`wait`）：标记名用 `&`（且）、`|`（或）、`!`（非）、括号组合。例：`"ch2 & seen_c2_photo & !solved_c2_pager"`。省略或空字符串表示永远为真。
- 本章所有内容都应带 `requires: "chN"`（或更严格的条件），这样它们只在本章开始后出现。

## 3. 动作（action）
`onOpen`、`onSolve`、选项的 `action`、对话步骤 `{action}` 都用同一种动作对象：
```js
{
  set: ["c2_knows_x"],        // 设置标记
  unset: ["c2_tmp"],          // 清除标记
  note: "c2_n_booth",          // 或数组：往"笔记"里加线索（id 指向 notes）
  collect: "poem5",           // 获得收集品
  mail: "c4_m_xuning1",        // 立刻投递一封 2026 邮件（也可以用邮件自己的 requires 自动投递）
  toast: "屏幕底部的短提示",
  clock: "2000-04-04 22:51",   // 设置 3 号机任务栏的时钟（之后按真实时间走）
  ending: "A",                // 触发结局
}
```

## 4. 文件 `files`
```js
{
  id: "c2_notes1231",
  path: "C:/我的文档/调查/12.31.txt",   // 完整路径，用 / 分隔，文件夹自动创建。盘符只有 A: 和 C:
  type: "txt",                       // 见下表
  date: "2000-01-02 01:13",          // 修改时间（资源管理器"详细信息"和"属性"里显示）
  size: "2 KB",                      // 可省略，自动估算
  props: { "作者": "许嘉", "备注": "……" },  // "属性"窗口里额外显示的行，可以藏线索
  hidden: true,                      // 隐藏文件：资源管理器菜单"查看→显示隐藏文件"打开后才看得见
  deleted: true,                     // 在回收站里；还原后出现在 path 位置
  lock: "c2_p_xxx",                  // 打开前必须解开这个谜题（弹出密码框）
  requires: "ch2",
  onOpen: { ... },
  desktop: true,                     // 在桌面上放一个图标
  // 以下按 type 选填：
  text: "纯文本，保留换行",            // txt / log / ini / bat / bak / dat / sys
  html: "<p>富文本</p>",               // doc / img / htm
  caption: "图片说明（显示在图片下方）", // img
  tape: { ... },                     // audio，见下
  zip: { ... },                      // zip，见下
  app: "bbs",                        // lnk / exe：打开某个应用
}
```

| type | 打开方式 | 用哪个字段 |
|---|---|---|
| `folder` | 资源管理器（一般不用写，路径会自动建文件夹；需要给文件夹加 lock/hidden/requires 时才写） | — |
| `txt` `log` `ini` `bat` `bak` `dat` `sys` | 记事本 | `text` |
| `doc` | 写字板（白纸排版） | `html` |
| `htm` | IE 打开本地网页 | `html` |
| `img` | 图像查看器 | `html`（通常是一段 `<svg>`）+ `caption` |
| `audio` | 媒体播放器（磁带） | `tape` |
| `zip` | 压缩包工具 | `zip` + `lock` |
| `lnk` `exe` | 打开应用 | `app`（`bbs` `gexun` `explorer` `recycle` `display`），或者只写 `text` 当成"无法运行"的提示 |

### 磁带 `tape`
```js
tape: {
  label: "磁带标签上的字",
  side: "A",
  speeds: {                // 播放器转速滑块：0.5 0.75 1 1.25 1.5 2；玩家选哪个速度就显示对应的"听到的内容"
    "0.5": "……",           // 没写到的速度会显示最接近的那一档
    "1": "……",
    "2": "……"
  },
  onSpeed: { "0.5": { set: ["c4_heard"] } }  // 用某个速度播放时触发动作（同时也会自动产生 speed_ 标记）
}
```
"听到的内容"是文字转写，例如 `"（低沉、拖长的声音）第——三——个——"`。

### 压缩包 `zip`
```js
{ id: "c6_qm", path: "C:/WINDOWS/SYSTEM/.cache/清明.zip", type: "zip", lock: "c6_p_zip",
  zip: { comment: "压缩包注释（玩家能看到）", entries: ["给看到这些的人.txt", "server.log"], extractTo: "C:/WINDOWS/SYSTEM/.cache/清明" } }
```
解开 lock 后显示"已解压到 extractTo"。**解压出来的文件要你自己另外写成普通文件**，路径放在 extractTo 下，`requires: "solved_c6_p_zip"`。

## 5. BBS「梧桐树下」`bbs`
板块和用户已在 base.js 定义（板块 id：`zhanwu` 站务公告、`guanshui` 灌水乐园、`wenxue` 原创文学、`diannao` 电脑技术、`xiaoyuan` 校园生活、`xinqing` 心情驿站）。

### 帖子 `bbs.threads`
```js
{
  id: 1137,                    // 数字，必须在本章号段内
  board: "guanshui",
  title: "扒一扒高二(2)班那个转学生",
  author: "sysop",             // 用户 id（必须是 base.js 里有的）
  date: "1999-05-17 21:03",
  ip: "192.168.1.107",          // 可省略；在站务回收站和帖子详情里显示
  views: 412,                  // 可省略
  posts: [                     // 第一条是主帖，后面是回复
    { author: "sysop", date: "1999-05-17 21:03", html: "正文，可用 <br> <b> <i> <font color> 等" },
    { author: "leilei", date: "1999-05-17 21:20", html: "沙发！" }
  ],
  deleted: true,               // 已删除：版面列表里看不到，站务回收站里能看到；在地址栏输入 thread.asp?id=1137 也能直接打开（WTBBS 的漏洞）
  sticky: true,                // 置顶
  source: "<!-- 页面源代码里的注释，玩家用 IE 菜单 查看→源文件 才看得到 -->",
  requires: "ch1",
  lock: "c1_p_xxx",            // 可选
  onOpen: { ... }
}
```
帖子号段（号要和日期大致同序；号不必连续，缺的号就是没恢复出来的帖子）：
| 章 | 号段 | 帖子日期范围 |
|---|---|---|
| ch1 | 1001–1399 | 1998-10-08 ~ 1999-08-31 |
| ch2 | 1400–1599 | 1999-09-01 ~ 2000-01-05 |
| ch3 | 1600–1699 | 2000-01-06 ~ 2000-02-20 |
| ch4 | 1700–1799 | 2000-02-21 ~ 2000-03-31 |
| ch5/ch6 | 1800–1899 | 2000-04-01 ~ 2000-04-05 |

### 登录日志 `bbs.loginLog`（站务管理→登录日志；时间是服务器时间）
```js
{ user: "wanfeng", time: "2000-02-14 19:52:07", ip: "192.168.1.200", host: "JYS-486", requires: "ch3" }
```

### 站内信 `bbs.mails`（站务管理→站内信，ch3 才开放；可按发信时间/发信人/收信人排序，默认按发信时间从新到旧）
```js
{ id: "c3_mail_y2k1", from: "Y2K", to: "jia", date: "1900-01-01 00:33", subject: "第一个", body: "html", requires: "ch3", onOpen: {} }
```
`date` 写的是"显示出来的时间"（发信人电脑的时钟）。从 JYS-486 发出、2000 年以后的信要写成 1900 年。

### 自定义页面 `bbs.pages`（玩家在 IE 地址栏手动输入网址才能到达）
```js
{ id: "c1_pg_secret", url: "/admin/backup.asp", title: "页面标题", html: "页面内容", source: "<!-- -->", requires: "ch1", lock: "", onOpen: {} }
```
地址栏输入时，`http://192.168.1.103` 前缀可写可不写，大小写不敏感。

### 用户主页附加内容 `userExtras`
在某个用户的资料页底部加一个按钮，点开显示内容（可上锁）：
```js
{ id: "c6_ux_draft", user: "wanfeng", label: "草稿箱（1）", html: "……", lock: "c6_p_wanfeng", requires: "ch6" }
```

### 站务管理入口
站长登录谜题 id 固定为 `c1_admin`（ch1 定义）。解开后可以看：回收站、登录日志、用户列表（密码一律显示为 ******）；ch3 起多一个"站内信"。

## 6. 鸽讯聊天记录 `gexun.logs`
3 号机上登录的是许嘉的鸽讯（号码 3100512，昵称「嘉」）。鸽讯程序的登录密码谜题 id 固定为 `c1_gexun`（ch1 定义）。联系人已在 base.js 定义（id：`wanfeng` `qingman` `yuanfang` `tingting` `xiaorui` `leilei` `hanli`）。
```js
{
  id: "c3_gx_0213",
  contact: "yuanfang",
  date: "2000-02-13",
  lines: [
    { who: "them", time: "23:10:42", text: "在吗" },
    { who: "me", time: "23:11:03", text: "在" }
  ],
  requires: "ch3",
  onOpen: { ... }
}
```
`me` 是许嘉，`them` 是联系人。同一个联系人同一天可以有多段。

## 7. 谜题 `puzzles`
```js
c2_pager: {
  title: "传呼内容",                 // 短标题
  prompt: "题面，html。说清楚要输入什么、格式是什么。",
  kind: "text",                     // text | choice | pick | multi
  answers: ["零点后水塔见"],          // text：命中任意一个就算对
  options: ["A", "B", "C"],          // choice / pick 的选项
  answer: "B",                       // choice：正确选项（原文）
  answerSet: ["A", "C"],             // pick：必须正好选中这几个
  fields: [ { label: "时", answers: ["23"] }, { label: "分", answers: ["41"] } ],  // multi：多个输入框，全对才算对
  placeholder: "输入框里的灰字",
  near: { "水塔见": "差一点，时间呢？" },  // 可选：某些错误答案给的反馈（key 也会被规范化）
  hints: ["方向提示", "关键提示", "答案：……"],   // 必须正好 3 条，第 3 条直接给答案
  ask: true,                         // true：requires 满足后出现在手机"笔记→待解决"里，玩家从那里作答
  requires: "ch2 & seen_c2_pagerlog",
  onSolve: { ... },
  solvedText: "解开后显示的一句话（可选）"
}
```
- 谜题有两种用法：挂在东西上当锁（文件/帖子等的 `lock` 字段），或者 `ask: true` 当成"待解决的问题"。也可以在对话里用 `{ puzzle: "id" }` 让委托人提问。
- 答案规范化：全角转半角、转小写、去掉所有空格和标点（，。、！？,.!?;:：；'"“”‘’()（）[]【】-—_·/\ 等）。所以 `"23:41"` 和 `"2341"` 等价。但是汉字的同义写法、数字的汉字写法要你自己在 answers 里列全（如 `["7号机","7","七号机","jf07","jf-07"]`）。
- **每个谜题上面写一行注释 `// 解法：……`**，写清楚玩家要从哪几份资料推出答案。

## 8. 推理板 `boards`
每章末尾一个（id 见 bible 第 9 节），也可以在章中多加小的。
```js
c1_final: {
  title: "林晚之死",
  requires: "ch1 & solved_c1_admin & seen_t1137",
  intro: "把词语拖进空格（或先点空格再点词语）。全部正确才能通过。",
  text: "1999年6月21日傍晚，{who}从学校的{where}上坠落……谣言帖由{acct}账号发出，但那几天站长人在{city}。",
  slots: { who: "w_lw", where: "w_tower", acct: "w_sysop", city: ["w_shengcheng"] },  // 值可以是数组：多个词都算对
  words: { w_lw: "林晚", w_tower: "水塔", w_sysop: "sysop", w_shengcheng: "省城", w_hm: "何蔓", w_lib: "图书馆" },  // 要有干扰项；词可以重复使用
  hints: ["……", "……", "……"],
  onSolve: { ... },
  solvedText: "……"
}
```
- 推理板满足 requires 后出现在手机"推理"页。检查时只告诉玩家"N / M 处正确"。
- 每章末尾的推理板建议 6~12 个空。

## 9. 手机对话 `dialogues`（2026 年）
联系人：`heman`（何蔓）、`xuning`（许宁）。
```js
{
  id: "c2_d_morning",
  contact: "heman",
  trigger: "ch2",                // 条件满足时自动开始；每段只播一次；同一联系人的对话排队播放
  steps: [
    { npc: "早，{player}师傅。" },           // 对方发言（自动带"正在输入"延迟）
    { npc: "看看这张。", html: "<svg>…</svg>" },  // 对方发图片
    { me: "早。" },                          // 显示待发送的回复，玩家点击后才发出（即使只有一句也不会自动发送）
    { sys: "（何蔓撤回了一条消息）" },          // 居中灰字
    { choice: [                               // 玩家选一项；选项文字作为玩家发言
        { text: "许嘉那晚在哪？", reply: ["他说他在机房。", "没人能证明。"], action: { set: ["c2_asked"] } },
        { text: "先不问了。" }
    ] },
    { puzzle: "c2_ask_time" },                // 显示"回答"按钮，直到这个谜题解开才继续
    { wait: "seen_c2_photo" },                // 暂停，直到条件为真
    { action: { note: "c2_n_x" } },
    { delay: 2000 }                           // 额外停顿（毫秒）
  ]
}
```
- 何蔓的台词**绝对不能出现"再"字**，要写"再"的地方一律写成"在"（在见、在说、在也）。这是全剧最重要的线索之一。
- 对话是推进剧情、给玩家方向的主要手段：每章开头应该有一段，告诉玩家今天恢复出了什么、该看什么。

## 10. 2026 邮件 `mails2026`
```js
{ id: "c4_m_xuning1", from: "许宁 <xuning_design@wcmail.cn>", date: "2026-10-30 21:47", subject: "关于3号机", html: "……", requires: "board_c4_final", onOpen: {} }
```
有 requires 的邮件在条件满足时自动送达；也可以用动作 `mail` 送达。

## 11. 2026 物品 `items2026`（手机"物品"页：玩家手边的实物，例如快递箱里的东西、许宁发来的照片）
```js
{ id: "c0_it_letter", name: "何蔓的信", html: "……", requires: "start", onOpen: {} }
```

## 12. 笔记 `notes`、收集品 `collectibles`、结局 `endings`、屏保 `screensaver`
```js
notes: { c2_n_booth: { text: "传呼是从操场东侧的 IC 卡电话亭打的。" } },
collectibles: { poem5: { title: "《雪》", text: "诗的全文，换行用 \\n" } },
endings: { A: { title: "替罪羊", html: "结局正文（可以较长）" } },
screensaver: [ { text: "屏保滚动字幕", requires: "ch2", onShow: { collect: "poem5" } } ]
```
- 屏保：Win98"字幕"屏保。玩家 90 秒不操作，或者在 显示属性→屏幕保护程序 里点"预览"时出现。满足 requires 的条目里取最后定义的那条。

## 13. 文本里的写法
- `{player}` 会被替换成玩家昵称。
- html 可以用内联 style。引擎提供的样式类：
  - `.paper` 横格信纸；`.scan` 发黄的扫描件；`.hand` 手写体（楷体）；`.stamp` 红色印章；`.mono` 等宽；`.faded` 褪色字；`.redact` 黑条涂掉；`.torn` 撕掉的下边缘；`.photo` 照片相框（里面放 svg）；`.datestamp` 相机橙色日期戳文字。
- 图片用内联 SVG，建议 `viewBox="0 0 640 420"`，**所有颜色写死**（不要依赖外部 CSS 变量），字体写 `font-family="SimSun, 'Songti SC', serif"` 或 `font-family="KaiTi, STKaiti, serif"`（手写感）。不要引用任何外部图片或字体。画风可以简单：方块、剪影、文字标签都行，信息清楚最重要。
- 字体：界面是 Win98 风格，正文默认宋体。

## 13.5 补充字段（后加的）
- 文件 `onProps`：玩家打开这个文件的"属性"窗口时触发的动作（只触发一次）。诗稿藏在属性备注里时用它给 `collect`。
- 帖子 / 自定义页面 `onSource`：玩家用 IE 菜单"查看→源文件"看这个页面的源代码时触发的动作（只触发一次）。诗稿藏在源代码注释里时用它给 `collect`。
- 自动标记：`props_<文件id>`（看过属性）、`source_t<帖子号>` / `source_<页面id>`（看过源文件）。
- 动作的 `toast` 只在第一次触发时显示；`onOpen` 只在第一次打开时触发。

## 14. 质量要求
1. 每个谜题都必须能只靠游戏内资料推出来，答案唯一；`// 解法` 注释写清推理链。
2. 每章开头用对话交代方向；每解开一个关键谜题都给反馈（笔记、对话或 toast），玩家不应该长时间不知道下一步干什么。
3. 难度曲线：序章简单；中间章节每章 6~9 个谜题，混合"找东西"、"交叉比对"、"破译"三类；不要连续出现同一类。
4. 资料要有足够的"生活感"：灌水帖、无关的聊天、作业、广告、歌单（虚构歌名）、班级通知……让玩家需要筛选。但关键信息不能淹没到找不到：至少有一条路径能从对话/笔记的提示走到它。
5. 不要提前揭示后面章节的真相（见 bible 第 8 节"谁在哪章写"）。
6. 写完运行 `node tools/validate.js`，修到没有 ERROR（WARNING 尽量清掉）。
