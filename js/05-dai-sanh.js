/* Đại sảnh: mở sau khi qua cổng, khi vào lại trang, hoặc khi bấm "Đại sảnh" / logo */
(function(){var h=document.getElementById('hall');if(!h)return;var root=document.documentElement;
 var m=h.querySelector('.hall-motes');for(var i=0;i<18;i++){var d=document.createElement('i');d.style.left=(Math.random()*100)+'%';d.style.animationDuration=(10+Math.random()*12)+'s';d.style.animationDelay=(-Math.random()*20)+'s';m.appendChild(d)}
 function open(){if(!h.hidden)return;h.hidden=false;root.classList.add('hall-on');window.tbGo&&tbGo(null);/* quay lại cảnh: thôi sáng ô trang vừa đóng */[].forEach.call(h.querySelectorAll('.hall-scene,.hall-splash,.hs,.hall-top,.hall-dock,.hall-grid'),function(el){el.style.animation='none';void el.offsetWidth;el.style.animation=''});setTimeout(function(){var f=h.querySelector('.hs-main');try{f&&f.focus({preventScroll:true})}catch(e){}},2800)}
 function close(){h.hidden=true;h.classList.remove('go');h.querySelector('.hall-scene').style.transformOrigin='';var ws=h.querySelector('.w-stage');ws&&(ws.style.transformOrigin='');root.classList.remove('hall-on')}
 window.ssHall={open:open,close:close};
 h.addEventListener('click',function(e){if(e.target.closest('[data-hall-logo]')){e.preventDefault();e.stopPropagation();return}var a=e.target.closest('a[href^="#"],[data-open-gate]');
  if(a&&a.matches('a')&&!a._go&&!matchMedia('(prefers-reduced-motion: reduce)').matches){e.preventDefault();e.stopPropagation();var sc=h.classList.contains('world-on')?h.querySelector('.w-stage'):h.querySelector('.hall-scene'),r=a.getBoundingClientRect(),sr=sc.getBoundingClientRect();
    sc.style.transformOrigin=((r.left+r.width/2-sr.left)/sr.width*100)+'% '+((r.top+r.height/2-sr.top)/sr.height*100)+'%';h.classList.add('go');
    setTimeout(function(){a._go=true;a.click();a._go=false},720);return}
  if(a){close();return}if(e.target.closest('[data-hall-close]')){close();window.setView&&setView('intro',null,false)}});
 // Esc: các bảng (nghi thức, gõ mõ, cài đặt…) tự đóng bằng hidden ở document, chạy trước window.
 // Đếm [hidden] trước và sau: có bảng vừa đóng thì Esc đã dùng xong, không đóng cả thế giới (#79)
 var escAn=0;addEventListener('keydown',function(e){if(e.key==='Escape')escAn=document.querySelectorAll('[hidden]').length},true);
 addEventListener('keydown',function(e){if(e.key==='Escape'&&!h.hidden&&!document.querySelector('dialog[open]')&&document.querySelectorAll('[hidden]').length===escAn)close()});
 // "Đại sảnh" trên thanh tab và logo mở lại đại sảnh
 document.addEventListener('click',function(e){var a=e.target.closest('a.tb[href="#dau-trang"],a.brand');if(!a||(window.ssGate&&ssGate.pending))return;e.preventDefault();e.stopPropagation();open()},true);
 addEventListener('ss-gate-done',function(){setTimeout(open,60)});
 // vào lại trang (đã chọn lối, không cần qua cổng) và không mở thẳng một mục
 var hid=location.hash.slice(1);if(!(window.ssGate&&ssGate.pending)&&(!hid||hid==='dau-trang'))open();
})();
