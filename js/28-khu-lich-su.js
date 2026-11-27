/* Làng chung: các khu lịch sử. ssLichSu('vua') gia phả các đời vua (data/lich-su.js), ssLichSu('bac') Chủ tịch Hồ Chí Minh, ssLichSu('tuong') các tướng (chủ dự án: tách riêng hai khu).
   Dùng khung bảng dưới .hos như Bản đồ làng (js/21). Mọi chữ qua esc(). */
(function(){
 var L=window.SS_LICHSU;if(!L)return;
 function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function nam(a){if(!a)return '';var x=a[0],y=a[1];return x==null&&y==null?'':(x==null?'?':x)+'–'+(y==null?'?':y)}
 var sh=document.createElement('div');sh.className='hos ls-sh';sh.hidden=true;sh.setAttribute('role','dialog');document.body.appendChild(sh);
 sh.addEventListener('click',function(e){if(e.target===sh||e.target.closest('.hos-x'))sh.hidden=true;var b=e.target.closest('[data-tr]');if(b){var s=b.parentNode;s.classList.toggle('mo');b.setAttribute('aria-expanded',s.classList.contains('mo'))}});
 document.addEventListener('keydown',function(e){if(!sh.hidden&&e.key==='Escape')sh.hidden=true});
 function dau(mau,kt,ten,phu){return '<div class="hos-h"><i style="background:'+mau+'">'+kt+'</i><div><b>'+esc(ten)+'</b><small>'+esc(phu)+'</small></div><button type="button" class="hos-x" aria-label="Đóng">×</button></div>'}
 function nguon(n){return n&&n.length?'<p class="ls-ng">Nguồn: '+n.map(function(x){return esc(x.ten)}).join(' · ')+'</p>':''}
 function vua(){var V=L.vua,ten={};V.trieu.forEach(function(t){(t.vua||[]).forEach(function(v){ten[v.id]=v.ten})});
  return dau('#9A6E22','♛','Gia phả các đời vua','Từ nhà Ngô (939) đến nhà Nguyễn (1945) · bấm từng triều để xem')+
   V.trieu.map(function(t){var n=(t.vua||[]).length;
    return '<div class="ls-tr'+(t.truyenThuyet?' tt':'')+'"><button type="button" data-tr aria-expanded="false"><b>'+esc(t.ten)+'</b><span>'+esc(nam(t.nam))+(t.kinhDo?' · '+esc(t.kinhDo):'')+(n?' · '+n+' vua':'')+'</span></button>'+
     '<div class="ls-in">'+(t.ghiChu?'<p class="ls-gc">'+esc(t.ghiChu)+'</p>':'')+'<ol>'+(t.vua||[]).map(function(v){
      var qh=v.cha&&ten[v.cha]?'Con '+ten[v.cha]:(v.quanHe||'');
      return '<li'+(v.cha?' class="con"':'')+'><b>'+esc(v.ten)+'</b>'+(v.hieu?' <em>'+esc(v.hieu)+'</em>':'')+'<span>'+esc(nam(v.nam))+(qh?' · '+esc(qh):'')+'</span>'+(v.ghiChu?'<small>'+esc(v.ghiChu)+'</small>':'')+'</li>'}).join('')+'</ol></div></div>'}).join('')+nguon(V.nguon)}
 function bac(){var T=L.tuong,b=T.bac;
  return dau('#9A3B2B','★','Chủ tịch Hồ Chí Minh','Tượng đài Bác giữa làng')+
   '<div class="ls-bac"><b>Chủ tịch '+esc(b.ten)+'</b><span>'+esc(nam(b.nam))+(b.queQuan?' · '+esc(b.queQuan):'')+'</span>'+(b.tenKhac&&b.tenKhac.length?'<small>Tên khác: '+esc(b.tenKhac.join(', '))+'</small>':'')+'<p>'+esc(b.tomTat)+'</p></div>'+nguon(b.nguon)}
 function tuong(){var T=L.tuong;
  return dau('#2F5D8A','✪','Các tướng','Tướng lĩnh, lãnh đạo tiêu biểu có công với cách mạng')+
   '<ul class="ls-tg">'+(T.nguoi||[]).map(function(p){
    return '<li><b>'+esc(p.ten)+'</b><span>'+esc([p.capBac,nam(p.nam),p.queQuan].filter(Boolean).join(' · '))+'</span>'+(p.congLao?'<small>'+esc(p.congLao)+'</small>':'')+'</li>'}).join('')+'</ul>'+nguon(T.nguon)}
 var TEN={vua:'Gia phả các đời vua',bac:'Chủ tịch Hồ Chí Minh',tuong:'Các tướng'},VE={vua:vua,bac:bac,tuong:tuong};
 window.ssLichSu=function(k){if(!VE[k])return;sh.setAttribute('aria-label',TEN[k]);sh.innerHTML='<div class="hos-c ls-c">'+VE[k]()+'</div>';sh.hidden=false;var c=sh.querySelector('.hos-c');if(c)c.scrollTop=0};
})();
