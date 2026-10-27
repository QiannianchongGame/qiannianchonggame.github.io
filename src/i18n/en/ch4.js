// English translation — Chapter 4 "Broadcast" (ch4). Keys mirror src/i18n/zh/ch4.js.
// Fixed program names on the school radio: 一周开讲 = The Week Ahead, 七中新闻眼 = No. 7 News Eye,
// 点歌台 = Request Line, 读书时间 = Reading Time, 周末去哪儿 = Weekend Plans; greeting 早安七中 = "Good morning, No. 7 High!"
Y2K.lang('en', {
  "file.c4_bc_log.props": {"Description":"WTBBS Radio Station Playback · Recording log"},
  "file.c4_bc_log.text": `[WTBBS broadcast recorder 0.9]
# Scheduled task: every school day, record line-in from 06:58, stop at 07:15
# 11025Hz 8bit mono; keep only the last 30 days

2000-02-24 06:58:00 START  20000224.wav
2000-02-24 07:15:00 STOP   10,982 KB
2000-02-25 06:58:00 START  20000225.wav
2000-02-25 07:15:00 STOP   10,981 KB
......
2000-03-14 06:58:00 START  20000314.wav
2000-03-14 07:15:00 STOP   10,982 KB
2000-03-15 06:58:00 START  20000315.wav
2000-03-15 07:15:00 STOP   10,982 KB
2000-03-16 06:58:00 START  20000316.wav
2000-03-16 07:15:00 STOP   10,980 KB
2000-03-17 06:58:00 START  20000317.wav
2000-03-17 07:15:00 STOP   10,982 KB
2000-03-20 06:58:00 START  20000320.wav
2000-03-20 07:15:00 STOP   10,982 KB
2000-03-21 06:58:00 START  20000321.wav
2000-03-21 07:06:41 No signal on line
2000-03-21 07:06:41 STOP   4,318 KB
2000-03-22 06:58:00 START  20000322.wav
2000-03-22 07:15:00 STOP   0 KB   No signal throughout, file not saved
2000-03-23 12:38:15 Scheduled task disabled (sysop)
2000-03-23 12:40:02 20000321.wav password-protected (sysop)`,

  "file.c4_wav0315.tape.label": "20000315  Morning broadcast replay",
  "file.c4_wav0315.tape.speeds.1": `(Chime: ding — dong —)
A gentle, slightly nervous girl's voice: “Good morning, this is the No. 7 High radio station. Today is Wednesday, March 15, and I'm Li Jing. Welcome to Request Line.”
“Our first request card comes from a student in Junior Two, Class 3, for his deskmate — happy birthday to her. The song is ‘Paper Stars.’”
(A bouncy guitar intro and a man singing; the lyrics are buried under the line hiss.)
“Our second request card... has no name on it. It's for Su Rui in Senior Three, Class 2. The message says —”
(She pauses.)
“‘Don't be afraid. You're not alone.’”
“The song is ‘When the Snow Comes Down.’”
(Piano intro.)`,
  "file.c4_wav0315.tape.speeds.2": "(A thin, rapid squeak, like a cartoon mouse introducing a show. The only words you can make out are “Request Line.”)",
  "file.c4_wav0315.tape.speeds.0.5": "(A girl's voice dragged out low and long, like someone talking through a thick quilt. Then some music, so slow it seems about to stop.)",
  "file.c4_wav0315.tape.speeds.0.75": "(The voice is a little low and a little slow, like a tape recorder with dying batteries. You can tell it's a girl reading out request cards.)",
  "file.c4_wav0315.tape.speeds.1.5": "(Fast and a bit shrill: “...for Su Rui in Senior Three, Class 2... don't be afraid...” The piano after it sounds like it's in a hurry.)",

  "file.c4_wav0317.tape.label": "20000317  Morning broadcast replay",
  "file.c4_wav0317.tape.speeds.1": `(Chime: ding — dong —)
Su Rui (bright, crisp announcer's diction): “Good morning, No. 7 High! Today is Friday, March 17. Welcome to Weekend Plans — I'm your announcer, Su Rui!”
“It'll be sunny this weekend, with a high of twelve degrees. The ice on East Lake Park has melted, so everyone please stay away from the lakeshore...”
(She pauses, and her voice drops a little.)
“...And lately, everyone, please try to walk home together in the evenings, and get home early.”
(Laughing again) “Okay! Have a great weekend, and see you next Monday!”
(Chime. Then the morning exercise music.)`,
  "file.c4_wav0317.tape.speeds.2": "(A shrill, rapid babble, like a tape on fast-forward.)",
  "file.c4_wav0317.tape.speeds.0.5": "(A deep, drawn-out voice; every word is stretched over several seconds. Impossible to tell what it's saying.)",
  "file.c4_wav0317.tape.speeds.0.75": "(A slow, muffled girl's voice. You can just about tell it's Su Rui's delivery.)",
  "file.c4_wav0317.tape.speeds.1.5": "(Fast and shrill: “Good morning, No. 7 High! Today is... Friday... have a great weekend!”)",

  "file.c4_wav0320.tape.label": "20000320  Morning broadcast replay",
  "file.c4_wav0320.tape.speeds.1": `(Chime: ding — dong —)
Su Rui (bright, crisp announcer's diction): “Good morning, No. 7 High! Today is Monday, March 20, 2000 — the fifteenth day of the second lunar month, and the spring equinox! Welcome to The Week Ahead, every Monday. I'm your announcer, Su Rui!”
“The college entrance exam is now just — one hundred and nine days away! Senior Threes, go for it!”
“Now for this week's campus news. First: this Wednesday, after the second afternoon period, there will be a school-wide cleanup... Second: on March 29, Senior Three will hold the Hundred-Day Pledge Rally on the sports field...”
(Partway through she misreads a word, lets out a soft “ah,” and carries on.)
“...Okay, that's all for today's Week Ahead. The equinox is here, and the days will only get longer. Tomorrow morning at seven — don't miss it!”
(Chime. Then about ten minutes of morning exercise music.)`,
  "file.c4_wav0320.tape.speeds.2": "(A thin, rapid voice, like a mouse blurting out quiz answers: “Goodmorning-No.7-High-today-is... Monday... equinox... don't-miss-it!”)",
  "file.c4_wav0320.tape.speeds.0.5": "(A voice dragged out low and long, like a drowsy large animal talking. From the rhythm you can tell it's announcing something, but not a single word is clear.)",
  "file.c4_wav0320.tape.speeds.0.75": "(Low and slow, like a tape recorder with dying batteries. You can just about make out “Good morning, No. 7 High.”)",
  "file.c4_wav0320.tape.speeds.1.25": "(Slightly fast and slightly high, but the words are clear: “Good morning, No. 7 High! Today is Monday, March 20, 2000...”)",
  "file.c4_wav0320.tape.speeds.1.5": "(Fast and shrill: “Good morning, No. 7 High! Today is March twentieth, Monday... equinox... don't miss it!”)",

  "file.c4_wav0321.props": {"Note":"Taken offline (at the principal's office's request)"},
  "file.c4_wav0321.tape.label": "20000321  Morning broadcast replay (offline)",
  "file.c4_wav0321.tape.speeds.1": `(Chime: ding — dong —)
(No “Good morning, No. 7 High.”)
(A low, drawn-out voice, the sounds smeared together, like someone speaking from deep underwater. You can tell there are a few syllables, but not a single word is clear. About ten seconds.)
(Hiss of line noise.)
(A girl's voice, very soft, as if right up against the microphone, reading word by word —)
“Before First Period.”
“The fog on the sports field hasn't lifted yet
the student on duty lifts the chairs down one by one
on the windowpane someone has finger-written half a name
after the sun comes up
it slowly fades away
I want to be that half a name
seen for a little while
and that's enough”
(After the reading, a long stretch of nothing but hiss.)
(07:06 — the sound cuts off abruptly.)`,
  "file.c4_wav0321.tape.speeds.2": `(The chime turns shrill and short.)
(At last the voice sounds normal. Flat, pressed level, no rise or fall — impossible to tell whether it's a man or a woman —)
“The third one.”
“Reset to zero.”
(Hiss.)
(The girl reading the poem afterward is sped up into a thin, rapid squeak, like a tape on fast-forward.)`,
  "file.c4_wav0321.tape.speeds.0.5": `(An extremely low, extremely slow drone, like machinery heard through a wall, lasting nearly half a minute. No words can be made out.)
(Then a girl's voice stretched out very, very long, low and muffled, like someone reciting something underwater.)`,
  "file.c4_wav0321.tape.speeds.0.75": `(A deep hum; a single sound is stretched across several seconds. You can't tell whether it's a man or a woman, let alone make out words.)
(After it, a girl reading a poem — a little slow, a little muffled.)`,
  "file.c4_wav0321.tape.speeds.1.25": `(The voice is a little faster but still muffled, like someone talking with something in their mouth: “The... ...one”... you can't catch the rest.)
(The girl reading the poem sounds slightly fast and slightly high.)`,
  "file.c4_wav0321.tape.speeds.1.5": `(The voice is a bit clearer, but still low and slow: “The... third... one. Reset... to...” — the last word smears into a blur.)
(The poem reading after it is so fast it's almost comical.)`,
  "file.c4_wav0321.tape.onSpeed.2.toast": "This time, you can hear it.",

  "file.c4_y2klist.props": {"Author":"Xu Jia","Note":"The public announcement only said “one machine in the staff room has not yet been patched.” This copy is for my own records."},
  "file.c4_y2klist.html": "<h3 style=\"text-align:center\">No. 7 High Y2K Remediation List (Detailed)</h3><p style=\"text-align:center;font-size:12px\">Compiled by Xu Jia　1999-12-20　(For the public announcement, see the Computers board on the BBS)</p><table border=\"1\" cellspacing=\"0\" cellpadding=\"3\" style=\"border-collapse:collapse;font-size:12px;width:100%\"><tr style=\"background:#ddd\"><th>Machine</th><th>IP</th><th>Location</th><th>Patched on</th><th>Done by</th><th>Notes</th></tr><tr><td>JF-01</td><td>192.168.1.101</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-02</td><td>192.168.1.102</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-03</td><td>192.168.1.103</td><td>Lab bldg. 3F computer lab, by the teacher's desk</td><td>1999-12-02</td><td>Xu Jia</td><td>Server, done first. Changed the WTBBS date fields again on the evening of 12-18</td></tr><tr><td>JF-04</td><td>192.168.1.104</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-05</td><td>192.168.1.105</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-06</td><td>192.168.1.106</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-07</td><td>192.168.1.107</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-08</td><td>192.168.1.108</td><td>Lab bldg. 3F computer lab, Row 1</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-09</td><td>192.168.1.109</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-10</td><td>192.168.1.110</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-01</td><td>Xu Jia</td><td></td></tr><tr><td>JF-11</td><td>192.168.1.111</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-12</td><td>192.168.1.112</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-13</td><td>192.168.1.113</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-14</td><td>192.168.1.114</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-15</td><td>192.168.1.115</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-16</td><td>192.168.1.116</td><td>Lab bldg. 3F computer lab, Row 2</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-17</td><td>192.168.1.117</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td>CD drive broken; installed from floppy</td></tr><tr><td>JF-18</td><td>192.168.1.118</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-19</td><td>192.168.1.119</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-20</td><td>192.168.1.120</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-21</td><td>192.168.1.121</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-22</td><td>192.168.1.122</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-23</td><td>192.168.1.123</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-24</td><td>192.168.1.124</td><td>Lab bldg. 3F computer lab, Row 3</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-25</td><td>192.168.1.125</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-08</td><td>Xu Jia</td><td></td></tr><tr><td>JF-26</td><td>192.168.1.126</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-27</td><td>192.168.1.127</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-28</td><td>192.168.1.128</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-29</td><td>192.168.1.129</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td>CMOS battery dead; replaced</td></tr><tr><td>JF-30</td><td>192.168.1.130</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-31</td><td>192.168.1.131</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-32</td><td>192.168.1.132</td><td>Lab bldg. 3F computer lab, Row 4</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-33</td><td>192.168.1.133</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-34</td><td>192.168.1.134</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-35</td><td>192.168.1.135</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-36</td><td>192.168.1.136</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-37</td><td>192.168.1.137</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-38</td><td>192.168.1.138</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-39</td><td>192.168.1.139</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td></td></tr><tr><td>JF-40</td><td>192.168.1.140</td><td>Lab bldg. 3F computer lab, Row 5</td><td>1999-12-15</td><td>Xu Jia</td><td>The last one</td></tr><tr><td>TSG-01</td><td>192.168.1.150</td><td>Library 1F, circulation desk</td><td>1999-12-15</td><td>Xu Jia</td><td>Backed up the circulation system first</td></tr><tr><td>XZS-01</td><td>192.168.1.210</td><td>Admin bldg., principal's office</td><td>1999-12-15</td><td>Xu Jia, Han Li</td><td>Mr. Han came along</td></tr><tr style=\"background:#f6d6d6\"><td><b>JYS-486</b></td><td><b>192.168.1.200</b></td><td>Lab bldg. 2F, computer staff room</td><td><b>NOT PATCHED</b></td><td>—</td><td>Mr. Han won't let anyone touch it. Says the grade database is on it</td></tr></table><p>Total: 43 machines. 42 already patched〔己整改〕. 1 not patched (JYS-486).</p><p>Notes:<br>1. Patch used: Y2KFIX 2.1. After patching, set the clock to 1999-12-31 23:59 to test the rollover, then tested 2000-02-29 with DATE under DOS. All normal.<br>2. JYS-486 is a 486 DX2 with a very old BIOS. Unpatched, after 2000 its system year turns into 1900; month, day, hour and minute keep running normally.<br>3. Mr. Han says the grade database is on the 486 and if it breaks there'll be no explaining it, so he won't let me touch it. I said I could back it up first. He said no need.<br>4. The announcement only says “one machine in the staff room has not yet been patched.” No reason given.</p>",

  // __PART2__
});
