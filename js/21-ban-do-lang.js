/* Bản đồ làng: các khu tưởng niệm quanh Sảnh Song Song, bấm để tới */
(function(){
 var hall=document.getElementById('hall');if(!hall)return;
 var Z=[['ls','Liệt sĩ','Đồi Tri Ân · đài tưởng niệm','#C23A2E','<path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z"/>'],
        ['bac','Bác Hồ','Tượng đài Chủ tịch Hồ Chí Minh','#9A3B2B','<path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z"/>'],
        ['tuong','Các tướng','Những người có công với cách mạng','#2F5D8A','<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>'],
        ['vua','Gia phả các đời vua','Đền thờ các vua Việt','#9A6E22','<path d="M2 10l10-6 10 6M5 10v9h14v-9M3 20h18"/>'],
        ['tt','Thiên thần nhỏ','Vườn hoa của các bé','#C77C9A','<path d="M12 20c-4 0-8-3-8-7 3 0 5 1 8 4 3-3 5-4 8-4 0 4-4 7-8 7z"/>'],
        ['ao','Ao sen','Vườn tĩnh tâm','#3C8A8A','<path d="M12 20c-4 0-8-3-8-7 3 0 5 1 8 4 3-3 5-4 8-4 0 4-4 7-8 7z"/>'],
        ['ho','Làng nhà tôi','Lối rẽ ở đường vào làng','#6E8A3A','<circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M12 7.5V12M6 15.5V12h12v3.5"/>'],
        ['cong','Cổng làng','Về chân núi chùa','#8C7A60','<path d="M4 21V9l8-5 8 5v12M9 21v-7h6v7"/>']];
 function L(){return window.__SC_LANG||null}
 function sv(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
 var sh=document.createElement('div');sh.className='hos';sh.hidden=true;sh.setAttribute('role','dialog');sh.setAttribute('aria-label','Bản đồ làng');document.body.appendChild(sh);
 sh.addEventListener('click',function(e){if(e.target===sh||e.target.closest('.hos-x'))sh.hidden=true});
 document.addEventListener('keydown',function(e){if(!sh.hidden&&e.key==='Escape')sh.hidden=true});
 function count(c){return window.ssPerson?ssPerson.all().filter(function(p){return p.c===c}).length:0}
 function target(k){var c=window.__SC_LANG_REF;if(!c)return null;if(k==='ao')return c.aoDoor;if(k==='ho')return c.forkDoor;if(k==='cong')return c.spawn;if(k==='ls')return c.gates.ls;return c.gates[k]}
 window.ssLangMap=function(){var c=window.__SC_LANG_REF,me=document.querySelector('.hall .wa.me');
  var mini='';   // ảnh toàn cảnh 2D đã bỏ (chỉ còn 3D)
  sh.innerHTML='<div class="hos-c"><div class="hos-h"><i style="background:#C9892E">'+sv('<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>')+'</i><div><b>Bản đồ làng tưởng niệm</b><small>Sảnh Song Song ở giữa · bấm một khu để đi tới</small></div><button type="button" class="hos-x" aria-label="Đóng">×</button></div>'+mini+
   '<div class="lm-z">'+Z.map(function(z){var n=(['ls','tt'].indexOf(z[0])>=0)?count(z[0]):null;return '<button type="button" data-z="'+z[0]+'"><i style="background:'+z[3]+'">'+sv(z[4])+'</i><span><b>'+z[1]+'</b><small>'+z[2]+'</small></span>'+(n!=null?'<em>'+n+' người</em>':'')+'</button>'}).join('')+'</div></div>';
  sh.hidden=false}
 sh.addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;var k=b.dataset.z,W=window.ssWorld;sh.hidden=true;if(!W)return;
  if(W.scene()!=='lang'){W.fade('lang','Về làng tưởng niệm…');return}
  var t=target(k);if(!t)return;
  W.walk(t[0],t[1],function(){var map={ls:'xom-ls',bac:'khu-bac',tuong:'khu-tuong',vua:'khu-vua',tt:'khu-tt'};if(map[k]){var h=hall.querySelector('.wh[data-w="'+map[k]+'"]');h&&h.click()}else if(k==='ho'){window.ssHo&&ssHo.go()}else if(k==='cong'){var g=hall.querySelector('.wh[data-w="venui"]');g&&g.click()}})});
 function addBtn(){var bar=document.querySelector('.hall .w-bar');if(!bar||bar.querySelector('.lmap-btn'))return;var b=document.createElement('button');b.type='button';b.className='lmap-btn';b.dataset.w='lmap';b.setAttribute('aria-label','Bản đồ làng');
  b.innerHTML=sv('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>')+'<span>Bản đồ</span>';bar.insertBefore(b,bar.firstChild)}
 addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.lmap-btn');if(!b)return;e.stopPropagation();e.preventDefault();ssLangMap()},true);
 ssKhiDoi(addBtn);
})();
