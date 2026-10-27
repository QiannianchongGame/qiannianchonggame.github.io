// 第三章「冰面」：宋知远之死（2026-10-29，扇区恢复 63%）
// 本章新开放：鸽讯聊天记录（2000-01 ~ 02）、站务管理→站内信。
// 主线：修复损坏的鸽讯会话 → 宋知远的坦白 → 站内信沉底的 1900 年信件 → 开发日志 TODO（客户端时钟）
//       → 晚风账号 19:52 从 JYS-486 登录 → JYS = 教研室；支线：上机登记表、贺卡藏字、老地方。
Y2K.add({
  files: [
    // ---------------- 鸽讯：损坏的会话文件 + 修复工具 ----------------
    { id: "c3_damaged", path: "C:/Program Files/鸽讯/DATA/3100512/MSG_BAD.DAT", type: "dat", date: "1980-01-01 00:00", size: "6 KB",
      requires: "ch3",
      onOpen: { note: "c3_n_damaged" },
      text: `GXMSG/2.1  会话记录文件
本机号码：3100512
对方号码：3100▒▒3
会话日期：▒▒▒▒-▒▒-▒▒
记录条数：▒▒
[校验失败：文件头 CRC 错误 0x7F3A ≠ 0x0000]
[索引区损坏，无法按时间排序，鸽讯拒绝载入]

---- 可读残片（按扇区顺序排列，不是时间顺序）----

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒学校的保送推荐下个月就定▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒明天就是情人节了▒▒▒▒▒▒
▒▒23:1▒:▒▒▒▒▒▒▒“第二个是你。”▒▒▒▒▒
▒▒▒▒许嘉，我是▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒我妈在教育局人事科▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒00:2▒:▒▒▒▒▒▒▒补课见▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒六号机▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

请运行 C:\\Program Files\\鸽讯\\GXREPAIR.EXE 修复。` },

    { id: "c3_repair_txt", path: "C:/Program Files/鸽讯/GXREPAIR.TXT", type: "txt", date: "1999-08-30 12:00", requires: "ch3",
      text: `GXREPAIR 1.0 —— 鸽讯会话记录修复工具

用途：
  会话文件的文件头损坏（CRC 错误）时，重建索引并重新导入鸽讯。

需要人工提供两项信息：
  1. 对方的鸽讯号码（7 位数字，可在鸽讯好友列表中查看）
  2. 会话日期（以第一条消息为准）

注意：
  * 会话如果跨过了零点，日期按开始的那一天算。
  * 两项都正确时才能通过校验，否则不会写入任何数据。` },

    { id: "c3_repair_exe", path: "C:/Program Files/鸽讯/GXREPAIR.EXE", type: "exe", date: "1999-08-30 12:00", size: "96 KB",
      requires: "ch3", lock: "c3_p_repair",
      text: `GXREPAIR 1.0

正在扫描 MSG_BAD.DAT ……
文件头已重建。
本机：3100512    对方：3100233（远方）
会话日期：2000-02-13 23:10:42 起
已导入 66 条消息。

修复完成。请在鸽讯中查看与「远方」的聊天记录。` },

    // ---------------- 许嘉的开发日志 ----------------
    { id: "c3_devlog", path: "C:/Program Files/WTBBS/开发日志.txt", type: "txt", date: "2000-01-30 23:12", size: "7 KB",
      requires: "ch3",
      text: `WTBBS 开发日志
（自己看的，别删）

1998-10-03
开始写。ASP + Access。PWS 跑在 3 号机上。
先做帖子列表和发帖。

1998-10-05
帖子标题带引号时显示错乱。转义。
中文用户名放进 Cookie 以后乱码。改成只存 id。

1998-10-08
上线。地址 http://192.168.1.103/
韩老师同意当指导老师。条件：不许影响上课。
注册了 sysop 和 jia。

1998-10-09
磊磊第一天就发了 40 个帖。加发帖间隔：30 秒。

1998-10-15
加板块：灌水乐园、电脑技术、校园生活、心情驿站。
灌水乐园给磊磊管。

1998-10-27
帖子编号改成全站一个序列，从 1001 开始。测试帖全部清掉。

1998-11-02
加「原创文学」版。
有人申请当版主，说想发诗。给了。

1998-11-20
楼层多了以后翻页很慢。加分页，每页 20 楼。

1998-12-06
删帖：目前只是在数据库里标记隐藏，不真删，回收站里能恢复。
TODO：thread.asp 没检查隐藏标记。先这样。

1998-12-19
数据库 1.2 MB 了。每周日备份一次到软盘。

1999-01-09
站内信做完了。
TODO：站内信的发信时间暂时取客户端时间（发信页面用 JavaScript 读发信人电脑的时钟，跟表单一起提交），以后改成服务器时间。
服务器端要改的地方太多，期末以后再说。

1999-01-17
东湖。没写代码。

1999-01-24
站内信加「已读」标记。
有人说收件箱里信的顺序是乱的。原因：列表按发信时间排序，有的同学电脑时间不准，信就排错位置。等上面那个 TODO 一起改。

1999-02-20
登录日志：记录用户名、服务器时间、IP、机器名。
全校的机器名是装机时统一起的，拼音首字母加编号：机房 JF-01 ~ JF-40，图书馆 TSG-01，校长室 XZS-01。3 号机就是 JF-03。
校外拔号的用户走梧城信息港，IP 是 61.153 开头，没有机器名。

1999-03-11
在灌水乐园跟人吵五笔和拼音，浪费一晚上。
结论：拼音要选字，五笔不用。不接受反驳。

1999-04-02
在机房用 sysop 登录了一次，身后站了好几个人。以后注意。

1999-04-30
1.2 版。加签名档、个人说明。

1999-05-15
明天去省城比赛。站务交给韩老师。发了公告。

1999-05-19
回来。有人用 sysop 发了一个帖。
删了。改了密码。sysop 以后只在 3 号机上登录。

1999-05-20
（没写）

1999-06-22
原创文学版不撤版主。

1999-07-15
暑假。每周来开一次机。

1999-09-01
高三。

1999-10-02
1.3 版。README 更新。
修了：长帖子被截断；搜索不支持空格。
没修：站内信时间那个 TODO。

1999-11-14
硬盘满了一次。删了 200 MB 临时文件。

1999-12-01
开始千年虫整改。学校让我负责。
补丁：Y2KFIX 2.1，改 BIOS 和系统日期处理。
没打补丁的机器，过了 1999-12-31 23:59，年份会跳回 1900，月、日、时、分照常走。
机房第一批 10 台（JF-01 ~ JF-10）。

1999-12-02
3 号机先打了补丁（服务器优先）。测试：手动把时钟调到 1999-12-31 23:59，等一分钟，变成 2000-01-01。正常。调回来。

1999-12-08
机房第二批。JF-17 光驱坏了，用软盘装的。

1999-12-15
机房第三批 + 图书馆 TSG-01 + 校长室 XZS-01。
JF-29 主板电池没电，换了。

1999-12-18
WTBBS 帖子和日志的日期字段改成四位。站内信的发信时间还是取客户端的，没动。

1999-12-20
整改收尾：机房 40 台 + 3 号机 + 图书馆 + 校长室，全部完成。
剩一台没动。
发了整改公告。

1999-12-23
（另记）

1999-12-31
今晚一个人在机房跨年，盯服务器。
23:59:59 → 00:00:00，3 号机显示 2000-01-01。BBS 正常。登录日志正常。

2000-01-01
（不写了）

2000-01-16
马俊在电脑技术版发帖，说他的站内信时间显示成 1980 年。他家电脑的 CMOS 电池没电，开机时间回到了 1980-01-01。
还是那个 TODO：站内信的时间取的是发信人电脑的时钟。电脑时钟是错的，信上的时间就是错的。
登录日志用的是服务器时间，不受影响。
己经拖了一年。寒假改。

2000-01-28
电子贺卡上线（情人节用）。卡片存在 DATA\\CARD\\ 下面，一张卡一个 htm 文件。
贺卡的时间取服务器时间。这次没偷懒。

2000-01-30
站内信的时间，还是没改。
末来再说。` },

    // ---------------- 许嘉的调查笔记 ----------------
    { id: "c3_note1223", path: "C:/我的文档/调查/12.23.txt", type: "txt", date: "1999-12-23 23:41", requires: "ch3",
      text: `12.23

把 5 月的服务器日志又翻了一遍。己经翻过两遍，这次是逐行看的。

5-17 21:03  sysop  发帖  来源 192.168.1.107

107 = JF-07。机房。
不是外网。不是省城。是机房里的一台学生机。
5 月 17 号是星期一，晚上是晚自习上机。

晚自习上机要登记。登记表在机房管理员那里。
去问。管理员说原件不能带走，让我复印了一张（5 月 17 号那页）。扫描件放在这个文件夹里。

登记表分两节。帖子是 21:03 发的。
JF-07 那一栏的名字，对上了。
两边坐的是谁，也对上了。

名字不写在这里。

sysop 的密码，是 4 月那次在机房登录时被人看见的。是我自己不小心。

——

她坐在水塔上的时候，知道是谁吗。

不该由我来说。
先这样。` },

    { id: "c3_note0215", path: "C:/我的文档/调查/2.15.txt", type: "txt", date: "2000-02-15 22:37", requires: "ch3",
      text: `2.15

早上到学校才知道。宋知远。东湖。

前天夜里他在鸽讯上跟我说了一个多小时。
我让他别一个人出门。有人约也别去。
他还是去了。

查了登录日志（服务器时间）：
19:52  wanfeng 登录
19:55  wanfeng 给 yuanfang 发站内信
19:58  yuanfang 登录。从家里拔号。他看到了。
21:14  Y2K 登录
21:16  Y2K 发《第二个》

wanfeng。林晚的账号。
她的密码我不知道。谁会知道？

两封信（千年虫给他的那封，晚风给他的那封）发信时间都是 1900 年。
我知道这说明什么。
先不写。得先确认。

苏芮。明天必须跟她说。

————
我那天晚上就应该替他报警。` },

    // ---------------- 5.17 晚自习机房上机登记表（复印件扫描） ----------------
    { id: "c3_signin", path: "C:/我的文档/调查/上机登记表_0517.jpg", type: "img", date: "1999-12-23 21:40", size: "212 KB",
      requires: "ch3",
      caption: "上机登记表_0517.jpg —— 复印件扫描。第 1 页 / 共 4 页（JF-01 ~ JF-10）。",
      html: `<div class="scan" style="padding:18px 22px;font-family:SimSun,'Songti SC',serif;color:#2b2416;">
<div style="text-align:center;font-size:18px;font-weight:bold;letter-spacing:4px;">梧城市第七中学 微机室上机登记表</div>
<div style="display:flex;justify-content:space-between;margin:8px 0 10px;font-size:13px;">
<span>日期：<span class="hand" style="font-size:15px;">1999 年 5 月 17 日（星期一）</span></span>
<span>时段：晚自习</span>
<span>第 <span class="hand">1</span> 页</span></div>
<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:center;">
<tr style="background:rgba(0,0,0,0.06);">
<th style="border:1px solid #6b5d40;padding:4px;width:16%;">机号</th>
<th style="border:1px solid #6b5d40;padding:4px;">第一节<br><span style="font-weight:normal;font-size:12px;">18:40 — 20:00</span></th>
<th style="border:1px solid #6b5d40;padding:4px;">第二节<br><span style="font-weight:normal;font-size:12px;">20:10 — 21:30</span></th>
<th style="border:1px solid #6b5d40;padding:4px;width:22%;">备注</th></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-01</td><td class="hand" style="border:1px solid #6b5d40;">（签名潦草）</td><td class="hand" style="border:1px solid #6b5d40;">（签名潦草）</td><td style="border:1px solid #6b5d40;"></td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-02</td><td class="hand" style="border:1px solid #6b5d40;">刘洋</td><td class="hand" style="border:1px solid #6b5d40;">刘洋</td><td class="hand" style="border:1px solid #6b5d40;font-size:12px;">打游戏，已警告</td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-03</td><td colspan="2" style="border:1px solid #6b5d40;color:#7a6a48;">服务器 · 不对学生开放</td><td style="border:1px solid #6b5d40;"></td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-04</td><td class="hand" style="border:1px solid #6b5d40;">王磊</td><td class="faded" style="border:1px solid #6b5d40;">—</td><td style="border:1px solid #6b5d40;"></td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-05</td><td class="faded" style="border:1px solid #6b5d40;">—</td><td class="hand" style="border:1px solid #6b5d40;">（签名潦草）</td><td style="border:1px solid #6b5d40;"></td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-06</td><td class="faded" style="border:1px solid #6b5d40;">—</td><td class="hand" style="border:1px solid #6b5d40;font-size:16px;">宋知远</td><td style="border:1px solid #6b5d40;"></td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-07</td><td class="hand" style="border:1px solid #6b5d40;font-size:16px;">陈小雨</td><td class="hand" style="border:1px solid #6b5d40;font-size:16px;">苏芮</td><td class="hand" style="border:1px solid #6b5d40;font-size:12px;">第一节 打印作文 2 页</td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-08</td><td class="hand" style="border:1px solid #6b5d40;">孙倩</td><td class="hand" style="border:1px solid #6b5d40;font-size:16px;">周婷</td><td style="border:1px solid #6b5d40;"></td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-09</td><td class="hand" style="border:1px solid #6b5d40;">（签名潦草）</td><td class="faded" style="border:1px solid #6b5d40;">—</td><td class="hand" style="border:1px solid #6b5d40;font-size:12px;">鼠标坏</td></tr>
<tr><td style="border:1px solid #6b5d40;padding:5px;">JF-10</td><td class="hand" style="border:1px solid #6b5d40;">赵鹏</td><td class="hand" style="border:1px solid #6b5d40;">马俊</td><td style="border:1px solid #6b5d40;"></td></tr>
</table>
<div style="margin-top:10px;font-size:12px;display:flex;justify-content:space-between;">
<span>上机须知：一人一机，按机号签名；不得玩游戏；离开前关机。</span>
<span>管理员签字：<span class="hand">（潦草）</span></span></div>
<div class="hand" style="margin-top:8px;font-size:13px;color:#8a2a1a;transform:rotate(-2deg);">（复印件右上角有许嘉的铅笔字：12.23 复印）</div>
</div>` },

    // ---------------- 剪报：梧城晚报 2000-02-16 ----------------
    { id: "c3_news", path: "C:/我的文档/调查/晚报_0216.jpg", type: "img", date: "2000-02-17 21:05", size: "168 KB",
      requires: "ch3",
      caption: "晚报_0216.jpg —— 《梧城晚报》2000 年 2 月 16 日第 3 版，剪报扫描。",
      html: `<div class="scan" style="padding:16px 20px;font-family:SimSun,'Songti SC',serif;color:#222;">
<div style="display:flex;justify-content:space-between;border-bottom:3px double #333;padding-bottom:4px;font-size:12px;">
<span style="font-size:20px;font-weight:bold;letter-spacing:6px;">梧城晚报</span>
<span>2000 年 2 月 16 日　星期三　农历正月十二　第 3 版 · 社会</span></div>
<div style="display:flex;gap:16px;margin-top:10px;">
<div style="flex:2;border-right:1px solid #999;padding-right:14px;">
<div style="font-size:18px;font-weight:bold;margin-bottom:6px;">七中学生东湖溺亡</div>
<div style="font-size:13px;line-height:1.75;text-indent:2em;">本报讯　2 月 15 日早晨 7 时许，在东湖公园晨练的市民发现北岸附近冰面有一处破裂的冰窟，冰窟边缘留有一只手套，遂报警。经打捞，确认溺亡者为市第七中学高三学生宋某（17 岁）。</div>
<div style="font-size:13px;line-height:1.75;text-indent:2em;">据警方初步调查，宋某于 14 日晚八时许独自离家外出，此后在东湖北岸一带进入未开放冰面，不慎落入冰窟。现场未发现打斗痕迹。警方初步判断为夜间独自上冰、失足落水。</div>
<div style="font-size:13px;line-height:1.75;text-indent:2em;">东湖公园管理处提醒市民：立春以后气温回升，湖面冰层已开始变薄，标有“危险”字样的冰窟区域严禁进入。露天溜冰场将于本月 20 日提前关闭。</div>
</div>
<div style="flex:1;font-size:12px;line-height:1.6;">
<div style="font-weight:bold;font-size:14px;">简讯</div>
<div style="margin:4px 0;">· 梧桐路元宵灯会 19 日起开放，市民可凭票入场。</div>
<div style="margin:4px 0;">· 本市电话号码升位后，部分老式电话机需到营业厅免费调试。</div>
<div style="margin:4px 0;">· 新华书店高考复习资料专柜开张。</div>
<div style="margin-top:10px;border:1px solid #555;padding:6px;text-align:center;">
<b>金穗复读机</b><br>英语听力好帮手<br>五一百货二楼</div>
</div></div></div>` },

    // ---------------- 照片：1999-01 东湖溜冰 ----------------
    { id: "c3_photo_ice", path: "C:/我的文档/照片/东湖溜冰_990117.jpg", type: "img", date: "1999-02-03 18:20", size: "236 KB",
      requires: "ch3",
      caption: "东湖溜冰_990117.jpg —— 照片正反面扫描。拍照的人不在照片里。",
      html: `<div class="photo"><svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" font-family="SimSun, 'Songti SC', serif">
<rect width="640" height="420" fill="#cfd9e0"/>
<rect y="0" width="640" height="170" fill="#e9eef1"/>
<path d="M0 150 Q160 135 320 148 T640 140 L640 170 L0 170Z" fill="#b8c3c9"/>
<rect y="170" width="640" height="250" fill="#dfe8ee"/>
<path d="M0 300 L640 280" stroke="#c4d0d8" stroke-width="2"/>
<path d="M30 360 L610 330" stroke="#c4d0d8" stroke-width="2"/>
<!-- 柳树 -->
<rect x="486" y="70" width="16" height="140" fill="#5b4a3a"/>
<path d="M494 75 Q470 40 440 60" stroke="#5b4a3a" stroke-width="6" fill="none"/>
<path d="M494 80 Q530 40 565 62" stroke="#5b4a3a" stroke-width="6" fill="none"/>
<g stroke="#7a6a55" stroke-width="1.5" fill="none">
<path d="M440 60 Q436 110 444 160"/><path d="M452 54 Q448 110 458 170"/><path d="M466 50 Q462 120 470 175"/>
<path d="M520 48 Q526 110 518 168"/><path d="M540 52 Q546 115 540 172"/><path d="M558 60 Q566 120 560 165"/>
<path d="M478 46 Q474 110 482 150"/><path d="M506 44 Q512 105 506 150"/></g>
<!-- 木牌 -->
<rect x="566" y="150" width="6" height="70" fill="#6b5435"/>
<rect x="540" y="138" width="80" height="34" fill="#8a6b42" stroke="#4e3b22"/>
<text x="580" y="153" font-size="11" fill="#f3ead6" text-anchor="middle">东湖公园</text>
<text x="580" y="167" font-size="12" fill="#f3ead6" text-anchor="middle">北 岸</text>
<!-- 远处危险牌 -->
<rect x="96" y="176" width="4" height="34" fill="#8b1e1e"/>
<rect x="76" y="170" width="44" height="16" fill="#c22a2a"/>
<text x="98" y="182" font-size="10" fill="#fff" text-anchor="middle">危险</text>
<path d="M60 214 Q98 204 136 216 Q98 226 60 214Z" fill="#9fb2bf"/>
<!-- 人群剪影 -->
<g fill="#3a3f47">
<circle cx="150" cy="232" r="11"/><rect x="138" y="244" width="24" height="52" rx="6"/>
<circle cx="188" cy="228" r="11"/><rect x="176" y="240" width="24" height="56" rx="6"/>
<circle cx="226" cy="230" r="11"/><rect x="214" y="242" width="24" height="54" rx="6"/>
<circle cx="264" cy="226" r="11"/><rect x="252" y="238" width="24" height="58" rx="6"/>
<circle cx="302" cy="230" r="11"/><rect x="290" y="242" width="24" height="54" rx="6"/>
<circle cx="340" cy="228" r="11"/><rect x="328" y="240" width="24" height="56" rx="6"/>
<circle cx="378" cy="232" r="11"/><rect x="366" y="244" width="24" height="52" rx="6"/>
<circle cx="416" cy="230" r="11"/><rect x="404" y="242" width="24" height="54" rx="6"/>
<circle cx="200" cy="292" r="12"/><rect x="187" y="305" width="26" height="54" rx="6"/>
<circle cx="250" cy="290" r="12"/><rect x="237" y="303" width="26" height="56" rx="6"/>
<circle cx="300" cy="292" r="12"/><rect x="287" y="305" width="26" height="54" rx="6"/>
<circle cx="350" cy="290" r="12"/><rect x="337" y="303" width="26" height="56" rx="6"/>
<circle cx="400" cy="292" r="12"/><rect x="387" y="305" width="26" height="54" rx="6"/>
</g>
<g fill="#b33a3a"><rect x="252" y="246" width="24" height="10"/><rect x="290" y="248" width="24" height="10"/></g>
<text x="608" y="404" font-size="18" fill="#f08a2a" text-anchor="end" font-family="'Courier New', monospace" font-weight="bold">99 1 17</text>
</svg></div>
<div class="scan" style="margin-top:12px;padding:14px 18px;">
<div style="font-size:12px;color:#7a6a48;">（照片背面）</div>
<div class="hand" style="font-size:16px;line-height:1.9;">
1999.1.17　东湖　高二(2)班<br>
后排左起：赵鹏　刘洋　周婷　宋知远　王磊　马俊　苏芮　孙倩<br>
前排左起：何蔓　陈小雨　李静　（还有一个看不清）　林晚<br>
大鹏说：以后溜冰都在这儿集合，就叫“老地方”！</div>
<div class="hand" style="font-size:13px;color:#555;text-align:right;">——许嘉 拍</div></div>` },

    { id: "c3_ticket", path: "C:/我的文档/照片/票根.jpg", type: "img", date: "1999-02-03 18:26", size: "54 KB",
      requires: "ch3",
      caption: "票根.jpg —— 东湖溜冰场入场券。背面另存了一张。",
      props: { "备注": "背面那张设成隐藏了。别人借我电脑的时候不想被看见。" },
      html: `<div class="scan" style="width:420px;margin:20px auto;padding:0;font-family:SimSun,'Songti SC',serif;border:2px dashed #8a6b42;">
<div style="display:flex;">
<div style="flex:3;padding:12px 14px;border-right:2px dashed #8a6b42;">
<div style="font-size:12px;">梧城市东湖公园管理处</div>
<div style="font-size:20px;font-weight:bold;letter-spacing:3px;margin:4px 0;">露天溜冰场 入场券</div>
<div style="font-size:13px;">成人　票价：叁元　　限当日有效</div>
<div style="font-size:12px;margin-top:6px;">冰面危险区域严禁进入　租用冰刀另计</div>
<div class="mono" style="font-size:13px;margin-top:6px;color:#8b1e1e;">No. 0047521</div></div>
<div style="flex:1;padding:12px 8px;text-align:center;font-size:12px;">副券<br><br><span class="stamp" style="font-size:13px;">1999.01.17</span></div>
</div></div>` },

    { id: "c3_ticket_back", path: "C:/我的文档/照片/票根_背面.jpg", type: "img", date: "1999-02-03 18:27", size: "49 KB",
      requires: "ch3", hidden: true,
      onOpen: { collect: "poem8", toast: "票根背面是林晚的字。" },
      caption: "票根_背面.jpg",
      html: `<div class="scan" style="width:420px;margin:20px auto;padding:14px 20px;border:2px dashed #8a6b42;">
<div class="hand" style="font-size:17px;line-height:1.9;color:#2a3a5a;">
冰面下面<br>鱼也在过冬<br>它们听不见<br>上面有人在转圈<br>笑声一层一层落下去<br>变成很细的裂纹</div>
<div class="hand" style="font-size:13px;text-align:right;color:#2a3a5a;margin-top:6px;">——借你的票根写的，不许弄丢。　晚</div>
</div>` },

    // ---------------- WTBBS 电子贺卡（服务器上存的 htm，一张一个文件；时间是服务器时间） ----------------
    { id: "c3_card1", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0001.HTM", type: "htm", date: "2000-01-28 22:51", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：嘉(jia)　To：嘉(jia)　2000-01-28 22:51</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">测试</div>
<div style="font-size:14px;">测试。测试。中文。English。&lt;b&gt;转义&lt;/b&gt;。</div></div>` },

    { id: "c3_card2", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0002.HTM", type: "htm", date: "2000-02-11 19:30", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：磊磊(leilei)　To：倩倩(sunqian)　2000-02-11 19:30</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">♥ 灌水大王祝你情人节快乐 ♥</div>
<div style="font-size:14px;line-height:1.8;">本卡全站群发，见者有份，不要多想 ^_^<br>如果你多想了……那也行。<br>——磊磊（第 7 张）</div></div>` },

    { id: "c3_card3", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0003.HTM", type: "htm", date: "2000-02-11 19:33", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：磊磊(leilei)　To：小雨(xiaoyu)　2000-02-11 19:33</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">♥ 灌水大王祝你情人节快乐 ♥</div>
<div style="font-size:14px;line-height:1.8;">本卡全站群发，见者有份，不要多想 ^_^<br>学委，数学卷子借我看一眼……<br>——磊磊（第 8 张）</div></div>` },

    { id: "c3_card4", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0004.HTM", type: "htm", date: "2000-02-13 21:05", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：大鹏(zhaopeng)　To：小雨(xiaoyu)　2000-02-13 21:05</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">情人节快乐</div>
<div style="font-size:14px;line-height:1.8;">学委：<br>上学期运动会的报名表还是你帮我抄的，一直没谢你。<br>别多想啊！就是谢谢。<br>（真的别多想）<br>——大鹏</div></div>` },

    { id: "c3_card5", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0005.HTM", type: "htm", date: "2000-02-14 07:12", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：小芮(xiaorui)　To：静静(lijing)　2000-02-14 07:12</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">广播站姐妹情人节快乐！！！</div>
<div style="font-size:14px;line-height:1.8;">静静！！今天的早播你念得超好！！<br>“各位老师、同学，早上好！今天是二月十四日，星期一！”——这一句你比我念得还标准！！<br>以后的早播我们一起加油！！<br>——小芮</div></div>` },

    { id: "c3_card6", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0006.HTM", type: "htm", date: "2000-02-14 12:48", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：马甲(majun)　To：小雨(xiaoyu)　2000-02-14 12:48</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">猜猜我是谁？</div>
<div style="font-size:14px;line-height:1.8;">站长说贺卡不能匿名。<br>那我就不写名字了。<br>你猜吧。<br>（提示：我坐你斜后方）</div></div>` },

    { id: "c3_card_yf", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0007.HTM", type: "htm", date: "2000-02-14 16:42", requires: "ch3",
      onOpen: { set: ["c3_seen_card"] },
      html: `<div style="font-family:KaiTi,STKaiti,serif;max-width:460px;margin:20px auto;border:3px double #c03;padding:18px 22px;background:#fff6f6;">
<div style="font-family:SimSun,serif;font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：远方(yuanfang)　To：小芮(xiaorui)　2000-02-14 16:42</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:12px 0 14px;">给你</div>
<div style="font-size:17px;line-height:1.95;letter-spacing:1px;">
千禧年的第一场雪<br>
新年的钟声敲过以后<br>
连飞虫都躲进了墙缝<br>
我一直知道你在等春天<br>
冬天的街道很长很安静<br>
我总觉得这是最好的冬天<br>
原谅去年春天我说过的话<br>
记得柳树下的我们吗<br>
冰面上并排站着的三个人<br>
我一直想要告诉你一个秘密<br>
可是我比你想象的要胆小得多<br>
天黑以后路上你一定要小心</div>
<div style="font-size:14px;color:#555;margin-top:14px;line-height:1.7;">P.S. 第一行的第一个字，第二行的第二个字……<br>我说的每一句话，都比上一句更往后退一步。</div>
<div style="font-size:14px;text-align:right;margin-top:8px;">——远方</div></div>` },

    { id: "c3_card8", path: "C:/Program Files/WTBBS/DATA/CARD/CARD0008.HTM", type: "htm", date: "2000-02-14 17:20", requires: "ch3",
      html: `<div style="font-family:SimSun,serif;max-width:420px;margin:20px auto;border:3px double #c03;padding:16px;background:#fff6f6;">
<div style="font-size:12px;color:#888;">梧桐树下 · 电子贺卡　　From：洋洋得意(liuyang)　To：静静(lijing)　2000-02-14 17:20</div>
<div style="font-size:22px;color:#c03;text-align:center;margin:14px 0;">情人节快乐！</div>
<div style="font-size:14px;line-height:1.8;">周六有空吗？<br>一起去千禧网吧……不是，一起去看电影。<br>《冰河之恋》，梧桐影院，下午两点场。<br>——刘洋</div></div>` },
  ],

  bbs: {
    threads: [
      { id: 1602, board: "xiaoyuan", title: "广播站寒假停播通知！！", author: "xiaorui", date: "2000-01-06 12:20", ip: "192.168.1.111", views: 88, requires: "ch3",
        posts: [
          { author: "xiaorui", date: "2000-01-06 12:20", html: "各位老师、同学，中午好！<br>本学期广播站最后一次早播是 1 月 14 日（星期五）！寒假期间停播，2 月 10 日补课开学当天恢复！<br>寒假里有想点的歌、想说的话，可以在本帖回复，开学第一期“新学期新气象”特别节目会挑着播！！<br>——广播站 小芮" },
          { author: "lijing", date: "2000-01-06 13:02", html: "收到！周三早播我照常值到 1 月 12 号。" },
          { author: "leilei", date: "2000-01-06 13:40", html: "点一首《晴天里的风筝》送给全体高三，祝大家寒假不用补课（不可能）" },
          { author: "sunqian", date: "2000-01-06 18:15", html: "能点一首婷婷唱过的歌吗……就是晚会上那首。" },
          { author: "xiaorui", date: "2000-01-06 21:30", html: "……好。我记下了。" },
        ] },

      { id: 1605, board: "guanshui", title: "千禧网吧寒假通宵价出炉！！", author: "liuyang", date: "2000-01-08 19:10", views: 156, requires: "ch3",
        posts: [
          { author: "liuyang", date: "2000-01-08 19:10", html: "寒假通宵：晚 10 点到早 8 点，十块！！<br>3 号包间四台机器连着，星际 2v2 无敌。<br>报我名字老板不打折，但会多给一瓶汽水。" },
          { author: "leilei", date: "2000-01-08 19:22", html: "你妈知道吗" },
          { author: "liuyang", date: "2000-01-08 19:25", html: "我妈以为我在你家复习" },
          { author: "leilei", date: "2000-01-08 19:26", html: "？？？那我妈以为我在哪" },
          { author: "majun", date: "2000-01-08 20:40", html: "千禧网吧门口那个“千禧”的灯管坏了一半，现在晚上看是“千口网吧”" },
        ] },

      { id: 1607, board: "xinqing", title: "婷婷，我好想你", author: "sunqian", date: "2000-01-10 22:47", views: 203, requires: "ch3",
        posts: [
          { author: "sunqian", date: "2000-01-10 22:47", html: "今天收拾抽屉，翻出来你借我的那支粉色的笔。<br>你说等千禧年过完了再还你。<br>我一直坐在你旁边，到现在上课还会往右边看。<br>你的版我替你看着，不会让人在这里乱说话的。" },
          { author: "xiaoyu", date: "2000-01-10 23:05", html: "抱抱倩倩。" },
          { author: "xiaorui", date: "2000-01-11 06:58", html: "婷婷……我每天早上开广播的时候，都会想起你站在我旁边试麦的样子。<br>“喂喂，一二三，偶是周婷~”" },
          { author: "leilei", date: "2000-01-11 12:30", html: "婷婷一路走好。" },
        ] },

      { id: 1609, board: "guanshui", title: "期末考完了！！寒假去哪儿疯？", author: "leilei", date: "2000-01-12 17:35", views: 241, requires: "ch3",
        posts: [
          { author: "leilei", date: "2000-01-12 17:35", html: "考完了考完了考完了！！！<br>物理最后一道大题谁做出来了？我写了一句“由题意得”就交了。<br>寒假去哪儿玩，报名！" },
          { author: "liuyang", date: "2000-01-12 17:40", html: "千禧网吧。见 1605。" },
          { author: "zhaopeng", date: "2000-01-12 18:02", html: "东湖冻上了！溜冰！我来组织，过几天发帖。" },
          { author: "xiaoyu", date: "2000-01-12 18:30", html: "物理最后一题是动量守恒……你写“由题意得”能得 1 分吧。" },
          { author: "sunqian", date: "2000-01-12 20:10", html: "我想去看看婷婷。" },
          { author: "leilei", date: "2000-01-12 20:15", html: "……倩倩，到时候我们陪你一起去。" },
        ] },

      { id: 1612, board: "diannao", title: "站内信时间显示成1980年？？见鬼了", author: "majun", date: "2000-01-16 15:05", ip: "192.168.1.122", views: 97, requires: "ch3",
        posts: [
          { author: "majun", date: "2000-01-16 15:05", html: "我昨晚在家给磊磊发了封站内信，今天他说收到的信时间是 1980-01-01 01:07。<br>啥情况？站内信穿越了？" },
          { author: "leilei", date: "2000-01-16 15:20", html: "真的！而且他那封信排在我收件箱最底下，我翻了好久才找到。" },
          { author: "jia", date: "2000-01-16 21:50", html: "站内信的发信时间取的是你自己电脑的时钟，不是服务器的。<br>你家电脑开机时间是不是回到了 1980 年？那是主板上的 CMOS 电池没电了，换一颗纽扣电池就好。<br>列表是按发信时间排的，所以你的信排到最底下去了。<br>登录日志用的是服务器时间，不受影响。<br>这个问题下个版本改。" },
          { author: "majun", date: "2000-01-16 22:03", html: "开机一看还真是 1980……站长牛。" },
          { author: "liuyang", date: "2000-01-16 22:30", html: "那我把电脑时间调成 2008 年，是不是我的信就永远排在第一个？" },
          { author: "jia", date: "2000-01-16 22:41", html: "是。别这么干。" },
        ] },

      { id: 1614, board: "guanshui", title: "周六东湖溜冰！老地方集合！", author: "zhaopeng", date: "2000-01-18 13:20", ip: "192.168.1.150", views: 188, requires: "ch3",
        posts: [
          { author: "zhaopeng", date: "2000-01-18 13:20", html: "寒假最后一次集体活动！（再不玩就高三下学期了）<br>周六（22 号）上午九点，东湖溜冰场，<b>老地方</b>集合。<br>老地方就是去年一月全班去溜冰、拍大合影的那个地方，不认识路的跟我走。<br>冰刀自备，没有的现场租，五块钱一小时。" },
          { author: "leilei", date: "2000-01-18 13:31", html: "去去去！！去年我摔了八跤，这次要报仇！" },
          { author: "xiaoyu", date: "2000-01-18 14:05", html: "我周六要去补英语……你们玩得开心。" },
          { author: "liuyang", date: "2000-01-18 14:40", html: "网吧不香吗" },
          { author: "yuanfang", date: "2000-01-18 20:12", html: "注意安全。去年那片冰窟附近不要过去，管理处插了牌子。高三了，别摔断胳膊。" },
          { author: "zhaopeng", date: "2000-01-18 20:20", html: "收到班长！" },
          { author: "sunqian", date: "2000-01-19 09:10", html: "去年婷婷就站在那棵树底下唱歌……我不去了。" },
        ] },

      { id: 1617, board: "wenxue", title: "原创文学版好久没人发东西了", author: "xiaoyu", date: "2000-01-22 21:40", views: 64, requires: "ch3",
        posts: [
          { author: "xiaoyu", date: "2000-01-22 21:40", html: "随便写一段，算是给这个版除除草。<br><br>《雪》<br>早上推开窗，楼下的自行车都戴上了白帽子。<br>我想起数学老师说，雪花是六角形的，因为水分子的夹角是一百零四度半。<br>可我还是更喜欢不知道答案的时候。" },
          { author: "qingman", date: "2000-01-22 22:15", html: "她以前每天都会来这里。" },
          { author: "jia", date: "2000-01-22 22:31", html: "原创文学版的版主不撤。" },
          { author: "xiaoyu", date: "2000-01-22 22:40", html: "嗯。我们都记得。" },
        ] },

      { id: 1620, board: "zhanwu", title: "寒假期间 BBS 服务说明", author: "sysop", date: "2000-01-25 10:05", ip: "192.168.1.103", views: 120, requires: "ch3",
        posts: [
          { author: "sysop", date: "2000-01-25 10:05", html: "1. 寒假期间服务器（机房 3 号机）照常运行，请勿到机房乱动服务器。<br>2. 校外同学请通过梧城信息港拨号访问。<br>3. 站长每周二、周五到校维护，有问题请发站内信给 sysop 或 jia。<br>4. 情人节前会上线一个新功能，敬请期待。" },
        ] },

      { id: 1622, board: "diannao", title: "新功能：电子贺卡（情人节用）", author: "jia", date: "2000-01-28 23:02", ip: "192.168.1.103", views: 302, requires: "ch3",
        posts: [
          { author: "jia", date: "2000-01-28 23:02", html: "个人页面多了一个“发贺卡”按钮。<br>可以选背景、写一段话，对方登录后会收到提示。<br>注意：<br>1. 贺卡存在服务器上（WTBBS\\DATA\\CARD 目录，一张一个文件），发出去就不能撤回。<br>2. 贺卡显示服务器时间。<br>3. 不能匿名。" },
          { author: "leilei", date: "2000-01-28 23:10", html: "站长万岁！！！我要全站群发！！" },
          { author: "majun", date: "2000-01-29 09:20", html: "真的不能匿名吗……" },
          { author: "jia", date: "2000-01-29 11:02", html: "不能。" },
          { author: "xiaorui", date: "2000-01-29 14:30", html: "好浪漫！！广播站可以在情人节早播里念几张吗？！（经过本人同意的那种！）" },
        ] },

      { id: 1625, board: "guanshui", title: "高考倒计时 157 天！！", author: "leilei", date: "2000-02-01 07:30", views: 140, requires: "ch3",
        posts: [
          { author: "leilei", date: "2000-02-01 07:30", html: "今天 2 月 1 号，离 7 月 7 号还有 157 天。<br>今年是闰年，二月有 29 天，白白多出一天要复习，谢谢老天。" },
          { author: "xiaoyu", date: "2000-02-01 08:12", html: "我算了一下，是 157 天没错。" },
          { author: "zhaopeng", date: "2000-02-01 09:00", html: "157 天，每天少打一小时游戏，就是 157 小时。（刘洋看到请回答）" },
          { author: "liuyang", date: "2000-02-01 11:45", html: "已读不回" },
        ] },

      { id: 1628, board: "guanshui", title: "龙年大吉！！全站拜年帖", author: "leilei", date: "2000-02-05 00:01", views: 410, requires: "ch3",
        posts: [
          { author: "leilei", date: "2000-02-05 00:01", html: "零点整！！新千年第一个春节！！<br>灌水大王给全站拜年啦！龙年大吉，高考全中！！" },
          { author: "liuyang", date: "2000-02-05 00:04", html: "新年好！压岁钱已经规划好了，全部捐给千禧网吧。" },
          { author: "zhaopeng", date: "2000-02-05 08:30", html: "过年好！初三东湖还能溜一次，有人去吗？" },
          { author: "xiaoyu", date: "2000-02-05 09:31", html: "新年快乐～祝大家今年都考到想去的地方。" },
          { author: "qingman", date: "2000-02-05 10:12", html: "大家新年快乐。高考加油，在接在厉。" },
          { author: "xiaorui", date: "2000-02-05 10:40", html: "新年快乐！！广播站全体给大家拜年啦！！开学见！！" },
          { author: "yuanfang", date: "2000-02-05 11:20", html: "新年快乐。今年，北京见。" },
          { author: "jia", date: "2000-02-08 15:10", html: "新年好。" },
        ] },

      { id: 1631, board: "guanshui", title: "千年虫还会出来吗？", author: "liuyang", date: "2000-02-08 22:15", views: 335, requires: "ch3",
        posts: [
          { author: "liuyang", date: "2000-02-08 22:15", html: "网吧里有人说，元旦那个“千年虫”是外校的黑客，还说他会发“第二个”……真的假的？" },
          { author: "leilei", date: "2000-02-08 22:20", html: "大过年的别吓人。" },
          { author: "majun", date: "2000-02-08 22:41", html: "外校的人能登咱们内网？用脑子想想。" },
          { author: "xiaoyu", date: "2000-02-08 23:00", html: "别传了，后天就开学补课了，好好复习吧。" },
          { author: "yuanfang", date: "2000-02-09 09:15", html: "无聊。这种帖子建议版主删除，只会制造恐慌。" },
          { author: "leilei", date: "2000-02-09 09:40", html: "班长发话了，我这个版主……先不删，留着让大家看看有多无聊。" },
        ] },

      { id: 1634, board: "xiaoyuan", title: "【置顶】高三下学期补课课表", author: "xiaoyu", date: "2000-02-10 07:20", ip: "192.168.1.150", views: 290, sticky: true, requires: "ch3",
        posts: [
          { author: "xiaoyu", date: "2000-02-10 07:20", html: "2 月 10 日起补课，周一至周六。<br>上午 7:40—11:50，四节；下午 14:00—16:30，三节；<br>晚自习 18:40—21:30（周日休息）。<br>周一、周三晚自习可以去微机室上机查资料，要登记。<br>数学两套卷子周五前交班长。" },
          { author: "zhaopeng", date: "2000-02-10 08:00", html: "周六也补……我的篮球……" },
          { author: "yuanfang", date: "2000-02-10 12:30", html: "卷子周五前交到我这里，不收迟交的。" },
        ] },

      { id: 1637, board: "guanshui", title: "情人节送什么？在线等，急", author: "majun", date: "2000-02-12 20:30", views: 266, requires: "ch3",
        posts: [
          { author: "majun", date: "2000-02-12 20:30", html: "预算二十块以内。巧克力会不会太俗？" },
          { author: "leilei", date: "2000-02-12 20:35", html: "电子贺卡！站长新做的，不要钱！我已经群发了 30 张。" },
          { author: "liuyang", date: "2000-02-12 20:41", html: "送网吧通宵卡，实用。" },
          { author: "sunqian", date: "2000-02-12 21:02", html: "你们男生……" },
          { author: "majun", date: "2000-02-12 21:10", html: "贺卡不能匿名啊！！我要的就是匿名！！" },
        ] },

      { id: 1640, board: "xiaoyuan", title: "关于高三下学期班级纪律的几点意见", author: "yuanfang", date: "2000-02-13 15:22", ip: "61.153.51.92", views: 172, requires: "ch3",
        posts: [
          { author: "yuanfang", date: "2000-02-13 15:22", html: "距离高考只有 145 天。作为班长，提几点意见，请大家认真对待：<br>一、晚自习不得讲话、传纸条。有问题课后问。<br>二、作业按时上交。上周数学卷子我们班是全年级最后一个交齐的，这很丢人。<br>三、BBS 灌水请适度。高三下学期，时间比什么都贵。<br>四、晚自习后请尽量结伴回家。<br>以上，望共勉。——宋知远" },
          { author: "leilei", date: "2000-02-13 15:40", html: "班长威武。第三条我看见了，我假装没看见。" },
          { author: "liuyang", date: "2000-02-13 16:05", html: "第三条能不能删" },
          { author: "xiaoyu", date: "2000-02-13 16:30", html: "支持班长。卷子我周五一定交齐。" },
          { author: "zhaopeng", date: "2000-02-13 18:10", html: "第四条我赞成，男生可以送女生。" },
        ] },

      { id: 1643, board: "guanshui", title: "第二个", author: "Y2K", date: "2000-02-14 21:16", ip: "192.168.1.200", views: 1288, requires: "ch3",
        onOpen: { note: "c3_n_post2" },
        posts: [
          { author: "Y2K", date: "2000-02-14 21:16", html: "第二个。冰会记得。" },
          { author: "leilei", date: "2000-02-14 21:31", html: "又来？？大过节的有意思吗" },
          { author: "liuyang", date: "2000-02-14 21:44", html: "“冰会记得”……啥意思" },
          { author: "majun", date: "2000-02-14 22:05", html: "第一个是元旦那天……那“第二个”是谁？？" },
          { author: "xiaoyu", date: "2000-02-15 07:52", html: "……你们看到通知了吗。班长。" },
          { author: "zhaopeng", date: "2000-02-15 08:10", html: "不会吧。" },
          { author: "sunqian", date: "2000-02-15 12:30", html: "我好怕。" },
          { author: "lijing", date: "2000-02-15 12:41", html: "警察今天来学校了。" },
        ] },

      { id: 1645, board: "xiaoyuan", title: "班长", author: "xiaoyu", date: "2000-02-15 08:30", ip: "192.168.1.150", views: 512, requires: "ch3",
        posts: [
          { author: "xiaoyu", date: "2000-02-15 08:30", html: "今天早上顾老师在班里说了班长的事。<br>昨天下午他还站在讲台上收数学卷子，说我们班交得最慢。<br>他的座位还空着，卷子还在他桌上，一张一张码得很整齐。<br>我不知道该说什么。<br>班长，你不用再考第一了。" },
          { author: "zhaopeng", date: "2000-02-15 09:02", html: "班长，一路走好。" },
          { author: "leilei", date: "2000-02-15 09:20", html: "他昨天还骂我作业抄得太明显……" },
          { author: "sunqian", date: "2000-02-15 10:15", html: "报纸上会说是意外吧。又是意外。" },
          { author: "xiaorui", date: "2000-02-15 21:40", html: "……" },
        ] },

      { id: 1647, board: "guanshui", title: "千年虫是谁，大家心里没数吗？", author: "majun", date: "2000-02-15 13:10", ip: "192.168.1.122", views: 877, requires: "ch3",
        posts: [
          { author: "majun", date: "2000-02-15 13:10", html: "我就问几个问题：<br>1. 千年虫的帖子都是从校内网发的。谁天天待在机房？<br>2. 谁有站长权限，想发什么发什么，想删什么删什么？<br>3. 元旦那天晚上，全校都在操场，谁一个人在机房？<br>4. 去年那个扒人的帖子，是用谁的账号发的？<br>我不点名。大家自己想。" },
          { author: "leilei", date: "2000-02-15 13:22", html: "马俊你别瞎说！！" },
          { author: "liuyang", date: "2000-02-15 13:40", html: "……说的也不是没道理。" },
          { author: "xiaoyu", date: "2000-02-15 14:05", html: "警察会查的，不要在这里乱猜。" },
          { author: "sunqian", date: "2000-02-15 14:30", html: "婷婷那天晚上收到的传呼，署名是“X”。" },
          { author: "leilei", date: "2000-02-15 14:51", html: "署名 X 就是许嘉？那我署名 L 就是林……算了。我不说了。" },
        ] },

      { id: 1649, board: "zhanwu", title: "关于千年虫，我只说一次", author: "jia", date: "2000-02-16 07:15", ip: "192.168.1.103", views: 1033, sticky: true, requires: "ch3",
        posts: [
          { author: "jia", date: "2000-02-16 07:15", html: "我不是千年虫。我知道说这句话没什么用。<br>两次的服务器日志，我己经全部交给警察了。<br>如果你收到署名“千年虫”的站内信，或者有人约你晚上单独出去——不要去。告诉老师，或者报警。也可以告诉我。<br>晚上别一个人走。<br>这个帖子不开回复。" },
        ] },

      { id: 1652, board: "xiaoyuan", title: "【转】教导处通知：晚自习后请结伴回家", author: "xiaoyu", date: "2000-02-17 12:10", ip: "192.168.1.150", views: 344, requires: "ch3",
        posts: [
          { author: "xiaoyu", date: "2000-02-17 12:10", html: "教导处通知：<br>近期气温回升，东湖冰面开始融化，严禁学生上冰。<br>晚自习放学后请同学们结伴回家，不要在外单独逗留。<br>如收到陌生人或可疑的约见信息，请及时报告班主任。<br>——学习委员 陈小雨 转" },
          { author: "zhaopeng", date: "2000-02-17 12:40", html: "男生分组送女生，名单我来排，今晚开始。" },
          { author: "lijing", date: "2000-02-17 13:05", html: "广播站的同学早上六点半就要到，能不能也有人陪一下……" },
          { author: "zhaopeng", date: "2000-02-17 13:20", html: "早上我陪。我家离学校近。" },
        ] },

      { id: 1655, board: "xinqing", title: "为什么是他们", author: "sunqian", date: "2000-02-19 23:10", views: 620, requires: "ch3",
        posts: [
          { author: "sunqian", date: "2000-02-19 23:10", html: "婷婷，班长。<br>一个在水塔，一个在东湖。<br>千年虫说“第一个”“第二个”。那第三个是谁？<br>我晚上不敢关灯睡觉。" },
          { author: "majun", date: "2000-02-19 23:25", html: "我听说……跟去年那个帖子有关。你们自己想想，去年五月那会儿，婷婷和班长……算了，不说了。" },
          { author: "leilei", date: "2000-02-19 23:30", html: "马俊你够了。" },
          { author: "xiaorui", date: "2000-02-19 23:52", html: "求求你们别说了。" },
          { author: "xiaoyu", date: "2000-02-20 00:10", html: "倩倩，明天晚上我陪你走。" },
        ] },

      { id: 1658, board: "guanshui", title: "灌水大王暂停灌水一周", author: "leilei", date: "2000-02-20 11:15", views: 208, requires: "ch3",
        posts: [
          { author: "leilei", date: "2000-02-20 11:15", html: "这周不灌了。<br>大家晚上别一个人出门。<br>本来想加个笑脸的，算了。" },
          { author: "liuyang", date: "2000-02-20 11:30", html: "+1。网吧我也不去了。" },
          { author: "zhaopeng", date: "2000-02-20 12:00", html: "+1" },
        ] },
    ],

    // 登录日志：服务器时间（3 号机打过补丁，年份正确）
    loginLog: [
      { user: "jia", time: "2000-01-06 08:12:33", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "xiaorui", time: "2000-01-06 12:18:40", ip: "192.168.1.111", host: "JF-11", requires: "ch3" },
      { user: "liuyang", time: "2000-01-08 19:05:44", ip: "61.153.12.209", host: "-", requires: "ch3" },
      { user: "sunqian", time: "2000-01-10 22:31:02", ip: "61.153.40.66", host: "-", requires: "ch3" },
      { user: "leilei", time: "2000-01-12 17:20:19", ip: "61.153.7.31", host: "-", requires: "ch3" },
      { user: "majun", time: "2000-01-16 15:02:58", ip: "192.168.1.122", host: "JF-22", requires: "ch3" },
      { user: "jia", time: "2000-01-16 21:47:13", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "zhaopeng", time: "2000-01-18 13:15:40", ip: "192.168.1.150", host: "TSG-01", requires: "ch3" },
      { user: "qingman", time: "2000-01-22 22:09:51", ip: "61.153.33.18", host: "-", requires: "ch3" },
      { user: "sysop", time: "2000-01-25 10:02:11", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "jia", time: "2000-01-28 22:40:05", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "leilei", time: "2000-02-01 07:20:37", ip: "61.153.7.31", host: "-", requires: "ch3" },
      { user: "leilei", time: "2000-02-04 23:58:21", ip: "61.153.7.31", host: "-", requires: "ch3" },
      { user: "xiaoyu", time: "2000-02-05 09:30:48", ip: "61.153.20.144", host: "-", requires: "ch3" },
      { user: "qingman", time: "2000-02-05 10:11:02", ip: "61.153.33.18", host: "-", requires: "ch3" },
      { user: "yuanfang", time: "2000-02-05 11:18:26", ip: "61.153.51.92", host: "-", requires: "ch3" },
      { user: "jia", time: "2000-02-08 15:05:39", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "xiaoyu", time: "2000-02-10 07:15:16", ip: "192.168.1.150", host: "TSG-01", requires: "ch3" },
      { user: "majun", time: "2000-02-12 20:28:09", ip: "61.153.18.240", host: "-", requires: "ch3" },
      { user: "Y2K", time: "2000-02-12 18:34:51", ip: "192.168.1.200", host: "JYS-486", requires: "ch3" },
      { user: "yuanfang", time: "2000-02-12 20:41:27", ip: "61.153.51.92", host: "-", requires: "ch3" },
      { user: "yuanfang", time: "2000-02-13 15:19:08", ip: "61.153.51.92", host: "-", requires: "ch3" },
      { user: "jia", time: "2000-02-13 19:40:22", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "yuanfang", time: "2000-02-13 22:58:40", ip: "61.153.51.92", host: "-", requires: "ch3" },
      { user: "xiaorui", time: "2000-02-14 07:10:05", ip: "192.168.1.150", host: "TSG-01", requires: "ch3" },
      { user: "majun", time: "2000-02-14 12:46:33", ip: "192.168.1.122", host: "JF-22", requires: "ch3" },
      { user: "lijing", time: "2000-02-14 13:02:47", ip: "192.168.1.150", host: "TSG-01", requires: "ch3" },
      { user: "yuanfang", time: "2000-02-14 16:40:12", ip: "192.168.1.106", host: "JF-06", requires: "ch3" },
      { user: "liuyang", time: "2000-02-14 17:18:30", ip: "192.168.1.102", host: "JF-02", requires: "ch3" },
      { user: "wanfeng", time: "2000-02-14 19:52:07", ip: "192.168.1.200", host: "JYS-486", requires: "ch3" },
      { user: "yuanfang", time: "2000-02-14 19:58:14", ip: "61.153.51.92", host: "-", requires: "ch3" },
      { user: "Y2K", time: "2000-02-14 21:14:39", ip: "192.168.1.200", host: "JYS-486", requires: "ch3" },
      { user: "leilei", time: "2000-02-14 21:29:50", ip: "61.153.7.31", host: "-", requires: "ch3" },
      { user: "majun", time: "2000-02-14 22:03:12", ip: "61.153.18.240", host: "-", requires: "ch3" },
      { user: "xiaoyu", time: "2000-02-15 07:48:02", ip: "192.168.1.150", host: "TSG-01", requires: "ch3" },
      { user: "majun", time: "2000-02-15 13:06:15", ip: "192.168.1.122", host: "JF-22", requires: "ch3" },
      { user: "jia", time: "2000-02-15 21:03:00", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "jia", time: "2000-02-16 07:12:44", ip: "192.168.1.103", host: "JF-03", requires: "ch3" },
      { user: "xiaorui", time: "2000-02-16 20:45:31", ip: "61.153.28.75", host: "-", requires: "ch3" },
      { user: "xiaoyu", time: "2000-02-17 12:05:58", ip: "192.168.1.150", host: "TSG-01", requires: "ch3" },
      { user: "zhaopeng", time: "2000-02-19 16:30:44", ip: "192.168.1.130", host: "JF-30", requires: "ch3" },
      { user: "sunqian", time: "2000-02-19 23:05:10", ip: "61.153.40.66", host: "-", requires: "ch3" },
      { user: "leilei", time: "2000-02-20 11:05:27", ip: "61.153.7.31", host: "-", requires: "ch3" },
    ],

    // 站内信：date = 发信人电脑上的时钟（WTBBS 缺陷 2）。从 JYS-486 发出、2000 年以后的信显示 1900 年。
    mails: [
      { id: "c3_mail_n01", from: "jia", to: "hanli", date: "1998-10-08 16:20", subject: "BBS 上线了", requires: "ch3",
        body: "韩老师：<br>梧桐树下已经可以访问了，地址 http://192.168.1.103/ 。<br>您的账号是 hanli，初始密码我当面告诉您。<br>许嘉" },
      { id: "c3_mail_n02", from: "hanli", to: "jia", date: "1998-10-09 08:05", subject: "回复：BBS 上线了", requires: "ch3",
        body: "看到了。不错。<br>注意不要影响学习。<br>韩" },
      { id: "c3_mail_n03", from: "leilei", to: "jia", date: "1998-10-10 19:44", subject: "灌水版版主！！", requires: "ch3",
        body: "站长大人~ 灌水乐园给我管吧！保证每天 100 帖 ^_^" },
      { id: "c3_mail_n04", from: "jia", to: "leilei", date: "1998-10-15 21:02", subject: "回复：灌水版版主！！", requires: "ch3",
        body: "给你了。别刷屏。30 秒的限制就是给你加的。" },
      { id: "c3_mail_n05", from: "wanfeng", to: "jia", date: "1998-11-02 21:30", subject: "申请", requires: "ch3",
        body: "你好。我是高二(2)班新转来的林晚。<br>想问问 BBS 上能不能开一个发诗的版。如果可以，我想帮忙管。<br>——晚风" },
      { id: "c3_mail_n06", from: "jia", to: "wanfeng", date: "1998-11-02 22:05", subject: "回复：申请", requires: "ch3",
        body: "开了。原创文学。你是版主。" },
      { id: "c3_mail_n07", from: "xiaorui", to: "jia", date: "1998-11-06 12:30", subject: "校园生活版版主申请！", requires: "ch3",
        body: "站长你好！！我是广播站的苏芮！<br>校园生活版能交给我吗？！广播站每天都有学校的新鲜事，我保证让这个版天天有内容！！<br>谢谢站长！！" },
      { id: "c3_mail_n08", from: "tingting", to: "jia", date: "1998-12-20 20:15", subject: "圣诞晚会~~", requires: "ch3",
        body: "嘉嘉GG~ 圣诞晚会偶们班出合唱，你来帮忙放伴奏带好不好~~<br>求你啦！！！<br>886~" },
      { id: "c3_mail_n09", from: "yuanfang", to: "zhaopeng", date: "1999-01-14 20:10", subject: "周日溜冰", requires: "ch3",
        body: "赵鹏：<br>周日（17 号）上午九点，东湖公园北门进，到北岸那棵大柳树下集合。那里人少，冰面平。<br>人数你统计一下，周五前报给我。<br>——宋知远" },
      { id: "c3_mail_n10", from: "wanfeng", to: "qingman", date: "1999-02-26 22:40", subject: "给你的", requires: "ch3",
        onOpen: { collect: "poem7" },
        body: "蔓：<br>今天这首不发到版上，只给你一个人看。<br>谢谢你的橡皮。<br>——晚<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><span class=\"faded\">《橡皮》<br>你把橡皮切成两半<br>大的那一半给我<br>从那以后<br>我写错的字<br>有一半<br>是你替我擦掉的</span>" },
      { id: "c3_mail_n11", from: "qingman", to: "wanfeng", date: "1999-02-27 07:10", subject: "回复：给你的", requires: "ch3",
        body: "收到了。我抄在笔记本第一页。<br>橡皮的事不许你写进诗里……算了，写都写了。<br>明天在给你带橘子。在见。" },
      { id: "c3_mail_n12", from: "xiaoyu", to: "jia", date: "1999-03-15 18:20", subject: "物理笔记", requires: "ch3",
        body: "许嘉，上周物理课的笔记能借我复印一下吗？我那两天请病假了。谢谢！" },
      { id: "c3_mail_n13", from: "liuyang", to: "leilei", date: "1999-03-27 23:50", subject: "周六包夜", requires: "ch3",
        body: "千禧网吧，周六晚上，3 号包间，带钱。别告诉你妈。" },
      { id: "c3_mail_n14", from: "yuanfang", to: "wanfeng", date: "1999-04-11 21:15", subject: "（无主题）", requires: "ch3",
        body: "信你看了吗？<br>我知道你不爱说话。你可以不用马上回答。<br>但我希望你认真考虑。我不是随便写的。<br>——宋知远" },
      { id: "c3_mail_n15", from: "wanfeng", to: "yuanfang", date: "1999-04-12 20:02", subject: "回复：（无主题）", requires: "ch3",
        body: "信我看了，谢谢你。<br>可是我不能答应。<br>请你以后不要再写了。对不起。" },
      { id: "c3_mail_n16", from: "jia", to: "hanli", date: "1999-05-19 13:10", subject: "关于 5 月 17 日的帖子", requires: "ch3",
        body: "韩老师：<br>17 号晚上有人用站长账号在灌水乐园发了一个帖子，内容很恶劣，针对高二(2)班的林晚。<br>我那几天在省城比赛，不是我发的。<br>帖子已经删除，站长密码已改。<br>许嘉" },
      { id: "c3_mail_n17", from: "hanli", to: "jia", date: "1999-05-19 17:45", subject: "回复：关于 5 月 17 日的帖子", requires: "ch3",
        body: "知道了。<br>删了就好。这件事不要在网上继续讨论。<br>韩" },
      { id: "c3_mail_n18", from: "wanfeng", to: "jia", date: "1999-05-20 22:31", subject: "（无主题）", requires: "ch3",
        body: "谢谢你把它删了。<br>我知道不是你。<br>你不用回。" },
      { id: "c3_mail_n19", from: "tingting", to: "xiaorui", date: "1999-06-08 21:12", subject: "期末复习~", requires: "ch3",
        body: "小芮~ 明天化学小测帮偶占座！！偶要坐你旁边抄……不是，是一起复习 ^^<br>886~" },
      { id: "c3_mail_n20", from: "qingman", to: "jia", date: "1999-06-23 23:40", subject: "原创文学", requires: "ch3",
        body: "许嘉，原创文学版的版主，你别撤。<br>她的诗都在里面。<br>求你了。" },
      { id: "c3_mail_n21", from: "leilei", to: "jia", date: "1999-09-01 20:00", subject: "高三了", requires: "ch3",
        body: "站长，高三了还灌水吗？我妈说再让她看见我上 BBS 就把电脑卖了 T_T" },
      { id: "c3_mail_n22", from: "xiaorui", to: "tingting", date: "1999-10-21 18:30", subject: "千禧晚会串词！", requires: "ch3",
        body: "婷婷！！千禧晚会定了！我是主持之一！你压轴！！<br>串词我先写了一版，明天给你看！！我们一定要让全校记住这一晚！！" },
      { id: "c3_mail_n23", from: "liuyang", to: "jia", date: "1999-11-09 22:15", subject: "求地图", requires: "ch3",
        body: "站长，能不能在电脑技术版放几张星际的地图？网吧里的都太老了。" },
      { id: "c3_mail_n24", from: "hanli", to: "jia", date: "1999-12-01 09:30", subject: "千年虫整改", requires: "ch3",
        body: "学校的通知你看到了。<br>机房和服务器优先，20 号前完成，完成后在 BBS 上发个公告。<br>韩" },
      { id: "c3_mail_n25", from: "tingting", to: "jia", date: "1999-12-24 22:00", subject: "平安夜快乐~~", requires: "ch3",
        body: "嘉嘉GG！！平安夜快乐~~<br>千禧晚会偶唱压轴！！你一定要来看哦！！！不许在机房待着！！！<br>886~" },
      { id: "c3_mail_n26", from: "xiaorui", to: "tingting", date: "1999-12-28 19:40", subject: "串词改好了！！", requires: "ch3",
        body: "婷婷！最后一版串词我改好啦！<br>你压轴前面那段我加了一句“让我们用歌声送别二十世纪”！是不是超有感觉！！" },
      { id: "c3_mail_y2k1", from: "Y2K", to: "jia", date: "1900-01-01 00:33", subject: "第一个", requires: "ch3",
        body: "你知道为什么。" },
      { id: "c3_mail_n27", from: "xiaoyu", to: "jia", date: "2000-01-03 21:10", subject: "你还好吗", requires: "ch3",
        body: "许嘉，听说警察找你问话了。<br>大家说什么你别往心里去。婷婷的事……谁都不想的。" },
      { id: "c3_mail_n28", from: "majun", to: "leilei", date: "1980-01-01 01:07", subject: "试试", requires: "ch3",
        body: "明天去不去打球？<br>（我电脑今天开机怪怪的）" },
      { id: "c3_mail_n29", from: "leilei", to: "liuyang", date: "2000-01-20 14:22", subject: "寒假包夜", requires: "ch3",
        body: "周四包夜还去吗？我妈出差，天时地利人和。" },
      { id: "c3_mail_n30", from: "zhaopeng", to: "jia", date: "2000-02-05 10:30", subject: "过年好！", requires: "ch3",
        body: "站长，龙年大吉！今年高考一起冲！" },
      { id: "c3_mail_n31", from: "xiaoyu", to: "yuanfang", date: "2000-02-05 11:02", subject: "新年快乐", requires: "ch3",
        body: "班长新年快乐！补课的作业清单麻烦发我一份～" },
      { id: "c3_mail_n32", from: "sunqian", to: "xiaorui", date: "2000-02-05 13:40", subject: "过年好", requires: "ch3",
        body: "小芮，新年快乐。<br>今年过年少了婷婷，总觉得不像过年。" },
      { id: "c3_mail_n33", from: "yuanfang", to: "xiaoyu", date: "2000-02-10 21:30", subject: "补课作业", requires: "ch3",
        body: "陈小雨：<br>数学两套卷子周五前收齐，交到我这里。没交的名单周六给我。<br>——宋知远" },
      { id: "c3_mail_y2k2", from: "Y2K", to: "yuanfang", date: "1900-02-12 18:36", subject: "第二个", requires: "ch3",
        body: "第二个是你。<br><br>去年五月十七号晚上，你坐在六号机。你旁边坐的是谁，你比我清楚。<br>不会在有人替你们瞒着了。" },
      { id: "c3_mail_n34", from: "majun", to: "leilei", date: "2000-02-13 20:40", subject: "情人节", requires: "ch3",
        body: "明天你送谁？别说你又群发贺卡。" },
      { id: "c3_mail_n35", from: "lijing", to: "xiaorui", date: "2000-02-14 13:05", subject: "周三早播", requires: "ch3",
        body: "小芮，周三的早播稿我写好了，放在广播站抽屉里。<br>情人节快乐！" },
      { id: "c3_mail_wf", from: "wanfeng", to: "yuanfang", date: "1900-02-14 19:55", subject: "（无主题）", requires: "ch3",
        onOpen: { toast: "发信人：wanfeng——林晚的账号。" },
        body: "东湖，老地方。八点。<br>我知道是谁写的。" },
      { id: "c3_mail_yfreply", from: "yuanfang", to: "wanfeng", date: "2000-02-14 19:59", subject: "回复：（无主题）", requires: "ch3",
        body: "你是谁？" },
      { id: "c3_mail_n36", from: "xiaoyu", to: "jia", date: "2000-02-15 22:10", subject: "（无主题）", requires: "ch3",
        body: "许嘉，班长昨天下午还在班里收作业……<br>我到现在都不敢相信。<br>马俊的帖子你别理。" },
      { id: "c3_mail_n37", from: "sunqian", to: "xiaoyu", date: "2000-02-18 21:00", subject: "我好怕", requires: "ch3",
        body: "小雨，晚上下了晚自习我们一起走好不好。<br>我不敢一个人。" },
      { id: "c3_mail_n38", from: "zhaopeng", to: "jia", date: "2000-02-19 17:02", subject: "送女生回家", requires: "ch3",
        body: "站长，我想组织男生晚自习后分组送女生回家，你能在站务版发个通知吗？名单我排好了。" },
      { id: "c3_mail_n39", from: "leilei", to: "jia", date: "2000-02-20 11:10", subject: "BBS 要不要关一阵", requires: "ch3",
        body: "站长，现在 BBS 上吵成一锅粥，要不要先关几天？" },
    ],
  },

  // 鸽讯：都发生在 3 号机上（服务器常年开机，许嘉的鸽讯一直挂着；他回机房时才回话）
  gexun: {
    logs: [
      { id: "c3_gx_0109_leilei", contact: "leilei", date: "2000-01-09", requires: "ch3",
        lines: [
          { who: "them", time: "21:30:02", text: "嘉！！期末考完了没！" },
          { who: "me", time: "21:30:40", text: "明天最后一门" },
          { who: "them", time: "21:31:05", text: "考完去千禧网吧通宵！刘洋包了3号间" },
          { who: "me", time: "21:31:30", text: "不去。服务器要备份" },
          { who: "them", time: "21:31:50", text: "你跟服务器过一辈子吧 T_T" },
          { who: "them", time: "21:32:20", text: "对了，灌水乐园有人发广告，卖什么“千年虫防护卡”，一张五十，你删一下" },
          { who: "me", time: "21:33:01", text: "删了" },
          { who: "them", time: "21:33:15", text: "效率！！" },
        ] },

      { id: "c3_gx_0121_hanli", contact: "hanli", date: "2000-01-21", requires: "ch3",
        lines: [
          { who: "them", time: "10:15:20", text: "许嘉，寒假服务器你看着点。" },
          { who: "me", time: "10:16:02", text: "好的韩老师。每周二、五我来。" },
          { who: "them", time: "10:17:05", text: "元旦那件事，警察还找过你吗？" },
          { who: "me", time: "10:17:30", text: "没有了。" },
          { who: "them", time: "10:18:10", text: "嗯。有什么事先跟我说。" },
          { who: "them", time: "10:18:30", text: "别一个人扛着。" },
          { who: "me", time: "10:18:55", text: "知道了。谢谢韩老师。" },
        ] },

      { id: "c3_gx_0124_yuanfang", contact: "yuanfang", date: "2000-01-24", requires: "ch3",
        lines: [
          { who: "them", time: "20:05:11", text: "许嘉，帮个忙。" },
          { who: "them", time: "20:05:30", text: "补课的课表学校刚发下来，你在BBS上帮我置顶一下。" },
          { who: "me", time: "20:06:02", text: "你让陈小雨发吧。她是学委。" },
          { who: "them", time: "20:06:45", text: "她发的没人看。你是站长，你发的大家才当回事。" },
          { who: "them", time: "20:07:03", text: "这种事情你做起来比我快。就这样。" },
          { who: "me", time: "20:07:40", text: "她发，我给她置顶。" },
          { who: "them", time: "20:08:12", text: "……也行。" },
          { who: "them", time: "20:08:51", text: "对了，你那个五笔，有空教我一下。拼音确实太慢。" },
          { who: "me", time: "20:09:10", text: "先背字根。" },
          { who: "them", time: "20:09:30", text: "算了。" },
        ] },

      { id: "c3_gx_0202_xiaorui", contact: "xiaorui", date: "2000-02-02", requires: "ch3",
        lines: [
          { who: "them", time: "15:20:11", text: "许嘉！！在吗！！" },
          { who: "me", time: "15:21:00", text: "在" },
          { who: "them", time: "15:21:20", text: "校园生活版有人发了好几条卖复读机的广告！！我删不掉！！是不是我版主权限出问题了？！" },
          { who: "me", time: "15:22:40", text: "他发在回复里。版主只能删主帖。我删了。" },
          { who: "them", time: "15:23:05", text: "谢谢站长！！你真是太靠谱了！！" },
          { who: "them", time: "15:23:30", text: "对了，开学第一天广播站要做“新学期新气象”特别节目，你有没有什么好听的纯音乐？要没有歌词的那种！" },
          { who: "me", time: "15:24:10", text: "没有。问磊磊" },
          { who: "them", time: "15:24:25", text: "……好吧！！" },
        ] },

      { id: "c3_gx_0208_leilei", contact: "leilei", date: "2000-02-08", requires: "ch3",
        lines: [
          { who: "them", time: "15:02:31", text: "嘉！！你终于上线了！！我初一零点给你发的拜年你现在才看见吧！！" },
          { who: "me", time: "15:03:12", text: "刚到机房。新年好" },
          { who: "them", time: "15:03:30", text: "大年初四你去机房？？" },
          { who: "me", time: "15:03:51", text: "服务器得看着" },
          { who: "them", time: "15:04:10", text: "你家服务器是你亲儿子吧" },
          { who: "them", time: "15:04:40", text: "今年一定要考上啊！我们说好了一起去省城的" },
          { who: "me", time: "15:05:02", text: "你也是。少灌水" },
          { who: "them", time: "15:05:15", text: "做不到 ^_^" },
        ] },

      // ★ 损坏会话（GXREPAIR 修复后出现）：宋知远的坦白
      { id: "c3_gx_0213", contact: "yuanfang", date: "2000-02-13", requires: "ch3 & solved_c3_p_repair",
        lines: [
          { who: "them", time: "23:10:42", text: "在吗" },
          { who: "them", time: "23:10:58", text: "许嘉，我是宋知远。" },
          { who: "me", time: "23:11:31", text: "在。" },
          { who: "them", time: "23:11:50", text: "你还在机房？" },
          { who: "me", time: "23:12:08", text: "嗯。周日晚上整理数据库。门卫知道。" },
          { who: "them", time: "23:12:40", text: "有件事，我想了一天一夜，觉得只能跟你说。" },
          { who: "them", time: "23:13:02", text: "你先答应我，今天说的话，不要告诉任何人。" },
          { who: "me", time: "23:13:30", text: "你先说。" },
          { who: "them", time: "23:14:15", text: "我收到千年虫的站内信了。" },
          { who: "them", time: "23:14:22", text: "“第二个是你。”" },
          { who: "me", time: "23:14:50", text: "什么时候" },
          { who: "them", time: "23:15:20", text: "昨天晚上看到的。发信时间很怪，像乱码一样。" },
          { who: "them", time: "23:15:58", text: "我一开始以为是谁的恶作剧。可是信里写了，去年五月十七号晚上，我坐在六号机。" },
          { who: "them", time: "23:16:30", text: "这件事，除了我们三个，不应该有别人知道。" },
          { who: "me", time: "23:16:51", text: "哪三个" },
          { who: "them", time: "23:19:07", text: "去年那篇帖子。扒林晚的那篇。" },
          { who: "them", time: "23:19:30", text: "不是你发的。我知道。全校都以为是你，我们谁也没出来说过一句话。" },
          { who: "them", time: "23:19:52", text: "是我、周婷、苏芮。" },
          { who: "me", time: "23:20:40", text: "我查到过是机房的学生机发的。" },
          { who: "them", time: "23:21:02", text: "你查到了？什么时候？" },
          { who: "me", time: "23:21:15", text: "去年12月。" },
          { who: "them", time: "23:21:40", text: "那你跟别人说过吗？" },
          { who: "me", time: "23:22:10", text: "说你的事。" },
          { who: "them", time: "23:23:05", text: "……好。" },
          { who: "them", time: "23:23:40", text: "那天放学，周婷看见林晚上了韩老师的车。她回来说得很难听，说她跟老师不清不楚。" },
          { who: "them", time: "23:24:30", text: "我妈在教育局人事科。林晚转学过来的时候，档案从她手上过。我妈在饭桌上提过一句，说这孩子在原来的学校休学过一年，看过心理医生，抑郁。" },
          { who: "them", time: "23:25:11", text: "我不该说出去的。" },
          { who: "them", time: "23:25:40", text: "那时候她刚拒绝我。我心里有气。我承认。" },
          { who: "them", time: "23:26:30", text: "周婷说要让全校都知道。苏芮打字快，又知道站长密码——她说四月有一次你在机房登录，她站在你后面，看见了。" },
          { who: "them", time: "23:27:15", text: "晚自习第二节，苏芮坐中间那台，我和周婷坐她两边，帮她看着老师。" },
          { who: "them", time: "23:27:48", text: "发完我们就下机了。第二天全校都在传。" },
          { who: "me", time: "23:28:30", text: "你们知道她后来" },
          { who: "them", time: "23:28:41", text: "我知道。别说了。" },
          { who: "them", time: "23:30:02", text: "六月那天以后，我没有一天睡好过。" },
          { who: "them", time: "23:30:35", text: "我跟自己说，栏杆是锈断的，警察说是意外，跟帖子没关系。" },
          { who: "them", time: "23:31:10", text: "可是周婷死了。也在水塔下面。" },
          { who: "them", time: "23:31:30", text: "现在轮到我了。" },
          { who: "me", time: "23:32:05", text: "报警" },
          { who: "them", time: "23:32:20", text: "不行。" },
          { who: "them", time: "23:33:01", text: "报警就要说清楚千年虫为什么找我。帖子的事一定会传出去。我妈会被处分，学校的保送推荐下个月就定了。" },
          { who: "them", time: "23:33:40", text: "你不懂。我不能在这个时候出事。" },
          { who: "me", time: "23:34:10", text: "命重要还是保送重要" },
          { who: "them", time: "23:35:22", text: "……你说话一直这么直。" },
          { who: "them", time: "23:36:00", text: "我会小心的。我只是想找个人说出来。" },
          { who: "me", time: "23:36:31", text: "你在家拔号上的？" },
          { who: "them", time: "23:36:45", text: "嗯。我爸妈睡了。" },
          { who: "me", time: "23:37:10", text: "这几天别一个人出门。晚上别出去。有人约你，不管用谁的名字，都别去。" },
          { who: "them", time: "23:37:40", text: "嗯。" },
          { who: "me", time: "23:38:15", text: "苏芮知道吗" },
          { who: "them", time: "23:39:02", text: "我不敢跟她说。周婷出事以后她就没正常过，早播的时候声音都在抖。" },
          { who: "them", time: "23:39:30", text: "我会想办法提醒她。" },
          { who: "me", time: "23:40:05", text: "那封信别删。" },
          { who: "them", time: "23:40:20", text: "好。" },
          { who: "them", time: "23:48:52", text: "明天就是情人节了。" },
          { who: "them", time: "23:49:10", text: "真讽刺。去年这个时候我还在想，要不要给她写一张贺卡。" },
          { who: "me", time: "23:50:30", text: "早点睡。" },
          { who: "them", time: "23:51:02", text: "许嘉。" },
          { who: "them", time: "23:51:15", text: "对不起。" },
          { who: "them", time: "23:51:40", text: "那篇帖子，让你背了大半年的黑锅。" },
          { who: "me", time: "23:52:20", text: "不是对我。" },
          { who: "them", time: "23:52:51", text: "我知道。" },
          { who: "them", time: "00:21:33", text: "我还是睡不着。" },
          { who: "them", time: "00:21:58", text: "我把能想到的都想了一遍。千年虫知道我坐在六号机。谁会知道这个？" },
          { who: "me", time: "00:22:40", text: "我也在想。" },
          { who: "them", time: "00:23:10", text: "算了。明天补课见。" },
          { who: "me", time: "00:23:30", text: "小心。" },
        ] },

      { id: "c3_gx_0215_leilei", contact: "leilei", date: "2000-02-15", requires: "ch3",
        lines: [
          { who: "them", time: "21:10:05", text: "嘉，你在机房？" },
          { who: "me", time: "21:10:30", text: "在" },
          { who: "them", time: "21:10:52", text: "班长的事……你知道了吧" },
          { who: "me", time: "21:11:20", text: "知道" },
          { who: "them", time: "21:11:45", text: "我今天一整天都是懵的。昨天下午他还骂我作业抄得太明显……" },
          { who: "them", time: "21:12:30", text: "BBS上那个《第二个》你看到没" },
          { who: "me", time: "21:12:50", text: "看到了" },
          { who: "them", time: "21:13:20", text: "马俊在灌水乐园发帖说千年虫是你。我跟他吵了一架。" },
          { who: "them", time: "21:13:41", text: "我不信是你。" },
          { who: "me", time: "21:14:05", text: "谢谢" },
          { who: "them", time: "21:14:30", text: "你要不要发个帖说清楚？" },
          { who: "me", time: "21:15:00", text: "明天" },
          { who: "them", time: "21:15:20", text: "嗯。你自己也小心点。" },
        ] },

      // ★ 许嘉提醒苏芮
      { id: "c3_gx_0216", contact: "xiaorui", date: "2000-02-16", requires: "ch3",
        lines: [
          { who: "me", time: "21:02:14", text: "在吗" },
          { who: "them", time: "21:02:40", text: "在的！……许嘉？你找我？" },
          { who: "me", time: "21:03:05", text: "宋知远的事你知道了。" },
          { who: "them", time: "21:03:41", text: "嗯……今天全班都在哭。我到现在手还是凉的。" },
          { who: "me", time: "21:04:20", text: "我长话短说。他前天晚上跟我说了去年五月的事。" },
          { who: "them", time: "21:04:52", text: "……他说什么了？" },
          { who: "me", time: "21:05:10", text: "帖子。你们三个。" },
          { who: "them", time: "21:08:33", text: "你想怎么样" },
          { who: "me", time: "21:08:50", text: "不想怎么样。我想让你小心。" },
          { who: "me", time: "21:09:12", text: "周婷，宋知远。千年虫是冲着那篇帖子来的。" },
          { who: "them", time: "21:09:30", text: "你别吓我！！" },
          { who: "them", time: "21:09:58", text: "婷婷是自己摔下来的！警察都说了是意外！宋知远是不小心掉进冰窟里的！报纸上都写了！" },
          { who: "me", time: "21:10:25", text: "他死前收到过千年虫的信。" },
          { who: "them", time: "21:11:40", text: "……" },
          { who: "them", time: "21:12:15", text: "那也可能是巧合呢？？千年虫说不定就是个恶作剧的！！" },
          { who: "them", time: "21:12:50", text: "而且……而且……你怎么证明千年虫不是你？？" },
          { who: "me", time: "21:13:20", text: "不是我。" },
          { who: "them", time: "21:14:02", text: "对不起……我不是那个意思……我脑子好乱" },
          { who: "me", time: "21:14:40", text: "你最近有没有收到奇怪的站内信" },
          { who: "them", time: "21:15:05", text: "没有！！我每天都看的！" },
          { who: "me", time: "21:15:30", text: "收到了马上告诉我。别回，别去。" },
          { who: "me", time: "21:15:52", text: "晚上别一个人出门。有人约你，不管用谁的名字，都别去。" },
          { who: "them", time: "21:16:30", text: "你说得我好怕……" },
          { who: "them", time: "21:17:44", text: "对了……他情人节那天下午还给我发了一张电子贺卡，酸得要命，我还以为他发错人了。我都没看完就关了。" },
          { who: "them", time: "21:18:10", text: "现在想起来……" },
          { who: "me", time: "21:18:31", text: "贺卡我看看。" },
          { who: "them", time: "21:19:02", text: "你是站长，你自己去服务器上看吧……我不想再看了。" },
          { who: "them", time: "21:19:40", text: "许嘉，你会告诉别人吗？帖子的事。" },
          { who: "me", time: "21:20:05", text: "不会。" },
          { who: "them", time: "21:20:41", text: "我广播站还有稿子没写完……我先下了。" },
          { who: "them", time: "21:20:55", text: "谢谢你。真的。" },
          { who: "me", time: "21:21:20", text: "记住我说的。" },
        ] },
    ],
  },

  puzzles: {
    // 解法：打开 MSG_BAD.DAT，对方号码只剩「3100▒▒3」；残片里有「我妈在教育局人事科」「学校的保送推荐」「六号机」，
    //       对照鸽讯好友列表，3100 开头、3 结尾的只有远方（宋知远，母亲在教育局，班长）3100233。
    //       日期：残片「明天就是情人节了」→ 2 月 13 日；会话从 23:1x 开始、跨到 00:2x，GXREPAIR.TXT 说跨零点按开始那天算；
    //       保送推荐、千年虫 → 2000 年。答案 3100233 / 2000-02-13。
    c3_p_repair: {
      title: "修复鸽讯会话",
      prompt: "GXREPAIR 需要两项信息才能重建这段损坏的会话：<br>① 对方的鸽讯号码（7 位）<br>② 会话日期（例：1999-05-17）<br>线索在损坏文件 MSG_BAD.DAT 残存的只言片语里。",
      kind: "multi",
      fields: [
        { label: "对方号码", answers: ["3100233"] },
        { label: "会话日期", answers: ["20000213", "2000213", "2000年2月13日", "2000年02月13日", "2000年2月13号", "0213", "213", "2月13日", "02月13日", "2月13号", "二月十三日", "二月十三"] },
      ],
      hints: [
        "残片里，对方说起了自己母亲的工作，还提到了保送。号码只剩前四位 3100 和最后一位 3。",
        "母亲在教育局人事科的是班长宋知远（鸽讯好友「远方」，号码 3100233）。残片里有一句“明天就是情人节了”，会话从 23 点多开始。",
        "答案：3100233，2000-02-13。",
      ],
      ask: true,
      requires: "ch3 & seen_c3_damaged",
      onSolve: { toast: "GXREPAIR：已重建 1 段会话记录（远方，2000-02-13）。请在鸽讯中查看。" },
      solvedText: "会话索引已重建。鸽讯里「远方」多出了一段 2 月 13 日深夜的记录。",
    },

    // 解法：站务管理→站内信默认按发信时间从新到旧排，2000 年 2 月那一堆里找不到千年虫给 yuanfang 的信；
    //       宋知远说“发信时间像乱码”。翻到列表最底下（比 1998 年、甚至比马俊那封 1980 年的信还靠后），
    //       能看到 Y2K → yuanfang《第二个》，显示 1900-02-12 18:36。
    c3_p_y2kmail: {
      title: "第二个是你",
      prompt: "宋知远说，他收到了千年虫的站内信「第二个是你」。到站务管理→站内信里找到它。<br>这封信显示的发信日期是哪一天？（例：1999-05-17）",
      answers: ["19000212", "1900212", "1900年2月12日", "1900年02月12日", "1900年2月12号"],
      near: {
        "20000212": "站内信列表里，这封信显示的并不是 2000 年。",
        "20000213": "那是宋知远找许嘉的日子。信是在那之前收到的。",
        "19000101": "那封是千年虫发给 jia 的《第一个》。要找的是发给 yuanfang 的。",
        "19000214": "那封是 wanfeng 发的。要找的是千年虫（Y2K）发的那封。",
      },
      hints: [
        "站内信默认按发信时间从新到旧排列。2000 年 2 月的那些信里没有它。",
        "宋知远说它的时间“像乱码”。一直翻到列表最底下——比 1998 年的信还要靠后。",
        "答案：1900-02-12。",
      ],
      ask: true,
      requires: "ch3 & seen_c3_gx_0213",
      onSolve: { note: "c3_n_mail2" },
      solvedText: "1900 年——比数据库里最早的信还早将近一个世纪，所以它沉在了列表最底下。",
    },

    // 解法：开发日志 1999-01-09 的 TODO：站内信发信时间取客户端（发信人电脑）时钟；1999-02-20：登录日志用服务器时间；
    //       1999-12-01：没打补丁的机器过了千禧年年份跳回 1900、月日时分照常走。帖子 1612（马俊 1980 年的信）也印证了。
    //       登录日志里同一天的记录都是正确的 2000 年 → 服务器没问题。信不是拨号发的（登录日志显示 192.168.1.200）。
    //       正确项：A、B、C。
    c3_p_clientclock: {
      title: "1900 年",
      prompt: "千年虫和「晚风」发给宋知远的信，发信时间都显示成 1900 年；可登录日志里，同一天的记录都是正确的 2000 年。<br>下面哪些说法是对的？（选出全部正确的）",
      kind: "pick",
      options: [
        "站内信的发信时间，取的是发信人自己电脑的时钟",
        "登录日志用的是服务器（3 号机）的时间，所以显示正确的 2000 年",
        "发这两封信的电脑没打千年虫补丁，过了千禧年，它的年份就变成了 1900",
        "3 号机服务器的时钟在千禧夜出了故障",
        "这两封信是从校外拨号上网发出的",
        "1900 年的信排在最底下，是因为它们被删除过",
      ],
      answerSet: [
        "站内信的发信时间，取的是发信人自己电脑的时钟",
        "登录日志用的是服务器（3 号机）的时间，所以显示正确的 2000 年",
        "发这两封信的电脑没打千年虫补丁，过了千禧年，它的年份就变成了 1900",
      ],
      hints: [
        "许嘉的开发日志（C:/Program Files/WTBBS/开发日志.txt）里，有一条关于站内信时间的 TODO。电脑技术版也有人为站内信的时间闹过笑话。",
        "站内信的时间来自发信人的电脑，登录日志的时间来自服务器。服务器 12 月就打过补丁，跨年正常。什么样的电脑过了千禧年会显示 1900？",
        "答案：选前三项——站内信取发信人电脑的时钟；登录日志是服务器时间；发信的电脑没打千年虫补丁。",
      ],
      ask: true,
      requires: "ch3 & solved_c3_p_y2kmail",
      onSolve: { note: "c3_n_client" },
      solvedText: "1900 不是暗号，是那台电脑自己的钟。哪台电脑停在 1900 年，信就是从哪台发的。",
    },

    // 解法：谣言帖 1999-05-17 21:03 从 192.168.1.107（JF-07）发出（第一章）。调查文件夹里的《上机登记表_0517.jpg》：
    //       JF-07 第一节（18:40—20:00）陈小雨，第二节（20:10—21:30）苏芮。21:03 属于第二节 → 苏芮。
    //       两边 JF-06 宋知远、JF-08 周婷，与宋知远“苏芮坐中间那台”的说法一致。
    c3_p_seat: {
      title: "七号机",
      prompt: "谣言帖是 1999 年 5 月 17 日 21:03 从 JF-07 发出的。根据当晚的上机登记表，那时坐在 JF-07 前面的是谁？",
      answers: ["苏芮", "xiaorui", "小芮"],
      near: {
        "陈小雨": "她登记的是第一节。帖子是几点发的？",
        "小雨": "她登记的是第一节。帖子是几点发的？",
        "宋知远": "他坐的是 JF-06。",
        "周婷": "她坐的是 JF-08。",
      },
      hints: [
        "许嘉的调查文件夹（C:/我的文档/调查/）里有一张 5 月 17 日晚自习的上机登记表复印件。",
        "登记表分两节。JF-07 前后坐过两个人。帖子是 21:03 发的，看第二节（20:10—21:30）。",
        "答案：苏芮。",
      ],
      ask: true,
      requires: "ch3 & (seen_c3_gx_0213 | seen_c3_signin)",
      onSolve: { note: "c3_n_seat", toast: "第二节：JF-06 宋知远，JF-07 苏芮，JF-08 周婷。三个人坐成一排。" },
      solvedText: "21:03，JF-07，苏芮。宋知远和周婷一左一右。",
    },

    // 解法：鸽讯 2-16 苏芮提到宋知远情人节下午给她发了电子贺卡；帖子 1622 说贺卡存在 WTBBS\DATA\CARD。
    //       CARD0007.HTM（远方→小芮，2000-02-14 16:42）。P.S.：“第一行的第一个字，第二行的第二个字……”
    //       第 n 行取第 n 个字：千 年 虫 知 道 是 我 们 三 个 小 心。
    c3_p_card: {
      title: "贺卡里的话",
      prompt: "宋知远情人节下午发给苏芮的那张电子贺卡里，藏着一句他不敢直说的话。是什么？",
      answers: ["千年虫知道是我们三个小心"],
      near: {
        "千年虫知道是我们三个": "后面还有两行没读。",
        "千年虫知道是我们": "还没读完。",
        "千禧年": "只读了第一行。",
      },
      hints: [
        "贺卡最底下的 P.S. 就是读法：“第一行的第一个字，第二行的第二个字……”",
        "第 1 行取第 1 个字，第 2 行取第 2 个字……一直取到第 12 行的第 12 个字。开头三个字是“千年虫”。",
        "答案：千年虫知道是我们三个，小心。",
      ],
      ask: true,
      requires: "ch3 & seen_c3_card_yf",
      onSolve: { note: "c3_n_card" },
      solvedText: "千年虫知道是我们三个，小心。——这是宋知远想办法提醒苏芮。",
    },

    // 解法：帖子 1614（大鹏 2000-01-18）：“老地方就是去年一月全班去溜冰、拍大合影的那个地方”。
    //       照片《东湖溜冰_990117.jpg》：大合影在一棵柳树下，旁边木牌“东湖公园 北岸”；背面“以后溜冰都在这儿集合，就叫‘老地方’”。
    //       旁证：站内信 c3_mail_n09（宋知远 1999-01-14：北岸那棵大柳树下集合）、晚报“北岸附近冰面”。答案：北岸柳树下。
    c3_p_oldplace: {
      title: "老地方",
      prompt: "“东湖，老地方。八点。”——宋知远被约去的“老地方”，是东湖的哪里？",
      answers: ["北岸柳树下", "东湖北岸柳树下", "北岸的柳树下", "北岸柳树", "北岸的柳树", "北岸那棵柳树下", "北岸那棵大柳树下", "北岸大柳树下", "北岸柳树底下", "东湖北岸的柳树下", "柳树下"],
      near: {
        "北岸": "再具体一点：北岸的什么地方？",
        "东湖北岸": "再具体一点：北岸的什么地方？",
        "东湖": "东湖很大。是哪一片？",
        "溜冰场": "溜冰场很大。全班是在哪儿集合的？",
        "东湖溜冰场": "溜冰场很大。全班是在哪儿集合的？",
      },
      hints: [
        "BBS 上有人约溜冰时也说过“老地方”，还解释了老地方指的是哪一次。",
        "“老地方”就是 1999 年 1 月全班溜冰拍大合影的地方。去照片文件夹里看那张合影：大家站在什么下面？旁边的木牌写着什么？",
        "答案：东湖北岸的柳树下。",
      ],
      ask: true,
      requires: "ch3 & seen_c3_mail_wf",
      onSolve: { note: "c3_n_oldplace" },
      solvedText: "老地方：东湖北岸，那棵柳树下。报纸上说，冰窟就在北岸附近。",
    },

    // 解法：站务管理→登录日志，2000-02-14 19:52:07 wanfeng 来自 192.168.1.200 / JYS-486（与用户列表里晚风“最后登录 2000-02-14 19:52”一致）。
    c3_p_wflogin: {
      title: "死人的账号",
      prompt: "林晚 1999 年 6 月就去世了。2000 年 2 月 14 日 19:52，「晚风」账号却登录了。它是从哪台机器登录的？（填机器名或 IP）",
      answers: ["jys486", "jys-486", "192.168.1.200", "1921681200"],
      near: {
        "jf03": "那是 3 号机，服务器。看 wanfeng 那一条。",
        "jf06": "那是宋知远下午发贺卡用的机器。看 wanfeng 那一条。",
        "611535192": "那是宋知远家的拨号 IP。看 wanfeng 那一条。",
      },
      hints: [
        "站务管理→登录日志。",
        "找 2000-02-14 晚上用户名是 wanfeng 的那一条，看它的 IP 和机器名。",
        "答案：JYS-486（192.168.1.200）。",
      ],
      ask: true,
      requires: "ch3 & seen_c3_mail_wf",
      onSolve: { note: "c3_n_wf" },
      solvedText: "19:52，JYS-486。三分钟后，晚风的账号给宋知远写了信。两个小时以后，千年虫也从这台机器登录。",
    },

    // 解法：开发日志 1999-02-20：机器名=拼音首字母（机房 JF、图书馆 TSG、校长室 XZS）→ JYS = 教研室（jiao yan shi）。
    //       1999-12-20：机房 40 台 + 3 号机 + 图书馆 + 校长室都打了补丁，“剩一台没动”——JYS-486 不在已整改名单里，
    //       又能发出 1900 年的信 → 就是那台没整改的。第二章《千年虫整改完成公告》也提到教研室一台机器暂未整改。答案：（计算机）教研室。
    c3_p_jys: {
      title: "JYS-486",
      prompt: "全校唯一一台“停在 1900 年”的电脑，机器名叫 JYS-486。它放在学校的哪个房间？",
      answers: ["教研室", "计算机教研室", "微机教研室", "实验楼二楼教研室", "实验楼教研室", "二楼教研室", "计算机教研组", "教研组", "实验楼二楼计算机教研室"],
      near: {
        "机房": "机房的机器都叫 JF-xx。",
        "微机室": "机房的机器都叫 JF-xx。",
        "实验楼": "实验楼里的哪一间？",
        "实验楼二楼": "二楼的哪一间？",
        "图书馆": "图书馆那台叫 TSG-01。",
        "校长室": "校长室那台叫 XZS-01。",
      },
      hints: [
        "许嘉的开发日志里写过全校机器名是怎么起的。",
        "机器名是拼音首字母：JF = 机房，TSG = 图书馆，XZS = 校长室。JYS 是哪三个字？《千年虫整改完成公告》里也提过那台没整改的机器。",
        "答案：（计算机）教研室。",
      ],
      ask: true,
      requires: "ch3 & solved_c3_p_wflogin & solved_c3_p_clientclock",
      onSolve: { note: "c3_n_jys" },
      solvedText: "JYS = 教研室。全校唯一没打千年虫补丁的那台老 486。",
    },
  },

  boards: {
    c3_final: {
      title: "冰面",
      requires: "ch3 & solved_c3_p_seat & solved_c3_p_oldplace & solved_c3_p_jys & solved_c3_p_card",
      intro: "把词语拖进空格（或先点空格再点词语）。全部正确才能通过。",
      text: "1999 年 5 月 17 日的谣言帖是三个人一起弄出来的：{saw}看到林晚上了韩老师的车；{told}把从母亲那里听来的“休学”说了出去；{typed}在晚自习第二节坐在 {seat} 号机前，用偷看来的站长密码发了帖。<br><br>2000 年 2 月 14 日 19:55，宋知远收到{acct}账号发来的站内信，被约到东湖的{place}。这个账号是从{host}登录的。<br><br>信上的发信日期显示为 {year} 年——站内信取的是发信电脑自己的时钟，而那台电脑{why}。<br><br>千年虫要找的，是{target}。周婷是第一个，宋知远是第二个，下一个是{next}。",
      slots: {
        saw: "w_zt", told: "w_szy", typed: "w_sr", seat: "w_7",
        acct: "w_wanfeng", place: "w_willow", host: "w_jys",
        year: "w_1900", why: "w_nopatch", target: "w_three", next: "w_sr",
      },
      words: {
        w_zt: "周婷", w_szy: "宋知远", w_sr: "苏芮", w_hm: "何蔓", w_xj: "许嘉", w_cxy: "陈小雨",
        w_6: "6", w_7: "7", w_8: "8", w_3: "3",
        w_wanfeng: "晚风（wanfeng）", w_y2k: "千年虫（Y2K）", w_sysop: "站长（sysop）",
        w_willow: "北岸柳树下", w_south: "南岸码头", w_ticket: "溜冰场售票亭",
        w_jys: "JYS-486", w_jf03: "JF-03", w_jf07: "JF-07", w_dial: "校外拨号",
        w_1900: "1900", w_2000: "2000", w_1980: "1980",
        w_nopatch: "没打千年虫补丁", w_cmos: "主板电池没电了", w_server: "服务器时钟坏了",
        w_three: "当年写谣言帖的三个人", w_night: "千禧夜留在操场的人", w_admin: "管理 BBS 的人",
      },
      hints: [
        "三个人各自做了什么，宋知远在 2 月 13 日的鸽讯里说得很清楚；座位看上机登记表。",
        "约宋知远的信来自哪个账号、约在哪里，看站内信和溜冰合影；从哪台机器登录，看登录日志。",
        "1900 年 = 发信电脑没打千年虫补丁。周婷、宋知远都是写帖子的人——三个里只剩苏芮。",
      ],
      onSolve: { toast: "推理板「冰面」已完成。" },
      solvedText: "千年虫用死者的账号、从教研室那台停在 1900 年的电脑发信。它要找的，是当年写帖子的三个人。下一个，是苏芮。",
    },
  },

  // 何蔓的台词里不出现“再”字（她把“再”打成“在”）
  dialogues: [
    { id: "c3_d_morning", contact: "heman", trigger: "ch3",
      steps: [
        { npc: "早，{player}师傅。" },
        { npc: "昨晚的恢复跑完了吗？" },
        { me: "跑完了，63%。恢复出来许嘉的鸽讯聊天记录，还有 BBS 的站内信数据库。" },
        { npc: "站内信……那时候大家拿它传纸条。没想到还留着。" },
        { npc: "站内信应该在 BBS 的站务管理里面，就是你前天进过的那个后台。" },
        { me: "还有个问题：鸽讯的数据目录里有一个文件校验失败，鸽讯打不开它。" },
        { npc: "能修好吗？" },
        { me: "鸽讯的安装目录里带了一个修复工具，我试试。" },
        { npc: "那就拜托了。" },
        { delay: 1500 },
        { npc: "宋知远是二月十四号走的。情人节那天晚上。" },
        { npc: "那年冬天特别冷，东湖冻得很结实。报纸上说，他是一个人上了冰，不小心掉下去的。" },
        { npc: "我一直不太信。" },
        { action: { note: "c3_n_today" } },
      ] },

    { id: "c3_d_confess", contact: "heman", trigger: "ch3 & seen_c3_gx_0213",
      steps: [
        { me: "损坏的那段修好了。是宋知远，2 月 13 号深夜找许嘉的。" },
        { me: "他承认了：去年那篇谣言帖，是他、周婷、苏芮三个人一起弄的。" },
        { delay: 2000 },
        { npc: "我看一下。" },
        { delay: 4000 },
        { npc: "……原来是这样。" },
        { npc: "说实话，帖子是他们三个写的这件事，我是宋知远出事以后才听人说起的。那阵子班里什么话都有，我也分不清哪句是真的。" },
        { npc: "可是看他自己一句一句说出来，还是不一样。" },
        { npc: "他母亲在教育局。林晚休学的事，原来是从那里漏出去的。" },
        { choice: [
          { text: "你那时候知道林晚休学过？", reply: ["她只跟我一个人说过。", "她说到了新学校，就当是重新开始。我答应过她，谁也不告诉。"] },
          { text: "宋知远最后好像是真的后悔了。", reply: ["是吗。", "……也许吧。他至少还有机会说对不起。林晚没有。"] },
        ] },
        { npc: "他说收到了千年虫的信，“第二个是你”。站内信里应该能找到吧？" },
        { npc: "还有，他说苏芮坐的是中间那台。许嘉的调查文件夹里，好像有一张上机登记表。" },
        { action: { note: "c3_n_confess" } },
      ] },

    { id: "c3_d_y2kmail", contact: "heman", trigger: "ch3 & solved_c3_p_y2kmail",
      steps: [
        { npc: "1900 年？" },
        { npc: "难怪按时间排的时候找不到，它比 1998 年的信还要“老”。" },
        { npc: "这是千年虫故意弄的吗？还是电脑出了什么毛病？这些我真的不懂。" },
        { npc: "许嘉做什么都要记下来。他有没有留下开发笔记之类的东西？" },
      ] },

    { id: "c3_d_clock", contact: "heman", trigger: "ch3 & solved_c3_p_clientclock",
      steps: [
        { me: "站内信的时间，取的是发信那台电脑自己的钟。那台电脑没打千年虫补丁，一过千禧年，年份就成了 1900。" },
        { npc: "所以那个 1900，不是暗号。" },
        { npc: "它反倒成了一个记号：哪台电脑的钟停在 1900 年，信就是从哪台发出来的。" },
      ] },

    { id: "c3_d_wf", contact: "heman", trigger: "ch3 & seen_c3_mail_wf",
      steps: [
        { npc: "……晚风。" },
        { npc: "这是林晚的账号。" },
        { npc: "到那年二月，她已经走了大半年了。" },
        { delay: 2000 },
        { npc: "“东湖，老地方。八点。”" },
        { npc: "老地方……高二那年一月，班里组织去东湖溜过一次冰。后来大家一说溜冰，就说去“老地方”。" },
        { npc: "具体是哪儿，我真的想不起来了。许嘉那天好像拍了照片。" },
        { npc: "还有——是谁登录了林晚的账号？登录日志里能看出来吗？" },
      ] },

    { id: "c3_d_deadlogin", contact: "heman", trigger: "ch3 & solved_c3_p_wflogin",
      steps: [
        { npc: "JYS-486。" },
        { npc: "也就是说，那天晚上七点五十二分，有人坐在学校里的一台电脑前面，用林晚的名字登录。" },
        { npc: "三分钟以后，又用她的名字给宋知远写信。" },
        { delay: 3000 },
        { npc: "对不起，我需要缓一下。" },
        { delay: 4000 },
        { npc: "林晚的签名档是“晚风吹过的地方，都会记得”。" },
        { npc: "她要是知道，自己的名字被人拿去做这种事……" },
        { npc: "{player}，JYS-486 是哪里的电脑？这种机器名，我完全看不懂。" },
      ] },

    { id: "c3_d_rui", contact: "heman", trigger: "ch3 & seen_c3_gx_0216",
      steps: [
        { npc: "许嘉提醒过苏芮。" },
        { npc: "可是一个月以后……" },
        { delay: 2500 },
        { npc: "苏芮说，宋知远情人节下午给她发过一张电子贺卡。" },
        { npc: "BBS 上的贺卡，服务器上应该还存着吧？" },
      ] },

    { id: "c3_d_card", contact: "heman", trigger: "ch3 & solved_c3_p_card",
      steps: [
        { npc: "“千年虫知道是我们三个，小心。”" },
        { npc: "他是想提醒苏芮的。又不敢直说。" },
        { npc: "到最后，他还是先顾着自己的面子。" },
        { delay: 2000 },
        { npc: "……也可能，他只是太害怕了。" },
      ] },

    { id: "c3_d_jys", contact: "heman", trigger: "ch3 & solved_c3_p_jys",
      steps: [
        { npc: "教研室。" },
        { npc: "实验楼二楼，老师们办公的地方。我们学生一般是进不去的。" },
        { npc: "所以千年虫用的，根本不是机房里的电脑。" },
        { npc: "{player}师傅，今天的东西差不多了。你把推理板理一理，填好了告诉我。" },
      ] },

    { id: "c3_d_end", contact: "heman", trigger: "board_c3_final",
      steps: [
        { npc: "周婷、宋知远、苏芮。" },
        { npc: "原来千年虫从一开始，要找的就只是那三个人。" },
        { npc: "许嘉提醒过苏芮，宋知远也提醒过她。" },
        { npc: "可是一个月以后，她还是没能躲过去。" },
        { delay: 2500 },
        { npc: "今天就到这儿吧，{player}师傅。我有点累了。" },
        { npc: "明天在说。" },
      ] },
  ],

  notes: {
    c3_n_today: { text: "今天恢复了：许嘉的鸽讯聊天记录（2000 年 1~2 月）、BBS 站内信数据库（站务管理→站内信）。鸽讯数据目录里有一个损坏的会话文件。" },
    c3_n_damaged: { text: "C:/Program Files/鸽讯/DATA/3100512/MSG_BAD.DAT 文件头损坏。修复工具 GXREPAIR.EXE 需要：对方鸽讯号码（7 位）+ 会话日期。" },
    c3_n_confess: { text: "宋知远坦白（2000-02-13 深夜）：谣言帖是他、周婷、苏芮三人弄的。周婷看到林晚上了韩老师的车；宋知远从母亲（教育局人事科）那里听说林晚休学治疗过抑郁；苏芮在晚自习第二节坐中间那台、用偷看来的站长密码发帖。他收到千年虫的站内信「第二个是你」，不敢报警。" },
    c3_n_mail2: { text: "千年虫给宋知远的「第二个是你」显示 1900-02-12 18:36，沉在站内信列表最底下。信里写着他 5 月 17 日晚坐在六号机，有个「在」代「再」的错字。" },
    c3_n_client: { text: "站内信的发信时间取发信人电脑的时钟（开发日志 TODO）；登录日志是服务器时间。1900 年 = 发信的电脑没打千年虫补丁。" },
    c3_n_wf: { text: "2000-02-14 19:52:07，晚风（wanfeng，林晚的账号）从 JYS-486（192.168.1.200）登录；19:55 给宋知远发信“东湖，老地方。八点。我知道是谁写的。”；19:58 宋知远在家拨号登录看到；21:14 千年虫也从 JYS-486 登录，21:16 发《第二个》。" },
    c3_n_oldplace: { text: "老地方 = 东湖北岸那棵柳树下（1999 年 1 月全班溜冰合影的地方）。冰窟在北岸附近。" },
    c3_n_seat: { text: "1999-05-17 晚自习第二节（20:10—21:30）：JF-06 宋知远，JF-07 苏芮，JF-08 周婷。21:03 的谣言帖是苏芮发的。" },
    c3_n_card: { text: "宋知远 2-14 16:42 发给苏芮的电子贺卡，第 n 行第 n 个字：千年虫知道是我们三个，小心。" },
    c3_n_jys: { text: "JYS-486 = （计算机）教研室的那台老 486，全校唯一没打千年虫补丁的机器。千年虫和“晚风”的信都从这里发出。" },
    c3_n_post2: { text: "千年虫《第二个》：2000-02-14 21:16，灌水乐园，IP 192.168.1.200。正文：“第二个。冰会记得。”" },
  },

  collectibles: {
    poem7: { title: "《橡皮》", text: "你把橡皮切成两半\n大的那一半给我\n从那以后\n我写错的字\n有一半\n是你替我擦掉的" },
    poem8: { title: "《冰面》", text: "冰面下面\n鱼也在过冬\n它们听不见\n上面有人在转圈\n笑声一层一层落下去\n变成很细的裂纹" },
  },
});
