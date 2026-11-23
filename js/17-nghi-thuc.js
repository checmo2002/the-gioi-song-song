/* Nghi thức: Phật giáo 5 bước (chọn nén → châm → phẩy tắt → vái 3 vái → cắm & khấn); Công giáo (chọn nến → châm → che gió → đặt nến → dấu Thánh giá & cầu nguyện) */
(function(){
 var KEY='ss-huong',BURN=15*60e3,hall=document.getElementById('hall');if(!hall)return;
 var D={};try{D=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}D.done=D.done||{};D.tn=D.tn||{};D.n=D.n||0;
 function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
 function cg(){return window.ssFaith==='cg'}
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function person(id){return (window.ssPerson?ssPerson.all():[]).filter(function(p){return p.id===id})[0]}
 var NS='http://www.w3.org/2000/svg';
 // ---------- âm thanh nhỏ ----------
 var ac;function AC(){try{if((window.ssSfx&&ssSfx()===0))return null}catch(e){}try{ac=ac||ssAm();if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}}
 function crackle(){var a=AC();if(!a)return;var t=a.currentTime;for(var k=0;k<7;k++){var n=a.createBuffer(1,a.sampleRate*.02,a.sampleRate),d=n.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);var s_=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s_.buffer=n;f.type='highpass';f.frequency.value=1800;g.gain.value=.18;s_.connect(f).connect(g).connect((window.ssRa?ssRa(a):a.destination));s_.start(t+k*.06+Math.random()*.04)}}
 function whoosh(){var a=AC();if(!a)return;var t=a.currentTime,n=a.createBuffer(1,a.sampleRate*.35,a.sampleRate),d=n.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length);var s_=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s_.buffer=n;f.type='bandpass';f.frequency.value=700;f.Q.value=.6;g.gain.value=.3;s_.connect(f).connect(g).connect((window.ssRa?ssRa(a):a.destination));s_.start(t)}
 function ting(fq){var a=AC();if(!a)return;var t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=fq||880;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);o.connect(g).connect((window.ssRa?ssRa(a):a.destination));o.start(t);o.stop(t+1.2)}
 // ---------- khung ----------
 var box=document.createElement('div');box.className='hg';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
 box.innerHTML='<div class="hg-card"><button type="button" class="hg-x" aria-label="Đóng">×</button><div class="hg-hd"><small></small><b></b></div><div class="hg-steps"></div><div class="hg-body"></div></div>';
 document.body.appendChild(box);
 var q=function(c){return box.querySelector(c)},body=q('.hg-body'),G=null;
 var ICON={hold:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.6 1.6 0 0 1 2.7-1.6L7 13V8a2 2 0 0 1 2-2"/></svg>',
  swipe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>',
  tap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>',
  drag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 4v14M7 13l5 5 5-5"/></svg>',
  cross:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v18M6 9h12"/></svg>'};
 function head(sub,title,n,i){q('.hg-hd small').textContent=sub;q('.hg-hd b').textContent=title;var h='';for(var k=0;k<n;k++)h+='<i class="'+(k<=i?'on':'')+'"></i>';q('.hg-steps').innerHTML=h}
 function tip(ic,t,sm){var e=q('.hg-tip');if(e)e.innerHTML=(ic?ICON[ic]:'')+'<span>'+t+(sm?'<br><small>'+sm+'</small>':'')+'</span>'}
 function close(){box.hidden=true;if(G&&G.stop)G.stop();G=null}
 q('.hg-x').addEventListener('click',close);
 document.addEventListener('keydown',function(e){if(!box.hidden&&e.key==='Escape')close()});
 // ---------- vẽ SVG ----------
 function el(tag,at,par){var e=document.createElementNS(NS,tag);for(var k in at)e.setAttribute(k,at[k]);par&&par.appendChild(e);return e}
 function flame(par,x,y,s,cls){var g=el('g',{transform:'translate('+x+' '+y+') scale('+(s||1)+')'},par),f=el('g',{'class':'fl '+(cls||'')},g);
  el('path',{d:'M0 0C-7 -4 -6 -14 0 -24C6 -14 7 -4 0 0Z',fill:'url(#gFl)'},f);el('path',{d:'M0 -1C-3 -3 -3 -8 0 -13C3 -8 3 -3 0 -1Z',fill:'#FFF6D0'},f);return g}
 function defs(svg){svg.insertAdjacentHTML('afterbegin','<defs><radialGradient id="gFl" cx=".5" cy=".75" r=".7"><stop offset="0" stop-color="#FFF2B0"/><stop offset=".45" stop-color="#FFB23A"/><stop offset="1" stop-color="#E2501A" stop-opacity=".85"/></radialGradient><linearGradient id="gBr" x1="0" x2="1"><stop offset="0" stop-color="#6E4A1C"/><stop offset=".45" stop-color="#D9A84A"/><stop offset="1" stop-color="#7A5220"/></linearGradient><radialGradient id="gGlow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>')}
 function stageXY(svg,e){var r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*360,(e.clientY-r.top)/r.height*400]}
 function ringAt(svg,x,y){var g=el('g',{},svg);el('circle',{cx:x,cy:y,r:26,fill:'none',stroke:'rgba(255,255,255,.18)','stroke-width':4},g);var r=el('circle',{'class':'ring',cx:x,cy:y,r:26,fill:'none',stroke:'#FFD27A','stroke-width':4,'stroke-linecap':'round','stroke-dasharray':163.4,'stroke-dashoffset':163.4,transform:'rotate(-90 '+x+' '+y+')'},g);return {g:g,set:function(p){r.setAttribute('stroke-dashoffset',163.4*(1-p))}}}
 // ---------- kết thúc chung ----------
 function finish(pid,quick,kind,n,tn){var p=person(pid),key=(pid||'all')+'|'+today(),gio=p&&window.ssGioText&&/hôm nay là ngày giỗ/.test(ssGioText(p));
  if(tn&&tn.trim()){(D.tn[pid||'all']=D.tn[pid||'all']||[]).unshift({t:Date.now(),x:tn.trim().slice(0,400)});D.tn[pid||'all']=D.tn[pid||'all'].slice(0,30)}
  var cd=0;if(!D.done[key]){cd=(quick?9:27)*(gio?3:1);D.done[key]=1}
  D.n+=n;D.lit={t:Date.now(),n:n,k:kind,c:cg()?'cg':'phat'};save();
  close();window._ssHgGo=1;var b=document.querySelector('.rit .rit-go');b&&b.click();window._ssHgGo=0;
  setTimeout(function(){window.ssRitual&&ssRitual.close()},quick?1200:2600);
  if(cd&&window.ssMo&&ssMo.add){ssMo.add(cd);window.toast&&setTimeout(function(){toast('+'+cd+' công đức'+(gio?' · ngày giỗ ×3':''))},2800)}
  if(gio)rain();window.ssWorld&&ssWorld.send&&ssWorld.send();ssLit.draw()}
 function rain(){var o=document.createElement('div');o.className='lvu-fx';o.style.cssText='position:fixed;inset:0;z-index:384;pointer-events:none;overflow:hidden';var h='';for(var i=0;i<36;i++)h+='<i class="lvu-p pet" style="--x:'+(Math.random()*100)+'vw;--d:'+(Math.random()*1.5)+'s;--t:'+(3+Math.random()*2)+'s;--r:'+(Math.random()*720-360)+'deg;--dx:'+(Math.random()*120-60)+'px;--s:'+(10+Math.random()*10)+'px"></i>';o.innerHTML=h;document.body.appendChild(o);setTimeout(function(){o.remove()},6500);window.ssBell&&ssBell(cg()?'cg':'phat')}
 function prayStep(pid,kind,n,i,total){var p=person(pid),nm=p?p.name:(cg()?'các linh hồn':'các hương linh'),gio=p&&window.ssGioText&&/hôm nay là ngày giỗ/.test(ssGioText(p));
  var txt=cg()?'Lạy Chúa, xin cho linh hồn '+esc(nm)+' được nghỉ yên muôn đời, và cho ánh sáng ngàn thu chiếu soi trên linh hồn ấy. Amen.'
   :'Nam mô A Di Đà Phật. Con thành tâm dâng '+(n===1?'nén':n+' nén')+' tâm hương, tưởng nhớ '+esc(nm)+'. Nguyện cầu hương linh được an lạc, siêu sinh về cõi lành.';
  var old=(D.tn[pid||'all']||[])[0];
  head(cg()?'Cầu nguyện':'Khấn nguyện',cg()?'Dâng lời cầu nguyện':'Lời khấn',total,i);
  body.innerHTML='<div class="hg-pray">'+txt+'</div>'+(gio?'<div class="hg-gio">Hôm nay là ngày giỗ · công đức nhân ba</div>':'')+
   '<textarea class="hg-tn" maxlength="400" placeholder="'+(cg()?'Ý nguyện riêng của bạn (không bắt buộc)':'Tâm nguyện riêng của bạn (không bắt buộc)')+'"></textarea>'+
   (old?'<p class="hg-old">Lần trước: “'+esc(old.x.slice(0,80))+(old.x.length>80?'…':'')+'”</p>':'')+
   '<div class="hg-foot"><button type="button" class="pri">'+(cg()?'Amen':'Mô Phật · Hoàn tất')+'</button></div>';
  q('.hg-foot .pri').addEventListener('click',function(){finish(pid,false,kind,n,q('.hg-tn').value)})}
 // ---------- PHẬT GIÁO ----------
 function phat(pid){var N=3,T=6;
  function pick(){head('Dâng hương','Chọn số nén hương',T,0);
   body.innerHTML='<div class="hg-sub" style="margin:10px 0 6px">Theo tục lệ, thắp số nén lẻ</div><div class="hg-pick"><button type="button" data-n="1"><b>1</b>nén<small>Ngày thường</small></button><button type="button" data-n="3"><b>3</b>nén<small>Phổ biến</small></button><button type="button" data-n="5"><b>5</b>nén<small>Lễ trọng</small></button></div><div class="hg-foot"><button type="button" class="hg-quick">Thắp nhanh</button></div>';
   body.querySelectorAll('[data-n]').forEach(function(b){b.addEventListener('click',function(){N=+b.dataset.n;scene()})});
   q('.hg-quick').addEventListener('click',function(){finish(pid,true,'huong',3,'')})}
  var svg,bd,flG,emG,smG,plG,lampF,st=0,raf=0,last=0,hold=false,prog=0,base=[200,250],ang=0,flameS=1,bows=0,drag=null,ringH;
  function scene(){body.innerHTML='<div class="hg-stage"></div><div class="hg-tip"></div><div class="hg-sub"></div><div class="hg-foot"><button type="button" class="skip">Bỏ qua bước này</button></div>';
   svg=el('svg',{viewBox:'0 0 360 400'},q('.hg-stage'));defs(svg);
   el('ellipse',{cx:180,cy:110,rx:180,ry:120,fill:'url(#gGlow)',opacity:.5},svg);
   el('rect',{x:0,y:342,width:360,height:58,fill:'#5A2C12'},svg);el('rect',{x:0,y:340,width:360,height:4,fill:'#C9A24A'},svg);
   // đèn dầu
   el('path',{d:'M40 338h60l-8 -14h-44z',fill:'url(#gBr)'},svg);el('ellipse',{cx:70,cy:324,rx:26,ry:6,fill:'#8A6328'},svg);el('rect',{x:69,y:312,width:2,height:12,fill:'#2A1A0E'},svg);
   el('circle',{cx:70,cy:300,r:26,fill:'url(#gGlow)'},svg);lampF=flame(svg,70,314,1.1);
   // lư hương
   el('path',{d:'M162 340l-8 0 6 -14zM238 340l8 0 -6 -14z',fill:'#7A5220'},svg);
   el('path',{d:'M146 290Q148 336 200 338Q252 336 254 290Z',fill:'url(#gBr)'},svg);el('ellipse',{cx:200,cy:290,rx:54,ry:12,fill:'#9A7432'},svg);el('ellipse',{cx:200,cy:291,rx:47,ry:9,fill:'#D8CFC0'},svg);
   for(var k=0;k<Math.min(24,D.n);k++){var xx=165+((k*37)%70),yy=287+((k*13)%7);el('rect',{x:xx,y:yy-10,width:1.6,height:10,fill:'#B23A2A',opacity:.75},svg)}
   el('path',{d:'M160 314q40 10 80 0',stroke:'#6E4A1C','stroke-width':2,fill:'none'},svg);
   plG=el('g',{},svg);
   // bó nhang trên tay
   bd=el('g',{},svg);flG=el('g',{},bd);emG=el('g',{},bd);smG=el('g',{'class':'smk',opacity:0},bd);
   var sp=N===1?[0]:N===3?[-7,0,7]:[-12,-6,0,6,12];
   sp.forEach(function(dx){el('line',{x1:dx*.4,y1:0,x2:dx,y2:-40,stroke:'#B23A2A','stroke-width':3.2,'stroke-linecap':'round'},bd);el('line',{x1:dx,y1:-40,x2:dx*1.3,y2:-150,stroke:'#6B3A22','stroke-width':3,'stroke-linecap':'round'},bd)});
   bd.appendChild(flG);bd.appendChild(emG);bd.appendChild(smG);
   sp.forEach(function(dx){flame(flG,dx*1.3,-150,.62);el('circle',{'class':'pulse',cx:dx*1.3,cy:-150,r:2.6,fill:'#FF5A2A'},emG);el('path',{d:'M'+dx*1.3+' -154c-6 -10 6 -18 0 -30c-6 -10 6 -18 0 -30'},smG)});
   emG.setAttribute('opacity',0);flG.setAttribute('opacity',0);
   q('.skip').addEventListener('click',function(){next(true)});
   bindPtr();go(1)}
  function place(){bd.setAttribute('transform','translate('+base[0].toFixed(1)+' '+base[1].toFixed(1)+') rotate('+ang.toFixed(1)+')')}
  function go(n){st=n;head('Dâng hương',['','Châm lửa','Phẩy tắt lửa','Vái ba vái','Cắm nhang','Lời khấn'][n],T,n);
   var sub=q('.hg-sub');
   if(n===1){base=[200,250];ang=0;place();ringH=ringAt(svg,250,130);tip('hold','Giữ để châm lửa','Đưa đầu nhang vào ngọn đèn dầu');sub.textContent=''}
   if(n===2){ringH&&ringH.g.remove();flG.setAttribute('opacity',1);flameS=1;tip('swipe','Vuốt ngang để phẩy tắt lửa');sub.textContent='Phẩy tay cho tắt, không thổi bằng miệng';motion(true)}
   if(n===3){motion(false);flG.setAttribute('opacity',0);emG.setAttribute('opacity',1);smG.setAttribute('opacity',1);bows=0;tip('tap','Chạm để vái · 0/3');sub.textContent='Nâng nhang ngang trán, vái ba vái'}
   if(n===4){tip('drag','Kéo nhang thả vào lư hương');sub.textContent='Hoặc chạm vào lư hương';hint=el('path',{d:'M200 255l0 22M192 270l8 8 8 -8','class':'pulse',stroke:'#FFD27A','stroke-width':3,fill:'none','stroke-linecap':'round'},svg)}
   if(n===5){stop();prayStep(pid,'huong',N,5,T)}
   loop()}
  var hint;
  function next(skip){if(st===1){prog=1;lit()}else if(st===2){flameS=0;out()}else if(st===3){bows=3;go(4)}else if(st===4){plant()}}
  function lit(){st=8;hold=false;crackle();ang=-55;base=[193,386];place();setTimeout(function(){base=[200,250];ang=0;anim(400);go(2)},350)}
  function out(){whoosh();go(3)}
  function plant(){if(hint)hint.remove();var sp=N===1?[0]:N===3?[-9,0,9]:[-16,-8,0,8,16];bd.style.display='none';
   sp.forEach(function(dx){var g=el('g',{transform:'translate('+(200+dx*1.6)+' 300) rotate('+dx*.6+')'},plG);el('line',{x1:0,y1:0,x2:0,y2:-24,stroke:'#B23A2A','stroke-width':3,'stroke-linecap':'round'},g);el('line',{x1:0,y1:-24,x2:0,y2:-120,stroke:'#6B3A22','stroke-width':3,'stroke-linecap':'round'},g);el('circle',{'class':'pulse',cx:0,cy:-120,r:2.6,fill:'#FF5A2A'},g);var sm=el('g',{'class':'smk'},g);el('path',{d:'M0 -124c-6 -10 6 -18 0 -30c-6 -10 6 -18 0 -30'},sm)});
   ting(660);tip('','Nhang đã cắm ngay ngắn');setTimeout(function(){go(5)},1100);st=9}
  var A0=null;function anim(ms){A0={b:base.slice(),a:ang,t:performance.now(),ms:ms}}
  function loop(){if(raf)return;last=performance.now();var f=function(now){raf=0;var dt=Math.min(.05,(now-last)/1000);last=now;
    if(st===1){prog=Math.max(0,Math.min(1,prog+(hold?dt/1.5:-dt*.8)));ringH&&ringH.set(prog);ang=-55*prog;base=[200-7*prog,250+136*prog];place();if(prog>=1){prog=0;lit();}}
    if(st===2){flG.querySelectorAll('.fl').forEach(function(f){f.parentNode.setAttribute('transform',f.parentNode.getAttribute('transform').replace(/scale\([^)]*\)/,'scale('+(.62*Math.max(0,flameS)).toFixed(3)+')'))});if(flameS<=0){out()}}
    if(st===4&&!drag){base[0]+=(200-base[0])*.15;base[1]+=(250-base[1])*.15;place()}
    if(st>=1&&st<=4)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;motion(false)}
  // cảm biến lắc
  var mh=null;function motion(on){if(on&&!mh){mh=function(e){var a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;var m=Math.abs(a.x||0);if(st===2&&m>14){flameS-=.08}};addEventListener('devicemotion',mh)}if(!on&&mh){removeEventListener('devicemotion',mh);mh=null}}
  function bindPtr(){var st_=q('.hg-stage'),px=null;
   st_.addEventListener('pointerdown',function(e){e.preventDefault();st_.setPointerCapture&&st_.setPointerCapture(e.pointerId);var xy=stageXY(svg,e);
    if(st===1)hold=true;
    if(st===2)px=xy[0];
    if(st===3){bows++;base=[200,205];anim(0);place();setTimeout(function(){base=[200,250];place()},260);ting(520+bows*80);tip('tap','Chạm để vái · '+bows+'/3');if(bows>=3)setTimeout(function(){go(4)},500)}
    if(st===4){if(Math.hypot(xy[0]-200,xy[1]-305)<60){plant();return}drag=[xy[0]-base[0],xy[1]-base[1]]}});
   st_.addEventListener('pointermove',function(e){var xy=stageXY(svg,e);
    if(st===2&&px!==null){var d=xy[0]-px;px=xy[0];flameS-=Math.abs(d)/260;ang=Math.max(-14,Math.min(14,ang+d*.25));place()}
    if(st===4&&drag){base=[xy[0]-drag[0],xy[1]-drag[1]];place();if(Math.hypot(base[0]-200,base[1]-310)<34){drag=null;plant()}}});
   function up(){hold=false;px=null;if(st===2){ang=0;place()}if(st===4&&drag){drag=null}}
   st_.addEventListener('pointerup',up);st_.addEventListener('pointercancel',up);
   st_.tabIndex=0;st_.setAttribute('aria-label','Khu vực nghi thức: phím cách để thao tác');
   st_.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();if(st===1)hold=true;if(st===3){var ev=new PointerEvent('pointerdown',{clientX:0,clientY:0});st_.dispatchEvent(ev)}if(st===4)plant()}if(st===2&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){flameS-=.3}});
   st_.addEventListener('keyup',function(e){if(e.key===' '||e.key==='Enter')hold=false})}
  G={stop:stop};pick()}
 // ---------- CÔNG GIÁO ----------
 function nen(pid){var C='#F4EEE0',T=6,CL={trang:['#F4EEE0','Trắng','Cầu nguyện'],do:['#C8402E','Đỏ','Tạ ơn'],xanh:['#5A86C8','Xanh','Cầu bình an']};
  function pick(){head('Thắp nến','Chọn cây nến',T,0);
   body.innerHTML='<div class="hg-sub" style="margin:10px 0 6px">Mỗi màu nến mang một ý nguyện</div><div class="hg-pick">'+Object.keys(CL).map(function(k){return '<button type="button" data-c="'+k+'"><i class="dot" style="background:'+CL[k][0]+'"></i><b style="font-size:15px">'+CL[k][1]+'</b><small>'+CL[k][2]+'</small></button>'}).join('')+'</div><div class="hg-foot"><button type="button" class="hg-quick">Thắp nhanh</button></div>';
   body.querySelectorAll('[data-c]').forEach(function(b){b.addEventListener('click',function(){C=CL[b.dataset.c][0];scene()})});
   q('.hg-quick').addEventListener('click',function(){finish(pid,true,'nen',1,'')})}
  var svg,cd,fl,hand,wind,st=0,raf=0,last=0,hold=false,prog=0,base=[200,300],drag=null,ringH,pts,lines,ci=0,hint;
  function scene(){body.innerHTML='<div class="hg-stage"></div><div class="hg-tip"></div><div class="hg-sub"></div><div class="hg-foot"><button type="button" class="skip">Bỏ qua bước này</button></div>';
   svg=el('svg',{viewBox:'0 0 360 400'},q('.hg-stage'));defs(svg);
   el('ellipse',{cx:180,cy:120,rx:180,ry:130,fill:'url(#gGlow)',opacity:.35},svg);
   el('rect',{x:0,y:350,width:360,height:50,fill:'#3A2A22'},svg);
   // nến lớn
   el('rect',{x:46,y:190,width:28,height:160,rx:3,fill:'#F6F0E2'},svg);el('path',{d:'M52 230h16M60 222v16',stroke:'#C9A24A','stroke-width':3},svg);el('rect',{x:59,y:180,width:2,height:10,fill:'#2A1A0E'},svg);
   el('circle',{cx:60,cy:168,r:28,fill:'url(#gGlow)'},svg);flame(svg,60,182,1.2);
   // giá nến
   el('rect',{x:150,y:338,width:180,height:8,rx:2,fill:'#8C6A3A'},svg);el('rect',{x:160,y:346,width:6,height:6,fill:'#6E4A1C'},svg);el('rect',{x:314,y:346,width:6,height:6,fill:'#6E4A1C'},svg);
   for(var k=0;k<5;k++){var xx=170+k*34;if(k===2)continue;el('rect',{x:xx-5,y:316,width:10,height:22,rx:2,fill:'#EFE6D2'},svg);flame(svg,xx,315,.5)}
   hint=el('rect',{x:233,y:306,width:16,height:32,rx:3,fill:'none',stroke:'#BFD0FF','stroke-width':2,'stroke-dasharray':'4 3',opacity:0},svg);
   // nến trên tay
   cd=el('g',{},svg);el('rect',{x:-8,y:-70,width:16,height:70,rx:3,fill:C},cd);el('rect',{x:-1,y:-80,width:2,height:10,fill:'#2A1A0E'},cd);
   el('path',{d:'M-14 -6h28l-4 8h-20z',fill:'#C9A24A'},cd);
   fl=flame(cd,0,-80,.85,'');fl.setAttribute('opacity',0);
   wind=el('g',{opacity:0},svg);['M240 60h120','M220 100h140','M250 140h110'].forEach(function(d,i){el('path',{d:d,'class':'wl',style:'animation-delay:'+(i*.35)+'s'},wind)});
   hand=el('path',{d:'M-30 -60c-10 -30 0 -50 14 -56c6 10 4 30 0 50z',fill:'#E8C9A8',stroke:'#B08868','stroke-width':1.5,opacity:0},cd);
   q('.skip').addEventListener('click',function(){next()});bindPtr();go(1)}
  function place(){cd.setAttribute('transform','translate('+base[0].toFixed(1)+' '+base[1].toFixed(1)+')')}
  function go(n){st=n;head('Thắp nến',['','Châm lửa','Che gió','Đặt nến','Dấu Thánh giá','Cầu nguyện'][n],T,n);var sub=q('.hg-sub');
   if(n===1){base=[200,300];place();ringH=ringAt(svg,250,150);tip('hold','Giữ để châm lửa','Mồi lửa từ cây nến lớn');sub.textContent=''}
   if(n===2){ringH&&ringH.g.remove();base=[200,300];place();fl.setAttribute('opacity',1);fl.querySelector('.fl').classList.add('wild');wind.setAttribute('opacity',1);prog=0;ringH=ringAt(svg,300,240);tip('hold','Giữ tay che gió cho lửa đứng');sub.textContent='Thả tay là lửa lại chập chờn'}
   if(n===3){ringH&&ringH.g.remove();wind.setAttribute('opacity',0);hand.setAttribute('opacity',0);fl.querySelector('.fl').classList.remove('wild');hint.setAttribute('opacity',1);hint.classList.add('pulse');tip('drag','Kéo nến đặt lên giá');sub.textContent='Hoặc chạm vào chỗ trống trên giá'}
   if(n===4){cross()}
   if(n===5){stop();prayStep(pid,'nen',1,5,T)}
   loop()}
  function next(){if(st===1){prog=0;crackle();base=[200,300];place();go(2)}else if(st===2){prog=0;ting(800);go(3)}else if(st===3){putDown()}else if(st===4){ci=4;doneCross()}}
  function putDown(){base=[241,338];place();hint.remove();ting(700);st=9;setTimeout(function(){go(4)},700)}
  function cross(){tip('cross','Làm dấu Thánh giá','Chạm lần lượt: trán → ngực → vai trái → vai phải');q('.hg-sub').textContent='';ci=0;
   var g=el('g',{},svg);el('rect',{x:0,y:0,width:360,height:400,fill:'rgba(10,14,30,.72)'},g);
   el('circle',{cx:180,cy:96,r:34,fill:'rgba(255,255,255,.08)',stroke:'rgba(255,255,255,.25)'},g);el('path',{d:'M110 300c0 -90 20 -150 70 -160c50 10 70 70 70 160z',fill:'rgba(255,255,255,.08)',stroke:'rgba(255,255,255,.25)'},g);
   lines=el('g',{},g);pts=[[180,92,'Trán'],[180,226,'Ngực'],[128,170,'Vai trái'],[232,170,'Vai phải']].map(function(p,i){var c=el('g',{},g);el('circle',{cx:p[0],cy:p[1],r:17,fill:i?'rgba(191,208,255,.15)':'rgba(191,208,255,.35)',stroke:'#BFD0FF','stroke-width':2,'class':i?'':'pulse'},c);var t=el('text',{x:p[0],y:p[1]+36,'text-anchor':'middle',fill:'#DCE6FF','font-size':13},c);t.textContent=p[2];return {x:p[0],y:p[1],g:c}});pts.layer=g}
  function hitCross(xy){var p=pts[ci];if(!p||Math.hypot(xy[0]-p.x,xy[1]-p.y)>32)return;p.g.firstChild.setAttribute('fill','#BFD0FF');p.g.firstChild.classList.remove('pulse');
   if(ci===1)el('line',{x1:180,y1:92,x2:180,y2:226,stroke:'#FFE7A8','stroke-width':4,'stroke-linecap':'round'},lines);
   if(ci===3)el('line',{x1:128,y1:170,x2:232,y2:170,stroke:'#FFE7A8','stroke-width':4,'stroke-linecap':'round'},lines);
   ting(600+ci*90);ci++;var nx=pts[ci];if(nx){nx.g.firstChild.classList.add('pulse');nx.g.firstChild.setAttribute('fill','rgba(191,208,255,.35)')}if(ci>=4)doneCross()}
  function doneCross(){st=9;if(lines&&!lines.childNodes.length){el('line',{x1:180,y1:92,x2:180,y2:226,stroke:'#FFE7A8','stroke-width':4},lines);el('line',{x1:128,y1:170,x2:232,y2:170,stroke:'#FFE7A8','stroke-width':4},lines)}tip('','Nhân danh Cha, và Con, và Thánh Thần');setTimeout(function(){go(5)},1300)}
  function loop(){if(raf)return;last=performance.now();var f=function(now){raf=0;var dt=Math.min(.05,(now-last)/1000);last=now;
    if(st===1){prog=Math.max(0,Math.min(1,prog+(hold?dt/1.4:-dt*.8)));ringH&&ringH.set(prog);base=[200-122*prog,300-34*prog];place();if(prog>=1){prog=0;crackle();base=[200,300];place();go(2)}}
    if(st===2){prog=Math.max(0,Math.min(1,prog+(hold?dt/2.5:-dt*.25)));ringH&&ringH.set(prog);hand.setAttribute('opacity',hold?1:0);var w=fl.querySelector('.fl');w.classList.toggle('wild',!hold);if(prog>=1){ting(800);go(3)}}
    if(st===3&&!drag){base[0]+=(200-base[0])*.15;base[1]+=(300-base[1])*.15;place()}
    if(st>=1&&st<=3)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
  function bindPtr(){var s_=q('.hg-stage');
   s_.addEventListener('pointerdown',function(e){e.preventDefault();s_.setPointerCapture&&s_.setPointerCapture(e.pointerId);var xy=stageXY(svg,e);
    if(st===1||st===2)hold=true;
    if(st===3){if(Math.hypot(xy[0]-241,xy[1]-322)<40){putDown();return}drag=[xy[0]-base[0],xy[1]-base[1]]}
    if(st===4)hitCross(xy)});
   s_.addEventListener('pointermove',function(e){var xy=stageXY(svg,e);if(st===3&&drag){base=[xy[0]-drag[0],xy[1]-drag[1]];place();if(Math.hypot(base[0]-241,base[1]-338)<30){drag=null;putDown()}}if(st===4&&e.buttons)hitCross(xy)});
   function up(){hold=false;drag=null}s_.addEventListener('pointerup',up);s_.addEventListener('pointercancel',up);
   s_.tabIndex=0;s_.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();if(st<=2)hold=true;if(st===3)putDown();if(st===4){var p=pts[ci];p&&hitCross([p.x,p.y])}}});
   s_.addEventListener('keyup',function(){hold=false})}
  G={stop:stop};pick()}
 // ---------- mở nghi thức thay cho nút thắp cũ ----------
 window.ssHuong={open:function(pid){box.classList.toggle('cg',cg());box.setAttribute('aria-label',cg()?'Thắp nến':'Dâng hương');box.hidden=false;if(G&&G.stop)G.stop();(cg()?nen:phat)(pid==='all'?null:pid)},close:close,data:function(){return D}};
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.rit .rit-go');if(!b||window._ssHgGo)return;e.preventDefault();e.stopImmediatePropagation();
  var p=document.querySelector('.rit [data-rp][aria-pressed="true"]');ssHuong.open(p?p.dataset.rp:'all')},true);
 // ---------- nhang / nến đang cháy trong cảnh ----------
 var PEER={};
 window.ssLit={mine:function(){return D.lit&&Date.now()-D.lit.t<BURN?D.lit.t:0},peer:function(id,t){PEER[id]=t},draw:draw};
 function draw(){var st=document.getElementById('wStage');if(!st)return;[].forEach.call(st.querySelectorAll('.lit-ov'),function(x){x.remove()});
  var ws=hall.dataset.ws,O=hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h';if(ws!=='dien'&&ws!=='tho')return;
  var hs=[].filter.call(hall.querySelectorAll('.wh[data-w="nhang"]'),function(h){return /Thắp/.test(h.textContent)})[0];if(!hs)return;
  var L=[];var m=ssLit.mine();if(m&&D.lit.c===(ws==='tho'?'cg':'phat'))L.push({t:m,n:D.lit.n,k:D.lit.k});
  Object.keys(PEER).forEach(function(k){if(Date.now()-PEER[k]<BURN)L.push({t:PEER[k],n:3,k:ws==='tho'?'nen':'huong'})});
  var x=parseFloat(hs.style.left),y=parseFloat(hs.style.top);if(isNaN(x)||isNaN(y))return;
  L.slice(0,4).forEach(function(it,i){var left=(Date.now()-it.t)/BURN,o=document.createElement('div');o.className='lit-ov';o.style.left=(x+(i-(L.length-1)/2)*.6)+'%';o.style.top=(y+(ws==='tho'?4.24:3.26))+'%';o.style.height=(ws==='tho'?1.8:2.6)+'%';
   var h=Math.max(.08,1-left),sv='<svg viewBox="0 0 20 48">';
   if(it.k==='nen'){sv+='<rect x="6" y="'+(48-34*h)+'" width="8" height="'+34*h+'" rx="1.5" fill="#F4EEE0"/><path d="M10 '+(44-34*h)+'c-3 -2 -3 -6 0 -10c3 4 3 8 0 10z" fill="#FFB23A" class="em"/>'}
   else{var n=Math.min(it.n,5),sp=n===1?[10]:n===3?[7,10,13]:[5,7.5,10,12.5,15];sp.forEach(function(xx){var top=48-44*h;sv+='<line x1="'+xx+'" y1="48" x2="'+xx+'" y2="'+top+'" stroke="#6B3A22" stroke-width="1.9"/><circle class="em" cx="'+xx+'" cy="'+top+'" r="1.7" fill="#FF5A2A"/><g class="smk"><path d="M'+xx+' '+(top-2)+'c-3 -5 3 -9 0 -15c-3 -5 3 -9 0 -15"/></g>'})}
   o.innerHTML=sv+'</svg>';o.title='Nhang đang cháy · còn khoảng '+Math.ceil((1-left)*15)+' phút';st.appendChild(o)})}
 new MutationObserver(function(){setTimeout(draw,80)}).observe(hall,{attributes:true,attributeFilter:['data-ws','hidden']});
 addEventListener('resize',function(){setTimeout(draw,120)});setInterval(draw,20000);setTimeout(draw,1500);
})();
