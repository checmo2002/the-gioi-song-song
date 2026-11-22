/* Thắp nhang: chỉ một nơi — chính điện (Công giáo: nhà thờ) */
(function(){
 var COL={ls:'#8B3A1E',tb:'#2F5D8A',dh:'#4E7A3A',nt:'#7A4A8C'},hall=document.getElementById('hall');if(!hall)return;
 function cg(){return window.ssFaith==='cg'}
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 // ngày giỗ còn bao lâu (âm lịch)
 window.ssGioText=function(p){var f=(p.facts||[]).filter(function(x){return /giỗ/i.test(x[0])})[0];if(!f||!window.ssToLunar)return '';
  var m=/(\d+)\s*tháng\s*(\d+)/.exec(f[1]);if(!m)return '';var dd=+m[1],mm=+m[2],t=new Date();t.setHours(12);
  if(!/âm/i.test(f[1])){for(var j=0;j<370;j++){var x=new Date(t.getTime()+j*864e5);if(x.getDate()===dd&&x.getMonth()+1===mm)return j?' · <b>giỗ còn '+j+' ngày</b>':' · <b>hôm nay là ngày giỗ</b>'}return ''}
  for(var i=0;i<390;i++){var d=new Date(t.getTime()+i*864e5),l=ssToLunar(d.getDate(),d.getMonth()+1,d.getFullYear());if(!l.leap&&l.d===dd&&l.m===mm)return i?' · <b>giỗ còn '+i+' ngày</b>':' · <b>hôm nay là ngày giỗ</b>'}return ''};
 var box=document.createElement('div');box.className='rit';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label','Thắp nhang');
 var fx=document.createElement('div');fx.className='rit-fx';
 var cta=document.createElement('button');cta.type='button';cta.className='rit-cta';
 hall.appendChild(fx);hall.appendChild(box);hall.appendChild(cta);
 var pick='all';
 function render(){var L=window.ssPerson?ssPerson.all():[],w=cg()?'Thắp nến':'Thắp nhang';
  cta.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">'+(cg()?'<path d="M9 21h6M10 21V11h4v10"/><path d="M12 3c1.6 2 2 3.3 2 4.3a2 2 0 0 1-4 0c0-1 .4-2.3 2-4.3z"/>':'<path d="M9 21V10M12 21V8M15 21V10M5 21h14"/>')+'</svg>'+w;
  box.innerHTML='<button type="button" class="rit-x" aria-label="Đóng">×</button><h3>'+(cg()?'Thắp nến cầu nguyện':'Dâng hương')+'</h3><div class="rit-ppl">'
   +'<button type="button" class="rit-p" data-rp="all" aria-pressed="'+(pick==='all')+'"><i style="--c:#7A5A2A">✦</i>'+(cg()?'Mọi linh hồn':'Mọi vong linh')+'</button>'
   +L.map(function(p){var ini=p.name.trim().split(/\s+/).pop()[0];return '<button type="button" class="rit-p" data-rp="'+esc(p.id)+'" aria-pressed="'+(pick===p.id)+'"><i style="--c:'+(COL[p.c]||'#8B5A2B')+'">'+esc(ini)+'</i>'+esc(p.name.trim().split(/\s+/).slice(-2).join(' '))+'</button>'}).join('')
   +'</div><button type="button" class="rit-go">'+cta.innerHTML.replace(w,'')+'<span>'+w+(pick!=='all'&&window.ssPerson?' cho '+esc((ssPerson.all().filter(function(p){return p.id===pick})[0]||{name:''}).name):'')+'</span></button><p class="rit-n"></p>';
  var on=box.querySelector('[aria-pressed="true"]');on&&on.scrollIntoView&&on.scrollIntoView({inline:'center',block:'nearest'})}
 function open(id){if(id)pick=id;render();box.hidden=false}
 function close(){box.hidden=true}
 function light(){var w=cg()?'Thắp nến':'Thắp nhang';
  if(pick!=='all'&&window.ssPerson){ssPerson.select(pick);var b=document.getElementById('incBtn');b&&b.click()}
  else{window.ssBell&&ssBell();window.toast&&toast(cg()?'Đã thắp một ngọn nến cho mọi linh hồn':'Đã dâng một nén hương cho mọi vong linh')}
  fx.innerHTML=cg()?'<svg class="cnd" viewBox="0 0 120 200" aria-hidden="true"><defs><linearGradient id="cndG" x1="0" x2="1"><stop offset="0" stop-color="#E9DCC2"/><stop offset=".5" stop-color="#FFF8EA"/><stop offset="1" stop-color="#D9C8A6"/></linearGradient></defs><g class="smk"><path d="M60 40c-6-10 6-16 0-26"/></g><path class="emb" d="M60 44c-8-10-2-20 0-26 2 6 8 16 0 26z"/><rect x="48" y="50" width="24" height="120" rx="4" fill="url(#cndG)"/><rect x="36" y="168" width="48" height="10" rx="3" fill="#C9963A"/></svg>'
   :'<svg viewBox="0 0 240 230" aria-hidden="true"><g class="smk"><path d="M96 40c-8-12 8-20 0-32"/><path d="M120 30c8-12-8-20 0-32"/><path d="M144 40c-8-12 8-20 0-32"/></g><rect x="94" y="44" width="3" height="100" rx="1.5" fill="#8A3B2B" transform="rotate(-8 95 144)"/><rect x="118.5" y="34" width="3" height="110" rx="1.5" fill="#8A3B2B"/><rect x="143" y="44" width="3" height="100" rx="1.5" fill="#8A3B2B" transform="rotate(8 144 144)"/><circle class="emb" cx="88" cy="46" r="3.4"/><circle class="emb" cx="120" cy="35" r="3.4"/><circle class="emb" cx="152" cy="46" r="3.4"/><ellipse cx="120" cy="146" rx="70" ry="12" fill="#5A4026"/><path d="M50 146c0 38 28 60 70 60s70-22 70-60z" fill="#B7862E"/><ellipse cx="120" cy="146" rx="70" ry="12" fill="none" stroke="#F4DFA8" stroke-width="2"/></svg>';
  dispatchEvent(new Event('ss-lit'));
  var n=box.querySelector('.rit-n'),t=new Date();n.textContent=(cg()?'Đã thắp nến lúc ':'Đã thắp hương lúc ')+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
  setTimeout(function(){fx.innerHTML=''},4300)}
 box.addEventListener('click',function(e){var p=e.target.closest('[data-rp]');if(p){pick=p.dataset.rp;render();return}
  if(e.target.closest('.rit-x'))close();if(e.target.closest('.rit-go'))light()});
 cta.addEventListener('click',function(){open()});
 // Phật giáo: muốn thắp thì lên chính điện trước
 function goDien(id){var W=window.ssWorld;if(cg()&&W){if(W.scene()!=='tho'){W.fade('tho',null,null,function(){open(id)})}else open(id);return}if(W&&W.on&&W.on()&&W.scene()!=='dien'){W.climb(function(){open(id)})}else open(id)}
 window.ssRitual={open:open,close:close,go:function(id){if(hall.hidden&&window.ssHall)ssHall.open();setTimeout(function(){goDien(id)},450)}};
 document.addEventListener('click',function(e){var b=e.target.closest('[data-pg-inc]');if(b){e.preventDefault();e.stopImmediatePropagation();var p=window.ssPerson&&ssPerson.get();ssRitual.go(p&&p.id)}
  var a=e.target.closest('a[href="#thap-nhang"]');if(a){e.preventDefault();e.stopImmediatePropagation();ssRitual.go()}},true);
 new MutationObserver(function(){if(hall.hidden)close()}).observe(hall,{attributes:true,attributeFilter:['hidden']});
 addEventListener('ss-faith',render);render();
})();
