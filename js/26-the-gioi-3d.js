/* ===== Thế giới 3D: các cảnh kiểu đồ chơi đất sét, vẽ thời gian thực bằng three.js thay cho ảnh tĩnh *-iso =====
   Mỗi cảnh: nền + ánh sáng nướng sẵn trong Blender (img/3d/<cảnh>/canh.json + ảnh webp), cây và người tự chiếu sáng trên máy.
   Đường đi, người chơi khác, NPC, nút điểm đến vẫn do js/04-01-the-gioi-nui.js lo trên lưới 2D của ảnh iso;
   file này chỉ đổi toạ độ ảnh <-> toạ độ 3D rồi vẽ lại cho đẹp. Máy không có WebGL thì giữ nguyên ảnh tĩnh.
   Thêm cảnh mới: nướng bằng quy trình trong docs/do-hoa.md rồi thêm một mục vào CANH bên dưới. */
const hall=document.getElementById('hall'),W=document.getElementById('world');
// chỉ còn thế giới 3D (chủ dự án bỏ bản ảnh 2D, 08/11/2026). Cần WebGL2. Trình duyệt vẽ bằng CPU (chưa bật tăng tốc phần cứng) vẫn chạy 3D,
// tự hạ độ phân giải cho đỡ giật, kèm dòng nhắc bật tăng tốc.
const coWebGL=(()=>{try{const g=document.createElement('canvas').getContext('webgl2');if(!g)return false;
 const x=g.getExtension('WEBGL_debug_renderer_info'),ten=String(x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER));g.getExtension('WEBGL_lose_context')?.loseContext();
 window.ss3dCPU=/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(ten);return true}catch(e){return false}})();
window.ss3dXong=!coWebGL;   // màn tải (js/01) và kiểm tra hình ảnh chờ cờ này: các cảnh 3D đã nạp xong (hoặc máy không có WebGL2)

// camera của ảnh iso từng cảnh (thong-tin.json khi nướng): trực giao, rộng ow mét, nghiêng 42°, phương vị -38°, nhìn vào tgt (toạ độ Blender)
// le: người đứng lễ cố định [mẫu, động tác, x, y]; lh: điểm người chắp tay quay mặt về; toc: hệ số tốc độ đi của 04-01 (đã theo cỡ người trong ảnh)
// xa: khoảng cách camera mặc định (sảnh là chỗ chọn lối nên nhìn rộng thấy cả hai tượng)
// tuong: có tuong.json (tượng giữ ảnh màu gốc, tự chiếu sáng như người); day: độ cao mặt sân lát (người đứng lên trên)
// cao: có thong-tin.json với lưới độ cao mặt đi (bậc, nền cao trong gian thờ) thay cho day; goc: cảnh trong nhà cắt tường,
//      chỉ cho xoay ±goc độ quanh hướng nhìn của ảnh để không vòng ra sau tường
// anh: có di ảnh trên bàn thờ (.w-anh) cần đặt lại theo camera 3D; nghieng: góc nghiêng camera cố định
const CANH={
 sanh:{ten:'sảnh',tgt:[2,18],ow:88,tam:[2,10],le:[],lh:null,toc:.42,tuong:1,day:.09,xa:60},
 chan:{ten:'chân núi',tgt:[3,13],ow:132,tam:[0,-9],lh:[0,-8],toc:.42,day:0,xa:30,
  le:[['BaCu','chap',-1.7,-11.45],['CoAoDai','chap',1.7,-11.45],['OngAoNau','ngoi',0,-12.05],['CuuChienBinh','dung',-3.8,-12.6]]},
 tho:{ten:'nhà thờ',tgt:[2,1.5],ow:42,tam:[2,1.5],le:[],lh:null,huong:[[0.5,12.5],[7.4,8.3],[-6.5,-10.5],[-1.6,-6.3]],toc:.42,day:0,xa:30,cao:1,goc:40},
 lang:{ten:'làng tưởng niệm',tgt:[0,2],ow:118,tam:[0,2],le:[],lh:null,toc:.42,day:0,xa:55,cao:1,tuong:1},
 ho:{ten:'làng dòng họ',tgt:[0,6],ow:100,tam:[0,6],le:[],lh:null,toc:.42,day:0,xa:50,cao:1,goc:30},
 nha:{ten:'ngôi nhà',tgt:[0,-1],ow:38,tam:[0,-1],le:[],lh:null,toc:.42,day:0,xa:28,cao:1,goc:40,anh:1},
 dien:{ten:'chính điện',tgt:[4.1026,2.7511]/* camera Blender nhắm (0,-2.5,6) mặt sân; đây là điểm cùng tia nhìn ở z=0 (thong-tin.json). Trước để [0,-2.5] làm người lệch 6,7m ra bãi cỏ */,ow:66,tam:[0,-2.5],le:[],lh:null,huong:[[0,12.2],[0,-12],[12.5,-12],[-9.6,7.6],[-19,5.5]],toc:.42,day:0,xa:32,cao:1,tuong:1}};   // chùa có mái, tường đủ bốn phía: xoay tự do 360°
// chùa đỉnh núi (tools/blender/sua-dien-v2.py): độ cao đỉnh, hồ, suối, thác, lư hương, cội bồ đề, bồn hoa, vùng mái chính điện (toạ độ Blender)
// cảnh động + tiếng từng nơi (toạ độ Blender; P = độ cao mặt đất). ho: hồ [x,y,bán kính x,y,z]; suoi/thac: nước chảy (chùa);
// thac: [x,y,đỉnh,chân,rộng,góc xoay?]; lh: lư hương (khói); la: chỗ lá/hoa rơi [x,y,z] (roi:'dao' cánh đào hồng); hoa: chỗ bướm bay; chim: [bán kính vòng, độ cao]; may: [bán kính, z];
// mai: vùng mái chính điện mờ khi vào; amNuoc: độ to tiếng nước khi đứng sát; ngoai: độ to gió + chim (trong nhà nhỏ hơn)
const TT={"dien":{"P":6.0,"ho":[[21.0,9.0,5.4,4.2,6.07]],"suoi":[[24.6,5.4,6.1],[25.0,1.2,6.1],[24.0,-3.2,6.1],[25.8,-7.8,6.1],[28.2,-12.5,6.1],[30.5,-15.5,5.27]],"thac":[[21.0,13.4,13.2,6.2,2.4],[31.6,-17.0,6.3,0.2,1.6]],"lh":[0,-12,8.1],"hoa":[[-8,-16.6],[8,-16.6],[-16.4,-7],[16.4,-7],[21.0,9.0]],"mai":{"x":[-13.6,13.6],"y":[-6.8,14.2]},"la":[[-19.0,5.5,11.0]],"tam":[0,-2],"chim":[16,11],"may":[36,1],"amNuoc":0.5},"sanh":{"ho":[[0,4,6,6,0.47],[-19,-4,5,3.4,0.12]],"lh":[-10,-6,1.5],"hoa":[[12,-6],[20,0],[14,10],[20,16],[-40,-31],[40,-31],[-12,-31],[12,-31],[-19,-4]],"tam":[0,8],"chim":[22,13],"may":[66,2],"amNuoc":0.2},"chan":{"ho":[[-36,-38,10,7,0.02]],"lh":[0,-8,3.0],"hoa":[[0,-10.6],[-4.6,-24],[4.6,-24],[-4.2,-18],[4.2,-12],[-9.6,-4],[9.6,2],[-36,-38]],"la":[[-11,-21,6.5],[11,-21,6.5]],"tam":[0,-5],"chim":[28,16],"may":[70,2],"amNuoc":0.25},"lang":{"ho":[[14.3,-22.9,8,5.5,0.02],[36.0,45.5,7.5,5.0,0.07]],"thac":[[38.54,49.33,20.13,0.3,4.8,2.48]],"suoi":[[41.5,43.5,-0.15],[48,37,0.55],[56,30,2.74],[63,20,3.04],[70,8,3.91],[80,-5,7.48]],"hoa":[[28,-13],[22,-8],[34,-18],[24,-19],[14.3,-22.9],[23,23.5],[25.5,21],[36,45.5]],"la":[[28,-13,4.5]],"roi":"dao","tam":[0,4],"chim":[34,16],"may":[80,3],"amNuoc":0.55},"ho":{"ho":[[-22,-24,7,4.2,0.12]],"hoa":[[-22,-24],[-15,-20]],"tam":[0,6],"chim":[26,14],"may":[65,2],"amNuoc":0.2},"tho":{"hoa":[[-8,-15.5],[8,-15.5]],"tam":[2,1.5],"chim":[18,13],"ngoai":0.5},"nha":{"hoa":[[6.5,-12.3],[0,9]],"tam":[0,-1],"chim":[16,12],"ngoai":0.5}};
const THU=t=>'img/3d/'+t+'/';
if(hall&&W&&coWebGL)khoi();
// máy không có WebGL2: không có thế giới để xem, báo rõ cách khắc phục
if(hall&&!coWebGL){const n=document.createElement('div');n.className='nhac-3d khong-3d';n.setAttribute('role','alert');
 n.innerHTML='<span>Trình duyệt này chưa hỗ trợ đồ hoạ 3D (WebGL2) nên chưa hiện được thế giới Song Song. Hãy cập nhật trình duyệt (Chrome, Cốc Cốc, Edge, Safari bản mới) và bật <b>Tăng tốc phần cứng</b>.</span>';hall.appendChild(n)}
// trình duyệt chưa dùng card đồ hoạ: 3D vẫn chạy nhưng chậm, nhắc cách bật (tắt được, nhớ trên máy)
else if(hall&&window.ss3dCPU){let tat=false;try{tat=localStorage.getItem('ss-nhac-3d')==='1'}catch(e){}
 if(!tat&&!navigator.webdriver){const n=document.createElement('div');n.className='nhac-3d';n.setAttribute('role','note');
  n.innerHTML='<span>Trình duyệt đang vẽ 3D bằng CPU nên có thể giật. Bật <b>Tăng tốc phần cứng</b> trong Cài đặt → Hệ thống của trình duyệt rồi mở lại cho mượt.</span><button type="button" aria-label="Đóng">×</button>';
  n.querySelector('button').onclick=()=>{n.remove();try{localStorage.setItem('ss-nhac-3d','1')}catch(e){}};hall.appendChild(n)}}

