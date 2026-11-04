/* Mỗi mục là một trang riêng, xếp theo 3 nơi: Chùa · Người thân · Gia đình */
(function(){
 var G={chua:'#dau-trang',nt:'#nguoi-than',gd:'#ca-nhan'};
 var PAGES=[
  {k:'thap-nhang',ids:['thap-nhang'],t:'Thắp nhang tưởng niệm',tc:'Thắp nến cầu nguyện',g:'chua',back:['chua','Chùa','Nhà thờ']},
  {k:'nguoi-than',ids:['nguoi-than'],t:'Người thân',g:'nt'},
  {k:'ho-so',ids:['ho-so'],t:'Tiểu sử',g:'nt',person:1},
  {k:'ky-uc',ids:['ky-uc'],t:'Ký ức',g:'nt',person:1},
  {k:'ban-do',ids:['ban-do'],t:'Mộ phần',g:'nt',person:1},
  {k:'an-nghi',ids:['ngoi-nha','cong-vien'],t:'Nơi an nghỉ',g:'nt',person:1},
  {k:'thiep',ids:['thiep'],t:'Gửi thiệp',g:'nt',person:1},
  {k:'hanh-trinh',ids:['hanh-trinh'],t:'Thêm người thân',g:'nt',back:['#nguoi-than','Người thân']},
  {k:'ca-nhan',ids:['ca-nhan'],t:'Gia đình',g:'gd'},
  {k:'hoi-dap',ids:['hoi-dap'],t:'Hỏi đáp',g:'gd',back:['#ca-nhan','Gia đình']},
  {k:'cua-hang',ids:['cua-hang'],t:'Cửa hàng & dịch vụ',g:'gd',back:['#ca-nhan','Gia đình']},
  {k:'dau-trang',ids:['dau-trang','khong-gian','bat-dau'],t:'Giới thiệu Song Song',g:null}];
 var TABS=[['ho-so','Tiểu sử','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>'],['ky-uc','Ký ức','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'],['ban-do','Mộ phần','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'],['ngoi-nha','An nghỉ','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>'],['thiep','Thiệp','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>']];
 var bySec={},cur=null;PAGES.forEach(function(p){p.ids.forEach(function(id){var el=document.getElementById(id);if(el){el.classList.add('pgs');bySec[id]=p}})});
 function cg(){return window.ssFaith==='cg'}
 function title(p){return cg()&&p.tc?p.tc:p.t}
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function bar(p){var b=document.getElementById('pgbar');if(!b)return;var w=b.querySelector('.wrap');
  if(!p||!p.g||p.k==='nguoi-than'||p.k==='ca-nhan'){b.hidden=true;return}b.hidden=false;
  var h='';
  if(p.person){var per=window.ssPerson&&ssPerson.get();
   h='<a class="pg-back" href="#nguoi-than">‹ <span>Người thân</span></a><span class="pg-av" style="--c:'+({ls:'#8B3A1E',tb:'#2F5D8A',dh:'#4E7A3A',nt:'#7A4A8C'}[per&&per.c]||'#8B5A2B')+'">'+esc(per?(per.name.trim().split(/\s+/).pop()[0]):'')+'</span><div class="pg-who"><h1 class="pg-title">'+esc(per?per.name:'')+'</h1><small>'+esc(per?per.b+' – '+per.d:'')+(window.ssGioText&&per?ssGioText(per):'')+'</small></div>'
    +'<button type="button" class="pg-inc" data-pg-inc><i class="smk" aria-hidden="true"><i></i><i></i><i></i></i>'+'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 21V10M12 21V8M15 21V10M5 21h14"/></svg>'+'<span class="pg-inc-t">'+(cg()?'Thắp nến':'Thắp nhang')+'</span></button>'
    +'<nav class="pg-tabs" aria-label="Mục của người thân">'+TABS.map(function(t){var on=p.ids.indexOf(t[0])>=0;return '<a href="#'+t[0]+'"'+(on?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span></a>'}).join('')+'</nav>';
  }else{var bk=p.back||['#ca-nhan','Gia đình'];var lab=bk[0]==='chua'?(cg()?bk[2]:bk[1]):bk[1];
   h=(bk[0]==='chua'?'<button type="button" class="pg-back" data-open-hall>‹ <span>'+lab+'</span></button>':'<a class="pg-back" href="'+bk[0]+'">‹ <span>'+lab+'</span></a>')+'<h1 class="pg-title">'+esc(title(p))+'</h1>'}
  w.innerHTML=h}
 function tabsOn(p){var key=p?p.g:null;document.querySelectorAll('#mainNav .tb').forEach(function(t){t.classList.toggle('on',!!key&&t.dataset.tabKey===key)});
  var on=document.querySelector('#mainNav .tb.on');window.tbGo&&on&&tbGo(on)}
 window.ssPage=function(t,v){var sec=t&&t.closest&&t.closest('section.pgs');var p=sec?bySec[sec.id]:(v==='app'?bySec['nguoi-than']:bySec['dau-trang']);
  var changed=p!==cur;cur=p;document.body.classList.add('paged');document.body.dataset.pg=p.k;
  [].forEach.call(document.querySelectorAll('section.pgs'),function(s){var on=p.ids.indexOf(s.id)>=0;s.classList.toggle('pg-on',on);if(on&&changed){s.classList.remove('pg-enter');void s.offsetWidth;s.classList.add('pg-enter')}});
  bar(p);tabsOn(p);document.title=(p.person&&window.ssPerson&&ssPerson.get()?ssPerson.get().name+' · ':'')+title(p)+' · Song Song';
  return {changed:changed,isTop:!t||!sec||t===sec||p.ids[0]===t.id}};
 document.addEventListener('click',function(e){if(e.target.closest('[data-open-hall]')){e.preventDefault();window.ssHall&&ssHall.open()}
  if(e.target.closest('[data-pg-inc]')){e.preventDefault();var b=document.getElementById('incBtn');b&&b.click()}});
 addEventListener('ss-faith',function(){if(cur)bar(cur);var l=document.querySelector('[data-chua-label]');if(l)l.textContent=cg()?'Nhà thờ':'Chùa'});
 addEventListener('ss-person',function(){if(cur)bar(cur)});
 setTimeout(function(){var l=document.querySelector('[data-chua-label]');if(l)l.textContent=cg()?'Nhà thờ':'Chùa'},50);
})();
