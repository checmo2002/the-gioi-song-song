/* Một nút Bày tỏ: gộp 4 cách bày tỏ (chắp tay, thương nhớ, dâng hoa, cầu an), bấm mới mở */
(function(){
 var g=document.querySelector('.hall-emo');if(!g)return;
 var t=document.createElement('button');t.type='button';t.className='emo-tog';t.setAttribute('aria-expanded','false');
 t.innerHTML='<span aria-hidden="true">🙏</span><span>Bày tỏ</span>';g.prepend(t);
 function set(o){g.classList.toggle('emo-mo',o);t.setAttribute('aria-expanded',o?'true':'false')}
 t.addEventListener('click',function(){set(!g.classList.contains('emo-mo'))});
 // chọn xong một cách bày tỏ thì thu lại (bộ xử lý cũ vẫn chạy trước)
 g.addEventListener('click',function(e){if(e.target.closest('[data-emo]'))setTimeout(function(){set(false)},0)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
})();
