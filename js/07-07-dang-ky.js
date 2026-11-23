/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Tưởng niệm (đăng ký) / Thăm viếng (đăng nhập) ---------------- */
(function(){const m=$('#auth');let last=null;
  function tab(t){$$('.auth-tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));$('#fSignup').hidden=t!=='signup';$('#fLogin').hidden=t!=='login';setTimeout(()=>{const i=$(t==='signup'?'#aName':($('#lUser').value?'#lPass':'#lUser'));i&&i.focus()},30)}
  function open(t){last=document.activeElement;m.hidden=false;tab(t);document.body.style.overflow='hidden'}
  function close(){if(m.classList.contains('required')&&!document.body.classList.contains('signed'))return;m.hidden=true;m.classList.remove('required');document.body.style.overflow='';last&&last.focus&&last.focus()}
  window.ssAuthOpen=function(t,req){m.classList.toggle('required',!!req);var p=window.ssAuthPrefs?ssAuthPrefs():{};
    if(p.remember!==false&&p.id){$('#lUser').value=p.id;$('#aPhone').value||($('#aPhone').value=p.id);if(!t||req)t='login'}
    ['a','l'].forEach(k=>{$('#'+k+'Auto').checked=p.auto!==false;$('#'+k+'Rem').checked=p.remember!==false});open(t||'signup')};
  function savePrefs(k,id){const auto=$('#'+k+'Auto').checked,rem=$('#'+k+'Rem').checked;try{localStorage.setItem('ss-auth',JSON.stringify({auto,remember:rem,id:rem?id:''}));localStorage.removeItem('ss-out');sessionStorage.setItem('ss-session','1')}catch(e){}}
  document.addEventListener('click',e=>{const a=e.target.closest('[data-auth]');if(a){e.preventDefault();open(a.dataset.auth)}});
  m.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();const t=e.target.closest('[data-tab]');if(t)tab(t.dataset.tab)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)close()});
  // trạng thái đã vào: thay hai nút bằng lời chào (bản trình diễn, chưa có tài khoản thật)
  const slots=$$('.nav-auth,.msheet-auth'),orig=slots.map(el=>el.innerHTML);let user='';
  function setUser(n){user=n;slots.forEach((el,i)=>{el.innerHTML=n?`<a class="nav-user" href="#ca-nhan" title="Trang cá nhân"><i>${esc(n.trim().split(/\s+/).pop()[0]||'?')}</i>Chào, ${esc(n.trim().split(/\s+/).pop())}</a><button class="btn ghost" data-logout>Thoát</button>`:orig[i]})}
  document.addEventListener('click',e=>{if(e.target.closest('[data-logout]')){setUser('');ssMe.logout();try{localStorage.setItem('ss-out','1');sessionStorage.removeItem('ss-session')}catch(_){}setView('intro','dau-trang',true);document.documentElement.classList.add('pre-enter');scrollTo(0,0);window.ssAuthOpen('login',true);addEventListener('ss-auth-done',function(){document.documentElement.classList.remove('pre-enter')},{once:true})}});
  $('#fSignup').addEventListener('submit',e=>{e.preventDefault();const n=$('#aName').value.trim();if(!n){$('#aName').focus();return}ssMe.signup(n,$('#aPhone').value.trim());savePrefs('a',$('#aPhone').value.trim());document.body.classList.add('signed');close();dispatchEvent(new Event('ss-auth-done'));setUser(n);setView('app','ca-nhan',true);setTimeout(()=>toast('Chào mừng '+n+'. Hãy bắt đầu lập gia phả.'),500)});
  $('#fLogin').addEventListener('submit',e=>{e.preventDefault();const n=ssMe.login($('#lUser').value.trim());savePrefs('l',$('#lUser').value.trim());document.body.classList.add('signed');close();dispatchEvent(new Event('ss-auth-done'));setUser(n);setView('app','ca-nhan',true);setTimeout(()=>toast('Chào mừng trở lại, '+n+'.'),500)});
  window.ssSetUser=setUser;
  // Đăng nhập bằng Google (máy chủ gia phả, functions/api): nút chỉ hiện khi máy chủ bật Google.
  // Vừa đăng nhập Google xong (?dang-nhap=ok) thì vào luôn tài khoản trên máy này bằng tên Google, không hỏi mật khẩu.
  const vuaGoogle=/[?&]dang-nhap=ok\b/.test(location.search);
  if(vuaGoogle)try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
  fetch('/api/toi').then(r=>r.ok?r.json():null).catch(()=>null).then(d=>{if(!d||!Array.isArray(d.cach)||!d.cach.includes('google'))return;$('#authGg').hidden=false;
    const t=d.nguoi;if(!t||!vuaGoogle||document.body.classList.contains('signed'))return;
    const n=ssMe.resume()||(ssMe.signup(t.ten,'Tài khoản Google'),t.ten);
    try{localStorage.setItem('ss-auth',JSON.stringify({auto:true,remember:true,id:''}));localStorage.removeItem('ss-out');sessionStorage.setItem('ss-session','1')}catch(e){}
    document.body.classList.add('signed');close();dispatchEvent(new Event('ss-auth-done'));setUser(n);setView('app','ca-nhan',true);setTimeout(()=>toast('Chào mừng '+n+'.'),500)});
})();
