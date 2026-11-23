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
        if(m.t==='chao'){ok=true;hong=0;ds={};(m.ds||[]).forEach(function(x){if(x&&x.peer)ds[x.peer]=x.p});day()}
        else if(m.t==='p'&&m.peer)ds[m.peer]=m.p;else if(m.t==='di')delete ds[m.peer];else return;bao()};
      ws.onclose=function(){ws=null;ds={};bao();if(het)return;if(!ok&&++hong>=3){thoi();return}   // ba lần không vào được (hết phiên, phòng đầy): thôi
        setTimeout(noi,Math.min(30000,1500*Math.pow(2,hong)))}}
    function thoi(){het=true;if(ws)try{ws.close()}catch(e){}ds={};hua=null;dong.forEach(function(f){try{f()}catch(e){}})}
    document.addEventListener('click',function(e){if(e.target.closest('[data-logout]'))thoi()});
    noi();
    return {peers:function(){return Object.keys(ds).map(function(k){return{peer:k,kind:'viewer',isMe:false,sameTab:false,presence:ds[k]}})},
      presence:function(p){cuoi=p;if(!hen)day();return Promise.resolve()},
      onPeers:function(f,c){nghe.push(f);if(c)dong.push(c)}}}
})();
