/* NPC: người viếng chùa, nhà thờ, làng — đi lại, chắp tay, vái lạy, ngồi cho thế giới có hồn.
   Chỉ chạy trên máy người xem (không gửi lên phòng chung), không có tên, không vào gian thờ riêng của gia đình. */
(function(){
 var SO={sanh:2,chan:3,dien:3,tho:3,lang:3,ho:1,nha:0},LE={dien:1,tho:1,chan:1},ds={};
 function diem(W,gan,r){for(var n=0;n<40;n++){
   var x=gan?gan[0]+(Math.random()-.5)*r:.08+Math.random()*.84,y=gan?gan[1]+Math.random()*r*.4:.1+Math.random()*.85,p=W.pt(x,y);
   if(Math.abs(p[0]-x)<.01&&Math.abs(p[1]-y)<.01)return p}   // chỉ nhận điểm vốn đi được, không lấy điểm bị ép vào mép
  return W.pt(gan?gan[0]:.5,gan?gan[1]:.9)}
 function lay(W,s){if(ds[s])return ds[s];var a=ds[s]=[];
  for(var i=0;i<(SO[s]||0);i++){var p=diem(W);a.push({id:'npc-'+s+'-'+i,k:i%2,x:p[0],y:p[1],tx:p[0],ty:p[1],a:'dung',hen:Date.now()+1500+Math.random()*5000})}return a}
 window.ssNpcList=function(s){var W=window.ssWorld;return W?lay(W,s).map(function(q){return {id:q.id,k:q.k,x:q.x,y:q.y,tx:q.tx,ty:q.ty,a:q.a,n:''}}):[]};
 function buoc(){var W=window.ssWorld,h=document.getElementById('hall');if(!W||!h||h.hidden||!W.on())return;
  var s=W.scene(),le=LE[s]&&W.pray(),doi=false,now=Date.now();
  lay(W,s).forEach(function(q){if(now<q.hen)return;doi=true;var p;
   if(q.a==='dung'&&le&&Math.random()<.55){p=diem(W,le,.24);q.a=Math.random()<.5?'chap':(s==='tho'&&Math.random()<.4?'ngoi':'lay');q.hen=now+8000+Math.random()*9000}
   else if(q.a==='dung'&&Math.random()<.2){p=[q.tx,q.ty];q.a='ngoi';q.hen=now+6000+Math.random()*8000}
   else{p=diem(W);q.a='dung';q.hen=now+5000+Math.random()*7000}
   q.tx=p[0];q.ty=p[1]});
  if(doi)W.sync()}
 // người chọn giảm chuyển động: NPC vẫn có mặt nhưng đứng yên
 if(!(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))setInterval(buoc,1000);
})();
