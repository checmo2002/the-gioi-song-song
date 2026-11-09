/* Màn chọn lối là sảnh trong thế giới: người chơi đi tới cổng để chọn */
(function(){
 var gate=document.getElementById('gate'),hall=document.getElementById('hall');if(!gate||!hall)return;
 var tip=document.createElement('div');tip.className='sanh-tip';tip.innerHTML='<div class="st-dau"><svg class="st-lg" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 7.94A9 9 0 0 1 16 24.06A9 9 0 0 1 16 7.94Z" fill="#E2B04A"/><circle cx="12" cy="16" r="9" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="16" r="9" stroke="currentColor" stroke-width="1.6"/></svg><span>Chọn lối vào thế giới song song</span></div><div class="st-hai"><button type="button" class="st-the st-phat" data-sp="g-phat"><i class="st-ic"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5c3 4 3.5 9 0 15-3.5-6-3-11 0-15z"/><path d="M6 11c5 1 8.5 4.5 10 9-5-.5-9-3.5-10-9z"/><path d="M26 11c-5 1-8.5 4.5-10 9 5-.5 9-3.5 10-9z"/><path d="M5 22c4 3 18 3 22 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></i><b>Phật giáo</b><small>Thắp nhang · Cúng giỗ</small></button><button type="button" class="st-the st-cg" data-sp="g-cg"><i class="st-ic"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M14.5 3h3v7.5H25v3h-7.5V29h-3V13.5H7v-3h7.5z"/><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".7"><path d="M8 4l2 2M24 4l-2 2M4 18h2M26 18h2"/></g></svg></i><b>Công giáo</b><small>Thắp nến · Cầu nguyện</small></button></div>';tip.addEventListener('click',function(e){var b=e.target.closest('[data-sp]');if(!b)return;window.ssChonLoi&&ssChonLoi(b.dataset.sp.slice(2))});hall.appendChild(tip);
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
