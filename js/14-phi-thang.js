/* Phi thăng: luồng sáng từ chân nhân vật, vòng sáng, hạt bay lên, mây cuốn, loé sáng rồi mở ra thế giới mới */
(function(){
 var T={phat:{c1:'255,205,110',c2:'255,240,200',c3:'255,244,220',ct:'122,70,14',t:'Phật giáo',sub:'Bước vào thế giới song song'},
        cg:{c1:'190,210,255',c2:'240,246,255',c3:'246,249,255',ct:'40,60,110',t:'Công giáo',sub:'Bước vào thế giới song song'}};
 function f(){};
 // tiếng bay lên (tự tổng hợp, không dùng tệp): nền hợp âm phồng dần, chuỗi tiếng ngân lấp lánh đi lên, gió nhẹ cuốn theo.
 // Phật giáo: ngũ cung trầm ấm như đàn tranh, chuông đồng; Công giáo: hợp âm trưởng sáng như đàn organ, chuông nhỏ trong.
 var ac=null;
 function amBay(fa){var v=window.ssSfx?ssSfx():1;if(!v)return;
  try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){return}
  var t=ac.currentTime+.03,ra=window.ssRa?ssRa(ac):ac.destination,cg=fa==='cg',out=ac.createGain();out.gain.value=.9;out.connect(ra);
  var len=ac.sampleRate*3,ir=ac.createBuffer(2,len,ac.sampleRate);for(var c=0;c<2;c++){var d=ir.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}
  var cv=ac.createConvolver();cv.buffer=ir;var wet=ac.createGain();wet.gain.value=.6;cv.connect(wet);wet.connect(out);
  function hz(m){return 440*Math.pow(2,(m-69)/12)}
  function ra2(g){g.connect(out);g.connect(cv)}
  // nền: hợp âm phồng lên trong 1,6 giây rồi tắt dần
  (cg?[50,57,62,66,69]:[43,50,55,62,67]).forEach(function(m,k){var o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type=cg?'sawtooth':'triangle';o.frequency.value=hz(m);o.detune.value=(k-2)*4;
   lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.exponentialRampToValueAtTime(cg?2600:1800,t+1.6);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime((cg?.028:.05)/(1+k*.25),t+1.5);g.gain.exponentialRampToValueAtTime(.0001,t+3.4);o.connect(lp);lp.connect(g);ra2(g);o.start(t);o.stop(t+3.5)});
  // tiếng ngân lấp lánh đi lên
  var N=cg?[74,78,81,86,90,93,98]:[67,69,72,74,76,79,81,84];
  N.forEach(function(m,k){var tt=t+.25+k*.17,o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),g2=ac.createGain();o.type='sine';o2.type='sine';o.frequency.value=hz(m);o2.frequency.value=hz(m)*(cg?4:2.76);g2.gain.value=.18;
   g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.07,tt+.006);g.gain.exponentialRampToValueAtTime(.0001,tt+1.6);o.connect(g);o2.connect(g2);g2.connect(g);ra2(g);o.start(tt);o2.start(tt);o.stop(tt+1.7);o2.stop(tt+1.7)});
  // gió cuốn: tiếng xì lọc dải quét lên
  var nb=ac.createBuffer(1,ac.sampleRate*2.4,ac.sampleRate),nd=nb.getChannelData(0);for(var i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  var ns=ac.createBufferSource(),bp=ac.createBiquadFilter(),ng=ac.createGain();ns.buffer=nb;bp.type='bandpass';bp.Q.value=1.4;bp.frequency.setValueAtTime(350,t);bp.frequency.exponentialRampToValueAtTime(3200,t+2.1);
  ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(.05,t+1.2);ng.gain.linearRampToValueAtTime(0,t+2.3);ns.connect(bp);bp.connect(ng);ra2(ng);ns.start(t);ns.stop(t+2.4)}
 window.ssAmBay=amBay;
 window.ssAscend=function(fa,mid){amBay(fa);if(window.ss3dPhiThang&&ss3dPhiThang(fa,mid))return;   // thế giới 3D: cột sáng và bay lên trong cảnh (js/26)
  var c=T[fa]||T.phat;ssAscend.busy=true;var hl=document.getElementById('hall');hl&&hl.classList.add('no-splash');
  var me=document.querySelector('.hall .wa.me'),r=me?me.getBoundingClientRect():{left:innerWidth/2,top:innerHeight*.6,width:0,height:0};
  var x=r.left+r.width/2,y=r.top+r.height*.86;
  var o=document.createElement('div');o.className='asc';o.style.cssText='--x:'+x+'px;--y:'+y+'px;--c1:'+c.c1+';--c2:'+c.c2+';--c3:'+c.c3+';--ct:'+c.ct+';--bw:'+Math.max(120,r.width*1.6)+'px';
  var h='<i class="beam"></i><i class="core"></i><i class="ring"></i><i class="ring r2"></i><i class="ring r3"></i>';
  for(var i=0;i<46;i++){var pet=fa==='phat'&&i%3===0;h+='<i class="p'+(pet?' petal':'')+'" style="--px:'+(x+(Math.random()-.5)*Math.min(innerWidth*.6,420))+'px;--s:'+(pet?10+Math.random()*8:3+Math.random()*5)+'px;--t:'+(1.6+Math.random()*1.6)+'s;--dl:'+(.2+Math.random()*1.6)+'s;--dx:'+((Math.random()-.5)*160)+'px;--rise:'+(innerHeight*(.5+Math.random()*.6))+'px"></i>'}
  h+='<i class="cloud c1"></i><i class="cloud c2"></i><i class="flash"></i><div class="ttl">'+(window.ssHudSvg?ssHudSvg('vong'):'')+'<b>Song Song</b><small>'+c.sub+'</small></div>';
  o.innerHTML=h;document.body.appendChild(o);
  if(me)setTimeout(function(){me.classList.add('asc-rise')},250);
  setTimeout(function(){mid&&mid()},2300);
  setTimeout(function(){var m=document.querySelector('.hall .wa.me');m&&m.classList.remove('asc-rise')},2500);
  setTimeout(function(){o.remove();ssAscend.busy=false},5200)};
})();
