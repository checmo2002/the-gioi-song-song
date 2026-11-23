/* Gia phả dòng họ trên máy chủ (functions/api, docs/gia-pha-dong-ho.md): tài khoản máy chủ, lập / vào dòng họ bằng mã mời,
   trưởng họ và người được giao sửa thẳng, thành viên gửi đề xuất chờ duyệt. Không có máy chủ (mở bằng http.server) thì ẩn cả khung. */
(function(){
  const host=$('[data-mp="tree"]');if(!host||!window.ssMe)return;
  const KEY='ss-dong-ho',VAI={truong:'Trưởng họ',duyet:'Người duyệt','thanh-vien':'Thành viên'};
  let toi=null,ds=[],dh=null,nhap=false,mo='';   // dh: {id,ten,vai,phien_ban}; nhap: thành viên có thay đổi chưa gửi; mo: phần đang mở (de-xuat, thanh-vien, moi)
  try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s){dh=s.dh||null;nhap=!!s.nhap}}catch(e){}
  const luu=()=>{try{localStorage.setItem(KEY,JSON.stringify({dh,nhap}))}catch(e){}};
  const box=document.createElement('section');box.className='dh-box';box.hidden=true;box.setAttribute('aria-label','Gia phả của cả dòng họ');host.insertBefore(box,host.firstChild);
  async function api(m,url,body){try{const r=await fetch('/api/'+url,{method:m,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
    let d={};try{d=await r.json()}catch(e){}return{st:r.status,d}}catch(e){return{st:0,d:{loi:'Không kết nối được máy chủ. Hãy kiểm tra mạng.'}}}}
  const ME=()=>ssMe.tree();
  // cây gửi lên: bỏ đồ riêng của máy, gắn người "là tôi" với tài khoản
  const cayRa=()=>({members:ME().members.map(m=>{const x=Object.assign({},m);delete x.self;delete x.houseOf;if(m.self&&toi)x.tk=toi.id;return x}),seq:ME().seq});
  function cayVao(c){const me=ME(),cu={};me.members.forEach(m=>cu[m.id]=m);
    me.members=c.members.map(m=>Object.assign({},m,{self:!!(toi&&m.tk===toi.id),houseOf:cu[m.id]&&cu[m.id].houseOf||null}));me.seq=c.seq;ssMe.ve();ssMe.save()}
  // tóm tắt khác nhau giữa hai cây (để người duyệt biết đề xuất đổi gì)
  function khac(a,b){const A={},B={};a.members.forEach(m=>A[m.id]=m);b.members.forEach(m=>B[m.id]=m);const ten=x=>x.map(m=>m.name).join(', '),bo=m=>JSON.stringify(Object.assign({},m,{self:0,houseOf:0,tk:0}));
    const them=b.members.filter(m=>!A[m.id]),xoa=a.members.filter(m=>!B[m.id]),sua=b.members.filter(m=>A[m.id]&&bo(A[m.id])!==bo(m));
    return [them.length&&'Thêm: '+ten(them),sua.length&&'Sửa: '+ten(sua),xoa.length&&'Xoá: '+ten(xoa)].filter(Boolean).join(' · ')||'Không có thay đổi'}

  async function tai(){const r=await api('GET','dong-ho/'+dh.id);
    if(r.st===404||r.st===401){toast(r.st===401?'Hãy đăng nhập lại máy chủ gia phả.':'Bạn không còn ở trong dòng họ '+dh.ten+'.');dh=null;nhap=false;luu();ve();return}
    if(r.st!==200){toast(r.d.loi||'Chưa tải được gia phả dòng họ.');return}
    dh={id:r.d.id,ten:r.d.ten,vai:r.d.vai,phien_ban:r.d.phien_ban};if(!nhap)cayVao(r.d.cay);luu();ve()}
  async function ghi(){const r=await api('PUT','dong-ho/'+dh.id+'/cay',{cay:cayRa(),phien_ban:dh.phien_ban});
    if(r.st===200){dh.phien_ban=r.d.phien_ban;luu();ve();return}
    if(r.st===409){dh.phien_ban=r.d.phien_ban;cayVao(r.d.cay);luu();ve();toast(r.d.loi);return}
    toast(r.d.loi||'Chưa lưu được lên máy chủ.')}
  addEventListener('ss-gp-doi',()=>{if(!dh||!toi)return;if(dh.vai==='thanh-vien'){nhap=true;luu();ve()}else ghi()});

  const nut=(k,t,cls)=>`<button type="button" class="btn${cls?' '+cls:''}" data-dh="${k}">${t}</button>`;
  async function ve(){if(box.hidden)return;let h='';
    if(!toi){const u=ME().user||{};h=`<details class="dh-dn"${mo==='dn'?' open':''}><summary><b>Gia phả của cả dòng họ</b><span>Lưu gia phả lên máy chủ để người trong họ cùng xem và bổ sung. Trưởng họ duyệt mọi thay đổi.</span></summary>
      <form class="me-form dh-form" novalidate><div class="row2"><label>Số điện thoại hoặc email<input name="lh" autocomplete="username" maxlength="80" value="${esc(u.contact||'')}"></label>
      <label>Mật khẩu máy chủ<input name="mk" type="password" autocomplete="current-password" maxlength="128" placeholder="Từ 8 ký tự"></label></div>
      <p class="err" role="alert"></p><div class="me-act">${nut('dang-nhap','Đăng nhập')}${nut('dang-ky','Tạo tài khoản','ghost')}</div></form></details>`}
    else if(!dh){const u=ME().user||{},ho=(u.name||'').trim().split(/\s+/)[0]||'';
      h=`<div class="dh-hd"><b>Gia phả của cả dòng họ</b><span>Đã đăng nhập máy chủ: ${esc(toi.ten)} · ${nut('dang-xuat','Đăng xuất','ghost dh-nho')}</span></div>
      ${ds.length?`<div class="dh-ds">${ds.map(d=>`<button type="button" class="dh-dong" data-mo="${esc(d.id)}"><b>${esc(d.ten)}</b><small>${VAI[d.vai]||''}</small></button>`).join('')}</div>`:''}
      <form class="me-form dh-form" novalidate><div class="row2"><label>Lập dòng họ từ gia phả này<input name="ten" maxlength="60" value="${esc(ho?'Họ '+ho:'')}" placeholder="Ví dụ: Họ Phạm làng Yên"></label>
      <label>Hoặc vào bằng mã mời<input name="ma" maxlength="10" autocomplete="off" placeholder="10 ký tự"></label></div>
      <p class="err" role="alert"></p><div class="me-act">${nut('lap','Lập dòng họ')}${nut('vao','Vào bằng mã','ghost')}</div></form>`}
    else{const dx=dh.vai!=='thanh-vien';
      h=`<div class="dh-hd"><b>${esc(dh.ten)}</b><span>${VAI[dh.vai]} · bản ${dh.phien_ban} · ${esc(toi.ten)}</span></div>
      ${nhap?`<div class="dh-nhap"><p>Bạn đã sửa gia phả trên máy này. Thay đổi chỉ hiện với cả họ sau khi trưởng họ duyệt.</p><form class="me-form dh-form" novalidate>
        <label>Ghi chú cho trưởng họ<input name="gc" maxlength="200" placeholder="Ví dụ: thêm ngày giỗ ông nội"></label><p class="err" role="alert"></p>
        <div class="me-act">${nut('gui','Gửi đề xuất')}${nut('bo','Bỏ thay đổi','ghost')}</div></form></div>`:''}
      <div class="me-quick">${dx?`<button data-dh="de-xuat">Đề xuất chờ duyệt</button><button data-dh="moi">Tạo mã mời</button>`:'<button data-dh="de-xuat">Đề xuất của tôi</button>'}
        <button data-dh="thanh-vien">Thành viên</button><button data-dh="tai">Tải lại</button><button data-dh="roi" class="del">Ngắt khỏi máy này</button></div><div class="dh-them"></div>`}
    box.innerHTML=h;if(dh&&mo)phan(mo)}

  async function phan(k){mo=k;const el=box.querySelector('.dh-them');if(!el)return;el.textContent='Đang tải…';
    if(k==='moi'){const r=await api('POST','dong-ho/'+dh.id+'/loi-moi',{});if(r.st!==201){el.textContent=r.d.loi||'Chưa tạo được mã.';return}
      el.innerHTML=`<p class="dh-ma">Mã mời: <b>${esc(r.d.ma)}</b> · dùng được tới ${new Date(r.d.het).toLocaleDateString('vi-VN')}</p><p>Gửi mã này cho người trong họ. Họ mở trang Gia đình → Gia phả, đăng nhập máy chủ rồi nhập mã.</p>`;
      try{navigator.clipboard&&navigator.clipboard.writeText(r.d.ma)}catch(e){}return}
    if(k==='thanh-vien'){const r=await api('GET','dong-ho/'+dh.id+'/thanh-vien');if(r.st!==200){el.textContent=r.d.loi||'Chưa tải được.';return}
      el.innerHTML='<ul class="dh-tv">'+r.d.thanh_vien.map(t=>`<li><span>${esc(t.ten)}</span>${dh.vai==='truong'&&t.nguoi_id!==toi.id?`<select data-vai="${esc(t.nguoi_id)}" aria-label="Vai của ${esc(t.ten)}">${Object.keys(VAI).map(v=>`<option value="${v}"${v===t.vai?' selected':''}>${VAI[v]}</option>`).join('')}</select>`:`<small>${VAI[t.vai]}</small>`}</li>`).join('')+'</ul>';return}
    if(k==='de-xuat'){const r=await api('GET','dong-ho/'+dh.id+'/de-xuat');if(r.st!==200){el.textContent=r.d.loi||'Chưa tải được.';return}
      const l=r.d.de_xuat,cur={members:ME().members};if(!l.length){el.textContent=dh.vai==='thanh-vien'?'Bạn chưa gửi đề xuất nào.':'Không có đề xuất nào đang chờ.';return}
      const TT={cho:'Đang chờ duyệt',duyet:'Đã duyệt','tu-choi':'Bị từ chối'};
      el.innerHTML='<ul class="dh-dx">'+l.map(x=>`<li><b>${esc(x.nguoi)}</b> · ${new Date(x.tao).toLocaleDateString('vi-VN')}${x.ghi_chu?` · “${esc(x.ghi_chu)}”`:''}
        <p>${x.cay?esc(khac(cur,x.cay)):''}${dh.vai==='thanh-vien'?` <em>${TT[x.trang_thai]}${x.ly_do?': '+esc(x.ly_do):''}</em>`:''}</p>
        ${dh.vai!=='thanh-vien'?`<div class="me-act"><button class="btn" data-duyet="${esc(x.id)}">Duyệt</button><button class="btn ghost" data-tuchoi="${esc(x.id)}">Từ chối</button></div>`:''}</li>`).join('')+'</ul>'}}

  async function vao(k,f,err){const v=n=>(f.elements[n]&&f.elements[n].value||'').trim();
    if(k==='dang-nhap'||k==='dang-ky'){const u=ME().user||{},r=await api('POST',k,{ten:u.name||'Bạn',lien_he:v('lh'),mat_khau:f.elements.mk.value});
      if(r.st!==200&&r.st!==201){err.textContent=r.d.loi||'Chưa đăng nhập được.';return}toi=r.d.nguoi;await batDau();return}
    if(k==='lap'){if(!v('ten')){err.textContent='Hãy đặt tên dòng họ.';return}const r=await api('POST','dong-ho',{ten:v('ten'),cay:cayRa()});
      if(r.st!==201){err.textContent=r.d.loi||'Chưa lập được dòng họ.';return}dh={id:r.d.id,ten:r.d.ten,vai:r.d.vai,phien_ban:r.d.phien_ban};nhap=false;luu();toast('Đã lập '+r.d.ten+'. Hãy tạo mã mời gửi người trong họ.');await tai();return}
    if(k==='vao'){const r=await api('POST','tham-gia',{ma:v('ma')});if(r.st!==200){err.textContent=r.d.loi||'Chưa vào được.';return}
      if(ME().members.length>1&&!confirmVao(r.d.dong_ho.ten))return;dh={id:r.d.dong_ho.id,ten:r.d.dong_ho.ten};nhap=false;luu();await tai();toast('Đã vào '+dh.ten+'.');return}
    if(k==='gui'){const r=await api('POST','dong-ho/'+dh.id+'/de-xuat',{cay:cayRa(),phien_ban:dh.phien_ban,ghi_chu:v('gc')});
      if(r.st!==201){err.textContent=r.d.loi||'Chưa gửi được.';return}nhap=false;luu();toast('Đã gửi đề xuất. Trưởng họ sẽ duyệt.');mo='de-xuat';await tai()}}
  // vào dòng họ: cây trên máy được thay bằng cây chung của họ
  const confirmVao=ten=>{const el=box.querySelector('.err');if(box.dataset.hoi===ten){delete box.dataset.hoi;return true}box.dataset.hoi=ten;
    el.textContent='Gia phả trên máy này sẽ được thay bằng gia phả chung của '+ten+'. Bấm "Vào bằng mã" lần nữa để đồng ý.';return false};

  box.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const k=b.dataset.dh,f=b.closest('form'),err=f&&f.querySelector('.err');
    if(b.dataset.mo){dh={id:b.dataset.mo,ten:b.querySelector('b').textContent};nhap=false;luu();await tai();return}
    if(b.dataset.duyet||b.dataset.tuchoi){b.disabled=true;const id=b.dataset.duyet||b.dataset.tuchoi,r=await api('POST','dong-ho/'+dh.id+'/de-xuat/'+id+'/'+(b.dataset.duyet?'duyet':'tu-choi'),{});
      toast(r.st===200?(b.dataset.duyet?'Đã duyệt. Gia phả chung đã cập nhật.':'Đã từ chối đề xuất.'):(r.d.loi||'Chưa xử lý được.'));await tai();return}
    if(!k)return;if(f&&['dang-nhap','dang-ky','lap','vao','gui'].includes(k)){e.preventDefault();err.textContent='';b.disabled=true;try{await vao(k,f,err)}finally{b.disabled=false}return}
    if(k==='dang-xuat'){await api('POST','dang-xuat',{});toi=null;dh=null;nhap=false;luu();ve();return}
    if(k==='roi'){dh=null;nhap=false;mo='';luu();ve();toast('Đã ngắt dòng họ khỏi máy này. Gia phả trên máy vẫn giữ nguyên.');return}
    if(k==='bo'){nhap=false;luu();await tai();return}
    if(k==='tai'){await tai();return}
    if(mo===k){mo='';ve();return}phan(k)});
  box.addEventListener('submit',e=>e.preventDefault());
  box.addEventListener('change',async e=>{const s=e.target.closest('[data-vai]');if(!s)return;const r=await api('POST','dong-ho/'+dh.id+'/vai',{nguoi_id:s.dataset.vai,vai:s.value});toast(r.st===200?'Đã đổi vai.':(r.d.loi||'Chưa đổi được.'))});

  async function batDau(){const r=await api('GET','toi');if(r.st!==200||!r.d||!('nguoi' in r.d)){box.hidden=true;return}   // không có máy chủ: chạy như trước
    box.hidden=false;toi=r.d.nguoi;ds=r.d.dong_ho||[];
    if(dh&&toi){const c=ds.find(d=>d.id===dh.id);if(c){dh.vai=c.vai;await tai();return}dh=null;luu()}ve()}
  batDau();
})();
