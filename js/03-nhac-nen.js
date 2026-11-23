/* ===== Nhạc nền theo lối: tự soạn bằng Web Audio (không cần tệp nhạc) ===== */
(function(){
 var KEY='ss-music',ctx=null,master=null,wet=null,timer=null,cur=null,nextT=0,st={},on=true;
 try{on=localStorage.getItem(KEY)!=='off'}catch(e){}
 var VOL=.16,MV=1;try{var _mv=parseFloat(localStorage.getItem('ss-music-vol'));if(_mv>=0&&_mv<=1)MV=_mv}catch(e){}
 // hiệu ứng (chuông, mõ, nến, bay lên): âm lượng chung 0..1 do bảng cài đặt (js/27) chỉnh; mỗi AudioContext đi qua một nút gain riêng
 window.ssSfx=function(){try{var v=parseFloat(localStorage.getItem('ss-sfx'));if(v>=0&&v<=1)return v}catch(e){}return 1};
 window.ssRa=function(ac){if(!ac._sfx){ac._sfx=ac.createGain();ac._sfx.connect(ac.destination)}ac._sfx.gain.value=ssSfx();return ac._sfx};
 function mk(){if(ctx)return;var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();
  master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  // vang: tiếng dội của chính điện / thánh đường
  var len=ctx.sampleRate*4.5,ir=ctx.createBuffer(2,len,ctx.sampleRate);
  for(var c=0;c<2;c++){var d=ir.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
  var cv=ctx.createConvolver();cv.buffer=ir;wet=ctx.createGain();wet.gain.value=.55;wet.connect(cv);cv.connect(master)}
 function out(g){g.connect(master);g.connect(wet)}
 function env(g,t,a,peak,dec){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec)}
 function hz(m){return 440*Math.pow(2,(m-69)/12)}
 /* --- Phật giáo: đàn tranh ngũ cung, mõ, chuông chùa, nền trầm --- */
 function tranh(t,m,v){var g=ctx.createGain();env(g,t,.006,v,2.6);out(g);
  [[1,'triangle',1],[2,'sine',.35],[3,'sine',.12]].forEach(function(h){var o=ctx.createOscillator();o.type=h[1];var f=hz(m)*h[0];
   if(Math.random()<.3){o.frequency.setValueAtTime(f*.944,t);o.frequency.linearRampToValueAtTime(f,t+.18)}else o.frequency.setValueAtTime(f,t);
   var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.006,t+.6);lfo.connect(lg);lg.connect(o.frequency);lfo.start(t);lfo.stop(t+3);
   var hg=ctx.createGain();hg.gain.value=h[2];o.connect(hg);hg.connect(g);o.start(t);o.stop(t+3)})}
 function mo(t){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(620,t);o.frequency.exponentialRampToValueAtTime(380,t+.07);env(g,t,.002,.32,.12);o.connect(g);out(g);o.start(t);o.stop(t+.2)}
 function chuong(t,base,v){[[.5,1],[1,.7],[1.19,.45],[1.56,.35],[2,.25],[2.51,.15],[3.2,.08]].forEach(function(p){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=base*p[0];env(g,t,.01,v*p[1],p[0]<1.1?9:5/p[0]);o.connect(g);out(g);o.start(t);o.stop(t+10)})}
 function drone(fa){var g=ctx.createGain();g.gain.value=0;g.gain.linearRampToValueAtTime(fa==='cg'?0:.11,ctx.currentTime+4);g.connect(master);
  var os=[65.41,98,130.81].map(function(f,i){var o=ctx.createOscillator();o.type='sine';o.frequency.value=f*(1+(i-1)*.0015);var og=ctx.createGain();og.gain.value=[1,.6,.25][i];o.connect(og);og.connect(g);o.start();return o});
  var l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=.08;lg.gain.value=.04;l.connect(lg);lg.connect(g.gain);l.start();
  return {g:g,stop:function(t){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+2);os.concat([l]).forEach(function(o){o.stop(t+2.2)})}}}
 var PENTA=[60,62,65,67,69,72,74,77];
 function phatStep(t){ // một ô nhịp ~ 1.5 giây
  st.n=(st.n||0)+1;
  if(Math.random()<.62){st.i=Math.max(0,Math.min(PENTA.length-1,(st.i==null?3:st.i)+[-2,-1,-1,1,1,2,0][Math.floor(Math.random()*7)]));tranh(t+Math.random()*.2,PENTA[st.i],.17);
   if(Math.random()<.25)tranh(t+.75,PENTA[Math.max(0,st.i-2)],.1)}
  if(st.n%12===4){for(var k=0;k<4;k++)mo(t+k*.8)}
  if(st.n%16===1)chuong(t,196,.22);
  return 1.5}
 /* --- Công giáo: đàn organ, hợp xướng "a", chuông nhà thờ, tiếng celesta --- */
 var CH=[[50,62,66,69],[47,62,66,71],[43,59,62,67],[45,61,64,69],[50,62,66,69],[43,59,62,67],[45,57,64,69],[50,62,66,69]];
 function organ(t,m,dur,v){var g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+1.4);g.gain.setValueAtTime(v,t+dur-.4);g.gain.linearRampToValueAtTime(0,t+dur+1.6);
  var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800;lp.connect(g);out(g);
  [[1,.6],[2,.28],[3,.14],[4,.08],[6,.04]].forEach(function(h){var o=ctx.createOscillator();o.type='sine';o.frequency.value=hz(m)*h[0];var hg=ctx.createGain();hg.gain.value=h[1];o.connect(hg);hg.connect(lp);o.start(t);o.stop(t+dur+2)})}
 function choir(t,m,dur,v){var g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+2);g.gain.setValueAtTime(v,t+dur-.5);g.gain.linearRampToValueAtTime(0,t+dur+1.8);out(g);
  [-7,0,6].forEach(function(dt){var o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);o.detune.value=dt;
   [[700,.9],[1150,.5],[2600,.15]].forEach(function(fm){var bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fm[0];bp.Q.value=9;var fg=ctx.createGain();fg.gain.value=fm[1]*.33;o.connect(bp);bp.connect(fg);fg.connect(g)});o.start(t);o.stop(t+dur+2.2)})}
 function celesta(t,m,v){var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o2.type='sine';o.frequency.value=hz(m);o2.frequency.value=hz(m)*4;var g2=ctx.createGain();g2.gain.value=.15;env(g,t,.004,v,1.8);o.connect(g);o2.connect(g2);g2.connect(g);out(g);o.start(t);o2.start(t);o.stop(t+2);o2.stop(t+2)}
 function cgStep(t){var c=CH[(st.c=(st.c==null?-1:st.c)+1)%CH.length],dur=7.5;
  organ(t,c[0]-12,dur,.08);c.forEach(function(m,i){organ(t,m,dur,i?.045:.07)});choir(t,c[3]+12,dur,.05);
  for(var k=0;k<6;k++)if(Math.random()<.5)celesta(t+1+k*1.05,c[1+Math.floor(Math.random()*3)]+24,.06);
  if(st.c%4===0)chuong(t+.2,293.66,.12);
  return dur}
 function loop(){if(!ctx||!cur)return;var now=ctx.currentTime;while(nextT<now+2){nextT+=cur==='cg'?cgStep(nextT):phatStep(nextT)}}
 function play(fa){mk();if(!ctx)return;if(ctx.state==='suspended')ctx.resume();var t=ctx.currentTime;
  if(cur===fa&&timer)return;if(st.d){st.d.stop(t)}st={};cur=fa;nextT=t+.3;st.d=drone(fa);
  master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(on?VOL*MV:0,t+3);
  clearInterval(timer);timer=setInterval(loop,400);loop()}
 function sync(){[].forEach.call(document.querySelectorAll('[data-music]'),function(b){b.setAttribute('aria-pressed',on?'true':'false');b.title=on?'Tắt nhạc nền':'Bật nhạc nền'})}
 function setOn(v){on=v;try{localStorage.setItem(KEY,v?'on':'off')}catch(e){}sync();
  if(!v){if(ctx){var t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(0,t+.8);setTimeout(function(){if(!on){clearInterval(timer);timer=null;ctx.suspend()}},900)}}
  else play(cur||(window.ssFaith==='cg'?'cg':'phat'))}
 window.ssMusic={start:function(fa){if(on)play(fa==='cg'?'cg':'phat')},faith:function(fa){if(timer&&on)play(fa)},toggle:function(){setOn(!on)},
  on:function(){return on},set:function(v){if(!!v!==on)setOn(!!v)},vol:function(v){if(v==null)return MV;MV=Math.max(0,Math.min(1,+v));try{localStorage.setItem('ss-music-vol',String(MV))}catch(e){}
   if(ctx&&on&&timer){var t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setTargetAtTime(VOL*MV,t,.15)}}};
 document.addEventListener('click',function(e){if(e.target.closest('[data-music]')){e.preventDefault();e.stopPropagation();setOn(!on)}},true);
 // khách quay lại (không qua cổng): trình duyệt chỉ cho phát nhạc sau lần chạm đầu tiên
 function first(){removeEventListener('pointerdown',first,true);if(on&&!timer&&!(window.ssGate&&ssGate.pending))play(window.ssFaith==='cg'?'cg':'phat')}
 addEventListener('pointerdown',first,true);
 addEventListener('DOMContentLoaded',function(){sync();var f=document.querySelector('.ss-mus-fab');f&&(f.hidden=false)});sync();
})();

