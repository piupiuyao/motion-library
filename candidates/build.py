# 网上找来的候选动效（10-28 三路搜索去重后），生成审核清单 review.md
import json, os
E = 'easy'; M = 'medium'; H = 'hard'
C = [
# (名称, 类别, 长什么样, 适合什么句子, 需要, 难度, [来源], 备注)
# ---- 字体 ----
("荧光笔划重点","字体","一道黄色荧光笔从左往右扫过字幕里的一个关键词，边缘有点毛，像真的荧光笔","关键点、定义、「最该记住的一句」",[],E,["https://www.youtube.com/watch?v=YUvG0hzwTsg&t=837s","https://www.youtube.com/watch?v=BLVXMAdHZ8k","https://elements.envato.com/marker-including-alpha-BUR9HXX"],"三路都找到了，Ali Abdaal、Hormozi 都在用"),
("数字滚动计数","字体","一个大数字在脸下方飞快往上滚（如 $0 → $42,000,000），停下时弹一下，配计数音效","报收入、结果、价格、统计数字",["数字","音效"],E,["https://www.youtube.com/watch?v=jLR0G0WmPss","https://elements.envato.com/number-counters-3QVA42Q"],"Hormozi 开场招牌"),
("盖章印戳","字体","一个红色做旧印章（「避坑」「APPROVED」「FAKE」）斜着砸下来，带一下震动和油墨质感","下结论、辟谣、推荐或否定某样东西",["音效"],E,["https://elements.envato.com/confirmed-stamp-AYVSGTC"],""),
("文字快闪","字体","口播画面突然切成一串纯色卡，每张砸一两个大字，踩着节拍快速闪过，再切回人","开场快速抛出 3–5 个关键词、高能列举",["音效"],E,["https://elements.envato.com/stomp-intro-slides-pr-TQ9EC79"],""),
("标题扫光","字体","一个渐变填充、带阴影和柔光的大标题落下时，一道斜光从字上扫过一次；背后画面虚化压暗","开场钩子标题",[],E,["https://www.youtube.com/watch?v=Qbntd8yud0o&t=124s"],""),
("反色混合字","字体","粗体字用「差值」混合，压在人身上或亮处的部分颜色自动反转，像刻进画面里","人名/身份介绍、时间地点标签、有格调的强调",[],E,["https://www.youtube.com/watch?v=HQvV75kjblY&t=350s"],""),
("镂空透视字","字体","满屏纯色上一个巨大的词，只有字的形状里透出视频，然后字迅速放大直到视频铺满全屏","开场、系列名、章节标题",[],E,["https://www.youtube.com/watch?v=cocCWbVJeqo&t=48s","https://www.douyin.com/video/7586591437300878592"],"教程和抖音拆解都有"),
("扭曲抖动标题","字体","标题的字边缘一直在轻微扭动、沸腾，像手绘动画，压在带颗粒的画面上","开场钩子、戏剧性/不安的话",[],E,["https://gotranscript.com/public/mastering-youtube-shorts-capcut-tutorial-for-ali-abdaal-alex-hormozi-and-cody-sanchez-styles"],"Codie Sanchez 风格"),
("3D投影大字","字体","粗窄全大写字幕，黄/橙色，带一层厚厚的粉红色斜向 3D 投影，放大砸进画面下方","高能金句、开场",[],E,["https://www.choppity.com/tools/recreate-video-editing-style/tom-noske/"],"Tom Noske 风格（第三方分析页）"),
("渐变混排标题","字体","两行段落标题：前半句白灰渐变无衬线，关键词换成斜体衬线、红橙渐变","段落开头、点出这段讲什么",[],E,["https://www.youtube.com/watch?v=Qbntd8yud0o"],""),
("侧边手写短句","字体","人站偏一边，空出来的一侧用白色手写体一句一句往下叠，关键词变黄，不压脸","平静讲解、反思的话，比居中字幕更柔和",[],E,["https://www.choppity.com/tools/recreate-video-editing-style/ali-abdaal/"],"Ali Abdaal 风格（第三方分析页）"),
("原生文字框钩子","字体","开头 1–2 秒，一句钩子放在白色圆角底的文字框里，用 Instagram 自带的字体加一个表情，像原生快拍文字","开场钩子（前 1–4 秒）",[],E,["https://www.youtube.com/watch?v=y60ohM4nr4Y"],"Hormozi 风格拆解"),
# ---- 素材 ----
("手机通知弹窗","素材","一条 iOS 样式的毛玻璃通知从顶上滑下来（图标、发件人、一行字），停 1–2 秒再收回","开场「我刚收到这条消息」、反转、引用客户/老板的话",["音效"],E,["https://elements.envato.com/reels-mobile-notification-HRYPGJN"],"跟我们 OKEight 这类产品很搭"),
("聊天气泡对话","素材","iMessage/WhatsApp 样式的气泡一条条弹出（左灰右蓝），每条前面先出「正在输入」三个点","讲故事、复述对话、吐槽「然后他回我……」",["音效"],E,["https://elements.envato.com/reels-message-bubble-chat-7CV9QP3"],"跟我们 OKEight 这类产品很搭"),
("推文卡片弹出","素材","一张社交帖子卡片（头像、账号、正文、点赞数）在胸前弹出、微微倾斜，然后飞走","引用别人的话、引用新闻或爆帖",["图片"],E,["https://elements.envato.com/tweets-pack-6XV2RV6"],"和已有的「资料飞入」有点像，但这是单张做成帖子样式"),
("搜索框打字","素材","画面虚化，一个 Google 样式的搜索框出现，光标一个字一个字打出问题，可以接着出联想词","用问题开场「怎么……」、「大家都在搜这个」",["音效"],E,["https://elements.envato.com/how-to-make-a-google-search-KT8DKRJ"],""),
("文章荧光高亮","素材","一张文章/文件截图铺满屏幕慢慢推近，荧光笔扫过其中一句，其余部分变暗","引用证据、新闻标题、原文",["图片"],E,["https://www.youtube.com/watch?v=QLM2upiiyGc"],"Johnny Harris 风格"),
("手绘涂鸦","素材","粉笔/马克笔样式的箭头、波浪线、星星、圈圈一笔一笔自己画出来，围着人或指向某处","指东西「看这里」、列举、轻松的强调",[],E,["https://www.youtube.com/watch?v=YUvG0hzwTsg&t=753s","https://elements.envato.com/hand-drawn-elements-arrows-pack-NR9FBGS"],""),
("引线标注图解","素材","手写数字套在画好的圆圈里，用会动的虚线连到几个标签，镜头从一组标注平移到下一组","讲步骤、讲框架、讲几个点之间的关系",[],M,["https://www.youtube.com/watch?v=y60ohM4nr4Y","https://www.youtube.com/watch?v=HQvV75kjblY&t=759s"],"Hormozi 风格拆解"),
("发光流程线","素材","深色渐变背景上一条发光的线画过屏幕，圆角标签沿线一个个弹出，整组跟着往下移","讲流程、步骤、因果链",["音效"],E,["https://www.youtube.com/watch?v=aNwKDaTag2Q&t=164s"],"Kallaway 风格"),
("玻璃卡绕身","素材","一张半透明发光玻璃卡（图标 + 往上跳的数字，如粉丝数）在 3D 空间里转一圈，从人背后穿过","讲战绩/社会证明、介绍工具",["抠像","数字"],M,["https://www.youtube.com/watch?v=aNwKDaTag2Q&t=1152s"],"Kallaway 风格"),
("背后冒出物","素材","一张图或图标从人肩膀后面升起来（被人挡住一部分），旁边弹出发光标签","引出一个概念或东西「咖啡因是……」",["抠像","图片"],E,["https://www.youtube.com/watch?v=A0vzIQlaPX0&t=307s"],"Ali Abdaal 风格"),
("道具旋转飞入","素材","一个跟这句话有关的抠图道具（轮胎、硬币、手机）转着圈滑过人前面，带雾气和对应音效","把比喻或具体名词画出来、讲解中途打断一下节奏",["图片","音效"],E,["https://gotranscript.com/public/mastering-youtube-shorts-capcut-tutorial-for-ali-abdaal-alex-hormozi-and-cody-sanchez-styles"],"Hormozi 风格"),
("头顶光环","素材","一个手绘光环出现并漂在人头顶上，跟着人动","讲「光环效应」这类概念、反讽「圣人」时刻",["抠像","图片"],M,["https://www.youtube.com/watch?v=BLVXMAdHZ8k"],"适用面窄"),
("漫画对白气泡","素材","漫画样式的对话框/思考泡或爆炸字（「WHAT?!」）带网点，从人头旁边弹出","内心独白、反讽、反应、复述别人说的话",["音效"],E,["https://elements.envato.com/comic-elements-VRHJEWX"],""),
("表情包弹出","素材","大号表情（😂😱🔥）在说到对应的词时弹到脸旁，或者像直播一样往上飘","玩笑、情绪词、轻量强调",["音效"],E,["https://motionarray.com/stock-motion-graphics/facebook-emoji-reactions-vertical-pack-842485/"],""),
("复古电视框","素材","一段截图/视频装进老式显像管电视里播放，背景做旧，电视上压大字，慢慢推近","提到某个内容/媒体、怀旧、引用网上看到的东西",["图片","视频"],E,["https://www.youtube.com/watch?v=q-qbKk8Qams&t=1118s"],""),
("红线线索墙","素材","几张截图散在屏幕上，红线把它们连起来，中间清楚、四周虚化，偏暖色","串证据、「大家都在做 X」、揭秘调查的语气",["图片"],M,["https://www.youtube.com/watch?v=q-qbKk8Qams&t=1330s"],""),
("素材环形阵列","素材","很多小圆角卡片（截图/B-roll）一张张弹出，围着中间的标题排成一圈，然后镜头拉远","讲坚持/数量「连发 30 天」、很多结果一起展示",["视频","图片"],M,["https://www.youtube.com/watch?v=MNG51L8ikQw&t=601s"],""),
("快闪连拍","素材","同一个构图的四个不同画面（不同衣服/场景），每个只有几帧，在标题后面的圆角框里快速循环闪","开场点名「做剪辑的你……」、表示「例子很多」",["视频","图片"],E,["https://www.youtube.com/watch?v=MNG51L8ikQw&t=292s"],""),
("纸片展开图形","素材","扁平的剪纸插画和纸片字母一步步翻开、展开，出现在人旁边","人名标题、用亲切的方式讲概念",["图片"],M,["https://www.youtube.com/watch?v=sIkWwafmrlM"],"Ali Abdaal 招牌"),
("极简线稿隐喻","素材","纯深色背景上，简单的单色线稿把正在说的比喻画出来（比如冰山在水里晃），插在口播中间","抽象概念、比喻、哲理/成长类观点",["图片"],M,["https://www.youtube.com/watch?v=axE3Z_dYWfc"],"Dan Koe 风格；每次要画新的线稿"),
("地图描线","素材","一张有质感的地图铺满屏幕慢慢移动，一条线自己画出路线，终点弹出地名","讲地点、出行、扩张、讲故事",["图片"],M,["https://aescripts.com/learn/how-johnny-harris-makes-maps/"],"Johnny Harris 招牌；来源的具体做法只看了搜索摘要"),
("质感旋钮仪表","素材","深色颗粒背景上一个带立体感的旋钮，放大出现，指针转到某一档，刻度跟着亮","「调高/调低」某样东西、表示程度、风险",["数字"],M,["https://www.youtube.com/watch?v=EehfkRZXq6o"],"Iman Gadzhi 风格；适用面窄"),
("物体碎裂","素材","一个 3D 物体（手机）从旁边转进来，接着碎成玻璃渣飞散","「千万别这样做」、辟谣、强烈的负面观点",["图片","音效"],H,["https://www.youtube.com/watch?v=Qbntd8yud0o&t=535s"],"网页里做 3D 碎裂比较难"),
# ---- 版式 ----
("上下分屏","版式","竖屏上下一分为二：一半是人，另一半放 B-roll/对比图，从两边滑进来，中间可以压字幕","对比（之前/之后、对/错）、边讲边给例子",["视频","图片"],E,["https://www.youtube.com/watch?v=A0vzIQlaPX0&t=205s","https://www.youtube.com/watch?v=wkWkHwFKcNE","https://elements.envato.com/vertical-multiscreen-before-after-KCT47XG"],"三路都找到了，很常见"),
("侧屏滑入","版式","另一块画面（B-roll、截图或文字卡）从一侧滑进来，人同时往另一侧滑，最后各占半边，人不缩小","对比、边讲边补充一个画面、换话题",["图片","视频"],E,["https://www.youtube.com/watch?v=YUvG0hzwTsg&t=426s"],""),
("画中画弹窗","版式","人保持全屏，角落或上方弹开一个带阴影的圆角卡片放 B-roll/图片，过一会儿收起","边讲边给一个例子/证据、提到某个产品",["视频","图片"],E,["https://motionarray.com/davinci-resolve-macros/pop-up-effect-macro-978376/"],""),
("清单打勾","版式","人往一边让开，一张清单卡滑进来，说到哪条，哪条就打个勾（或红叉），字变亮","列步骤/技巧、误区 vs 事实、「这几件你做了吗」",["音效"],E,["https://www.youtube.com/watch?v=aNwKDaTag2Q&t=498s","https://elements.envato.com/checkbox-list-constructor-ABASNAE"],"两路都找到了"),
("报纸底清单","版式","背景是反色（变暗）的旧报纸慢慢漂移，清单条目带小图一条条弹出","列举（3 个理由 / 5 个技巧）",["图片"],E,["https://www.youtube.com/watch?v=5FtsVft5Vn8"],"Ali Abdaal 风格；和「清单打勾」是同一用途的另一种样子"),
("白卡图标环绕","版式","几张白色圆角小卡（图标 + 一行字）一张张弹到人四周的角落，不挡脸","列举几样东西/工具、总结几个选项",["图片"],E,["https://www.youtube.com/watch?v=YWoWti-hSo0"],"Ali Abdaal 风格"),
("三联屏","版式","屏幕分成三格，每格是人的不同画面；谁在说话谁亮，说完的那格定住变暗","讲三个点、三个版本（问题 / 错误 / 解决）",["视频"],M,["https://www.douyin.com/video/7602177171734344522"],"抖音口播常见"),
("左右轮换图文","版式","抠出的人站在左或右三分之一，另外三分之二放图/图表；每 4–6 秒换图，人换边站","图多的讲解、数据和对比",["抠像","图片"],M,["https://www.opus.pro/blog/editing-aesthetics-dominating-short-form-2026"],"Tom Scott 式"),
("绿幕讲解","版式","一个网页/文章/截图铺满做背景，抠出的人站在下方大大地讲，背景可以滚动、推近","对新闻做反应、讲解一个页面「你看这个」",["抠像","图片"],E,["https://www.capcut.com/explore/green-screen-in-capcut"],"TikTok 经典格式；来源只是剪映模板首页"),
("画面缩进手机","版式","全屏的口播缩进一个手机外框里，浮在彩色背景上，像「手机上的一条视频」，周围可以放字","「我在抖音刷到……」、讲 app 怎么用",[],M,["https://elements.envato.com/vertical-reels-CRSX9AW"],""),
("虚化压暗发光卡","版式","口播画面虚化变暗，四周弹出深色圆角卡片（渐变、发光边、发光字），讲完画面变回清楚","需要全神贯注的要点或数字、商业/理财讲解",["数字"],E,["https://www.youtube.com/watch?v=O6HOYu_ZEnw"],"Iman Gadzhi 风格；和已有的「抠像出镜 + 重点卡」有点像"),
("录像取景框","版式","画面上叠一层摄像机取景框：四角括号、闪烁的红色 REC、走动的时间码、电量","幕后花絮、坦白/真心话、开场",[],E,["https://elements.envato.com/recording-camera-frame-overlay-RKZAFQL"],""),
("账号名牌条","版式","一个胶囊形标签（平台图标 + 名字 + @账号，可带「关注」按钮）从下方滑进来，2–3 秒后收回","开头自我介绍、亮身份「我做了 10 年猎头」",[],E,["https://videohive.net/item/vertical-lower-thirds/60452077"],""),
("进度条","版式","底部或顶部一条进度条：整条视频从左到右慢慢填满，或者分成几段、讲到第几步亮到第几段","长一点的视频、多步骤教程，让人看到最后",[],E,["https://www.kapwing.com/resources/how-to-make-videos-like-garyvee/","https://elements.envato.com/multi-step-progress-bars-GTG4ATT"],"GaryVee 在用"),
# ---- 镜头特效 ----
("震屏冲击","镜头特效","整个画面猛地抖几下再迅速停住（0.3–0.6 秒），踩在重音或音效上","重音词、吐槽、「砰」、爆出一个惊人数字",["音效"],E,["https://www.youtube.com/watch?v=VQsna0Y4EPc&t=535s","https://elements.envato.com/camera-shake-presets-for-premiere-pro-8E7CHZR"],"两路都找到了"),
("急推回弹","镜头特效","镜头快速推到脸上，停一拍，再缓缓退回原来的景别（一次进出，不是慢推）","强调一个词、抖包袱、惊讶",["音效"],E,["https://www.youtube.com/watch?v=YUvG0hzwTsg&t=571s"],"和已有的「推近」不同：这个快、会回来"),
("手持晃动","镜头特效","整个画面加一点点随机晃动和旋转，三脚架拍的画面看起来像手持，更有生气","开场、高能的句子、太静的段落打断一下",[],E,["https://www.youtube.com/watch?v=YUvG0hzwTsg&t=550s"],""),
("景别跳切","镜头特效","每次剪切在原景别和放大 120–150% 的脸部特写之间来回切，假装有第二台机位","任何剪切点；重的话切特写，轻松的话切回全景",[],E,["https://www.youtube.com/watch?v=xCl_zqJdjAc&t=437s"],"我们粗剪里已经有轻量版（1.0 / 1.08 交替），这个是幅度更大的版本"),
("局部留色","镜头特效","画面变黑白，只留一样东西有颜色：人、手里的道具，或字幕里的关键词","整条片子的风格、只想让一样东西抢眼的时候",["抠像"],E,["https://www.youtube.com/watch?v=A0vzIQlaPX0&t=431s","https://www.choppity.com/tools/recreate-video-editing-style/ali-abdaal/"],"Ali Abdaal 风格"),
("聚光灯","镜头特效","画面压到接近全黑，一束柔和的圆形光打在人（或指着的东西）上，像舞台","坦白、揭晓真相「真正的原因是……」、情绪高点",[],E,["https://www.douyin.com/video/7597349220573003365","https://www.capcut.com/explore/spotlight-green-screen"],"和已有的「虚线圈聚焦」有点像，但没有圈、更暗更戏剧"),
("放大镜","镜头特效","一个放大镜图形移到画面某处（截图里的细节、产品、脸），镜片里显示放大后的样子","指细节、「仔细看」、小字",["图片"],M,["https://www.douyin.com/video/7597349220573003365"],""),
("漫画集中线","镜头特效","黑白放射状的速度线从画面四周冲向脸，闪 0.5–1 秒后消失，通常配一下放大","震惊、包袱、「等等什么？」、情绪高点",["音效"],E,["https://elements.envato.com/intense-motion-line-design-animation-EC85BWM"],""),
("霓虹涂鸦描边","镜头特效","一圈发光的粉/蓝/绿手绘线沿着人的轮廓一直抖动（逐帧沸腾），头旁边冒出小星星、爱心","兴奋时刻、俏皮的插话、自我介绍",["抠像"],M,["https://www.freevisuals.net/post/neon-scribble-templates-illuminating-videos-with-glowing-creativity"],"和已有的「贴纸描边」不同：会动、发光"),
("人物分身","镜头特效","画面里同时出现两三个抠出来的人（错开、变小、镜像或稍微延迟）","自己跟自己吵、两种观点、「我 vs 我」",["抠像"],M,["https://pippit.capcut.com/templates/clone-effect-2-persons-video"],"来源只是剪映模板首页"),
("手势控制缩放","镜头特效","人张开或捏合手指时，抠出来的身体跟着变大或缩小，像在屏幕上缩放自己","俏皮开场、「放大看」某个话题、大小对比",["抠像"],M,["https://www.douyin.com/video/7597003199622674425"],"要对准手势的时间点"),
("失焦入场","镜头特效","画面一开始雾蒙蒙、很糊、稍微放大，然后慢慢变清楚，人「对上焦」","开场第一个镜头、从 B-roll 切回来、走心的开头",[],E,["https://www.youtube.com/watch?v=q-qbKk8Qams&t=584s"],""),
("胶片卡顿颗粒","镜头特效","画面掉到很低的帧率（一卡一卡像定格动画），再叠一层跳动的胶片颗粒","复古/怀旧的故事、需要质感的标题段",[],E,["https://gotranscript.com/public/mastering-youtube-shorts-capcut-tutorial-for-ali-abdaal-alex-hormozi-and-cody-sanchez-styles"],""),
# ---- 转场 ----
("撕纸转场","转场","当前画面沿着锯齿状的纸边撕开（白色纸纤维边 + 阴影），露出下面的新画面","换话题、「第二部分」、前后对比揭晓",["音效"],M,["https://www.youtube.com/watch?v=A0vzIQlaPX0&t=123s","https://elements.envato.com/paperflow-vertical-handcrafted-paper-texture-trans-7EZ6N65"],"两路都找到了"),
("撕纸边画面","转场","一段 B-roll 或口播装在一张撕边纸片里（带投影），从纸面/彩色背景上滑进来","引出一个例子或小故事、换话题",["图片","视频"],M,["https://www.youtube.com/watch?v=5FtsVft5Vn8"],"Ali Abdaal 风格"),
("纸团展开","转场","一个揉皱的纸团展开铺满屏幕，下一张图/画面出现在展平的纸上，配纸张声","换话题、揭晓答案或下一个点",["音效"],M,["https://www.youtube.com/watch?v=5FtsVft5Vn8","https://www.youtube.com/watch?v=wxlDksHicW8"],"Ali Abdaal 招牌"),
("标题幕下滑","转场","一张全屏背景卡从上往下滑下来盖住人，卡上写段落标题，过一会儿滑走露出人","章节/话题切换、下一个要点",[],E,["https://www.youtube.com/watch?v=YUvG0hzwTsg&t=664s"],""),
("变焦模糊转场","转场","画面猛地往中间冲、带强烈的放射模糊，下一个画面从模糊里冲出来对上焦","换话题、有劲地跳到下一个点、切 B-roll",["音效"],M,["https://elements.envato.com/massive-camera-transitions-GZ6LFV9"],""),
("鱼眼拉远","转场","画面一开始像鱼眼一样鼓起来，然后快速变平并拉远，先快后慢","揭开新场景、进入动画段、能量拉满",["音效"],M,["https://www.youtube.com/watch?v=HQvV75kjblY&t=492s"],""),
("漏光闪白","转场","一道暖橙色/白色的光扫过画面，短暂过曝到接近全白，光过去时新画面出现","柔和地换话题、回忆、「那一刻我意识到……」",[],E,["https://elements.envato.com/light-transitions-7LW89AX"],""),
("快门闪白","转场","一下白闪加轻微抖动和「咔嚓」快门声，画面在闪的瞬间切走，像刚拍了张照","引出一张照片/证据、干脆地跳到新的点",["音效"],E,["https://www.youtube.com/watch?v=Ik2qnqfaPpg"],"Johnny Harris 风格"),
("光扫转场","转场","一道很亮的斜向光从整个画面扫过（连字幕一起扫），画面在光下面换掉","换话题、从开场进入正文",[],E,["https://gotranscript.com/public/mastering-youtube-shorts-capcut-tutorial-for-ali-abdaal-alex-hormozi-and-cody-sanchez-styles"],"Codie Sanchez 风格"),
("圆形扩散揭示","转场","新画面透过一个从 0 慢慢长到全屏的圆形出现，像光圈打开","揭示一个例子、开始讲故事、给出答案",["图片"],E,["https://www.youtube.com/watch?v=VQsna0Y4EPc&t=111s"],""),
("开幕分屏","转场","当前画面分成两三条，像幕布一样往两边拉开，露出下面的新画面或标题","换话题、大揭晓、段落开头",[],E,["https://www.youtube.com/watch?v=aULMmeQFqxk"],"来源只看了标题"),
("标题匹配切","转场","一串不同的文章截图快速切换，同一个词（如「通胀」）一直固定在屏幕同一个位置，周围的文章每次都变","表示「所有人都在讲 X」、开场制造紧迫感",["图片"],M,["https://www.youtube.com/watch?v=fQX20G0gxMs"],"Vox / Johnny Harris 风格；素材准备量大"),
("MVP结算转场","转场","画面镜像并斜 -9°，蒙版放大铺满再猛地缩小，抠出的人弹到前面，文字带循环扫光，踩音乐重拍","庆祝成果、铺垫后的高潮",["抠像","音效"],M,["https://www.douyin.com/shipin/7569409145187797030"],"抖音口播常见"),
# ---- 片头片尾 ----
("定格人物介绍","片头片尾","画面定格，背景虚化压暗，抠出的人加描边放大挪到一边，笔刷贴纸滑进来写上名字/身份，配打字声或嗖声","自我介绍、介绍嘉宾、综艺感出场",["抠像","音效"],E,["https://www.douyin.com/video/7620297661396176137","https://www.youtube.com/watch?v=W79u8d2VpVA&t=38s"],"两路都找到了，抖音口播常见"),
("定格快门","片头片尾","在节拍点上画面白闪 + 快门声定格，像一张照片停一秒（常配抠像 + 一行字），然后继续播放","开场钩子、「这是当时的我」、关键句前的停顿",["音效"],E,["https://www.douyin.com/shipin/7642894718157899839","https://www.kapwing.com/resources/how-to-make-videos-like-garyvee/"],"GaryVee 也用（定格 + 品牌音）"),
("电影黑边拉开","片头片尾","画面从全黑开始，上下两条黑边往外拉开露出画面，停在宽银幕比例，黑边上可以放标题","讲故事模式「给你讲个故事」、严肃/戏剧化的开场或结尾",[],E,["https://www.youtube.com/watch?v=ruIomvLW_AY","https://www.choppity.com/tools/recreate-video-editing-style/tom-noske/"],""),
("光标点关注","片头片尾","一个「关注/点赞」按钮弹出，鼠标或手指滑过来点一下，按钮变成「已关注」或变红，炸一下消失","中途或结尾的行动号召「关注看下集」",["音效"],E,["https://elements.envato.com/subscribe-elements-YZPLXTK"],""),
]
print(len(C))
cats = ['字体','素材','版式','镜头特效','转场','片头片尾']
DIFF = {E:'容易',M:'中等',H:'难'}
out = ['# 候选动效审核清单（10-28）','',
 f'从网上三路搜来 98 条，合并重复、去掉库里已有的（比如「人物出框」就是已有的相框分层），剩 **{len(C)} 条**。',
 '每条都有能点开的来源。标「来源较弱」的，是只看到了搜索摘要或模板首页，没有打开具体视频。','',
 '**怎么审**：回我编号就行，比如「要 1 3 5-9，12 不要」。没说的我当不要。','',
 '- 「需要」里的 **音效**：我们的出片流程现在还没有音效，这类动效做出来先不带声音。',
 '- 「难度」是在我们现有的网页渲染里做的难度。','']
