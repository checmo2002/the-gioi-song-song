/* Cài đặt âm thanh: nút bánh răng góc phải trên của thế giới, bảng chỉnh nhạc nền (js/03), âm thanh không gian (js/07-11), hiệu ứng (ssSfx, js/03) */
(function(){
 var hall=document.getElementById('hall');if(!hall)return;
 var IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
 var nut=document.createElement('button');nut.type='button';nut.className='cd-nut';nut.setAttribute('aria-label','Cài đặt âm thanh');nut.title='Cài đặt';nut.innerHTML=IC;hall.appendChild(nut);
 var MUC=[
  {k:'nhac',t:'Nhạc nền',s:'Nhạc theo lối Phật giáo / Công giáo',api:function(){return window.ssMusic&&ssMusic.vol?ssMusic:null}},
  {k:'kg',t:'Âm thanh không gian',s:'Gió, đàn tranh, chuông xa',api:function(){return window.ssAmbient||null}},
  {k:'hu',t:'Hiệu ứng',s:'Chuông, mõ, thắp nến, bay lên',api:function(){return HU}}];
 var huCu=1;
 var HU={on:function(){return ssSfx()>0},set:function(v){if(v){if(!ssSfx())luu(huCu||.8)}else{if(ssSfx())huCu=ssSfx();luu(0)}},vol:function(v){if(v==null)return ssSfx();luu(v)}};
 function luu(v){try{localStorage.setItem('ss-sfx',String(Math.max(0,Math.min(1,+v))))}catch(e){}}
 var bg=document.createElement('div');bg.className='cd';bg.hidden=true;
 var h='<div class="cd-the" role="dialog" aria-modal="true" aria-labelledby="cdTd"><div class="cd-dau"><b id="cdTd">Cài đặt</b><button type="button" class="cd-x" aria-label="Đóng">×</button></div><p class="cd-nhom">Âm thanh</p>';
 MUC.forEach(function(m){h+='<div class="cd-muc" data-k="'+m.k+'"><div class="cd-hang"><span class="cd-ten"><b>'+m.t+'</b><small>'+m.s+'</small></span>'+
  '<button type="button" class="cd-bat" role="switch" aria-label="'+m.t+'"><i></i></button></div>'+
  '<label class="cd-am"><span class="sr">Âm lượng '+m.t.toLowerCase()+'</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/></svg><input type="range" min="0" max="100" step="1"><output></output></label></div>'});
 h+='<button type="button" class="cd-thu">Nghe thử hiệu ứng</button></div>';
 bg.innerHTML=h;document.body.appendChild(bg);
 function ve(){MUC.forEach(function(m){var el=bg.querySelector('[data-k="'+m.k+'"]'),a=m.api();el.hidden=!a;if(!a)return;
  var on=a.on(),v=Math.round(a.vol()*100),r=el.querySelector('input');el.querySelector('.cd-bat').setAttribute('aria-checked',on?'true':'false');
  if(document.activeElement!==r)r.value=v;el.querySelector('output').textContent=r.value+'%';el.classList.toggle('tat',!on)})}
 bg.addEventListener('click',function(e){if(e.target===bg)dong();if(e.target.closest('.cd-x'))dong();
  var b=e.target.closest('.cd-bat');if(b){var m=MUC.filter(function(x){return x.k===b.closest('.cd-muc').dataset.k})[0],a=m.api();a.set(!a.on());ve()}
  if(e.target.closest('.cd-thu')){if(!HU.on())HU.set(1);window.ssAmBay&&ssAmBay(window.ssFaith==='cg'?'cg':'phat');ve()}});
 bg.addEventListener('input',function(e){var r=e.target;if(r.type!=='range')return;var m=MUC.filter(function(x){return x.k===r.closest('.cd-muc').dataset.k})[0],a=m.api(),v=r.value/100;
  a.vol(v);if(v>0&&!a.on())a.set(true);if(v===0&&a.on()&&m.k!=='hu')a.set(false);ve()});
 var truoc=null;
 function mo(){truoc=document.activeElement;bg.hidden=false;ve();var x=bg.querySelector('.cd-bat');x&&x.focus()}
 function dong(){bg.hidden=true;truoc&&truoc.focus&&truoc.focus()}
 nut.addEventListener('click',function(e){e.stopPropagation();mo()});
 document.addEventListener('keydown',function(e){if(!bg.hidden&&e.key==='Escape')dong()});
 // máy tính: thanh trên của trang (Đăng nhập / Đăng ký) nằm đè góc phải trên của thế giới -> hạ nút xuống dưới thanh đó
 function choNut(){var a=document.querySelector('.nav-auth'),b=a&&a.getBoundingClientRect(),h=hall.getBoundingClientRect();
  nut.style.top=b&&b.width&&b.bottom>h.top&&b.right>h.right-120?(b.bottom-h.top+10)+'px':''}
 addEventListener('resize',choNut);new MutationObserver(choNut).observe(document.documentElement,{attributes:true,attributeFilter:['class']});new MutationObserver(choNut).observe(hall,{attributes:true,attributeFilter:['data-ws','hidden']});choNut();
 window.ssCaiDat={mo:mo,dong:dong};
})();
