/* Màn chọn lối là sảnh trong thế giới: người chơi đi tới cổng để chọn */
(function(){
 var gate=document.getElementById('gate'),hall=document.getElementById('hall');if(!gate||!hall)return;
 var tip=document.createElement('div');tip.className='sanh-tip';tip.innerHTML='<span>Chọn lối vào</span><button type="button" data-sp="g-phat">Phật giáo</button><button type="button" data-sp="g-cg">Công giáo</button>';tip.addEventListener('click',function(e){var b=e.target.closest('[data-sp]');if(!b)return;window.ssChonLoi&&ssChonLoi(b.dataset.sp.slice(2))});hall.appendChild(tip);
 function mark(){document.documentElement.classList.toggle('sanh-on',!hall.hidden&&hall.dataset.ws==='sanh')}
 new MutationObserver(mark).observe(hall,{attributes:true,attributeFilter:['data-ws','hidden']});
 function toSanh(){if(gate.hidden)return;gate.hidden=true;document.documentElement.classList.remove('gate-on');var W=window.ssWorld;if(!W){gate.hidden=false;return}
  W.set('sanh');if(hall.hidden&&window.ssHall)ssHall.open();setTimeout(function(){W.refresh()},60);mark()}
 new MutationObserver(function(){if(!gate.hidden)setTimeout(toSanh,0)}).observe(gate,{attributes:true,attributeFilter:['hidden']});
 if(!gate.hidden)setTimeout(toSanh,0);
 // chọn lối: dùng đúng luồng của cổng cũ (lưu lựa chọn, đổi lối, nhạc)
 var pick=document.createElement('button');pick.type='button';pick.hidden=true;gate.appendChild(pick);
 window.ssChonLoi=function(fa){if(window.ssAscend&&!ssAscend.busy&&fa!=='tt'){ssAscend(fa,function(){chon(fa)});return}chon(fa)};
 function chon(fa){pick.dataset.faith=fa;gate.classList.remove('go');pick.click();if(fa!=='tt'&&window.ssMusic)ssMusic.start(fa);if(window.ssBell)ssBell(fa);
  setTimeout(function(){var W=window.ssWorld;if(!W)return;if(fa==='tt'){W.fade('lang','Về làng…')}else if(window.ssAscend&&ssAscend.busy){W.set(W.home())}else W.fade(W.home(),fa==='cg'?'Vào nhà thờ…':'Vào chùa…')},60)}
})();
