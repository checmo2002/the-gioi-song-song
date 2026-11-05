/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Dải gradient dọc + minh họa isometric ---------------- */
/* nhịp tim: đường điện tim phát sáng quét ngang, trái tim ở giữa, 72 nhịp/phút */
(function(){
  const BEAT=60/72,ecg=x=>.12*Math.exp(-(((x+13)/3.2)**2))-.14*Math.exp(-(((x+3.2)/1.1)**2))+1*Math.exp(-((x/1.5)**2))-.32*Math.exp(-(((x-3.4)/1.3)**2))+.22*Math.exp(-(((x-14)/4.2)**2));
  const items=$$('.ecg').map(cv=>({cv,ctx:cv.getContext('2d'),vis:false,hero:!!cv.dataset.hero,ph:0}));
  function build(it){const cv=it.cv,dpr=Math.min(devicePixelRatio||1,2),W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
    cv.width=W*dpr;cv.height=H*dpr;it.W=W;it.H=H;it.dpr=dpr;
    const mid=H/2,pad=Math.max(16,H*.12),half=H/2-pad,amp=half*.92,cx=W/2,s=Math.min(half/14.5,W*.1/16),hl=cx-16*s,hr=cx+16*s,jl=hl-5*s,jr=hr+5*s;
    // vị trí các nhịp, chừa chỗ cho trái tim
    const gap=Math.max(150,Math.min(260,W*.17));const beats=[];for(let x=jl-gap*.55;x>-60;x-=gap)beats.push(x);for(let x=jr+gap*.55;x<W+60;x+=gap)beats.push(x);beats.sort((a,b)=>a-b);it.beats=beats;
    const sc=W<600?1.6:2.2;// px mỗi đơn vị ecg
    const ys=new Float32Array(Math.ceil(W)+1);for(let x=0;x<=W;x++){let g=0;for(const b of beats)g+=ecg((x-b)/sc);ys[x]=mid-g*amp}
    const H2=t=>[cx+16*Math.pow(Math.sin(t),3)*s,mid-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)+2.5)*s];
    // đường chính đi qua nửa trên trái tim
    for(let x=Math.max(0,Math.ceil(jl));x<=Math.min(W,Math.floor(jr));x++)ys[x]=NaN;
    const topPts=[];for(let i=0;i<=120;i++){const t=-Math.PI/2+i/120*Math.PI;topPts.push(H2(t))}
    const botPts=[];for(let i=0;i<=120;i++){const t=Math.PI/2+i/120*Math.PI;botPts.push(H2(t))}
    // y tại mỗi x cho đầu quét (vùng trái tim lấy theo nửa trên)
    topPts.forEach(([x,y])=>{const xi=Math.round(x);if(xi>=0&&xi<=W&&(isNaN(ys[xi])||y<ys[xi]))ys[xi]=y});
    for(let x=0;x<=W;x++)if(isNaN(ys[x])){let a=x-1,b=x;while(b<=W&&isNaN(ys[b]))b++;const ya=a>=0?ys[a]:mid,yb=b<=W?ys[b]:mid;for(let k=x;k<b;k++)ys[k]=ya+(yb-ya)*(k-a)/(b-a);x=b}
    it.ys=ys;it.heart={hl,hr,cx,cy:mid,s};
    // lưới
    const g=document.createElement('canvas');g.width=cv.width;g.height=cv.height;const gx=g.getContext('2d');gx.scale(dpr,dpr);
    gx.strokeStyle='rgba(77,134,255,.07)';gx.lineWidth=1;const st=22;for(let x=(W/2)%st;x<W;x+=st){gx.beginPath();gx.moveTo(x+.5,0);gx.lineTo(x+.5,H);gx.stroke()}for(let y=mid%st;y<H;y+=st){gx.beginPath();gx.moveTo(0,y+.5);gx.lineTo(W,y+.5);gx.stroke()}
    gx.strokeStyle='rgba(77,134,255,.13)';for(let x=(W/2)%(st*5);x<W;x+=st*5){gx.beginPath();gx.moveTo(x+.5,0);gx.lineTo(x+.5,H);gx.stroke()}
    it.grid=g;
    // nét điện tim phát sáng
    const tr=document.createElement('canvas');tr.width=cv.width;tr.height=cv.height;const tx=tr.getContext('2d');tx.scale(dpr,dpr);tx.lineJoin='round';tx.lineCap='round';
    const path=()=>{tx.beginPath();let x=0;tx.moveTo(0,mid);for(x=1;x<=jl;x++){let gg=0;for(const b of beats)gg+=ecg((x-b)/sc);tx.lineTo(x,mid-gg*amp)}topPts.forEach(([a,b])=>tx.lineTo(a,b));for(x=Math.ceil(jr);x<=W;x++){let gg=0;for(const b of beats)gg+=ecg((x-b)/sc);tx.lineTo(x,mid-gg*amp)}
      tx.moveTo(...botPts[0]);botPts.forEach(([a,b])=>tx.lineTo(a,b))};
    [[7,'rgba(212,160,70,.28)',18],[3,'rgba(184,134,47,.85)',10],[1.3,'#7A5418',0]].forEach(([w,c,bl])=>{tx.save();tx.lineWidth=w;tx.strokeStyle=c;tx.shadowColor='#E8B866';tx.shadowBlur=bl;path();tx.stroke();tx.restore()});
    it.trace=tr;it.tmp=it.tmp||document.createElement('canvas');it.tmp.width=cv.width;it.tmp.height=cv.height}
  function draw(it,head){const {ctx,W,H,dpr}=it;if(!W)return;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,it.cv.width,it.cv.height);
    const t=it.tmp.getContext('2d');t.globalCompositeOperation='source-over';t.clearRect(0,0,it.tmp.width,it.tmp.height);t.drawImage(it.trace,0,0);
    if(head!=null){t.globalCompositeOperation='destination-in';const gr=t.createLinearGradient(0,0,it.tmp.width,0),L=W*.75,gap=W*.05;
      const al=x=>{let d=head-x;if(d<0)d+=W;if(d>W-gap)return 0;return Math.max(.05,1-d/L)};
      for(let i=0;i<=48;i++){const x=i/48*W;gr.addColorStop(i/48,`rgba(0,0,0,${al(x).toFixed(3)})`)}
      t.fillStyle=gr;t.fillRect(0,0,it.tmp.width,it.tmp.height)}
    ctx.drawImage(it.tmp,0,0);
    if(head!=null&&it.heart){const hh=it.heart;let d=head-hh.cx;const k=Math.max(0,1-Math.abs(d)/(26*hh.s));if(k>0){ctx.setTransform(dpr,0,0,dpr,0,0);const r=18*hh.s,gg=ctx.createRadialGradient(hh.cx,hh.cy,0,hh.cx,hh.cy,r);gg.addColorStop(0,`rgba(232,184,102,${(.4*k).toFixed(3)})`);gg.addColorStop(1,'rgba(232,184,102,0)');ctx.fillStyle=gg;ctx.fillRect(hh.cx-r,hh.cy-r,r*2,r*2)}}
    if(head!=null){ctx.setTransform(dpr,0,0,dpr,0,0);const y=it.ys[Math.max(0,Math.min(it.ys.length-1,Math.round(head)))];const g=ctx.createRadialGradient(head,y,0,head,y,16);g.addColorStop(0,'rgba(255,248,226,1)');g.addColorStop(.3,'rgba(232,184,102,.9)');g.addColorStop(1,'rgba(232,184,102,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(head,y,16,0,Math.PI*2);ctx.fill()}}
  const io=new IntersectionObserver(es=>es.forEach(e=>{const it=items.find(q=>q.cv===e.target);if(it)it.vis=e.isIntersecting}));
  items.forEach(it=>{io.observe(it.cv);new ResizeObserver(()=>{build(it);if(reduce)draw(it,null)}).observe(it.cv)});
  if(reduce)return;
  const logo=$('.hero-mark .logo');const t0=performance.now();
  ssVong(function(now){const t=(now-t0)/1000;items.forEach(it=>{if(!it.vis||!it.W)return;const dur=Math.max(2.4,(it.W/(it.beats.length?Math.max(1,(it.beats[it.beats.length-1]-it.beats[0])/Math.max(1,it.beats.length-1)):200))*BEAT);
      const head=((t+(it.hero?0:1.3))/dur%1)*it.W;
      if(it.hero&&logo&&t>1.6&&it.prev!=null){const crossed=it.beats.some(b=>it.prev<b&&head>=b)||(it.prev<it.heart.hl&&head>=it.heart.hl);if(crossed){logo.classList.remove('beat');requestAnimationFrame(()=>logo.classList.add('beat'))}}
      it.prev=head;draw(it,head)})},items.map(it=>it.cv));
})();
(function(){
  const S=13,OX=150;let K=1,OY=118;const P=(x,y,z)=>[OX+(x-y)*S*K*0.866,OY+(x+y)*S*K*0.5-z*S*K];
  const f=v=>v.toFixed(1);
  const pts=a=>a.map(q=>{const p=P(...q);return f(p[0])+','+f(p[1])}).join(' ');
  const poly=(a,c)=>`<polygon class="${c}" points="${pts(a)}"/>`;
  const pl=(a,c='ln')=>`<polyline class="${c}" points="${pts(a)}"/>`;
  const line=(a,b,c='ln')=>pl([a,b],c);
  const box=(x,y,z,w,d,h,t='ln',l='ln',r='ln')=>poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],t)+poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],l)+poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],r);
  const circ=(cx,cy,z,r,n=40)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [cx+r*Math.cos(a),cy+r*Math.sin(a),z]});
  const disc=(cx,cy,z,r,c)=>poly(circ(cx,cy,z,r),c);
  const arc=(cx,cy,z,r,a0,a1,n=24)=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return [cx+r*Math.cos(a),cy+r*Math.sin(a),z]});
  const cyl=(cx,cy,z,r,h,side='blk ln',top='ln')=>{const A=-Math.PI/4,B=3*Math.PI/4;return poly([...arc(cx,cy,z,r,A,B),...arc(cx,cy,z+h,r,B,A)],side)+disc(cx,cy,z+h,r,top)};
  // mặt phẳng đứng (song song trục x, quay ra trước) có đỉnh vòm
  const archPts=(x0,y,z,w,h)=>{const r=w/2,cx=x0+r;const top=Array.from({length:17},(_,i)=>{const a=i/16*Math.PI;return [cx+r*Math.cos(a),y,z+h+r*Math.sin(a)]});return [[x0,y,z],[x0+w,y,z],...top,[x0,y,z]]};
  const grid=(x0,y0,n,m,st,z=0)=>{let g='';for(let i=0;i<=n;i++)g+=line([x0+i*st,y0,z],[x0+i*st,y0+m*st,z],'ln2');for(let j=0;j<=m;j++)g+=line([x0,y0+j*st,z],[x0+n*st,y0+j*st,z],'ln2');return g};
  const house=(x,y,z,w,d,h,rh,roof='ln')=>{const t0=[x,y+d/2,z+h+rh],t1=[x+w,y+d/2,z+h+rh];
    return poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],'blk ln')+poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],'blk ln')+poly([[x+w,y,z+h],[x+w,y+d,z+h],t1],'blk ln')+poly([[x,y+d,z+h],[x+w,y+d,z+h],t1,t0],roof)};
  // các hình 2D đặt tại một điểm 3D
  const at=(x,y,z)=>P(x,y,z);
  const puff=(x,y,z,k=1,c='blk ln')=>{const [px,py]=at(x,y,z);return [[0,0,13],[14,3,10],[-14,4,9],[6,-8,10],[-6,-7,8]].map(([dx,dy,r])=>`<circle class="${c}" cx="${f(px+dx*k)}" cy="${f(py+dy*k)}" r="${f(r*k)}"/>`).join('')};
  const pin=(x,y,z,k=1)=>{const [px,py]=at(x,y,z);const s=k*13;return `<path class="fb ln" d="M${f(px)} ${f(py)}C${f(px-.55*s)} ${f(py-.8*s)} ${f(px-1.05*s)} ${f(py-1.35*s)} ${f(px-1.05*s)} ${f(py-1.95*s)}A${f(1.05*s)} ${f(1.05*s)} 0 1 1 ${f(px+1.05*s)} ${f(py-1.95*s)}C${f(px+1.05*s)} ${f(py-1.35*s)} ${f(px+.55*s)} ${f(py-.8*s)} ${f(px)} ${f(py)}Z"/><circle class="wf" cx="${f(px)}" cy="${f(py-1.95*s)}" r="${f(.42*s)}"/>`};
  const flame=(x,y,z,k=1)=>{const [px,py]=at(x,y,z);return `<circle class="glow" cx="${f(px)}" cy="${f(py-7*k)}" r="${f(13*k)}"/><path class="wf" d="M${f(px)} ${f(py-16*k)}C${f(px+5*k)} ${f(py-9*k)} ${f(px+4*k)} ${f(py-2*k)} ${f(px)} ${f(py)}C${f(px-4*k)} ${f(py-2*k)} ${f(px-5*k)} ${f(py-9*k)} ${f(px)} ${f(py-16*k)}Z"/>`};
  const blossom=(x,y,z,k=1)=>{const [px,py]=at(x,y,z);return [[0,0,10],[11,4,8],[-10,5,8],[3,-9,8],[-4,10,6]].map(([dx,dy,r],i)=>`<circle class="${i%2?'fb2 ln':'fb ln'}" cx="${f(px+dx*k)}" cy="${f(py+dy*k)}" r="${f(r*k)}"/>`).join('')};
  const spark=(px,py,r)=>`<path class="wf" d="M${px} ${py-r}Q${px} ${py} ${px+r} ${py}Q${px} ${py} ${px} ${py+r}Q${px} ${py} ${px-r} ${py}Q${px} ${py} ${px} ${py-r}Z"/>`;

  const D=[
   {t:'Làng tưởng niệm',d:'Ngôi làng 3D trên mây chia năm khu: liệt sĩ, thương binh, dòng họ, người thân, thiên thần nhỏ.',h:'#cong-vien',svg:()=>{
      const R=4.4;let g=puff(-6,0.5,-2.2,1.1)+puff(0.5,-6.5,-1.2,.9);
      g+=poly([...arc(0,0,0,R,-Math.PI/4,3*Math.PI/4),[0,0,-3.6]],'fb3 ln');
      g+=disc(0,0,0,R,'faint ln')+disc(0,0,0,1.5,'ln2');
      g+=house(-3.2,-1.2,0,1.1,.9,.7,.6)+house(.9,-3.4,0,1.1,.9,.7,.6)+house(-2.3,1.4,0,1.1,.9,.7,.6,'fb ln')+house(1.6,-.2,0,1.1,.9,.7,.6);
      g+=box(-.28,-.28,0,.56,.56,2.6,'fb','fb2','fb3')+poly([[-.28,.28,2.6],[.28,.28,2.6],[0,0,3.4]],'fb2')+poly([[.28,-.28,2.6],[.28,.28,2.6],[0,0,3.4]],'fb3');
      g+=box(2.25,3.45,0,.26,.26,1.6,'ln','blk ln','blk ln')+box(3.45,2.25,0,.26,.26,1.6,'ln','blk ln','blk ln')+line([2.4,3.6,1.25],[3.6,2.4,1.25])+poly([[2.0,3.6,1.75],[3.6,2.0,1.75],[3.95,2.35,2.25],[2.35,3.95,2.25]],'fb2 ln')+poly([[2.35,3.95,2.25],[3.95,2.35,2.25],[4.25,2.65,1.8],[2.65,4.25,1.8]],'fb ln');
      return g+puff(4.2,-1.6,-2.6,1)}},
   {t:'Ngôi nhà mơ ước',d:'Nhà ba gian, mái ngói, sân vườn. Quà gia đình gửi hiện ngay trong sân.',h:'#ngoi-nha',svg:()=>{
      let g=grid(-4,-3,8,8,1);
      g+=poly([[-.5,1.7,0],[.5,1.7,0],[.5,5,0],[-.5,5,0]],'faint');
      g+=box(-2.6,-1.6,0,5.2,2.4,1.6,'blk ln','blk ln','blk ln');
      [-1.9,-.4,1.1].forEach(x=>{g+=poly([[x,.8,0],[x+.8,.8,0],[x+.8,.8,1.15],[x,.8,1.15]],'ln2')});
      [-2.4,-.8,.8,2.4].forEach(x=>{g+=line([x,1.5,0],[x,1.5,1.55])});
      g+=poly([[3.1,1.8,1.5],[3.1,-2.6,1.5],[3.1,-.4,3]],'fb3 ln')+poly([[-3.1,1.8,1.5],[3.1,1.8,1.5],[3.1,-.4,3],[-3.1,-.4,3]],'fb ln');
      g+=line([3.1,-.4,3],[3.6,-.4,3.5])+line([-3.1,-.4,3],[-3.6,-.4,3.5]);
      g+=line([-3.3,2.9,0],[-3.3,2.9,1.3])+blossom(-3.3,2.9,1.7,1);
      [[1.1,3.0],[1.1,4.4]].forEach(([x,y])=>{g+=line([x,y,0],[x,y,1.1]);const [px,py]=at(x,y,1.25);g+=`<ellipse class="fb ln" cx="${f(px)}" cy="${f(py)}" rx="3.6" ry="4.6"/>`});
      return g}},
   {t:'Cửa hàng vật phẩm',d:'Quần áo, xe, nội thất, đồ trang trí và vật phẩm đặt làm theo yêu cầu.',h:'#cua-hang',svg:()=>{
      let g=disc(0,0,0,3.4,'ln2');
      g+=box(-1.6,-1.6,0,3.2,3.2,2.2,'fb3','fb','fb2');
      g+=poly([[-.25,1.6,0],[.25,1.6,0],[.25,1.6,2.2],[-.25,1.6,2.2]],'wf')+poly([[1.6,-.25,0],[1.6,.25,0],[1.6,.25,2.2],[1.6,-.25,2.2]],'wf');
      g+=box(-1.8,-1.8,3.1,3.6,3.6,.6,'fb','fb2','fb3');
      g+=poly([[-.25,-1.8,3.7],[.25,-1.8,3.7],[.25,1.8,3.7],[-.25,1.8,3.7]],'wf')+poly([[-1.8,-.25,3.7],[1.8,-.25,3.7],[1.8,.25,3.7],[-1.8,.25,3.7]],'wf');
      const [bx,by]=at(0,0,3.7);g+=`<ellipse class="ln" cx="${f(bx-9)}" cy="${f(by-6)}" rx="9" ry="5" transform="rotate(-22 ${f(bx-9)} ${f(by-6)})"/><ellipse class="ln" cx="${f(bx+9)}" cy="${f(by-6)}" rx="9" ry="5" transform="rotate(22 ${f(bx+9)} ${f(by-6)})"/><circle class="wf" cx="${f(bx)}" cy="${f(by-4)}" r="3"/>`;
      const [tx,ty]=at(1.6,1.6,1.9);g+=line([1.6,1.6,1.9],[2.3,2.3,1.2]);const [qx,qy]=at(2.3,2.3,1.2);
      g+=`<g transform="translate(${f(qx)} ${f(qy)}) rotate(18)"><path class="blk ln" d="M0 0L9 -6H34V8H9Z"/><circle class="ln" cx="7" cy="1" r="1.6"/><line class="ln2" x1="14" y1="1" x2="29" y2="1"/></g>`;
      g+=spark(62,46,7)+spark(232,58,5)+spark(214,30,4);
      return g}},
   {t:'Không gian ký ức',d:'Ảnh, video, lời nhắn, câu chuyện và gia phả nhiều thế hệ.',h:'#ky-uc',svg:()=>{
      let g=box(-3,-1.2,0,6,2.4,.35,'blk ln','blk ln','blk ln');
      g+=poly(archPts(-1.5,-.2,.35,3,2.6),'fb3 ln')+poly(archPts(-1.2,-.19,.65,2.4,2.3),'fb2');
      const head=Array.from({length:30},(_,i)=>{const a=i/30*Math.PI*2;return [Math.cos(a)*.48,-.18,2.45+Math.sin(a)*.56]});g+=poly(head,'fb');
      const sh=[[-1.0,-.18,.65],...Array.from({length:17},(_,i)=>{const a=Math.PI-i/16*Math.PI;return [Math.cos(a)*1.0,-.18,.65+Math.sin(a)*1.1]}),[1.0,-.18,.65]];g+=poly(sh,'fb');
      g+=cyl(2.1,.4,.35,.26,1.0,'blk ln','wf')+flame(2.1,.4,1.45,1);
      g+=cyl(-2.2,.3,.35,.38,.4,'blk ln','ln')+[-.1,0,.1].map(d=>line([-2.2+d,.3,.75],[-2.2+d*2,.3,1.6],'ln')).join('');
      g+=`<g transform="translate(206 26)"><rect class="blk ln" x="0" y="0" width="64" height="34" rx="6"/><path class="blk ln" d="M14 34L10 44L24 34"/><line class="ln2" x1="10" y1="12" x2="54" y2="12"/><line class="ln2" x1="10" y1="22" x2="40" y2="22"/></g>`;
      g+=`<g transform="translate(34 22)"><line class="ln" x1="22" y1="8" x2="8" y2="30"/><line class="ln" x1="22" y1="8" x2="36" y2="30"/><circle class="fb ln" cx="22" cy="8" r="6"/><circle class="blk ln" cx="8" cy="32" r="5"/><circle class="blk ln" cx="36" cy="32" r="5"/></g>`;
      return g}},
   {t:'Bản đồ mộ phần',d:'Gắn hồ sơ với vị trí mộ và quê quán thật, mở chỉ đường một chạm.',h:'#ban-do',svg:()=>{
      const E=[-3.6,-1.8,0,1.8,3.6],Z=[0,.55,0,.55,0];let g='';
      for(let i=0;i<4;i++)g+=poly([[E[i],-2.3,Z[i]],[E[i+1],-2.3,Z[i+1]],[E[i+1],2.3,Z[i+1]],[E[i],2.3,Z[i]]],i%2?'fb3 ln':'faint ln');
      const zAt=x=>{for(let i=0;i<4;i++)if(x>=E[i]&&x<=E[i+1])return Z[i]+(Z[i+1]-Z[i])*(x-E[i])/(E[i+1]-E[i]);return 0};
      const rt=[[-3,1.4],[-2.2,.6],[-1.2,.9],[-.3,.2],[.8,.6],[1.6,-.4],[2.4,-1.1]];
      const pts3=[];for(let i=0;i<rt.length-1;i++)for(let k=0;k<6;k++){const x=rt[i][0]+(rt[i+1][0]-rt[i][0])*k/6,y=rt[i][1]+(rt[i+1][1]-rt[i][1])*k/6;pts3.push([x,y,zAt(x)+.03])}
      g+=pl(pts3,'route');const [sx,sy]=at(-3,1.4,zAt(-3));g+=`<circle class="wf" cx="${f(sx)}" cy="${f(sy)}" r="3"/>`;
      const zz=zAt(2.4);g+=disc(2.4,-1.1,zz+.02,.55,'ln')+disc(2.4,-1.1,zz+.02,1.0,'ln2')+pin(2.4,-1.1,zz,1.15);
      return g}},
   {t:'Chăm sóc mộ',d:'Đối tác địa phương lau bia, dâng hoa theo lịch, gửi ảnh trước và sau mỗi lần.',h:'#hanh-trinh',svg:()=>{
      let g=grid(-4,-3.5,8,7,1);
      g+=box(-2.4,-1.6,0,4.8,3.2,.5,'blk ln','blk ln','blk ln')+box(-1.9,-1.1,.5,3.8,2.2,.3,'blk ln','blk ln','blk ln');
      g+=poly([[1.05,-1.35,.8],[1.05,-.95,.8],[1.05,-.95,2.6],[1.05,-1.35,2.6]],'fb3 ln');
      g+=poly(archPts(-1.05,-.95,.8,2.1,1.8),'fb ln');
      g+=line([-.6,-.95,2.15],[.6,-.95,2.15],'wl')+line([-.45,-.95,1.8],[.45,-.95,1.8],'wl')+line([-.5,-.95,1.45],[.5,-.95,1.45],'wl');
      [[-1.5,.75],[1.5,.75]].forEach(([x,y])=>{g+=cyl(x,y,.8,.2,.5,'blk ln','ln')+blossom(x,y,1.55,.45)});
      g+=cyl(0,.6,.8,.32,.3,'blk ln','ln')+[-.12,0,.12].map(d=>line([d,.6,1.1],[d*2,.6,1.9],'ln')).join('');
      g+=`<g transform="translate(214 18)"><rect class="blk ln" x="0" y="0" width="52" height="50" rx="5"/><rect class="fb" x="0.5" y="0.5" width="51" height="13" rx="4.5"/><line class="ln" x1="13" y1="-4" x2="13" y2="5"/><line class="ln" x1="39" y1="-4" x2="39" y2="5"/><path class="chk" d="M15 31l8 8 15-16"/></g>`;
      return g}}];
  const KS=[1.25,1.12,1.15,1.22,1.25,1.25],OYS=[112,120,112,128,120,124];$('#isoGrid').innerHTML=D.map((x,i)=>{K=KS[i];OY=OYS[i];return `<a class="iso" href="${x.h}"><svg viewBox="0 0 300 220" aria-hidden="true">${x.svg()}</svg><span class="n">0${i+1}</span><h3>${x.t}</h3><p>${x.d}</p></a>`}).join('');
})();
