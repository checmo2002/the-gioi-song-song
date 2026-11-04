/* Gõ mõ: mỗi tiếng mõ đúng nhịp là 1 công đức; đủ 108 tiếng (một tràng) thì hồi hướng cho người thân.
   Cấp bậc là 9 phẩm sen; giữ nhịp đều được nhân đôi; quá nhanh không tính. */
(function(){
 var KEY='ss-mo',CAP=1080,MIN=330;
 var LV=[[0,'Hạt sen'],[108,'Mầm sen'],[324,'Lá sen'],[756,'Nụ sen'],[1404,'Sen hé'],[2268,'Sen nở'],[3456,'Sen ngát'],[5076,'Đài sen'],[7236,'Liên hoa viên mãn']];
 var SK={go:['#C98A4E','#7A4320','Gỗ mít',0],hong:['#A8553A','#4E1F12','Gỗ hồng',2],son:['#C23B22','#6E160C','Sơn son',4],vang:['#E8BE5A','#8C5E14','Thếp vàng',7]};
 // shortcut: lưu trong trình duyệt của từng người, nên đổi máy là mất; chuyển lên tài khoản khi web có máy chủ
 function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
 var st=load();st.tot=st.tot||0;st.today=st.today||0;st.bead=st.bead||0;st.trang=st.trang||0;st.streak=st.streak||0;st.hh=st.hh||{};st.skin=st.skin||'go';
 function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
 function day(o){var d=new Date(Date.now()-(o||0)*864e5);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function roll(){if(st.day!==day()){st.today=0}}
 function lvOf(t){for(var i=LV.length-1;i>=0;i--)if(t>=LV[i][0])return i;return 0}
 // 9 icon phẩm sen, mỗi phẩm một hình
 function pt(a,len,w,f,st,cx,cy){cx=cx||32;cy=cy||46;return '<path d="M'+cx+' '+cy+' C'+(cx-w)+' '+(cy-len*.45)+' '+(cx-w*.55)+' '+(cy-len)+' '+cx+' '+(cy-len)+' C'+(cx+w*.55)+' '+(cy-len)+' '+(cx+w)+' '+(cy-len*.45)+' '+cx+' '+cy+'Z" transform="rotate('+a+' '+cx+' '+cy+')" fill="'+f+'" stroke="'+(st||'#FFE3EC')+'" stroke-width="1"/>'}
 var WAT='<path d="M4 54q7-4 14 0t14 0 14 0 14 0" fill="none" stroke="#7FB8D6" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>',
  STEM='<path d="M32 58C31 52 33 48 32 44" stroke="#5C8A4A" stroke-width="3" fill="none" stroke-linecap="round"/>',
  LEAF='<path d="M33 54c6-6 16-6 22-1c-6 5-16 6-22 1z" fill="#6FA35A" stroke="#A8D48E" stroke-width="1"/>',
  PK='#F3A6BE',PD='#E07FA0',GD='#FFD27A';
 function fl(n){var h='';var A=[-64,64,-40,40,-18,18,0].slice(7-n);A.forEach(function(a,i){h+=pt(a,Math.abs(a)>50?16:20,8,Math.abs(a)>30?PD:PK)});return h}
 var ICO=[
  function(){return WAT+'<ellipse cx="32" cy="38" rx="11" ry="13" fill="#8A5A30" stroke="#C9A86A" stroke-width="1.4"/><ellipse cx="28" cy="33" rx="3" ry="5" fill="#fff" opacity=".3"/><path d="M29 26q3-3 6 0" stroke="#5C3A1E" stroke-width="2" fill="none"/>'},
  function(){return WAT+'<path d="M32 58c-1-8 0-16 4-24" stroke="#6FA35A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 34c-2-6 3-12 10-11c0 7-5 11-10 11z" fill="#8CC56E" stroke="#C7E8B0" stroke-width="1"/><path d="M34 40c-6-1-10-6-8-11c6 1 9 6 8 11z" fill="#6FA35A"/>'},
  function(){return WAT+'<ellipse cx="32" cy="44" rx="24" ry="10" fill="#5C8A4A" stroke="#A8D48E" stroke-width="1.4"/><path d="M32 44L52 40" stroke="#22140C" stroke-width="3"/><g stroke="#A8D48E" stroke-width="1" opacity=".8"><path d="M32 44L14 40M32 44L20 51M32 44L44 52M32 44L32 35M32 44L46 36"/></g><circle cx="22" cy="40" r="2" fill="#BFE6FF" opacity=".9"/>'},
  function(){return WAT+STEM+LEAF+pt(0,26,9,PK,'#FFE3EC',32,46)+'<path d="M32 22v20" stroke="#FFE3EC" stroke-width="1" opacity=".7"/>'},
  function(){return WAT+STEM+LEAF+pt(-26,18,8,PD,0,32,46)+pt(26,18,8,PD,0,32,46)+pt(0,24,9,PK,0,32,46)},
  function(){return WAT+STEM+LEAF+fl(7)+'<circle cx="32" cy="40" r="4.5" fill="'+GD+'"/>'},
  function(){return WAT+STEM+LEAF+fl(7)+'<circle cx="32" cy="40" r="4.5" fill="'+GD+'"/><g fill="none" stroke="#FFE9A8" stroke-width="1.6" stroke-linecap="round"><path d="M14 22c-4-4 2-8 0-12"/><path d="M50 20c4-4-2-8 0-12"/><path d="M32 12c-3-3 2-6 0-9"/></g><g fill="#FFE9A8"><circle cx="22" cy="14" r="1.4"/><circle cx="44" cy="12" r="1.4"/></g>'},
  function(){var h='<ellipse cx="32" cy="52" rx="26" ry="6" fill="#B23A2A"/><ellipse cx="32" cy="50" rx="24" ry="5" fill="none" stroke="'+GD+'" stroke-width="1.4"/>';[-80,80,-60,60,-40,40,-20,20,0].forEach(function(a){h+=pt(a,22,9,Math.abs(a)>50?PD:PK,0,32,48)});return h+'<ellipse cx="32" cy="34" rx="11" ry="4" fill="'+GD+'" stroke="#C98A1E"/><g fill="#C98A1E"><circle cx="28" cy="34" r="1"/><circle cx="32" cy="33" r="1"/><circle cx="36" cy="34" r="1"/></g>'},
  function(){var h='<circle cx="32" cy="32" r="29" fill="none" stroke="'+GD+'" stroke-width="1.6" opacity=".9"/><circle cx="32" cy="32" r="24" fill="rgba(255,210,122,.18)"/>';for(var i=0;i<12;i++)h+='<path d="M32 2v6" stroke="'+GD+'" stroke-width="2" stroke-linecap="round" transform="rotate('+i*30+' 32 32)"/>';
   [-64,64,-40,40,-18,18,0].forEach(function(a){h+=pt(a,20,8,Math.abs(a)>30?'#FFC94A':'#FFE08A','#FFF6D8',32,46)});return h+'<circle cx="32" cy="40" r="5" fill="#fff"/>'}];
 function lotus(n,big){return '<svg viewBox="0 0 64 64" aria-hidden="true" class="lv-ico lv'+n+'">'+ICO[n]()+'</svg>'}
 function moSvg(sk){var c=SK[sk]||SK.go;return '<svg viewBox="0 0 200 150" aria-hidden="true"><defs><radialGradient id="mog" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".25" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></radialGradient></defs>'+
  '<ellipse cx="100" cy="138" rx="92" ry="11" fill="#000" opacity=".35"/><path d="M16 132 Q100 112 184 132 Q100 148 16 132Z" fill="#B23A2A"/><path d="M16 132 Q100 112 184 132" fill="none" stroke="#E8BE5A" stroke-width="2"/>'+
  '<path d="M26 96 C24 52 62 22 100 22 C142 22 176 52 174 96 C172 124 140 134 100 134 C60 134 28 124 26 96Z" fill="url(#mog)" stroke="'+c[1]+'" stroke-width="2"/>'+
  '<path d="M44 100 C76 114 124 114 156 100" fill="none" stroke="#1E0E06" stroke-width="8" stroke-linecap="round"/><circle cx="42" cy="99" r="7" fill="#1E0E06"/><circle cx="158" cy="99" r="7" fill="#1E0E06"/>'+
  '<g fill="none" stroke="'+c[1]+'" stroke-width="2.2" opacity=".75"><path d="M70 50 q10 -10 20 0 M90 50 q10 -10 20 0 M110 50 q10 -10 20 0 M80 64 q10 -10 20 0 M100 64 q10 -10 20 0"/><path d="M40 78 c-4 -14 12 -18 14 -6 c1 6 -6 8 -8 3"/><path d="M160 78 c4 -14 -12 -18 -14 -6 c-1 6 6 8 8 3"/></g>'+
  '<path d="M84 24 C84 6 116 6 116 24" fill="none" stroke="'+c[1]+'" stroke-width="7" stroke-linecap="round"/></svg>'}
 var DUI='<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="44" width="72" height="7" rx="3.5" transform="rotate(38 58 48)" fill="#8A5A30"/><circle cx="24" cy="24" r="15" fill="#E9D7B0" stroke="#A8661A" stroke-width="2"/><path d="M14 20 q10 -8 20 0" stroke="#C9A86A" stroke-width="2" fill="none"/></svg>';
 var box=document.createElement('div');box.className='mo';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Gõ mõ');
 box.innerHTML='<div class="mo-card"><button class="mo-x" type="button" aria-label="Đóng">×</button>'+
  '<button type="button" class="mo-lv" aria-label="Xem lộ trình phẩm sen"><span class="mo-lo"></span><div><b class="mo-ln"></b><small class="mo-ls"></small></div><span class="mo-lv-more">Lộ trình ›</span></button><div class="mo-bar"><i></i></div><div class="mo-num"><span class="mo-n1"></span><span class="mo-n2"></span></div>'+
  '<div class="mo-stage"><svg class="mo-ring" viewBox="0 0 240 240"><circle cx="120" cy="120" r="112" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="5" stroke-dasharray="2.5 4.02"/><circle class="mo-rp" cx="120" cy="120" r="112" fill="none" stroke="#FFD27A" stroke-width="5" stroke-dasharray="0 999" stroke-linecap="round"/></svg>'+
  '<button class="mo-hit" type="button" aria-label="Gõ mõ (phím cách)"><div class="mo-body"></div></button><div class="mo-dui">'+DUI+'</div></div>'+
  '<div class="mo-tip" aria-live="polite"></div>'+
  '<div class="mo-st"><div><b class="mo-bd">0</b>Tràng hạt /108</div><div><b class="mo-td">0</b>Hôm nay</div><div><b class="mo-sk">0</b>Ngày liên tiếp</div></div>'+
  '<div class="mo-skin"></div><div class="mo-path" hidden></div><div class="mo-hh" hidden><p>Tròn một tràng 108 tiếng mõ. Hồi hướng công đức cho:</p><div></div></div></div>';
 document.body.appendChild(box);
 var q=function(c){return box.querySelector(c)},body=q('.mo-body'),dui=q('.mo-dui'),stage=q('.mo-stage'),tip=q('.mo-tip'),hh=q('.mo-hh');
 var C=2*Math.PI*112;
 function skins(){var l=lvOf(st.tot),h='';for(var k in SK){var c=SK[k],ok=l>=c[3];h+='<button type="button" data-sk="'+k+'" title="'+c[2]+(ok?'':' · mở ở cấp '+LV[c[3]][1])+'" aria-label="'+c[2]+'" aria-pressed="'+(st.skin===k)+'" style="background:radial-gradient(circle at 35% 30%,'+c[0]+','+c[1]+')"'+(ok?'':' disabled')+'></button>'}q('.mo-skin').innerHTML=h}
 function draw(){roll();var l=lvOf(st.tot),a=LV[l][0],b=LV[l+1]?LV[l+1][0]:a;q('.mo-lo').innerHTML=lotus(l);q('.mo-ln').textContent=LV[l][1];
  q('.mo-ls').textContent='Phẩm '+(l+1)+'/9 · Đài sen công đức';q('.mo-bar i').style.width=(b>a?(st.tot-a)/(b-a)*100:100)+'%';
  q('.mo-n1').textContent=st.tot.toLocaleString('vi-VN')+' công đức';q('.mo-n2').textContent=LV[l+1]?'Còn '+(b-st.tot).toLocaleString('vi-VN')+' tới '+LV[l+1][1]:'Viên mãn';
  q('.mo-rp').setAttribute('stroke-dasharray',(st.bead/108*C)+' 999');q('.mo-bd').textContent=st.bead;q('.mo-td').textContent=st.today;q('.mo-sk').textContent=st.streak;body.innerHTML=moSvg(st.skin);skins()}
 // tiếng mõ gỗ: vài mode cộng hưởng của thân rỗng (tổng hợp modal) + tiếng dùi chạm + tiếng "bụp" trầm
 var ac,F0={go:470,hong:440,son:455,vang:500};
 function tock(){var vol=.8;try{if(localStorage.getItem('ss-sound')==='0')return;vol=+(localStorage.getItem('ss-vol')||.8)}catch(e){}
  try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();
   var t=ac.currentTime+.005,out=ac.createGain(),f0=(F0[st.skin]||470)*(1+(Math.random()-.5)*.03);out.gain.value=vol;
   var cmp=ac.createDynamicsCompressor();out.connect(cmp).connect(ac.destination);
   [[1,1,.16],[1.52,.42,.085],[2.48,.22,.05],[3.9,.1,.03]].forEach(function(m){var o=ac.createOscillator(),g=ac.createGain();o.type='sine';
    o.frequency.setValueAtTime(f0*m[0]*1.04,t);o.frequency.exponentialRampToValueAtTime(f0*m[0],t+.03);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.55*m[1],t+.0015);g.gain.exponentialRampToValueAtTime(.0001,t+m[2]*4);
    o.connect(g).connect(out);o.start(t);o.stop(t+m[2]*4+.02)});
   var n=ac.createBuffer(1,Math.floor(ac.sampleRate*.012),ac.sampleRate),d=n.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
   var src=ac.createBufferSource(),bp=ac.createBiquadFilter(),gn=ac.createGain();src.buffer=n;bp.type='bandpass';bp.frequency.value=f0*3.2;bp.Q.value=1.4;gn.gain.value=.5;src.connect(bp).connect(gn).connect(out);src.start(t);
   var lo=ac.createOscillator(),lg=ac.createGain();lo.frequency.setValueAtTime(170,t);lo.frequency.exponentialRampToValueAtTime(90,t+.06);lg.gain.setValueAtTime(.3,t);lg.gain.exponentialRampToValueAtTime(.0001,t+.08);lo.connect(lg).connect(out);lo.start(t);lo.stop(t+.1)}catch(e){}}
 function fx(txt){var w=document.createElement('i');w.className='mo-wave';stage.appendChild(w);setTimeout(function(){w.remove()},700);if(txt){var p=document.createElement('span');p.className='mo-plus';p.textContent=txt;p.style.marginLeft=(Math.random()*40-20)+'px';stage.appendChild(p);setTimeout(function(){p.remove()},900)}}
 var last=0,iv=0,steady=0,tipT=0;
 function say(t,cls){tip.textContent=t;tip.className='mo-tip'+(cls?' '+cls:'')}
 function knock(){var now=performance.now();body.classList.remove('hit');void body.offsetWidth;body.classList.add('hit');dui.classList.add('hit');setTimeout(function(){dui.classList.remove('hit')},90);tock();
  if(now-last<MIN){fx();if(now-tipT>1500){say('Chậm lại một chút, giữ nhịp đều');tipT=now}return}
  var d=now-last;last=now;if(iv&&d<2500&&Math.abs(d-iv)/iv<.25)steady++;else steady=0;iv=d<2500?d:0;
  roll();if(st.day!==day()){st.streak=st.day===day(1)?st.streak+1:1;st.day=day()}
  var g=steady>=12?2:1,lv0=lvOf(st.tot);
  if(st.today>=CAP){g=0;say('Hôm nay đã viên mãn. Tiếng mõ vẫn ngân, mai lại tích tiếp')}else if(g===2)say('Nhất tâm · công đức ×2','nt');else if(now-tipT>2500)say('');
  st.tot+=g;st.today+=g;st.bead++;fx(g?'+'+g:'');
  if(st.bead>=108){st.bead=0;st.trang++;var bn=Math.min(st.streak,7)*6;if(st.today<CAP){st.tot+=bn;st.today+=bn}say('Tròn một tràng'+(bn?' · chuyên cần +'+bn:''),'nt');window.ssBell&&ssBell('phat');showHH()}
  save();draw();if(lvOf(st.tot)>lv0)levelUp(lvOf(st.tot))}
 var NOTE=['','Mầm xanh đã nhú khỏi bùn','Lá sen xoè rộng che mát','Nụ sen hồng vươn lên','Cánh sen bắt đầu hé mở','Hoa sen nở trọn','Hương sen ngát toả xa','Đài sen vững vàng','Liên hoa viên mãn, công đức tròn đầy'];
 function chime(){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(localStorage.getItem('ss-sound')==='0')return;var t=ac.currentTime;[523,659,784,1047].forEach(function(f,i){var o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t+i*.12);g.gain.exponentialRampToValueAtTime(.22,t+i*.12+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.12+1.2);o.connect(g).connect(ac.destination);o.start(t+i*.12);o.stop(t+i*.12+1.3)})}catch(e){}}
 function levelUp(l){var u=document.createElement('div');u.className='lvu';u.setAttribute('role','alertdialog');u.setAttribute('aria-label','Chúc mừng lên phẩm '+LV[l][1]);
  var rw=[];for(var k in SK)if(SK[k][3]===l)rw.push('Mở khoá mõ '+SK[k][2]);
  var h='<div class="lvu-rays"></div><div class="lvu-glow"></div>';for(var i=0;i<44;i++){var pet=i%2===0;h+='<i class="lvu-p'+(pet?' pet':'')+'" style="--x:'+(Math.random()*100)+'vw;--d:'+(Math.random()*1.4)+'s;--t:'+(2.6+Math.random()*2)+'s;--r:'+(Math.random()*720-360)+'deg;--dx:'+(Math.random()*120-60)+'px;--s:'+(pet?10+Math.random()*10:4+Math.random()*4)+'px"></i>'}
  for(i=0;i<16;i++)h+='<i class="lvu-sp" style="--a:'+(i*22.5)+'deg;--dl:'+(.35+Math.random()*.2)+'s"></i>';
  h+='<div class="lvu-box"><small>Chúc mừng bạn!</small><div class="lvu-ico">'+lotus(l)+'</div><span class="lvu-lv">Lên phẩm '+(l+1)+' / 9</span><b>'+LV[l][1]+'</b><p>'+NOTE[l]+'</p>'+(rw.length?'<em>'+ssHudSvgSafe('sao')+rw.join(' · ')+'</em>':'')+'<button type="button">Tiếp tục tích đức</button></div>';
  u.innerHTML=h;document.body.appendChild(u);chime();setTimeout(function(){window.ssBell&&ssBell('phat')},600);
  var bt=u.querySelector('button');bt.focus();function x(){if(!u.parentNode)return;u.classList.add('out');setTimeout(function(){u.remove()},450)}bt.addEventListener('click',x);u.addEventListener('click',function(e){if(e.target===u)x()});setTimeout(x,7000)}
 function ssHudSvgSafe(k){return '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>'}
 // lộ trình 9 phẩm
 function path(){var l=lvOf(st.tot),h='<div class="mo-path-h"><b>Lộ trình 9 phẩm sen</b><button type="button" class="mo-path-x" aria-label="Đóng">×</button></div><ol>';
  LV.forEach(function(v,i){var sk='';for(var k in SK)if(SK[k][3]===i&&i)sk=' · mõ '+SK[k][2];h+='<li class="'+(i<l?'ok':i===l?'cur':'lock')+'">'+lotus(i)+'<div><b>'+v[1]+'</b><small>'+(i<=l?(i===l?'Phẩm hiện tại':'Đã đạt'):v[0].toLocaleString('vi-VN')+' công đức')+sk+'</small></div></li>'});
  var e=q('.mo-path');e.innerHTML=h+'</ol>';e.hidden=false}
 function showHH(){var L=(window.ssPerson?ssPerson.all():[]).slice(0,6),cur=window.ssPerson&&ssPerson.get(),h='';
  if(cur)L=[cur].concat(L.filter(function(p){return p.id!==cur.id})).slice(0,6);
  L.forEach(function(p){h+='<button type="button" data-hh="'+p.id+'">'+p.name+'</button>'});h+='<button type="button" data-hh="ls">Anh linh các liệt sĩ</button><button type="button" data-hh="cs">Tất cả chúng sinh</button>';
  hh.querySelector('div').innerHTML=h;hh.hidden=false}
 hh.addEventListener('click',function(e){var b=e.target.closest('[data-hh]');if(!b)return;st.hh[b.dataset.hh]=(st.hh[b.dataset.hh]||0)+1;save();hh.hidden=true;
  say('Đã hồi hướng cho '+b.textContent+' · '+st.hh[b.dataset.hh]+' tràng','nt');window.toast&&toast('Hồi hướng công đức cho '+b.textContent)});
 q('.mo-hit').addEventListener('pointerdown',function(e){e.preventDefault();knock()});
 q('.mo-hit').addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)knock()}});
 q('.mo-skin').addEventListener('click',function(e){var b=e.target.closest('[data-sk]');if(!b||b.disabled)return;st.skin=b.dataset.sk;save();draw()});
 q('.mo-lv').addEventListener('click',path);q('.mo-path').addEventListener('click',function(e){if(e.target.closest('.mo-path-x'))q('.mo-path').hidden=true});
 function close(){box.hidden=true;q('.mo-path').hidden=true}
 q('.mo-x').addEventListener('click',close);box.addEventListener('click',function(e){if(e.target===box)close()});
 document.addEventListener('keydown',function(e){if(!box.hidden&&e.key==='Escape')close()});
 window.ssMo={open:function(){draw();say('Chạm vào mõ, giữ nhịp đều để tâm an');hh.hidden=true;box.hidden=false;setTimeout(function(){q('.mo-hit').focus()},50)},close:close,state:function(){return st},icon:lotus,levelUp:levelUp,
  add:function(n){var l0=lvOf(st.tot);st.tot+=n;save();if(!box.hidden)draw();if(lvOf(st.tot)>l0)levelUp(lvOf(st.tot))}};
 function addBtn(){var bar=document.querySelector('.hall .w-bar');if(!bar||bar.querySelector('.mo-btn'))return;var b=document.createElement('button');b.type='button';b.className='mo-btn';b.dataset.w='gomo';b.title='Gõ mõ';b.setAttribute('aria-label','Gõ mõ');
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 15c0-5 3.6-8 8-8s8 3 8 8c0 2.5-3.6 3.5-8 3.5S4 17.5 4 15z"/><path d="M7 15.5c3 1.3 7 1.3 10 0"/><path d="M10 7.2c0-2 4-2 4 0"/><path d="M17 3l3.5 3.5"/></svg><span>Gõ mõ</span>';
  bar.appendChild(b)}
 // bắt ở window để chạy trước bộ xử lý [data-w] chung của thanh công cụ
 window.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.mo-btn')){e.stopPropagation();e.preventDefault();var hs=document.querySelector('.hall .wh[data-w="gomo"]');if(hs)hs.click();else ssMo.open()}},true);
 addBtn();setInterval(addBtn,1500);
})();