n = 0; rows = []
for cat in cats:
    g = [c for c in C if c[1] == cat]
    out += [f'## {cat}（{len(g)}）','', '| # | 动效 | 长什么样 | 适合什么句子 | 需要 | 难度 | 来源 |','|---|---|---|---|---|---|---|']
    for c in g:
        n += 1
        name, _, what, use, needs, diff, srcs, note = c
        links = ' '.join(f'[{k+1}]({u})' for k, u in enumerate(srcs))
        weak = '来源只' in note or '只看了' in note or '只看到' in note or '第三方' in note
        extra = f'<br>💬 {note}' if note else ''
        out.append(f"| {n} | **{name}** | {what}{extra} | {use} | {'、'.join(needs) or '—'} | {DIFF[diff]} | {links}{' ⚠️来源较弱' if weak else ''} |")
        rows.append({'n': n, 'id': f'c{n:02d}', 'name': name, 'category': cat, 'what': what, 'use': use, 'needs': needs, 'difficulty': diff, 'sources': srcs, 'note': note})
    out.append('')
# 第二批（横向扩展，10-28 夜）：batch2.json 里按顺序接着编号
B2 = os.path.join(os.path.dirname(__file__), 'batch2.json')
if os.path.exists(B2):
    for b in json.load(open(B2)):
        n += 1
        rows.append({'n': n, 'id': f'c{n:02d}', 'name': b['name'], 'category': b['category'], 'what': b['what'], 'use': b['use'],
                     'needs': b['needs'], 'difficulty': b['difficulty'], 'sources': b['sources'], 'note': b.get('note', ''),
                     'ref_moment': b.get('ref_moment', ''), 'batch': 2})
    out += ['## 第二批（横向扩展）', '', f'见 batch2.json，共 {n - len(C)} 条。', '']
