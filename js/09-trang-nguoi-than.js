/* Trang Người thân + chỉ hỏi đăng nhập khi cần lưu */
(function(){
 var COL={ls:'#8B3A1E',tb:'#2F5D8A',dh:'#4E7A3A',nt:'#7A4A8C'};
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function gio(p){var f=(p.facts||[]).filter(function(x){return /giỗ/i.test(x[0])})[0];if(!f)return '';var m=/(\d+)\s*tháng\s*(\d+)/.exec(f[1]);return m?m[1]+'/'+m[2]+(/âm/i.test(f[1])?' ÂL':''):''}
 function render(){var g=document.getElementById('ntGrid');if(!g||!window.ssPerson)return;var cur=ssPerson.get();
  g.innerHTML=ssPerson.all().map(function(p){var ini=(p.name||'?').trim().split(/\s+/).pop()[0]||'?',gi=gio(p);
   return '<button type="button" class="nt-card" title="'+esc((p.title||'')+' · '+(p.place||''))+'" data-pid="'+esc(p.id)+'"'+(cur&&cur.id===p.id?' aria-current="true"':'')+'><span class="nt-av" style="--c:'+(COL[p.c]||'#8B5A2B')+'">'+esc(ini)+'</span><span class="nt-tx"><b>'+esc(p.name)+'</b><small>'+esc(p.b)+' – '+esc(p.d)+'</small></span>'+(gi?'<span class="nt-gio" title="Ngày giỗ"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1.5 1 2.5 2 2.5 0-2.5-1-4.5 0-7z"/></svg>'+esc(gi)+'</span>':'')+'</button>'}).join('');[].forEach.call(g.children,function(c,i){c.style.setProperty('--i',i)})}
 document.addEventListener('click',function(e){var c=e.target.closest('.nt-card');if(!c)return;ssPerson.select(c.dataset.pid);var t=document.getElementById('ho-so');window.setView&&setView('app','ho-so',false);try{history.pushState(null,'','#ho-so')}catch(_){}});
 addEventListener('ss-person',render);setTimeout(render,300);
 document.addEventListener('click',function(e){if(e.target.closest('[data-gd-signup]'))ssAuthOpen('signup');if(e.target.closest('[data-gd-login]'))ssAuthOpen('login')});
 // thanh điều hướng nằm ngoài đại sảnh (điện thoại): bấm mục khác thì đóng đại sảnh
 document.addEventListener('click',function(e){var a=e.target.closest('#mainNav a[href^="#"]');if(a&&a.getAttribute('href')!=='#dau-trang'&&window.ssHall&&!document.getElementById('hall').hidden)ssHall.close()},true);
 // đăng nhập khi cần lưu
 function need(e,msg){if(!window.ssAuthed||ssAuthed())return false;e.preventDefault();e.stopImmediatePropagation();window.toast&&toast(msg||'Bạn đăng ký miễn phí để lưu lại nhé');window.ssAuthOpen&&ssAuthOpen('signup');return true}
 document.addEventListener('submit',function(e){if(e.target.closest('#hanh-trinh,#ky-uc,#ca-nhan'))need(e,'Đăng ký miễn phí để lưu thông tin người thân')},true);
 document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var t=(b.textContent||'').trim();
  if(/^(Lưu ngôi nhà|Gửi lời nhắn|Lưu thông tin|Thêm vào gia phả)/.test(t))need(e,'Đăng ký miễn phí để lưu lại');
  if(b.closest('.nt-add'))need(e,'Đăng ký miễn phí để thêm người thân')},true);
 document.addEventListener('click',function(e){var a=e.target.closest('a.nt-add');if(a)need(e,'Đăng ký miễn phí để thêm người thân')},true);
})();
