(function(){var el=document.getElementById('loader');if(!el)return;document.documentElement.classList.add('is-loading');
  var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,MIN=red?400:3000,t0=Date.now(),loaded=false,done=false,pct=document.getElementById('ldPct'),bar=document.getElementById('ldBar'),shown=0;
  window.addEventListener('load',function(){loaded=true});
  function tick(){if(done)return;var d3=window.ss3dXong===false,el2=(Date.now()-t0)/MIN;   // d3: đang nạp chân núi 3D (js/26), chờ xong mới mở
    var target=Math.min(loaded&&!d3?1:.92*(d3?Math.max(.05,window.ss3dTien||0):1),el2);shown+=Math.max(0,target-shown)*.12;if(target>=1&&shown>.995)shown=1;
    var v=Math.round(shown*100);pct.textContent=(v<10?'00':v<100?'0':'')+v;bar.style.transform='scaleX('+shown+')';
    if(shown>=1)finish();else requestAnimationFrame(tick)}
  function finish(){if(done)return;done=true;pct.textContent='100';bar.style.transform='scaleX(1)';el.classList.add('out');document.documentElement.classList.remove('is-loading');document.documentElement.classList.add('loaded');
    setTimeout(function(){el.remove()},red?300:1500)}
  requestAnimationFrame(tick);setTimeout(function(){loaded=true},5000);
  // chặn cứng 8 giây; đang nạp 3D thì chờ tới 60 giây (mạng yếu), quá nữa thì mở, chân núi có màn chờ riêng
  // đếm bằng hẹn giờ, không dùng Date.now(): kiểm tra hình ảnh cố định đồng hồ
  var n=0;(function han(){if(done)return;n++;if(n>120||(n>16&&window.ss3dXong!==false))finish();else setTimeout(han,500)})();
})();
