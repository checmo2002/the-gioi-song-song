/* HUD: biểu tượng + chuyển động thay cho chữ */
(function(){
 function sv(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
 var I={
  nui:'<path d="M3 20l6-10 4 6 2-3 6 7z"/><path d="M8.2 11.4 9 10l1 1.6"/>',
  xuong:'<path d="M12 4v14M6 12l6 6 6-6"/>',
  ra:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 16l-4-4 4-4M5 12h11"/>',
  lang:'<path d="M2 12l5-4 5 4M3 11v8h8v-8M12 13l5-4 5 4M13 12v7h8v-7"/>',
  lich:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  nuoc:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  chuong:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  nhang:'<path d="M9 21V10M12 21V8M15 21V10M5 21h14"/><path d="M12 8c-1.5-1.5 1.5-2.5 0-4"/>',
  nen:'<path d="M10 10h4v11h-4z"/><path d="M12 3c1.2 2 2 3 0 5-2-2-1.2-3 0-5z"/>',
  mo:'<path d="M7 21V9a5 5 0 0 1 10 0v12M5 21h14M12 10v5M10 12h4"/>',
  gomo:'<path d="M4 15c0-5 3.6-8 8-8s8 3 8 8c0 2.5-3.6 3.5-8 3.5S4 17.5 4 15z"/><path d="M7 15.5c3 1.3 7 1.3 10 0"/><path d="M10 7.2c0-2 4-2 4 0"/><path d="M17 3l3.5 3.5"/>',
  khien:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M12 8l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/>',
  sao:'<path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z"/>',
  dinh:'<path d="M2 10l10-6 10 6M5 10v9h14v-9M3 20h18M10 20v-5h4v5"/>',
  sen:'<path d="M12 20c-4 0-8-3-8-7 3 0 5 1 8 4 3-3 5-4 8-4 0 4-4 7-8 7z"/><path d="M12 17c-2-3-2-7 0-10 2 3 2 7 0 10z"/>',
  thanh:'<path d="M12 3v18M7 8h10"/>',
  bien:'<path d="M12 3v18M5 6h12l2 2-2 2H5zM19 13H8l-2 2 2 2h11z"/>',
  vong:'<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
  phat:'<circle cx="12" cy="7" r="3"/><path d="M5 20c1-5 4-8 7-8s6 3 7 8z"/><path d="M12 2v1"/>',
  chap:'<path d="M12 3c-1.6 2.4-3 5-3 8.5V20h6v-8.5C15 8 13.6 5.4 12 3z"/><path d="M12 5v15"/>',
  lay:'<circle cx="7" cy="5.5" r="2"/><path d="M8.5 8.5l6.5 3 2 7M8.5 8.5 7 15l3 5"/>',
  ngoi:'<circle cx="12" cy="5" r="2"/><path d="M12 8v5M7 13h10M6 19c2-3 4-4 6-4s4 1 6 4"/>',
  doi:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  nguoi:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.4 3.2-5.2 6-5.2s5.2 1.8 6 5.2M16 4.6a3 3 0 0 1 0 5.8M18.5 14.6c1.4.8 2.2 2.6 2.5 5.4"/>',
  gd:'<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5"/>'};
 window.ssHudSvg=function(k){return sv(I[k]||I.vong)};
 var COL={ls:'#8B3A1E',tb:'#2F5D8A',dh:'#4E7A3A',nt:'#7A4A8C'};
 var SHORT={'Lên núi thắp nhang':'Lên núi','Phật giáo · Truyền thống':'Phật giáo','Vào thẳng làng tưởng niệm':'Vào làng','Đức Phật Thích Ca':'Lễ Phật','Đại hồng chung':'Thỉnh chuông','Xuống chân núi':'Xuống núi','Làng tưởng niệm':'Làng','Lịch phụng vụ':'Lịch','Bàn thờ chính':'Cầu nguyện'};
 window.ssHudIcon=function(el,h){var id=h.id||'',k='vong';
  if(id.indexOf('p:')===0){var p=window.ssPerson&&ssPerson.all().filter(function(q){return q.id===id.slice(2)})[0];el.classList.add('av');el.style.setProperty('--c',p&&COL[p.c]||'#8B5A2B');el.textContent=p?String(p.name).trim().split(/\s+/).pop()[0]:'?';return}
  k={len:h.t==='Chính điện'?'phat':'nui',xuong:'xuong',venui:'ra',ralang:'ra',lang:'lang',cal:'lich',chuong:'chuong',gomo:'gomo','le-phat':'phat',thien:'sen',nhang:(document.getElementById('hall').dataset.ws==='tho'?(h.t==='Bàn thờ chính'?'thanh':'nen'):(h.t==='Đức Phật Thích Ca'?'phat':'nhang')),dinh:'dinh','xom-ls':'mo','khu-bac':'sao','khu-tuong':'khien','khu-vua':'dinh','khu-tt':'sen','g-phat':'sen','g-cg':'thanh','g-tt':'bien','g-logo':'vong','ban-tho':'thanh','chuong-tt':'chuong','nuoc-thanh':'nuoc'}[id]||k;
  el.innerHTML=sv(I[k]);if(SHORT[h.t])el.parentNode.querySelector('b').textContent=SHORT[h.t]};
 // thanh hành động: chỉ biểu tượng (chữ hiện khi rê chuột / nút chính)
 var BAR={len:['nui','Lên núi'],xuong:['xuong','Xuống núi'],venui:['ra','Cổng làng'],ralang:['ra','Ra làng'],chap:['chap','Chắp tay'],lay:['lay','Vái lạy'],ngoi:['ngoi','Ngồi'],doi:['doi','Nhân vật'],nhang:['nen','Thắp nến']};
 function bar(){[].forEach.call(document.querySelectorAll('.hall .w-bar [data-w]'),function(b){var m=BAR[b.dataset.w];if(!m||b.dataset.hud)return;b.dataset.hud=1;b.title=b.textContent.replace('‹','').trim();b.setAttribute('aria-label',b.title);b.innerHTML=sv(I[m[0]])+'<span>'+m[1]+'</span>'})}
 // thanh trên của sảnh
 function top(){var a=document.querySelector('.hall .hall-act');if(!a||a.dataset.hud)return;a.dataset.hud=1;
  [].forEach.call(a.querySelectorAll('.hnav'),function(n){n.title=(n.textContent||'').trim()});
  var c=a.querySelector(':scope > [data-open-cal]:not(.hnav)');if(c){c.title='Lịch vạn niên';c.innerHTML=sv(I.lich);c.classList.add('hud-ic')}
  var o=document.getElementById('hallOnline');if(o){o.insertAdjacentHTML('afterbegin','<span class="hud-on-ic">'+sv(I.nguoi)+'</span>')}}
 function run(){bar();top()}
 run();setTimeout(run,400);setTimeout(run,1500);
})();
