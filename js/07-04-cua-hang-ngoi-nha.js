/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Cửa hàng ---------------- */
const IC={
 aodai:'<path d="M19 6h10l4 9-4 2v25H19V17l-4-2z"/><path d="M24 6v8M21 17h6"/>',
 quanphuc:'<path d="M16 8l8 3 8-3 8 6-4 6-4-2v22H16V18l-4 2-4-6z"/><path d="M20 22h4v4h-4zM28 22h4v4h-4z"/>',
 aolen:'<path d="M17 8c2 3 12 3 14 0l9 6-3 9-4-2v21H15V21l-4 2-3-9z"/><path d="M15 36h18M15 39h18"/>',
 xemay:'<circle cx="12" cy="33" r="6"/><circle cx="37" cy="33" r="6"/><path d="M12 33l7-11h12l6 11M19 22l-3-6h-4M31 22l2-8h5"/>',
 xedap:'<circle cx="12" cy="32" r="8"/><circle cx="36" cy="32" r="8"/><path d="M12 32l8-13h12l4 13M20 19l7 13 5-13M18 15h6M30 15h5"/>',
 oto:'<path d="M5 30v-6l5-2 6-8h16l7 8 5 2v6z"/><circle cx="14" cy="31" r="4"/><circle cx="34" cy="31" r="4"/><path d="M17 15l-3 7h20l-5-7"/>',
 truongky:'<path d="M8 20h32v12H8z"/><path d="M6 20v-6h36v6M10 32v5M38 32v5M8 26h32"/>',
 sap:'<path d="M5 22h38v6H5z"/><path d="M8 28v10M40 28v10M8 34h32M14 22v-4h20v4"/>',
 tuche:'<path d="M11 8h26v32H11z"/><path d="M11 24h26M24 8v16M21 16h-2M29 16h-2M14 40v3M34 40v3M15 30h18"/>',
 dao:'<path d="M24 42V24M24 30l-6-6M24 27l7-5"/><circle cx="17" cy="16" r="5"/><circle cx="29" cy="13" r="6"/><circle cx="24" cy="22" r="4"/><circle cx="33" cy="22" r="4"/><path d="M16 42h16"/>',
 denlong:'<path d="M24 4v6M20 10h8"/><ellipse cx="24" cy="24" rx="11" ry="13"/><path d="M24 11v26M16 14c-3 6-3 14 0 20M32 14c3 6 3 14 0 20M20 37h8M24 37v7"/>',
 binhsen:'<path d="M18 26h12l-2 16H20z"/><path d="M24 26V12M24 12c-4 0-6-4-6-7 3 0 6 3 6 7zM24 12c4 0 6-4 6-7-3 0-6 3-6 7zM24 18c-5 0-9-2-10-6 4 0 8 2 10 6z"/>',
 custom:'<circle cx="24" cy="24" r="16" stroke-dasharray="3 3"/><path d="M24 16v16M16 24h16"/>'
};
const goods=[
 {id:'aodai',k:'ao',n:'Áo dài lụa',p:80,t:'Lụa tơ tằm, may đo theo màu gia đình chọn.'},
 {id:'quanphuc',k:'ao',n:'Bộ quân phục mới',p:60,t:'Quân phục kèm mũ cối, dành tặng các anh hùng liệt sĩ.'},
 {id:'aolen',k:'ao',n:'Áo len mẹ đan',p:40,t:'Áo len cổ tròn, ấm cho những mùa đông miền Bắc.'},
 {id:'xemay',k:'xe',n:'Xe máy cổ',p:180,t:'Kiểu xe số những năm 1970, sơn xanh ngọc.'},
 {id:'xedap',k:'xe',n:'Xe đạp thồ',p:70,t:'Khung sắt chắc, có giá chở hàng phía sau.'},
 {id:'oto',k:'xe',n:'Ô tô gia đình',p:320,t:'Bảy chỗ, đủ cho cả nhà cùng đi chơi Tết.'},
 {id:'truongky',k:'noi',n:'Bộ trường kỷ',p:150,t:'Gỗ gụ chạm hoa sen, đặt giữa gian chính.'},
 {id:'sap',k:'noi',n:'Sập gụ',p:200,t:'Chiếc sập ngồi uống trà mỗi chiều.'},
 {id:'tuche',k:'noi',n:'Tủ chè',p:120,t:'Tủ chè khảm trai để bày ấm chén.'},
 {id:'dao',k:'trang',n:'Cây đào Nhật Tân',p:50,t:'Đào bích nở đúng dịp Tết, trồng trong sân.'},
 {id:'denlong',k:'trang',n:'Đèn lồng Hội An',p:20,t:'Treo dọc lối đi, sáng ấm khi trời tối.'},
 {id:'binhsen',k:'trang',n:'Bình hoa sen',p:30,t:'Sen Tây Hồ cắm bình gốm men lam.'}
];
let balance=500,shopK='all';
$('#recipient').innerHTML=people.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
function renderGoods(){
  const list=goods.filter(g=>shopK==='all'||g.k===shopK);
  let html=list.map((g,i)=>`<div class="good" style="--i:${i}"><div class="ic"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${IC[g.id]}</svg></div><h3>${g.n}</h3><p>${g.t}</p><div class="foot"><span class="price">${g.p} <small>nén</small></span><button class="btn" data-g="${g.id}" style="padding:8px 14px">Dâng tặng</button></div></div>`).join('');
  if(shopK==='all'||shopK==='yc')html+=`<div class="good custom"><div class="ic"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round">${IC.custom}</svg></div><h3>Đặt làm theo yêu cầu</h3><textarea id="customReq" aria-label="Mô tả vật phẩm" placeholder="Ví dụ: chiếc sáo trúc giống cây sáo chú từng thổi…"></textarea><div class="foot"><span class="price">Báo giá <small>trong 2 ngày</small></span><button class="btn ghost" id="customBtn" style="padding:8px 14px">Gửi yêu cầu</button></div></div>`;
  $('#goods').innerHTML=html;
}
$('#shopCats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;shopK=b.dataset.k;$$('#shopCats button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderGoods();const gd=$('#goods');gd.classList.remove('swap');void gd.offsetWidth;gd.classList.add('swap')});
$('#goods').addEventListener('click',e=>{
  if(e.target.id==='customBtn'){const v=$('#customReq').value.trim();toast(v?'Đã gửi yêu cầu đặt làm. Xưởng sẽ báo giá trong 2 ngày.':'Hãy mô tả vật phẩm bạn muốn đặt làm.');if(v)$('#customReq').value='';return}
  const b=e.target.closest('button[data-g]');if(!b)return;
  buy(b.dataset.g,$('#recipient').value);
});
function setBalance(v){balance=v;$('#balance').textContent=v;$$('[data-bal]').forEach(e=>e.textContent=v.toLocaleString('vi-VN'))}
function buy(gid,rid){const g=goods.find(x=>x.id===gid);if(!g||!byId[rid])return false;
  if(balance<g.p){toast('Số dư không đủ. Cần thêm '+(g.p-balance)+' nén. Bấm “Nạp nén” để nạp thêm.');return false}
  setBalance(balance-g.p);const h=homeOf(rid);h.gifts.push(g.id);
  if(h===homeOf(current)&&home)home.addGift(g.id,h.gifts.length-1);
  renderReceived();window.ssMe&&ssMe.save();
  toast(g.k==='ao'?`Đã gửi ${g.n} tới ${houseNames(rid)}. Món quà được cất vào tủ áo.`:g.k==='noi'?`Đã gửi ${g.n} tới ${houseNames(rid)}. Đồ đã được bày trong nhà.`:`Đã gửi ${g.n} tới ${houseNames(rid)}. Món quà đã có trong sân nhà.`);return true}
function renderReceived(){
  const h=homeOf(current);const c={};h.gifts.forEach(id=>c[id]=(c[id]||0)+1);
  const ks=Object.keys(c);
  $('#received').innerHTML=ks.length?ks.map(id=>{const g=goods.find(x=>x.id===id);return `<li><b>${g.n}${c[id]>1?' ×'+c[id]:''}</b><span>${g.k==='ao'?'trong tủ áo':'trong sân'}</span></li>`}).join(''):'<li>Chưa có quà. Gửi từ cửa hàng bên dưới.</li>';
}

/* ---------------- Ngôi nhà: điều khiển ---------------- */
function syncHomeUI(){
  const h=homeOf(current);
  $$('#hStyles button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===h.style));
  $$('#hRoof button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===h.roof));
  $$('#hGarden input').forEach(i=>i.checked=!!h.garden[i.dataset.g]);
}
$('#hStyles').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;homeOf(current).style=b.dataset.s;syncHomeUI();home&&home.rebuild()});
$('#hRoof').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;homeOf(current).roof=b.dataset.r;syncHomeUI();home&&home.rebuild()});
$('#hGarden').addEventListener('change',e=>{const i=e.target;homeOf(current).garden[i.dataset.g]=i.checked;home&&home.garden()});
$('#homeTime').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#homeTime button').forEach(x=>x.setAttribute('aria-pressed',x===b));home&&home.setTime(b.dataset.t)});
$('#saveHome').addEventListener('click',()=>toast('Đã lưu ngôi nhà của '+byId[current].name));

let park=null,home=null;const T=null;
