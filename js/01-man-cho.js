(function(){var el=document.getElementById('loader');if(!el)return;document.documentElement.classList.add('is-loading');
  var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,MIN=red?400:3000,t0=Date.now(),loaded=false,done=false,pct=document.getElementById('ldPct'),bar=document.getElementById('ldBar'),shown=0;
  window.addEventListener('load',function(){loaded=true});
  function tick(){if(done)return;var el2=(Date.now()-t0)/MIN,target=Math.min(loaded?1:.92,el2);shown+=(target-shown)*.12;if(target>=1&&shown>.995)shown=1;
    var v=Math.round(shown*100);pct.textContent=(v<10?'00':v<100?'0':'')+v;bar.style.transform='scaleX('+shown+')';
    if(shown>=1)finish();else requestAnimationFrame(tick)}
  function finish(){if(done)return;done=true;pct.textContent='100';bar.style.transform='scaleX(1)';el.classList.add('out');document.documentElement.classList.remove('is-loading');document.documentElement.classList.add('loaded');
    setTimeout(function(){el.remove()},red?300:1500)}
  requestAnimationFrame(tick);setTimeout(function(){loaded=true},5000);setTimeout(finish,8000);
})();
