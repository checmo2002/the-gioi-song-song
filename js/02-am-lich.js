/* Âm lịch Việt Nam (thuật toán Hồ Ngọc Đức, múi giờ +7) */
var LV=(function(){var PI=Math.PI,TZ=7,F=Math.floor;
function jdFromDate(d,m,y){var a=F((14-m)/12),yy=y+4800-a,mm=m+12*a-3,jd=d+F((153*mm+2)/5)+365*yy+F(yy/4)-F(yy/100)+F(yy/400)-32045;return jd<2299161?d+F((153*mm+2)/5)+365*yy+F(yy/4)-32083:jd}
function jdToDate(jd){var a,b,c;if(jd>2299160){a=jd+32044;b=F((4*a+3)/146097);c=a-F(b*146097/4)}else{b=0;c=jd+32082}var d=F((4*c+3)/1461),e=c-F(1461*d/4),m=F((5*e+2)/153);return[e-F((153*m+2)/5)+1,m+3-12*F(m/10),b*100+d-4800+F(m/10)]}
function newMoon(k){var T=k/1236.85,T2=T*T,T3=T2*T,dr=PI/180,J=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3;J+=0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);
 var M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3,Mp=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3,Fa=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3,s=Math.sin;
 var C=(0.1734-0.000393*T)*s(M*dr)+0.0021*s(2*dr*M)-0.4068*s(Mp*dr)+0.0161*s(dr*2*Mp)-0.0004*s(dr*3*Mp)+0.0104*s(dr*2*Fa)-0.0051*s(dr*(M+Mp))-0.0074*s(dr*(M-Mp))+0.0004*s(dr*(2*Fa+M))-0.0004*s(dr*(2*Fa-M))-0.0006*s(dr*(2*Fa+Mp))+0.0010*s(dr*(2*Fa-Mp))+0.0005*s(dr*(2*Mp+M));
 var dt=T<-11?0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3:-0.000278+0.000265*T+0.000262*T2;return J+C-dt}
function sunLong(jdn){var T=(jdn-2451545)/36525,T2=T*T,dr=PI/180,M=357.5291+35999.0503*T-0.0001559*T2-0.00000048*T*T2,L0=280.46645+36000.76983*T+0.0003032*T2,
 DL=(1.9146-0.004817*T-0.000014*T2)*Math.sin(dr*M)+(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.00029*Math.sin(dr*3*M),L=(L0+DL)*dr;return L-PI*2*F(L/(PI*2))}
function nmDay(k){return F(newMoon(k)+0.5+TZ/24)}
function sunSeg(jdn){return F(sunLong(jdn-0.5-TZ/24)/PI*6)}
function month11(y){var k=F((jdFromDate(31,12,y)-2415021)/29.530588853),nm=nmDay(k);return sunSeg(nm)>=9?nmDay(k-1):nm}
function leapOff(a11){var k=F((a11-2415021.076998695)/29.530588853+0.5),last,i=1,arc=sunSeg(nmDay(k+i));do{last=arc;i++;arc=sunSeg(nmDay(k+i))}while(arc!=last&&i<14);return i-1}
function toLunar(d,m,y){var dn=jdFromDate(d,m,y),k=F((dn-2415021.076998695)/29.530588853),ms=nmDay(k+1);if(ms>dn)ms=nmDay(k);
 var a11=month11(y),b11=a11,ly;if(a11>=ms){ly=y;a11=month11(y-1)}else{ly=y+1;b11=month11(y+1)}
 var ld=dn-ms+1,diff=F((ms-a11)/29),leap=0,lm=diff+11;if(b11-a11>365){var lo=leapOff(a11);if(diff>=lo){lm=diff+10;if(diff==lo)leap=1}}
 if(lm>12)lm-=12;if(lm>=11&&diff<4)ly-=1;return{d:ld,m:lm,y:ly,leap:leap,jd:dn}}window.ssToLunar=toLunar;
var CAN=['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'],CHI=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'],
 TK=['Xuân phân','Thanh minh','Cốc vũ','Lập hạ','Tiểu mãn','Mang chủng','Hạ chí','Tiểu thử','Đại thử','Lập thu','Xử thử','Bạch lộ','Thu phân','Hàn lộ','Sương giáng','Lập đông','Tiểu tuyết','Đại tuyết','Đông chí','Tiểu hàn','Đại hàn','Lập xuân','Vũ thủy','Kinh trập'],
 HD=['110100101100','001101001011','110011010010','101100110100','001011001101','010010110011'];
function canChiNgay(jd){return CAN[(jd+9)%10]+' '+CHI[(jd+1)%12]}
function canChiThang(m,y){return CAN[(y*12+m+3)%10]+' '+CHI[(m+1)%12]}
function canChiNam(y){return CAN[(y+6)%10]+' '+CHI[(y+8)%12]}
function tietKhi(jd){return TK[F(sunLong(jd+0.5-TZ/24)/PI*12)%24]}
function gioHD(jd){var c=(jd+1)%12,p=HD[c%6],out=[];for(var j=0;j<12;j++)if(p[j]=='1')out.push(CHI[j]+' ('+((j*2+23)%24)+'–'+((j*2+1)%24)+'h)');return out}
return{jdFromDate:jdFromDate,jdToDate:jdToDate,toLunar:toLunar,canChiNgay:canChiNgay,canChiThang:canChiThang,canChiNam:canChiNam,tietKhi:tietKhi,gioHD:gioHD}})();
/* Cổng hai lối + nhánh đức tin (Phật giáo – truyền thống / Công giáo). Lựa chọn lưu trên máy người dùng. */
(function(){var $=function(s){return document.querySelector(s)},gate=$('#gate');if(!gate)return;
 var K='ss-faith',f=null;try{f=localStorage.getItem(K)}catch(e){}
 var red=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function prefs(){try{return JSON.parse(localStorage.getItem('ss-auth')||'{}')}catch(e){return{}}}
 function authed(){try{var d=JSON.parse(localStorage.getItem('ss-me')||'null');if(!(d&&d.user))return false;if(localStorage.getItem('ss-out')==='1')return false;var p=prefs();return p.auto!==false||sessionStorage.getItem('ss-session')==='1'}catch(e){return false}}
 window.ssAuthAllowed=authed;window.ssAuthPrefs=prefs;
 window.ssAuthed=authed;window.ssGate={pending:!f};if(window.ssGate.pending)document.documentElement.classList.add('pre-enter');
 var T={phat:{eye:'Bàn thờ của bạn',title:'Một nén nhang, <span>một lời nhớ</span>',lede:'Thắp nhang, thỉnh chuông và giữ chuỗi ngày tưởng niệm cho người đã khuất, ngay trên điện thoại.',light:'Thắp nén nhang',bell:'Thỉnh chuông',to:'Dâng lên',last:'Mọi vong linh',unit:'nén',goal:'Hành trình 49 ngày',goalS:'Mỗi ngày thắp ít nhất một nén để đi tiếp. Lỡ một ngày, chuỗi bắt đầu lại.',note:'Số nén nhang được lưu trên máy của bạn.'},
  cg:{eye:'Góc cầu nguyện',title:'Một ngọn nến, <span>một lời nguyện</span>',lede:'Thắp nến, đọc kinh và giữ chuỗi ngày cầu nguyện cho linh hồn người đã khuất, ngay trên điện thoại.',light:'Thắp nến',bell:'Đọc kinh',to:'Cầu cho',last:'Các linh hồn',unit:'ngọn nến',goal:'Chuỗi 30 ngày cầu nguyện',goalS:'Mỗi ngày thắp ít nhất một ngọn nến để đi tiếp. Lỡ một ngày, chuỗi bắt đầu lại.',note:'Số ngọn nến được lưu trên máy của bạn.'}};
 function set(id,v,html){var el=document.getElementById(id);if(el)el[html?'innerHTML':'textContent']=v}
 function apply(fa){var cg=fa==='cg',t=T[cg?'cg':'phat'],b=document.body;b.classList.toggle('faith-cg',cg);b.classList.toggle('faith-phat',!cg);window.ssFaith=cg?'cg':'phat';
  set('hbEye',t.eye);set('hbTitle',t.title,1);set('hbLede',t.lede);set('hbLightT',t.light);set('hbBellT',t.bell);set('hbTo',t.to);set('hbLast',t.last);
  set('hbU1',t.unit+' hôm nay');set('hbU2',t.unit+' đã thắp');set('hbGoal',t.goal);set('hbGoalS',t.goalS);set('hbNoteT',t.note);
  var sw=document.getElementById('hbSwitch');if(sw)sw.textContent=cg?'Đổi sang lối Phật giáo':'Đổi sang lối Công giáo';
  window.ssHubRefresh&&ssHubRefresh();window.ssMusic&&ssMusic.faith(cg?'cg':'phat');window.ssHallFaith&&ssHallFaith();dispatchEvent(new Event('ss-faith'))}
 apply(f||'tt');
 // bụi sáng
 var dust=gate.querySelector('.g-dust');for(var i=0;i<26;i++){var d=document.createElement('i');d.style.left=(Math.random()*100)+'%';d.style.animationDuration=(9+Math.random()*10)+'s';d.style.animationDelay=(-Math.random()*18)+'s';dust.appendChild(d)}
 // âm thanh: chiêng chùa trầm / chuông nhà thờ
 var ac=null;function sound(kind){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();var n=ac.currentTime,o=ac.createGain();o.gain.value=.45;o.connect(ac.destination);
  var P=kind==='cg'?[[392,.5,5],[196,.6,6],[470,.3,3.5],[588,.25,3],[784,.18,2.4],[980,.1,1.6]]:[[98,.8,7],[196,.4,5],[247,.25,4],[392,.15,2.6],[523,.08,1.8]];
  P.forEach(function(p){var os=ac.createOscillator(),g=ac.createGain();os.frequency.value=p[0];g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(p[1],n+.02);g.gain.exponentialRampToValueAtTime(.0001,n+p[2]);os.connect(g);g.connect(o);os.start(n);os.stop(n+p[2])})}catch(e){}}
 window.ssBell=sound;
 function show(){gate.hidden=false;delete gate.dataset.hover;gate.classList.remove('go','go-phat','go-cg','zoom','flash','out','cg-light');[].forEach.call(gate.querySelectorAll('.g-door'),function(d){d.classList.remove('open')});document.documentElement.classList.add('gate-on')}
 function done(){document.documentElement.classList.remove('pre-enter');gate.hidden=true;document.documentElement.classList.remove('gate-on');window.ssGate.pending=false;dispatchEvent(new Event('ss-gate-done'))}
 function choose(fa,btn){try{localStorage.setItem(K,fa)}catch(e){}
  if(fa==='tt'||red||!btn){apply(fa);gate.classList.add('out');setTimeout(done,red?50:900);return}
  sound(fa);window.ssMusic&&ssMusic.start(fa);delete gate.dataset.hover;gate.classList.add('go','go-'+fa);gate.classList.toggle('cg-light',fa==='cg');btn.classList.add('open');
  var ds=gate.querySelector('.g-doors'),r=btn.querySelector('.g-frame').getBoundingClientRect(),dr=ds.getBoundingClientRect(),cx=r.left+r.width/2-dr.left,cy=r.top+r.height*.55-dr.top;
  gate.style.setProperty('--fx',(r.left+r.width/2)+'px');gate.style.setProperty('--fy',(r.top+r.height/2)+'px');
  setTimeout(function(){ds.style.transformOrigin=cx+'px '+cy+'px';gate.style.setProperty('--zoom','scale('+(innerWidth<641?4.2:3.4)+')');gate.classList.add('zoom')},900);
  setTimeout(function(){gate.classList.add('flash')},1900);
  setTimeout(function(){apply(fa);scrollTo(0,0);gate.classList.add('out')},2700);
  setTimeout(function(){ds.style.transformOrigin='';done()},3800)}
 [].forEach.call(gate.querySelectorAll('.g-door'),function(d){d.addEventListener('pointerenter',function(){if(!gate.classList.contains('go'))gate.dataset.hover=d.dataset.faith});d.addEventListener('pointerleave',function(){if(!gate.classList.contains('go'))delete gate.dataset.hover});d.addEventListener('focus',function(){gate.dataset.hover=d.dataset.faith})});
 gate.addEventListener('click',function(e){var b=e.target.closest('[data-faith]');if(b&&!gate.classList.contains('go'))choose(b.dataset.faith,b.classList.contains('g-door')?b:null)});
 addEventListener('keydown',function(e){if(e.key==='Escape'&&!gate.hidden&&!gate.classList.contains('go'))choose('tt')});
 document.addEventListener('click',function(e){if(e.target.closest('[data-open-gate]')){e.preventDefault();var l=$('#lvn');l&&l.open&&l.close();show()}});
 // chủ trang (người làm web) xem trên claude.ai thì bỏ qua bước đăng nhập; người khác vẫn phải đăng nhập
 var ownerP=null;function isOwner(){if(!ownerP)ownerP=(window.claude&&claude.use?claude.use('user').then(function(u){return u?u.isOwner():false}):Promise.resolve(false)).catch(function(){return false});return ownerP}
 function next(){if(true){next2();return}if(!authed()&&window.ssAuthOpen){isOwner().then(function(o){if(o){window.ssOwnerSkip=true;next2()}else{ssAuthOpen('signup',true);addEventListener('ss-auth-done',next2,{once:true})}});return}next2()}
 function next2(){var g=null;try{g=localStorage.getItem(K)}catch(e){}if(!g)setTimeout(show,400);else done()}
 if(window.ssGate.pending){var tries=0,iv=setInterval(function(){tries++;if(document.documentElement.classList.contains('loaded')||!document.getElementById('loader')||tries>60){clearInterval(iv);setTimeout(next,250)}},150)}
})();
/* Thanh tab: vòng sáng chạy theo lò xo, giãn ra khi chạy nhanh; kéo được; nút Thêm */
(function(){var bar=document.getElementById('mainNav');if(!bar||!bar.classList.contains('tabbar'))return;
 var L=bar.querySelector('.tb-light'),P=bar.querySelector('.tb-pool'),more=document.getElementById('tbMore')||document.createElement('b'),pop=document.getElementById('tbPop')||document.createElement('div'),
  tabs=[].slice.call(bar.querySelectorAll(':scope > .tb, .tb-more > .tb')),red=matchMedia('(prefers-reduced-motion:reduce)').matches,
  x=null,v=0,tx=0,raf=0,drag=false;
 function box(el){var r=el.getBoundingClientRect(),b=bar.getBoundingClientRect();return{x:r.left+r.width/2-b.left,y:r.top-b.top,w:r.width,h:r.height}}
 function cx(el){return box(el).x}
 var lw=90;
 function paint(){var st=Math.min(Math.abs(v)/2400,.18);L.style.transform='translateX('+(x-lw/2).toFixed(1)+'px) scaleX('+(1+st).toFixed(3)+')';P.style.transform='translateX('+x.toFixed(1)+'px) scaleX('+(1+st*2).toFixed(3)+')'}
 function step(){var dt=1/60,a=210*(tx-x)-25*v;v+=a*dt;x+=v*dt;paint();if(Math.abs(tx-x)>.3||Math.abs(v)>2)raf=requestAnimationFrame(step);else{x=tx;v=0;paint();raf=0}}
 function to(el){if(!el){bar.classList.remove('lit');tabs.forEach(function(t){t.classList.remove('on')});return}
  var t=el.closest('.tb-pop')?more:el;tabs.forEach(function(b){b.classList.toggle('on',b===t)});[].forEach.call(pop.querySelectorAll('a'),function(a){a.classList.toggle('on',a===el)});
  var bx=box(t);if(mq.matches){var ic=t.querySelector('.tb-ic').getBoundingClientRect(),bb=bar.getBoundingClientRect();bx={x:ic.left+ic.width/2-bb.left,y:ic.top-bb.top,w:ic.width,h:ic.height}}lw=bx.w;L.style.width=bx.w+'px';L.style.height=bx.h+'px';L.style.top=bx.y+'px';tx=bx.x;bar.classList.add('lit');if(x===null||red||drag){x=tx;v=0;paint();return}if(!raf)raf=requestAnimationFrame(step)}
 var nm=document.getElementById('navMenu');nm&&new MutationObserver(function(){if(mq.matches){var o=nm.getAttribute('aria-expanded')==='true';more.setAttribute('aria-expanded',o);more.querySelector('.tb-t').textContent=o?'Đóng':'Thêm'}}).observe(nm,{attributes:true,attributeFilter:['aria-expanded']});
 // điện thoại: đưa thanh xuống đáy màn hình (ra khỏi header vì header có hiệu ứng làm mờ nền)
 var home=bar.parentNode,anchor=bar.nextSibling,mq=matchMedia('(max-width:860px)');
 function place(){if(mq.matches){if(bar.parentNode!==document.body)document.body.appendChild(bar)}else if(bar.parentNode!==home)home.insertBefore(bar,anchor);x=null;var on=tabs.filter(function(t){return t.classList.contains('on')})[0];if(on)requestAnimationFrame(function(){to(on)})}
 mq.addEventListener('change',place);place();
 window.tbGo=to;function re(){var on=tabs.filter(function(t){return t.classList.contains('on')})[0];if(on){x=null;to(on)}}addEventListener('resize',re);addEventListener('load',re);document.fonts&&document.fonts.ready.then(re);setTimeout(re,1500);
 bar.addEventListener('click',function(e){var a=e.target.closest('a.tb');if(a){to(a)}});
 // kéo viên sáng: nhấn giữ mục đang sáng rồi kéo dọc thanh, thả ra thì về mục gần nhất
 var sx=0,moved=false,pid=null;
 bar.addEventListener('pointerdown',function(e){var t=e.target.closest('.tb.on');if(!t)return;pid=e.pointerId;sx=e.clientX;moved=false});
 bar.addEventListener('pointermove',function(e){if(pid!==e.pointerId)return;if(!moved&&Math.abs(e.clientX-sx)>6){moved=true;drag=true;L.classList.add('drag');try{bar.setPointerCapture(pid)}catch(_){}}
  if(!moved)return;var b=bar.getBoundingClientRect(),nx=Math.max(lw/2,Math.min(b.width-lw/2,e.clientX-b.left));v=(nx-x)*60;x=nx;paint()});
 function endDrag(e){if(pid!==e.pointerId)return;pid=null;if(!moved)return;drag=false;L.classList.remove('drag');var best=null,d=1e9;tabs.forEach(function(t){var dd=Math.abs(cx(t)-x);if(dd<d){d=dd;best=t}});
  bar.addEventListener('click',function stop(ev){ev.preventDefault();ev.stopPropagation();bar.removeEventListener('click',stop,true)},true);
  if(best)setTimeout(function(){best.click()},0)}
 bar.addEventListener('pointerup',endDrag);bar.addEventListener('pointercancel',endDrag);
 // Thêm: máy tính mở danh sách nhỏ, điện thoại mở bảng menu đầy đủ
 function setPop(o){pop.hidden=!o;more.setAttribute('aria-expanded',o)}
 more.addEventListener('click',function(e){e.stopPropagation();if(matchMedia('(max-width:860px)').matches){var m=document.getElementById('navMenu');m&&m.click();return}setPop(pop.hidden)});
 pop.addEventListener('click',function(e){if(e.target.closest('a'))setPop(false)});
 document.addEventListener('click',function(e){if(!pop.hidden&&!e.target.closest('.tb-more'))setPop(false)});
 addEventListener('keydown',function(e){if(e.key==='Escape'&&!pop.hidden){setPop(false);more.focus()}});
})();
/* Lịch vạn niên: theo giờ Việt Nam, mở ngay sau màn hình chờ */
(function(){var $=function(s){return document.querySelector(s)},dlg=$('#lvn');if(!dlg)return;
 var WD=['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
  SOL={'1/1':'Tết Dương lịch','30/4':'Ngày Giải phóng miền Nam','1/5':'Quốc tế Lao động','2/9':'Quốc khánh','27/7':'Ngày Thương binh – Liệt sĩ','22/12':'Ngày thành lập Quân đội'},
  LUN={'1/1':'Tết Nguyên đán','2/1':'Mùng 2 Tết','3/1':'Mùng 3 Tết','15/1':'Rằm tháng Giêng','10/3':'Giỗ Tổ Hùng Vương','15/4':'Lễ Phật đản','5/5':'Tết Đoan ngọ','15/7':'Lễ Vu Lan','15/8':'Tết Trung thu','23/12':'Ông Công ông Táo'};
 function vnToday(){var t=new Date(Date.now()+7*36e5);return[t.getUTCDate(),t.getUTCMonth()+1,t.getUTCFullYear()]}
 function info(d,m,y){var l=LV.toLunar(d,m,y),f=[];if(SOL[d+'/'+m])f.push(SOL[d+'/'+m]);if(!l.leap&&LUN[l.d+'/'+l.m])f.push(LUN[l.d+'/'+l.m]);
  var tk=LV.tietKhi(l.jd);if(tk==='Thanh minh'&&LV.tietKhi(l.jd-1)!=='Thanh minh')f.push('Tiết Thanh minh');return{l:l,f:f,tk:tk}}
 function mName(l){return(l.m===1?'Giêng':l.m===12?'Chạp':l.m)+(l.leap?' (nhuận)':'')}
 function lText(l){return(l.d<=10?'Mùng ':'')+l.d+' tháng '+mName(l)}
 var t=vnToday(),sel=t.slice(),view=[t[1],t[2]];
 function moon(ld,R){var p=(ld-1)/29.53,k=Math.cos(2*Math.PI*p),wx=p<.5,o=wx?1:0,inn=wx?(k>0?0:1):(k>0?1:0);
  return '<circle r="'+R+'" fill="#E9DFC9"/><path d="M0 '+(-R)+'A'+R+' '+R+' 0 0 '+o+' 0 '+R+'A'+(Math.abs(k)*R).toFixed(2)+' '+R+' 0 0 '+inn+' 0 '+(-R)+'Z" fill="#F2C94C"/><circle r="'+R+'" fill="none" stroke="rgba(184,134,47,.55)" stroke-width="1"/>'}
 function flip(){var pg=$('#lvnPage');pg.classList.remove('flip');void pg.offsetWidth;pg.classList.add('flip')}
 function showDay(d,m,y){var x=info(d,m,y),l=x.l,jd=l.jd;flip();$('#lvnMoon').innerHTML=moon(l.d,26);$('#lvnDay').classList.toggle('su',(jd+1)%7===0);
  $('#lvnMY').textContent='Tháng '+m+' · '+y;$('#lvnYearCC').textContent='Năm '+LV.canChiNam(l.y);
  $('#lvnDay').textContent=d;$('#lvnWd').textContent=WD[(jd+1)%7];
  $('#lvnLunar').textContent=lText(l);$('#lvnLunarY').textContent='Năm '+LV.canChiNam(l.y);
  var fe=$('#lvnFest');fe.hidden=!x.f.length;fe.textContent=x.f.join(' · ');
  $('#lvnCCd').textContent=LV.canChiNgay(jd);$('#lvnCCm').textContent=LV.canChiThang(l.m,l.y);$('#lvnTK').textContent=x.tk;$('#lvnHD').textContent=LV.gioHD(jd).join(', ')}
 function drawGrid(){var m=view[0],y=view[1],first=LV.jdFromDate(1,m,y),start=first-((first+1)%7+6)%7,dim=LV.jdFromDate(1,m%12+1,m===12?y+1:y)-first,end=start+Math.ceil((first-start+dim)/7)*7,tj=LV.jdFromDate(t[0],t[1],t[2]),sj=LV.jdFromDate(sel[0],sel[1],sel[2]),h='';
  ['T2','T3','T4','T5','T6','T7','CN'].forEach(function(w,i){h+='<div class="wd'+(i===6?' su':'')+'" role="columnheader">'+w+'</div>'});
  for(var j=start;j<end;j++){var s=LV.jdToDate(j),x=info(s[0],s[1],s[2]),l=x.l,c=[];
   if(s[1]!==m)c.push('out');if((j+1)%7===0)c.push('su');if(l.d===1)c.push('m1');if(l.d===15)c.push('m15');if(x.f.length)c.push('fest');if(j===tj)c.push('now');
   h+='<button type="button" class="'+c.join(' ')+'" data-jd="'+j+'" aria-pressed="'+(j===sj)+'" aria-label="'+WD[(j+1)%7]+' '+s[0]+'/'+s[1]+', âm lịch '+lText(l)+(x.f.length?', '+x.f.join(', '):'')+'"><b>'+s[0]+'</b><small>'+(l.d===1||l.d===15?'<svg viewBox="-12 -12 24 24">'+moon(l.d,11)+'</svg>':'')+(l.d===1?l.d+'/'+l.m:l.d)+'</small></button>'}
  $('#lvnGrid').innerHTML=h;$('#lvnTitle').textContent='Tháng '+m+', '+y}
 function drawNext(){var j0=LV.jdFromDate(t[0],t[1],t[2]),out=[],seen={};
  for(var j=j0+1;j<j0+400&&out.length<3;j++){var s=LV.jdToDate(j),x=info(s[0],s[1],s[2]),l=x.l,name=x.f[0]||(l.d===1?'Mùng 1 tháng '+mName(l):l.d===15?'Rằm tháng '+mName(l):'');
   if(!name||seen[name])continue;if(out.length>=2&&!x.f.length)continue;seen[name]=1;out.push('<li><span><b>'+name+'</b><small>'+WD[(j+1)%7]+', '+s[0]+'/'+s[1]+'/'+s[2]+' · âm '+l.d+'/'+l.m+'</small></span><em>còn '+(j-j0)+' ngày</em></li>')}
  $('#lvnNext').innerHTML=out.join('')}
 function open(){$('#lvnGo').textContent=document.documentElement.classList.contains('hall-on')?'Quay lại':'Vào Thế Giới Song Song';t=vnToday();drawNext();drawGrid();showDay(sel[0],sel[1],sel[2]);if(!dlg.open)dlg.showModal()}
 $('#lvnGrid').addEventListener('click',function(e){var b=e.target.closest('button[data-jd]');if(!b)return;var s=LV.jdToDate(+b.dataset.jd);sel=s;if(s[1]!==view[0]){view=[s[1],s[2]]}drawGrid();showDay(s[0],s[1],s[2])});
 document.querySelectorAll('#lvn [data-mo]').forEach(function(b){b.addEventListener('click',function(){var m=view[0]+(+b.dataset.mo),y=view[1];if(m<1){m=12;y--}if(m>12){m=1;y++}view=[m,y];drawGrid();var g=$('#lvnGrid');g.classList.remove('sl-n','sl-p');void g.offsetWidth;g.classList.add(+b.dataset.mo>0?'sl-n':'sl-p')})});
 $('#lvnToday').addEventListener('click',function(){t=vnToday();sel=t.slice();view=[t[1],t[2]];drawGrid();showDay(t[0],t[1],t[2])});
 $('#lvnX').addEventListener('click',function(){dlg.close()});$('#lvnGo').addEventListener('click',function(){dlg.close()});
 dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
 var cb=$('#calBtn');if(cb){var l=LV.toLunar(t[0],t[1],t[2]);var WS=['CN','T2','T3','T4','T5','T6','T7'],wj=(l.jd+1)%7;cb.querySelector('i').textContent=t[0];cb.querySelector('b').textContent=WS[wj]+', '+t[0]+'/'+t[1]+'/'+t[2];cb.querySelector('small').textContent='Âm '+l.d+'/'+l.m+' · '+LV.canChiNam(l.y);cb.setAttribute('aria-label','Hôm nay '+WD[wj]+' '+t[0]+'/'+t[1]+'/'+t[2]+', âm lịch '+l.d+' tháng '+l.m+'. Mở lịch vạn niên');cb.addEventListener('click',function(){sel=vnToday();view=[sel[1],sel[2]];open()})}
 // mở ngay khi màn hình chờ vừa xong
 var tries=0,iv=setInterval(function(){tries++;if(document.documentElement.classList.contains('loaded')||!document.getElementById('loader')||tries>60){clearInterval(iv);/* lịch không tự bật nữa: mở từ thanh điều hướng */}},150);
})();
/* Khu thắp nhang + thiệp tưởng niệm (dữ liệu lưu trên máy người dùng) */
(function(){var $=function(s){return document.querySelector(s)};if(!$('#altar')||!window.LV)return;
 function vn(){var t=new Date(Date.now()+7*36e5);return[t.getUTCDate(),t.getUTCMonth()+1,t.getUTCFullYear()]}
 var WD=['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
 function chips(box){box.addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;[].forEach.call(box.querySelectorAll('.chip'),function(x){x.setAttribute('aria-pressed',x===c)});box.dispatchEvent(new Event('change'))})}
 function pick(box){var c=box.querySelector('[aria-pressed="true"]');return c?c.textContent:''}
 // lịch âm hôm nay
 var t=vn(),l=LV.toLunar(t[0],t[1],t[2]);
 $('#hcD').textContent=t[0];$('#hcSolar').textContent=WD[(l.jd+1)%7]+', '+t[0]+'/'+t[1]+'/'+t[2];
 function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,L=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*L)/451);return LV.jdFromDate((h+L-7*m+114)%31+1,Math.floor((h+L-7*m+114)/31),y)}
 var FIX={'1/1':'Lễ Đức Maria Mẹ Thiên Chúa','2/2':'Lễ Dâng Chúa vào Đền thánh','19/3':'Lễ Thánh Giuse','15/8':'Lễ Đức Mẹ Lên Trời','1/11':'Lễ Các Thánh','2/11':'Lễ cầu cho các tín hữu đã qua đời','24/11':'Lễ Các Thánh Tử đạo Việt Nam','8/12':'Lễ Đức Mẹ Vô nhiễm','25/12':'Lễ Giáng Sinh'},
  MON={3:'Tháng kính Thánh Giuse',5:'Tháng Hoa kính Đức Mẹ',6:'Tháng kính Thánh Tâm',10:'Tháng Mân Côi',11:'Tháng các Linh hồn'};
 function feast(jd){var d=LV.jdToDate(jd),E=easter(d[2]),M={};M[E-46]='Thứ Tư Lễ Tro';M[E-7]='Chúa nhật Lễ Lá';M[E-2]='Thứ Sáu Tuần Thánh';M[E]='Lễ Phục Sinh';M[E+49]='Lễ Chúa Thánh Thần Hiện Xuống';return M[jd]||FIX[d[0]+'/'+d[1]]||''}
 function renderCal(){if(window.ssFaith==='cg'){var fe=feast(l.jd);$('#hcLunar').textContent=(MON[t[1]]||'Lịch phụng vụ')+' · Âm lịch '+l.d+'/'+l.m;
   var nx='';for(var j=l.jd+1;j<l.jd+60;j++){var f2=feast(j);if(f2){nx='Còn '+(j-l.jd)+' ngày đến '+f2.replace(/^Lễ /,'lễ ');break}}if(!nx){var sd=(7-(l.jd+1)%7)%7;nx=sd?'Còn '+sd+' ngày đến Chúa nhật':'Hôm nay là Chúa nhật'}
   if(fe)nx='Hôm nay: '+fe;$('#hcNext').textContent=nx;$('#hcNext').hidden=false;return}
  $('#hcLunar').textContent='Âm lịch '+l.d+' tháng '+l.m+(l.leap?' (nhuận)':'')+' năm '+LV.canChiNam(l.y);
 $('#hcCCd').textContent=LV.canChiNgay(l.jd);$('#hcCCm').textContent=LV.canChiThang(l.m,l.y);$('#hcCCy').textContent=LV.canChiNam(l.y);$('#hcTK').textContent=LV.tietKhi(l.jd);$('#hcHD').textContent=LV.gioHD(l.jd).join(', ');
 var n='';for(var j=l.jd;j<l.jd+31;j++){var s=LV.jdToDate(j),x=LV.toLunar(s[0],s[1],s[2]);if(x.d===1||x.d===15){n=(j===l.jd?'Hôm nay là ':'Còn '+(j-l.jd)+' ngày đến ')+(x.d===1?'mùng 1':'Rằm');break}}
 $('#hcNext').textContent=n;$('#hcNext').hidden=!n}
 renderCal();
 $('#hubCalBtn').addEventListener('click',function(){var o=this.getAttribute('aria-expanded')!=='true';this.setAttribute('aria-expanded',o);$('#hubCalMore').hidden=!o});
 function openCal(){var b=$('#calBtn');b&&b.click()}
 $('#hcOpen').addEventListener('click',openCal);[].forEach.call(document.querySelectorAll('[data-open-cal]'),function(b){b.addEventListener('click',openCal)});
 // số liệu thắp nhang
 var K='ss-incense',st;try{st=JSON.parse(localStorage.getItem(K))||{}}catch(e){st={}}
 st.total=st.total||0;st.days=st.days||{};
 var key=function(d){return d[2]+'-'+d[1]+'-'+d[0]},today=key(t);
 function streak(){var c=0,jd=l.jd;if(!st.days[today])jd--;for(;;jd--){var d=LV.jdToDate(jd);if(st.days[key(d)])c++;else break}return c}
 function bump(el,v){el.textContent=v.toLocaleString('vi-VN');el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')}
 function draw(anim){var s=streak(),a=anim?bump:function(el,v){el.textContent=v.toLocaleString('vi-VN')};a($('#hsToday'),st.days[today]||0);a($('#hsTotal'),st.total);a($('#hsStreak'),s);
  var gl=window.ssFaith==='cg'?30:49,p=Math.min(s,gl);$('#h49n').textContent=p+'/'+gl;$('#h49bar').style.width=(p/gl*100)+'%';if(st.days[today])$('#altar').classList.add('lit')}
 draw(false);chips($('#altarTo'));window.ssHubRefresh=function(){renderCal();draw(false)};
 var altar=$('#altar'),msg=$('#altarMsg');
 $('#hubLight').addEventListener('click',function(){st.total++;st.days[today]=(st.days[today]||0)+1;try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}
  altar.classList.add('lit');altar.classList.remove('go');void altar.offsetWidth;altar.classList.add('go');
  msg.textContent=(window.ssFaith==='cg'?'Thắp nến cầu cho ':'Thành kính dâng ')+pick($('#altarTo')).toLowerCase().replace('anh hùng liệt sĩ','các anh hùng liệt sĩ');msg.classList.remove('show');void msg.offsetWidth;msg.classList.add('show');draw(true)});
 // thỉnh chuông: tiếng chuông tổng hợp bằng Web Audio
 var ac=null,prT=0;$('#hubBell').addEventListener('click',function(){if(window.ssFaith==='cg'){var pr=$('#prayer');$('#prName').textContent=pick($('#altarTo')).toLowerCase();pr.classList.add('show');clearTimeout(prT);prT=setTimeout(function(){pr.classList.remove('show')},12000);window.ssBell&&ssBell('cg');altar.classList.remove('ring');void altar.offsetWidth;altar.classList.add('ring');return}try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();var now=ac.currentTime,out=ac.createGain();out.gain.value=.5;out.connect(ac.destination);
  [[220,1,6],[440,.5,4.5],[587,.32,3.5],[880,.22,2.4],[1320,.12,1.6]].forEach(function(p){var o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=p[0];g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(p[1],now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+p[2]);o.connect(g);g.connect(out);o.start(now);o.stop(now+p[2])})}catch(e){}
  altar.classList.remove('ring');void altar.offsetWidth;altar.classList.add('ring')});
 // thiệp tưởng niệm
 var cv=$('#cmCanvas');if(!cv)return;var cx=cv.getContext('2d');chips($('#cmTo'));chips($('#cmMsg'));
 function wrap(text,x,y,maxW,lh){var words=text.split(' '),line='',lines=[];words.forEach(function(w){var tt=line?line+' '+w:w;if(cx.measureText(tt).width>maxW&&line){lines.push(line);line=w}else line=tt});lines.push(line);lines.forEach(function(s,i){cx.fillText(s,x,y+i*lh)});return lines.length}
 function render(){var W=1080,H=1350,f=getComputedStyle(document.body).fontFamily;cx.clearRect(0,0,W,H);
  var g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#FFFDF8');g.addColorStop(1,'#F1E2C2');cx.fillStyle=g;cx.fillRect(0,0,W,H);
  var r=cx.createRadialGradient(W/2,430,20,W/2,430,520);r.addColorStop(0,'rgba(255,236,190,.95)');r.addColorStop(1,'rgba(255,236,190,0)');cx.fillStyle=r;cx.fillRect(0,0,W,H);
  cx.strokeStyle='rgba(184,134,47,.55)';cx.lineWidth=3;cx.strokeRect(48,48,W-96,H-96);cx.strokeStyle='rgba(184,134,47,.25)';cx.strokeRect(64,64,W-128,H-128);
  // bát hương
  cx.save();cx.translate(W/2,520);cx.fillStyle='#8A3B2B';[-50,0,50].forEach(function(dx,i){cx.save();cx.translate(dx,0);cx.rotate((i-1)*.12);cx.fillRect(-4,-230,8,230);cx.fillStyle='#FF9A3D';cx.beginPath();cx.arc(0,-232,8,0,7);cx.fill();cx.restore();cx.fillStyle='#8A3B2B'});
  cx.strokeStyle='rgba(120,100,80,.35)';cx.lineWidth=4;cx.lineCap='round';[-62,0,62].forEach(function(dx){cx.beginPath();cx.moveTo(dx,-250);cx.bezierCurveTo(dx-26,-300,dx+26,-330,dx,-380);cx.stroke()});
  var ug=cx.createLinearGradient(0,0,0,150);ug.addColorStop(0,'#E7C27A');ug.addColorStop(1,'#7E5A1C');cx.fillStyle=ug;cx.beginPath();cx.moveTo(-170,0);cx.bezierCurveTo(-170,110,-90,160,0,160);cx.bezierCurveTo(90,160,170,110,170,0);cx.closePath();cx.fill();
  cx.fillStyle='#E6DAC4';cx.beginPath();cx.ellipse(0,0,170,26,0,0,7);cx.fill();cx.restore();
  cx.textAlign='center';cx.fillStyle='#9A6E22';cx.font='600 30px '+f;cx.fillText('KÍNH DÂNG '+pick($('#cmTo')).toUpperCase(),W/2,800);
  var nm=$('#cmName').value.trim();cx.fillStyle='#2B241C';if(nm){cx.font='300 76px '+f;cx.fillText(nm,W/2,890)}
  cx.font='300 54px '+f;cx.fillStyle='#3A3026';var nl=wrap('“'+pick($('#cmMsg'))+'”',W/2,nm?990:900,820,70);
  var fr=$('#cmFrom').value.trim();if(fr){cx.font='italic 34px '+f;cx.fillStyle='#6E6253';cx.fillText('— '+fr,W/2,(nm?990:900)+nl*70+40)}
  var d=vn(),ll=LV.toLunar(d[0],d[1],d[2]);cx.font='26px '+f;cx.fillStyle='#8A7A66';cx.fillText('Ngày '+d[0]+'/'+d[1]+'/'+d[2]+' · Âm lịch '+ll.d+'/'+ll.m+' '+LV.canChiNam(ll.y),W/2,1205);
  cx.font='600 28px '+f;cx.fillStyle='#2B241C';cx.fillText('Song Song · Làng tưởng niệm trực tuyến',W/2,1250);
}
 ['change','input'].forEach(function(ev){$('#cmForm').addEventListener(ev,render)});
 $('#cmForm').addEventListener('submit',function(e){e.preventDefault();render();cv.scrollIntoView({behavior:'smooth',block:'center'})});
 // tải thiệp qua quyền tải tệp của trang (người xem xác nhận trước khi lưu)
 var dl=null;window.claude&&claude.use&&claude.use('downloads').then(function(d){dl=d;$('#cmSave').hidden=!d}).catch(function(){});
 $('#cmSave').addEventListener('click',function(){if(!dl)return;cv.toBlob(function(b){dl.save({filename:'thiep-tuong-niem.png',data:b}).catch(function(e){if(e&&e.code!=='declined'&&window.toast)toast('Chưa tải được thiệp, bạn thử lại sau nhé.')})},'image/png')});
 var sh=$('#cmShare');if(navigator.canShare){sh.hidden=false;sh.addEventListener('click',function(){cv.toBlob(function(b){var file=new File([b],'thiep-tuong-niem.png',{type:'image/png'});if(navigator.canShare({files:[file]}))navigator.share({files:[file],title:'Thiệp tưởng niệm'}).catch(function(){})})})}
 (document.fonts?document.fonts.ready:Promise.resolve()).then(render);
})();
