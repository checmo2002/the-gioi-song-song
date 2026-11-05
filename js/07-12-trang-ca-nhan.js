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
  function save(){try{const hs={};dead().forEach(m=>{const k=hk(m);if(homes[k])hs[k]=homes[k]});localStorage.setItem(KEY,JSON.stringify({user:ME.user,members:ME.members,seq:ME.seq,balance,homes:hs}));return true}catch(e){return false}}   // false: trình duyệt chặn hoặc đầy bộ nhớ
  function restore(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d||!d.user||typeof d.user.name!=='string')return false;ME.user=d.user;   // dữ liệu cũ hoặc hỏng: bỏ qua thay vì làm sập trang
    ME.members=(Array.isArray(d.members)?d.members:[]).filter(m=>m&&typeof m==='object'&&typeof m.name==='string'&&m.id!=null);ME.seq=d.seq||ME.members.length+1;if(typeof d.balance==='number')setBalance(d.balance);Object.assign(homes,d.homes||{});ME.members.forEach(reg);return true}catch(e){return false}}
  // đưa người đã khuất của gia đình vào hệ thống hồ sơ + nhà 3D chung của trang
  function reg(m){const exist=byId[m.id];if(!m.d){if(exist){people.splice(people.indexOf(exist),1);delete byId[m.id]}return}
    const p=exist||{id:m.id,mine:true,inc:0};Object.assign(p,{c:m.ls?'ls':'dh',name:m.name,title:m.ls?'Liệt sĩ':(m.g==='f'?'Người mẹ, người bà của dòng họ':'Người cha, người ông của dòng họ'),b:m.b||'?',d:m.d,place:ME.user.place||'Quê nhà',
      facts:[['Sinh',m.b?String(m.b):'Chưa rõ'],['Mất',String(m.d)],['Quê quán',ME.user.place||'Chưa cập nhật'],['Dòng họ',surname()?('Họ '+surname()):'—'],['Người lập hồ sơ',ME.user.name],['Ngày giỗ','Gia đình chưa cập nhật']],
      ch:[[String(m.d),'Ghi nhớ','Gia đình đang bổ sung câu chuyện về '+m.name+'.']],letter:'“Con cháu luôn nhớ về người.”',cite:'Lời gia đình',story:['Trang này do '+ME.user.name+' lập. Hãy thêm ảnh và câu chuyện để con cháu đời sau hiểu thêm về '+m.name+'.'],bio:'',houseOf:m.houseOf&&get(m.houseOf)?m.houseOf:null});
    if(!exist){people.push(p);byId[m.id]=p}}
  function syncRecipients(){$('#recipient').innerHTML=people.map(p=>`<option value="${p.id}">${esc(p.name)}${p.mine?' · gia đình':''}</option>`).join('')}

  // ---------- cây gia đình ----------
  const NW=156,NH=62,SG=14,GX=26,GY=64;let sel=null;
  const unitOf=m=>{const s=m.spouse&&get(m.spouse);return s&&!s.parent?[m,s]:[m]};
  const kidsOf=u=>{const ids=u.map(x=>x.id);return ME.members.filter(c=>c.parent&&ids.includes(c.parent)).sort((a,b)=>(a.b||9999)-(b.b||9999))};
  function width(u,seen){const own=u.length*NW+(u.length-1)*SG;const ks=kidsOf(u).filter(k=>!seen.has(k.id));ks.forEach(k=>seen.add(k.id));const kw=ks.reduce((a,k)=>a+width(unitOf(k),seen),0)+GX*Math.max(0,ks.length-1);return Math.max(own,kw)}
  function drawTree(){const svg=$('#treeSvg');const pos={},links=[],pairs=[];let maxD=0;
    const roots=[];ME.members.forEach(m=>{if(m.parent&&get(m.parent))return;const s=m.spouse&&get(m.spouse);if(s&&s.parent&&get(s.parent))return;if(s&&roots.includes(s))return;roots.push(m)});
    const placed=new Set();
    function place(u,x,depth){const w=width(u,new Set());const own=u.length*NW+(u.length-1)*SG;const ox=x+(w-own)/2;u.forEach((m,i)=>{pos[m.id]={x:ox+i*(NW+SG),y:depth*(NH+GY)};placed.add(m.id)});if(u.length>1)pairs.push(u);maxD=Math.max(maxD,depth);
      const ks=kidsOf(u).filter(k=>!placed.has(k.id));const widths=ks.map(k=>width(unitOf(k),new Set()));const kw=widths.reduce((a,b)=>a+b,0)+GX*Math.max(0,ks.length-1);let cx=x+(w-kw)/2;
      ks.forEach((k,i)=>{place(unitOf(k),cx,depth+1);links.push([u,k]);cx+=widths[i]+GX})}
    let x=0;roots.forEach(r=>{const u=unitOf(r);place(u,x,0);x+=width(u,new Set())+GX*2});
    ME.members.forEach(m=>{if(!placed.has(m.id)){pos[m.id]={x,y:0};x+=NW+GX}});
    const L=64,W=Math.max(x-GX*2,NW)+L+20,H=(maxD+1)*(NH+GY)-GY+24;svg.setAttribute('viewBox',`-${L} -12 ${W} ${H}`);svg.style.width=W+'px';svg.style.height=H+'px';
    let g='';for(let d=0;d<=maxD;d++)g+=`<text class="tg" x="-${L-4}" y="${d*(NH+GY)+NH/2+4}">Đời ${d+1}</text>`;
    links.forEach(([u,k])=>{const a=pos[u[0].id],b=u[1]?pos[u[1].id]:null;const x1=b?(a.x+b.x+NW)/2:a.x+NW/2,y1=a.y+NH,p=pos[k.id],x2=p.x+NW/2,y2=p.y,ym=y1+GY/2;g+=`<path class="tl" d="M${x1} ${y1}V${ym}H${x2}V${y2}"/>`});
    pairs.forEach(([a,b])=>{const p=pos[a.id],q=pos[b.id];g+=`<path class="ts" d="M${p.x+NW} ${p.y+NH/2}H${q.x}"/><circle class="tsd" cx="${(p.x+NW+q.x)/2}" cy="${p.y+NH/2}" r="4"/>`});
    ME.members.forEach(m=>{const p=pos[m.id];const nm=m.name.length>19?m.name.slice(0,18)+'…':m.name;
      g+=`<g class="tn${m.d?' dead':''}${m.self?' self':''}${sel===m.id?' on':''}" data-id="${m.id}" tabindex="0" role="button" aria-label="${esc(m.name)}, ${yrs(m)}" transform="translate(${p.x},${p.y})"><rect width="${NW}" height="${NH}" rx="8"/>
        ${m.d?`<path class="ic" d="M14 40v-12h4v12zM16 27c-2-3 0-5 0-7 2 2 3 4 0 7z"/>`:`<circle class="ic" cx="16" cy="31" r="4"/>`}${m.ls?`<text class="star" x="${NW-14}" y="18">★</text>`:''}
        <text class="n" x="28" y="27">${esc(nm)}</text><text class="y" x="28" y="45">${m.self?'Bạn · ':''}${yrs(m)}</text></g>`});
    svg.innerHTML=g;$('#treeEmpty').hidden=ME.members.length>1;$('#meSample').hidden=ME.members.length>1}
  $('#treeSvg').addEventListener('click',e=>{const n=e.target.closest('.tn');if(n){sel=n.dataset.id;drawTree();side()}});
  $('#treeSvg').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.tn')){e.preventDefault();sel=e.target.closest('.tn').dataset.id;drawTree();side()}});

  // ---------- bảng bên: chi tiết / thêm người ----------
  function opts(filter){return ME.members.filter(filter||(()=>true)).map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}
  function side(mode,preset){const el=$('#treeSide');const m=sel&&get(sel);
    if(mode==='add'||!m){const pr=preset||{};el.innerHTML=`<h3>Thêm người vào gia phả</h3>
      <form id="addForm" class="me-form" novalidate>
        <label>Họ và tên<input id="nfName" required maxlength="60" placeholder="Ví dụ: Phạm Hữu Cần"></label>
        <div class="row2"><label>Giới tính<select id="nfG"><option value="m">Nam</option><option value="f">Nữ</option></select></label><label>Năm sinh<input id="nfB" inputmode="numeric" maxlength="4" placeholder="1922"></label></div>
        <div class="row2"><label>Năm mất<input id="nfD" inputmode="numeric" maxlength="4" placeholder="Để trống nếu còn sống"></label><label class="chk"><input type="checkbox" id="nfLs"> Liệt sĩ</label></div>
        <div class="row2"><label>Quan hệ<select id="nfRel"><option value="child">Con của</option><option value="spouse">Vợ/Chồng của</option><option value="parent">Bố/Mẹ của</option></select></label><label>&nbsp;<select id="nfTo">${opts()}</select></label></div>
        <label>Nhà tưởng niệm 3D<select id="nfHouse"><option value="">Nhà riêng</option>${dead().map(d=>`<option value="${hk(d)}">Ở chung nhà với ${esc(d.name)}</option>`).join('')}</select></label>
        <p class="err" id="nfErr" role="alert"></p>
        <button class="btn" type="submit">Thêm vào gia phả</button>${m?'<button class="btn ghost" type="button" id="nfCancel">Huỷ</button>':''}
      </form>`;
      if(pr.rel)$('#nfRel').value=pr.rel;if(pr.to)$('#nfTo').value=pr.to;const c=$('#nfCancel');c&&c.addEventListener('click',()=>side());
      $('#addForm').addEventListener('submit',e=>{e.preventDefault();addMember()});$('#nfName').focus({preventScroll:true});return}
    const par=m.parent&&get(m.parent),sp=m.spouse&&get(m.spouse),kids=ME.members.filter(c=>c.parent===m.id||(m.spouse&&c.parent===m.spouse));
    const mates=m.d?dead().filter(x=>x.id!==m.id&&hk(x)===hk(m)):[];
    el.innerHTML=`<span class="eyebrow">${m.ls?'Liệt sĩ':m.d?'Người đã khuất':'Người thân còn sống'}</span><h3>${esc(m.name)}</h3><p class="me-y">${yrs(m)}${m.self?' · tài khoản của bạn':''}</p>
      <dl class="me-dl">${par?`<div><dt>Bố/Mẹ</dt><dd>${esc(par.name)}</dd></div>`:''}${sp?`<div><dt>Vợ/Chồng</dt><dd>${esc(sp.name)}</dd></div>`:''}${kids.length?`<div><dt>Con</dt><dd>${kids.map(k=>esc(k.name)).join(', ')}</dd></div>`:''}${mates.length?`<div><dt>Chung nhà 3D</dt><dd>${mates.map(k=>esc(k.name)).join(', ')}</dd></div>`:''}</dl>
      ${m.d?`<div class="me-act"><button class="btn" data-go="house">Vào nhà 3D</button><button class="btn ghost" data-go="profile">Xem hồ sơ</button><button class="btn ghost" data-go="incense">Thắp hương</button></div>`:''}
      <div class="me-quick"><button data-q="child">+ Thêm con</button>${sp?'':'<button data-q="spouse">+ Vợ/Chồng</button>'}${par?'':'<button data-q="parent">+ Bố/Mẹ</button>'}${m.self?'':'<button data-q="del" class="del">Xoá khỏi gia phả</button>'}</div>`;
    el.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{const q=b.dataset.q;if(q==='del'){delMember(m.id);return}side('add',{rel:q,to:m.id})}));
    el.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const go=b.dataset.go;if(go==='house')enterHouse(m.id);else if(go==='profile'){select(m.id,false);setView('app','ho-so',true)}else{select(m.id,false);lightIncense();refresh()}}))}
  function year(v){v=v.trim();if(!v)return null;const n=+v;return Number.isInteger(n)&&n>=1800&&n<=new Date().getFullYear()?n:NaN}
  function addMember(){const name=$('#nfName').value.trim(),b=year($('#nfB').value),d=year($('#nfD').value),err=$('#nfErr');
    if(!name){err.textContent='Hãy nhập họ và tên.';return}if(Number.isNaN(b)||Number.isNaN(d)){err.textContent='Năm sinh, năm mất phải là số từ 1800 đến năm nay.';return}if(b&&d&&d<b){err.textContent='Năm mất không thể trước năm sinh.';return}
    const rel=$('#nfRel').value,to=get($('#nfTo').value);if(!to){err.textContent='Hãy chọn người để nối quan hệ.';return}
    if(rel==='spouse'&&to.spouse){err.textContent=to.name+' đã có vợ/chồng trong gia phả.';return}if(rel==='parent'&&to.parent){err.textContent=to.name+' đã có bố/mẹ trong gia phả. Hãy thêm vợ/chồng cho người đó.';return}
    const m={id:'u'+(ME.seq++),name,g:$('#nfG').value,b,d,ls:$('#nfLs').checked&&!!d,parent:null,spouse:null,houseOf:d&&$('#nfHouse').value||null};
    if(rel==='child')m.parent=to.id;else if(rel==='spouse'){m.spouse=to.id;to.spouse=m.id;m.parent=null}else{to.parent=m.id}
    const wasClan=isClan();ME.members.push(m);reg(m);sel=m.id;refresh();side();toast(d?`Đã thêm ${name}. Nhà tưởng niệm trong làng đã sẵn sàng.`:`Đã thêm ${name} vào gia phả.`);
    if(!wasClan&&isClan())setTimeout(()=>toast(`Đã lập dòng họ ${surname()}. Làng dòng họ đã mở.`),2800)}
  function delMember(id){const m=get(id);if(!m||m.self)return;ME.members.forEach(x=>{if(x.parent===id)x.parent=m.spouse||null;if(x.spouse===id)x.spouse=null;if(x.houseOf===id)x.houseOf=null});
    ME.members=ME.members.filter(x=>x!==m);m.d=null;reg(m);sel=null;refresh();side();toast('Đã xoá '+m.name+' khỏi gia phả.')}

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
  function refresh(){if(!ME.user)return;ME.members.forEach(reg);syncRecipients();head();drawTree();drawVillage();drawHouses();return save()}
  function tab(t){$$('#meTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));$$('[data-mp]').forEach(p=>p.hidden=p.dataset.mp!==t)}
  $('#meTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t)});
  $('#ca-nhan').addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){tab(g.dataset.goto);if(g.dataset.goto==='tree'){sel=null;side('add')}}});
  $('#meSample').addEventListener('click',()=>{const self=ME.members.find(m=>m.self);const sn=surname()||'Phạm';const id=()=>'u'+(ME.seq++);
    const a={id:id(),name:sn+' Văn Lễ',g:'m',b:1890,d:1951},b={id:id(),name:'Đinh Thị Tơ',g:'f',b:1894,d:1960},c={id:id(),name:sn+' Văn Cần',g:'m',b:1922,d:1990},w={id:id(),name:'Trần Thị Gái',g:'f',b:1925,d:2011},k={id:id(),name:sn+' Văn Khiêm',g:'m',b:1951,d:1972,ls:true},f={id:id(),name:sn+' Văn Khôi',g:'m',b:1948,d:2020};
    a.spouse=b.id;b.spouse=a.id;c.parent=a.id;c.spouse=w.id;w.spouse=c.id;w.houseOf=c.id;b.houseOf=a.id;k.parent=c.id;f.parent=c.id;self.parent=f.id;
    [a,b,c,w,k,f].forEach(m=>{m.parent=m.parent||null;m.spouse=m.spouse||null;m.houseOf=m.houseOf||null;ME.members.push(m)});sel=self.id;refresh();side();toast('Đã thêm gia phả mẫu 4 đời. Làng dòng họ '+sn+' đã mở.')});
  $('#meInfo').addEventListener('submit',e=>{e.preventDefault();const n=$('#miName').value.trim();if(!n){toast('Hãy nhập họ và tên.');return}ME.user.name=n;ME.user.contact=$('#miContact').value.trim();ME.user.place=$('#miPlace').value.trim();const self=ME.members.find(m=>m.self);if(self)self.name=n;window.ssSetUser&&ssSetUser(n);toast(refresh()?'Đã lưu thông tin.':'Chưa lưu được: trình duyệt đang chặn bộ nhớ, thông tin sẽ mất khi đóng trang.')});
  function fillInfo(){$('#miName').value=ME.user.name;$('#miContact').value=ME.user.contact||'';$('#miPlace').value=ME.user.place||''}
  function start(){document.body.classList.add('signed');const me=ME.members.find(m=>m.self);sel=me.id;refresh();fillInfo();if(ME.members.length>1)side();else side('add',{rel:'parent',to:me.id});tab('tree')}
  window.ssMe={tree:function(){return ME},homeOf:function(id){return homeOf(id)},goods:function(){return goods},balance:function(){return balance},
    signup(name,contact){ME.user={name,contact,place:'',since:new Date().toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'})};ME.seq=2;ME.members=[{id:'u1',name,g:'m',b:null,d:null,self:true,parent:null,spouse:null}];
      people.filter(p=>p.mine).forEach(p=>{people.splice(people.indexOf(p),1);delete byId[p.id]});start()},
    login(contact){if(!ME.user&&!restore()){this.signup('Bạn',contact);return ME.user.name}start();return ME.user.name},
    logout(){document.body.classList.remove('signed')},save,refresh,
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
