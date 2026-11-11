/* Bó hoa thiêng: việc đạo đức ở nhà thờ (lối Công giáo), chủ dự án duyệt 12/11/2026.
   Không tích điểm, không xếp hạng: mỗi việc thêm một bông hoa vào bó hoa dâng cho một người đã khuất (hoặc các linh hồn).
   Việc: Thắp nến (sau nghi thức js/10), Lần chuỗi Mân Côi + Ở lại với Chúa + Cầu cho các linh hồn (bàn thờ chính),
   Chuông Truyền Tin (giá chuông), Nước thánh và làm dấu Thánh giá (ngưỡng cửa). Mở bằng ssHoaThieng.open(...).
   Lời kinh, câu ngắm: theo bản thông dụng (Giáo phận Nha Trang, Giáo phận Lạng Sơn). Cần linh mục xem lại trước khi chính thức. */
(function(){
 var KEY='ss-hoa-thieng',LH={id:'cac-linh-hon',name:'Các linh hồn'};
 var HOA={nen:['Huệ trắng','#F6F1E4','Thắp nến'],chuc:['Hoa hồng','#E06A7E','Chục kinh Mân Côi'],chau:['Cúc trắng','#FFFFFF','Ở lại với Chúa'],
  chuong:['Lan tím','#B48AD8','Chuông Truyền Tin'],dau:['Hoa nhài','#FFF6C8','Làm dấu Thánh giá'],vieng:['Cúc vàng','#F2C14E','Cầu cho các linh hồn']};
 var KINH={
  lc:['Kinh Lạy Cha','Lạy Cha chúng con ở trên trời, chúng con nguyện danh Cha cả sáng, nước Cha trị đến, ý Cha thể hiện dưới đất cũng như trên trời. Xin Cha cho chúng con hôm nay lương thực hằng ngày, và tha nợ chúng con, như chúng con cũng tha kẻ có nợ chúng con. Xin chớ để chúng con sa chước cám dỗ, nhưng cứu chúng con cho khỏi sự dữ. Amen.'],
  km:['Kinh Kính Mừng','Kính mừng Maria đầy ơn phúc, Đức Chúa Trời ở cùng Bà, Bà có phúc lạ hơn mọi người nữ, và Giêsu con lòng Bà gồm phúc lạ. Thánh Maria Đức Mẹ Chúa Trời, cầu cho chúng con là kẻ có tội, khi nay và trong giờ lâm tử. Amen.'],
  sd:['Kinh Sáng Danh','Sáng danh Đức Chúa Cha, và Đức Chúa Con, và Đức Chúa Thánh Thần. Như đã có trước vô cùng, và bây giờ, và hằng có, và đời đời chẳng cùng. Amen.'],
  lh:['Kinh cầu cho các linh hồn','Lạy Chúa, xin cho các linh hồn được nghỉ ngơi đời đời, và được sáng soi vô cùng. Lại xin cho các linh hồn được lên thiên đàng hưởng phúc thanh nhàn. Amen.']};
 var MN={vui:['Năm sự Vui',[['Thiên thần truyền tin cho Đức Bà chịu thai','Ta hãy xin cho được ở khiêm nhường'],['Đức Bà đi viếng bà thánh Isave','Ta hãy xin cho được lòng yêu người'],['Đức Bà sinh Đức Chúa Giêsu nơi hang đá','Ta hãy xin cho được lòng khó khăn'],['Đức Bà dâng Đức Chúa Giêsu trong đền thánh','Ta hãy xin cho được vâng lời chịu lụy'],['Đức Bà tìm được Đức Chúa Giêsu trong đền thánh','Ta hãy xin cho được giữ nghĩa cùng Chúa luôn']]],
  sang:['Năm sự Sáng',[['Đức Chúa Giêsu chịu phép Rửa tại sông Gio-đan','Ta hãy xin cho được sống xứng đáng là con Thiên Chúa'],['Đức Chúa Giêsu làm phép lạ tại tiệc cưới Cana','Ta hãy xin cho được noi gương Đức Mẹ mà vững tin vào Chúa'],['Đức Chúa Giêsu rao giảng Nước Trời và kêu gọi sám hối','Ta hãy xin cho được siêng năng lãnh nhận Bí tích Giao hòa'],['Đức Chúa Giêsu biến hình trên núi','Ta hãy xin cho được biến đổi nhờ Chúa Thánh Thần'],['Đức Chúa Giêsu lập Bí tích Thánh Thể','Ta hãy xin cho được siêng năng tham dự Thánh lễ và rước Mình Máu Thánh Người']]],
  thuong:['Năm sự Thương',[['Đức Chúa Giêsu lo buồn đổ mồ hôi máu','Ta hãy xin cho được ăn năn tội nên'],['Đức Chúa Giêsu chịu đánh đòn','Ta hãy xin cho được hãm mình chịu khó bằng lòng'],['Đức Chúa Giêsu chịu đội mão gai','Ta hãy xin cho được chịu mọi sự sỉ nhục bằng lòng'],['Đức Chúa Giêsu vác cây Thánh giá','Ta hãy xin cho được vác Thánh giá theo chân Chúa'],['Đức Chúa Giêsu chịu chết trên cây Thánh giá','Ta hãy xin đóng đanh tính xác thịt vào Thánh giá Chúa']]],
  mung:['Năm sự Mừng',[['Đức Chúa Giêsu sống lại','Ta hãy xin cho được sống lại thật về phần linh hồn'],['Đức Chúa Giêsu lên trời','Ta hãy xin cho được ái mộ những sự trên trời'],['Đức Chúa Thánh Thần hiện xuống','Ta hãy xin cho được lòng đầy rẫy mọi ơn Đức Chúa Thánh Thần'],['Đức Chúa Trời cho Đức Bà lên trời','Ta hãy xin ơn chết lành trong tay Đức Mẹ'],['Đức Chúa Trời thưởng Đức Mẹ trên trời','Ta hãy xin Đức Mẹ phù hộ cho ta được thưởng cùng Đức Mẹ trên nước thiên đàng']]]};
 var NGAY=['mung','vui','thuong','mung','sang','thuong','vui'];   // CN..T7: Thứ Hai, Bảy sự Vui · Ba, Sáu sự Thương · Tư, CN sự Mừng · Năm sự Sáng
 var THU=['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'],THUTU=['nhất','hai','ba','bốn','năm'];
 // shortcut: lưu trong trình duyệt từng người; gia đình xem chung bó hoa cần máy chủ
 function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
 var st=load();st.p=st.p||{};st.mc=st.mc||{};
 function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
 function ngay(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function nguoi(){var L=(window.ssPerson?ssPerson.all():[]).map(function(p){return {id:p.id,name:p.name}});return L.concat([LH])}
 function ai(){var L=nguoi(),id=st.chon||(window.ssPerson&&ssPerson.get()&&ssPerson.get().id)||LH.id;return L.filter(function(p){return p.id===id})[0]||LH}
 function dang(k){var p=ai(),b=st.p[p.id]=st.p[p.id]||{};b[k]=(b[k]||0)+1;save();ve();veTrang();return p}
 function tong(b){var n=0;for(var k in b)n+=b[k];return n}
 // bó hoa: tối đa 15 bông theo tỉ lệ từng việc
 function bo(b,cl){var n=tong(b||{}),ds=[];for(var k in HOA)for(var i=0;i<((b||{})[k]||0);i++)ds.push(k);
  if(ds.length>15){var r=[];for(var j=0;j<15;j++)r.push(ds[Math.floor(j*ds.length/15)]);ds=r}
  var h='<svg viewBox="0 0 120 120" class="'+(cl||'bht-bo')+'" aria-hidden="true"><path d="M52 118l8-48 8 48z" fill="#6E9B58"/><path d="M44 112q16-10 32 0l-6 6H50z" fill="#E9D7B0"/>';
  ds.forEach(function(k,i){var a=(i/Math.max(1,ds.length-1)-.5)*2.4,rr=18+(i%3)*12,x=60+Math.sin(a)*rr,y=62-Math.cos(a)*rr*.9;
   h+='<path d="M60 76L'+x.toFixed(1)+' '+y.toFixed(1)+'" stroke="#6E9B58" stroke-width="1.5"/><g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')">'+
    [0,72,144,216,288].map(function(r){return '<ellipse rx="4" ry="7" cy="-5" fill="'+HOA[k][1]+'" stroke="rgba(0,0,0,.18)" stroke-width=".6" transform="rotate('+r+')"/>'}).join('')+'<circle r="2.6" fill="#E8B04A"/></g>'});
  if(!n)h+='<text x="60" y="52" text-anchor="middle" font-size="9" fill="currentColor" opacity=".6">chưa có hoa</text>';
  return h+'</svg>'}

 var box=document.createElement('div');box.className='mo bht';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
 box.innerHTML='<div class="mo-card"><button class="mo-x" type="button" aria-label="Đóng">×</button>'+
  '<div class="bht-h"><span class="bht-mini"></span><div><b class="bht-t"></b><label class="bht-ai">Dâng cho <select></select></label></div></div>'+
  '<div class="bht-s"></div><div class="mo-tip bht-tip" aria-live="polite"></div></div>';
 document.body.appendChild(box);
 var q=function(c){return box.querySelector(c)},S=q('.bht-s'),tip=q('.bht-tip'),cur=null,viec='';
 function say(t,c){tip.textContent=t||'';tip.className='mo-tip bht-tip'+(c?' '+c:'')}
 function ve(){var p=ai(),b=st.p[p.id]||{};q('.bht-mini').innerHTML=bo(b,'bht-mi');
  q('.bht-ai select').innerHTML=nguoi().map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===p.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')}
 q('.bht-ai select').addEventListener('change',function(e){st.chon=e.target.value;save();ve()});
 function nut(t,cls){return '<button type="button" class="cdg-nut'+(cls?' '+cls:'')+'">'+t+'</button>'}
 function xong(k,lai){var p=dang(k);say('Đã dâng một bông '+HOA[k][0].toLowerCase()+' cho '+p.name,'nt');var b=S.querySelector('.cdg-nut');if(b){b.textContent=lai;setTimeout(function(){b.dataset.lai='1'},400)}}
 function raf(f){var id,go=function(n){f(n);id=requestAnimationFrame(go)};id=requestAnimationFrame(go);return function(){cancelAnimationFrame(id)}}
 function giu(b,xuong,len){var dg=0;function x(e){if(e)e.preventDefault();if(dg)return;dg=1;xuong()}function l(){if(!dg)return;dg=0;len()}
  b.addEventListener('pointerdown',x);b.addEventListener('pointerup',l);b.addEventListener('pointerleave',l);b.addEventListener('pointercancel',l);return {x:x,l:l}}
 function lai(f){if(cur&&cur.dung)cur.dung();cur=f();var b=S.querySelector('.cdg-nut');b&&b.focus()}

 // Thắp nến: giữ để bấc bén lửa, thả khi vạch vào ô xanh thì nến cháy đứng
 function nen(){S.innerHTML='<svg class="cdg-vg" viewBox="0 0 240 240"><g class="bht-lua" opacity="0"><ellipse cx="120" cy="62" rx="9" ry="20" fill="#FFD27A"/><ellipse cx="120" cy="68" rx="4" ry="9" fill="#fff"/></g>'+
   '<rect x="104" y="84" width="32" height="112" rx="5" fill="#F6F1E4"/><path d="M120 84v-8" stroke="#3A2A1A" stroke-width="2"/><rect x="40" y="214" width="160" height="10" rx="5" class="cdg-th"/><rect x="155.2" y="214" width="28.8" height="10" rx="5" class="cdg-xanh"/><rect x="40" y="214" width="0" height="10" rx="5" class="cdg-lua"/></svg>'+nut('Giữ để mồi lửa');
  var vach=S.querySelector('.cdg-lua'),lua=S.querySelector('.bht-lua'),b=S.querySelector('.cdg-nut'),t0=0,v=0,ok=0;say('Giữ nút để bấc bén lửa, thả khi vạch vào ô xanh');
  var dung=raf(function(now){if(t0){v=Math.min(1,(now-t0)/2200);if(v>=1)tha()}vach.setAttribute('width',160*v);if(ok)lua.setAttribute('transform','translate(120 82) scale('+(1+Math.sin(now/180)*.04)+') translate(-120 -82)')});
  function tha(){if(!t0)return;t0=0;if(v<.72)say('Bấc chưa bén, mồi lại');else if(v<=.9){ok=1;lua.setAttribute('opacity','1');xong('nen','Thắp thêm cây nến')}else say('Lửa bùng mạnh quá, mồi lại nhẹ tay hơn');v=0}
  var g=giu(b,function(){if(b.dataset.lai||ok)return;t0=performance.now()},tha);b.addEventListener('click',function(){if(b.dataset.lai)lai(nen)});return {phim:g.x,nha:g.l,dung:dung}}

 // Lần chuỗi Mân Côi: một chục = 1 Lạy Cha, 10 Kính Mừng, 1 Sáng Danh; mầu nhiệm theo ngày trong tuần
 function chuc(){var d=new Date();if(st.mc.d!==ngay()){st.mc={d:ngay(),n:0};save()}
  var bo5=MN[NGAY[d.getDay()]],i=st.mc.n%5,mn=bo5[1][i],SEQ=['lc','km','km','km','km','km','km','km','km','km','km','sd'],k=0,tL=performance.now(),hien=st.hien!==0;
  var hat='';for(var j=0;j<10;j++){var a=(j/10)*Math.PI*1.6+Math.PI*1.2;hat+='<circle cx="'+(120+Math.cos(a)*84).toFixed(1)+'" cy="'+(112+Math.sin(a)*84).toFixed(1)+'" r="9" class="bht-hat" data-h="'+(j+1)+'"/>'}
  S.innerHTML='<p class="bht-mn"><small>'+esc(THU[d.getDay()])+' · '+esc(bo5[0])+' · chục '+(i+1)+'/5</small><b>Thứ '+THUTU[i]+' thì ngắm: '+esc(mn[0])+'.</b><span>'+esc(mn[1])+'.</span></p>'+
   '<svg class="cdg-vg bht-chuoi" viewBox="0 0 240 230">'+hat+'<circle cx="120" cy="198" r="13" class="bht-hat to" data-h="0"/><path d="M120 211v14M113 218h14" stroke="#E8BE5A" stroke-width="3"/></svg>'+
   '<div class="bht-kinh"><b></b><p></p></div><label class="bht-hien"><input type="checkbox"'+(hien?' checked':'')+'> Hiện lời kinh</label>'+nut('Đọc xong, sang hạt kế');
  var b=S.querySelector('.cdg-nut'),K=S.querySelector('.bht-kinh');
  function hienKinh(){var x=KINH[SEQ[k]];K.querySelector('b').textContent=x[0]+(SEQ[k]==='km'?' ('+k+'/10)':'');K.querySelector('p').textContent=x[1];K.querySelector('p').hidden=!hien;
   S.querySelectorAll('.bht-hat').forEach(function(h){var n=+h.dataset.h,cur2=SEQ[k]==='lc'?0:SEQ[k]==='km'?k:11;h.classList.toggle('xong',n<cur2||(SEQ[k]==='sd'));h.classList.toggle('dang',n===cur2)})}
  S.querySelector('.bht-hien input').addEventListener('change',function(e){hien=e.target.checked;st.hien=hien?1:0;save();hienKinh()});
  b.addEventListener('click',function(){if(b.dataset.lai)return lai(chuc);var now=performance.now(),can={lc:6000,km:5000,sd:4000}[SEQ[k]];
   if(now-tL<can){say('Đọc chậm lại một chút, kinh nguyện không cần vội');return}say('');tL=now;k++;
   if(k>=SEQ.length){st.mc.n++;save();k=SEQ.length-1;hienKinh();S.querySelectorAll('.bht-hat').forEach(function(h){h.classList.add('xong')});xong('chuc',st.mc.n%5?'Lần chục kế tiếp':'Lần lại từ chục thứ nhất');if(st.mc.n%5===0)say('Đã lần trọn năm chục · đã dâng một bông hoa hồng','nt');return}
   hienKinh()});
  hienKinh();return {}}

 // Ở lại với Chúa: quỳ thinh lặng, thở theo vòng tròn; không chấm điểm
 function chau(phut){if(!phut){S.innerHTML='<p class="cdg-chon">Quỳ thinh lặng trước bàn thờ trong</p><div class="cdg-phut">'+[1,2,3].map(function(p){return '<button type="button" class="cdg-nut" data-p="'+p+'">'+p+' phút</button>'}).join('')+'</div>';
   say('Thở chậm theo vòng tròn, để lòng lắng lại');S.querySelector('.cdg-phut').addEventListener('click',function(e){var x=e.target.closest('[data-p]');if(x)lai(function(){return chau(+x.dataset.p)})});return {}}
  var p=ai(),CAU=['Lạy Chúa, con ở đây.','Xin Chúa nhớ đến '+p.name+'.','Lạy Chúa, xin cho các linh hồn được nghỉ ngơi đời đời.','Xin cho con biết sống bình an và yêu thương.','Lạy Chúa, con tín thác vào Chúa.'];
  S.innerHTML='<svg class="cdg-vg" viewBox="0 0 240 240"><circle cx="120" cy="120" r="100" class="cdg-dich"/><circle cx="120" cy="120" r="50" class="cdg-tho"/><text x="120" y="126" class="cdg-dem"></text></svg><p class="bht-cau"></p>'+nut('Kết thúc sớm','phu');
  var tho=S.querySelector('.cdg-tho'),dem=S.querySelector('.cdg-dem'),cau=S.querySelector('.bht-cau'),b=S.querySelector('.cdg-nut'),t0=performance.now(),T=phut*60000,het=0;
  function ket(){if(het)return;het=1;b.classList.remove('phu');xong('chau','Ở lại thêm');dem.textContent='Amen'}
  var dung=raf(function(now){if(het)return;var t=now-t0;if(t>=T)return ket();var p2=(t%10000)/1000;tho.setAttribute('r',p2<4?50+50*p2/4:100-50*(p2-4)/6);dem.textContent=p2<4?'Hít vào':'Thở ra';
   var c=CAU[Math.floor(t/12000)%CAU.length];if(cau.textContent!==c)cau.textContent=c});
  b.addEventListener('click',function(){if(b.dataset.lai)return lai(chau);if(!het&&performance.now()-t0>20000)ket();else if(!het){dung();lai(chau)}});return {dung:dung}}

 // Chuông Truyền Tin: 3 tiếng · nghỉ · 3 tiếng · nghỉ · 3 tiếng · nghỉ · 9 tiếng
 function chuong(){var NH=[3,3,3,9],h=0,n=0,tL=0,nghi=0;
  S.innerHTML='<div class="bht-nhip">'+NH.map(function(c,i){var s='';for(var j=0;j<c;j++)s+='<i></i>';return '<span data-i="'+i+'">'+s+'</span>'}).join('')+'</div>'+
   '<svg class="cdg-vg" viewBox="0 0 240 200"><path class="cdg-chuong" d="M120 30c-24 0-36 20-36 44v28l-12 14h96l-12-14V74c0-24-12-44-36-44zM110 126a10 10 0 0 0 20 0"/></svg>'+nut('Rung chuông');
  var b=S.querySelector('.cdg-nut');say('Rung ba tiếng, nghỉ, ba tiếng, nghỉ, ba tiếng, nghỉ, rồi chín tiếng liền');
  function to(){S.querySelectorAll('.bht-nhip span').forEach(function(s,i){s.querySelectorAll('i').forEach(function(x,j){x.classList.toggle('on',i<h||(i===h&&j<n))});s.classList.toggle('dang',i===h)})}
  b.addEventListener('click',function(){if(b.dataset.lai)return lai(chuong);var now=performance.now();
   if(nghi&&now-tL<2200){say('Nghỉ một chút giữa hai hồi chuông');return}
   if(!nghi&&n&&now-tL<700){say('Chậm lại, để từng tiếng chuông ngân');return}
   nghi=0;tL=now;window.ssBell&&ssBell();dispatchEvent(new Event('ss-chuong-tt'));var c=S.querySelector('.cdg-chuong');c.classList.remove('rung');void S.offsetWidth;c.classList.add('rung');n++;
   if(n>=NH[h]){h++;n=0;if(h>=NH.length){to();xong('chuong','Rung lại từ đầu');return}nghi=1;say(h<3?'Nghỉ một chút rồi rung hồi thứ '+(h+1):'Nghỉ một chút rồi rung chín tiếng liền')}else say('');to()});
  to();return {}}

 // Nước thánh: chấm nước thánh rồi làm dấu Thánh giá: trán, ngực, vai trái, vai phải
 function dau(){var B=[['bat','Chấm tay vào nước thánh',120,212],['tran','Nhân danh Cha',120,44],['nguc','và Con',120,148],['trai','và Thánh',78,116],['phai','Thần',162,116]],k=0;
  S.innerHTML='<svg class="cdg-vg bht-nguoi" viewBox="0 0 240 240"><circle cx="120" cy="46" r="28" class="bht-than"/><path d="M56 200c0-56 24-102 64-102s64 46 64 102z" class="bht-than"/><ellipse cx="120" cy="214" rx="36" ry="10" fill="#9FC9D9" opacity=".8"/>'+
   '<text x="44" y="120" class="bht-nho">trái</text><text x="196" y="120" class="bht-nho">phải</text>'+
   B.map(function(x,i){return '<circle cx="'+x[2]+'" cy="'+x[3]+'" r="15" class="bht-dau" data-i="'+i+'" tabindex="0" role="button" aria-label="'+x[1]+'"/>'}).join('')+'<path class="bht-vet" fill="none"/></svg><p class="bht-loi"></p>';
  var loi=S.querySelector('.bht-loi'),vet=S.querySelector('.bht-vet'),dd='';say('Nhìn từ sau lưng: trái, phải là của chính bạn');
  function to(){S.querySelectorAll('.bht-dau').forEach(function(c){var i=+c.dataset.i;c.classList.toggle('xong',i<k);c.classList.toggle('dang',i===k)});loi.textContent=B.slice(1,k).map(function(x){return x[1]}).join(', ').replace(', Thần',' Thần')+(k>4?'. Amen.':'')}
  function cham(i){if(k>4)return;if(i!==k){say('Theo thứ tự: '+B[k][1].toLowerCase());return}if(k>0){dd+=(dd?' L':'M')+B[k][2]+' '+B[k][3];vet.setAttribute('d',dd)}k++;to();
   if(k>4){say('');setTimeout(function(){S.insertAdjacentHTML('beforeend',nut('Làm dấu lại'));var b=S.querySelector('.cdg-nut');b.addEventListener('click',function(){if(b.dataset.lai)lai(dau)});xong('dau','Làm dấu lại')},300)}}
  S.querySelector('svg').addEventListener('click',function(e){var c=e.target.closest('.bht-dau');if(c)cham(+c.dataset.i)});
  S.querySelector('svg').addEventListener('keydown',function(e){var c=e.target.closest('.bht-dau');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();cham(+c.dataset.i)}});
  to();return {}}

 // Cầu cho các linh hồn: đọc kinh rồi dâng
 function vieng(){var p=ai();S.innerHTML='<div class="bht-kinh"><b>'+esc(KINH.lh[0])+'</b><p>'+esc(KINH.lh[1])+'</p></div><p class="bht-cau">Xin nhớ đến '+esc(p.name)+' và các linh hồn đã qua đời.</p>'+nut('Đọc xong');
  var b=S.querySelector('.cdg-nut'),t0=performance.now();b.addEventListener('click',function(){if(b.dataset.lai)return lai(vieng);if(performance.now()-t0<5000){say('Đọc chậm lại một chút');return}xong('vieng','Đọc lại')});return {}}

 // bàn thờ chính: chọn việc
 function banTho(){var nov=new Date().getMonth()===10;
  S.innerHTML=(nov?'<p class="bht-thang">Tháng 11 · tháng cầu cho các linh hồn</p>':'')+'<div class="bht-chon">'+
   [['chuc','Lần chuỗi Mân Côi','Một chục kinh · '+MN[NGAY[new Date().getDay()]][0]],['chau','Ở lại với Chúa','Quỳ thinh lặng 1 đến 3 phút'],['vieng','Cầu cho các linh hồn','Kinh cầu cho người đã qua đời']].map(function(x){
    return '<button type="button" data-v="'+x[0]+'"><i style="--c:'+HOA[x[0]][1]+'"></i><b>'+x[1]+'</b><small>'+x[2]+'</small></button>'}).join('')+'</div>';
  say('Mỗi việc thêm một bông hoa vào bó hoa thiêng');S.querySelector('.bht-chon').addEventListener('click',function(e){var x=e.target.closest('[data-v]');if(x)mo(x.dataset.v)});return {}}

 var VIEC={'ban-tho':[banTho,'Bàn thờ chính'],nen:[nen,'Thắp nến'],chuc:[chuc,'Lần chuỗi Mân Côi'],chau:[chau,'Ở lại với Chúa'],chuong:[chuong,'Chuông Truyền Tin'],dau:[dau,'Nước thánh'],vieng:[vieng,'Cầu cho các linh hồn']};
 function mo(k){if(!VIEC[k])return;if(cur&&cur.dung)cur.dung();viec=k;q('.bht-t').textContent=VIEC[k][1];box.setAttribute('aria-label',VIEC[k][1]);ve();say('');box.hidden=false;cur=VIEC[k][0]();
  setTimeout(function(){var b=S.querySelector('.cdg-nut,.bht-chon button,.bht-dau');b&&b.focus()},60)}
 function dong(){box.hidden=true;if(cur&&cur.dung)cur.dung();cur=null}
 q('.mo-x').addEventListener('click',dong);box.addEventListener('click',function(e){if(e.target===box)dong()});
 document.addEventListener('keydown',function(e){if(box.hidden)return;if(e.key==='Escape')dong();else if(e.key===' '&&cur&&cur.nha&&!e.repeat&&e.target.closest('.bht-s'))cur.phim()});
 document.addEventListener('keyup',function(e){if(!box.hidden&&e.key===' '&&cur&&cur.nha)cur.nha()});
 addEventListener('ss-lit',function(){if(window.ssFaith==='cg')setTimeout(function(){mo('nen')},4400)});

 // bó hoa trên trang hồ sơ người đã khuất
 function veTrang(){var a=document.getElementById('incBtn'),p=window.ssPerson&&ssPerson.get();if(!a||!p)return;var w=document.getElementById('bhtTrang');
  if(!w){w=document.createElement('div');w.id='bhtTrang';w.className='bht-trang';(a.closest('.lm-actions')||a.parentNode).insertAdjacentElement('afterend',w)}
  var b=st.p[p.id]||{},n=tong(b);w.hidden=!n&&window.ssFaith!=='cg';
  w.innerHTML=bo(b,'bht-bo')+'<div><b>Bó hoa thiêng</b><small>'+(n?Object.keys(HOA).filter(function(k){return b[k]}).map(function(k){return b[k]+' × '+HOA[k][2]}).join(' · '):'Chưa có lời nguyện nào. Ghé nhà thờ để dâng hoa cho '+esc(p.name)+'.')+'</small></div>'}
 addEventListener('ss-person',veTrang);setTimeout(veTrang,0);
 // tháng 11: nhắc một lần mỗi ngày khi vào nhà thờ
 function nhac(){if(window.ssFaith!=='cg'||new Date().getMonth()!==10||st.nhac===ngay())return;var h=document.getElementById('hall');if(!h||h.hidden||h.dataset.ws!=='tho')return;
  st.nhac=ngay();save();window.toast&&toast('Tháng 11, tháng cầu cho các linh hồn · ghé bàn thờ chính để dâng hoa thiêng')}
 setInterval(nhac,4000);
 window.ssHoaThieng={open:mo,close:dong,state:function(){return st}};
})();