/* ===== Người trực tuyến trong đại sảnh (giống web game: ai đang mở trang đều hiện trên sàn) ===== */
(function(){
 var floor=document.getElementById('hallFloor'),hall=document.getElementById('hall');if(!floor)return;
 var COL=['#8B3A1E','#2F5D8A','#4E7A3A','#7A4A8C','#B0701E','#2E7B78','#A8434F','#5A5048'];
 function myName(){try{var m=JSON.parse(localStorage.getItem('ss-me')||'null');var n=m&&m.user&&m.user.name;if(n)return String(n).trim().slice(0,22)}catch(e){}return 'Khách viếng'}
 var me={x:.3+Math.random()*.4,y:.35+Math.random()*.5,c:Math.floor(Math.random()*COL.length),e:null},room=null,els={},eTimer=null;
 function faith(){return window.ssFaith==='cg'?'cg':'phat'}
 function svg(col,fa){var robe=fa==='cg'?'#F4F1EA':col,trim=fa==='cg'?col:'#E9C46A';
  return '<svg class="body" viewBox="0 0 48 62" aria-hidden="true"><path d="M12 58 L15 30 Q24 24 33 30 L36 58 Z" fill="'+robe+'"/><path d="M15 30 Q24 24 33 30 L31 36 Q24 32 17 36Z" fill="'+trim+'" opacity=".9"/><path d="M22 31 L24 58 L26 31Z" fill="'+trim+'" opacity=".55"/><circle cx="24" cy="18" r="11" fill="#F2CFA8"/><path d="M13 17 Q14 6 24 6 Q34 6 35 17 Q30 11 24 12 Q18 11 13 17Z" fill="#2B1D14"/><circle cx="20" cy="19" r="1.4" fill="#2B1D14"/><circle cx="28" cy="19" r="1.4" fill="#2B1D14"/><path d="M21 24 Q24 26 27 24" stroke="#B5765A" stroke-width="1.2" fill="none" stroke-linecap="round"/><circle cx="17.5" cy="22.5" r="2" fill="#F0A894" opacity=".55"/><circle cx="30.5" cy="22.5" r="2" fill="#F0A894" opacity=".55"/><ellipse cx="24" cy="40" rx="4" ry="3" fill="#F2CFA8"/></svg>'}
 var EMO={pray:'🙏',heart:'❤️',flower:'🌸',light:'✨'};
 function place(el,x,y,instant){var r=floor.getBoundingClientRect();if(!r.width){el._p=null;return}var px=x*r.width,py=y*r.height,old=el._p;
  var d=old?Math.hypot(px-old[0],py-old[1]):0;el.style.setProperty('--dur',instant||!old?'0s':Math.max(.25,d/140)+'s');
  if(old&&px!==old[0])el.classList.toggle('left',px<old[0]);
  if(old&&d>2&&!instant){el.classList.add('walk');clearTimeout(el._w);el._w=setTimeout(function(){el.classList.remove('walk')},Math.max(.25,d/140)*1000)}
  el._p=[px,py];el.style.transform='translate('+px+'px,'+py+'px)';el.style.zIndex=10+Math.round(y*100);el.querySelector('.av-in').style.setProperty('--sc',(.82+.3*y).toFixed(3))}
 function upsert(id,p,isMe){var el=els[id];
  if(!el){el=document.createElement('div');el.className='av arrive'+(isMe?' me':'');el.innerHTML='<div class="av-in"><span class="shadow"></span><span class="tag"></span>'+svg(COL[(p.c|0)%COL.length],faith())+'</div>';floor.appendChild(el);els[id]=el;setTimeout(function(){el.classList.remove('arrive')},900);el._c=p.c;el._f=faith()}
  if(el._c!==p.c||el._f!==faith()){el.querySelector('svg.body').outerHTML=svg(COL[(p.c|0)%COL.length],faith());el._c=p.c;el._f=faith()}
  el.querySelector('.tag').textContent=isMe?'Bạn':(typeof p.n==='string'&&p.n.trim()?p.n.trim().slice(0,22):'Khách viếng');
  var b=el.querySelector('.bub'),e=Object.prototype.hasOwnProperty.call(EMO,p.e)?EMO[p.e]:'';
  if(e&&(!b||b.textContent!==e)){b&&b.remove();b=document.createElement('span');b.className='bub';b.textContent=e;el.querySelector('.av-in').appendChild(b)}else if(!e&&b)b.remove();
  var x=+p.x,y=+p.y;if(isFinite(x)&&isFinite(y))place(el,Math.max(0,Math.min(1,x)),Math.max(0,Math.min(1,y)));return el}
 function render(){if(hall.classList.contains('world-on'))return;var seen={};upsert('me',me,true);seen.me=1;var n=1,here=1;
  if(room){room.peers().forEach(function(p){if(p.kind!=='viewer'||(p.isMe&&p.sameTab))return;var pr=p.presence||{};n++;
   if(pr.f!==faith()||pr.h!==1)return;here++;upsert(p.peer,pr,false);seen[p.peer]=1})}
  Object.keys(els).forEach(function(k){if(!seen[k]){els[k].remove();delete els[k]}});
  var o=document.getElementById('hallOnline');if(o){o.hidden=n<2;o.querySelector('b').textContent=n;o.title=here+' người đang ở '+(faith()==='cg'?'Thánh đường':'Chính điện')+' · '+n+' người đang trực tuyến'}}
 function send(){if(room&&!hall.classList.contains('world-on'))room.presence({x:+me.x.toFixed(3),y:+me.y.toFixed(3),c:me.c,e:me.e,f:faith(),h:hall.hidden?0:1,n:myName()}).catch(function(){})}
 floor.addEventListener('click',function(ev){var r=floor.getBoundingClientRect();me.x=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));me.y=Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height));
  var pg=document.createElement('i');pg.className='floor-ping';pg.style.left=(ev.clientX-r.left)+'px';pg.style.top=(ev.clientY-r.top)+'px';floor.appendChild(pg);setTimeout(function(){pg.remove()},750);render();send()});
 hall.addEventListener('click',function(ev){var b=ev.target.closest('[data-emo]');if(!b)return;me.e=b.dataset.emo;render();send();clearTimeout(eTimer);eTimer=setTimeout(function(){me.e=null;render();send()},4500)});
 window.ssHallFaith=function(){Object.keys(els).forEach(function(k){els[k].remove();delete els[k]});render();send()};
 new MutationObserver(function(){if(!hall.hidden)setTimeout(render,50);send()}).observe(hall,{attributes:true,attributeFilter:['hidden']});
 addEventListener('resize',function(){Object.keys(els).forEach(function(k){var el=els[k];el._p=null});render()});
 render();
 var vao=window.claude&&claude.use?claude.use('room'):window.ssPhong&&ssPhong();   // claude.ai: phòng của bản thử; trang thật: máy chủ Song Song (js/02-09)
 if(vao)vao.then(function(r){if(!r)return;room=r;r.onPeers(function(){render()},function(){room=null;render()});send()}).catch(function(){});
})();
