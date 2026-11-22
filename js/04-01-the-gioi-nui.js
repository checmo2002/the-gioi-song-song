/* ===== Thế giới núi (lối Phật giáo): chân núi -> lên núi -> chính điện, nhân vật 3D dựng sẵn ===== */
(function(){
 var hall=document.getElementById('hall'),W=document.getElementById('world');if(!hall||!W)return;
 var stage=document.getElementById('wStage'),bg=stage.querySelector('.w-bg'),hot=document.getElementById('wHot'),fl=document.getElementById('wFloor'),trans=document.getElementById('wTrans');
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Dữ liệu cảnh: toạ độ theo tỉ lệ ảnh (0..1), đo từ camera Blender
 var SC={
  chan:{
   floor:{h:{t:.805,b:.965,tx:[.24,.76],bx:[.02,.98]},v:{t:.74,b:.95,tx:[.03,.97],bx:[.02,.98]}},
   scale:{h:[[.8055,.0259],[.83,.0365],[.8873,.0613],[.97,.095]],v:[[.7387,.0233],[.7629,.0375],[.8578,.0946],[.95,.15]]},
   spawn:[.5,.86],
   hot:{h:[{x:.5,y:.6,id:'len',t:'Lên núi thắp nhang',s:'Qua cổng tam quan',main:1},{x:.511,y:.43,id:'len',t:'Chính điện',s:'Trên đỉnh núi'},{x:.1,y:.68,id:'lang',t:'Làng tưởng niệm',s:'Nhà của người thân'}],_old:[
      {x:.44,y:.665,h:'#cua-hang',t:'Dâng lễ vật',s:'Quầy lễ'},{x:.726,y:.645,id:'cal',t:'Gác chuông',s:'Lịch vạn niên'},
      {x:.07,y:.62,h:'#ho-so',t:'Nhà tưởng niệm',s:'Hồ sơ người đã khuất'},{x:.93,y:.64,h:'#ban-do',t:'Nhà bia',s:'Bản đồ mộ phần'}],
    v:[{x:.5,y:.575,id:'len',t:'Lên núi thắp nhang',s:'Qua cổng tam quan',main:1},{x:.516,y:.49,id:'len',t:'Chính điện',s:'Trên đỉnh núi'},{x:.16,y:.66,id:'lang',t:'Làng tưởng niệm',s:'Nhà người thân'}]},
   signs:{h:{l:[],r:[]},v:{l:[],r:[]}}},
  dien:{
   floor:{h:{t:.70,b:.985,tx:[.22,.78],bx:[.02,.98]},v:{t:.6,b:.985,tx:[.3,.7],bx:[.02,.98]}},
   scale:{h:[[.6933,.1434],[.894,.238],[1.0,.29]],v:[[.5845,.0576],[.6637,.0916],[.996,.2212]]},
   spawn:[.5,.93],pray:{h:[.5,.715],v:[.5,.6]},
   hot:{h:[{x:.5,y:.54,id:'nhang',t:'Thắp nhang',s:'Trước bàn thờ Phật',main:1}],
    v:[{x:.5,y:.505,id:'nhang',t:'Thắp nhang',s:'Trước bàn thờ Phật',main:1}]},
   signs:{h:{l:[],r:[]},v:{l:[],r:[]}}},
 "lang":{"floor":{"h":{"t":0.6506,"b":0.975,"tx":[0.1777,0.8223],"bx":[0.02,0.98]},"v":{"t":0.6,"b":0.95,"tx":[0.02,0.98],"bx":[0.02,0.98]}},"scale":{"h":[[0.6506,0.0603],[0.6807,0.0665],[0.7179,0.0741],[0.7649,0.0836],[0.8262,0.096],[0.9095,0.1125],[0.975,0.1255]],"v":[[0.5447,0.0304],[0.564,0.0343],[0.5896,0.0396],[0.625,0.0469],[0.6771,0.0573],[0.7613,0.0737],[0.95,0.1105]]},"spawn":[0.5,0.9],"hot":{"h":[{"x":0.1599,"y":0.19430000000000003,"id":"xom-ls","t":"Đồi Tri Ân","s":"Liệt sĩ"},{"x":0.1243,"y":0.427,"id":"xom-tb","t":"Xóm Đồng Đội","s":"Thương binh"},{"x":0.5,"y":0.4086,"id":"xom-dh","t":"Xóm Dòng Họ","s":"Ông bà, tổ tiên"},{"x":0.8757,"y":0.427,"id":"xom-nt","t":"Xóm Bình Yên","s":"Người thân"}],"v":[{"x":-0.0304,"y":0.34409999999999996,"id":"xom-ls","t":"Đồi Tri Ân","s":"Liệt sĩ"},{"x":-0.0914,"y":0.4328,"id":"xom-tb","t":"Xóm Đồng Đội","s":"Thương binh"},{"x":0.5,"y":0.4245,"id":"xom-dh","t":"Xóm Dòng Họ","s":"Ông bà, tổ tiên"},{"x":1.0914,"y":0.4328,"id":"xom-nt","t":"Xóm Bình Yên","s":"Người thân"}]},"signs":{"h":{"l":[],"r":[]},"v":{"l":[],"r":[]}}},"nha":{"floor":{"h":{"t":0.8175,"b":0.985,"tx":[0.3128,0.6872],"bx":[0.1975,0.8025]},"v":{"t":0.705,"b":0.95,"tx":[0.0682,0.9318],"bx":[0.02,0.98]}},"scale":{"h":[[0.8175,0.2637],[0.8352,0.2743],[0.8544,0.2857],[0.8754,0.2983],[0.8982,0.3118],[0.9233,0.3268],[0.985,0.3637]],"v":[[0.705,0.1918],[0.7275,0.2067],[0.7537,0.224],[0.785,0.2446],[0.8227,0.2691],[0.8693,0.2993],[0.95,0.3516]]},"spawn":[0.5,0.95],"pray":{"h":[0.5,0.8433],"v":[0.5,0.7318]},"anh":{"h":[0.4778,0.3367,0.5222,0.4412],"v":[0.4538,0.3672,0.5462,0.4364]},"hot":{"h":[{"x":0.5,"y":0.547,"id":"nhang","t":"Thắp hương","s":"Trước bàn thờ","main":1}],"v":[{"x":0.5,"y":0.5126,"id":"nhang","t":"Thắp hương","s":"Trước bàn thờ","main":1}]},"signs":{"h":{"l":[],"r":[]},"v":{"l":[],"r":[]}}}
 };
 Object.assign(SC,window.SS_CANH);
 window.__SC_HO_REF=SC.ho;
 window.__SC_LANG_REF=SC.lang;
 (function(){var K=1.9;['chan','lang'].forEach(function(k){var c=SC[k];c.zoom={h:1.32*K,v:1.5*K};c.mult=+(c.mult/K).toFixed(3)});
  ['dien','tho','nha'].forEach(function(k){var c=SC[k];c.zoom={h:c.zoom.h*1.5,v:c.zoom.v*1.5};c.mult=+(c.mult/1.5).toFixed(3)})})();
 var KIND=['nu','nam'],ANIM={di:8,dung:1,chap:1,ngoi:1,lay:6},CELL={w:128,h:192},FEET=.86,BODY=.72;
 function RES(){var b=hall.querySelector('.w-bar'),l=hall.querySelector('.hall-list');var r=12;if(b)r+=b.offsetHeight+10;if(l&&getComputedStyle(l).display!=='none'&&!l.classList.contains('open'))r+=l.offsetHeight;return r}
 function orient(){return hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h'}
 var O=orient(),scene='chan',st={sw:1,sh:1};
 function myName(){try{var m=JSON.parse(localStorage.getItem('ss-me')||'null');var n=m&&m.user&&m.user.name;if(n)return String(n).trim().slice(0,22)}catch(e){}return 'Khách viếng'}
 var kind=0;try{kind=+(localStorage.getItem('ss-nv')||(Math.random()<.5?0:1))||0;localStorage.setItem('ss-nv',kind)}catch(e){}
 var me={x:.5,y:.86,tx:.5,ty:.86,d:4,a:'dung',k:kind,e:null,s:'chan',tc:''},room=null,av={},last=0;
 function on(){return hall.classList.contains('world-on')}
 function active(){return true}
 function homeScene(){return window.ssFaith==='cg'?'tho':'chan'}
 // ---- bố cục sân khấu (phủ kín như background-size: cover)
 function layoutMap(){O=orient();var c=SC[scene],A=c.aspect,Wd=hall.clientWidth,Hd=hall.clientHeight,sh=Hd*(c.zoom?c.zoom[O]:(O==='v'?1.5:1.32))*(window.ssZoomK?ssZoomK(O):1),sw=sh*A;if(sw<Wd*1.08){sw=Wd*1.08;sh=sw/A}if(sh<Hd){sh=Hd;sw=sh*A}
  st={sw:sw,sh:sh,top:0,H:Hd,map:1,l:null,t:null};stage.style.width=sw+'px';stage.style.height=sh+'px';drawAnh();drawHot();follow(true);Object.keys(av).forEach(function(k){draw(av[k])})}
 var PAN={x:0,y:0,d:false},pz=null,pn=0,panBack=0;
 /* kéo nền: dịch camera; thả ra một nhịp thì trượt về nhân vật */
 stage.addEventListener('pointerdown',function(e){if(!st.map||e.button>0)return;pn++;if(pn>1){pz=null;PAN.d=false;return}clearTimeout(panBack);pz={x:e.clientX,y:e.clientY,ox:PAN.x,oy:PAN.y,m:false,id:e.pointerId}});
 addEventListener('pointermove',function(e){if(!pz||e.pointerId!==pz.id)return;var dx=e.clientX-pz.x,dy=e.clientY-pz.y;if(!pz.m&&Math.hypot(dx,dy)<8)return;
  if(!pz.m){pz.m=true;PAN.d=true;hall.classList.add('w-pan')}
  var Wd=hall.clientWidth,Hd=hall.clientHeight;PAN.x=Math.max(-st.sw,Math.min(st.sw,pz.ox+dx));PAN.y=Math.max(-st.sh,Math.min(st.sh,pz.oy+dy));follow(true)});
 function panEnd(e){pn=Math.max(0,pn-1);if(!pz||e.pointerId!==pz.id)return;var m=pz.m;pz=null;PAN.d=false;hall.classList.remove('w-pan');
  if(m){window.__wPanned=Date.now();/* điểm camera đang đứng có thể vượt giới hạn: kéo PAN về đúng chỗ nhìn thấy rồi mới trượt */
   var p=av.me||me,Wd=hall.clientWidth,Hd=hall.clientHeight,res=RES();PAN.x=st.l-(Wd/2-p.x*st.sw);PAN.y=st.t-((Hd-res)*.55-p.y*st.sh);
   panBack=setTimeout(function(){PAN.x=0;PAN.y=0},450)}}
 addEventListener('pointerup',panEnd);addEventListener('pointercancel',panEnd);
 /* vừa kéo xong thì không tính là chạm để đi / bấm nhãn */
 addEventListener('click',function(e){if(window.__wPanned&&Date.now()-window.__wPanned<300&&hall.contains(e.target)){e.stopPropagation();e.preventDefault()}},true);
 function follow(now){if(!st.map)return;var p=av.me||me,Wd=hall.clientWidth,Hd=hall.clientHeight,res=RES(),tl=Math.max(Wd-st.sw,Math.min(0,Wd/2-p.x*st.sw+PAN.x)),tt=Math.max(Hd-res-st.sh+res*.0,Math.min(0,(Hd-res)*.55-p.y*st.sh+PAN.y));tt=Math.max(Hd-st.sh,tt);
  if(now||PAN.d||st.l===null){st.l=tl;st.t=tt}else{st.l+=(tl-st.l)*.08;st.t+=(tt-st.t)*.08}stage.style.left=st.l.toFixed(1)+'px';stage.style.top=st.t.toFixed(1)+'px'}
 function layout(){if(SC[scene].map){layoutMap();return}O=orient();A=O==='v'?9/16:16/9,Wd=hall.clientWidth,Hd=hall.clientHeight,sw,sh;
  var top;if(Wd/Hd>A){sw=Wd;sh=Wd/A}else{sh=Hd;sw=Hd*A}
  if(O==='v'){var f=SC[scene].floor.v,yT=scene==='chan'?.42:scene==='lang'?.12:.25,head=100,res=RES();sh=Math.max(sh,(Hd-res-head)/(f.b-yT));sw=sh*A;if(sw<Wd){sw=Wd;sh=sw/A}
   top=Math.max(Hd-sh,Math.min(0,(Hd-res)-f.b*sh))}else top=(Hd-sh)*.5;
  st={sw:sw,sh:sh,top:top,H:Hd,map:0};stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=(Wd-sw)/2+'px';stage.style.top=top+'px';
  drawAnh();drawHot();Object.keys(av).forEach(function(k){draw(av[k])})}
 function drawAnh(){var a=hall.querySelector('.w-anh');   // hall: thế giới 3D (js/26) chuyển di ảnh sang lớp riêng
 if(scene!=='nha'){a&&a.remove();return}if(!a){a=document.createElement('div');a.className='w-anh';stage.insertBefore(a,fl)}
  var r=SC.nha.anh[O],p=window.ssPerson&&ssPerson.get();a.style.left=r[0]*100+'%';a.style.top=r[1]*100+'%';a.style.width=(r[2]-r[0])*100+'%';a.style.height=(r[3]-r[1])*100+'%';
  var C={ls:'#8B3A1E',tb:'#2F5D8A',dh:'#4E7A3A',nt:'#7A4A8C'};a.style.setProperty('--c',p&&C[p.c]||'#8B5A2B');a.innerHTML='';if(p){var i=document.createElement('i');i.textContent=String(p.name).trim().split(/\s+/).pop()[0]||'';a.appendChild(i)};a.title=p?p.name:''}
 function drawHot(){var c=SC[scene];hot.innerHTML='';var list=c.hot[O].slice();
  if(c.map&&c.slots&&window.ssPerson){var used={};ssPerson.all().forEach(function(p){var sl=c.slots[p.c];if(!sl)return;used[p.c]=used[p.c]||0;var q=sl[used[p.c]++];if(!q)return;list.push({x:q.top[0],y:q.top[1],id:'p:'+p.id,t:p.name,s:p.c==='ls'?'Mộ liệt sĩ':'Nhà tưởng niệm',pn:1})})}
  list.forEach(function(h){var a=document.createElement(h.id?'button':'a');a.className='wh'+(h.main?' main':'')+(h.pn?' pn':'')+(h.z?' zn':'');if(h.id)a.type='button',a.dataset.w=h.id;else a.href=h.h;if(h.cal)a.setAttribute('data-open-cal','');
   var L=parseFloat(stage.style.left)||0,vx0=-L/st.sw,vx1=(hall.clientWidth-L)/st.sw,xx=st.map?h.x:Math.max(vx0+Math.max(.075,80/st.sw),Math.min(vx1-Math.max(.075,80/st.sw),h.x));a.style.left=(xx*100)+'%';a.style.top=(h.y*100)+'%';a.innerHTML='<i class="wh-dot"></i><span class="wh-lb"><i class="wh-ic"></i><b></b><small></small></span>';a.querySelector('b').textContent=h.short||h.t;a.querySelector('small').textContent=h.s;a.title=h.t+(h.s?' · '+h.s:'');window.ssHudIcon&&ssHudIcon(a.querySelector('.wh-ic'),h);a.style.setProperty('--d',(hot.children.length*70)+'ms');hot.appendChild(a)});
  ['l','r'].forEach(function(side){var list=c.signs[O][side];if(!list.length)return;var g=document.createElement('div');g.className='wsign '+side;
   list.forEach(function(s){var a=document.createElement('a');a.href=s[0];a.textContent=(side==='l'?'‹ ':'')+s[1]+(side==='r'?' ›':'');g.appendChild(a)});W.querySelector('.w-signs').appendChild(g)})}
 function clearSigns(){W.querySelector('.w-signs').innerHTML=''}
 function scaleAt(y){if(SC[scene].map)return SC[scene].ps*SC[scene].mult;return rawScale(y)*(scene==='chan'?(O==='v'?1.0:1.55):scene==='lang'?(O==='v'?1.5:1.2):scene==='nha'?(O==='v'?.72:.9):1)}
 function rawScale(y){var t=SC[scene].scale[O];if(y<=t[0][0])return t[0][1]*(y/t[0][0]);for(var i=1;i<t.length;i++)if(y<=t[i][0]){var a=t[i-1],b=t[i],u=(y-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*u}return t[t.length-1][1]}
 function clampFloor(x,y){if(SC[scene].map)return gridNear(x,y);var f=SC[scene].floor[O],yb=f.b;if(O==='v'&&st.H)yb=Math.min(f.b,(st.H-RES()-6-st.top)/st.sh);y=Math.max(f.t,Math.min(Math.max(f.t+.02,yb),y));var u=(y-f.t)/(f.b-f.t),x0=f.tx[0]+(f.bx[0]-f.tx[0])*u,x1=f.tx[1]+(f.bx[1]-f.tx[1])*u;return [Math.max(x0,Math.min(x1,x)),y]}
 function walk(i,j){var g=SC[scene].grid;return i>=0&&j>=0&&i<g.w&&j<g.h&&g.rows[j].charAt(i)==='1'}
 function gridNear(x,y){var g=SC[scene].grid,i=Math.floor(x*g.w),j=Math.floor(y*g.h);if(walk(i,j))return [Math.max(0,Math.min(1,x)),Math.max(0,Math.min(1,y))];
  for(var r=1;r<40;r++){var best=null,bd=1e9;for(var dj=-r;dj<=r;dj++)for(var di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(walk(i+di,j+dj)){var d=di*di+dj*dj*2.25;if(d<bd){bd=d;best=[(i+di+.5)/g.w,(j+dj+.5)/g.h]}}}if(best)return best}return [x,y]}
 function cellOf(x,y){var g=SC[scene].grid,c=gridNear(x,y);return [Math.min(g.w-1,Math.floor(c[0]*g.w)),Math.min(g.h-1,Math.floor(c[1]*g.h))]}
 function los(a,b){var g=SC[scene].grid,n=Math.ceil(Math.hypot((b[0]-a[0])*g.w,(b[1]-a[1])*g.h)*2)+1;for(var i=0;i<=n;i++){var u=i/n;if(!walk(Math.floor((a[0]+(b[0]-a[0])*u)*g.w),Math.floor((a[1]+(b[1]-a[1])*u)*g.h)))return false}return true}
 function pathTo(x0,y0,x1,y1){var g=SC[scene].grid,W=g.w,Hh=g.h,s0=cellOf(x0,y0),t=cellOf(x1,y1),S=s0[1]*W+s0[0],T=t[1]*W+t[0],prev=new Int32Array(W*Hh).fill(-1),q=[S],h=0;prev[S]=S;
  var D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];while(h<q.length){var c=q[h++];if(c===T)break;var cx=c%W,cy=(c/W)|0;for(var k=0;k<8;k++){var nx=cx+D[k][0],ny=cy+D[k][1];if(!walk(nx,ny))continue;if(k>3&&(!walk(cx+D[k][0],cy)||!walk(cx,cy+D[k][1])))continue;var ni=ny*W+nx;if(prev[ni]<0){prev[ni]=c;q.push(ni)}}}
  var end=[x1,y1];if(prev[T]<0){var bd=1e9;for(var k2=0;k2<q.length;k2++){var c2=q[k2],d2=Math.pow(c2%W-t[0],2)+Math.pow(((c2/W)|0)-t[1],2);if(d2<bd){bd=d2;T=c2}}end=[(T%W+.5)/W,(((T/W)|0)+.5)/Hh]}   // đích không tới được (bấm ra cỏ, mái, vùng rời): đi tới ô gần đích nhất trong vùng đang đứng, không đi thẳng xuyên địa hình
  if(T===S)return [end];var pts=[],c=T;while(c!==S){pts.push([(c%W+.5)/W,(((c/W)|0)+.5)/Hh]);c=prev[c]}pts.reverse();pts[pts.length-1]=end;
  var out=[],cur=[x0,y0],i=0;while(i<pts.length){var j=pts.length-1;while(j>i&&!los(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1}return out}
 // ---- nhân vật
 function mk(id,isMe){var el=document.createElement('div');el.className='wa arrive'+(isMe?' me':'');el.innerHTML='<span class="wa-sh"></span><span class="wa-spr"></span><span class="wa-tag"></span>';fl.appendChild(el);setTimeout(function(){el.classList.remove('arrive')},900);
  return {id:id,el:el,spr:el.querySelector('.wa-spr'),x:.5,y:.9,tx:.5,ty:.9,d:4,a:'dung',k:0,f:0,me:isMe,lay:0}}
 function draw(p){var ph=scaleAt(p.y)*st.sh,ch=ph/BODY,cw=ch*CELL.w/CELL.h,n=ANIM[p.a]||1,fi=Math.min(n-1,Math.floor(p.f)%n);
  p.el.style.transform='translate('+(p.x*st.sw-cw/2)+'px,'+(p.y*st.sh-ch*FEET)+'px)';p.el.style.width=cw+'px';p.el.style.height=ch+'px';p.el.style.zIndex=Math.round(p.y*1000);
  
  p.spr.style.backgroundSize=(cw*n)+'px '+(ch*8)+'px';p.spr.style.backgroundPosition=(-fi*cw)+'px '+(-p.d*ch)+'px';p.el.style.setProperty('--fs',Math.max(10,Math.min(14,ch*.07))+'px')}
 function dirOf(dx,dy){var a=Math.atan2(dx*st.sw,dy*st.sh)/(Math.PI/4);return ((Math.round(a)%8)+8)%8}
 function tick(t){var dt=Math.min(.1,(t-(last||t))/1000);last=t;
  Object.keys(av).forEach(function(k){var p=av[k],dx=p.tx-p.x,dy=p.ty-p.y,dpx=Math.hypot(dx*st.sw,dy*st.sh);
   if(dpx<=1.5&&p.path&&p.path.length){var nq=p.path.shift();p.tx=nq[0];p.ty=nq[1];dx=p.tx-p.x;dy=p.ty-p.y;dpx=Math.hypot(dx*st.sw,dy*st.sh)}
   if(dpx>1.5){var sp=scaleAt(p.y)*st.sh*(st.map?3.0*(window.ss3dTocDo||1)*(k==='me'?1.7:1):.8)*dt,u=Math.min(1,sp/dpx),nx=p.x+dx*u,ny=p.y+dy*u;if(st.map){var g=SC[scene].grid;if(!walk(Math.floor(nx*g.w),Math.floor(ny*g.h))){if(walk(Math.floor(nx*g.w),Math.floor(p.y*g.h)))ny=p.y;else if(walk(Math.floor(p.x*g.w),Math.floor(ny*g.h)))nx=p.x}}p.x=nx;p.y=ny;p.d=dirOf(dx,dy);if(p.a!=='di'){p.a='di';p.f=0}p.f+=dt*10;p.arr=0}
   else{if(p.a==='di'){p.a=p.want||'dung';p.f=0;if(p.faceUp)p.d=4}
    if(p.a==='lay'){p.f+=dt*2.6;if(p.f>=5.99){p.a='chap';p.f=0}}}
   if(p.me&&pend&&dpx<=1.5&&!(p.path&&p.path.length)){var q=pend;pend=null;if(!hall.hidden)q()}   // đã rời thế giới trong lúc đi: bỏ việc đang chờ (#80)
   draw(p)});
  if(st.map&&on())follow(false);
  requestAnimationFrame(tick)}
 var pend=null;
 function upsert(id,pr,isMe){var p=av[id];if(!p){p=av[id]=mk(id,isMe);if(!isMe){p.x=+pr.x||.5;p.y=+pr.y||.9}}
  p.k=pr.k===1?1:0;p.tc=window.ssNVTC&&ssNVTC.doc(pr.tc)?pr.tc:'';   // kiểu nhân vật tự tạo (js/31), của người khác thì kiểm tra trước khi dùng
if(!isMe){var tx=+pr.tx,ty=+pr.ty;if(isFinite(tx)&&isFinite(ty)&&(tx!==p._gx||ty!==p._gy)){p._gx=tx;p._gy=ty;if(st.map){var pa=pathTo(p.x,p.y,tx,ty),f0=pa.shift()||[tx,ty];p.tx=f0[0];p.ty=f0[1];p.path=pa}else{p.tx=tx;p.ty=ty}}p.want=['chap','lay','ngoi','dung'].indexOf(pr.a)>=0?pr.a:'dung';p.faceUp=pr.a==='chap'||pr.a==='lay';
   if(p.want!==p._lastWant){p._lastWant=p.want;if(Math.hypot(p.tx-p.x,p.ty-p.y)<.003){p.a=p.want;p.f=0;if(p.faceUp)p.d=4}}}
  p.el.querySelector('.wa-tag').textContent=isMe?'Bạn':(typeof pr.n==='string'&&pr.n.trim()?pr.n.trim().slice(0,22):'Khách viếng');
  var EMO={pray:'🙏',heart:'❤️',flower:'🌸',light:'✨'},b=p.el.querySelector('.wa-bub'),e=EMO[pr.e];
  if(e&&(!b||b.textContent!==e)){b&&b.remove();b=document.createElement('span');b.className='wa-bub';b.textContent=e;p.el.appendChild(b)}else if(!e&&b)b.remove();return p}
 function sync(){if(!on())return;if(!me.tc&&window.ssNV)me.tc=ssNV.get();   // js/31 nạp sau file này
var seen={me:1},n=1,here=1;upsert('me',me,true);
  if(room)room.peers().forEach(function(pe){if(pe.kind!=='viewer'||(pe.isMe&&pe.sameTab))return;var pr=pe.presence||{};n++;if(pr.li&&window.ssLit)ssLit.peer(pe.peer,pr.li);if(pr.w!==1||pr.s!==(window.ssHoKey?ssHoKey(scene):scene)||pr.h!==1)return;here++;upsert(pe.peer,pr,false);seen[pe.peer]=1});
  // NPC (js/25-npc.js): người trong cảnh, chỉ chạy trên máy này, không tính vào số người trực tuyến
  if(window.ssNpcList)ssNpcList(scene).forEach(function(q){var p=upsert(q.id,q,false);p.el.classList.add('wa-npc');seen[q.id]=1});
  Object.keys(av).forEach(function(k){if(!seen[k]){av[k].el.remove();delete av[k]}});
  var o=document.getElementById('hallOnline');if(o){o.hidden=n<2;o.querySelector('b').textContent=n;o.title=here+' người đang ở '+(scene==='dien'?'Chính điện':'chân núi')+' · '+n+' người trực tuyến'}}
 function send(){if(!room||!on())return;var p=av.me||me;room.presence({w:1,f:'phat',s:(window.ssHoKey?ssHoKey(scene):scene),h:hall.hidden?0:1,x:+p.x.toFixed(3),y:+p.y.toFixed(3),tx:+me.tx.toFixed(3),ty:+me.ty.toFixed(3),a:me.a,k:me.k,tc:me.tc,e:me.e,n:myName(),li:window.ssLit?ssLit.mine():0}).catch(function(){})}
 function goTo(x,y,act){var c=clampFloor(x,y);me.tx=c[0];me.ty=c[1];me.a=act||'dung';var p=av.me;if(p){p.tx=me.tx;p.ty=me.ty;p.path=null;if(st.map){var pa=pathTo(p.x,p.y,me.tx,me.ty);var f0=pa.shift()||[me.tx,me.ty];p.tx=f0[0];p.ty=f0[1];p.path=pa}p.want=me.a;p.faceUp=me.a==='chap'||me.a==='lay';if(Math.hypot(p.tx-p.x,p.ty-p.y)<.003){p.a=me.a;p.f=0;if(p.faceUp)p.d=4}}send()}
 stage.addEventListener('click',function(ev){var ls=hall.querySelector('.hall-list.open');if(ls){ls.classList.remove('open');hall.classList.remove('list-open');return}if(ev.target.closest('.wh'))return;var r=stage.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height,f=SC[scene].floor[O];
  if(!st.map&&y<f.t-.25)return;pend=null;goTo(x,y,'dung');var c=clampFloor(x,y),pg=document.createElement('i');pg.className='w-ping';pg.style.left=c[0]*100+'%';pg.style.top=c[1]*100+'%';fl.appendChild(pg);setTimeout(function(){pg.remove()},700)});
 // ---- chuyển cảnh
 function setScene(s,spawn){pend=null;scene=s;me.s=s;hall.dataset.ws=s;clearSigns();Object.keys(av).forEach(function(k){av[k].el.remove();delete av[k]});layout();
  var sp=spawn||SC[s].spawn;if(SC[s].map)sp=gridNear(sp[0],sp[1]);me.x=me.tx=sp[0]+(SC[s].map?0:(Math.random()-.5)*.06);me.y=me.ty=sp[1];me.a='dung';sync();var p=av.me;p.x=me.x;p.y=me.y;p.tx=me.tx;p.ty=me.ty;p.d=4;draw(p);if(st.map)follow(true);send()}
 // 3D: thay màn chuyển bằng đoạn phim "Bạn" đi bộ (js/26); không chiếu được thì dùng màn ảnh cũ. xong: gọi khi đã sang cảnh mới
 function phim(kieu,s,label,spawn,xong){if(trans.classList.contains('on'))return true;if(reduce||!window.ss3dPhim)return false;
  var ok=ss3dPhim(kieu,s,spawn||SC[s].spawn,function(){setScene(s,spawn);refresh();trans.classList.add('out');setTimeout(function(){trans.classList.remove('on','out','phim');trans.querySelector('span').textContent='Đang lên núi…';hall.classList.remove('w-moving')},900);xong&&setTimeout(xong,500)});
  if(!ok)return false;hall.classList.add('no-splash','w-moving');trans.style.backgroundImage='none';trans.querySelector('span').textContent=label||{lang:'Về làng…',ho:'Về làng nhà…',nha:'Vào nhà…',tho:'Vào nhà thờ…',chan:'Về chân núi…',sanh:'Về sảnh…'}[s]||'';trans.classList.remove('out','quick');trans.classList.add('on','phim');return true}
 function climb(xong){if(phim('len','dien','Lên chùa…',null,xong))return;hall.classList.add('no-splash');if(trans.classList.contains('on'))return;xong&&setTimeout(xong,reduce?300:2900);hall.classList.add('w-moving');setTimeout(function(){hall.classList.remove('w-moving')},reduce?300:3400);trans.style.backgroundImage='none';trans.classList.remove('out');void trans.offsetWidth;trans.classList.add('on');
  setTimeout(function(){setScene('dien')},reduce?100:2300);setTimeout(function(){trans.classList.add('out')},reduce?150:2500);setTimeout(function(){trans.classList.remove('on','out')},reduce?300:3400)}
 function descend(){if(phim('xuong','chan','Xuống núi…',SC.chan.back))return;hall.classList.add('no-splash');hall.classList.add('w-moving');setTimeout(function(){hall.classList.remove('w-moving')},1400);trans.style.backgroundImage='none';trans.classList.add('on','quick');setTimeout(function(){setScene('chan',SC.chan.back)},500);setTimeout(function(){trans.classList.add('out')},650);setTimeout(function(){trans.classList.remove('on','out','quick')},1400)}
 function doorOf(pid){var c=SC.lang,L=window.ssPerson?ssPerson.all():[],used={};for(var i=0;i<L.length;i++){var p=L[i];used[p.c]=used[p.c]||0;var q=(c.slots[p.c]||[])[used[p.c]++];if(p.id===pid)return q?q.door:null}return null}
 function fade(s,label,spawn,xong){if(phim('di',s,label||'',spawn,xong))return;hall.classList.add('no-splash');if(trans.classList.contains('on'))return;xong&&setTimeout(xong,1300);hall.classList.add('w-moving');setTimeout(function(){hall.classList.remove('w-moving')},1300);trans.querySelector('span').textContent=label||'';trans.style.backgroundImage='none';trans.classList.add('on','quick');setTimeout(function(){setScene(s,spawn);refresh()},450);setTimeout(function(){trans.classList.add('out')},600);setTimeout(function(){trans.classList.remove('on','out','quick');trans.querySelector('span').textContent='Đang lên núi…'},1300)}
 var bar=W.querySelector('.w-bar');if(bar)hall.appendChild(bar);hall.appendChild(trans);
 hall.addEventListener('click',function(ev){var b=ev.target.closest('[data-w]');if(!b||!on())return;ev.preventDefault();ev.stopPropagation();var w=b.dataset.w;
  if(w==='len')climb();else if(w==='xuong')descend();
  else if(w==='lang')fade('lang','Về làng…');else if(w==='ralang'){var pp=window.ssPerson&&ssPerson.get();if(window.ssHo&&ssHo.from()){var hd2=ssHo.door(ssHo.from());ssHo.from(null);fade('ho','Về làng nhà…',hd2?gridNear(hd2[0],hd2[1]):null)}else{var dd=pp&&doorOf(pp.id);fade('lang','Ra làng…',dd||null)}}else if(w==='venui'){if(homeScene()==='tho')fade('tho','Về nhà thờ…',SC.tho.fromLang);else fade('chan','Về chân núi…',SC.chan.fromLang)}
  else if(w.indexOf('xom-')===0||w.indexOf('khu-')===0){var kz=w.slice(4),gz=scene==='lang'&&SC.lang.gates[kz],mo=function(){kz==='bac'||kz==='vua'||kz==='tuong'?window.ssLichSu&&ssLichSu(kz):window.ssXom&&ssXom(kz)};   // làng chung: đi tới cổng khu rồi mở
   if(gz){var gg=gridNear(gz[0],gz[1]);goTo(gg[0],gg[1],'dung');pend=mo}else mo()}
  else if(w==='g-phat'||w==='g-cg'){var fa=w.slice(2),dr=gridNear(SC.sanh.door[fa][0],SC.sanh.door[fa][1]),ok=0,go=function(){if(ok)return;ok=1;window.ssChonLoi&&ssChonLoi(fa)};goTo(dr[0],dr[1],'dung');pend=go;setTimeout(function(){if(!ok&&scene==='sanh'){pend=null;go()}},4000)}
  else if(w==='g-tt'){window.ssChonLoi&&ssChonLoi('tt')}
  else if(w==='g-logo'){window.toast&&toast('Đi tới một trong hai cổng để chọn lối vào')}
  else if(w.indexOf('hp:')===0){var hid=w.slice(3),hd=window.ssHo&&ssHo.door(hid);if(hd){var g2=gridNear(hd[0],hd[1]);goTo(g2[0],g2[1],'dung');pend=function(){ssHo.menu(hid)}}}
  else if(w==='ho-nt'){var nd=SC.ho.ntDoor,g3=gridNear(nd[0],nd[1]);goTo(g3[0],g3[1],'dung');pend=function(){window.ssHo&&ssHo.tree()}}
  else if(w==='ho-cong'){fade('lang','Ra làng tưởng niệm…')}
  else if(w==='ho-go'){var fd=SC.lang.forkDoor;if(scene==='lang'&&fd){var gf=gridNear(fd[0],fd[1]);goTo(gf[0],gf[1],'dung');pend=function(){window.ssHo&&ssHo.go()}}else window.ssHo&&ssHo.go()}
  else if(w==='sanh-lang'){var sd=SC.lang.sanhDoor,gs=gridNear(sd[0],sd[1]);goTo(gs[0],gs[1],'dung');pend=function(){window.ssLangMap&&ssLangMap()}}
  else if(w==='dai-ls'){var dd3=SC.lang.daiDoor,gd=gridNear(dd3[0],dd3[1]);goTo(gd[0],gd[1],'chap');pend=function(){if(av.me){av.me.d=4;av.me.faceUp=true}window.ssDai?ssDai():window.toast&&toast('Đài tưởng niệm · Tổ quốc ghi công các anh hùng liệt sĩ')}}
  else if(w==='ao-sen'){var ad=SC.lang.aoDoor,ga=gridNear(ad[0],ad[1]);goTo(ga[0],ga[1],'ngoi');pend=function(){window.toast&&toast('Ao sen · ngồi tĩnh tâm một lát')}}
  else if(w.indexOf('p:')===0){var pid=w.slice(2),dr=doorOf(pid);if(dr){goTo(dr[0],dr[1],'dung');pend=function(){window.ssVaoNha&&ssVaoNha(pid)}}else window.ssVaoNha&&ssVaoNha(pid)}
  else if(w==='lay'&&SC[scene].lePhat){var lq=SC[scene].lePhat,gq=gridNear(lq[0],lq[1]);goTo(gq[0],gq[1],'lay');if(av.me)av.me.faceUp=true;pend=function(){window.ssCongDuc&&ssCongDuc.open('lay')}}   // chùa: vái lạy là đến chiếu lễ trước tượng Phật
  else if(w==='chap'||w==='lay'){if(SC[scene].pray){var pp=SC[scene].pray[O];goTo(pp[0]+(Math.random()-.5)*.12,pp[1]+Math.random()*.03,w)}else goTo((av.me||me).x,(av.me||me).y,w);if(av.me){av.me.faceUp=true}}
  else if(w==='gomo'){var ms=SC.dien.mo,gm=gridNear(ms[0],ms[1]);goTo(gm[0],gm[1],'ngoi');pend=function(){if(av.me){av.me.d=4;av.me.faceUp=true}window.ssMo&&ssMo.open()}}
  else if(w==='chuong'){var cd=SC[scene].chuongDoor,ring=function(){if(window.ssCongDuc)ssCongDuc.open('chuong');else{window.ssBell&&ssBell();window.toast&&toast('Một hồi chuông ngân vang')}};if(cd){var gc=gridNear(cd[0],cd[1]);goTo(gc[0],gc[1],'chap');pend=ring}else ring()}
  else if(w==='le-phat'){var lp=SC.dien.lePhat,gl=gridNear(lp[0],lp[1]);goTo(gl[0],gl[1],'lay');pend=function(){if(av.me){av.me.d=4;av.me.faceUp=true}window.ssCongDuc?ssCongDuc.open('lay'):window.toast&&toast('Thành tâm đảnh lễ Đức Phật')}}
  else if(w==='thien'){var td=SC.dien.thienDoor,gt=gridNear(td[0],td[1]);goTo(gt[0],gt[1],'ngoi');pend=function(){if(av.me){av.me.d=4;av.me.faceUp=true}window.toast&&toast('Ngồi tĩnh tâm dưới cội bồ đề · nghe suối chảy, chim kêu');window.ssCongDuc&&ssCongDuc.open('thien')}}
  else if(w==='ban-tho'||w==='chuong-tt'||w==='nuoc-thanh'){var C2=SC[scene],k2={'ban-tho':['banTho','ngoi','ban-tho'],'chuong-tt':['chuongTT','chap','chuong'],'nuoc-thanh':['ntDoor','dung','dau']}[w],q2=C2[k2[0]],mo2=function(){window.ssHoaThieng&&ssHoaThieng.open(k2[2])};   // nhà thờ: bó hoa thiêng (js/30)
   if(q2){var g4=gridNear(q2[0],q2[1]);goTo(g4[0],g4[1],k2[1]);pend=mo2}else mo2()}
  else if(w==='nhang'){var pq=SC[scene].pray[O];goTo(pq[0]+(Math.random()-.5)*.1,pq[1],'chap');window.ssRitual&&ssRitual.open()}
  else if(w==='cal'){var c=hall.querySelector('.hall-act [data-open-cal]');c&&c.click()}
  else if(w==='ngoi')goTo((av.me||me).x,(av.me||me).y,'ngoi');
  else if(w==='doi'){if(window.ssNV)ssNV.mo();else{me.k=me.k?0:1;try{localStorage.setItem('ss-nv',me.k)}catch(e){}sync();send()}}},true);
 addEventListener('ss-nv',function(e){me.tc=e.detail||'';var c=window.ssNVTC&&ssNVTC.doc(me.tc);if(c){me.k=c.d==='nu'?0:1;try{localStorage.setItem('ss-nv',me.k)}catch(x){}}sync();send()});
 hall.addEventListener('click',function(ev){var b=ev.target.closest('[data-emo]');if(!b||!on())return;me.e=b.dataset.emo;sync();send();clearTimeout(me._et);me._et=setTimeout(function(){me.e=null;sync();send()},4500)});
 // ---- bật/tắt theo lối
 function refresh(){var hs=homeScene();if(scene!=='sanh'&&(hs==='tho'&&(scene==='chan'||scene==='dien'))||(hs==='chan'&&scene==='tho')){scene=hs;me.s=hs;hall.dataset.ws=hs;Object.keys(av).forEach(function(k){av[k].el.remove();delete av[k]})}var w=active()&&!hall.hidden;hall.classList.toggle('world-on',w);W.hidden=!w;if(w){if(!av.me)setScene(scene);else layout();sync();send()}}
 window.ssWorld={home:homeScene,refresh:refresh,climb:climb,descend:descend,fade:fade,set:function(s){if(!on()){scene=s;me.s=s;hall.dataset.ws=s;Object.keys(av).forEach(function(k){av[k].el.remove();delete av[k]});refresh();return}setScene(s);refresh()},scene:function(){return scene},on:function(){return on()},sync:function(){sync()},pt:function(x,y){return SC[scene].map?gridNear(x,y):clampFloor(x,y)},pray:function(){var q=SC[scene].pray;return q&&q[O]},send:function(){send()},duong:function(s,a,b){var c=scene;scene=s;try{var p=gridNear(a[0],a[1]);return [p].concat(pathTo(p[0],p[1],b[0],b[1]))}finally{scene=c}},walk:function(x,y,cb){var g=gridNear(x,y);goTo(g[0],g[1],'dung');pend=cb||null},bow:function(){var b=hall.querySelector('.w-bar [data-w="lay"]');b&&b.click()}};
 window.ssWorld.avs=function(){return av};   // thế giới 3D (js/26-the-gioi-3d.js) đọc vị trí mọi người để vẽ lại
 addEventListener('ss-lit',function(){if(on()&&SC[scene].pray){var pq=SC[scene].pray[O];goTo((av.me||me).x,pq[1],'lay')}});
 new MutationObserver(function(){if(hall.hidden)hall.classList.remove('no-splash');setTimeout(refresh,30)}).observe(hall,{attributes:true,attributeFilter:['hidden']});
 addEventListener('ss-faith',function(){setTimeout(refresh,30)});
 addEventListener('ss-person',function(){if(scene==='nha')drawAnh()});
 window.ssWorldGo=function(pid){var dr=doorOf(pid);if(dr){goTo(dr[0],dr[1],'dung')}};
 addEventListener('resize',function(){if(on()){clearSigns();layout()}});
 document.addEventListener('click',function(ev){var tg=ev.target.closest('.wl-toggle');if(!tg)return;ev.preventDefault();ev.stopPropagation();var l=tg.closest('.hall-list');l.classList.toggle('open');hall.classList.toggle('list-open',l.classList.contains('open'));tg.setAttribute('aria-expanded',l.classList.contains('open'))},true);
 window._wdbg=function(){return {me:me,av:av.me&&{x:av.me.x,y:av.me.y,tx:av.me.tx,ty:av.me.ty,a:av.me.a},st:st,scene:scene,O:O}};
 requestAnimationFrame(tick);setTimeout(refresh,60);
 if(window.claude&&claude.use)claude.use('room').then(function(r){if(!r)return;room=r;r.onPeers(function(){sync()},function(){room=null});send();setInterval(send,15000)}).catch(function(){});
})();
