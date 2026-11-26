/* Phòng chung trên máy chủ Song Song (functions/api/phong → phong/index.js, docs/phong-chung.md).
   Chỉ người đã đăng nhập Google mới vào; chưa đăng nhập thì đi một mình như bản demo.
   Cùng cách gọi với phòng chung của claude.ai (peers, presence, onPeers), nên js/03 và js/04-01 dùng chung phần vẽ người khác. */
(function(){
  var hua=null;
  window.ssPhong=function(){
    if(!hua)hua=fetch('/api/toi').then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(d){return d&&d.nguoi&&d.phong?mo():null});
    return hua};
  function mo(){
    var ws=null,ds={},nghe=[],dong=[],cuoi=null,daGui=0,hen=null,hong=0,het=false;
    function bao(){nghe.forEach(function(f){try{f()}catch(e){}})}
    function day(){hen=null;if(!cuoi||!ws||ws.readyState!==1)return;var w=Date.now()-daGui;if(w<200){hen=setTimeout(day,200-w);return}   // tối đa 5 tin mỗi giây
      daGui=Date.now();try{ws.send(JSON.stringify({p:cuoi}))}catch(e){}}
    function noi(){if(het)return;var ok=false;
      try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/api/phong')}catch(e){return}
      ws.onmessage=function(e){var m;try{m=JSON.parse(e.data)}catch(_){return}if(!m)return;
        if(m.t==='chao'){ok=true;hong=0;ds={};(m.ds||[]).forEach(function(x){if(x&&x.peer)ds[x.peer]=x.p});if(!cuoi)cuoi={h:0};day()}   // máy chủ đóng kết nối im lặng sau 30 giây
        else if(m.t==='p'&&m.peer)ds[m.peer]=m.p;else if(m.t==='di')delete ds[m.peer];else if(m.t==='het'){try{ws.close()}catch(_){}return}else return;bao()};
      ws.onclose=function(){ws=null;ds={};bao();if(het)return;if(!ok&&++hong>=3){thoi();return}   // ba lần không vào được (hết phiên, phòng đầy): thôi
        setTimeout(noi,Math.min(30000,1500*Math.pow(2,hong)))}}
    function thoi(){het=true;window.ssPhongDang=null;if(ws)try{ws.close()}catch(e){}ds={};hua=null;dong.forEach(function(f){try{f()}catch(e){}})}
    document.addEventListener('click',function(e){if(e.target.closest('[data-logout]'))thoi()});
    noi();
    var phong={peers:function(){return Object.keys(ds).filter(function(k){return !(ds[k]&&AN.indexOf(ds[k].u)>=0)}).map(function(k){return{peer:k,kind:'viewer',isMe:false,sameTab:false,presence:ds[k]}})},
      presence:function(p){cuoi=p;if(!hen)day();return Promise.resolve()},
      onPeers:function(f,c){nghe.push(f);if(c)dong.push(c)},
      tatCa:function(){return Object.keys(ds).map(function(k){return ds[k]}).filter(function(p){return p&&p.u})},
      an:function(u,bat){AN=AN.filter(function(x){return x!==u});if(bat)AN.unshift(u);AN=AN.slice(0,200);try{localStorage.setItem('ss-an',JSON.stringify(AN))}catch(e){}bao()},
      bao:function(u){try{ws&&ws.readyState===1&&ws.send(JSON.stringify({t:'bao',u:u}))}catch(e){}}};
    window.ssPhongDang=phong;return phong}
  // người đã ẩn (theo mã ẩn danh u máy chủ cấp), chỉ trên máy này
  var AN=[];try{AN=JSON.parse(localStorage.getItem('ss-an')||'[]');if(!Array.isArray(AN))AN=[]}catch(e){}
  // bấm ô số người trực tuyến: danh sách người trong phòng chung, nút Ẩn / Báo cáo (chỉ phòng của máy chủ Song Song)
  var hop=null;
  function dsHop(o){var R=window.ssPhongDang;if(!R)return;hop&&hop.remove();hop=document.createElement('div');hop.className='pc-ds';hop.setAttribute('role','dialog');hop.setAttribute('aria-label','Người đang trực tuyến');
    var ng=R.tatCa();if(!ng.length){hop.textContent='Chưa có ai khác trong phòng chung.'}
    ng.forEach(function(p){var h=document.createElement('div');h.className='pc-ng';var t=document.createElement('b');t.textContent=p.n||'Khách viếng';h.appendChild(t);
      var daAn=AN.indexOf(p.u)>=0,a=document.createElement('button');a.type='button';a.textContent=daAn?'Hiện lại':'Ẩn';a.onclick=function(){R.an(p.u,!daAn);dsHop(o)};
      var b=document.createElement('button');b.type='button';b.className='del';b.textContent='Báo cáo';
      b.onclick=function(){if(b.dataset.chac!=='1'){b.dataset.chac='1';b.textContent='Chắc chắn báo cáo?';return}R.bao(p.u);R.an(p.u,true);window.toast&&toast('Đã gửi báo cáo. Người này cũng đã được ẩn với bạn.');dsHop(o)};
      h.appendChild(a);h.appendChild(b);hop.appendChild(h)});
    var r=o.getBoundingClientRect();hop.style.top=Math.round(r.bottom+8)+'px';hop.style.right=Math.max(8,Math.round(innerWidth-r.right))+'px';document.body.appendChild(hop)}
  document.addEventListener('click',function(e){var o=e.target.closest('#hallOnline');if(o&&window.ssPhongDang){dsHop(o);return}if(hop&&!e.target.closest('.pc-ds')){hop.remove();hop=null}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&hop){hop.remove();hop=null}var o=e.target.closest&&e.target.closest('#hallOnline');if(o&&window.ssPhongDang&&(e.key==='Enter'||e.key===' ')){e.preventDefault();dsHop(o)}});
  var oh=document.getElementById('hallOnline');if(oh){oh.tabIndex=0;oh.setAttribute('role','button')}
})();
