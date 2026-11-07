/* Góc nhìn: mặc định điện thoại lùi xa hơn (thấy rộng đường đi); người dùng tự chỉnh, nhớ theo từng máy */
(function(){
 var DEF={v:.6,h:1},MIN=.5,MAX=1.6,KEY='ss-zoom',z={};
 try{z=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
 function get(O){return z[O]||DEF[O]||1}
 window.ssZoomK=get;
 var Ofn=function(){var h=document.getElementById('hall');return h&&h.clientWidth/Math.max(1,h.clientHeight)<.9?'v':'h'};
 // camera tự về mặc định (js/26): người xem đã thu nhỏ để nhìn đường thì trả về độ xa mặc định; đang phóng gần thì giữ
 window.ssZoomVe=function(){var o=Ofn();if(get(o)<(DEF[o]||1)-.001){z[o]=DEF[o];try{localStorage.setItem(KEY,JSON.stringify(z))}catch(e){}dispatchEvent(new Event('resize'))}};
 var hall=document.getElementById('hall');if(!hall)return;
 var O=function(){return hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h'};
 var raf=0;function apply(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;dispatchEvent(new Event('resize'));ui()})}
 function set(v,O_){O_=O_||O();z[O_]=Math.max(MIN,Math.min(MAX,+v.toFixed(3)));try{localStorage.setItem(KEY,JSON.stringify(z))}catch(e){}apply();hint()}
 var box=document.createElement('div');box.className='zm';box.setAttribute('role','group');box.setAttribute('aria-label','Góc nhìn');
 box.innerHTML='<button type="button" data-z="in" aria-label="Phóng to (nhìn gần)" title="Nhìn gần"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M11 8v6M8 11h6"/></svg></button><small>Góc nhìn</small><button type="button" data-z="out" aria-label="Thu nhỏ (nhìn rộng)" title="Nhìn rộng"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8 11h6"/></svg></button>';
 hall.appendChild(box);
 var tip=document.createElement('div');tip.className='zm-tip';hall.appendChild(tip);var tT;
 function hint(){var p=Math.round(get(O())/DEF[O()]*100);tip.textContent=get(O())<=MIN+.001?'Đã nhìn rộng nhất':get(O())>=MAX-.001?'Đã nhìn gần nhất':'Góc nhìn '+p+'%';tip.classList.add('on');clearTimeout(tT);tT=setTimeout(function(){tip.classList.remove('on')},1100)}
 function ui(){var v=get(O());box.querySelector('[data-z="in"]').disabled=v>=MAX-.001;box.querySelector('[data-z="out"]').disabled=v<=MIN+.001}
 box.addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;e.stopPropagation();set(get(O())*(b.dataset.z==='in'?1.25:.8))});
 // chụm hai ngón
 var p0=0,z0=1;function dist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
 hall.addEventListener('touchstart',function(e){if(e.touches.length===2){p0=dist(e.touches);z0=get(O())}},{passive:true});
 hall.addEventListener('touchmove',function(e){if(e.touches.length===2&&p0){e.preventDefault();set(z0*dist(e.touches)/p0)}},{passive:false});
 hall.addEventListener('touchend',function(e){if(e.touches.length<2)p0=0},{passive:true});
 // cuộn chuột trên máy tính
 hall.addEventListener('wheel',function(e){if(!hall.classList.contains('world-on'))return;if(e.target.closest('.mo,.rit,.hall-list'))return;e.preventDefault();set(get(O())*(e.deltaY<0?1.1:1/1.1))},{passive:false});
 ui();
})();
