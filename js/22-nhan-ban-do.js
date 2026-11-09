/* Nhãn trên bản đồ: ưu tiên nhãn chính, ẩn nhãn chồng chéo hoặc nằm dưới HUD; tên người chỉ hiện quanh nhân vật */
(function(){
 var hall=document.getElementById('hall');if(!hall)return;
 var HUD=['.hall-ttl','.hall-act','#hallOnline','.wx-pill','.hall-emo','.zm','.w-bar','.ho-ban','#mainNav','.sanh-tip','.cd-nut'];
 function rank(el){var w=el.dataset.w||'';if(el.classList.contains('main'))return 4;if(el.classList.contains('zn'))return 3;if(w.indexOf('p:')===0)return 1;return 2}
 function hit(a,b,pad){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad}
 function run(){if(hall.hidden||!hall.classList.contains('world-on'))return;
  var els=[].slice.call(hall.querySelectorAll(hall.classList.contains('w3d-on')?'.w3d-hot .wh':'.w-hot .wh')).filter(function(e){return e.style.display!=='none'});   // 3D: nhãn của js/26 (lớp 2D vẫn còn nhưng ẩn)if(!els.length)return;
  // nhãn chính không ẩn được: đẩy vào trong khi chạm mép (đo lại từ vị trí gốc mỗi lượt)
  els.forEach(function(el){if(el.classList.contains('main')){var lb=el.querySelector('.wh-lb')||el;lb.style.translate='';var r=lb.getBoundingClientRect(),dx=r.left<8?8-r.left:r.right>innerWidth-8?innerWidth-8-r.right:0;if(dx&&r.right>0&&r.left<innerWidth)lb.style.translate=dx+'px 0'}});
  var me=hall.querySelector('.wa.me'),mr=me&&me.getBoundingClientRect(),mx=mr?mr.left+mr.width/2:innerWidth/2,my=mr?mr.top+mr.height/2:innerHeight/2;
  var R=Math.max(220,(innerWidth+innerHeight)*.28);
  var hud=[];HUD.forEach(function(q){[].forEach.call(document.querySelectorAll(q),function(e){if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;var r=e.getBoundingClientRect();if(r.width&&r.height)hud.push(r)})});
  var list=els.map(function(el){var lb=el.querySelector('.wh-lb')||el,r=lb.getBoundingClientRect(),d=el.querySelector('.wh-dot'),dr=d?d.getBoundingClientRect():r;
    var u=r;if(d&&dr.width>0&&Math.abs(dr.top-r.bottom)<40){u={left:Math.min(r.left,dr.left),right:Math.max(r.right,dr.right),top:Math.min(r.top,dr.top),bottom:Math.max(r.bottom,dr.bottom)}}   // chấm ở xa nhãn (nhãn đặt trên đỉnh tượng, nhà): chỉ tính khung chữ, không thì khung cao vút che nhầm nhãn khác
    return {el:el,r:u,k:rank(el),near:Math.hypot((r.left+r.right)/2-mx,(r.top+r.bottom)/2-my)}});
  list.sort(function(a,b){return b.k-a.k||a.near-b.near});
  var placed=[];
  list.forEach(function(it){var off=false,r=it.r;
   if(r.right<0||r.left>innerWidth||r.bottom<0||r.top>innerHeight){it.el.classList.remove('wh-off');return}
   if(it.k===1&&hall.dataset.ws==='lang'&&it.near>R)off=true;
   if(!off&&it.k<4&&(r.left<4||r.right>innerWidth-4))off=true;
   if(!off&&hud.some(function(h){return hit(r,h,2)}))off=true;   // cả nhãn chính: nằm dưới thanh trên / nút thì ẩn, ra khỏi chỗ đó lại hiện
   if(!off&&placed.some(function(p){return hit(r,p,4)}))off=true;
   it.el.classList.toggle('wh-off',off);if(!off)placed.push(r)})}
 window.ssDeclutter=run;setInterval(function(){try{run()}catch(e){console.error('declutter',e)}},200);addEventListener('resize',function(){setTimeout(run,60)});
})();
