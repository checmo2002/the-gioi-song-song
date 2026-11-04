/* Một chỗ thắp nhang duy nhất: mọi nút thắp do người bấm đều mở nghi thức trong chính điện / nhà thờ */
(function(){
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#incBtn,#hubLight');if(!b||!e.isTrusted||!window.ssRitual)return;
  e.preventDefault();e.stopImmediatePropagation();var p=b.id==='incBtn'&&window.ssPerson&&ssPerson.get();ssRitual.go(p&&p.id)},true);
 // hồ sơ: gập bớt các mốc đời
 var ch=document.getElementById('pChapters');if(!ch)return;
 var mb=document.createElement('button');mb.type='button';mb.className='lm-more';ch.after(mb);
 function upd(){var n=ch.children.length;mb.hidden=n<=2;mb.textContent=ch.classList.contains('all')?'Thu gọn':'Xem thêm '+(n-2)+' mốc đời'}
 mb.addEventListener('click',function(){ch.classList.toggle('all');upd()});
 new MutationObserver(function(){ch.classList.remove('all');upd()}).observe(ch,{childList:true});upd();
})();
