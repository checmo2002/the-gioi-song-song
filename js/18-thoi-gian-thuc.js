/* Thời gian thực: đồng hồ + lịch âm; ánh sáng cảnh theo giờ; thời tiết thật (Open-Meteo) hoặc mô phỏng theo khí hậu vùng nếu không lấy được */
(function(){
 var hall=document.getElementById('hall');if(!hall)return;
 var CITY={hn:['Hà Nội',21.03,105.85,'b'],hp:['Hải Phòng',20.86,106.68,'b'],hue:['Huế',16.46,107.59,'t'],dn:['Đà Nẵng',16.05,108.2,'t'],nt:['Nha Trang',12.24,109.19,'t'],dl:['Đà Lạt',11.94,108.44,'c'],hcm:['TP. Hồ Chí Minh',10.78,106.7,'n'],ct:['Cần Thơ',10.03,105.78,'n']};
 var KEY='ss-wx',cfg={};try{cfg=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}cfg.city=cfg.city||'hn';
if(!CITY[cfg.city])cfg.city='hn';   // tên nơi cũ đã bị bỏ khỏi danh sách: về Hà Nội thay vì làm sập
 function sv(){try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}}
 var THU=['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
 // ---------- biểu tượng ----------
 var SUN='<circle cx="12" cy="12" r="4.2" fill="#FFC94A"/><g stroke="#FFC94A" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/></g>',
  MOON='<path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.8A7 7 0 0 1 15.5 3.5z" fill="#F2E6B8"/>',
  CL='<path d="M7 18.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 18.5z" fill="#DCE3EC"/>',
  CLD='<path d="M7 18.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 18.5z" fill="#9AA6B6"/>',
  DROP='<g stroke="#7FB8F0" stroke-width="1.8" stroke-linecap="round"><path d="M8 20.5l-1 2M12 20.5l-1 2M16 20.5l-1 2"/></g>',
  BOLT='<path d="M13 13l-3 5h3l-1.5 4.5L16 16h-3l1.5-3z" fill="#FFD84A"/>',
  FOG='<g stroke="#C9D2DC" stroke-width="1.8" stroke-linecap="round"><path d="M4 10h16M6 14h12M4 18h16"/></g>',
  SNOW='<g fill="#EAF2FF"><circle cx="8" cy="21" r="1"/><circle cx="12" cy="22" r="1"/><circle cx="16" cy="21" r="1"/></g>';
 function icon(k,day){var b=day?SUN:MOON,small='<g transform="translate(-4 -5) scale(.75)">'+b+'</g>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+({clear:b,part:small+CL,cloud:CLD+'<g transform="translate(3 -3) scale(.8)">'+CL+'</g>',fog:FOG,drizzle:CL.replace('18.5','16.5')+DROP,rain:CLD+DROP,storm:CLD+BOLT+DROP,snow:CL+SNOW}[k]||b)+'</svg>'}
 var DESC={clear:'Trời quang',part:'Có mây',cloud:'Nhiều mây',fog:'Sương mù',drizzle:'Mưa phùn',rain:'Mưa',storm:'Dông',snow:'Tuyết'};
 function fromWMO(c){return c===0?'clear':c<=2?'part':c===3?'cloud':c<=48?'fog':c<=57?'drizzle':c<=67?'rain':c<=77?'snow':c<=82?'rain':'storm'}
 // ---------- mô phỏng theo khí hậu vùng (khi không lấy được dữ liệu thật) ----------
 function hash(n){n=Math.sin(n*127.1)*43758.5;return n-Math.floor(n)}
 function climate(){var c=CITY[cfg.city],d=new Date(),m=d.getMonth()+1,h=d.getHours()+d.getMinutes()/60,day=Math.floor(d.getTime()/864e5),r=hash(day+cfg.city.length),R=c[3];
  var T={b:[17,18,20,24,28,30,30,29,28,26,22,19],t:[20,21,23,26,28,29,29,29,27,25,23,21],c:[16,17,18,19,20,20,19,19,19,18,17,16],n:[26,27,28,29,29,28,28,28,27,27,27,26]}[R][m-1];
  var tem=T+3.5*Math.sin((h-9)/24*2*Math.PI),k='clear';
  var wet={b:m>=5&&m<=9,t:m>=9&&m<=12,c:m>=5&&m<=10,n:m>=5&&m<=11}[R];
  if(R==='b'&&(m===2||m===3)&&r<.6)k='drizzle';
  else if(wet&&h>=14&&h<=19&&r<.55)k=r<.15?'storm':'rain';
  else if(wet&&r<.75)k='cloud';else if(r<.4)k='part';
  if((R==='b'||R==='c')&&h<7&&r>.7)k='fog';
  if(k==='rain'||k==='storm')tem-=3;
  return {k:k,t:Math.round(tem),w:Math.round(5+r*12),real:false}}
 var W=null;
 function fetchWx(){var c=CITY[cfg.city],cache=cfg.cache;
  if(cache&&cache.city===cfg.city&&Date.now()-cache.at<15*60e3){W=cache.w;paint();return}
  var ctl=window.AbortController?new AbortController():null;setTimeout(function(){ctl&&ctl.abort()},8000);
  try{fetch('https://api.open-meteo.com/v1/forecast?latitude='+c[1]+'&longitude='+c[2]+'&current=temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m&timezone=auto',ctl?{signal:ctl.signal}:{})
   .then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){var cu=j.current;W={k:fromWMO(cu.weather_code),t:Math.round(cu.temperature_2m),w:Math.round(cu.wind_speed_10m),hu:Math.round(cu.relative_humidity_2m)||0,real:true};cfg.cache={city:cfg.city,at:Date.now(),w:W};sv();paint()})
   .catch(function(){W=climate();paint()})}catch(e){W=climate();paint()}}
 // ---------- HUD ----------
 var pill=document.createElement('button');pill.type='button';pill.className='wx-pill';pill.setAttribute('aria-haspopup','dialog');
 var pop=document.createElement('div');pop.className='wx-pop';pop.hidden=true;pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Thời gian và thời tiết');
 hall.appendChild(pill);hall.appendChild(pop);
 var sky=document.createElement('div');sky.className='wx-sky';var cv=document.createElement('canvas');cv.className='wx-cv';var fl=document.createElement('div');fl.className='wx-flash';
 var wst=document.getElementById('wStage'),wbg=wst&&wst.querySelector('.w-bg'),sc=(wst&&wst.parentNode)||hall;
 // ánh sáng nằm ngay trên ảnh cảnh, dưới nhân vật và nhãn; mưa phủ trên cùng
 if(wbg)wbg.after(sky);else sc.appendChild(sky);sc.appendChild(cv);sc.appendChild(fl);
 function pos(){var o=document.getElementById('hallOnline'),hr=hall.getBoundingClientRect();if(!o)return;var r=o.getBoundingClientRect();if(!r.height){var tp=hall.querySelector('.hall-top');r=tp?tp.getBoundingClientRect():r}var top=(r.height?r.bottom:hr.top+100)-hr.top+6,L=r.width?r.left-hr.left:12;L=Math.max(12,Math.min(L,hr.width-pill.offsetWidth-12));pill.style.top=top+'px';pill.style.left=L+'px';pop.style.top=(top+40)+'px';pop.style.left=Math.max(12,Math.min(L,hr.width-Math.min(300,hr.width-24)-12))+'px'}
 function lunar(d){try{var l=window.ssToLunar&&ssToLunar(d.getDate(),d.getMonth()+1,d.getFullYear());return l?l.d+'/'+l.m+(l.leap?' (nhuận)':''):''}catch(e){return ''}}
 function phase(h){return h<5?'dem':h<7?'sang':h<17?'ngay':h<19?'chieu':'dem'}
 var PH={dem:'Đêm',sang:'Bình minh',ngay:'Ban ngày',chieu:'Hoàng hôn'};
 function paint(){var d=new Date(),h=d.getHours(),mi=d.getMinutes(),day=h>=6&&h<18,w=W||climate();
  var hh=String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0'),dd=d.getDate()+'/'+(d.getMonth()+1),lu=lunar(d);
  pill.innerHTML=icon(w.k,day)+'<b>'+w.t+'°</b><span class="sep"></span><b>'+hh+'</b><span class="sep"></span><small>'+THU[d.getDay()].replace('Thứ ','T').replace('Chủ nhật','CN')+' '+dd+(lu?' · ÂL '+lu:'')+'</small>';
  pos();pill.setAttribute('aria-label','Bây giờ '+hh+', '+THU[d.getDay()]+' '+dd+', '+DESC[w.k]+' '+w.t+' độ. Bấm để xem chi tiết');
  if(!pop.hidden)popInner(d,w,hh,lu);
  scene(w,h+mi/60)}
 function popInner(d,w,hh,lu){var c=CITY[cfg.city];
  pop.innerHTML='<div class="big">'+icon(w.k,d.getHours()>=6&&d.getHours()<18)+'<div><b>'+w.t+'°C</b><span>'+DESC[w.k]+' · '+c[0]+'</span></div></div>'+
   '<dl><dt>Giờ</dt><dd>'+hh+' · '+PH[phase(d.getHours())]+'</dd><dt>Dương lịch</dt><dd>'+THU[d.getDay()]+', '+d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+'</dd>'+(lu?'<dt>Âm lịch</dt><dd>Ngày '+lu.replace('/',' tháng ')+'</dd>':'')+
   '<dt>Gió</dt><dd>'+w.w+' km/h</dd>'+(w.hu!=null?'<dt>Độ ẩm</dt><dd>'+w.hu+'%</dd>':'')+'</dl>'+
   '<label>Thời tiết theo nơi<select>'+Object.keys(CITY).map(function(k){return '<option value="'+k+'"'+(k===cfg.city?' selected':'')+'>'+CITY[k][0]+'</option>'}).join('')+'</select></label>'+
   '<p class="src">'+(w.real?'Thời tiết thật từ Open-Meteo, cập nhật mỗi 15 phút':'Không lấy được thời tiết trực tuyến · đang mô phỏng theo khí hậu mùa của vùng')+'</p>';
  pop.querySelector('select').addEventListener('change',function(e){cfg.city=e.target.value;cfg.cache=null;sv();W=null;fetchWx()})}
 pill.addEventListener('click',function(e){e.stopPropagation();pop.hidden=!pop.hidden;pos();paint()});
 document.addEventListener('click',function(e){if(!pop.hidden&&!pop.contains(e.target)&&e.target!==pill)pop.hidden=true});
 // ---------- cảnh: ánh sáng theo giờ + mưa/sương/dông ----------
 var IN={dien:1,tho:1,nha:1},drops=[],mode='',ctx=cv.getContext('2d'),raf=0,lastF=0;
 function scene(w,h){var ws=hall.dataset.ws,ind=IN[ws];
  // màu trời: đêm xanh thẫm, bình minh/hoàng hôn cam, ban ngày trong; mưa/mây làm tối
  var bg='transparent',op=1;
  if(h<5||h>=19.5)bg='radial-gradient(120% 90% at 50% 40%,rgba(20,30,70,.38),rgba(8,10,30,.62))';
  else if(h<6.5)bg='linear-gradient(rgba(255,170,120,.22),rgba(60,60,120,.25))';
  else if(h<8)bg='linear-gradient(rgba(255,210,150,.14),rgba(255,230,190,.06))';
  else if(h>=17&&h<18.3)bg='linear-gradient(rgba(255,160,90,.2),rgba(200,90,60,.14))';
  else if(h>=18.3)bg='linear-gradient(rgba(150,80,110,.26),rgba(30,30,80,.42))';
  var dim=w.k==='storm'?.32:w.k==='rain'?.22:w.k==='cloud'||w.k==='drizzle'?.12:w.k==='fog'?.05:0;
  if(dim)bg=(bg==='transparent'?'':bg+',')+'linear-gradient(rgba(60,70,85,'+dim+'),rgba(60,70,85,'+dim+'))';
  if(w.k==='fog'&&!ind)bg=(bg==='transparent'?'':bg+',')+'linear-gradient(rgba(235,238,242,.62),rgba(235,238,242,.32) 70%)';
  if(ind&&bg!=='transparent')op=.6;
  sky.style.background=bg;sky.style.opacity=op;
  var want=ind?'':(w.k==='rain'||w.k==='storm'?'rain':w.k==='drizzle'?'drz':w.k==='snow'?'snow':'');
  if(want!==mode){mode=want;drops=[];if(mode&&!raf)loop();if(!mode){ctx.clearRect(0,0,cv.width,cv.height)}}
  storm=w.k==='storm'&&!ind}
 var storm=false,nextBolt=0;
 function size(){var r=hall.getBoundingClientRect(),dp=Math.min(2,devicePixelRatio||1);cv.width=r.width*dp;cv.height=r.height*dp;ctx.setTransform(dp,0,0,dp,0,0)}
 function loop(){if(!mode){raf=0;return}raf=requestAnimationFrame(loop);if(hall.hidden||document.hidden)return;var now=performance.now(),dt=Math.min(.05,(now-(lastF||now))/1000);lastF=now;
  var Wd=hall.clientWidth,Hd=hall.clientHeight,N=mode==='rain'?Math.round(Wd*Hd/2600):mode==='drz'?Math.round(Wd*Hd/5000):Math.round(Wd*Hd/9000);
  if(cv.width<2)size();
  while(drops.length<N)drops.push({x:Math.random()*Wd*1.2,y:Math.random()*Hd,v:mode==='rain'?700+Math.random()*400:mode==='drz'?260+Math.random()*120:50+Math.random()*40,l:mode==='rain'?12+Math.random()*10:5+Math.random()*4,s:Math.random()*.6+.4});
  ctx.clearRect(0,0,Wd,Hd);ctx.lineCap='round';
  ctx.strokeStyle=mode==='rain'?'rgba(200,215,235,.55)':'rgba(220,228,240,.45)';ctx.fillStyle='rgba(255,255,255,.85)';ctx.lineWidth=mode==='rain'?1.2:1;
  ctx.beginPath();for(var i=0;i<drops.length;i++){var d=drops[i];d.y+=d.v*dt;d.x-=d.v*dt*.18;if(d.y>Hd||d.x<-20){d.y=-20;d.x=Math.random()*Wd*1.2}
   if(mode==='snow'){ctx.moveTo(d.x+2,d.y);ctx.arc(d.x,d.y,2*d.s,0,6.283)}else{ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.l*.18,d.y-d.l)}}
  if(mode==='snow')ctx.fill();else ctx.stroke();
  if(storm&&now>nextBolt){nextBolt=now+6000+Math.random()*9000;fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on')}}
 addEventListener('resize',function(){size();pos()});
 new MutationObserver(function(){pos();paint()}).observe(hall,{attributes:true,attributeFilter:['data-ws','hidden','class']});
 setInterval(paint,20000);setInterval(fetchWx,15*60e3);
 setTimeout(function(){size();pos();fetchWx();paint()},800);
 window.ssWx={now:function(){return W},set:function(k,t){W={k:k,t:t||W&&W.t||28,w:8,real:false};paint()},city:function(c){cfg.city=c;cfg.cache=null;sv();fetchWx()}};
})();
