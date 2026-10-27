// English translation — Chapter 1 "Under the Wutong Tree" (ch1). Keys mirror src/i18n/zh/ch1.js.
// Conventions: 〔…〕 after a word = the original Chinese where the way it was typed is itself a clue
// (He Man's 在-for-再, Xu Jia's Wubi look-alike typos). Puzzle poems keep the Chinese original + line numbers.
Y2K.lang('en', {
  // ===================== Files =====================
  "file.c1_hosts.text": "# HOSTS -- No. 7 High campus network hostname table\n# Compiled by Xu Jia 1998-10-06. DO NOT DELETE\n#\n127.0.0.1        localhost\n192.168.1.103    JF-03      # Machine No. 3 / BBS server / PigeonChat relay\n#\n# ---- Lab Building 3F, computer lab (student machines) ----\n192.168.1.101    JF-01      # teacher machine at the front desk\n192.168.1.102    JF-02\n192.168.1.104    JF-04\n192.168.1.105    JF-05\n192.168.1.106    JF-06\n192.168.1.107    JF-07\n192.168.1.108    JF-08\n192.168.1.109    JF-09\n192.168.1.110    JF-10\n192.168.1.111    JF-11\n192.168.1.112    JF-12\n192.168.1.113    JF-13\n192.168.1.114    JF-14\n192.168.1.115    JF-15\n192.168.1.116    JF-16\n192.168.1.117    JF-17\n192.168.1.118    JF-18\n192.168.1.119    JF-19\n192.168.1.120    JF-20\n192.168.1.121    JF-21\n192.168.1.122    JF-22\n192.168.1.123    JF-23\n192.168.1.124    JF-24\n192.168.1.125    JF-25\n192.168.1.126    JF-26\n192.168.1.127    JF-27\n192.168.1.128    JF-28\n192.168.1.129    JF-29\n192.168.1.130    JF-30\n192.168.1.131    JF-31\n192.168.1.132    JF-32\n192.168.1.133    JF-33\n192.168.1.134    JF-34\n192.168.1.135    JF-35\n192.168.1.136    JF-36\n192.168.1.137    JF-37\n192.168.1.138    JF-38\n192.168.1.139    JF-39\n192.168.1.140    JF-40\n#\n# ---- Other ----\n192.168.1.150    TSG-01     # library reading room\n192.168.1.200    JYS-486    # Lab Building 2F, computer staff room\n192.168.1.210    XZS-01     # Admin Building, principal's office\n#\n# Off-campus dial-up (Wucheng InfoPort) always shows as 61.153.x.x, no hostname\n",
  "file.c1_sysopini.text": "; WTBBS admin account config\n; DO NOT EDIT BY HAND!! Break it and nobody gets into the admin panel\n\n[sysop]\nuser=sysop\npwd=E3B9-01F7-7C2A-55D0      ; stored encrypted\npwd_changed=1999-05-19 07:55:02\npwd_hint=her first one (title initials, in pinyin + month/day posted)\n\n[admin]\nco_admin=hanli\nrecycle=on                ; deleted posts go to the admin recycle bin, not really deleted\nlog=on\n",
  "file.c1_boardsini.text": "[zhanwu]\nname=Announcements\nmod=sysop\n\n[guanshui]\nname=Chatterbox\nmod=leilei\n\n[wenxue]\nname=Original Writing\nmod=wanfeng      ; since 1999-03-02 (no moderator before that)\n\n[diannao]\nname=Computers\nmod=jia\n\n[xiaoyuan]\nname=Campus Life\nmod=xiaorui\n\n[xinqing]\nname=Mood Corner\nmod=tingting\n\n; thread numbers count up site-wide, starting at 1001\n",
  "file.c1_gxini.text": "[Login]\nNumber=3100512\nNick=Jia\nRememberPwd=0\nAutoLogin=0\nPwdHint=the four characters she hid (typed my way)\n\n[Chat]\nAutoBackup=1\n",
  "file.c1_classbook.html": `<h3 style="text-align:center">Wucheng No. 7 High · Senior Two, Class 2 · Class Directory (BBS edition)</h3>
<p style="text-align:center" class="faded">Revised March 1999 · Compiled by Xu Jia · Homeroom teacher: Mr. Gu Qiubai (Chinese)</p>
<p>Note: only classmates registered on Under the Wutong Tree are listed, 13 in all. If you haven't registered, come find me in the computer lab. Sorted by student number.</p>
<table border="1" cellpadding="4" style="border-collapse:collapse;font-size:13px;width:100%">
<tr style="background:#ddd"><th>Name</th><th>Sex</th><th>Birthday</th><th>Class role</th><th>BBS ID</th><th>Message</th></tr>
<tr><td>Chen Xiaoyu</td><td>F</td><td>1982-05-21</td><td>Academic officer / Chinese class rep</td><td>xiaoyu</td><td>Study hard and make progress every day.</td></tr>
<tr><td>Zhao Peng</td><td>M</td><td>1981-11-15</td><td>Sports officer</td><td>zhaopeng</td><td>See you on the basketball court!</td></tr>
<tr><td>He Man</td><td>F</td><td>1982-09-16</td><td>Computer class rep</td><td>qingman</td><td>Hope we're desk-mates again next year.</td></tr>
<tr><td>Li Jing</td><td>F</td><td>1982-11-27</td><td>Biology class rep</td><td>lijing</td><td>Radio station morning show on Wednesdays. Send in your song requests~</td></tr>
<tr><td>Lin Wan</td><td>F</td><td>1982-10-03</td><td>—</td><td>wanfeng</td><td>Thank you all.</td></tr>
<tr><td>Liu Yang</td><td>M</td><td>1982-06-09</td><td>Physics class rep</td><td>liuyang</td><td>Millennium Internet Café. Be there.</td></tr>
<tr><td>Ma Jun</td><td>M</td><td>1982-02-11</td><td>Math class rep</td><td>majun</td><td>Not telling you.</td></tr>
<tr><td>Song Zhiyuan</td><td>M</td><td>1982-03-08</td><td>Class monitor</td><td>yuanfang</td><td>See you in Beijing.</td></tr>
<tr><td>Su Rui</td><td>F</td><td>1982-04-20</td><td>Publicity officer</td><td>xiaorui</td><td>Good morning, No. 7 High! See you at the radio station!!</td></tr>
<tr><td>Sun Qian</td><td>F</td><td>1982-08-25</td><td>English class rep</td><td>sunqian</td><td>(left blank)</td></tr>
<tr><td>Wang Lei</td><td>M</td><td>1982-01-30</td><td>Chores officer</td><td>leilei</td><td>Spamming is good for your health!!</td></tr>
<tr><td>Xu Jia</td><td>M</td><td>1981-12-03</td><td>Student admin, computer lab</td><td>jia (admin: sysop)</td><td>—</td></tr>
<tr><td>Zhou Ting</td><td>F</td><td>1982-07-07</td><td>Arts officer</td><td>tingting</td><td>Stay happy forever, OK~~</td></tr>
</table>
<p class="faded" style="font-size:12px">(In Lin Wan's row, the "Class role" cell is empty. She filled in her "Message" box herself in pencil, and Xu Jia typed it in exactly as she wrote it.)</p>`,
  "file.c1_timetable.text": "Senior Two, Class 2 — Timetable, 1998–1999 school year, 2nd semester\n\n        Mon       Tue       Wed       Thu       Fri       Sat\n1       Chinese   Math      English   Physics   Math      Math\n2       Math      English   Chinese   Chem      Chinese   English\n3       English   Physics   Math      Chinese   English   Chinese\n4       Physics   Chem      PE        Math      Bio       (extra class)\nLunch break\n5       Chem      Chinese   Computer  English   Physics\n6       Bio       PE        Computer  Politics  Chem\n7       Homeroom  History   Geography Study     Study\n\nEvening self-study 18:40–21:30 (Mon & Wed, 2nd period: computer use allowed, must sign in)\n\n——————————————\nWed afternoon computer class: computer lab\nLab duty: Mon Xu Jia　Wed Xu Jia　(any other time, ask Mr. Han)\n",
  "file.c1_ticket.caption": "Scan of the admission ticket. The competition committee's red seal is stamped in the bottom right.",
  "file.c1_ticket.html": `<div class="scan"><svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg">
<rect width="640" height="420" fill="#f3ead2"/>
<rect x="20" y="20" width="600" height="380" fill="none" stroke="#7a6a4a" stroke-width="2"/>
<text x="320" y="62" text-anchor="middle" font-family="SimSun, 'Songti SC', serif" font-size="17" fill="#222">1999 Provincial Youth Informatics Competition (Final Round)</text>
<text x="320" y="96" text-anchor="middle" font-family="SimSun, 'Songti SC', serif" font-size="26" font-weight="bold" fill="#222">ADMISSION TICKET</text>
<rect x="470" y="120" width="110" height="140" fill="#ddd" stroke="#999"/>
<text x="525" y="195" text-anchor="middle" font-family="SimSun, serif" font-size="14" fill="#888">(photo)</text>
<g font-family="SimSun, 'Songti SC', serif" font-size="15" fill="#222">
<text x="50" y="140">Name:　　　Xu Jia</text>
<text x="50" y="170">School:　　Wucheng No. 7 High School</text>
<text x="50" y="200">Ticket No.: 99-0417</text>
<text x="50" y="230">Venue: provincial capital · Normal Univ., Computer Bldg</text>
<text x="50" y="268">Sun May 16　Check in by 14:00; lodging at the Normal Univ. guesthouse</text>
<text x="50" y="296">Mon May 17　Written exam　08:30–11:30</text>
<text x="50" y="324">Mon May 17　Computer exam (Session 3)　19:00–22:00</text>
<text x="50" y="352">Tue May 18　08:30 Awards; group return trip</text>
</g>
<text x="50" y="384" font-family="SimSun, serif" font-size="11" fill="#555">Note: Computer exam held in 3 sessions by ticket no. No leaving the exam room during the exam. No floppy disks.</text>
<circle cx="540" cy="330" r="46" fill="none" stroke="#c0392b" stroke-width="4" opacity="0.8"/>
<text x="540" y="326" text-anchor="middle" font-family="SimSun, serif" font-size="11" fill="#c0392b" opacity="0.85">Competition</text>
<text x="540" y="344" text-anchor="middle" font-family="SimSun, serif" font-size="11" fill="#c0392b" opacity="0.85">Committee</text>
</svg></div>`,
  "file.c1_tihui.text": "Final-round problems, from memory (computer exam, 5.17 evening, 19:00–22:00)\n\n1. The Wutong Trees at the School Gate (greedy) — given the positions of N trees, enclose them with the shortest rope. Done in 30 minutes.\n2. Robot Moving Bricks (BFS) — 50×50 map, watch the boundaries. Took an hour; only passed the sample in the last 10 minutes.\n3. String Compression (DP) — didn't finish. Partial credit only.\n\nThe exam machines were even older than ours in the lab. The J key was loose.\nHanded in at 21:58.\n\nOn the way back to the guesthouse I realized problem 3 was actually interval DP.\n\nResult: Provincial Second Prize. 15 points short of First.\n",
  "file.c1_todo.text": "To do\n\n[x] Write up the contest problems, post on the Computers board\n[ ] Mouse on lab machine 23 is broken, report to Mr. Han\n[ ] Return Xiaoyu's physics notes\n[ ] Water tower railing — reported in April. Has the facilities office replied? Ask again\n[ ] BBS: pagination bug on Original Writing, gets jumbled when there are lots of posts\n[ ] v1.3: add a \"Delete permanently\" button to the admin recycle bin (right now it only hides)\n[ ] Summer lab opening hours, discuss with Mr. Han\n",
  "file.c1_xiaokan.html": `<h2 style="text-align:center">W u t o n g</h2>
<p style="text-align:center" class="faded">Wucheng No. 7 High School magazine · 1999, Issue 4 (July) · Student layout: Xu Jia</p>
<hr>
<h4>■ Good news: our student wins a prize at the Provincial Informatics Competition</h4>
<p>From May 16 to 18, the final round of the 1999 Provincial Youth Informatics Competition was held in the provincial capital. Xu Jia of Senior Two, Class 2 won a Provincial Second Prize, our school's best result ever in this event. Supervising teacher: Han Li.</p>
<h4>■ Senior Three graduation ceremony held</h4>
<p>On the morning of June 30, the graduation ceremony for our class of 1999 was held in the auditorium. The principal's words to the graduates: "However far you go, don't forget No. 17 Wutong Road."</p>
<h4>■ In deep mourning for Lin Wan</h4>
<p>At about 7:40 p.m. on June 21, Lin Wan of Senior Two, Class 2 fell from the top platform of the school water tower. Despite emergency treatment, she could not be saved. She was only sixteen.</p>
<p>After an on-site investigation, the public security authorities determined that the accident was caused by the rusted-through outer railing of the water tower platform, and ruled it an accident. The school has closed off the water tower since June 22 and is carrying out a full safety inspection of all school facilities.</p>
<p>Lin Wan transferred to our school in September 1998. She loved literature, and was the moderator of the Original Writing board on Under the Wutong Tree. May she rest in peace.</p>
<h4>■ Summer safety reminders</h4>
<p>Swimming in East Lake or the city moat is strictly forbidden; climbing the water tower, walls or any other high place is strictly forbidden; do not enter commercial internet cafés or game arcades.</p>
<p class="faded" style="text-align:right">— Wutong editorial office</p>`,
  "file.c1_photo_open.caption": "October 8, 1998. Machine No. 3's screen shows the homepage of Under the Wutong Tree (梧桐树下). Whoever took the photo had slightly shaky hands.",
  "file.c1_photo_open.html": `<div class="photo"><svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg">
<rect width="640" height="420" fill="#4a5258"/>
<rect x="150" y="60" width="340" height="260" rx="10" fill="#d9d4c5"/>
<rect x="175" y="82" width="290" height="200" fill="#ffffff"/>
<rect x="175" y="82" width="290" height="22" fill="#000080"/>
<text x="183" y="98" font-family="SimSun, serif" font-size="13" fill="#fff">梧桐树下 - Microsoft Internet Explorer</text>
<text x="320" y="160" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="30" fill="#2e6b2e">梧桐树下</text>
<text x="320" y="192" text-anchor="middle" font-family="SimSun, serif" font-size="10" fill="#333">Under the Wutong Tree — No. 7 High's own student BBS</text>
<text x="320" y="240" text-anchor="middle" font-family="SimSun, serif" font-size="12" fill="#666">Users online: 3</text>
<rect x="250" y="320" width="140" height="20" fill="#bdb7a6"/>
<rect x="120" y="350" width="400" height="40" fill="#cfc9b8"/>
<text x="600" y="400" text-anchor="end" font-family="'Courier New', monospace" font-size="22" fill="#ff8a1e">'98 10 8</text>
</svg></div>`,
  "file.c1_handover.text": "To Mr. Han:\n\nAdmin account: sysop\nInitial password: wutong1008 (the day the site opened)\n\nAdmin panel: http://192.168.1.103/admin/\nDeleting posts, banning IPs, viewing the login log — it's all in there.\n\nPlease delete this file once you've read it.\n— Xu Jia",
  "file.c1_draft.text": "Regarding the Recent Inappropriate Post (draft)\n\nAt 21:03 on the evening of May 17, a post appeared in Chatterbox. It was posted with the sysop account.\n\nI did not write that post.\nFrom the 16th to the 18th I was in the provincial capital for the competition. On the evening of the 17th, from 19:00 to 22:00, I was in the exam room doing the computer exam. No floppy disks allowed, no network. Mr. Han and the teacher who led our team can both confirm this.\n\nSomeone knew the sysop password.\nI have already〔己经〕 changed the password and deleted the post.\n\nTo Lin Wan,\n\n————————\n\nForget it.\nThe more I write, the more it looks like I wrote it.\nKeep it short.\n\n(The rest of what I have to say is in another file. Hide it well. Don't let anyone see it.)\n",
  "file.c1_unsent.props": { "Comments": "Not sent" },
  "file.c1_unsent.text": "Lin Wan:\n\nI didn't write that post.\nI know you know. But I still wanted to say it myself.\n\nYou said not to look into it. I promised you.\nBut I still want to know who it was.\n\nI'm not good at talking. I type fast and talk slowly.\nIn the lab you sat next to me and watched me type, and said my hands looked like they were playing the piano. I didn't tell you I made a lot of typos that day.\n\nThat poem of yours, March — I didn't see it until the next day.\nI feel the same.\n\n— Jia\nWritten 1999.5.23, not sent\n\n————\n\n6.21, morning\n\nYesterday you said you'd tell me something today.\nThen I'll tell you today too.\nThat's a promise.\n",
  "file.c1_typing.text": "Wubi typing practice (session 7)\n\nPractice text: \"Wutong\"\nTime: 2 min 06 s　Characters: 296　Speed: 141 chars/min　Errors: 2\n\n————\n\nLin Wan's first try (11.27, computer lab):\nTime: 5 min 40 s　Characters: 118　Speed: 21 chars/min　Errors: 11\n\n(She said she'd stick to writing by hand. I said a few more tries and she'd get the hang of it.)\n",

  // ===================== 2026 phone dialogues (He Man) =====================
  "dlg.c1_d_start.steps.0.me": "I'm into the system.",
  "dlg.c1_d_start.steps.1.npc": "Really?",
  "dlg.c1_d_start.steps.2.npc": "Is there an “Under the Wutong Tree” on the desktop? That's the BBS Xu Jia made. Back then we said everything on there.",
  "dlg.c1_d_start.steps.3.npc": "The whole site lives on that machine. The posts, the poems... it's all there.",
  "dlg.c1_d_start.steps.4.choice.0.text": "How did Lin Wan die?",
  "dlg.c1_d_start.steps.4.choice.0.reply.0": "June 21, 1999. The summer solstice.",
  "dlg.c1_d_start.steps.4.choice.0.reply.1": "She was sitting alone on the water tower watching the sunset, and the railing gave way.",
  "dlg.c1_d_start.steps.4.choice.0.reply.2": "The school said it was an accident. But I always knew it wasn't.",
  "dlg.c1_d_start.steps.4.choice.1.text": "I'll look at the BBS first.",
  "dlg.c1_d_start.steps.4.choice.1.reply.0": "All right.",
  "dlg.c1_d_start.steps.5.npc": "Go and have a look. Her poems are all on Original Writing.",
  "dlg.c1_d_start.steps.6.npc": "I won't keep you. Whatever you find, tell me then〔在跟我说〕.",
  "dlg.c1_d_xiazhi.steps.0.me": "I found Summer Solstice.",
  "dlg.c1_d_xiazhi.steps.1.npc": "That was her last one. The evening after she posted it, she...",
  "dlg.c1_d_xiazhi.steps.2.npc": "“And then I won't have to hide in the shadows anymore〔不用在躲〕.”",
  "dlg.c1_d_xiazhi.steps.3.npc": "I can still recite it. Tell me: if that isn't a goodbye, what is it?",
  "dlg.c1_d_xiazhi.steps.4.choice.0.text": "Maybe it means something else.",
  "dlg.c1_d_xiazhi.steps.4.choice.0.reply.0": "...I'd like to think so too.",
  "dlg.c1_d_xiazhi.steps.4.choice.0.reply.1": "But it's been more than twenty years, and I can't think what else it could mean.",
  "dlg.c1_d_xiazhi.steps.4.choice.1.text": "Someone replied underneath: “I saw it.”",
  "dlg.c1_d_xiazhi.steps.4.choice.1.reply.0": "That was Xu Jia.",
  "dlg.c1_d_xiazhi.steps.4.choice.1.reply.1": "His replies were never more than a few words. That one, I stared at for a long time.",
  "dlg.c1_d_delnotice.steps.0.me": "There's a notice in Announcements about a deleted post. It says a post from the evening of May 17 was taken down.",
  "dlg.c1_d_delnotice.steps.1.npc": "...That post.",
  "dlg.c1_d_delnotice.steps.2.npc": "The whole school read it. After it was deleted, no one ever saw it again〔没在见过〕.",
  "dlg.c1_d_delnotice.steps.3.npc": "Once something's deleted, there's no getting it back, is there? I don't understand these things.",
  "dlg.c1_d_rumor.steps.0.me": "I opened that deleted post.",
  "dlg.c1_d_rumor.steps.2.npc": "You could open it?",
  "dlg.c1_d_rumor.steps.3.npc": "Twenty-six years.",
  "dlg.c1_d_rumor.steps.4.npc": "Back then everyone thought Xu Jia wrote it. It came from the sysop account. Who would suspect anyone else?",
  "dlg.c1_d_rumor.steps.5.npc": "But she saw it. She read every word of it.",
  "dlg.c1_d_rumor.steps.6.choice.0.text": "The post came from IP 192.168.1.107.",
  "dlg.c1_d_rumor.steps.6.choice.0.reply.0": "What does that mean?",
  "dlg.c1_d_rumor.steps.6.choice.0.reply.1": "...A computer at the school?",
  "dlg.c1_d_rumor.steps.6.choice.0.reply.2": "I don't understand these things. Tell me once you've found out〔在告诉我〕.",
  "dlg.c1_d_rumor.steps.6.choice.1.text": "Whoever wrote that post was vicious.",
  "dlg.c1_d_rumor.steps.6.choice.1.reply.0": "Yes.",
  "dlg.c1_d_rumor.steps.6.choice.1.reply.1": "But all of them went on just fine afterwards. At least back then.",
  "dlg.c1_d_rumor.steps.7.npc": "Xu Jia once said his admin panel kept a record of everything. Who logged in, when, and from where.",
  "dlg.c1_d_rumor.steps.8.npc": "Maybe it will show something.",
  "dlg.c1_d_host.steps.0.me": "192.168.1.107 is Machine No. 7 in the computer lab, JF-07.",
  "dlg.c1_d_host.steps.1.npc": "A lab computer... So it was someone at our school.",
  "dlg.c1_d_host.steps.2.npc": "That day was a Monday. You could use the computers during evening self-study. The lab would have been full.",
  "dlg.c1_d_host.steps.3.npc": "Can you find out who was sitting there?",
  "dlg.c1_d_host.steps.4.me": "Not yet.",
  "dlg.c1_d_host.steps.5.npc": "Mm. No rush.",
  "dlg.c1_d_alibi.steps.0.me": "When the post went up, Xu Jia was in an exam room in the provincial capital, taking a computer exam from seven to ten that evening.",
  "dlg.c1_d_alibi.steps.2.npc": "So it really wasn't him.",
  "dlg.c1_d_alibi.steps.3.npc": "I remember he'd gone to the competition. But back then everyone said he was the sysop, he could post from anywhere.",
  "dlg.c1_d_alibi.steps.4.npc": "I didn't know the first thing about computers, so I didn't know how to speak up for him.",
  "dlg.c1_d_alibi.steps.5.npc": "If only someone had been able to explain it back then.",
  "dlg.c1_d_admin.steps.0.me": "I got into the admin panel. The new password he set has to do with Lin Wan's first poem.",
  "dlg.c1_d_admin.steps.1.npc": "...It doesn't surprise me at all that he'd choose a password like that.",
  "dlg.c1_d_admin.steps.2.npc": "He never told her. The whole class could see it; only he thought he was hiding it well.",
  "dlg.c1_d_admin.steps.3.npc": "What's in the admin panel?",
  "dlg.c1_d_admin.steps.4.choice.0.text": "The login log: a few minutes before the rumor post, the sysop account logged in from 192.168.1.107.",
  "dlg.c1_d_admin.steps.4.choice.0.reply.0": "But he wasn't even at school those days...",
  "dlg.c1_d_admin.steps.4.choice.0.reply.1": "Then someone knew his password.",
  "dlg.c1_d_admin.steps.4.choice.1.text": "Evening Breeze's account last logged in on February 14, 2000.",
  "dlg.c1_d_admin.steps.4.choice.1.reply.0": "...That's impossible.",
  "dlg.c1_d_admin.steps.4.choice.1.reply.1": "She'd been gone more than half a year by then.",
  "dlg.c1_d_admin.steps.4.choice.1.reply.2": "Could the computer have got it wrong? It's such an old machine.",
  "dlg.c1_d_admin.steps.5.npc": "Oh, and there's PigeonChat on his computer, isn't there? We all chatted on it back then.",
  "dlg.c1_d_admin.steps.6.npc": "There may be chats between him and me in there. Just little things. Go ahead and look.",
  "dlg.c1_d_admin.steps.7.npc": "If you see him mention putting something somewhere, let me know.",
  "dlg.c1_d_gexun.steps.0.me": "I got into PigeonChat too. The password was the four characters Lin Wan hid in March.",
  "dlg.c1_d_gexun.steps.1.npc": "March...",
  "dlg.c1_d_gexun.steps.2.npc": "Under the Wutong Tree.",
  "dlg.c1_d_gexun.steps.3.npc": "She told me that poem was written for one person to read. I asked who. She wouldn't say.",
  "dlg.c1_d_gexun.steps.4.npc": "So he saw it after all.",
  "dlg.c1_d_gexun.steps.6.npc": "In the chat logs, is there any mention of... something?",
  "dlg.c1_d_gexun.steps.7.choice.0.text": "No, just everyday chatter.",
  "dlg.c1_d_gexun.steps.7.choice.0.reply.0": "Mm.",
  "dlg.c1_d_gexun.steps.7.choice.0.reply.1": "Good. ...I mean, all that was a long time ago.",
  "dlg.c1_d_gexun.steps.7.choice.1.text": "There's one between the two of you. You said, “I won't let them get away with it.”",
  "dlg.c1_d_gexun.steps.7.choice.1.reply.0": "...Did I say something like that.",
  "dlg.c1_d_gexun.steps.7.choice.1.reply.1": "I was only sixteen. At that age you'll say anything.",
  "dlg.c1_d_unsent.steps.0.me": "I found a letter Xu Jia wrote to Lin Wan and never sent.",
  "dlg.c1_d_unsent.steps.1.npc": "What did he write?",
  "dlg.c1_d_unsent.steps.2.me": "That he didn't write the post. And about March, he said he felt the same.",
  "dlg.c1_d_unsent.steps.4.npc": "When did he write the last part?",
  "dlg.c1_d_unsent.steps.5.me": "The morning of June 21.",
  "dlg.c1_d_unsent.steps.6.npc": "That evening, she...",
  "dlg.c1_d_unsent.steps.7.npc": "If only he'd said it sooner.",
  "dlg.c1_d_end.steps.0.me": "I've pieced together what happened to Lin Wan. Xu Jia didn't post it.",
  "dlg.c1_d_end.steps.1.npc": "...Thank you.",
  "dlg.c1_d_end.steps.2.npc": "Twenty-six years, and this is the first time I've heard anyone lay it out clearly.",
  "dlg.c1_d_end.steps.3.npc": "But the person who sat at Machine No. 7, to this day no one knows who it was.",
  "dlg.c1_d_end.steps.4.npc": "It's late. Get some rest. Doesn't the hard drive still have to run all night? Look again tomorrow〔明天在看〕.",
  "dlg.c1_d_end.steps.5.npc": "See you〔在见〕, {player}.",

  // @@PART2@@
});
