/* Đài tưởng niệm liệt sĩ: thắp nén nhang tri ân + gửi lời tri ân (lưu trên máy) */
(function(){
 var KN='ss-dai',KT='ss-dai-ta';
 function ld(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
 function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 function esc(t){return String(t).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
 function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 var FLAG='<svg viewBox="0 0 30 20"><rect width="30" height="20" rx="2" fill="#DA251D" stroke="#FFE9A8" stroke-width="1"/><path fill="#FFDF00" d="M15 4.2l1.6 4.9h5.1l-4.1 3 1.6 4.9-4.2-3-4.2 3 1.6-4.9-4.1-3h5.1z"/></svg>';
 var IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v11M8 6v8M16 6v8M5 18h14l-1.5 3h-11z"/></svg>';
 var PEN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
 var el=document.createElement('div');el.className='dai';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label','Đài tưởng niệm liệt sĩ');document.body.appendChild(el);
 function feed(){var L=ld(KT,[]);return L.length?L.slice(0,20).map(function(t){return '<div>'+esc(t.b)+'<small>— '+esc(t.n||'Khách viếng')+' · '+new Date(t.at).toLocaleDateString('vi-VN')+'</small></div>'}).join(''):'<p>Chưa có lời tri ân nào. Hãy là người đầu tiên.</p>'}
 function draw(){var st=ld(KN,{n:0,at:''}),done=st.at===today();
  el.innerHTML='<div class="dai-c"><div class="dai-hd">'+FLAG+'<div><b>Đài tưởng niệm</b><small>Tổ quốc ghi công các anh hùng liệt sĩ</small></div><button type="button" class="dai-x" aria-label="Đóng">×</button></div>'+
   '<div class="dai-alt'+(done?' lit':'')+'"><div class="dai-urn"><span class="dai-smk a"></span><span class="dai-smk b"></span><span class="dai-smk c"></span><span class="dai-stk a"></span><span class="dai-stk b"></span><span class="dai-stk c"></span><div class="dai-bowl"><span>TỔ QUỐC GHI CÔNG</span></div></div>'+
   '<div class="dai-inc"><b>'+st.n.toLocaleString('vi-VN')+'</b><span>nén nhang bạn đã thắp</span></div>'+
   '<button type="button" class="dai-go"'+(done?' disabled':'')+'>'+IC+(done?'Đã thắp hôm nay':'Thắp nén nhang')+'</button></div>'+
   '<form class="dai-say"><h4>'+PEN+'Gửi lời tri ân</h4><textarea maxlength="300" placeholder="Con cháu xin ghi nhớ công ơn…" required></textarea><div class="dai-row"><input maxlength="40" placeholder="Ký tên"><button type="submit">Gửi</button></div></form>'+
   '<div class="dai-fd">'+feed()+'</div>'+
   '<a class="dai-lk" href="https://claude.ai/artifact/PcjcGNqnujt2DMobWqPoyo" target="_blank" rel="noopener">Tìm mộ liệt sĩ · Về Với Đồng Đội ↗</a></div>'}
 el.addEventListener('click',function(e){
  if(e.target===el||e.target.closest('.dai-x')){el.hidden=true;return}
  var g=e.target.closest('.dai-go');if(!g||g.disabled)return;
  var st=ld(KN,{n:0,at:''});st.n+=1;st.at=today();sv(KN,st);
  var a=el.querySelector('.dai-alt');a.classList.add('lit','flash');setTimeout(function(){a.classList.remove('flash')},900);
  el.querySelector('.dai-inc b').textContent=st.n.toLocaleString('vi-VN');g.disabled=true;g.innerHTML=IC+'Đã thắp hôm nay';
  try{window.ssMo&&ssMo.add&&ssMo.add(27,'Thắp nhang Đài tưởng niệm')}catch(_){}
  window.toast&&toast('Đã thắp nén nhang tri ân các anh hùng liệt sĩ')});
 el.addEventListener('submit',function(e){e.preventDefault();var f=e.target,b=f.querySelector('textarea').value.trim();if(!b)return;
  var L=ld(KT,[]);L.unshift({b:b,n:f.querySelector('input').value.trim(),at:Date.now()});sv(KT,L.slice(0,100));
  f.reset();el.querySelector('.dai-fd').innerHTML=feed();window.toast&&toast('Đã gửi lời tri ân')});
 document.addEventListener('keydown',function(e){if(!el.hidden&&e.key==='Escape')el.hidden=true});
 window.ssDai=function(){draw();el.hidden=false};
})();
