/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Hồ sơ: hiệu ứng ---------------- */
const lm=$('#ho-so');
$('.lm-bars').innerHTML=Array.from({length:14},(_,i)=>`<span style="--i:${(i*5)%14}"></span>`).join('');
[...$('.lm-body').children].forEach((c,i)=>c.style.setProperty('--d',i));
function replayLM(){if(reduce)return;lm.classList.remove('play');void lm.offsetWidth;lm.classList.add('play')}
if(!reduce){const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){lm.classList.add('play');io.disconnect()}},{threshold:.2});io.observe(lm);
  const por=$('#lmPortrait'),old=$('#lmOld');let tk=false;
  addEventListener('scroll',()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{tk=false;const r=lm.getBoundingClientRect();const y=Math.max(0,Math.min(-r.top,900));por.style.transform=`translateY(${y*.38}px)`;por.style.opacity=String(Math.max(.15,1-y/700));old.style.transform=`rotate(-1.5deg) translateY(${-y*.12}px)`})},{passive:true});}
$('#lmPrev').addEventListener('click',e=>select(e.currentTarget.dataset.id,true));
$('#lmNext').addEventListener('click',e=>select(e.currentTarget.dataset.id,true));
$('#lmVideo').addEventListener('click',()=>toast('Video mẫu. Gia đình sẽ tải video tưởng niệm lên đây.'));
$('#lmListen').addEventListener('click',()=>toast('Bản ghi âm mẫu. Người thân có thể ghi lời kể ngay trên điện thoại.'));


/* ---------------- Bản đồ thực tế ---------------- */
const VK=Math.cos(16*Math.PI/180)*40;const vp=(lat,lng)=>[(lng-101.2)*VK,(23.7-lat)*40];
let vLayer='g';
(function(){const ns='http://www.w3.org/2000/svg';
  const cities=[['Hà Nội',21.03,105.85],['Huế',16.46,107.59],['Đà Nẵng',16.05,108.2],['TP. Hồ Chí Minh',10.78,106.7],['Cần Thơ',10.03,105.78]];
  $('#vmapCities').innerHTML=cities.map(([n,la,lo])=>{const [x,y]=vp(la,lo);return `<g class="city"><circle cx="${x}" cy="${y}" r="2.5"/><text font-family="Be Vietnam Pro, sans-serif" x="${x-6}" y="${y+4}" text-anchor="end">${n}</text></g>`}).join('');
  const isl=(n,la,lo,pts)=>{const [x,y]=vp(la,lo);let c='';pts.forEach(([dx,dy])=>c+=`<circle cx="${x+dx}" cy="${y+dy}" r="1.6"/>`);return `<g class="isl">${c}<text font-family="Be Vietnam Pro, sans-serif" x="${x}" y="${y+28}" text-anchor="middle">${n}</text></g>`};
  $('#vmapIslands').innerHTML=isl('Quần đảo Hoàng Sa',16.5,112.0,[[0,0],[8,-5],[14,4],[-7,6],[4,10],[-12,-3]])+isl('Quần đảo Trường Sa',9.9,114.2,[[0,0],[10,6],[-9,8],[6,-9],[-14,-4],[16,-3],[2,14]])+(()=>{const [x,y]=vp(13.4,111.4);return `<text font-family="Be Vietnam Pro, sans-serif" class="sea-l" x="${x}" y="${y}" text-anchor="middle">BIỂN ĐÔNG</text>`})();
})();
function renderMap(){
  const list=people.map(p=>({p,pt:GEO[p.id]&&GEO[p.id][vLayer]})).filter(o=>o.pt);
  // nhóm các điểm trùng nhau
  const seen={};
  $('#vmapMarks').innerHTML=list.map(({p,pt})=>{const [x,y]=vp(pt[0],pt[1]);const k=x.toFixed(0)+','+y.toFixed(0);const n=seen[k]=(seen[k]||0)+1;const ox=(n-1)*7,oy=-(n-1)*3;const c=ZBY[p.c].col;const on=p.id===current;
    return `<g class="mk${on?' on':''}" data-id="${p.id}" transform="translate(${x+ox},${y+oy})"><circle class="pulse" r="8" stroke="${c}"/><circle class="o" r="7" stroke="${c}"/><circle class="i" r="3.2" fill="${c}"/>${on?`<text font-family="Be Vietnam Pro, sans-serif" x="12" y="4">${esc(p.name)}</text>`:''}</g>`}).join('');
  // đưa điểm đang chọn lên trên cùng
  const on=$('#vmapMarks .mk.on');if(on)on.parentNode.appendChild(on);
  const p=byId[current],g=GEO[current]||{};const pt=g[vLayer];
  $('#vcard').innerHTML=`<span class="eyebrow">${CAT[p.c]} · ${ZBY[p.c].name}</span><h3>${esc(p.name)}</h3><div>${esc(p.b)} – ${esc(p.d)}</div>`+
    (pt?`<div><b>${vLayer==='g'?'Mộ phần':'Quê quán'}:</b> ${esc(vLayer==='g'?pt[2]:p.place)}</div><div class="coord">${pt[0].toFixed(3)}° B, ${pt[1].toFixed(3)}° Đ · tọa độ gần đúng, dữ liệu mẫu</div><div class="row"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${pt[0]},${pt[1]}">Mở Google Maps</a><a class="btn ghost" href="#cong-vien" id="vToVillage">Xem trong làng</a></div>`
      :`<div><b>Mộ phần:</b> gia đình chưa tìm được. Hồ sơ đang mở công khai để đồng đội cũ có thể bổ sung thông tin.</div><div class="row"><a class="btn ghost" href="#ky-uc" data-tab="msg">Gửi thông tin</a></div>`);
  $('#vlist').innerHTML=people.map(q=>{const gp=GEO[q.id]&&GEO[q.id][vLayer];return `<li><button data-id="${q.id}" aria-current="${q.id===current}"><i style="background:${ZBY[q.c].col}"></i><div><div>${esc(q.name)}</div><span>${esc(gp?(vLayer==='g'?gp[2]:q.place):'Chưa tìm được mộ')}</span></div><span>${esc(q.b)}–${esc(q.d)}</span></button></li>`}).join('');
  const tv=$('#vToVillage');if(tv)tv.addEventListener('click',()=>park&&park.focus(current));
  const gt=$('#vcard [data-tab]');if(gt)gt.addEventListener('click',()=>showTab('msg'));
}
$('#vmapMarks').addEventListener('click',e=>{const g=e.target.closest('.mk');if(g)select(g.dataset.id,true)});
$('#vlist').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)select(b.dataset.id,true)});
$('#vmapLayer').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;vLayer=b.dataset.l;$$('#vmapLayer button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderMap()});
