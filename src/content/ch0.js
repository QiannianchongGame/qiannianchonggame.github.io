// 序章「开机」—— 2026-10-27 晚。玩家拆开何蔓寄来的 3 号机，解开 BIOS 和 Windows 登录。
// 谜题：c0_tag（教学：看物品作答）→ c0_bios（照片推生日）→ c0_login（五笔编码）
// 收集品：poem1（软盘标签底下的铅笔字）
Y2K.add({
  items2026: [
    {
      id: "c0_it_letter", name: "何蔓的信", requires: "start",
      html: "<div class=\"paper\"><p>{player}师傅：</p><p>您好。冒昧打扰。我是梧城七中的何蔓。看过您修旧电脑的视频，您会把拆下来的小螺丝也收好，所以想请您帮这个忙。</p><p>箱子里是我们学校机房的 3 号机。许嘉以前用它办过一个学生 BBS，叫「梧桐树下」。机房放学后关门，那个站不关。很多话都是回家以后才敢在上面说。</p><p>1999 年夏天，我的同桌林晚从水塔坠落。半年后，周婷、宋知远和苏芮又相继出事。2000 年 4 月 4 日晚上，许嘉死在机房。后来案件结了：他被认定是「千年虫」，畏罪自杀。</p><p>我一直不能把那个人和记忆里的许嘉对上。他喜欢林晚，那时候有几个同学都看得出来。他说话慢，打字快。别人让他修电脑，他常常连一句好听的话都没有，第二天却已经修好了。</p><p>旧校区 11 月 1 日拆除。我现在在教导处工作，清仓库时又看到了它。东西封了二十多年，硬盘能不能转，我也不敢试。</p><p>如果修得好，请先把发现告诉我。视频暂时不要发，有些家属还住在这里。尤其是许嘉有没有写过，把什么东西留在哪里。</p><p>旧照片和软盘也放进去了。那张生日照，是我手边少有的、他还没有低头去看电脑的照片。</p><p style=\"text-align:right\">何蔓<br>2026 年 10 月 24 日</p></div><p class=\"faded\">信是打印的，落款用蓝笔签了名。封口处贴了两层胶带。</p>",
    },
    {
      id: "c0_it_photo", name: "信封里的旧照片", requires: "start",
      html: `<div class="photo"><svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg">
<rect width="640" height="420" fill="#2b2a26"/>
<rect x="0" y="0" width="640" height="190" fill="#3d4a4f"/>
<rect x="40" y="40" width="120" height="90" fill="#1e2427" stroke="#8a9499" stroke-width="3"/>
<rect x="190" y="40" width="120" height="90" fill="#1e2427" stroke="#8a9499" stroke-width="3"/>
<rect x="470" y="40" width="120" height="90" fill="#1e2427" stroke="#8a9499" stroke-width="3"/>
<text x="500" y="92" font-family="SimSun, 'Songti SC', serif" font-size="16" fill="#6fae7a">C:\\&gt;_</text>
<ellipse cx="250" cy="230" rx="38" ry="44" fill="#151515"/><rect x="205" y="262" width="90" height="120" rx="20" fill="#151515"/>
<ellipse cx="390" cy="225" rx="36" ry="42" fill="#1a1a1a"/><rect x="348" y="255" width="84" height="125" rx="20" fill="#1a1a1a"/>
<ellipse cx="120" cy="240" rx="34" ry="40" fill="#181818"/><rect x="80" y="268" width="80" height="115" rx="20" fill="#181818"/>
<ellipse cx="525" cy="238" rx="34" ry="40" fill="#181818"/><rect x="485" y="266" width="80" height="115" rx="20" fill="#181818"/>
<rect x="160" y="330" width="330" height="90" fill="#6b4f35"/>
<ellipse cx="320" cy="330" rx="95" ry="22" fill="#f1e6d0"/><rect x="225" y="300" width="190" height="30" fill="#f1e6d0"/><ellipse cx="320" cy="300" rx="95" ry="20" fill="#fff7e8"/>
<text x="320" y="306" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="18" fill="#c0392b">生日快乐</text>
<rect x="296" y="262" width="8" height="34" fill="#e8c34a"/><rect x="318" y="262" width="8" height="34" fill="#e8c34a"/>
<path d="M300 262 q-5 -10 0 -18 q5 8 0 18" fill="#ffb347"/><path d="M322 262 q-5 -10 0 -18 q5 8 0 18" fill="#ffb347"/>
<text x="290" y="258" text-anchor="end" font-family="SimSun, serif" font-size="22" fill="#ffdd88">1</text>
<text x="336" y="258" font-family="SimSun, serif" font-size="22" fill="#ffdd88">7</text>
<text x="600" y="400" text-anchor="end" font-family="'Courier New', monospace" font-size="22" fill="#ff8a1e">'98 12 3</text>
</svg></div>
<p>一张有点褪色的彩色照片。机房里，几个穿校服的学生围着一个蛋糕，蜡烛插成“1”和“7”。中间那个男生低着头，好像不太习惯被拍。</p>
<p>照片右下角是相机打上去的橙色日期。</p>
<p><b>背面</b>（圆珠笔，女生的字）：</p>
<p class="hand">嘉 十七岁生日快乐！<br>—— 高二(2)班 机房小分队</p>`,
    },
    {
      id: "c0_it_tag", name: "机箱侧面的资产标签", requires: "start",
      html: `<div class="scan mono" style="padding:12px;line-height:1.7">
梧城市第七中学　固定资产标签<br>
━━━━━━━━━━━━━━━━━━━━<br>
资产编号：QZ-1998-JF-003<br>
名　　称：微型计算机（兼 BBS 服务器）<br>
机 器 名：JF-03<br>
I P 地址：192.168.1.103<br>
存放位置：实验楼三楼 微机室<br>
管 理 员：许嘉（学生）　指导教师：韩立<br>
购入日期：1998 年 9 月<br>
━━━━━━━━━━━━━━━━━━━━<br>
<span class="hand" style="font-size:15px">BIOS 开机密码 = 管理员生日（6 位：年月日各两位）　—— 韩</span>
</div>
<p>标签下面还贴着一张后来的白色封条，字迹已经发黄：</p>
<div class="scan" style="padding:8px"><span class="stamp">物证</span>　案件物品返还　2000.04.20　｜　实验楼仓库封存　2001.08</div>`,
    },
    {
      id: "c0_it_note", name: "显示器边框上的便签", requires: "start",
      html: `<div class="paper" style="max-width:260px;background:#fff6a8">
<p class="hand" style="font-size:18px">xujia</p>
<p class="hand" style="font-size:18px">密码：她的名字，<br>用我的方式打。</p>
</div>
<p>一张黄色便签，贴在显示器右下角的边框上，胶已经干了，一碰就掉。字是男生的字，很小，很工整。</p>`,
    },
    {
      id: "c0_it_card", name: "五笔字根卡", requires: "start",
      html: `<p>一张扑克牌大小的塑封卡片，夹在键盘底下。</p>
<div class="scan" style="padding:10px">
<b>【正面】</b>印着「五笔字型 86 版 字根速查」，五个区、二十五个键，密密麻麻的字根和口诀。塑封被摸得发亮，“G F D S A”那一排几乎看不清了。
</div>
<div class="paper" style="margin-top:8px">
<p><b>【背面】</b>（钢笔手写）</p>
<p class="hand">录同学录用：</p>
<table class="mono" style="font-size:14px;border-collapse:collapse">
<tr><td>许 YTFH</td><td>　嘉 FKUK</td><td>　王 GGGG</td><td>　磊 DDDF</td></tr>
<tr><td>林 SSY</td><td>　晚 JQKQ</td><td>　陈 BAIY</td><td>　雨 FGHY</td></tr>
<tr><td>周 MFKD</td><td>　婷 VYPS</td><td>　赵 FHQI</td><td>　刘 YJH</td></tr>
<tr><td>宋 PSU</td><td>　远 FQPV</td><td>　洋 IUDH</td><td>　风 MQI</td></tr>
<tr><td>苏 ALWU</td><td>　芮 AMWU</td><td>　何 WSKG</td><td>　蔓 AJLC</td></tr>
</table>
<p class="hand">常打的：</p>
<p class="mono" style="font-size:14px">梧 SGKG　桐 SMGK　树 SCFY　下 GHI<br>七 AGN　中 KHK　机 SMN　房 YNYV　站 UHKG　长 TAYI</p>
<p class="hand">词组：</p>
<p class="hand">二字词 —— 每字取前两码　（例：机房 = SMYN）<br>
三字词 —— 前两字各取第一码，末字取前两码<br>
四字词 —— 每字取第一码</p>
</div>`,
    },
    {
      id: "c0_it_floppy", name: "3.5 寸软盘", requires: "start",
      html: `<div style="width:220px;height:230px;background:#222;border-radius:4px;position:relative;margin:8px auto">
<div style="position:absolute;left:50px;top:0;width:120px;height:70px;background:#b8b8b8"></div>
<div style="position:absolute;left:20px;top:110px;width:180px;height:100px;background:#f4f0e2;padding:8px;box-sizing:border-box">
<span class="hand" style="font-size:40px">嘉</span></div></div>
<p>一张黑色的 3.5 寸软盘，写保护口开着。标签上只用蓝色钢笔写了一个“嘉”字。</p>
<p>标签的一角翘起来了。底下好像还有一层更旧的标签，隐约透出铅笔的痕迹。</p>`,
    },
    {
      id: "c0_it_label", name: "软盘旧标签（揭开后）", requires: "seen_c0_it_floppy",
      onOpen: { collect: "poem1", toast: "获得收集品：林晚的诗稿（1/12）" },
      html: `<p>你用指甲把“嘉”字那张标签慢慢揭起来。底下是一张更旧的标签，上面是铅笔写的几行小字，是另一个人的笔迹，很轻：</p>
<div class="paper"><p class="hand" style="font-size:17px">灯<br><br>机房的灯总是最后一盏<br>我从操场走过去<br>数到三楼第三扇窗<br>它还亮着<br><br>—— 晚</p></div>
<p class="faded">（你把“嘉”字标签按回原处。它大概本来就是为了盖住这几行字才贴上去的。）</p>`,
    },
  ],

  collectibles: {
    poem1: { title: "《灯》", text: "灯\n\n机房的灯总是最后一盏\n我从操场走过去\n数到三楼第三扇窗\n它还亮着" },
  },

  notes: {
    c0_n_tag: { text: "3 号机：机器名 JF-03，IP 192.168.1.103。管理员是学生许嘉，指导教师韩立。BIOS 开机密码 = 管理员生日（6 位：年月日各两位）。" },
    c0_n_bios: { text: "BIOS 密码是许嘉的生日：1981 年 12 月 3 日（照片上 1998.12.3 是他的十七岁生日）。系统时钟停在 2000-04-05 07:40。" },
    c0_n_login: { text: "Windows 登录：用户 xujia，密码 SSJQ —— 林晚的五笔编码（二字词每字取前两码）。" },
  },

  puzzles: {
    // 解法：资产标签上直接写着「I P 地址：192.168.1.103」。教玩家打开物品、在对话里作答。
    c0_tag: {
      title: "3 号机的网络地址",
      prompt: "何蔓想知道：这台机器当年在学校网络里的地址是多少？（看看机箱侧面的标签）",
      kind: "text",
      answers: ["192.168.1.103"],
      placeholder: "例如 10.0.0.1",
      near: { "jf03": "这是机器名。她问的是 IP 地址。", "103": "写完整的地址。" },
      hints: ["手机「物品」页里有快递箱里的东西，挨个点开看看。", "机箱侧面的资产标签上有一行「I P 地址」。", "答案：192.168.1.103"],
      onSolve: { note: "c0_n_tag" },
      solvedText: "192.168.1.103 —— 记下了。",
    },
    // 解法：资产标签手写备注「BIOS 开机密码 = 管理员生日（6 位：年月日各两位）」，管理员是许嘉。
    // 信封里的照片：日期戳 '98 12 3，背面「嘉 十七岁生日快乐」→ 1998-12-03 满 17 岁 → 生于 1981-12-03 → 811203。
    c0_bios: {
      title: "BIOS 开机密码",
      prompt: `KITE Modular BIOS v4.51PG<br>Copyright (C) 1994-98, KITE Software, Inc.<br><br>
Main Processor : Pentium-MMX 200MHz<br>Memory Testing : 32768K OK<br><br>
CMOS Battery Low!<br>Real Time Clock stopped at : <b>Wed Apr 05 2000　07:40</b><br><br>
Enter Password: ______`,
      kind: "text",
      answers: ["811203"],
      placeholder: "******",
      near: {
        "19811203": "Password too long.（只要 6 位。）",
        "981203": "Invalid Password.（这是照片拍摄的日子，不是他出生的那年。）",
        "031281": "Invalid Password.（顺序：年、月、日。）",
        "120381": "Invalid Password.（顺序：年、月、日。）",
        "1203": "Password too short.",
      },
      hints: [
        "机箱侧面的资产标签上，有人手写了 BIOS 密码的规则。",
        "管理员是许嘉。信封里那张照片是他十七岁生日那天拍的，日期戳是 '98 12 3。他是哪一年出生的？",
        "答案：811203（1981 年 12 月 3 日）",
      ],
      onSolve: { note: "c0_n_bios", toast: "BIOS 自检通过。正在启动 Windows 98……" },
      solvedText: "811203。硬盘发出“咔哒、咔哒”的寻道声。",
    },
    // 解法：便签「密码：她的名字，用我的方式打」。何蔓的信说「他喜欢林晚，全班都知道」→「她」= 林晚。
    // 许嘉的方式 = 五笔（字根卡是他的，信里/卡上都能看出）。字根卡背面：林 SSY、晚 JQKQ；二字词每字取前两码 → SS + JQ = SSJQ。
    c0_login: {
      title: "Windows 98 登录",
      prompt: `<b>欢迎使用 Windows</b><br>请键入用户名和密码以登录到 Windows。<br><br>用户名：<b>xujia</b><br>密　码：`,
      kind: "text",
      answers: ["ssjq"],
      placeholder: "密码",
      near: {
        "linwan": "密码不正确。（许嘉不用拼音打字。）",
        "lw": "密码不正确。（许嘉不用拼音打字。）",
        "ssyjqkq": "密码不正确。（这是两个字各自的全码。两个字连在一起算一个词。）",
        "ssjqkq": "密码不正确。（两个字连在一起算一个词，字根卡背面写了词组的规则。）",
        "jqmq": "密码不正确。（“晚风”是她在 BBS 上的网名。便签上说的是“名字”。）",
        "wsaj": "密码不正确。（便签里的“她”是谁？何蔓的信里说了。）",
        "ytfk": "密码不正确。（那是许嘉自己的名字。）",
        "林晚": "密码不正确。（“用我的方式打”——他是怎么打字的？）",
      },
      hints: [
        "便签上的“她”是谁？何蔓的信里有一句话说得很明白。",
        "她是林晚。“用我的方式打”——许嘉是五笔高手。字根卡背面有每个字的编码，也写了二字词的取码规则。",
        "答案：ssjq（林 SSY 取 SS，晚 JQKQ 取 JQ）",
      ],
      onSolve: { note: "c0_n_login", clock: "2000-04-05 07:40", toast: "正在加载个人设置……" },
      solvedText: "SSJQ。登录成功。",
    },
  },

  dialogues: [
    {
      id: "c0_d_hello", contact: "heman", trigger: "start",
      steps: [
  {
    "npc": "{player}师傅，您好，我是何蔓。快递显示签收了。箱子有没有压坏？"
  },
  {
    "npc": "机器在仓库里放了二十多年。打包时我把原来的泡沫也找出来了，还是怕路上磕着。"
  },
  {
    "choice": [
      {
        "text": "收到了，箱子很结实。",
        "reply": [
          "那就好。照片的纸袋也在里面。"
        ]
      },
      {
        "text": "信我看了。",
        "reply": [
          "让您一下子看这么多旧事，实在不好意思。",
          "您先看看机器，别急着判断。"
        ]
      }
    ]
  },
  {
    "npc": "学校还在清点旧设备，想登记它原来的网络地址。"
  },
  {
    "npc": "机箱侧面应该有资产标签。麻烦您先看看，字还能不能认。"
  },
  {
    "puzzle": "c0_tag"
  },
  {
    "npc": "谢谢，我把这串数字抄下来。"
  },
  {
    "choice": [
      {
        "text": "开机会要密码吗？",
        "reply": [
          "不知道。",
          "我那时候电脑一窍不通。许嘉设过什么，没人问得出来。"
        ]
      },
      {
        "text": "我先试着开机看看。",
        "reply": [
          "好。声音要是不对，您就先关掉。"
        ]
      }
    ]
  },
  {
    "npc": "信里的事，我想在拜托您一次。"
  },
  {
    "npc": "里面看到什么，先告诉我。视频先别发，也先别联系别人。有些人的家属，经不起又来一遍。"
  },
  {
    "npc": "许嘉习惯留备份。如果他说过把什么东西放在哪里，麻烦您留意一下。"
  },
  {
    "me": "好。我先看能读出什么。"
  },
  {
    "npc": "辛苦您了。今晚我手机不关。"
  }
],
    },
    {
      id: "c0_d_bios", contact: "heman", trigger: "solved_c0_bios",
      steps: [
  {
    "me": "密码解开了。生日照里的男生是许嘉，十七岁，1998 年 12 月 3 日。"
  },
  {
    "npc": "是。蛋糕是周婷订的。奶油蹭到软盘上，许嘉擦了半天，大家催他许愿，他说等一下。"
  },
  {
    "npc": "照片里留下的东西，倒比我记得的清楚。"
  },
  {
    "me": "系统时钟停在 2000 年 4 月 5 日，早上 7 点 40。"
  },
  {
    "npc": "……"
  },
  {
    "npc": "韩老师发现他的那个早上。"
  },
  {
    "npc": "那以后电源就被拔掉了。您听到开机声了吗？我已经快想不起来了。"
  }
],
    },
  ],
});
