/* Làng tưởng niệm: chọn xóm → chọn người → vào gian thờ */
(function(){
 var hall=document.getElementById('hall');if(!hall)return;
 var COL={ls:'#8B3A1E',tb:'#2F5D8A',dh:'#4E7A3A',nt:'#7A4A8C',tt:'#C77C9A'},NAME={ls:['Liệt sĩ · Đồi Tri Ân','Nơi các liệt sĩ yên nghỉ'],tb:['Xóm Đồng Đội','Các thương binh'],dh:['Xóm Dòng Họ','Ông bà, tổ tiên'],nt:['Xóm Bình Yên','Người thân trong gia đình'],tt:['Thiên thần nhỏ','Vườn hoa tưởng nhớ các bé ra đi khi còn nhỏ']};
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 var box=document.createElement('div');box.className='xom';box.hidden=true;box.setAttribute('role','dialog');hall.appendChild(box);
 window.ssXom=function(c){var L=(window.ssPerson?ssPerson.all():[]).filter(function(p){return p.c===c}),n=NAME[c]||['Xóm',''];
  box.innerHTML='<button type="button" class="rit-x" aria-label="Đóng">×</button><h3>'+n[0]+'</h3><p>'+n[1]+'</p>'+(L.length?'<div class="rit-ppl">'+L.map(function(p){return '<button type="button" class="rit-p" data-xp="'+esc(p.id)+'"><i style="--c:'+(COL[p.c]||'#8B5A2B')+'">'+esc(p.name.trim().split(/\s+/).pop()[0])+'</i>'+esc(p.name.trim().split(/\s+/).slice(-2).join(' '))+'</button>'}).join('')+'</div>':'<p class="xom-empty">Chưa có ai trong xóm này.</p>');box.hidden=false};
 function nhaTitle(){var t=hall.querySelector('.hall-ttl'),p=window.ssPerson&&ssPerson.get();if(t)t.setAttribute('data-nha',p?'Nhà của '+p.name:'Gian thờ')}
 function vao(id){if(id&&window.ssPerson)ssPerson.select(id);nhaTitle();box.hidden=true;var W=window.ssWorld;if(!W)return;if(W.scene()==='nha'){W.set('nha');return}W.fade('nha','Vào nhà…')}
 window.ssVaoNha=vao;
 box.addEventListener('click',function(e){var b=e.target.closest('[data-xp]');if(b){vao(b.dataset.xp);return}if(e.target.closest('.rit-x'))box.hidden=true});
 new MutationObserver(function(){if(hall.hidden)box.hidden=true}).observe(hall,{attributes:true,attributeFilter:['hidden']});
 addEventListener('ss-person',nhaTitle);
 // mở thẳng một nơi trong thế giới từ trang khác
 window.ssGoWorld=function(s,id){if(id&&window.ssPerson)ssPerson.select(id);nhaTitle();var W=window.ssWorld;if(!W)return;
  if(hall.hidden){W.set(s);window.ssHall&&ssHall.open();setTimeout(function(){W.refresh()},60)}else W.fade(s)};
 // tab "An nghỉ" của một người → vào gian thờ của người ấy
 document.addEventListener('click',function(e){var a=e.target.closest('.pg-tabs a[href="#ngoi-nha"],a[href="#cong-vien"],a[href="#ngoi-nha"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();
  var p=window.ssPerson&&ssPerson.get();if(a.getAttribute('href')==='#cong-vien')ssGoWorld('lang');else ssGoWorld('nha',p&&p.id)},true);
 // tab Chùa / Nhà thờ luôn về chân núi (hoặc nhà thờ)
 document.addEventListener('click',function(e){var a=e.target.closest('#mainNav a[href="#dau-trang"],[data-open-hall]');if(!a)return;var W=window.ssWorld;if(W&&(W.scene()==='lang'||W.scene()==='nha'))W.set(W.home())},true);
 // nghi lễ thắp hương trong gian thờ: chọn sẵn người của nhà
 var oo=window.ssRitual&&ssRitual.open;if(oo)ssRitual.open=function(id){var W=window.ssWorld;if(!id&&W&&W.scene()==='nha'){var p=ssPerson.get();id=p&&p.id}oo(id)};
})();
