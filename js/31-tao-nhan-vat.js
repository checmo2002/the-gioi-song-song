/* Tạo nhân vật: dáng, tóc, mặt, da, áo, quần + màu. Hình 3D: img/3d/nv/TuyChinh.json (tools/blender/nv-tuy-chinh.py), vẽ ở js/26.
   Lưu một chuỗi ngắn trong localStorage 'ss-nv-tc' (gửi kèm vị trí cho người khác thấy):
   dáng.tóc.mặt.áo.quần.màu-da.màu-tóc.màu-áo.màu-quần   ví dụ "nam.ngan.1.somi.dai.e7b896.1b1411.f4f1ea.2b2b2e"
   ssNV.mo(batBuoc, xong): mở màn tạo; batBuoc = không có nút đóng (lần đầu vào Song Song). */
(function(){
 var K='ss-nv-tc';
 var CHON={
  d:[['nam','Nam'],['nu','Nữ']],
  toc:[['ngan','Ngắn'],['cua','Húi cua'],['mai','Mái lệch'],['dai','Dài'],['bui','Búi'],['duoi','Buộc đuôi'],['bob','Ngang cằm']],
  mat:[['1','Tươi tắn'],['2','Hiền hoà'],['3','Cười híp mắt'],['4','Má hồng']],
  ao:[['thun','Áo thun'],['somi','Sơ mi'],['baba','Bà ba'],['dai','Áo dài'],['khoac','Áo khoác']],
  quan:[['dai','Quần dài'],['ngan','Quần ngắn'],['rong','Quần ống rộng'],['vay','Váy']]};
 var MAU={
  da:[['f3d2b3','Trắng hồng'],['e7b896','Vàng nhạt'],['d29a73','Bánh mật'],['b07a55','Ngăm'],['8a5a3c','Nâu']],
  mt:[['1b1411','Đen'],['3a2618','Nâu đen'],['6b4226','Nâu'],['8a8580','Muối tiêu'],['d8d4cc','Bạc']],
  ma:[['f4f1ea','Trắng'],['4a6fa5','Xanh lam'],['8b5e3c','Nâu'],['b23a3a','Đỏ'],['5b7f4f','Xanh lá'],['d9b45a','Vàng'],['7a5c8f','Tím'],['2b2b2e','Đen']],
  mq:[['2b2b2e','Đen'],['2f3b52','Xanh than'],['6a4a35','Nâu'],['efece4','Trắng'],['8d8d8d','Ghi'],['4a6fa5','Xanh lam']]};
 var THU=['d','toc','mat','ao','quan','da','mt','ma','mq'];
 function co(ds,v){for(var i=0;i<ds.length;i++)if(ds[i][0]===v)return true;return false}
 // đọc chuỗi kiểu dáng (của mình hoặc người khác gửi tới): sai thì null
 function doc(s){if(typeof s!=='string'||s.length>80)return null;var a=s.split('.');if(a.length!==9)return null;var c={};
  for(var i=0;i<9;i++){var k=THU[i],v=a[i];if(i<5){if(!co(CHON[k],v))return null;c[k]=v}else{if(!/^[0-9a-f]{6}$/.test(v))return null;c[k]='#'+v}}return c}
 function viet(c){return THU.map(function(k){return String(c[k]).replace('#','')}).join('.')}
 function get(){try{var s=localStorage.getItem(K)||'';return doc(s)?s:''}catch(e){return ''}}
 function ngauNhien(d){function r(ds){return ds[Math.floor(Math.random()*ds.length)][0]}d=d||r(CHON.d);var nu=d==='nu';
  return {d:d,toc:nu?r([['dai'],['bui'],['duoi'],['bob']]):r([['ngan'],['cua'],['mai']]),mat:r(CHON.mat),ao:nu?r([['baba'],['dai'],['somi'],['thun']]):r([['somi'],['thun'],['khoac'],['baba']]),
   quan:nu?r([['dai'],['vay'],['rong']]):r([['dai'],['ngan']]),da:r(MAU.da),mt:r(MAU.mt.slice(0,3)),ma:r(MAU.ma),mq:r(MAU.mq)}}
 window.ssNVTC={doc:doc,CHON:CHON,MAU:MAU};

 var el=null,cv=null,xem=null,c=null,tab='d',xongCb=null,truoc=null;
 var TAB=[['d','Dáng'],['toc','Tóc'],['mat','Mặt'],['ao','Áo'],['quan','Quần']],MAUTAB={toc:['mt','Màu tóc'],mat:['da','Màu da'],ao:['ma','Màu áo'],quan:['mq','Màu quần']};
 function nut(ds,k){return '<div class="tnv-chon" role="group">'+ds.map(function(o){return '<button type="button" data-k="'+k+'" data-v="'+o[0]+'" aria-pressed="'+(c[k]===o[0])+'">'+esc(o[1])+'</button>'}).join('')+'</div>'}
 function mau(k,ten){return '<h4>'+ten+'</h4><div class="tnv-mau" role="group" aria-label="'+ten+'">'+MAU[k].map(function(o){return '<button type="button" data-k="'+k+'" data-v="'+o[0]+'" aria-pressed="'+(c[k]===o[0])+'" aria-label="'+esc(o[1])+'" title="'+esc(o[1])+'" style="--m:#'+o[0]+'"></button>'}).join('')+'</div>'}
 function esc(s){return String(s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
 function ve(){el.querySelector('.tnv-tab').innerHTML=TAB.map(function(t){return '<button type="button" role="tab" data-tab="'+t[0]+'" aria-selected="'+(tab===t[0])+'">'+t[1]+'</button>'}).join('');
  el.querySelector('.tnv-bang').innerHTML=nut(CHON[tab],tab)+(MAUTAB[tab]?mau(MAUTAB[tab][0],MAUTAB[tab][1]):'');
  if(xem)xem.doi(viet(c))}
 function dung(){
  el=document.createElement('div');el.id='taoNV';el.className='tnv';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','tnvTieuDe');
  el.innerHTML='<div class="tnv-hop"><div class="tnv-xem"><canvas aria-label="Xem trước nhân vật, kéo để xoay"></canvas><p class="tnv-goi">Kéo để xoay</p></div>'+
   '<div class="tnv-ben"><header><h2 id="tnvTieuDe">Nhân vật của bạn</h2><p>Nhân vật này đi cùng bạn trong Song Song, người cùng viếng sẽ thấy.</p><button type="button" class="tnv-dong" aria-label="Đóng">×</button></header>'+
   '<div class="tnv-tab" role="tablist"></div><div class="tnv-bang" role="tabpanel"></div>'+
   '<footer><button type="button" class="tnv-nn">Ngẫu nhiên</button><button type="button" class="tnv-xong">Xong</button></footer></div></div>';
  document.body.appendChild(el);cv=el.querySelector('canvas');
  el.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
   if(b.dataset.tab){tab=b.dataset.tab;ve();var t=el.querySelector('[data-tab="'+tab+'"]');t&&t.focus();return}
   if(b.dataset.k){c[b.dataset.k]=b.dataset.v;if(b.dataset.k==='d'){var m=ngauNhien(c.d);if(c.d==='nu'&&['ngan','cua','mai'].indexOf(c.toc)>=0)c.toc=m.toc;if(c.d==='nam'&&['dai','bui','duoi','bob'].indexOf(c.toc)>=0)c.toc=m.toc}ve();return}
   if(b.classList.contains('tnv-nn')){c=ngauNhien();ve();return}
   if(b.classList.contains('tnv-xong')){luu();return}
   if(b.classList.contains('tnv-dong'))dong()});
  el.addEventListener('keydown',function(e){if(e.key==='Escape'&&!el.classList.contains('bat-buoc'))dong();
   if(e.key==='Tab'){var f=[].slice.call(el.querySelectorAll('button:not([hidden])')).filter(function(x){return x.offsetParent});if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
 }
 function luu(){var s=viet(c);try{localStorage.setItem(K,s)}catch(e){}   // shortcut: một nhân vật cho cả máy, chưa gắn theo tài khoản; đổi khi có máy chủ tài khoản
  dong(true);window.toast&&toast('Đã lưu nhân vật của bạn.');dispatchEvent(new CustomEvent('ss-nv',{detail:s}))}
 function dong(daLuu){if(!el||el.hidden)return;if(el.classList.contains('bat-buoc')&&!daLuu)return;el.hidden=true;document.body.style.overflow='';if(xem){xem.dung();xem=null;var m=cv.cloneNode();cv.replaceWith(m);cv=m}
  truoc&&truoc.focus&&truoc.focus();var f=xongCb;xongCb=null;f&&f()}
 function mo(batBuoc,xong){if(!el)dung();truoc=document.activeElement;xongCb=xong||null;c=doc(get())||ngauNhien();tab='d';
  el.classList.toggle('bat-buoc',!!batBuoc);el.querySelector('.tnv-dong').hidden=!!batBuoc;el.hidden=false;document.body.style.overflow='hidden';
  try{xem=window.ss3dNV?ss3dNV(cv):null}catch(e){xem=null}el.classList.toggle('khong-3d',!xem);ve();setTimeout(function(){var t=el.querySelector('[aria-selected="true"]');t&&t.focus()},50)}
 window.ssNV={get:get,mo:mo};
})();
