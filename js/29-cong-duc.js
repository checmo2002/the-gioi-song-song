/* Công đức chung cho mọi hoạt động trên chùa (chủ dự án duyệt 09/11/2026).
   Thắp nhang, Thỉnh chuông, Vái lạy, Tĩnh tâm mỗi việc một trò nhỏ; điểm cộng thẳng vào công đức Gõ mõ (ssMo.add)
   nên cả năm việc chung một thang 9 phẩm sen. Mỗi trò tối đa 108 công đức/ngày để không ai cày.
   Mở bằng ssCongDuc.open('nhang'|'chuong'|'lay'|'thien'); js/04-01 gọi khi nhân vật tới nơi. */
(function(){
 if(!window.ssMo||!ssMo.LV)return;
 var KEY='ss-cong-duc',CAP=108,TEN={nhang:'Thắp nhang',chuong:'Thỉnh chuông',lay:'Vái lạy',thien:'Tĩnh tâm',mo:'Gõ mõ'};
 // shortcut: lưu trong trình duyệt từng người nên chưa xếp hạng được với người khác; cần máy chủ (chủ dự án quyết) mới có bảng chung
 function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
 var st=load();st.t=st.t||{};st.h=st.h||{};st.w=st.w||{};
 function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
 function ngay(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function roll(){var d=new Date();if(st.d!==ngay(d)){st.d=ngay(d);st.h={}}d.setDate(d.getDate()-(d.getDay()+6)%7);if(st.wk!==ngay(d)){st.wk=ngay(d);st.w={}}}
 function ghi(k,n){roll();st.t[k]=(st.t[k]||0)+n;st.w[k]=(st.w[k]||0)+n;st.h[k]=(st.h[k]||0)+n;save()}
 function cong(k,n){roll();n=Math.max(0,Math.min(n,CAP-(st.h[k]||0)));if(n){ghi(k,n);ssMo.add(n)}dau();return n}
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

 var box=document.createElement('div');box.className='mo cdg';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
 box.innerHTML='<div class="mo-card"><button class="mo-x" type="button" aria-label="Đóng">×</button>'+
  '<div class="cdg-h"><span class="cdg-lo"></span><div><b class="cdg-ten"></b><small class="cdg-c"></small></div></div><div class="mo-bar"><i></i></div>'+
  '<div class="cdg-s"></div><div class="mo-tip cdg-tip" aria-live="polite"></div>'+
  '<div class="cdg-f"><span class="cdg-hn"></span><button type="button" class="cdg-bang">Bảng công đức ›</button></div><div class="mo-path cdg-b" hidden></div></div>';
 document.body.appendChild(box);
 var q=function(c){return box.querySelector(c)},S=q('.cdg-s'),tip=q('.cdg-tip'),cur=null,tro='';
 function say(t,c){tip.textContent=t||'';tip.className='mo-tip cdg-tip'+(c?' '+c:'')}
 function dau(){var tot=ssMo.state().tot,L=ssMo.LV,l=ssMo.lvOf(tot),a=L[l][0],b=L[l+1]?L[l+1][0]:a;roll();
  q('.cdg-lo').innerHTML=ssMo.icon(l);q('.cdg-ten').textContent=(TEN[tro]||'Công đức')+' · '+L[l][1];
  q('.cdg-c').textContent=tot.toLocaleString('vi-VN')+' công đức · phẩm '+(l+1)+'/9';q('.mo-bar i').style.width=(b>a?(tot-a)/(b-a)*100:100)+'%';
  if(tro)q('.cdg-hn').textContent='Hôm nay: '+(st.h[tro]||0)+'/'+CAP}
 function nut(nhan,cls){return '<button type="button" class="cdg-nut'+(cls?' '+cls:'')+'">'+nhan+'</button>'}
 function xong(tong,them,lai){say((tong?'+'+tong+' công đức':'Chưa thành công đức')+(tong&&them<tong?' · hôm nay đã đủ '+CAP:''),'nt');
  var b=S.querySelector('.cdg-nut');b.textContent=lai;setTimeout(function(){b.dataset.lai='1'},400)}   // trễ để cú thả tay vừa rồi không bấm luôn lượt mới
 function bay(t){var p=document.createElement('span');p.className='mo-plus';p.textContent=t;S.appendChild(p);setTimeout(function(){p.remove()},900)}
 function lai(f){if(cur)cur.dung();cur=f();var b=S.querySelector('.cdg-nut');b&&b.focus()}
 function raf(f){var id,go=function(n){f(n);id=requestAnimationFrame(go)};id=requestAnimationFrame(go);return function(){cancelAnimationFrame(id)}}

 // Thỉnh chuông: tiếng chuông ngân thu nhỏ dần; thỉnh tiếp khi tiếng ngân vào vòng vàng thì hồi chuông không đứt
 function chuong(){S.innerHTML='<svg class="cdg-vg" viewBox="0 0 240 240"><circle cx="120" cy="120" r="34" class="cdg-dich"/><circle cx="120" cy="120" r="110" class="cdg-ngan"/>'+
   '<path class="cdg-chuong" d="M120 70c-22 0-32 18-32 40v22l-10 12h84l-10-12v-22c0-22-10-40-32-40zM112 152a8 8 0 0 0 16 0"/></svg>'+nut('Thỉnh chuông');
  var ngan=S.querySelector('.cdg-ngan'),T=3600,t0=0,n=0,tong=0,them=0,chuoi=0,b=S.querySelector('.cdg-nut');
  say('Thỉnh tiếng đầu, rồi đợi tiếng ngân thu vào vòng vàng mới thỉnh tiếp · 9 tiếng một hồi');
  function r(now){return t0?Math.max(0,110*(1-(now-t0)/T)):110}
  var dung=raf(function(now){var x=r(now);ngan.setAttribute('r',x);ngan.style.opacity=t0?.35+x/170:.25;if(t0&&x===0&&n<9){t0=0;chuoi=0;say('Tiếng chuông đã lặng · thỉnh lại để tiếp hồi chuông')}});
  function danh(){var now=performance.now();if(b.dataset.lai)return lai(chuong);window.ssBell&&ssBell();S.querySelector('.cdg-chuong').classList.remove('rung');void S.offsetWidth;S.querySelector('.cdg-chuong').classList.add('rung');
   var x=r(now),d=0;if(t0){if(x>=22&&x<=46){chuoi++;d=chuoi>=3?3:2;say(chuoi>=3?'Hồi chuông liền mạch':'Tròn tiếng','nt')}else if(x<22){d=1;say('Hơi muộn, tiếng ngân suýt lặng')}else{chuoi=0;say('Vội quá, đợi tiếng ngân thu nhỏ')}}
   n++;if(d){tong+=d;bay('+'+d)}t0=now;if(n>=9){t0=0;them=cong('chuong',tong);xong(tong,them,'Thỉnh hồi mới')}}
  b.addEventListener('click',danh);return {phim:danh,dung:dung}}

 // Vái lạy: theo nhịp hoa sen nở; lạy đúng lúc sen nở trọn · ba lạy một lượt
 function lay(){S.innerHTML='<svg class="cdg-vg" viewBox="0 0 240 240"><circle cx="120" cy="120" r="96" class="cdg-dich"/><g class="cdg-sen">'+ssMo.icon(5).replace(/<\/?svg[^>]*>/g,'')+'</g></svg>'+nut('Lạy');
  var sen=S.querySelector('.cdg-sen'),P=2600,t0=performance.now(),n=0,tong=0,khoa=0,b=S.querySelector('.cdg-nut');
  say('Chắp tay, khi hoa sen nở trọn thì lạy · ba lạy');
  function pha(now){return((now-t0)%P)/P}   // 0.5 là sen nở trọn
  var dung=raf(function(now){var k=.55+.45*Math.sin(pha(now)*Math.PI);sen.setAttribute('transform','translate(120 120) scale('+(k*2.6)+') translate(-32 -36)')});
  function bam(){var now=performance.now();if(b.dataset.lai)return lai(lay);if(now<khoa)return;khoa=now+1200;var l=Math.abs(pha(now)-.5),d=l<.08?3:l<.18?1:0;
   say(d===3?'Thành kính':d?'Chậm lại một chút, theo nhịp sen':'Đợi hoa sen nở trọn',d===3?'nt':'');if(d){tong+=d;bay('+'+d)}
   n++;if(n>=3){them=cong('lay',tong);xong(tong,them,'Ba lạy nữa')}}
  b.addEventListener('click',bam);return {phim:bam,dung:dung}}

 // nút giữ: chuột, chạm, phím cách
 function giu(b,xuong,len){var dang=0;function x(e){if(e)e.preventDefault();if(dang)return;dang=1;xuong()}function l(){if(!dang)return;dang=0;len()}
  b.addEventListener('pointerdown',x);b.addEventListener('pointerup',l);b.addEventListener('pointerleave',l);b.addEventListener('pointercancel',l);return {x:x,l:l}}

 // Thắp nhang: giữ để mồi lửa, thả khi đầu nhang đỏ đều (vạch xanh) thì khói lên thẳng · ba nén
 function nhang(){S.innerHTML='<svg class="cdg-vg" viewBox="0 0 240 240"><g class="cdg-khoi"><path d="M120 60c-10-12 10-20 0-34"/></g><rect x="116" y="78" width="8" height="120" rx="3" fill="#8A3B2B"/><circle cx="120" cy="76" r="7" class="cdg-dom"/>'+
   '<rect x="40" y="214" width="160" height="10" rx="5" class="cdg-th"/><rect x="155.2" y="214" width="28.8" height="10" rx="5" class="cdg-xanh"/><rect x="40" y="214" width="0" height="10" rx="5" class="cdg-lua"/></svg>'+nut('Giữ để mồi lửa');
  var lua=S.querySelector('.cdg-lua'),dom=S.querySelector('.cdg-dom'),khoi=S.querySelector('.cdg-khoi'),b=S.querySelector('.cdg-nut'),n=0,tong=0,t0=0,v=0;
  say('Giữ nút để mồi lửa, thả khi vạch lửa vào ô xanh · ba nén nhang');
  var dung=raf(function(now){if(t0){v=Math.min(1,(now-t0)/2200);if(v>=1)tha()}lua.setAttribute('width',160*v);dom.style.fill='rgb('+(120+135*v|0)+','+(60+40*v|0)+',40)'});
  function tha(){if(!t0)return;t0=0;var d=0;if(v<.72)say('Nhang chưa bén, mồi lại');else if(v<=.9){d=3;say('Khói hương lên thẳng','nt');khoi.classList.remove('len');void S.offsetWidth;khoi.classList.add('len')}else{d=1;say('Lửa bùng, phẩy nhẹ cho tắt')}
   if(v>=.72){n++;tong+=d;bay('+'+d)}v=0;if(n>=3){them=cong('nhang',tong);xong(tong,them,'Thắp thêm ba nén')}else if(v===0&&n)b.textContent='Giữ để mồi nén thứ '+(n+1)}
  var g=giu(b,function(){if(b.dataset.lai)return;t0=performance.now()},tha);b.addEventListener('click',function(){if(b.dataset.lai)lai(nhang)});
  return {phim:g.x,nha:g.l,dung:dung}}

 // Tĩnh tâm: giữ khi vòng tron nở (hít vào 4 giây), thả khi vòng thu (thở ra 6 giây)
 function thien(phut){if(!phut){S.innerHTML='<p class="cdg-chon">Ngồi tĩnh tâm trong</p><div class="cdg-phut">'+[1,2,3].map(function(p){return '<button type="button" class="cdg-nut" data-p="'+p+'">'+p+' phút</button>'}).join('')+'</div>';
   say('Hít vào khi vòng tron nở, thở ra khi vòng thu');S.querySelector('.cdg-phut').addEventListener('click',function(e){var b=e.target.closest('[data-p]');if(b)lai(function(){return thien(+b.dataset.p)})});return {dung:function(){}}}
  S.innerHTML='<svg class="cdg-vg" viewBox="0 0 240 240"><circle cx="120" cy="120" r="100" class="cdg-dich"/><circle cx="120" cy="120" r="50" class="cdg-tho"/><circle cx="120" cy="120" r="10" class="cdg-ta"/><text x="120" y="126" class="cdg-dem"></text></svg>'+nut('Giữ khi hít vào');
  var tho=S.querySelector('.cdg-tho'),ta=S.querySelector('.cdg-ta'),dem=S.querySelector('.cdg-dem'),b=S.querySelector('.cdg-nut'),C=10000,N=phut*6,t0=performance.now(),i=0,xg=-1,tg=0,tong=0,ok=0,ket=0;
  var dung=raf(function(now){if(ket)return;var t=now-t0,c=Math.floor(t/C),p=(t%C)/1000;
   if(c>i){danhGia();i=c;xg=-1;tg=0;if(i>=N){ket=1;var them=cong('thien',tong);xong(tong,them,'Ngồi thêm');dem.textContent=ok+'/'+N;return}}
   var r=p<4?50+50*p/4:100-50*(p-4)/6;tho.setAttribute('r',r);dem.textContent=p<4?'Hít vào':'Thở ra';
   if(xg>=0&&!tg)ta.setAttribute('r',Math.min(100,10+90*(t-i*C-xg)/4000))});
  function danhGia(){var dai=tg-xg;if(xg>=0&&xg<1200&&dai>3200&&dai<4800){ok++;tong+=2;bay('+2');say('Hơi thở đều','nt')}else say('Thả lỏng, theo vòng tron');ta.setAttribute('r',10)}
  var g=giu(b,function(){if(ket)return;xg=performance.now()-t0-i*C},function(){if(ket||xg<0)return;tg=performance.now()-t0-i*C});
  b.addEventListener('click',function(){if(b.dataset.lai)lai(thien)});
  return {phim:g.x,nha:g.l,dung:dung}}

 var TRO={chuong:chuong,lay:lay,nhang:nhang,thien:thien};
 function bang(tab){roll();var tot=ssMo.state().tot,M=tab==='w'?st.w:st.t,mo=tab==='w'?(st.w.mo||0):Math.max(0,tot-['nhang','chuong','lay','thien'].reduce(function(s,k){return s+(st.t[k]||0)},0)),
   R=['nhang','chuong','lay','thien','mo'].map(function(k){return [k,k==='mo'?mo:(M[k]||0)]}),mx=Math.max.apply(null,R.map(function(r){return r[1]}).concat([1])),s=R.reduce(function(a,r){return a+r[1]},0);
  var e=q('.cdg-b');e.innerHTML='<div class="mo-path-h"><b>Bảng công đức</b><button type="button" class="mo-path-x" aria-label="Đóng">×</button></div>'+
   '<div class="cdg-tab"><button type="button" data-tab="w" aria-pressed="'+(tab==='w')+'">Tuần này</button><button type="button" data-tab="t" aria-pressed="'+(tab!=='w')+'">Mọi lúc</button></div><ol class="cdg-ds">'+
   R.map(function(r){return '<li><span>'+esc(TEN[r[0]])+'</span><i style="--w:'+(r[1]/mx*100)+'%"></i><b>'+r[1].toLocaleString('vi-VN')+'</b></li>'}).join('')+'</ol>'+
   '<p class="cdg-tg">Tổng '+(tab==='w'?'tuần này':'')+': <b>'+s.toLocaleString('vi-VN')+'</b> công đức · '+esc(ssMo.LV[ssMo.lvOf(tot)][1])+'</p>'+
   '<p class="cdg-gc">Mỗi việc tối đa '+CAP+' công đức một ngày (Gõ mõ 1.080). Bảng xếp hạng cùng mọi người sẽ mở khi web có máy chủ.</p>';e.hidden=false}
 q('.cdg-bang').addEventListener('click',function(){bang('w')});
 q('.cdg-b').addEventListener('click',function(e){var t=e.target.closest('[data-tab]');if(t)bang(t.dataset.tab);if(e.target.closest('.mo-path-x'))q('.cdg-b').hidden=true});
 function close(){box.hidden=true;q('.cdg-b').hidden=true;if(cur){cur.dung();cur=null}}
 function open(k){if(!TRO[k])return;if(cur)cur.dung();tro=k;box.setAttribute('aria-label',TEN[k]);q('.cdg-b').hidden=true;box.hidden=false;dau();say('');cur=TRO[k]();
  setTimeout(function(){var b=S.querySelector('.cdg-nut');b&&b.focus()},60)}
 q('.mo-x').addEventListener('click',close);box.addEventListener('click',function(e){if(e.target===box)close()});
 document.addEventListener('keydown',function(e){if(box.hidden)return;if(e.key==='Escape')close();else if(e.key===' '&&cur&&cur.nha&&!e.repeat&&e.target.closest('.cdg-s'))cur.phim()});   // phím cách: chỉ tự xử lý nút giữ; nút bấm thường để trình duyệt tự bấm
 document.addEventListener('keyup',function(e){if(!box.hidden&&e.key===' '&&cur&&cur.nha)cur.nha()});
 // thắp nhang xong ở lễ đài (js/10) thì mời cắm ba nén; Công giáo là thắp nến, không có tro này
 addEventListener('ss-lit',function(){if(window.ssFaith!=='cg')setTimeout(function(){open('nhang')},4400)});
 window.ssCongDuc={open:open,close:close,ghi:ghi,state:function(){roll();return st}};
})();