open(os.path.join(os.path.dirname(__file__), 'review.md'), 'w').write('\n'.join(out))
json.dump(rows, open(os.path.join(os.path.dirname(__file__), 'candidates.json'), 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(c[1] for c in C), Counter(c[5] for c in C))
og = json.load(open(os.path.join(os.path.dirname(__file__), 'og.json'))) if os.path.exists(os.path.join(os.path.dirname(__file__), 'og.json')) else {}
# only product pages: blog/site og:images are generic banners, not the effect
for r in rows:
    img = og.get(str(r['n']))
    if img and any(h in r['sources'][0] for h in ('envato.com', 'motionarray.com', 'pippit.capcut.com', 'freevisuals.net')):
        r['img'] = img
base = os.path.dirname(os.path.abspath(__file__))
for r in rows:
    d = os.path.join(base, 'effects', r['id'])
    if os.path.exists(os.path.join(d, 'preview.mp4')):
        r['preview'] = 'file://' + os.path.join(d, 'preview.mp4')
        r['poster'] = 'file://' + os.path.join(d, 'poster.jpg')
# 二级分类 + 自审结果 + 库里已有的（只展示，不用审）
tax = json.load(open(os.path.join(base, 'taxonomy.json')))
sub = {i: (cat, k) for cat, v in tax.items() if not cat.startswith('_') for k, ids in v.items() for i in ids}
for r in rows:
    r['sub'] = sub.get(r['id'], (r['category'], '其他'))[1]
    rv = os.path.join(base, 'effects', r['id'], 'review.json')
    if os.path.exists(rv):
        r['review'] = json.load(open(rv))
LIB = os.path.join(os.path.dirname(base), 'library', 'talking-head', 'effects')
for i in sorted(os.listdir(LIB)):
    m = os.path.join(LIB, i, 'meta.json')
    if not os.path.exists(m):
        continue
    m = json.load(open(m))
    cat, k = sub.get(i, (m['category'], '其他'))
    rows.append({'n': i, 'id': i, 'name': m['name'], 'category': cat, 'sub': k, 'what': ' + '.join(m.get('layers', [])),
                 'use': '、'.join(m.get('use_for', [])), 'needs': m.get('needs', []), 'difficulty': 'easy',
                 'sources': [], 'note': '', 'lib': True,
                 'preview': 'file://' + os.path.join(LIB, i, 'preview.mp4'), 'poster': 'file://' + os.path.join(LIB, i, 'poster.jpg')})
html = open(os.path.join(os.path.dirname(__file__), 'review_template.html')).read().replace('/*DATA*/[]', json.dumps(rows, ensure_ascii=False))
open(os.path.join(os.path.dirname(__file__), 'review.html'), 'w').write(html)