function khoi(){
 const GIAM=matchMedia('(prefers-reduced-motion: reduce)').matches,CAM_UNG=matchMedia('(pointer:coarse)').matches;
 const box=document.createElement('div');box.className='w3d';box.setAttribute('aria-hidden','true');
 const hotL=document.createElement('div');hotL.className='w3d-hot';const tagL=document.createElement('div');tagL.className='w3d-tags';
 const tranhL=document.createElement('div');tranhL.className='w3d-tranh';
 const stg=document.getElementById('wStage');W.insertBefore(box,W.firstChild);stg.after(tranhL);tranhL.after(hotL);hotL.after(tagL);   // nút và tên nằm trên lớp ánh sáng theo giờ (trong wStage)
 let ve=null,hong=false,anDi=true,tienCanh=null;const san={};   // trình vẽ, nạp lỗi, cảnh đã nạp xong
 // màn chờ phủ cả thanh điều hướng: vào cảnh 3D chưa nạp xong thì chờ ở đây, không lộ ảnh 2D
 const phu=document.createElement('div');phu.className='w3d-cho';phu.hidden=true;phu.setAttribute('role','status');
 phu.innerHTML='<b>Song Song</b><small></small><i><s></s></i>';document.body.appendChild(phu);
 // nạp ngay từ lúc mở trang, màn tải đầu trang chờ xong mới mở
 window.ss3dTien=0;nap().catch(e=>{console.warn('thế giới 3D: dùng ảnh tĩnh',e);hong=true;window.ss3dXong=true;window.ss3dTocDo=1});

 let phim=null;   // đoạn phim chuyển cảnh đang chiếu (xem ss3dPhim)
 function canhNay(){const w=window.ssWorld;if(!w||hall.hidden||!w.on())return null;const s=w.scene();return CANH[s]?s:null}
 function vong(){requestAnimationFrame(vong);if(phim){phu.hidden=true;phim.buoc();return}const s=canhNay();
  phu.hidden=!(s&&!san[s]&&!hong&&!CANH[s].loi);if(!phu.hidden){phu.querySelector('small').textContent='Đang dựng cảnh '+CANH[s].ten;phu.querySelector('s').style.transform='scaleX('+(tienCanh?tienCanh(s):window.ss3dTien||0)+')'}
  const hien=!!(s&&san[s]);hall.classList.toggle('w3d-on',hien);window.ss3dTocDo=hien?CANH[s].toc:1;if(hien)ve(s);else anDi=true}   // anDi: lần sau hiện lại thì đặt lại như mới vào
 requestAnimationFrame(vong);

 async function nap(){
  // tiến độ cho màn tải: thư viện + mỗi cảnh (cảnh, cây, 4 ảnh) + 9 nhân vật
  // màn tải chỉ chờ cảnh sắp vào (cảnh đang lưu, mặc định sảnh) + 9 nhân vật; các cảnh khác nạp ngầm sau, vào lúc chưa xong thì có màn chờ
  const w0=window.ssWorld&&ssWorld.scene&&ssWorld.scene(),DAU=CANH[w0]?w0:'sanh';
  const soTep=k=>6+(CANH[k].tuong?1:0)+(CANH[k].cao?1:0),tien={};for(const k in CANH)tien[k]=0;
  let xong=0;const TONG=1+9+soTep(DAU),capNhat=()=>{window.ss3dTien=Math.min(1,(xong+tien[DAU])/TONG)};
  const dem=(pr,k)=>pr.then(v=>{if(k)tien[k]++;else xong++;capNhat();return v});tienCanh=k=>Math.min(1,tien[k]/soTep(k));
  const [THREE,{OrbitControls},{GLTFLoader},{MeshoptDecoder},SU,{RoomEnvironment}]=await dem(Promise.all([
   import('three'),import('three/addons/controls/OrbitControls.js'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js'),
   import('three/addons/utils/SkeletonUtils.js'),import('three/addons/environments/RoomEnvironment.js')]));
  const V3=THREE.Vector3;
  // toạ độ Blender (x, y, z lên) -> three (x, z, -y)
  const B=(x,y,z=0)=>new V3(x,z,-y),dB=(v,x,y,z)=>v.set(x,z,-y);   // dB: ghi vào vector có sẵn, khỏi tạo mới mỗi khung
  const EL=42*Math.PI/180,AZ=-38*Math.PI/180,DIR=new V3(Math.sin(AZ)*Math.cos(EL),-Math.cos(AZ)*Math.cos(EL),Math.sin(EL));
  const FW=DIR.clone().negate(),RI=new V3().crossVectors(FW,new V3(0,0,1)).normalize(),UP=new V3().crossVectors(RI,FW).normalize();
  function anhCua(c){   // đổi toạ độ ảnh iso (0..1) <-> Blender theo camera ảnh của cảnh
   const OW=c.ow,OH=c.ow*2/3,C0=new V3(c.tgt[0],c.tgt[1],0).addScaledVector(DIR,160);
   return {raAnh:pb=>{const d=pb.clone().sub(C0);return [.5+d.dot(RI)/OW,.5-d.dot(UP)/OH]},
    tuAnh:(u,v,z=0)=>{const o=C0.clone().addScaledVector(RI,(u-.5)*OW).addScaledVector(UP,(.5-v)*OH);return o.addScaledVector(FW,(z-o.z)/FW.z)},
    tiaAnh:(u,v)=>{const o=C0.clone().addScaledVector(RI,(u-.5)*OW).addScaledVector(UP,(.5-v)*OH);return new THREE.Ray(B(o.x,o.y,o.z),B(FW.x,FW.y,FW.z))}}}

  // ---- trình vẽ, camera, điều khiển: dùng chung mọi cảnh
  const r=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(CAM_UNG?1.75:2,devicePixelRatio||1));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.NoToneMapping;r.toneMappingExposure=1.08;
  // không dùng bóng thời gian thực: nền cỏ dốc, mặt hứng bóng phẳng cắt qua gây vệt đen nhấp nháy; bóng cây đã nướng sẵn trong ảnh nền
  box.appendChild(r.domElement);
  // không khí tưởng niệm: trời ngà nhạt chuyển sương vàng ấm ở chân trời (thay nền xanh cỏ phẳng), sương dày hơn cho cảnh xa mờ dần
  const NEN=new THREE.Color('#d8cfb6');
  const TROI=(()=>{const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
   g.addColorStop(0,'#c9c3b2');g.addColorStop(.55,'#e6dcc2');g.addColorStop(1,'#d8cfb6');x.fillStyle=g;x.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
  // đốm sáng li ti bay lên chậm quanh người chơi, như tàn hương: thế giới bên kia, lặng và ấm
  const DOM=(()=>{const N=CAM_UNG?45:80,g=new THREE.BufferGeometry(),p=new Float32Array(N*3),a=new Float32Array(N);for(let i=0;i<N;i++){p[i*3]=(Math.random()-.5)*44;p[i*3+1]=Math.random()*12;p[i*3+2]=(Math.random()-.5)*44;a[i]=Math.random()}
   g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('pha',new THREE.BufferAttribute(a,1));
   const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,226,160,1)');gr.addColorStop(.18,'rgba(255,190,90,.6)');gr.addColorStop(.5,'rgba(255,150,60,.15)');gr.addColorStop(1,'rgba(255,140,60,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
   const m=new THREE.PointsMaterial({map:new THREE.CanvasTexture(c),size:1.1,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9,fog:true,toneMapped:false});
   const o=new THREE.Points(g,m);o.frustumCulled=false;o.renderOrder=3;return o})();
  function bayDom(dt,t){if(GIAM)return;const p=DOM.geometry.attributes.position,a=DOM.geometry.attributes.pha;for(let i=0;i<p.count;i++){let y=p.getY(i)+dt*(.25+.25*a.getX(i));if(y>12)y=0;
   p.setXYZ(i,p.getX(i)+Math.sin(t*.0004+i)*dt*.15,y,p.getZ(i)+Math.cos(t*.0003+i*1.7)*dt*.15)}p.needsUpdate=true}
  // ---- trời theo giờ thực và thời tiết (js/18 ssWx): đêm, bình minh, ngày, hoàng hôn; mây, mưa, dông, sương.
  // Ảnh nướng là ban ngày: nhân màu cho tất cả vật nướng, đổi màu trời, sương, đèn (cây, tượng, người), mưa 3D quanh camera
  // [giờ, màu nhân cảnh, trời trên, chân trời và sương, nắng, trời toả, độ sáng đốm tàn hương]
  const GIO=[[0,'#55618f','#0f1630','#2a3354',.2,1.3,1],[4.6,'#55618f','#0f1630','#2a3354',.2,1.3,1],[5.6,'#b590a6','#4a4f7a','#c99c90',.9,2.6,.8],
   [6.6,'#f4cfb0','#aeb9cf','#f0caa4',2.3,3.6,.6],[8,'#ffffff','#c9c3b2','#d8cfb6',3,4.2,.5],[16,'#ffffff','#c9c3b2','#d8cfb6',3,4.2,.5],
   [17.3,'#f7d3ab','#bba99e','#f1c08e',2.4,3.6,.6],[18.3,'#d99c8c','#6e5f86','#e0957a',1.2,2.6,.8],[19.3,'#6c71a0','#1d2444','#3c4268',.35,1.6,1],[24,'#55618f','#0f1630','#2a3354',.2,1.3,1]].map(g=>[g[0],...g.slice(1,4).map(x=>new THREE.Color(x)),g[4],g[5],g[6]]);
  // thời tiết: [tối đi, kéo trời về xám, sương gần lại (m), mưa]
  const KHI={clear:[1,0,0,0],cloud:[.86,.4,0,0],drizzle:[.78,.55,10,.35],rain:[.6,.75,18,1],storm:[.5,.85,22,1.3],fog:[.94,.75,30,0],snow:[.9,.5,10,0]};
  const XAM=new THREE.Color('#9fa5ab'),TRANG=new THREE.Color(1,1,1),cyM=new THREE.Color(),TR={tint:new THREE.Color(1,1,1),tren:new THREE.Color(),duoi:new THREE.Color(),nang:3,toa:4.2,dom:.5,gan:0,mua:0,set:false},DICH={tint:new THREE.Color(),tren:new THREE.Color(),duoi:new THREE.Color()};
  const cvT=TROI.image,xT=cvT.getContext('2d');let tinhT=0,sam=0,samSau=0;
  function mucTieu(){const n=window.ssWx&&ssWx.vnNow?ssWx.vnNow():new Date(),h=n.getHours()+n.getMinutes()/60,w=(window.ssWx&&ssWx.now&&ssWx.now())||{k:'clear'},k=KHI[w.k]||KHI.clear;
   let i=0;while(i<GIO.length-2&&GIO[i+1][0]<=h)i++;const a=GIO[i],b=GIO[i+1],f=(h-a[0])/Math.max(1e-6,b[0]-a[0]);
   DICH.tint.copy(a[1]).lerp(b[1],f).multiplyScalar(k[0]);DICH.tren.copy(a[2]).lerp(b[2],f);DICH.duoi.copy(a[3]).lerp(b[3],f);
   const sang=(DICH.duoi.r+DICH.duoi.g+DICH.duoi.b)/3;DICH.tren.lerp(XAM.clone().multiplyScalar(sang*1.3),k[1]);DICH.duoi.lerp(XAM.clone().multiplyScalar(sang*1.25),k[1]);
   DICH.nang=(a[4]+(b[4]-a[4])*f)*(1-k[1]*.8);DICH.toa=(a[5]+(b[5]-a[5])*f)*k[0];DICH.dom=a[6]+(b[6]-a[6])*f;DICH.gan=k[2];DICH.mua=GIAM?0:k[3];DICH.dong=w.k==='storm';
   hall.dataset.troi=(h<5.6||h>=19.3?'dem':h<8?'sang':h<17.3?'ngay':'chieu')+(k[3]?' mua':'')}
  // mưa: vệt rơi xiên quanh tâm camera, theo sương
  const MUA=(()=>{const N=CAM_UNG?260:520,g=new THREE.BufferGeometry(),p=new Float32Array(N*6);for(let i=0;i<N;i++){const x=(Math.random()-.5)*50,y=Math.random()*22,z=(Math.random()-.5)*50;p.set([x,y,z,x+.1,y+1.2,z+.05],i*6)}
   g.setAttribute('position',new THREE.BufferAttribute(p,3));const o=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xeef4fb,transparent:true,opacity:.7,fog:true,depthWrite:false,toneMapped:false}));o.frustumCulled=false;o.visible=false;return o})();
  function troiBuoc(d,dt,now,Rm){if(now>tinhT){tinhT=now+2000;mucTieu()}
   const k=TR.set?1-Math.exp(-dt*1.2):1;TR.set=true;   // đổi dần trong vài giây (đổi cảnh thì nhảy luôn)
   TR.tint.lerp(DICH.tint,k);TR.tren.lerp(DICH.tren,k);TR.duoi.lerp(DICH.duoi,k);for(const x of ['nang','toa','dom','gan','mua'])TR[x]+=(DICH[x]-TR[x])*k;
   let chop=0;if(DICH.dong&&!GIAM){if(now>samSau){samSau=now+5000+Math.random()*9000;sam=now}chop=Math.max(0,1-(now-sam)/180)}
   for(const m of d.bk)m.color.copy(TR.tint).addScalar(chop*.6);cyM.copy(TR.tint).lerp(TRANG,.55).addScalar(chop*.6);for(const m of d.cy){m.color.copy(cyM);if(m.userData.goc)m.color.multiply(m.userData.goc)}for(const m of NVM){m.color.copy(cyM);if(m.userData.goc)m.color.multiply(m.userData.goc)}   // cây, tượng, người còn được đèn chiếu: nhân nhẹ hơn kẻo đêm đen kịt
   if(d.den){d.den.intensity=TR.nang+chop*3;d.hemi.intensity=TR.toa+chop*4}
   d.canh.fog.color.copy(TR.duoi);d.canh.fog.near=Math.max(4,d.canh.fog.near-TR.gan);d.canh.fog.far=Math.max(d.canh.fog.near+25,d.canh.fog.far-TR.gan*1.6);
   const kh=TR.tren.getHexString()+TR.duoi.getHexString();if(kh!==cvT._k){cvT._k=kh;const gr=xT.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#'+TR.tren.getHexString());gr.addColorStop(1,'#'+TR.duoi.getHexString());xT.fillStyle=gr;xT.fillRect(0,0,4,256);TROI.needsUpdate=true}
   DOM.material.opacity=.9*Math.min(1,TR.dom*1.4)*(1-Math.min(1,TR.mua)*.7);
   MUA.visible=TR.mua>.05;if(MUA.visible){if(MUA.parent!==d.canh)d.canh.add(MUA);MUA.material.opacity=.75*Math.min(1,TR.mua);MUA.position.copy(cam.position).lerp(dk.target,.45);MUA.position.y-=10;   // quanh giữa camera và người: hạt gần thành vệt rõ
    const p=MUA.geometry.attributes.position,v=(14+6*TR.mua)*dt,n=Math.ceil(p.count/2*Math.min(1,TR.mua));for(let i=0;i<p.count/2;i++){let y=p.getY(i*2)-v;if(y<0)y+=22;const x=p.getX(i*2)-v*.08;
     p.setXYZ(i*2,i<n?x:9e3,y,p.getZ(i*2));p.setXYZ(i*2+1,i<n?x+.1:9e3,y+1.2,p.getZ(i*2)+.05)}p.needsUpdate=true}}

  const cam=new THREE.PerspectiveCamera(35,1,1,400);   // near 1 m (camera luôn cách đích ≥ 7 m): bộ đệm sâu mịn hơn 10 lần, các mảnh phẳng cách nhau vài mm không còn sọc nhấp nháy
  const dk=new OrbitControls(cam,r.domElement);dk.enableDamping=!GIAM;dk.dampingFactor=.08;dk.rotateSpeed=.7;dk.enableZoom=false;dk.enablePan=false;
  dk.minPolarAngle=15*Math.PI/180;dk.maxPolarAngle=68*Math.PI/180;
  dk.mouseButtons.RIGHT=THREE.MOUSE.ROTATE;dk.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;   // chuột phải (Alt + chuột trái vẫn là chuột trái) và hai ngón cũng xoay; phóng to thu nhỏ do js/16
  const ori=()=>hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h';
  const xa=()=>{const g=dang?CANH[dang].xa:CANH[DAU].xa;return THREE.MathUtils.clamp(g/(window.ssZoomK?ssZoomK(ori()):1),7,g*2)};   // tới 2 lần (nút thu nhỏ hết cỡ, js/16 MIN .5); nút góc nhìn, cuộn chuột, chụm ngón (js/16-goc-nhin.js) đổi khoảng cách camera
  let cw=-1,ch=-1;   // cảnh nạp sớm lúc sảnh còn ẩn (cỡ 0) nên đo lại mỗi khi hiện
  function co(){const w=hall.clientWidth,h=hall.clientHeight;if(w===cw&&h===ch)return;cw=w;ch=h;cam.aspect=w/Math.max(1,h);cam.fov=w<h?48:35;cam.updateProjectionMatrix();r.setSize(w,h)}
  co();addEventListener('resize',co);
  const NANG=new V3(.394,.616,-.682).normalize();
  const AGX=(sh,them)=>{sh.fragmentShader=THREE.ShaderChunk.tonemapping_pars_fragment+'\n'+sh.fragmentShader.replace('texture2D( map, vMapUv )','texture2D( map, vMapUv, -1.0 )')+'';
   if(them)sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\n irradiance *= 0.45;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );')};   // tự áp AgX như ảnh Blender

  // ---- sảnh chọn lối: hai cột hào quang ở cổng chùa (vàng) và cổng nhà thờ (trắng xanh) để người dùng chú ý chọn lối; logo Song Song giữa đài phun phát sáng
  const vetDoc=(()=>{const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.55,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,1)');x.fillStyle=g;x.fillRect(0,0,4,128);return new THREE.CanvasTexture(c)})();
  const vetTron=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
  const vetTia=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.translate(128,128);for(let i=0;i<24;i++){x.rotate(Math.PI/12);const g=x.createLinearGradient(0,0,0,-128);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(-3,0);x.lineTo(0,-128);x.lineTo(3,0);x.fill()}return new THREE.CanvasTexture(c)})();
  const VC={transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false};
  function cotSang(mau,r,cao){   // cột sáng: ống mờ dần lên trên + vầng sáng dưới chân + đốm bay lên
   const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({...VC,map:vetDoc,color:mau,side:THREE.DoubleSide,opacity:.55});
   const ong=new THREE.Mesh(new THREE.CylinderGeometry(r*.8,r,cao,40,1,true),m);ong.position.y=cao/2;ong.rotation.x=Math.PI;
   const ong2=new THREE.Mesh(new THREE.CylinderGeometry(r*.35,r*.45,cao*1.15,24,1,true),new THREE.MeshBasicMaterial({...VC,map:vetDoc,color:mau,side:THREE.DoubleSide,opacity:.8}));ong2.position.y=cao*.575;ong2.rotation.x=Math.PI;
   const nen=new THREE.Mesh(new THREE.PlaneGeometry(r*4.2,r*4.2),new THREE.MeshBasicMaterial({...VC,map:vetTron,color:mau,opacity:.9}));nen.rotation.x=-Math.PI/2;nen.position.y=.08;
   const N=36,pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*6.283,rr=Math.random()*r;pp.set([Math.cos(a)*rr,Math.random()*cao*.8,Math.sin(a)*rr],i*3)}
   pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const dom=new THREE.Points(pg,new THREE.PointsMaterial({...VC,map:vetTron,color:mau,size:.7,opacity:.9}));
   g.add(ong,ong2,nen,dom);g.userData={ong,ong2,nen,dom,cao,m};return g}
  function nhipCot(g,t,dt,k=1){const u=g.userData,s=.5+.5*Math.sin(t*.0022+g.id);u.m.opacity=(.38+.25*s)*k;u.ong2.material.opacity=(.55+.3*s)*k;u.nen.material.opacity=(.65+.3*s)*k;u.nen.scale.setScalar(.9+.15*s);u.dom.material.opacity=.9*k;
   if(GIAM)return;const p=u.dom.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)+dt*(1.2+(i%5)*.3);if(y>u.cao*.8)y=0;p.setY(i,y)}p.needsUpdate=true}
  function trangTriSanh(d){
   const cot=[[-14,23,0xffc45a],[14,23,0xbcd2ff]].map(([x,y,mau])=>{const g=cotSang(mau,2.6,24);g.position.copy(B(x,y,0));d.canh.add(g);return g});
   const tam=B(0,4,3.6),hq=new THREE.Sprite(new THREE.SpriteMaterial({...VC,map:vetTron,color:0xffd27a,opacity:.85})),tia=new THREE.Sprite(new THREE.SpriteMaterial({...VC,map:vetTia,color:0xffe2a0,opacity:.5}));
   hq.position.copy(tam);tia.position.copy(tam);hq.scale.setScalar(9);tia.scale.setScalar(14);d.canh.add(hq,tia);
   d.capNhat=(t,dt)=>{for(const g of cot)nhipCot(g,t,dt);const s=.5+.5*Math.sin(t*.0018);hq.material.opacity=.55+.35*s;hq.scale.setScalar(8+2*s);if(!GIAM)tia.material.rotation+=dt*.12;tia.material.opacity=.3+.25*s}}
  // ---- chùa trên đỉnh núi: cảnh động cho tịnh tâm (cò bay, bướm, khói hương, nước hồ, suối, thác, mây quanh núi, lá bồ đề rơi)
  //      và mái chính điện mờ dần khi "Bạn" bước vào điện. Toạ độ Blender lấy từ tools/blender/sua-dien-v2.py (CHUA)
  const vetSoc=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d');
   for(let i=0;i<40;i++){const px=Math.random()*64,py=Math.random()*256,l=20+Math.random()*60,g=x.createLinearGradient(0,py,0,py+l);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,'+(.35+Math.random()*.5)+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(px,py,1.5+Math.random()*2,l)}
   const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
  const vetGon=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=2;
   for(let i=0;i<26;i++){x.beginPath();const cx=Math.random()*256,cy=Math.random()*256,r=8+Math.random()*30;x.ellipse(cx,cy,r,r*.55,0,Math.random()*3,Math.random()*3+2.4);x.stroke()}
   const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
  // tiếng cảnh mọi nơi: nước (bản ghi suối) to dần khi lại gần hồ / suối / thác, gió, chim hót lác đác.
  // Theo mục "Âm thanh không gian" trong Cài đặt (ssAmbient); rời cảnh 3D hoặc ẩn trang thì lặng dần.
  const amCanh=(()=>{let ac=null,g,nuocG,gioG,hen=0,songT=0,vi=null;
   function mo(){if(ac)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=new AC();g=ac.createGain();g.gain.value=0;g.connect(ac.destination);
    const nb=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const ns=(f,q,loai)=>{const s=ac.createBufferSource();s.buffer=nb;s.loop=true;s.playbackRate.value=.9+Math.random()*.2;const b=ac.createBiquadFilter();b.type=loai;b.frequency.value=f;b.Q.value=q;s.connect(b);s.start();return b};
    // tiếng suối thật (img/am/suoi.mp3: 42 giây cắt từ bản ghi tiengdong.com chủ dự án gửi, đuôi đã hoà vào đầu để lặp liền mạch)
    nuocG=ac.createGain();nuocG.gain.value=0;nuocG.connect(g);
    fetch('img/am/suoi.mp3'+BAN).then(q=>q.arrayBuffer()).then(x=>ac.decodeAudioData(x)).then(buf=>{const b=ac.createBufferSource();b.buffer=buf;b.loop=true;
     b.loopStart=.06;b.loopEnd=buf.duration-.06;b.connect(nuocG);b.start(0,.06)}).catch(()=>{});   // bỏ khoảng lặng đầu/cuối của mp3
    gioG=ac.createGain();gioG.gain.value=.12;ns(320,.7,'bandpass').connect(gioG);gioG.connect(g);const l2=ac.createOscillator(),l2g=ac.createGain();l2.frequency.value=.07;l2g.gain.value=.07;l2.connect(l2g);l2g.connect(gioG.gain);l2.start()}
   function chim(){if(!ac)return;const t=ac.currentTime+.05,pan=ac.createStereoPanner?ac.createStereoPanner():null,o=ac.createGain();o.gain.value=.5;if(pan){pan.pan.value=Math.random()*1.6-.8;o.connect(pan);pan.connect(g)}else o.connect(g);
    const goc=2600+Math.random()*1800,n=2+Math.floor(Math.random()*4);
    for(let i=0;i<n;i++){const tt=t+i*(.09+Math.random()*.08),s=ac.createOscillator(),e=ac.createGain(),f=goc*(1+(Math.random()-.5)*.25);s.type='sine';
     s.frequency.setValueAtTime(f,tt);s.frequency.exponentialRampToValueAtTime(f*(Math.random()<.5?1.35:.7),tt+.07);e.gain.setValueAtTime(0,tt);e.gain.linearRampToValueAtTime(.05,tt+.01);e.gain.exponentialRampToValueAtTime(.0001,tt+.11);
     s.connect(e);e.connect(o);s.start(tt);s.stop(tt+.13)}}
   addEventListener('pointerdown',mo,{passive:true});
   setInterval(()=>{if(!ac)return;const am=window.ssAmbient,bat=performance.now()-songT<700&&!document.hidden&&(!am||am.on()),dich=bat?(am?.25+.75*am.vol():.6)*(vi||1):0;
    g.gain.setTargetAtTime(dich,ac.currentTime,.6);if(bat&&ac.state==='suspended')ac.resume();
    if(bat&&!GIAM&&performance.now()>hen){chim();hen=performance.now()+2500+Math.random()*6500}},300);
   return {song(gan,nuoc,ngoai){songT=performance.now();vi=ngoai;if(nuocG)nuocG.gain.setTargetAtTime(nuoc*(.1+.9*Math.max(0,1-gan/28)),ac.currentTime,.3)}}})();
  // nhà thờ: giá chuông Truyền Tin trên sân, bình nước thánh trong ngưỡng cửa (chủ dự án duyệt 12/11/2026).
  // Dựng bằng khối đơn giản theo lối low-poly, nhuộm theo màu trời như cây (d.cy); chuông lắc khi js/30 phát 'ss-chuong-tt'
  function vatNhaTho(d){const M=c=>{const m=new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});m.userData.goc=new THREE.Color(c);d.cy.push(m);return m},
    go=M(0x7a5236),dong=M(0xc9973f),da=M(0xeae4d8),nuoc=M(0x9fc9d9);
   const ga=new THREE.Group(),tr=new THREE.Group();ga.position.copy(B(-6.5,-10.5,.06));
   for(const s of [-1,1]){const cot=new THREE.Mesh(new THREE.BoxGeometry(.22,3.3,.22),go);cot.position.set(s*1.1,1.65,0);ga.add(cot)}
   const xa=new THREE.Mesh(new THREE.BoxGeometry(2.7,.24,.3),go);xa.position.y=3.25;
   const be=new THREE.Mesh(new THREE.BoxGeometry(3,.12,.9),da);be.position.y=.06;
   const than=new THREE.Mesh(new THREE.LatheGeometry([[0,-1.08],[.56,-1.08],[.52,-1],[.4,-.7],[.32,-.25],[.18,-.02],[0,0]].map(([x,y])=>new THREE.Vector2(x,y)),18),dong);
   const qua=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),go);qua.position.y=-1;tr.position.y=3.12;tr.add(than,qua);ga.add(xa,be,tr);d.canh.add(ga);
   const bt=new THREE.Group();bt.position.copy(B(-1.6,-6.3,.54));
   const chan=new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,.9,12),da);chan.position.y=.45;
   const bat=new THREE.Mesh(new THREE.SphereGeometry(.36,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),da);bat.position.y=1.12;
   const mat=new THREE.Mesh(new THREE.CircleGeometry(.33,20),nuoc);mat.rotation.x=-Math.PI/2;mat.position.y=1.1;bt.add(chan,bat,mat);d.canh.add(bt);
   let lac=0;addEventListener('ss-chuong-tt',()=>{lac=1});
   const cu=d.capNhat;d.capNhat=(t,dt)=>{cu&&cu(t,dt);if(lac>.003){lac*=Math.pow(.4,dt);tr.rotation.z=Math.sin(t*.007)*.4*lac}}}
  function trangTriCanh(d,C){
   const P=C.P||0,cn=[],cu=d.capNhat,them=o=>{d.canh.add(o);return o},TB={transparent:true,depthWrite:false,toneMapped:false};
   // mặt hồ: gợn sóng trôi chậm
   for(const [hx,hy,rx,ry,hz] of C.ho||[]){const ho=them(new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({...TB,map:vetGon,color:0xeaf6f4,opacity:.45,blending:THREE.AdditiveBlending})));
    ho.rotation.x=-Math.PI/2;ho.scale.set(rx*.95,ry*.95,1);ho.position.copy(B(hx,hy,hz+.03))}vetGon.repeat.set(2,2);
   // suối: dải nước chảy theo từng đoạn
   const suoi=[],SU=C.suoi||[];for(let i=0;i+1<SU.length;i++){const a=B(...SU[i]),b=B(...SU[i+1]),L=a.distanceTo(b),m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,L+.4),new THREE.MeshBasicMaterial({...TB,map:vetSoc.clone(),color:0xffffff,opacity:.5}));
    m.material.map.needsUpdate=true;m.material.map.repeat.set(1,L/4);m.position.copy(a).lerp(b,.5);m.position.y+=.04;m.lookAt(b.x,m.position.y,b.z);m.rotateX(-Math.PI/2);them(m);suoi.push(m)}
   // thác: tấm nước dựng đứng trôi xuống + bọt dưới chân
   const thac=(C.thac||[]).map(([x,y,z1,z0,w,rz])=>{const xoay=rz!=null;   // rz: thác không quay mặt về nam (làng: vách đá đông bắc)
   const h=z1-z0,m=them(new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({...TB,map:vetSoc.clone(),color:0xffffff,opacity:.75,side:THREE.DoubleSide})));
    m.material.map.needsUpdate=true;m.material.map.repeat.set(w/2,h/5);m.position.copy(B(x,xoay?y:y-.35,(z1+z0)/2));if(xoay)m.rotation.y=rz;
    const bot=them(new THREE.Sprite(new THREE.SpriteMaterial({...TB,map:vetTron,color:0xffffff,opacity:.7})));bot.position.copy(B(x,xoay?y:y-.8,z0+.4));bot.scale.set(w*1.8,1.2,1);return {m,bot}});
   // khói hương bay lên từ lư hương giữa sân
   const NK=16,khoi=[];for(let i=0;C.lh&&i<NK;i++){const s=them(new THREE.Sprite(new THREE.SpriteMaterial({...TB,map:vetTron,color:0xf4efe6,opacity:0})));s.userData.t=i/NK;khoi.push(s)}
   // mây trôi quanh chân núi
   const NM=12,may=[];for(let i=0;C.may&&i<NM;i++){const s=them(new THREE.Sprite(new THREE.SpriteMaterial({map:vetTron,color:0xffffff,transparent:true,depthWrite:false,opacity:.5,fog:true})));
    const a=i/NM*6.283+Math.random()*.3,r=C.may[0]+Math.random()*12;s.userData={a,r,z:C.may[1]+Math.random()*3,v:(Math.random()<.5?-1:1)*(.006+Math.random()*.006)};s.scale.set(18+Math.random()*10,7+Math.random()*3,1);may.push(s)}
   // cò trắng bay vòng trên đỉnh núi: thân + hai cánh vỗ chậm
   const trang=new THREE.MeshLambertMaterial({color:0xfbfaf6,side:THREE.DoubleSide});d.cy.push(trang);
   const canhG=new THREE.BufferGeometry();canhG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.25,0,0,.3,1.25,0,.05],3));canhG.computeVertexNormals();
   const co=[],[tx,ty]=C.tam,[cr,chh]=C.chim||[0,0];for(let i=0;C.chim&&i<7;i++){const g=new THREE.Group(),than=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),trang);than.scale.set(1,.8,2.4);
    const mo=new THREE.Mesh(new THREE.ConeGeometry(.05,.5,6),new THREE.MeshLambertMaterial({color:0xe3b150}));mo.rotation.x=Math.PI/2;mo.position.z=.7;
    const t1=new THREE.Mesh(canhG,trang),t2=new THREE.Mesh(canhG,trang);t2.scale.x=-1;g.add(than,mo,t1,t2);g.userData={t1,t2,r:cr+i*3.2,a:i*.9,h:P+chh+(i%3)*2.2,v:.05+(i%4)*.012,p:Math.random()*6};them(g);co.push(g)}
   // bướm quanh bồn hoa và hồ sen
   const bG=new THREE.PlaneGeometry(.22,.16),bM=[0xffd27a,0xf6a6bf,0xffffff,0xb8d8ff].map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,toneMapped:false}));
   const buom=[];(C.hoa||[]).forEach(([x,y],k)=>{for(let j=0;j<2;j++){const m=bM[(k+j)%4],g=new THREE.Group(),w1=new THREE.Mesh(bG,m),w2=new THREE.Mesh(bG,m);w1.position.x=.11;w2.position.x=-.11;g.add(w1,w2);g.userData={w1,w2,x,y,p:Math.random()*6,v:.6+Math.random()*.5};them(g);buom.push(g)}});
   // lá bồ đề rơi
   const la=[],LA=(C.la||[]).map(q=>B(...q)),dao=C.roi==='dao';for(let i=0;i<12*LA.length;i++){const m=them(new THREE.Mesh(new THREE.PlaneGeometry(dao?.14:.22,dao?.14:.3),new THREE.MeshBasicMaterial({color:dao?(i%2?0xf6b8c8:0xfbd9e1):i%3?0x9cbf62:0xe3c35a,side:THREE.DoubleSide})));m.userData={t:Math.random(),o:LA[i%LA.length]};la.push(m)}
   // mái chính điện (tượng/tuong.json, tên SS_Mai*): mờ khi "Bạn" ở trong điện
   const mai=[];d.canh.traverse(o=>{if(o.isMesh&&/^SS_Mai/.test(o.name)){o.material.transparent=true;mai.push(o)}});let maiK=1;
   const tmp=new V3(),lhP=C.lh?B(...C.lh):null;
   // chỗ có nước (hồ tính tới mép): đo khoảng cách cho tiếng nước
   const nuocP=[...(C.thac||[]).map(q=>[B(q[0],q[1],q[3]),0]),...SU.map(q=>[B(...q),0]),...(C.ho||[]).map(q=>[B(q[0],q[1],q[4]),Math.min(q[2],q[3])])];
   d.capNhat=(t,dt)=>{const s=t/1000;
    cu&&cu(t,dt);let gan=99;if(theo)for(const [p,rr] of nuocP)gan=Math.min(gan,Math.max(0,p.distanceTo(theo)-rr));amCanh.song(gan,C.amNuoc||0,C.ngoai||1)
    // mái: vào trong điện thì mờ hẳn, ra sân thì hiện lại
    const vao=C.mai&&theo&&theo.x>C.mai.x[0]&&theo.x<C.mai.x[1]&&-theo.z>C.mai.y[0]&&-theo.z<C.mai.y[1],dich=vao?0:1;maiK+=(dich-maiK)*Math.min(1,dt*(GIAM?99:3));
    for(const o of mai){o.material.opacity=maiK;o.material.depthWrite=maiK>.98;o.visible=maiK>.02}
    if(GIAM)return;
    vetGon.offset.set(s*.012,s*.008);for(const m of suoi)m.material.map.offset.y=-s*.35;for(const q of thac){q.m.material.map.offset.y=s*.9;q.bot.material.opacity=.55+.2*Math.sin(s*3)}
    for(const k of khoi){const u=(k.userData.t+s*.07)%1;k.position.set(lhP.x+Math.sin(u*9+k.id)*.5*u,lhP.y+u*7,lhP.z+Math.cos(u*7+k.id)*.4*u);k.scale.setScalar(.5+u*2.6);k.material.opacity=.32*Math.sin(Math.PI*u)}
    for(const m of may){const u=m.userData;u.a+=u.v*dt;dB(m.position,tx+Math.cos(u.a)*u.r*1.15,ty+Math.sin(u.a)*u.r,u.z);m.material.opacity=.42+.12*Math.sin(s*.3+u.a)}
    for(const g of co){const u=g.userData;u.a+=u.v*dt;const x=tx+Math.cos(u.a)*u.r,y=ty+Math.sin(u.a)*u.r*.8;dB(g.position,x,y,u.h+Math.sin(s*.4+u.p)*.8);g.visible=g.position.distanceTo(cam.position)>14;   // bay sát ống kính trông to bè: ẩn

     dB(tmp,tx+Math.cos(u.a+.05)*u.r,ty+Math.sin(u.a+.05)*u.r*.8,u.h);g.lookAt(tmp.x,g.position.y,tmp.z);const v=Math.sin(s*2.6+u.p)*.55;u.t1.rotation.z=v;u.t2.rotation.z=-v;g.rotation.z=-.15}
    for(const g of buom){const u=g.userData,a=s*u.v+u.p;dB(g.position,u.x+Math.cos(a)*1.3+Math.sin(a*2.3)*.4,u.y+Math.sin(a*1.3)*1.1,P+.9+Math.sin(a*3)*.35);g.rotation.y=a;const v=Math.sin(s*14+u.p)*1.1;u.w1.rotation.y=v;u.w2.rotation.y=-v}
    for(const m of la){const u=m.userData,o=u.o;u.t=(u.t+dt*.07)%1;m.position.set(o.x+Math.sin(m.id*7.1)*3.4+Math.sin(u.t*9+m.id)*.6,o.y+2.5-u.t*(o.y+2.4-P),o.z+Math.cos(m.id*3.3)*3+Math.cos(u.t*7)*.5);m.rotation.set(u.t*9,u.t*6+m.id,0)}}}
  // ---- phi thăng khi chọn lối (thay hoạt ảnh 2D cũ): cột sáng hạ xuống chỗ "Bạn", người bay lên tan vào ánh sáng, màn chuyển ngà nối tiếp
  let nangMe=null;
  window.ss3dPhiThang=function(fa,xong){if(hong||GIAM||dang!=='sanh'||phim||!theo)return false;
   const d=DL.sanh,mau=fa==='cg'?0xc8d8ff:0xffc96a,g=cotSang(mau,1.6,30);g.position.set(theo.x,theo.y-1,theo.z);g.scale.y=.01;d.canh.add(g);
   const flash=document.createElement('div');flash.className='asc3';flash.style.setProperty('--m',fa==='cg'?'200,216,255':'255,201,106');document.body.appendChild(flash);
   const t0=performance.now();nangMe={y:0,s:1};const cu=d.capNhat;
   d.capNhat=(t,dt)=>{cu&&cu(t,dt);const e=(t-t0)/1000;g.scale.y=Math.min(1,e/.5);nhipCot(g,t,dt,Math.min(1,e*2));
    const k=THREE.MathUtils.smoothstep(e,.35,1.5);nangMe.y=k*7;nangMe.s=1-k*.75;
    if(e>1.6&&!g.userData.xong){g.userData.xong=1;d.canh.remove(g);d.capNhat=cu;nangMe=null;xong();setTimeout(()=>flash.remove(),1400)}};
   return true};

  // ---- nạp: glTF nhúng sẵn dữ liệu (JSON + base64, chạy được cả trên bản thử claude.ai)
  const ld=new GLTFLoader();ld.setMeshoptDecoder(MeshoptDecoder);
  const BAN='?v=3';   // đổi URL một lần: trình duyệt đang giữ canh.json cũ (cache cũ cho phép dùng bản cũ tới 30 ngày)
  async function taiJSON(url){const q=await fetch(url+BAN);if(!q.ok)throw new Error(url+' '+q.status);return q.json()}
  function thanhGLB(j){const b64=j.buffers[0].uri.split(',')[1];delete j.buffers[0].uri;const s=atob(b64),bin=new Uint8Array(s.length);for(let i=0;i<s.length;i++)bin[i]=s.charCodeAt(i);
   const js=new TextEncoder().encode(JSON.stringify(j)),pj=(4-js.length%4)%4,pb=(4-bin.length%4)%4,L=12+8+js.length+pj+8+bin.length+pb;
   const out=new ArrayBuffer(L),dv=new DataView(out),u8=new Uint8Array(out);dv.setUint32(0,0x46546C67,true);dv.setUint32(4,2,true);dv.setUint32(8,L,true);
   dv.setUint32(12,js.length+pj,true);dv.setUint32(16,0x4E4F534A,true);u8.set(js,20);u8.fill(0x20,20+js.length,20+js.length+pj);
   const o=20+js.length+pj;dv.setUint32(o,bin.length+pb,true);dv.setUint32(o+4,0x004E4942,true);u8.set(bin,o+8);return out}   // fetch data: URI hay bị iPhone chặn
  const parse=j=>new Promise((ok,loi)=>ld.parse(thanhGLB(j),'',ok,loi));
  const taiAnh=url=>new Promise((ok,loi)=>new THREE.TextureLoader().load(url+BAN,t=>{t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=r.capabilities.getMaxAnisotropy();ok(t)},undefined,loi));
  const anhTo=ten=>CAM_UNG?ten+'-2k':ten;   // ảnh 4096 chỉ cho máy tính; điện thoại dùng 2048 để không tràn bộ nhớ đồ hoạ

  let MT=null;const moiTruong=()=>MT||(MT=new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),.04).texture);
  // ---- nhân vật: mỗi mẫu nạp một lần, dùng chung mọi cảnh, nhân bản cho từng người
  const NVM=[];   // vật liệu nhân vật (mọi bản sao dùng chung): nhân màu theo trời như cây
  const MAU={},MAU0={},CO={},ANHB=r.capabilities.getMaxAnisotropy();
  function mau0(ten){return MAU0[ten]||(MAU0[ten]=dem(taiJSON('img/3d/nv/'+ten+'.json')).then(parse).then(gl=>{gl.scene.traverse(o=>{if(!o.isMesh)return;const m=o.material;m.metalness=0;m.roughness=.78;m.envMapIntensity=0;NVM.push(m);
     if(m.map&&CAM_UNG&&m.map.image&&m.map.image.width>1536){const c=document.createElement('canvas');c.width=c.height=1536;c.getContext('2d').drawImage(m.map.image,0,0,1536,1536);m.map.image=c;m.map.needsUpdate=true}
     if(m.map)m.map.anisotropy=ANHB;m.onBeforeCompile=sh=>AGX(sh)});CO[ten]=gl;return gl}))}
  // động tác chỉ một mẫu có (lạy, quỳ): mọi mẫu chung bộ xương 24 khớp nên mượn được; chỉ lấy góc xoay khớp + độ cao hông (co theo cỡ người)
  const MUON={Bow:'ThanhNien',Kneel:'OngAoNau'};
  function hong(g){let h=null;g.scene.traverse(o=>{if(!h&&o.isBone&&o.name==='Hips')h=o});return h}
  function muon(c,tu,toi){const a=hong(tu),b=hong(toi),k=c.clone(),s=a&&b&&a.position.length()?b.position.length()/a.position.length():1;
   k.tracks=k.tracks.filter(t=>t.name.endsWith('.quaternion')||t.name==='Hips.position');for(const t of k.tracks)if(t.name==='Hips.position')t.values=t.values.map(v=>v*s);return k}
  function mau(ten){ten=ten.split('|')[0];return MAU[ten]||(MAU[ten]=mau0(ten).then(async gl=>{for(const k in MUON)if(!gl.animations.some(a=>a.name===k)){const tu=await mau0(MUON[k]).catch(()=>null),c=tu&&tu.animations.find(a=>a.name===k);if(c)gl.animations.push(muon(c,tu,gl))}return gl}))}
  const BONG=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
   gr.addColorStop(0,'rgba(70,45,25,.75)');gr.addColorStop(.45,'rgba(70,45,25,.35)');gr.addColorStop(1,'rgba(70,45,25,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
  const DONG={di:'Walk',dung:'Idle',chap:'Pray',lay:'Bow',ngoi:'Kneel'},TO=1.6;   // người to hơn thật 1,6 lần như hình nhân vật trong game
  // nhân vật tự tạo (js/31): một mẫu TuyChinh có đủ bộ phận, bật bộ phận đã chọn và nhuộm màu riêng cho từng người
  const TC=window.ssNVTC;   // js/31: danh sách lựa chọn hợp lệ, đọc chuỗi kiểu dáng
  function khoac(rig,tc,nvm){const c=TC.doc(tc);if(!c)return[];const hien={['than_'+c.d]:1,['mat_'+c.mat]:1,['toc_'+c.toc]:1,['ao_'+c.ao]:1,[c.quan==='vay'?'vay':'quan_'+c.quan]:1,giay:1,mi_nu:c.d==='nu'},ms=[],nu=c.d==='nu'?1:0;
   const mau={da:c.da,toc:c.mt,moi:nu?'#cf4f5c':'#a3625a',ao:c.ma,ao2:new THREE.Color(c.ma).lerp(new THREE.Color(new THREE.Color(c.ma).getHSL({}).l>.5?0x403830:0xfff8ec),.45),quan:c.mq};
   rig.traverse(o=>{if(/^(than|mat|toc|ao|quan|vay|giay|mi_)/.test(o.name)&&!o.isBone&&o.parent&&!/^(than|mat|toc|ao|quan|vay|giay|mi_)/.test(o.parent.name))o.visible=!!hien[o.name];
    if(!o.isMesh)return;if(o.morphTargetDictionary&&'nu' in o.morphTargetDictionary){o.morphTargetInfluences=o.morphTargetInfluences.slice();o.morphTargetInfluences[o.morphTargetDictionary.nu]=nu}   /* áo quần nắn theo dáng nữ */const m=o.material.clone(),k=mau[m.name];m.userData={goc:k?new THREE.Color(k):m.color.clone()};m.color.copy(m.userData.goc);m.onBeforeCompile=sh=>AGX(sh);o.material=m;ms.push(m);if(nvm)NVM.push(m)});return ms}
  function dung(ten,gl,canh){const rig=SU.clone(gl.scene);rig.scale.multiplyScalar(TO);rig.traverse(o=>{if(o.isMesh)o.frustumCulled=false});const tc=ten.split('|')[1],ms=tc&&TC?khoac(rig,tc,true):[],s0=TO*(tc&&tc.startsWith('nu.')?.94:1);rig.scale.setScalar(s0);   /* nữ thấp hơn nam một chút */
   const bo=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.25),new THREE.MeshBasicMaterial({map:BONG,transparent:true,depthWrite:false,toneMapped:false,opacity:.55}));bo.rotation.x=-Math.PI/2;bo.renderOrder=1;
   const q={ten,rig,bo,canh,ms,s0,mx:new THREE.AnimationMixer(rig),act:{},dang:null,yaw:0};for(const c of gl.animations)q.act[c.name]=q.mx.clipAction(c);canh.add(rig,bo);return q}
  function choi(q,k){const a=q.act[k]||(k==='Bow'?q.act.Pray:null)||q.act.Idle;if(!a||q.dang===a)return;a.reset().fadeIn(.3).play();if(q.dang)q.dang.fadeOut(.3);q.dang=a;
   const mot=a===q.act.Bow||a===q.act.Kneel;a.setLoop(mot?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=a===q.act.Kneel;
   if(GIAM){q.mx.update(.6);}}   // giảm chuyển động: đứng yên ở một tư thế
  function boNguoi(q){q.canh.remove(q.rig,q.bo);q.mx.stopAllAction();if(q.ms&&q.ms.length){for(let i=NVM.length;i--;)if(q.ms.includes(NVM[i]))NVM.splice(i,1)}}
  // NPC theo nơi (bảng chủ dự án duyệt ở #11): nhà thờ không có sư thầy (#111); chưa có hình nữ tu
  const NPC={chan:['SuThay','BaCu','ChiBaBa','OngAoNau','CoAoDai','PhuNuTim'],dien:['OngAoNau','CoAoDai','SuThay','BaCu','PhuNuTim','ChiBaBa'],
   tho:['CoAoDai','ThanhNien','PhuNuTim','BaCu'],lang:['CuuChienBinh','HocSinh','BaCu','ChiBaBa'],sanh:['ThanhNien','HocSinh','PhuNuTim','CuuChienBinh','CoAoDai']};
  function mauCua(id,p){if(id.indexOf('npc-')===0){const a=id.split('-'),l=NPC[a[1]]||NPC.lang;return l[(+a[2]||0)%l.length]}if(p.tc&&TC&&TC.doc(p.tc))return 'TuyChinh|'+p.tc;return p.k===1?'ThanhNien':'ChiBaBa'}
  // xem trước trong màn tạo nhân vật (js/31): bộ vẽ riêng trên canvas của màn đó, người đứng nghỉ, kéo để xoay
  window.ss3dNV=function(cv){const rr=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});rr.setPixelRatio(Math.min(2,devicePixelRatio));rr.outputColorSpace=THREE.SRGBColorSpace;
   const sc=new THREE.Scene(),cm=new THREE.PerspectiveCamera(30,1,.1,50),den=new THREE.DirectionalLight(0xfff1e0,2.6);den.position.set(2,4,5);sc.add(den,new THREE.HemisphereLight(0xfff6ea,0xd9c6a8,2.4));
   cm.position.set(0,.85,3.3);cm.lookAt(0,.7,0);let q=null,quay=0,keo=null,tcNay='',song=true,t0=performance.now();
   const ve=()=>{if(!song)return;requestAnimationFrame(ve);const w=cv.clientWidth,h=cv.clientHeight;if(w&&(cv.width!==Math.round(w*rr.getPixelRatio())||cv.height!==Math.round(h*rr.getPixelRatio()))){rr.setSize(w,h,false);cm.aspect=w/h;cm.updateProjectionMatrix()}
    const now=performance.now(),dt=Math.min(.05,(now-t0)/1000);t0=now;if(q){if(!keo&&!GIAM)quay+=dt*.25;q.rig.rotation.y=quay;GIAM||q.mx.update(dt)}rr.render(sc,cm)};
   cv.addEventListener('pointerdown',e=>{keo=e.clientX;cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointermove',e=>{if(keo!==null){quay+=(e.clientX-keo)*.012;keo=e.clientX}});cv.addEventListener('pointerup',()=>keo=null);cv.addEventListener('pointercancel',()=>keo=null);
   const doi=tc=>{tcNay=tc;mau('TuyChinh').then(gl=>{if(tc!==tcNay||!song)return;if(q){sc.remove(q.rig);q.mx.stopAllAction()}const rig=SU.clone(gl.scene);khoac(rig,tc,false);rig.scale.setScalar(tc.startsWith('nu.')?.94:1);rig.traverse(o=>{if(o.isMesh)o.frustumCulled=false});
    q={rig,mx:new THREE.AnimationMixer(rig)};const a=gl.animations.find(c=>c.name==='Idle');a&&q.mx.clipAction(a).play();q.mx.update(.01);q.rig.rotation.y=quay;sc.add(rig)}).catch(()=>{})};
   ve();return{doi,anh:anhNV,dung(){song=false;rr.dispose()}}};
  // ảnh nhỏ cho từng lựa chọn (tóc, mặt, áo, quần, dáng): một bộ vẽ ẩn dùng chung, vẽ xong chép sang canvas của nút
  let rrA=null,scA=null,hangA=Promise.resolve();
  const KHUNG={toc:[[.62,1.32,.62],[0,1.16,0],.3],mat:[[0,1.13,.8],[0,1.12,0],.2],ao:[[.35,.86,1.4],[0,.8,0],.36],quan:[[.35,.45,1.5],[0,.4,0],.43],d:[[.5,.75,2.6],[0,.68,0],.72]};
  function anhNV(tc,khung,dich){hangA=hangA.then(()=>mau('TuyChinh')).then(gl=>{
    if(!rrA){rrA=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});rrA.setSize(160,160);rrA.outputColorSpace=THREE.SRGBColorSpace;
     scA=new THREE.Scene();const l=new THREE.DirectionalLight(0xfff1e0,2.6);l.position.set(2,4,5);scA.add(l,new THREE.HemisphereLight(0xfff6ea,0xd9c6a8,2.4))}
    const [vt,nh,k]=KHUNG[khung]||KHUNG.d,cm=new THREE.OrthographicCamera(-k,k,k,-k,.1,20);cm.position.set(...vt);cm.lookAt(...nh);
    const rig=SU.clone(gl.scene),ms=khoac(rig,tc,false);rig.scale.setScalar(tc.startsWith('nu.')?.94:1);const mx=new THREE.AnimationMixer(rig),a=gl.animations.find(c=>c.name==='Idle');if(a){mx.clipAction(a).play();mx.update(.5)}
    scA.add(rig);rrA.render(scA,cm);scA.remove(rig);mx.stopAllAction();ms.forEach(m=>m.dispose());
    const x=dich.getContext('2d');x.clearRect(0,0,dich.width,dich.height);x.drawImage(rrA.domElement,0,0,dich.width,dich.height)}).catch(()=>{})}

  // ---- vòng ring vàng dưới chân "Bạn" và vòng chạm đất khi bấm: dời sang cảnh đang xem
  const vongVang=new THREE.Mesh(new THREE.RingGeometry(.42,.6,48),new THREE.MeshBasicMaterial({color:0xFFD98A,transparent:true,opacity:.85,toneMapped:false,depthWrite:false,depthTest:false}));vongVang.rotation.x=-Math.PI/2;vongVang.renderOrder=9;   // không thử chiều sâu: đứng sát bậc, mép bệ thì vòng không bị mặt đá che nửa chừng
  vongVang.visible=false;
  const ping=new THREE.Mesh(new THREE.RingGeometry(.3,.42,40),new THREE.MeshBasicMaterial({color:0xFFE7A8,transparent:true,opacity:0,toneMapped:false,depthWrite:false}));ping.rotation.x=-Math.PI/2;ping.renderOrder=2;let pingT=9;

  // ---- mỗi cảnh: nền nướng + cây + người lễ cố định
  const DL={};
  async function napCanh(ten){
   const c=CANH[ten],G=THU(ten),a=anhCua(c),canh=new THREE.Scene();canh.background=TROI;canh.fog=new THREE.Fog(NEN,55,110);
   const TAM=B(c.tam[0],c.tam[1]),den=new THREE.DirectionalLight(new THREE.Color(1,.9,.77),3.0);den.position.copy(TAM).addScaledVector(NANG,80);den.target.position.copy(TAM);
   const hemi=new THREE.HemisphereLight(0xfff1dc,0xe8d2b0,4.2);canh.add(den,den.target,hemi);
   const [jc,jcay,anh,tt]=await Promise.all([dem(taiJSON(G+'canh.json'),ten),dem(taiJSON(G+'cay.json'),ten),Promise.all(['nen-2k',anhTo('vat-0'),'vat-1-2k',anhTo('vat-3')].map(t=>dem(taiAnh(G+t+'.webp'),ten))),
    c.cao?dem(taiJSON(G+'thong-tin.json'),ten):null]);
   const tex={'nuong-nen':anh[0],'nuong-vat-0':anh[1],'nuong-vat-1':anh[2],'nuong-vat-3':anh[3]};
   const g=await parse(jc),nen=[],dat=[],bk=[],cy=[];g.scene.traverse(o=>{if(o.isMesh){const la=o.material.name==='nuong-nen';
    // tấm nền phẳng nằm sát dưới cỏ và sân: đẩy lùi trong bộ đệm sâu để lớp trên luôn thắng, không chập chờn
    o.material=new THREE.MeshBasicMaterial({map:tex[o.material.name],toneMapped:false,side:THREE.DoubleSide,fog:true,polygonOffset:la,polygonOffsetFactor:la?4:0,polygonOffsetUnits:la?16:0});nen.push(o);dat.push(o);bk.push(o.material)}});
   const gc=await parse(jcay);gc.scene.traverse(o=>{if(o.isMesh){
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,envMapIntensity:0});m.onBeforeCompile=sh=>AGX(sh,true);o.material=m;nen.push(o);cy.push(m)}});   // cây: ánh sáng trời dịu hơn người cho tán lá có khối
   canh.add(g.scene,gc.scene);
   if(c.tuong){const gt=await parse(await dem(taiJSON(G+'tuong.json'),ten));gt.scene.traverse(o=>{if(o.isMesh){
    // giữ chất liệu gốc (tượng Phật là kim loại vàng): cho phản chiếu một phòng sáng dịu, không thì kim loại thành màu kem nhạt
    const laMai=/^SS_Mai/.test(o.name);o.userData.tuong=!laMai;const m=o.material;m.userData.goc=m.color.clone();   /* giữ màu gốc dưới màu trời: tượng màu trơn (tượng Bác đồng vàng, bệ đá đen, chữ khắc) không thì thành trắng */m.envMap=moiTruong();m.envMapIntensity=laMai?0:.7;cy.push(m);if(m.map)m.map.anisotropy=r.capabilities.getMaxAnisotropy();m.onBeforeCompile=sh=>AGX(sh);if(!laMai)nen.push(o)}});/* mái chính điện: làm mờ khi vào điện, không chặn tia bấm */canh.add(gt.scene)}
   const lh=c.lh?B(c.lh[0],c.lh[1]):null,tinh=[];
   for(const [m,dt,x,y] of c.le)mau(m).then(gl=>{const q=dung(m,gl,canh),p=B(x,y);q.rig.position.set(p.x,c.day+.03,p.z);q.bo.position.set(p.x,c.day+.05,p.z);
    if(lh){const d=new V3().subVectors(lh,p);q.rig.rotation.y=Math.atan2(d.x,d.z)}choi(q,DONG[dt]);if(!GIAM)q.mx.update(Math.random()*3);tinh.push(q)}).catch(()=>{});
   DL[ten]={...a,canh,nen,dat,bk,cy,den,hemi,lh,huong:(c.huong||(c.lh?[c.lh]:[])).map(h=>B(h[0],h[1])),tinh,nut:[],nutO:'',cao:tt&&tt.cao};if(ten==='sanh')trangTriSanh(DL[ten]);if(ten==='tho')vatNhaTho(DL[ten]);if(ten==='ho')dungNha();if(ten==='nha')dungDo();if(TT[ten])trangTriCanh(DL[ten],TT[ten])}   // sảnh: cột sáng, logo trước; cảnh động chung nối sau
  function trongDa(x,y,ps){let c=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){const a=ps[i],b=ps[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
  function caoTai(ten,u,v){   // độ cao mặt đi tại điểm ảnh (u,v), nội suy từ lưới nướng sẵn; nền dinh thự ở làng riêng nâng thêm (js/20 ssHo.nen)
   if(ten==='ho'&&window.ssHo&&ssHo.nen)for(const n of ssHo.nen())if(trongDa(u,v,n.p))return caoGoc(ten,u,v)+n.h;return caoGoc(ten,u,v)}
  function caoGoc(ten,u,v){const g=DL[ten].cao;if(!g)return CANH[ten].day;const x=Math.max(0,Math.min(g.w-1.001,u*g.w-.5)),y=Math.max(0,Math.min(g.h-1.001,v*g.h-.5)),i=x|0,j=y|0,fx=x-i,fy=y-j,z=(a,b)=>g.cm[b*g.w+a]/100;
   return (z(i,j)*(1-fx)+z(i+1,j)*fx)*(1-fy)+(z(i,j+1)*(1-fx)+z(i+1,j+1)*fx)*fy}

  // ---- làng riêng: nhà 3D dựng từ gia phả (js/20 ssHo.nha()), chủ dự án duyệt 12/11/2026. Mẫu img/3d/ho/nha.json (tools/blender/nha-3d.py):
  // nha_<kiểu> có vật liệu mai, tuong nhuộm theo lựa chọn người dùng; cua_<kiểu> lắp vào điểm o_cua_<kiểu>; do_<đồ> bày vào ô quanh nhà
  let NHA=null;const nhaTop={};
  function mauNha(){return NHA||(NHA=taiJSON('img/3d/ho/nha.json').then(parse))}
  function vlNha(mau,d){const c=new THREE.Color(mau),v=new THREE.MeshStandardMaterial({color:c,roughness:.9,metalness:0,envMapIntensity:0});v.onBeforeCompile=sh=>AGX(sh,true);
   v.userData.goc=c.clone();v.userData.nha=1;if(d)d.cy.push(v);return v}
  function nhuom(o,mau,d){o.traverse(m=>{if(!m.isMesh)return;const t=m.material.name;m.material=vlNha(mau[t]||'#'+m.material.color.getHexString(),d)})}
  function taoNha(gl,h,d){const ks=gl.scene.getObjectByName('nha_'+h.style)?h.style:'bagian',cs=h.cap===1||h.cap===3?'_'+h.cap:'',goc=t=>gl.scene.children.find(o=>o.name===t),v=(goc('nha_'+ks+cs)||goc('nha_'+ks)).clone(true);   /* chỉ tìm vật gốc: mảnh con của lưới nhiều vật liệu cũng tên nha_<kiểu>_<số> */nhuom(v,{mai:h.roof,mai2:new THREE.Color(h.roof).multiplyScalar(.72),tuong:h.wall},d);
   const oc=v.getObjectByName('o_cua_'+ks+cs)||v.getObjectByName('o_cua_'+ks),cm=gl.scene.getObjectByName('cua_'+(h.cua||'go'))||gl.scene.getObjectByName('cua_go');
   if(oc&&cm){const c=cm.clone(true);nhuom(c,{},d);c.position.copy(oc.position);v.add(c)}return v}
  async function dungNha(){const d=DL.ho;if(!d||!window.ssHo||!ssHo.nha)return;const gl=await mauNha().catch(()=>null);if(!gl||!DL.ho)return;
   if(d.nha){d.canh.remove(d.nha);d.cy=d.cy.filter(m=>!m.userData.nha)}
   const nhom=new THREE.Group(),dat=(u,v)=>{const z=caoTai('ho',u,v),q=d.tuAnh(u,v,z);return B(q.x,q.y,z)};d.nha=nhom;
   for(const n of ssHo.nha()){const g=taoNha(gl,n.h,d),z0=caoGoc('ho',n.a[0],n.a[1]),q0=d.tuAnh(n.a[0],n.a[1],z0);g.position.copy(B(q0.x,q0.y,z0));nhom.add(g);   /* nhà đặt trên đất gốc, đồ vườn theo mặt nền dinh thự */

    const bb=new THREE.Box3().setFromObject(g);nhaTop[n.k]=[(bb.min.x+bb.max.x)/2,-(bb.min.z+bb.max.z)/2,bb.max.y+1.4];
    for(const [ten,o,mau] of n.do){const m=gl.scene.getObjectByName('do_'+ten);if(!m||!o)continue;const c=m.clone(true);nhuom(c,mau?{tuong:mau}:{},d);c.position.copy(dat(o[0],o[1]));nhom.add(c)}}
   for(const r of ssHo.ranh?ssHo.ranh():[]){const m=gl.scene.children.find(o=>o.name==='ranh_'+r.k);if(!m)continue;const c=m.clone(true),z=caoGoc('ho',r.c[0],r.c[1]),q=d.tuAnh(r.c[0],r.c[1],z);nhuom(c,{},d);c.position.copy(B(q.x,q.y,z));nhom.add(c)}   /* ranh giới ô đất */
   d.canh.add(nhom);d.nutO=''}   // dựng lại nút tên trên nóc nhà
  addEventListener('ss-ho-nha',()=>{if(DL.ho)dungNha();if(DL.nha)dungDo()});
  // đồ người thân tặng bày trong gian nhà (cảnh 'nha'): [x,y Blender của cảnh, xoay độ, rộng, sâu]; áo treo trong tủ áo
  const DO_TRONG={truongky:[8.2,1.8,-90,2.4,1.9],sap:[-8.5,4.5,0,2.0,1.4],tuche:[6.3,8.9,0,1.6,.6],tuao:[8.5,6.0,-90,2.0,1.8]},AO={aodai:-.45,quanphuc:0,aolen:.45};let luoiGoc=null;
  async function dungDo(){const d=DL.nha;if(!d||!window.ssHo||!ssHo.qua)return;const p=window.ssPerson&&ssPerson.get(),co={};(p?ssHo.qua(p.id):[]).forEach(id=>co[id]=1);
   const vat=Object.keys(DO_TRONG).filter(k=>k==='tuao'?Object.keys(AO).some(a=>co[a]):co[k]),gl=vat.length?await mauNha().catch(()=>null):null;if(!DL.nha)return;
   if(d.doTrong){d.canh.remove(d.doTrong);d.cy=d.cy.filter(m=>!m.userData.nha);d.doTrong=null}
   const g=new THREE.Group(),mau=ten=>{const m=gl&&gl.scene.getObjectByName('do_'+ten);if(!m)return null;const c=m.clone(true);nhuom(c,{},d);c.traverse(o=>{if(o.isMesh){o.material.color.multiplyScalar(.3);o.material.userData.goc.multiplyScalar(.3)}});return c};   // gian nhà sáng hơn làng: hạ màu cho khỏi bạc
   for(const k of vat){const [x,y,r]=DO_TRONG[k],c=mau(k);if(!c)continue;let uv=d.raAnh(new V3(x,y,0));uv=d.raAnh(new V3(x,y,caoTai('nha',uv[0],uv[1])));
    c.position.copy(B(x,y,caoTai('nha',uv[0],uv[1])));c.rotation.y=r*Math.PI/180;g.add(c);if(k==='tuao')for(const a in AO)if(co[a]){const o=mau(a);if(o){o.position.x=AO[a];c.add(o)}}}
   d.doTrong=g;d.canh.add(g);chanLuoi(gl?vat:[])}
  function chanLuoi(vat){const s=window.SS_CANH&&SS_CANH.nha,d=DL.nha;if(!s||!s.grid)return;const gr=s.grid;if(!luoiGoc)luoiGoc=gr.rows.slice();const R=luoiGoc.map(r=>r.split(''));
   for(let j=0;j<gr.h;j++)for(let i=0;i<gr.w;i++){if(R[j][i]!=='1')continue;const u=(i+.5)/gr.w,v=(j+.5)/gr.h,q=d.tuAnh(u,v,caoTai('nha',u,v));
    for(const k of vat){const [x,y,r,w,h]=DO_TRONG[k],a=r*Math.PI/180,dx=q.x-x,dy=q.y-y;if(Math.abs(dx*Math.cos(a)+dy*Math.sin(a))<w/2+.3&&Math.abs(-dx*Math.sin(a)+dy*Math.cos(a))<h/2+.3)R[j][i]='0'}}
   gr.rows=R.map(r=>r.join(''))}   // không đi xuyên đồ vừa bày
  addEventListener('ss-person',()=>{if(DL.nha)dungDo()});
  // ảnh nhỏ kiểu nhà cho bảng "Sửa nhà" (js/20): vẽ mẫu 3D ra khung riêng
  const rtN=new THREE.WebGLRenderTarget(160,160),scN=new THREE.Scene(),camN=new THREE.OrthographicCamera(-6.5,6.5,6.5,-6.5,.1,200);rtN.texture.colorSpace=THREE.SRGBColorSpace;
  scN.add(new THREE.HemisphereLight(0xfff6e8,0x8c7a62,2.4));{const n=new THREE.DirectionalLight(0xffffff,1.8);n.position.set(-6,14,9);scN.add(n)}
  camN.position.copy(B(DIR.x*60,DIR.y*60,DIR.z*60+4));camN.lookAt(B(0,0,4));
  window.ss3dAnhNha=(cv,h)=>mauNha().then(gl=>{let v;if(h.do){const m=gl.scene.getObjectByName('do_'+h.do);if(!m)return;v=m.clone(true);nhuom(v,{},null)}else v=taoNha(gl,h,null);scN.add(v);
   const bb=new THREE.Box3().setFromObject(v),c=bb.getCenter(new V3()),k=h.do?Math.max(.6,bb.getSize(new V3()).length()*.42):h.cap===3?13:6.5;camN.left=camN.bottom=-k;camN.right=camN.top=k;camN.updateProjectionMatrix();
   camN.position.copy(h.do?c:B(0,0,4)).addScaledVector(B(DIR.x,DIR.y,DIR.z),60);camN.lookAt(h.do?c:B(0,0,4));const cc=new THREE.Color(),ca=r.getClearAlpha();r.getClearColor(cc);
   r.setRenderTarget(rtN);r.setClearColor(0xf3ead8,1);r.clear();r.render(scN,camN);const px=new Uint8Array(160*160*4);r.readRenderTargetPixels(rtN,0,0,160,160,px);r.setRenderTarget(null);r.setClearColor(cc,ca);scN.remove(v);
   const x=cv.getContext('2d'),im=x.createImageData(160,160);for(let y=0;y<160;y++)im.data.set(px.subarray((159-y)*640,(160-y)*640),y*640);x.putImageData(im,0,0)}).catch(()=>{});
  // ---- nút điểm đến: lấy đúng chỗ trên ảnh, bắn tia theo camera ảnh vào cảnh 3D để ra điểm thật
  const ray=new THREE.Raycaster();
  function dungNut(ten){const d=DL[ten],O=ori();d.nutO=O;hotL.innerHTML='';d.nut=[];
   const ds=(window.SS_CANH&&SS_CANH[ten]&&SS_CANH[ten].hot&&SS_CANH[ten].hot[O])||[];
   ds.forEach((h,i)=>{ray.ray.copy(d.tiaAnh(h.x,h.y));const hit=ray.intersectObjects(d.nen,false)[0];
    if(hit&&hit.object.userData.tuong){const bh=new THREE.Box3().setFromObject(hit.object),c=new THREE.Vector3();let top=bh.max.y;   // nút trúng tượng hoặc bệ: đặt trên đỉnh đầu tượng đứng trên đó, không che mặt
     for(const o of d.nen)if(o.userData.tuong){const b=new THREE.Box3().setFromObject(o);b.getCenter(c);if(c.x>=bh.min.x-.3&&c.x<=bh.max.x+.3&&c.z>=bh.min.z-.3&&c.z<=bh.max.z+.3)top=Math.max(top,b.max.y)}
     hit.point.set(bh.min.x/2+bh.max.x/2,top+1.2,bh.min.z/2+bh.max.z/2)}
    const nt=h.id&&h.id.indexOf('hp:')===0&&nhaTop[h.id.slice(3)];   // nhà làng riêng: nút trên nóc nhà 3D
    const p=h.p3?B(...h.p3):nt?B(...nt):hit?hit.point.clone():(()=>{const q=d.tuAnh(h.x,h.y);return B(q.x,q.y)})();   // p3: toạ độ 3D cố định (Blender) cho nút trên đỉnh tượng đài
    const a=document.createElement(h.id?'button':'a');a.className='wh'+(h.main?' main':'')+(h.z?' zn':'');if(h.id){a.type='button';a.dataset.w=h.id}else a.href=h.h;
    a.innerHTML='<i class="wh-dot"></i><span class="wh-lb"><i class="wh-ic"></i><b></b><small></small></span>';a.querySelector('b').textContent=h.short||h.t;a.querySelector('small').textContent=h.s||'';a.title=h.t+(h.s?' · '+h.s:'');
    window.ssHudIcon&&ssHudIcon(a.querySelector('.wh-ic'),h);a.style.setProperty('--d',(i*70)+'ms');hotL.appendChild(a);d.nut.push({el:a,p})})}

  // ---- bấm xuống sân để đi; kéo để xoay camera
  let bam=null,dang=null;   // dang: cảnh đang vẽ
  // chuột phải, hay ngón thứ hai chạm xuống (xoay, chụm): không tính là bấm để đi
  r.domElement.addEventListener('pointerdown',e=>{bam=(bam&&e.pointerType==='touch')||e.button?false:{x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}});
  r.domElement.addEventListener('pointercancel',()=>{bam=null});
  r.domElement.addEventListener('pointerup',e=>{const b=bam;bam=null;if(!b||b.id!==e.pointerId||Math.hypot(e.clientX-b.x,e.clientY-b.y)>7||performance.now()-b.t>600||!dang)return;
   const ls=hall.querySelector('.hall-list.open');if(ls){ls.classList.remove('open');hall.classList.remove('list-open');return}
   const d=DL[dang],rc=r.domElement.getBoundingClientRect(),ndc=new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ndc,cam);
   const hit=ray.intersectObjects(d.nen,false)[0];if(!hit)return;const pb=new V3(hit.point.x,-hit.point.z,hit.point.y);let uv=d.raAnh(pb);for(let i=0;i<3;i++){const h=caoTai(dang,uv[0],uv[1]);if(pb.z-h<.6)break;pb.z=h;uv=d.raAnh(pb)}   // bấm trúng mái, tán cây: lấy điểm mặt đất ngay dưới chỗ bấm, không phải chỗ mái che trên ảnh iso
   window.ssWorld&&ssWorld.walk(uv[0],uv[1]);ping.position.set(hit.point.x,hit.point.y+.04,hit.point.z);pingT=0});

  // ---- camera: đi theo "Bạn", người dùng kéo để xoay
  let theo=null,daDat=false;
  // camera xoay vòng: kéo (chuột trái, chuột phải, Alt + chuột trái, hai ngón) hoặc giữ Q / E để xoay quanh "Bạn"; góc người xem chọn được giữ
  // tới khi bấm nút "Về góc mặc định" (js/16, chỉ hiện khi đã xoay) hoặc phím R. Sang cảnh khác thì về góc mặc định như cũ
  const huongMD=new V3(),lechV=new V3(),TRUC_Y=new V3(0,1,0),PHIM_Q={KeyQ:1,KeyE:-1};let quayP=0,quayV=0,veGoc=false,nutVe=null;
  const boQua=e=>e.ctrlKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable||!hall.classList.contains('w3d-on');
  addEventListener('keydown',e=>{if(boQua(e))return;if(e.code in PHIM_Q){quayP=PHIM_Q[e.code];veGoc=false}else if(e.code==='KeyR'&&!e.repeat)window.ss3dVeGoc()});
  addEventListener('keyup',e=>{if(PHIM_Q[e.code]===quayP)quayP=0});addEventListener('blur',()=>{quayP=0});
  dk.addEventListener('start',()=>{veGoc=false});
  window.ss3dVeGoc=()=>{veGoc=true;window.ssZoomVe&&ssZoomVe()};
  // mở cùng hướng nhìn với ảnh iso cũ (từ tây nam nhìn lên) cho người quen đường không bị lạc;
  // nghiêng 55° (cao hơn ảnh cũ 42°) để mái cổng không che người vừa vào sân
  function datCamQuanh(t){const n=(dang&&CANH[dang].nghieng||55)*Math.PI/180,h=Math.hypot(DIR.x,DIR.y);cam.position.copy(t).addScaledVector(B(DIR.x/h*Math.cos(n),DIR.y/h*Math.cos(n),Math.sin(n)),xa());dk.target.copy(t)}
  const chieu=new V3(),tam2=new V3();
  function nhan(el,p,cao){chieu.copy(p);chieu.y+=cao;chieu.project(cam);const ok=chieu.z<1&&Math.abs(chieu.x)<1.2&&Math.abs(chieu.y)<1.2;el.style.display=ok?'':'none';
   if(ok){el.style.left=((chieu.x+1)/2*hall.clientWidth).toFixed(1)+'px';el.style.top=((1-chieu.y)/2*hall.clientHeight).toFixed(1)+'px'}}
  const nguoi={};
  function doiCanh(ten){   // sang cảnh khác: bỏ người của cảnh cũ, dời vòng sáng, đặt lại camera quanh "Bạn"
   for(const id in nguoi){const q=nguoi[id];q.q&&boNguoi(q.q);q.tag&&q.tag.remove();delete nguoi[id]}
   const d=DL[ten];d.canh.add(vongVang,ping,DOM);TR.set=false;tinhT=0;/* vào cảnh: trời nhảy ngay đúng giờ, không đổi dần */vongVang.visible=false;pingT=9;theo=null;daDat=false;dang=ten;dungNut(ten)
   const g=CANH[ten].goc,h=Math.hypot(DIR.x,DIR.y),t0=Math.atan2(DIR.x/h,-DIR.y/h);   // hướng camera ảnh theo góc phương vị của OrbitControls (atan2(x, z) trong toạ độ three, z = -y Blender)
   dk.minAzimuthAngle=g?t0-g*Math.PI/180:-Infinity;dk.maxAzimuthAngle=g?t0+g*Math.PI/180:Infinity;
   const ng=CANH[ten].nghieng;dk.minPolarAngle=(ng?90-ng:15)*Math.PI/180;dk.maxPolarAngle=(ng?90-ng:g?60:68)*Math.PI/180}
  // tranh 2D của js/20 (nhà, xe, đồ trong vườn) nằm trong wStage theo % ảnh: chuyển sang lớp riêng và đặt lại theo camera 3D mỗi khung
  const c1=new V3(),c2=new V3(),c3=new V3();
  // di ảnh trên bàn thờ (.w-anh của 04-01, khung chữ nhật trên ảnh): bắn tia camera ảnh vào tâm khung tìm điểm trên tường,
  // cỡ thật theo mét (chiều đứng bù góc nghiêng 42° của ảnh), chiếu lên màn hình mỗi khung
  function datAnh(ten){const el=hall.querySelector('.w-anh');if(!el)return;const d=DL[ten],c=CANH[ten];
   if(el.parentNode!==tranhL)tranhL.appendChild(el);
   const k=el.style.left+el.style.top+el.style.width+el.style.height;
   if(el._k!==k){el._k=k;const L=parseFloat(el.style.left)/100,T=parseFloat(el.style.top)/100,w=parseFloat(el.style.width)/100,h=parseFloat(el.style.height)/100;
    ray.ray.copy(d.tiaAnh(L+w/2,T+h/2));const hit=ray.intersectObjects(d.nen,false)[0];
    el._p=hit?hit.point.clone():null;el._wm=w*c.ow;el._hm=h*c.ow*2/3/Math.cos(EL)}
   if(!el._p){el.style.display='none';return}el.style.display='';
   const Wd=hall.clientWidth,Hd=hall.clientHeight,ri=new V3(1,0,0).applyQuaternion(cam.quaternion);
   c1.copy(el._p).project(cam);c2.copy(el._p).addScaledVector(ri,el._wm).project(cam);c3.copy(el._p).add(new V3(0,el._hm,0)).project(cam);
   const x=(c1.x+1)/2*Wd,y=(1-c1.y)/2*Hd,pw=Math.abs(c2.x-c1.x)/2*Wd,ph=Math.abs(c3.y-c1.y)/2*Hd;
   el.style.left=(x-pw/2).toFixed(1)+'px';el.style.top=(y-ph/2).toFixed(1)+'px';el.style.width=pw.toFixed(1)+'px';el.style.height=ph.toFixed(1)+'px';el._k=el.style.left+el.style.top+el.style.width+el.style.height}
  let truoc=performance.now();
  // máy yếu (trình duyệt vẽ bằng CPU, điện thoại cũ): khung hình chậm kéo dài thì hạ dần độ phân giải vẽ, thấp nhất 0.5. Vừa vào cảnh chờ 2.5 s cho nạp xong
  let khTB=16,haT=0;function hieuNang(ms,t){if(ms>500)return;khTB+=(ms-khTB)*.05;const pr=r.getPixelRatio();if(khTB>40&&pr>.5&&t-haT>2500){haT=t;r.setPixelRatio(Math.max(.5,pr*.8));khTB=30}}
  ve=function(ten){const t=performance.now(),ms=t-truoc,dt=Math.min(.05,ms/1000);truoc=t;if(dang!==ten||anDi){anDi=false;doiCanh(ten);haT=t}else hieuNang(ms,t);
   const d=DL[ten],w=window.ssWorld,av=w.avs?w.avs():{},thay={};
   co();if(d.nutO!==ori())dungNut(ten);
   for(const id in av){const p=av[id];thay[id]=1;const m0=mauCua(id,p);let q=nguoi[id];
    if(q&&q.ten!==m0&&q.q){boNguoi(q.q);q.tag&&q.tag.remove();q=null}
    if(!q){q=nguoi[id]={ten:m0,q:null,tag:null};mau(m0).then(gl=>{if(nguoi[id]!==q)return;q.q=dung(m0,gl,d.canh);q.q.dangA=''}).catch(()=>{});
     if(id.indexOf('npc-')!==0){q.tag=document.createElement('div');q.tag.className='w3d-tag'+(p.me?' me':'');q.tag.innerHTML='<span class="t"></span><span class="b"></span>';tagL.appendChild(q.tag)}}
    const hz=caoTai(ten,p.x,p.y),pb=d.tuAnh(p.x,p.y,hz),wp=B(pb.x,pb.y,hz),m=q.q;q.wp=wp;
    if(q.tag){q.tag.querySelector('.t').textContent=(p.el.querySelector('.wa-tag')||{}).textContent||'';const bb=p.el.querySelector('.wa-bub');q.tag.querySelector('.b').textContent=bb?bb.textContent:''}
    if(!m)continue;
    const cu=m.rig.position,dx=wp.x-cu.x,dz=wp.z-cu.z,dd=Math.hypot(dx,dz);
    if(!m.daDat||dd>6){m.daDat=1}else if(dd>.004&&p.a==='di'){const y=Math.atan2(dx,dz);m.yaw+=Math.atan2(Math.sin(y-m.yaw),Math.cos(y-m.yaw))*Math.min(1,dt*8);m.toc=dd/Math.max(dt,1e-3)}
    let hg=null;if(p.a==='chap'||p.a==='lay'||p.a==='ngoi'){let gd=12;for(const h of d.huong){const k=Math.hypot(h.x-wp.x,h.z-wp.z);if(k<gd){gd=k;hg=h}}}   // chắp tay, lạy, ngồi: quay về nơi thờ gần nhất (tượng Phật, lư hương, chuông, mõ, cội bồ đề)
    if(hg){const y=Math.atan2(hg.x-wp.x,hg.z-wp.z);m.yaw+=Math.atan2(Math.sin(y-m.yaw),Math.cos(y-m.yaw))*Math.min(1,dt*6)}
    m.rig.position.set(wp.x,hz+.03,wp.z);m.rig.rotation.y=m.yaw;m.bo.position.set(wp.x,hz+.05,wp.z);
    const k=DONG[p.a]||'Idle';if(m.dangA!==k){m.dangA=k;choi(m,k)}
    if(k==='Walk'&&m.act.Walk)m.act.Walk.timeScale=THREE.MathUtils.clamp((m.toc||2.2)/2.2,.6,1.6);
    if(!GIAM)m.mx.update(dt);
    if(p.me&&nangMe){m.rig.position.y+=nangMe.y;m.rig.scale.setScalar(m.s0*nangMe.s)}else if(p.me&&m.rig.scale.x!==m.s0)m.rig.scale.setScalar(m.s0);
    if(p.me){vongVang.visible=true;vongVang.position.set(wp.x,hz+.06,wp.z);if(!GIAM)vongVang.material.opacity=.55+.3*Math.sin(t/320);theo=wp}}
   for(const id in nguoi)if(!thay[id]){const q=nguoi[id];q.q&&boNguoi(q.q);q.tag&&q.tag.remove();delete nguoi[id]}
   if(!GIAM)for(const q of d.tinh)q.mx.update(dt);
   // camera đi theo người chơi, giữ nguyên góc người dùng đã xoay
   if(theo){tam2.set(theo.x,theo.y+1,theo.z);   // theo.y = độ cao mặt đứng
    if(!daDat){datCamQuanh(tam2);daDat=true}   // vào cảnh: đặt lại camera quanh "Bạn" (trước đây dòng này lỡ nằm trong chú thích nên camera giữ góc của cảnh trước)
    const k=GIAM?1:1-Math.exp(-dt*3),dv=tam2.clone().sub(dk.target).multiplyScalar(k);dk.target.add(dv);cam.position.add(dv)}
   // Q / E: tăng tốc và hãm dần như kéo chuột; giới hạn góc (cảnh trong nhà, độ nghiêng) do dk.update() bên dưới giữ
   quayV=GIAM?quayP*1.6:quayV+(quayP*1.6-quayV)*Math.min(1,dt*6);
   if(Math.abs(quayV)>1e-3){lechV.copy(cam.position).sub(dk.target).applyAxisAngle(TRUC_Y,quayV*dt);cam.position.copy(dk.target).add(lechV)}
   if(daDat){const n=(dang&&CANH[dang].nghieng||55)*Math.PI/180,h=Math.hypot(DIR.x,DIR.y);huongMD.copy(B(DIR.x/h*Math.cos(n),DIR.y/h*Math.cos(n),Math.sin(n))).normalize();   // cùng hướng datCamQuanh
    const v0=cam.position.clone().sub(dk.target),R0=v0.length();v0.divideScalar(R0);const lech=v0.angleTo(huongMD);
    if(veGoc){if(lech<.003)veGoc=false;else cam.position.copy(dk.target).addScaledVector(v0.lerp(huongMD,GIAM?1:Math.min(1,dt*2.2)).normalize(),R0)}   // lướt về góc mặc định
    nutVe=nutVe||hall.querySelector('.zm [data-z="ve"]');if(nutVe&&nutVe.hidden!==(lech<.07||veGoc))nutVe.hidden=!nutVe.hidden}   // nút "Về góc mặc định" chỉ hiện khi đã xoay quá 4°
   const v=cam.position.clone().sub(dk.target),R=v.length(),Rm=xa();if(Math.abs(R-Rm)>.01)cam.position.copy(dk.target).addScaledVector(v,(R+(Rm-R)*(GIAM?1:Math.min(1,dt*6)))/R);
   d.canh.fog.near=Rm+8;d.canh.fog.far=Rm+75;   // sương lùi theo khoảng cách camera; bắt đầu sát sau người cho cảnh xa mờ dần
   DOM.position.set(dk.target.x,dk.target.y-2,dk.target.z);bayDom(dt,t);troiBuoc(d,dt,t,Rm);
   dk.update();cam.updateMatrixWorld();   // nhãn tên và nút tính theo camera của khung này, không trễ một nhịp
   for(const id in nguoi){const q=nguoi[id];if(q.tag&&q.wp)nhan(q.tag,q.wp,TO*1.45)}
   if(pingT<1){pingT+=dt/.7;ping.material.opacity=.95*(1-pingT);ping.scale.setScalar(1+pingT*1.2)}else ping.material.opacity=0;
   for(const n of d.nut)nhan(n.el,n.p,0);
   if(d.capNhat)d.capNhat(t,dt);
   if(CANH[ten].anh)datAnh(ten);
   r.render(d.canh,cam)};
  // ---- đoạn phim chuyển cảnh thay màn tải: "Bạn" đi bộ trên đường thật của cảnh (lên chùa: leo bậc đá chân núi), máy quay bám theo.
  // Cảnh đích chưa nạp xong thì đi lại đoạn đường cho tới khi xong. Trả false khi không chiếu được (giảm chuyển động, cảnh chưa có) để 04-01 dùng màn cũ
  const THANG=[[.478,.495],[.458,.455],[.437,.415],[.418,.37],[.404,.33],[.388,.29],[.366,.215]];   // giữa bậc đá lên chùa trên ảnh chân núi, từ chân lên đỉnh
  const VAO={sanh:[.77,.9],ho:[.78,.8],tho:[.86,.62],nha:[.75,.86],dien:[0.7659,0.9098],chan:[.95,.52],lang:[.8,.86]};   // ngoài cổng mỗi cảnh, trên đường vào
  const VDI=2.2,tr=document.getElementById('wTrans');   // m/s: nhịp bước của hoạt ảnh Walk
  function co2(){const w=hall.clientWidth,h=hall.clientHeight;if(w!==cw||h!==ch){cw=w;ch=h;r.setSize(w,h)}cam.aspect=w/Math.max(1,h);cam.fov=w<h?50:40;cam.updateProjectionMatrix()}
  window.ss3dPhim=function(kieu,s,sp,xong){
   const cs=kieu==='di'?s:'chan',d=DL[cs],w=window.ssWorld;
   if(hong||GIAM||phim||!tr||!san[cs]||!d||d.loi||!w||!w.duong)return false;
   const av=w.avs?w.avs():{};let mi=null;for(const id in av)if(av[id].me)mi=av[id];
   const mm=mauCua('me',mi||{k:1});if(!CO[mm.split('|')[0]])return false;
   // đường theo toạ độ ảnh -> dãy điểm 3D: đường đi đặt như người chơi (lưới độ cao); bậc đá bắn tia camera ảnh vào mặt nướng (bỏ qua cây)
   d.canh.updateMatrixWorld();   // cảnh chưa vẽ lần nào thì ma trận còn trống (chân núi nén toạ độ theo tỉ lệ nút): tia bắn trượt
   const uv=kieu==='di'?w.duong(s,VAO[s]||sp,sp):kieu==='len'?THANG:THANG.slice().reverse(),P=[];
   for(let i=1;i<uv.length;i++){const a=uv[i-1],b=uv[i],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*240));
    for(let k=i>1?1:0;k<=n;k++){const u=a[0]+(b[0]-a[0])*k/n,v=a[1]+(b[1]-a[1])*k/n;
     if(kieu==='di'){const h=caoTai(cs,u,v),o=d.tuAnh(u,v,h);P.push(B(o.x,o.y,h))}
     else{ray.ray.copy(d.tiaAnh(u,v));const hit=ray.intersectObjects(d.dat,false)[0];if(hit)P.push(hit.point.clone())}}}
   if(P.length<2)return false;
   const Ls=[0];for(let i=1;i<P.length;i++)Ls.push(Ls[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z));
   // đi đường: đoạn cuối, dừng đúng chỗ sẽ đứng ở cảnh mới; lên chùa: nửa trên, mái chùa hiện dần phía trước; xuống núi: từ gần đỉnh xuống
   const T=kieu==='di'?3.2:4.2,L=Ls[Ls.length-1],dai=kieu==='di'?Math.min(L,VDI*(T+.5)):L*.28,d0=kieu==='len'?L*.55:kieu==='xuong'?L*.1:L-dai,tc=dai/(T+.5);
   const q=dung(mm,CO[mm.split('|')[0]],d.canh);choi(q,'Walk');q.mx.update(.31);   // hết pha hoà dần, khung đầu không lộ tư thế dang tay
   if(q.act.Walk)q.act.Walk.timeScale=THREE.MathUtils.clamp(tc/VDI,.7,1.3);
   for(const id in nguoi){const x=nguoi[id].q;if(x)x.rig.visible=x.bo.visible=false}vongVang.visible=false;ping.material.opacity=0;
   tr.prepend(r.domElement);r.domElement.style.opacity='1';cw=-1;
   // khung trang trí: màn ngà có logo vẽ dần và tên nơi đến hiện từng chữ, rồi mở tròn ra đoạn phim; hết phim khép tròn lại (css/29 .pu)
   let ui=tr.querySelector('.pu');if(!ui){ui=document.createElement('div');ui.className='pu';ui.setAttribute('aria-hidden','true');
    const LG='<path class="pu-l" d="M16 7.94A9 9 0 0 1 16 24.06A9 9 0 0 1 16 7.94Z"/><circle class="pu-c pu-c1" cx="12" cy="16" r="9" pathLength="100"/><circle class="pu-c pu-c2" cx="20" cy="16" r="9" pathLength="100"/>';
    ui.innerHTML='<div class="pu-iris"></div><div class="pu-giua"><i class="pu-tia"></i><svg class="pu-logo" viewBox="0 0 32 32" fill="none">'+LG+'</svg><b class="pu-ten"></b><small>Thế Giới Song Song</small><span class="pu-dom">'+'<i></i>'.repeat(14)+'</span></div>'+
     '<div class="pu-day"><svg class="pu-mini" viewBox="0 0 32 32" fill="none">'+LG+'</svg><span class="pu-nho"></span><i class="pu-tien"></i></div>';tr.appendChild(ui)}
   tr.classList.remove('pu-chay','pu-dong');void tr.offsetWidth;tr.classList.add('pu-chay');let daTen=false;
   const tai=(x,o)=>{let i=1;while(i<Ls.length-1&&Ls[i]<x)i++;const f=THREE.MathUtils.clamp((x-Ls[i-1])/Math.max(1e-6,Ls[i]-Ls[i-1]),0,1);return o.copy(P[i-1]).lerp(P[i],f)};
   const vt=new V3(),vt2=new V3(),f=new V3(),ph=new V3(),nhin=new V3(),camM=new V3();let t=0,t0=performance.now(),dau=true,het=0,yaw=0;
   // máy quay [trước, ngang, cao, nhìn trước, nhìn cao] theo hướng đi: lên chùa -> sau chéo nhìn lên bậc; xuống núi -> phía dưới nhìn người xuống;
   // đi đường -> sau lưng, thấy nơi sắp tới (vướng thì trước mặt). Thử vài chỗ đặt máy: vẽ ảnh độ sâu 64x40 từ mỗi chỗ (GPU, vài ms; bắn tia vào
   // lưới cây gộp mất cả giây), đếm điểm quanh người bị cây, cổng che, lấy chỗ ít bị che nhất
   let K=kieu==='len'?[-8,1,4.6,2.8,2.4]:kieu==='xuong'?[7,1.8,2.2,0,2]:null;
   if(!K){let it=1e9;const RT=new THREE.WebGLRenderTarget(64,40),MD=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}),px=new Uint8Array(64*40*4),
     cT=new THREE.PerspectiveCamera(hall.clientWidth<hall.clientHeight?50:40,hall.clientWidth/Math.max(1,hall.clientHeight),1,400),nen0=d.canh.background,mx0=r.getClearColor(new THREE.Color()),pp=new V3();
    q.rig.visible=q.bo.visible=false;d.canh.background=null;d.canh.overrideMaterial=MD;r.setClearColor(0xffffff,1);r.setRenderTarget(RT);
    for(const k of [[-6.5,1,3.2,5,1.6],[-6.5,-1,3.2,5,1.6],[-6,1.4,4.6,5,1.4],[-6,-1.4,4.6,5,1.4],[5.5,1.6,3.4,.4,1.6],[5.5,-1.6,3.4,.4,1.6]]){let n=0;
     for(const a of [.1,.45,.8]){const x=d0+dai*a;tai(x,vt);tai(x+.6,vt2);const yy=Math.atan2(vt2.x-vt.x,vt2.z-vt.z),sx=Math.sin(yy),sz=Math.cos(yy);
      cT.position.set(vt.x+sx*k[0]-sz*k[1],vt.y+k[2],vt.z+sz*k[0]+sx*k[1]);cT.lookAt(vt.x+sx*k[3],vt.y+k[4],vt.z+sz*k[3]);cT.updateMatrixWorld();
      r.render(d.canh,cT);r.readRenderTargetPixels(RT,0,0,64,40,px);
      for(const [ng,ca] of [[0,1.4],[1.8,1.8],[-1.8,1.8],[0,3.6]]){pp.set(vt.x-sz*ng,vt.y+ca,vt.z+sx*ng).project(cT);   // giữa người, hai bên, trên đầu: vật che nửa khung cũng tính
       if(Math.abs(pp.x)>1||Math.abs(pp.y)>1)continue;const i=(Math.min(39,(pp.y+1)*20|0)*64+Math.min(63,(pp.x+1)*32|0))*4;
       if(255/256*(px[i]/4278190080+px[i+1]/16711680+px[i+2]/65280+px[i+3]/255)<(pp.z+1)/2-1e-4)n++}}   // giải nén độ sâu RGBA của three
     if(n<it){it=n;K=k}if(!n)break}
    r.setRenderTarget(null);r.setClearColor(mx0,1);d.canh.overrideMaterial=null;d.canh.background=nen0;q.rig.visible=q.bo.visible=true;RT.dispose();MD.dispose()}
   function xongPhim(){boNguoi(q);for(const id in nguoi){const x=nguoi[id].q;if(x)x.rig.visible=x.bo.visible=true}
    box.appendChild(r.domElement);r.domElement.style.opacity='';cw=-1;anDi=true;phim=null;daDat=false;xong();/* máy quay của phim (thấp, sát người) không được ở lại: đặt lại góc chuẩn quanh "Bạn" dù cảnh đã đổi trước khi phim chạy */setTimeout(()=>tr.classList.remove('pu-chay','pu-dong'),1000)}
   phim={buoc(){const now=performance.now(),dt=Math.min(.05,(now-t0)/1000);t0=now;t+=dt;
    if(!daTen){daTen=true;const ten=((tr.querySelector('span')||{}).textContent||'').replace(/…$/,''),b=ui.querySelector('.pu-ten');b.textContent='';   // 04-01 đặt chữ sau khi phim nhận chiếu
     [...ten].forEach((ch,i)=>{const e=document.createElement('i');e.textContent=ch;e.style.setProperty('--i',i);b.appendChild(e)});ui.querySelector('.pu-nho').textContent=ten}
    const tw=t-1;   // 1 giây đầu màn ngà còn khép: chưa đi
    if(tw>=T&&!het&&(san[s]||!CANH[s]||CANH[s].loi||hong)){het=now;tr.classList.add('pu-dong')}   // khép tròn về logo rồi mới đổi cảnh
    if(het&&now-het>650){xongPhim();return}
    if(!het&&tw>=T+.5)t=1;   // cảnh đích còn đang nạp: đi lại quãng đường
    const x=d0+THREE.MathUtils.clamp(tw,0,T+.5)*tc;tai(x,vt);tai(x+.6,vt2);f.subVectors(vt2,vt);f.y=0;if(f.lengthSq()<1e-8)f.set(Math.sin(yaw),0,Math.cos(yaw));
    const y=Math.atan2(f.x,f.z);yaw=dau?y:yaw+Math.atan2(Math.sin(y-yaw),Math.cos(y-yaw))*Math.min(1,dt*6);
    q.rig.position.set(vt.x,vt.y+.03,vt.z);q.rig.rotation.y=yaw;q.bo.position.set(vt.x,vt.y+.05,vt.z);q.mx.update(dt);
    for(const z of d.tinh)z.mx.update(dt);
    const fx=Math.sin(yaw),fz=Math.cos(yaw);
    ph.set(vt.x+fx*K[0]-fz*K[1],vt.y+K[2],vt.z+fz*K[0]+fx*K[1]);nhin.set(vt.x+fx*K[3],vt.y+K[4],vt.z+fz*K[3]);
    if(dau){camM.copy(nhin);cam.position.copy(ph);dau=false}else{const k=1-Math.exp(-dt*4);cam.position.lerp(ph,k);camM.lerp(nhin,k)}
    cam.lookAt(camM);d.canh.fog.near=25;d.canh.fog.far=90;troiBuoc(d,dt,now,30);co2();r.render(d.canh,cam)}};
   return true};
  window.ss3dCanh={cam,dk,B,get canh(){return dang&&DL[dang].canh},get raAnh(){return dang&&DL[dang].raAnh},get tuAnh(){return dang&&DL[dang].tuAnh},get cao(){return dang&&((u,v)=>caoTai(dang,u,v))},get nguoi(){return nguoi},get d(){return dang&&DL[dang]}};   // để thử nghiệm

  // ---- nạp mọi cảnh + đủ 9 nhân vật, rồi dựng sẵn shader một lần để lúc đi và lúc NPC xuất hiện không bị khựng
  const ds=await Promise.all([...new Set(['ThanhNien','ChiBaBa','TuyChinh',...Object.values(NPC).flat(),...Object.values(CANH).flatMap(c=>c.le.map(x=>x[0]))])].map(t=>mau(t).catch(()=>null)));
  // cảnh đầu trước; sau đó lần lượt: ưu tiên cảnh người dùng đang đứng chờ, rồi theo thứ tự trong CANH
  let dau=true;
  for(;;){const s=canhNay(),ten=s&&!san[s]&&!DL[s]?s:dau?DAU:Object.keys(CANH).find(k=>!DL[k]);if(!ten)break;
   try{await napCanh(ten);const d=DL[ten],tam=new THREE.Group();ds.forEach(gl=>gl&&tam.add(SU.clone(gl.scene)));d.canh.add(tam);r.compile(d.canh,cam);   /* không dời camera ở đây: cảnh nạp ngầm xong lúc người dùng đang xem cảnh khác sẽ giật camera về chỗ cũ */d.canh.remove(tam);san[ten]=true}
   catch(e){if(dau)throw e;console.warn('cảnh 3D '+ten+': dùng ảnh tĩnh',e);DL[ten]=DL[ten]||{loi:1};CANH[ten].loi=1}
   if(dau){dau=false;await new Promise(ok=>setTimeout(ok,300));window.ss3dXong=true}}}
}
