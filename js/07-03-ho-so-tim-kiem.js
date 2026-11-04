/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Danh sách / tìm kiếm ---------------- */
let catF='all';
function houseNames(id){const k=(byId[id]&&byId[id].houseOf)||id;return people.filter(q=>(q.houseOf||q.id)===k).map(q=>q.name).join(' & ')||(byId[id]&&byId[id].name)||''}
function renderResults(){
  const q=$('#q').value.trim().toLowerCase();
  const list=people.filter(p=>!p.mine&&(catF==='all'||p.c===catF)&&(!q||(p.name+' '+p.place).toLowerCase().includes(q)));
  $('#results').innerHTML=list.map(p=>`<li><button data-id="${p.id}" aria-current="${p.id===current}"><span class="n">${p.name}</span><span class="m">${p.b} – ${p.d} · ${p.place}</span><span class="c">${CAT[p.c]}</span></button></li>`).join('')||'<li style="padding:8px 10px;color:var(--ink-soft);font-size:13px">Không tìm thấy. Thử tên khác hoặc tạo hồ sơ mới.</li>';
  park&&park.filter(new Set(list.map(p=>p.id)));
}
$('#q').addEventListener('input',renderResults);
$('#cats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;catF=b.dataset.c;$$('#cats button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderResults()});
$('#results').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)select(b.dataset.id,true)});

/* ---------------- Hồ sơ ---------------- */
function renderProfile(){
  const p=byId[current];
  $('#pTitle').textContent=p.title;$('#pName').textContent=p.name;$('#pDates').textContent=`${p.b} — ${p.d} · ${p.place}`;
  $('#pBio').textContent=p.bio||p.ch.map(c=>c[2]).join(' ');
  $('#lmOld').classList.toggle('no-helmet',p.c==='nt');$('#lmOldCap').textContent='Ảnh gốc · '+(p.c==='nt'?'ảnh cũ gia đình':p.ch[0][0]);
  const i=people.indexOf(p),pv=people[(i+people.length-1)%people.length],nx=people[(i+1)%people.length];$('#lmPrev').textContent='« '+pv.name;$('#lmPrev').dataset.id=pv.id;$('#lmNext').textContent=nx.name+' »';$('#lmNext').dataset.id=nx.id;
  $('#pFacts').innerHTML=p.facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#pChapters').innerHTML=p.ch.map(([y,h,t])=>`<div class="chap"><div class="y">${y}</div><div><h3>${h}</h3><p>${t}</p></div></div>`).join('');
  $('#pLetter').innerHTML=`${p.letter}<cite>${p.cite}</cite>`;
  $('#incCount').textContent=fmt(p.inc);$('#incNote').textContent='';$('#incBtn').classList.toggle('lit',!!p.lit);
  $('#storyText').innerHTML=p.story.map(s=>`<p>${s}</p>`).join('');
  $('#parkCard').classList.remove('hide');$('#pcCat').textContent=CAT[p.c];$('#pcName').textContent=p.name;$('#pcMeta').textContent=`${p.b} – ${p.d} · ${p.place}`;
  $('#homeTag').textContent='Ngôi nhà của '+houseNames(p.id);
  $('#recipient').value=p.id;
}
function updateTotal(){$('#stProfiles').textContent=people.length;$('#stGraves').textContent=Object.values(GEO).filter(g=>g.g).length;$('#stIncense').textContent=fmt(people.reduce((a,p)=>a+p.inc,0)+0)}
function lightIncense(){
  window.ssBell&&window.ssBell();const p=byId[current];p.inc++;p.lit=true;
  $('#incCount').textContent=fmt(p.inc);$('#incBtn').classList.add('lit');
  const t=new Date();$('#incNote').textContent=`Bạn vừa thắp hương lúc ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
  updateTotal();toast('Đã thắp một nén hương cho '+p.name);
}
$('#incBtn').addEventListener('click',lightIncense);
$('#pcIncense').addEventListener('click',lightIncense);

window.ssPerson={get:()=>byId[current],all:()=>people,select:id=>select(id,false)};
function select(id,fly){
  setTimeout(()=>dispatchEvent(new Event('ss-person')),0);
  const changed=id!==current;current=id;renderProfile();if(changed)replayLM();renderResults();renderReceived();
  if(park&&fly)park.focus(id);
  if(home)home.load(homeOf(id));
  syncHomeUI();
}

/* ---------------- Ký ức ---------------- */
const notes=SS_DATA.notes;
function renderWall(){const n=notes[current]||[];$('#wall').innerHTML=n.length?n.map(([t,a,d])=>`<div class="note"><p>${esc(t)}</p><footer>${esc(a)} · ${d}</footer></div>`).join(''):'<p style="color:var(--ink-soft)">Chưa có lời nhắn nào. Hãy là người đầu tiên.</p>'}
function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
$('#msgForm').addEventListener('submit',e=>{e.preventDefault();const t=new Date();(notes[current]||(notes[current]=[])).unshift([$('#mText').value,$('#mName').value,t.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'})]);$('#mText').value='';renderWall();toast('Đã gửi lời nhắn tới '+byId[current].name)});
function showTab(p){$$('#memTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.p===p));$$('[data-pane]').forEach(d=>d.hidden=d.dataset.pane!==p)}
$('#memTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)showTab(b.dataset.p)});
$$('[data-tab]').forEach(a=>a.addEventListener('click',()=>showTab(a.dataset.tab)));

/* ---------------- Hành trình ---------------- */
$('#steps').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#steps button').forEach(x=>x.setAttribute('aria-selected',x===b));$$('[data-jp]').forEach(d=>d.hidden=d.dataset.jp!==b.dataset.j)});
