/* Phi thăng: luồng sáng từ chân nhân vật, vòng sáng, hạt bay lên, mây cuốn, loé sáng rồi mở ra thế giới mới */
(function(){
 var T={phat:{c1:'255,205,110',c2:'255,240,200',c3:'255,244,220',ct:'122,70,14',t:'Phật giáo',sub:'Bước vào thế giới song song'},
        cg:{c1:'190,210,255',c2:'240,246,255',c3:'246,249,255',ct:'40,60,110',t:'Công giáo',sub:'Bước vào thế giới song song'}};
 function f(){};
 window.ssAscend=function(fa,mid){if(window.ss3dPhiThang&&ss3dPhiThang(fa,mid))return;   // thế giới 3D: cột sáng và bay lên trong cảnh (js/26)
  var c=T[fa]||T.phat;ssAscend.busy=true;var hl=document.getElementById('hall');hl&&hl.classList.add('no-splash');
  var me=document.querySelector('.hall .wa.me'),r=me?me.getBoundingClientRect():{left:innerWidth/2,top:innerHeight*.6,width:0,height:0};
  var x=r.left+r.width/2,y=r.top+r.height*.86;
  var o=document.createElement('div');o.className='asc';o.style.cssText='--x:'+x+'px;--y:'+y+'px;--c1:'+c.c1+';--c2:'+c.c2+';--c3:'+c.c3+';--ct:'+c.ct+';--bw:'+Math.max(120,r.width*1.6)+'px';
  var h='<i class="beam"></i><i class="core"></i><i class="ring"></i><i class="ring r2"></i><i class="ring r3"></i>';
  for(var i=0;i<46;i++){var pet=fa==='phat'&&i%3===0;h+='<i class="p'+(pet?' petal':'')+'" style="--px:'+(x+(Math.random()-.5)*Math.min(innerWidth*.6,420))+'px;--s:'+(pet?10+Math.random()*8:3+Math.random()*5)+'px;--t:'+(1.6+Math.random()*1.6)+'s;--dl:'+(.2+Math.random()*1.6)+'s;--dx:'+((Math.random()-.5)*160)+'px;--rise:'+(innerHeight*(.5+Math.random()*.6))+'px"></i>'}
  h+='<i class="cloud c1"></i><i class="cloud c2"></i><i class="flash"></i><div class="ttl">'+(window.ssHudSvg?ssHudSvg('vong'):'')+'<b>Song Song</b><small>'+c.sub+'</small></div>';
  o.innerHTML=h;document.body.appendChild(o);
  if(me)setTimeout(function(){me.classList.add('asc-rise')},250);
  try{window.ssBell&&ssBell(fa)}catch(e){}
  setTimeout(function(){mid&&mid()},2300);
  setTimeout(function(){var m=document.querySelector('.hall .wa.me');m&&m.classList.remove('asc-rise')},2500);
  setTimeout(function(){o.remove();ssAscend.busy=false},5200)};
})();
