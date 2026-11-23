/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Ảnh chân dung do gia đình tải lên ---------------- */
$('#lmUpload').addEventListener('change',e=>{const f=e.target.files[0];if(!f||!f.type.startsWith('image/'))return;const box=$('#lmPortrait');let im=box.querySelector('img');if(!im){im=document.createElement('img');im.alt='Chân dung do gia đình tải lên';box.insertBefore(im,box.querySelector('svg'))}
  im.src=URL.createObjectURL(f);$('.lm-cap').textContent='Ảnh gia đình tải lên · chỉ lưu trong lần xem này';e.target.value=''});


/* ---------------- Trang cá nhân: gia phả, làng dòng họ, nhà 3D, ví nén ---------------- */
(function(){
  const KEY='ss-me';const ME={user:null,members:[],seq:1};
  const get=id=>ME.members.find(m=>m.id===id);
  const dead=()=>ME.members.filter(m=>m.d);
  const surname=()=>(ME.user&&ME.user.name.trim().split(/\s+/)[0])||'';
  const isClan=()=>dead().length>=2;
  const yrs=m=>esc(m.d?`${m.b||'?'} – ${m.d}`:`${m.b||'?'} · còn sống`);  // trả về HTML đã lọc
  const hk=m=>m.houseOf&&get(m.houseOf)?m.houseOf:m.id;
  // gia phả kiểu Việt: spouse = vợ/chồng đầu (hai chiều), sp2 = vợ/chồng thứ (người đó trỏ spouse về lại), mother = mẹ/bố còn lại khi bố có nhiều vợ
  const spousesOf=m=>[m.spouse,...(m.sp2||[])].map(get).filter(Boolean);
  const headOf=m=>{const s=spousesOf(m);return s.length===1&&spousesOf(s[0]).length>1?s[0]:m};
  const DM=v=>{v=(v||'').trim();if(!v)return null;const r=v.match(/^(\d{1,2})\s*[\/.-]\s*(\d{1,2})$/);if(!r)return NaN;const d=+r[1],mo=+r[2];return d>=1&&d<=31&&mo>=1&&mo<=12?d+'/'+mo:NaN};
  function gio(m){if(!m.d||!m.nm)return null;const [d,mo]=m.nm.split('/').map(Number);if(m.nmAl)return{d,m:mo};if(!window.ssToLunar)return null;const l=ssToLunar(d,mo,m.d);return{d:l.d,m:l.m}}
  const gioTxt=m=>{const g=gio(m);return g?g.d+'/'+g.m+' âm lịch':''};
  const sinhTxt=m=>(m.ns&&m.b?m.ns+'/':'')+(m.b||'Chưa rõ');
  const matTxt=m=>m.nm&&!m.nmAl?m.nm+'/'+m.d:m.d+(m.nm?' (ngày '+m.nm+' âm lịch)':'');
  function doiOf(m,n){n=n||0;if(!m||n>40)return 1;const p=m.parent&&get(m.parent);if(p)return doiOf(p,n+1)+1;const s=spousesOf(m).find(x=>x.parent&&get(x.parent));return s?doiOf(s,n+1):1}
  const vaiVo=m=>{const h=headOf(m),l=spousesOf(h);return h!==m&&l.length>1?(m.g==='m'?'Chồng ':'Vợ ')+(l.indexOf(m)?l.indexOf(m)+1:'cả'):''};
  function save(){try{const hs={};dead().forEach(m=>{const k=hk(m);if(homes[k])hs[k]=homes[k]});localStorage.setItem(KEY,JSON.stringify({user:ME.user,members:ME.members,seq:ME.seq,balance,homes:hs}))}catch(e){}}
  function restore(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d||!d.user)return false;ME.user=d.user;ME.members=d.members||[];ME.seq=d.seq||ME.members.length+1;if(typeof d.balance==='number')setBalance(d.balance);Object.assign(homes,d.homes||{});ME.members.forEach(reg);return true}catch(e){return false}}
  // đưa người đã khuất của gia đình vào hệ thống hồ sơ + nhà 3D chung của trang
  function reg(m){const exist=byId[m.id];if(!m.d){if(exist){people.splice(people.indexOf(exist),1);delete byId[m.id]}return}
    const p=exist||{id:m.id,mine:true,inc:0};Object.assign(p,{c:m.ls?'ls':'dh',name:m.name,title:m.ls?'Liệt sĩ':(m.g==='f'?'Người mẹ, người bà của dòng họ':'Người cha, người ông của dòng họ'),b:m.b||'?',d:m.d,place:ME.user.place||'Quê nhà',
      facts:[['Sinh',String(sinhTxt(m))],['Mất',String(matTxt(m))],['Quê quán',ME.user.place||'Chưa cập nhật'],['Dòng họ',surname()?('Họ '+surname()):'—'],['Người lập hồ sơ',ME.user.name],['Ngày giỗ',gioTxt(m)||'Gia đình chưa cập nhật'],...(m.an?[['An táng',m.an]]:[])],
      ch:[[String(m.d),'Ghi nhớ','Gia đình đang bổ sung câu chuyện về '+m.name+'.']],letter:'“Con cháu luôn nhớ về người.”',cite:'Lời gia đình',story:['Trang này do '+ME.user.name+' lập. Hãy thêm ảnh và câu chuyện để con cháu đời sau hiểu thêm về '+m.name+'.'],bio:'',houseOf:m.houseOf&&get(m.houseOf)?m.houseOf:null});
    if(!exist){people.push(p);byId[m.id]=p}}
  function syncRecipients(){$('#recipient').innerHTML=people.map(p=>`<option value="${p.id}">${esc(p.name)}${p.mine?' · gia đình':''}</option>`).join('')}

  // ---------- cây gia đình ----------
  // cây mọc lên: tổ tiên ở gốc dưới cùng, con cháu toả lên trên các cành; mỗi người là một quả tròn, tên ghi dưới quả
  const NW=128,SG=10,GX=16,R=24,RH=134,TOP=84;let sel=null,Z=1,TW=0,TH=0;const gon=new Set();let daVe=null;   // daVe: id đã vẽ lần trước, người mới hiện ra mới chạy hiệu ứng
  const hasPar=x=>!!(x.parent&&get(x.parent));
  // một khối = chủ hộ + các vợ/chồng chưa có bố mẹ trong cây (người có bố mẹ được xếp dưới bố mẹ mình)
  const unitOf=m=>{const h=headOf(m),b=h!==m&&!hasPar(h)?h:m;return [b,...spousesOf(b).filter(s=>s===m||!hasPar(s))]};
  const kidsOf=u=>{const ids=u.map(x=>x.id);return ME.members.filter(c=>c.parent&&ids.includes(c.parent)).sort((a,b)=>(a.thu||99)-(b.thu||99)||(a.b||9999)-(b.b||9999))};
  const kidsVis=u=>gon.has(u[0].id)?[]:kidsOf(u);
  function width(u,seen){const own=u.length*NW+(u.length-1)*SG;const ks=kidsVis(u).filter(k=>!seen.has(k.id));ks.forEach(k=>seen.add(k.id));const kw=ks.reduce((a,k)=>a+width(unitOf(k),seen),0)+GX*Math.max(0,ks.length-1);return Math.max(own,kw)}
  function drawTree(){const svg=$('#treeSvg');const pos={},links=[],pairs=[],cols=[];let maxD=0;
    const roots=[];ME.members.forEach(m=>{if(hasPar(m))return;const h=headOf(m);if(roots.includes(h)||hasPar(h))return;if(spousesOf(h).some(s=>hasPar(s)||roots.includes(s)))return;roots.push(h)});
    const placed=new Set();
    function place(u,x,depth){const w=width(u,new Set());u=u.filter(m=>!placed.has(m.id));if(!u.length)return;const own=u.length*NW+(u.length-1)*SG;const ox=x+(w-own)/2;u.forEach((m,i)=>{pos[m.id]={x:ox+i*(NW+SG),doi:depth};placed.add(m.id)});if(u.length>1)pairs.push(u);maxD=Math.max(maxD,depth);if(kidsOf(u).length)cols.push(u);
      const ks=kidsVis(u).filter(k=>!placed.has(k.id));const widths=ks.map(k=>width(unitOf(k),new Set()));const kw=widths.reduce((a,b)=>a+b,0)+GX*Math.max(0,ks.length-1);let cx=x+(w-kw)/2;
      ks.forEach((k,i)=>{place(unitOf(k),cx,depth+1);links.push([u,k]);cx+=widths[i]+GX})}
    let x=0;const goc=[];roots.forEach(r=>{const u=unitOf(r);place(u,x,0);goc.push(u.filter(m=>pos[m.id]));x+=width(u,new Set())+GX*2});
    const an=new Set();gon.forEach(id=>{const h=get(id);if(h)under(unitOf(h)).forEach(k=>an.add(k))});   // con cháu của chi đang thu gọn: không vẽ
    ME.members.forEach(m=>{if(!placed.has(m.id)&&!an.has(m.id)){pos[m.id]={x,doi:0};x+=NW+GX}});
    const cx=id=>pos[id].x+NW/2,cy=d=>TOP+(maxD-d)*RH+R,dat=cy(0)+R+58;   // dat: mặt đất dưới gốc
    const L=64,W=Math.max(x-GX*2,NW)+L+20,H=dat+26;svg.setAttribute('viewBox',`-${L} 0 ${W} ${H}`);TW=W;TH=H;svg.style.width=W*Z+'px';svg.style.height=H*Z+'px';
    const to=new Set();if(sel){const q=[get(sel)];while(q.length){const x=q.shift();if(!x||to.has(x.id))continue;to.add(x.id);const p=x.parent&&get(x.parent),ps=p?spousesOf(p):[];q.push(p,x.mother&&get(x.mother)||(ps.length===1?ps[0]:null))}}   // dòng tổ tiên của người đang chọn (mẹ: như bảng bên cạnh)
    const moi=id=>!daVe||!daVe.has(id),tre=id=>`style="--d:${pos[id].doi}"`,giua=u=>(cx(u[0].id)+cx(u[Math.min(1,u.length-1)].id))/2;
    // tán lá mờ phía sau các đời trên, thân và rễ dưới mỗi gốc
    const tan=k=>Object.keys(pos).filter(id=>pos[id].doi>0).map(id=>`<circle cx="${cx(id)}" cy="${cy(pos[id].doi)-6}" r="${RH*k}"/>`).join('');   // tán: các vòng chồng lên nhau thành một khối mây lá, hai lớp cho mép mềm
    let g=maxD?`<g class="tan t2">${tan(.8)}</g><g class="tan">${tan(.62)}</g>`:'';
    goc.forEach(u=>{if(!u.length)return;const xr=giua(u),y0=u.length>1?cy(0):cy(0)+R,dy=dat-y0;
      g+=`<g class="than${moi(u[0].id)?' moi':''}"><path d="M${xr-5} ${y0}C${xr-6} ${y0+dy*.5} ${xr-9} ${dat-14} ${xr-20} ${dat}H${xr+20}C${xr+9} ${dat-14} ${xr+6} ${y0+dy*.5} ${xr+5} ${y0}Z"/><path class="re" d="M${xr-12} ${dat-3}q-14 4-30 6M${xr+12} ${dat-3}q14 4 30 6M${xr-4} ${dat}q-4 6-10 10M${xr+4} ${dat}q4 6 10 10"/></g>`});
    if(goc.length)g+=`<path class="dat" d="M-${L-30} ${dat+1}H${W-L-30}"/>`;
    for(let d=0;d<=maxD;d++)g+=`<path class="tgl" d="M-${L-50} ${cy(d)}H${W-L-20}"/><text class="tg" x="-${L-4}" y="${cy(d)+4}">Đời ${d+1}</text>`;
    // cành: từ quả (hoặc nút vợ chồng) của bố mẹ cong lên tới quả của con; cành gần gốc to hơn
    links.forEach(([u,k])=>{const ids=u.map(x=>x.id),a=pos[k.parent]||pos[ids[0]];let o=k.mother&&ids.includes(k.mother)?k.mother:u.length===2?ids.find(i=>i!==k.parent):k.parent!==ids[0]?ids[0]:null;const b=o&&o!==k.parent&&pos[o]?pos[o]:null;
      const x1=b&&u.length>2?b.x+NW/2:b?(a.x+b.x+NW)/2:a.x+NW/2,y1=b?cy(a.doi)-6:cy(a.doi)-R,p=pos[k.id],x2=cx(k.id),y2=cy(p.doi)+R,h=(y1-y2)*.5,lx=(x1+x2)/2,ly=(y1+y2)/2,lr=x2>x1+2?-55:x2<x1-2?-125:-35;
      g+=`<g class="tlg${to.has(k.id)&&to.size>1?' to':''}${moi(k.id)?' moi':''}" ${tre(k.id)}><path class="tl" pathLength="1" style="stroke-width:${Math.max(2.2,7-a.doi*1.5).toFixed(1)}px" d="M${x1} ${y1}C${x1} ${y1-h} ${x2} ${y2+h} ${x2} ${y2}"/><g transform="translate(${lx} ${ly}) rotate(${lr})"><path class="la" d="M0 0c4-6 11-7 16-6c-2 6-10 8-16 6z"/></g></g>`});
    pairs.forEach(u=>u.slice(1).forEach((b,i)=>{const y=cy(pos[b.id].doi),x0=cx(u[i].id)+R,x3=cx(b.id)-R,xm=(x0+x3)/2;g+=`<path class="ts" d="M${x0} ${y}H${x3}"/><g class="tsd${moi(b.id)?' moi':''}" ${tre(b.id)}><circle cx="${xm-3}" cy="${y}" r="5"/><circle cx="${xm+3}" cy="${y}" r="5"/></g>`}));
    // nút thu gọn / mở chi phía trên mỗi khối có con; đang gọn thì ghi số con cháu bị ẩn
    cols.forEach(u=>{const xu=giua(u),yu=cy(pos[u[0].id].doi)-(u.length>1?20:R+14),on=gon.has(u[0].id),n=on?desc(u):0,w=on?34:18;
      g+=`<g class="tc${on?' on':''}" data-col="${u[0].id}" tabindex="0" role="button" aria-label="${on?'Mở':'Thu gọn'} chi của ${esc(u[0].name)}${on?', '+n+' người':''}" transform="translate(${xu},${yu})"><rect x="${-w/2}" y="-9" width="${w}" height="18" rx="9"/><text y="4">${on?'+'+n:'−'}</text></g>`});
    const dong=t=>{if(t.length<=15)return[t];const w=t.split(' ');let best=null;for(let i=1;i<w.length;i++){const a=w.slice(0,i).join(' '),b=w.slice(i).join(' '),k=Math.max(a.length,b.length);if(!best||k<best[2])best=[a,b,k]}
      return (best?[best[0],best[1]]:[t]).map(x=>x.length>17?x.slice(0,16)+'…':x)};   // tên dài: ngắt hai dòng ở chỗ cách giữa nhất
    ME.members.forEach(m=>{const p=pos[m.id];if(!p)return;const vt=[vaiVo(m),m.nuoi?'Con nuôi':''].filter(Boolean).join(' · ');const nm=dong(m.name.trim());
      const chu=(m.name.trim().split(/\s+/).pop()||'?')[0].toUpperCase();   // chữ đầu của tên gọi (chữ cuối họ tên)
      const yl=R+8,hl=14*nm.length+(vt||m.self?30:18);
      g+=`<g class="tn${m.d?' dead':''}${m.ls?' ls':''}${m.self?' self':''}${sel===m.id?' on':''}${to.has(m.id)&&sel!==m.id?' to':''}${moi(m.id)?' moi':''}" ${tre(m.id)} data-id="${m.id}" tabindex="0" role="button" aria-label="${esc(m.name)}, ${yrs(m)}" transform="translate(${cx(m.id)},${cy(p.doi)})"><g class="tb">
        ${sel===m.id?`<circle class="hl" r="${R+6}"/>`:''}<rect class="nhan" x="${-NW/2+8}" y="${yl}" width="${NW-16}" height="${hl}" rx="9"/>
        <circle class="av" r="${R}"/><text class="avc" y="6">${esc(chu)}</text>
        <g class="bd" transform="translate(${R*.74} ${R*.74})"><circle r="9.5"/>${m.d?'<path class="nen" d="M-2.6 6.5V-.5h5.2v7z"/><path class="lua" d="M0-1.5c-3.2-2.6-1.8-5.4 0-8c1.8 2.6 3.2 5.4 0 8z"/>':'<path class="mam" d="M0 6V0M0 1.5c-1-3.5-4.5-4.5-6.5-3.5c1 3.5 4.5 4.5 6.5 3.5zM0-.5c1-3.5 4.5-4.5 6.5-3.5c-1 3.5-4.5 4.5-6.5 3.5z"/>'}</g>
        ${m.ls?`<text class="star" x="${R*.55}" y="${-R*.6}">★</text>`:''}
        ${nm.map((t,i)=>`<text class="n" y="${yl+16+i*14}">${esc(t)}</text>`).join('')}<text class="y" y="${yl+16+nm.length*14}">${yrs(m)}</text>${vt||m.self?`<text class="y" y="${yl+28+nm.length*14}">${m.self?'Bạn':''}${m.self&&vt?' · ':''}${esc(vt)}</text>`:''}</g></g>`});
    svg.innerHTML=g;daVe=new Set(Object.keys(pos));$('#treeNames').innerHTML=ME.members.map(m=>`<option value="${esc(m.name)}">`).join('');$('#treeEmpty').hidden=ME.members.length>1;$('#meSample').hidden=ME.members.length>1}
  // mọi con cháu (kèm vợ/chồng của họ) dưới một khối
  function under(u){const out=new Set(),q=kidsOf(u);while(q.length){const k=q.shift();if(out.has(k.id))continue;unitOf(k).forEach(x=>out.add(x.id));q.push(...kidsOf(unitOf(k)))}return out}
  function desc(u){return [...under(u)].filter(id=>{const x=get(id);return x&&x.parent}).length}
  function gonToggle(id){gon.has(id)?gon.delete(id):gon.add(id);drawTree();const t=$(`#treeSvg [data-col="${id}"]`);t&&t.focus({preventScroll:true})}
  $('#treeSvg').addEventListener('click',e=>{const c=e.target.closest('.tc');if(c){gonToggle(c.dataset.col);return}const n=e.target.closest('.tn');if(n){sel=n.dataset.id;drawTree();side()}});
  $('#treeSvg').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const c=e.target.closest('.tc'),n=e.target.closest('.tn');if(c){e.preventDefault();gonToggle(c.dataset.col)}else if(n){e.preventDefault();sel=n.dataset.id;drawTree();side()}});
  // cây lớn: phóng to / thu nhỏ / vừa khung, kéo chuột để di chuyển, tìm tên
  const stage=$('.tree-stage');
  function zoom(k){const cw=stage.clientWidth-36,ch=stage.clientHeight-44,cx=(stage.scrollLeft+stage.clientWidth/2)/Z,cy=(stage.scrollTop+stage.clientHeight/2)/Z;
    Z=Math.min(1.6,Math.max(.12,k?Z*(k>0?1.25:.8):Math.min(1,cw/TW,ch>100?ch/TH:1)));drawTree();stage.scrollLeft=cx*Z-stage.clientWidth/2;stage.scrollTop=cy*Z-stage.clientHeight/2}
  $$('.tree-tools [data-z]').forEach(b=>b.addEventListener('click',()=>zoom(+b.dataset.z)));
  let keo=null;stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button||e.target.closest('.tn,.tc'))return;keo=[e.clientX,e.clientY,stage.scrollLeft,stage.scrollTop];stage.classList.add('keo')});
  addEventListener('pointermove',e=>{if(keo){stage.scrollLeft=keo[2]-(e.clientX-keo[0]);stage.scrollTop=keo[3]-(e.clientY-keo[1])}});
  addEventListener('pointerup',()=>{keo=null;stage.classList.remove('keo')});
  const bo=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();   // tìm không cần gõ dấu
  function tim(){const v=bo($('#treeFind').value);if(!v)return;const m=ME.members.find(x=>bo(x.name)===v)||ME.members.find(x=>bo(x.name).includes(v));
    if(!m){toast('Không thấy ai tên "'+$('#treeFind').value.trim()+'" trong gia phả.');return}
    gon.clear();sel=m.id;drawTree();side();const n=$(`#treeSvg .tn[data-id="${m.id}"]`),r=n.getBoundingClientRect(),s=stage.getBoundingClientRect();
    stage.scrollLeft+=r.left-s.left-s.width/2+r.width/2;stage.scrollTop+=r.top-s.top-s.height/2+r.height/2;n.focus({preventScroll:true})}
  $('#treeFind').addEventListener('change',tim);$('#treeFind').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();tim()}});

  // ---------- bảng bên: chi tiết / thêm người ----------
  function opts(filter){return ME.members.filter(filter||(()=>true)).map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}
  function form(e,cancel){const ad=!e;e=e||{};const v=x=>x==null?'':esc(String(x)),more=['ns','nm','huy','tu','thuy','chi','thu','nuoi','an'].some(k=>e[k]);
    return `<h3>${ad?'Thêm người vào gia phả':'Sửa thông tin'}</h3>
      <form id="addForm" class="me-form" novalidate>
        <label>Họ và tên<input id="nfName" required maxlength="60" value="${v(e.name)}" placeholder="Ví dụ: Phạm Hữu Cần"></label>
        <div class="row2"><label>Giới tính<select id="nfG"><option value="m">Nam</option><option value="f"${e.g==='f'?' selected':''}>Nữ</option></select></label><label>Năm sinh<input id="nfB" inputmode="numeric" maxlength="4" value="${v(e.b)}" placeholder="1922"></label></div>
        <div class="row2"><label>Năm mất<input id="nfD" inputmode="numeric" maxlength="4" value="${v(e.d)}" placeholder="Để trống nếu còn sống"></label><label class="chk"><input type="checkbox" id="nfLs"${e.ls?' checked':''}> Liệt sĩ</label></div>
        ${ad?`<div class="row2"><label>Quan hệ<select id="nfRel"><option value="child">Con của</option><option value="spouse">Vợ/Chồng của</option><option value="parent">Bố/Mẹ của</option></select></label><label>&nbsp;<select id="nfTo">${opts()}</select></label></div>
        <label id="nfMoL" hidden>Mẹ / bố còn lại<select id="nfMo"></select></label>
        <label>Nhà tưởng niệm 3D<select id="nfHouse"><option value="">Nhà riêng</option>${dead().map(d=>`<option value="${hk(d)}">Ở chung nhà với ${esc(d.name)}</option>`).join('')}</select></label>`:''}
        <details class="gp-more"${more?' open':''}><summary>Thông tin gia phả: ngày giỗ, tên húy, chi, nơi an táng</summary>
          <div class="row2"><label>Ngày sinh<input id="nfNs" maxlength="5" value="${v(e.ns)}" placeholder="ngày/tháng"></label><label>Ngày mất<input id="nfNm" maxlength="5" value="${v(e.nm)}" placeholder="ngày/tháng"></label></div>
          <label class="chk"><input type="checkbox" id="nfNmAl"${e.nmAl?' checked':''}> Ngày mất ghi theo âm lịch</label>
          <div class="row2"><label>Tên húy<input id="nfHuy" maxlength="40" value="${v(e.huy)}"></label><label>Tên tự<input id="nfTu" maxlength="40" value="${v(e.tu)}"></label></div>
          <div class="row2"><label>Thụy hiệu<input id="nfThuy" maxlength="60" value="${v(e.thuy)}"></label><label>Chi / ngành<input id="nfChi" maxlength="40" value="${v(e.chi)}" placeholder="Chi trưởng"></label></div>
          <div class="row2"><label>Con thứ<input id="nfThu" inputmode="numeric" maxlength="2" value="${v(e.thu)}" placeholder="1"></label><label class="chk"><input type="checkbox" id="nfNuoi"${e.nuoi?' checked':''}> Con nuôi</label></div>
          <label>Nơi an táng<input id="nfAn" maxlength="120" value="${v(e.an)}" placeholder="Ví dụ: nghĩa trang làng"></label>
        </details>
        <p class="err" id="nfErr" role="alert"></p>
        <button class="btn" type="submit">${ad?'Thêm vào gia phả':'Lưu thay đổi'}</button>${cancel?'<button class="btn ghost" type="button" id="nfCancel">Huỷ</button>':''}
      </form>`}
  // con của: có bố/mẹ nhiều vợ/chồng thì hỏi con của người nào
  function upMo(){const to=get($('#nfTo').value),ss=to?spousesOf(to):[],on=$('#nfRel').value==='child'&&ss.length>1;$('#nfMoL').hidden=!on;
    $('#nfMo').innerHTML=on?ss.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')+'<option value="">Không rõ</option>':''}
  // biểu tượng nét mảnh cho các nút bên cạnh cây (màu theo chữ của nút)
  const IC=(d=>k=>`<svg class="ic-n" viewBox="0 0 16 16" aria-hidden="true"><path d="${d[k]}"/></svg>`)({
    edit:'M3 13l1-3.5L10.5 3a1.4 1.4 0 012 2L6 11.5zM9.5 4l2.5 2.5',child:'M8 14V8M8 9C7 6 4 5 2 6c1 3 4 4 6 3zM8 7c1-3 4-4 6-3c-1 3-4 4-6 3z',
    spouse:'M6 8m-3.5 0a3.5 3.5 0 107 0a3.5 3.5 0 10-7 0M10 8m-3.5 0a3.5 3.5 0 107 0a3.5 3.5 0 10-7 0',parent:'M8 13V4M4.5 7.5L8 4l3.5 3.5',
    del:'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5',house:'M2.5 7.5L8 3l5.5 4.5M4 6.5V13h8V6.5M6.8 13v-3h2.4v3',
    profile:'M4 2.5h6l2 2V13.5H4zM6 7h4M6 9.5h4',incense:'M8 14V7M6.5 14h3M8 5.5c-1.5-1-1-2.5 0-3.5c1 1 1.5 2.5 0 3.5z'});
  function side(mode,preset){const el=$('#treeSide');const m=sel&&get(sel);el.classList.remove('vao');void el.offsetWidth;el.classList.add('vao');
    if(mode==='add'||mode==='edit'||!m){const ed=mode==='edit'&&m;el.innerHTML=form(ed?m:null,!!m);
      if(!ed){const pr=preset||{};if(pr.rel)$('#nfRel').value=pr.rel;if(pr.to)$('#nfTo').value=pr.to;upMo();$('#nfRel').addEventListener('change',upMo);$('#nfTo').addEventListener('change',upMo)}
      const c=$('#nfCancel');c&&c.addEventListener('click',()=>side());
      $('#addForm').addEventListener('submit',e=>{e.preventDefault();ed?saveEdit(m):addMember()});$('#nfName').focus({preventScroll:true});return}
    const par=m.parent&&get(m.parent),ps=par?spousesOf(par):[],mo=m.mother&&get(m.mother)||(ps.length===1?ps[0]:null),sps=spousesOf(m);
    const kids=ME.members.filter(c=>c.parent===m.id||c.mother===m.id||(!c.mother&&c.parent&&sps.some(s=>s.id===c.parent)&&spousesOf(get(c.parent)).length===1)).sort((a,b)=>(a.thu||99)-(b.thu||99)||(a.b||9999)-(b.b||9999));
    const mates=m.d?dead().filter(x=>x.id!==m.id&&hk(x)===hk(m)):[];
    const row=(k,v)=>v?`<div><dt>${k}</dt><dd>${esc(String(v))}</dd></div>`:'',pn=p=>p?(p.g==='f'?'Mẹ':'Bố'):'';
    const vo=sps.map(s=>s.name+(sps.length>1?' ('+((s.g==='m'?'chồng ':'vợ ')+(sps.indexOf(s)?sps.indexOf(s)+1:'cả'))+')':'')).join(', ');
    el.innerHTML=`<span class="eyebrow">${m.ls?'Liệt sĩ':m.d?'Người đã khuất':'Người thân còn sống'}</span><h3>${esc(m.name)}</h3><p class="me-y">${yrs(m)}${m.self?' · tài khoản của bạn':''}</p>
      <dl class="me-dl">${row('Đời','Đời thứ '+doiOf(m))}${row('Chi / ngành',m.chi)}${row('Con thứ',m.thu&&(m.thu+(m.nuoi?' (con nuôi)':'')))}${!m.thu&&m.nuoi?row('','Con nuôi'):''}${row('Tên húy',m.huy)}${row('Tên tự',m.tu)}${row('Thụy hiệu',m.thuy)}
        ${m.ns?row('Sinh',sinhTxt(m)):''}${m.d&&m.nm?row('Mất',matTxt(m)):''}${row('Ngày giỗ',gioTxt(m))}${row('An táng',m.an)}
        ${row(pn(par),par&&par.name)}${row(pn(mo),mo&&mo!==par&&mo.name)}${row(vaiVo(m)?'Vai':'',vaiVo(m))}${row('Vợ/Chồng',vo)}
        ${row('Con',kids.map(k=>k.name+(k.nuoi?' (con nuôi)':'')).join(', '))}${row('Chung nhà 3D',mates.map(k=>k.name).join(', '))}</dl>
      ${m.d?`<div class="me-act"><button class="btn" data-go="house">${IC('house')}Vào nhà 3D</button><button class="btn ghost" data-go="profile">${IC('profile')}Xem hồ sơ</button><button class="btn ghost" data-go="incense">${IC('incense')}Thắp hương</button></div>`:''}
      <div class="me-quick"><button data-q="edit">${IC('edit')}Sửa thông tin</button><button data-q="child">${IC('child')}Thêm con</button><button data-q="spouse">${IC('spouse')}Vợ/Chồng</button>${par&&mo?'':`<button data-q="parent">${IC('parent')}Bố/Mẹ</button>`}${m.self?'':`<button data-q="del" class="del">${IC('del')}Xoá khỏi gia phả</button>`}</div>`;
    el.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{const q=b.dataset.q;if(q==='del'){delMember(m.id);return}if(q==='edit'){side('edit');return}side('add',{rel:q,to:m.id})}));
    el.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const go=b.dataset.go;if(go==='house')enterHouse(m.id);else if(go==='profile'){select(m.id,false);setView('app','ho-so',true)}else{select(m.id,false);lightIncense();refresh()}}))}
  function year(v){v=v.trim();if(!v)return null;const n=+v;return Number.isInteger(n)&&n>=1800&&n<=new Date().getFullYear()?n:NaN}
  function readForm(err){const name=$('#nfName').value.trim(),b=year($('#nfB').value),d=year($('#nfD').value),ns=DM($('#nfNs').value),nm=DM($('#nfNm').value),t=$('#nfThu').value.trim(),thu=t?+t:null,al=$('#nfNmAl').checked;
    if(!name){err.textContent='Hãy nhập họ và tên.';return null}if(Number.isNaN(b)||Number.isNaN(d)){err.textContent='Năm sinh, năm mất phải là số từ 1800 đến năm nay.';return null}if(b&&d&&d<b){err.textContent='Năm mất không thể trước năm sinh.';return null}
    if(Number.isNaN(ns)||Number.isNaN(nm)){err.textContent='Ngày sinh, ngày mất ghi dạng ngày/tháng, ví dụ 12/3.';return null}if(nm&&al&&+nm.split('/')[0]>30){err.textContent='Ngày âm lịch chỉ tới 30.';return null}
    if(thu!==null&&!(Number.isInteger(thu)&&thu>=1&&thu<=30)){err.textContent='Con thứ là số từ 1 đến 30.';return null}
    const tx=id=>$(id).value.trim()||null;return{name,g:$('#nfG').value,b,d,ls:$('#nfLs').checked&&!!d,ns,nm:d?nm:null,nmAl:!!(d&&nm&&al),huy:tx('#nfHuy'),tu:tx('#nfTu'),thuy:tx('#nfThuy'),chi:tx('#nfChi'),thu,nuoi:$('#nfNuoi').checked,an:tx('#nfAn')}}
  // thêm vợ/chồng: người đã có vợ/chồng thì người mới là vợ/chồng thứ
  function wed(a,b){if(!a.spouse)a.spouse=b.id;else if(a.spouse!==b.id&&!(a.sp2||[]).includes(b.id))a.sp2=(a.sp2||[]).concat(b.id);b.spouse=a.id}
  const daDoi=()=>dispatchEvent(new Event('ss-gp-doi'));
  function addMember(){const err=$('#nfErr'),f=readForm(err);if(!f)return;
    const rel=$('#nfRel').value,to=get($('#nfTo').value);if(!to){err.textContent='Hãy chọn người để nối quan hệ.';return}
    const m=Object.assign({id:'u'+(ME.seq++),parent:null,spouse:null,houseOf:f.d&&$('#nfHouse').value||null},f);
    if(rel==='child'){m.parent=to.id;if(!$('#nfMoL').hidden&&$('#nfMo').value)m.mother=$('#nfMo').value}
    else if(rel==='spouse')wed(to,m);
    else{const p=to.parent&&get(to.parent);if(p){wed(p,m);to.mother=m.id}else to.parent=m.id}   // đã có bố hoặc mẹ: người mới là vợ/chồng của người đó
    const wasClan=isClan();ME.members.push(m);reg(m);sel=m.id;refresh();side();toast(f.d?`Đã thêm ${f.name}. Nhà tưởng niệm trong làng đã sẵn sàng.`:`Đã thêm ${f.name} vào gia phả.`);
    if(!wasClan&&isClan())setTimeout(()=>toast(`Đã lập dòng họ ${surname()}. Làng dòng họ đã mở.`),2800);daDoi()}
  function saveEdit(m){const f=readForm($('#nfErr'));if(!f)return;Object.assign(m,f);if(!m.d)m.houseOf=null;
    if(m.self&&ME.user){ME.user.name=m.name;window.ssSetUser&&ssSetUser(m.name)}reg(m);refresh();side();toast('Đã lưu thông tin '+m.name+'.');daDoi()}
  function delMember(id){const m=get(id);if(!m||m.self)return;
    ME.members.forEach(x=>{if(x.parent===id){x.parent=x.mother&&x.mother!==id?x.mother:(m.spouse||null);if(x.parent===x.mother)x.mother=null}if(x.mother===id)x.mother=null;
      if(x.sp2)x.sp2=x.sp2.filter(s=>s!==id);if(x.spouse===id)x.spouse=(x.sp2&&x.sp2.shift())||null;if(x.houseOf===id)x.houseOf=null});
    ME.members=ME.members.filter(x=>x!==m);m.d=null;reg(m);sel=null;refresh();side();toast('Đã xoá '+m.name+' khỏi gia phả.');daDoi()}

  // ---------- làng dòng họ 3D (cùng bộ dựng hình với làng chung) ----------
  let clan=null;
  function drawVillage(){const box=$('#meVillage');
    box.innerHTML='<div class="me-lock"><b>Làng tưởng niệm</b><p>Nhà của từng người thân nằm trong Làng tưởng niệm dưới chân núi chùa.</p><button class="btn" type="button" data-go-lang>Vào làng</button></div>';
    box.querySelector('[data-go-lang]').addEventListener('click',()=>window.ssGoWorld&&ssGoWorld('lang'))}
  

  // ---------- danh sách nhà 3D ----------
  function drawHouses(){const box=$('#meHouses');const groups={};dead().forEach(m=>{(groups[hk(m)]=groups[hk(m)]||[]).push(m)});const ks=Object.keys(groups);
    box.innerHTML=ks.length?ks.map(k=>{const ms=groups[k],h=homes[k],n=h?h.gifts.length:0;return `<article class="me-hc"><svg viewBox="0 0 60 44" aria-hidden="true"><path d="M6 22 30 8l24 14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 22v16h40V22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 38v-9h8v9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      <h4>${ms.map(m=>esc(m.name)).join(' & ')}</h4><p>${ms.map(m=>yrs(m)).join(' · ')}</p><p class="me-hg">${n?n+' món quà trong nhà':'Chưa có quà'}${ms.length>1?' · nhà chung':''}</p>
      <div class="me-act"><button class="btn" data-k="${k}" data-a="in">Vào nhà 3D</button><button class="btn ghost" data-k="${k}" data-a="shop">Cửa hàng</button></div></article>`}).join('')
      :`<div class="me-lock"><b>Chưa có nhà tưởng niệm</b><p>Thêm một người đã khuất vào gia phả, ngôi nhà 3D của người sẽ được dựng ngay.</p><button class="btn" data-goto="tree">Thêm vào gia phả</button></div>`;
    box.querySelectorAll('button[data-a]').forEach(b=>b.addEventListener('click',()=>enterHouse(b.dataset.k,b.dataset.a==='shop')))}

  // ---------- chung ----------
  function enterHouse(id,shop){select(id,false);if(shop){setView('app','cua-hang',true);return}window.ssGoWorld&&ssGoWorld('nha',id)}
  function head(){const u=ME.user;$('#meAv').textContent=(u.name.trim().split(/\s+/).pop()||'?')[0].toUpperCase();$('#meName').textContent=u.name;$('#meSub').textContent=[u.contact,u.place,'Thành viên từ '+u.since].filter(Boolean).join(' · ');
    const dc=dead().length,hc=new Set(dead().map(hk)).size;$('#meStats').innerHTML=[[ME.members.length,'người trong gia phả'],[dc,'người đã khuất'],[hc,'ngôi nhà 3D'],[isClan()?('Họ '+surname()):'Chưa lập','dòng họ']].map(([v,l])=>`<div><b>${esc(String(v))}</b><span>${l}</span></div>`).join('');
    $('#meClan').hidden=!isClan();$('#meClan').textContent='Dòng họ '+surname()}
  function refresh(){if(!ME.user)return;ME.members.forEach(reg);syncRecipients();head();drawTree();drawVillage();drawHouses();save()}
  function tab(t){$$('#meTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));$$('[data-mp]').forEach(p=>p.hidden=p.dataset.mp!==t)}
  $('#meTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t)});
  $('#ca-nhan').addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){tab(g.dataset.goto);if(g.dataset.goto==='tree'){sel=null;side('add')}}});
  $('#meSample').addEventListener('click',()=>{const self=ME.members.find(m=>m.self);const sn=surname()||'Phạm';const id=()=>'u'+(ME.seq++);
    const a={id:id(),name:sn+' Văn Lễ',g:'m',b:1890,d:1951},b={id:id(),name:'Đinh Thị Tơ',g:'f',b:1894,d:1960},c={id:id(),name:sn+' Văn Cần',g:'m',b:1922,d:1990},w={id:id(),name:'Trần Thị Gái',g:'f',b:1925,d:2011},k={id:id(),name:sn+' Văn Khiêm',g:'m',b:1951,d:1972,ls:true},f={id:id(),name:sn+' Văn Khôi',g:'m',b:1948,d:2020};
    Object.assign(a,{chi:'Chi trưởng',huy:'Lễ',nm:'12/3',nmAl:true});Object.assign(c,{nm:'15/8',thu:1});Object.assign(k,{nm:'27/7',thu:2,an:'Nghĩa trang liệt sĩ quê nhà'});Object.assign(f,{thu:1});a.spouse=b.id;b.spouse=a.id;c.parent=a.id;c.spouse=w.id;w.spouse=c.id;w.houseOf=c.id;b.houseOf=a.id;k.parent=c.id;f.parent=c.id;self.parent=f.id;
    [a,b,c,w,k,f].forEach(m=>{m.parent=m.parent||null;m.spouse=m.spouse||null;m.houseOf=m.houseOf||null;ME.members.push(m)});sel=self.id;refresh();side();toast('Đã thêm gia phả mẫu 4 đời. Làng dòng họ '+sn+' đã mở.');daDoi()});
  $('#meInfo').addEventListener('submit',e=>{e.preventDefault();const n=$('#miName').value.trim();if(!n){toast('Hãy nhập họ và tên.');return}ME.user.name=n;ME.user.contact=$('#miContact').value.trim();ME.user.place=$('#miPlace').value.trim();const self=ME.members.find(m=>m.self);if(self)self.name=n;window.ssSetUser&&ssSetUser(n);refresh();toast('Đã lưu thông tin.')});
  function fillInfo(){$('#miName').value=ME.user.name;$('#miContact').value=ME.user.contact||'';$('#miPlace').value=ME.user.place||''}
  function start(){document.body.classList.add('signed');const me=ME.members.find(m=>m.self);sel=me?me.id:null;refresh();fillInfo();if(ME.members.length>1||!me)side();else side('add',{rel:'parent',to:me.id});tab('tree')}
  window.ssGio=(d,mo)=>dead().filter(x=>{const g=gio(x);return g&&g.d===d&&g.m===mo}).map(x=>'Giỗ '+x.name);   // lịch vạn niên (02) hiện ngày giỗ
  window.ssMe={tree:function(){return ME},homeOf:function(id){return homeOf(id)},goods:function(){return goods},balance:function(){return balance},
    signup(name,contact){ME.user={name,contact,place:'',since:new Date().toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'})};ME.seq=2;ME.members=[{id:'u1',name,g:'m',b:null,d:null,self:true,parent:null,spouse:null}];
      people.filter(p=>p.mine).forEach(p=>{people.splice(people.indexOf(p),1);delete byId[p.id]});start()},
    login(contact){if(!ME.user&&!restore()){this.signup('Bạn',contact);return ME.user.name}start();return ME.user.name},
    logout(){document.body.classList.remove('signed')},save,refresh,ve(){if(sel&&!get(sel))sel=null;refresh();side()},
    resume(){if(restore()){start();return ME.user.name}return null}};
  // shortcut: dữ liệu gia phả chỉ lưu trên trình duyệt này (localStorage); cần máy chủ và tài khoản thật khi làm sản phẩm
  // tự kiểm tra bố cục cây: con luôn nằm thấp hơn cha mẹ một đời
  console.assert((()=>{const bk=JSON.stringify(ME);ME.members=[{id:'a',name:'A',self:true},{id:'b',name:'B',parent:'a'},{id:'c',name:'C',parent:'b'}];const u=unitOf(ME.members[0]);const ok=width(u,new Set())>=NW&&kidsOf(u).length===1;Object.assign(ME,JSON.parse(bk));return ok})(),'tree layout');

  // ---------- cửa hàng trong nhà 3D ----------
  let hk2='all';
  function drawShop(){const p=byId[current];$('#hsTo').textContent=p?('Gửi tới: '+houseNames(current)):'';
    $('#hsList').innerHTML=goods.filter(g=>hk2==='all'||g.k===hk2).map(g=>`<li><span class="hs-ic"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${IC[g.id]}</svg></span><span class="hs-t"><b>${g.n}</b><small>${g.k==='ao'?'Cất vào tủ áo':g.k==='noi'?'Bày trong nhà':'Đặt ngoài sân'}</small></span><button class="btn" data-buy="${g.id}">${g.p} nén</button></li>`).join('')}
  function openShop(){drawShop();$('#hshop').hidden=false;$('#homeStage').classList.add('shop-open')}
  window.ssOpenShop=openShop;
  $('#homeShopBtn').addEventListener('click',()=>{$('#hshop').hidden?openShop():($('#hshop').hidden=true,$('#homeStage').classList.remove('shop-open'))});
  $('#hsClose').addEventListener('click',()=>{$('#hshop').hidden=true;$('#homeStage').classList.remove('shop-open')});
  $('#hsCats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;hk2=b.dataset.k;$$('#hsCats button').forEach(x=>x.setAttribute('aria-pressed',x===b));drawShop()});
  $('#hsList').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(b&&buy(b.dataset.buy,current))refresh()});

  // ---------- nạp nén (bản trình diễn) ----------
  const tp=$('#topup');
  document.addEventListener('click',e=>{if(e.target.closest('[data-topup]')){tp.hidden=false}else if(e.target.closest('[data-tpclose]'))tp.hidden=true;const pk=e.target.closest('[data-pack]');if(pk){setBalance(balance+(+pk.dataset.pack));tp.hidden=true;save();toast(`Đã nạp ${(+pk.dataset.pack).toLocaleString('vi-VN')} nén (bản trình diễn, chưa trừ tiền thật).`)}});
  addEventListener('keydown',e=>{if(e.key==='Escape')tp.hidden=true});
})();
