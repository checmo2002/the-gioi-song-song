/* ===== Thế giới 3D: các cảnh kiểu đồ chơi đất sét, vẽ thời gian thực bằng three.js thay cho ảnh tĩnh *-iso =====
   Mỗi cảnh: nền + ánh sáng nướng sẵn trong Blender (img/3d/<cảnh>/canh.json + ảnh webp), cây và người tự chiếu sáng trên máy.
   Đường đi, người chơi khác, NPC, nút điểm đến vẫn do js/04-01-the-gioi-nui.js lo trên lưới 2D của ảnh iso;
   file này chỉ đổi toạ độ ảnh <-> toạ độ 3D rồi vẽ lại cho đẹp. Máy không có WebGL thì giữ nguyên ảnh tĩnh.
   Thêm cảnh mới: nướng bằng quy trình trong docs/do-hoa.md rồi thêm một mục vào CANH bên dưới. */
const hall=document.getElementById('hall'),W=document.getElementById('world');
// cần WebGL2 chạy bằng card đồ hoạ thật; trình duyệt vẽ bằng CPU (SwiftShader, llvmpipe: máy rất cũ, máy chủ kiểm tra) quá chậm nên giữ ảnh tĩnh.
// Thử trên máy không có card: thêm ?3d vào địa chỉ.
const coWebGL=(()=>{try{const g=document.createElement('canvas').getContext('webgl2');if(!g)return false;if(new URLSearchParams(location.search).has('3d'))return true;
 const x=g.getExtension('WEBGL_debug_renderer_info'),ten=String(x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER));g.getExtension('WEBGL_lose_context')?.loseContext();
 return !/swiftshader|llvmpipe|softpipe|software/i.test(ten)}catch(e){return false}})();
window.ss3dXong=!coWebGL;   // màn tải (js/01) và kiểm tra hình ảnh chờ cờ này: các cảnh 3D đã nạp xong hoặc chắc chắn dùng ảnh tĩnh

// camera của ảnh iso từng cảnh (thong-tin.json khi nướng): trực giao, rộng ow mét, nghiêng 42°, phương vị -38°, nhìn vào tgt (toạ độ Blender)
// le: người đứng lễ cố định [mẫu, động tác, x, y]; lh: điểm người chắp tay quay mặt về; toc: hệ số tốc độ đi của 04-01 (đã theo cỡ người trong ảnh)
// xa: khoảng cách camera mặc định (sảnh là chỗ chọn lối nên nhìn rộng thấy cả hai tượng)
// tuong: có tuong.json (tượng giữ ảnh màu gốc, tự chiếu sáng như người); day: độ cao mặt sân lát (người đứng lên trên)
// cao: có thong-tin.json với lưới độ cao mặt đi (bậc, nền cao trong gian thờ) thay cho day; goc: cảnh trong nhà cắt tường,
//      chỉ cho xoay ±goc độ quanh hướng nhìn của ảnh để không vòng ra sau tường
// anh: có di ảnh trên bàn thờ (.w-anh) cần đặt lại theo camera 3D; nghieng: góc nghiêng camera cố định; tranh: cảnh có tranh 2D vẽ thêm (nhà dựng từ gia phả, js/20) -> khoá camera đúng góc ảnh iso
//      rồi chiếu tranh từ toạ độ ảnh xuống mặt đất 3D lên màn hình, nhà đứng đúng ô đất
const CANH={
 sanh:{ten:'sảnh',tgt:[2,18],ow:88,tam:[2,10],le:[],lh:null,toc:.42,tuong:1,day:.09,xa:60},
 chan:{ten:'chân núi',tgt:[3,13],ow:132,tam:[0,-9],lh:[0,-8],toc:.42,day:0,xa:30,
  le:[['BaCu','chap',-1.7,-11.45],['CoAoDai','chap',1.7,-11.45],['OngAoNau','ngoi',0,-12.05],['CuuChienBinh','dung',-3.8,-12.6]]},
 tho:{ten:'nhà thờ',tgt:[2,1.5],ow:42,tam:[2,1.5],le:[],lh:null,toc:.42,day:0,xa:30,cao:1,goc:40},
 lang:{ten:'làng tưởng niệm',tgt:[0,2],ow:118,tam:[0,2],le:[],lh:null,toc:.42,day:0,xa:55,cao:1},
 ho:{ten:'làng dòng họ',tgt:[0,6],ow:100,tam:[0,6],le:[],lh:null,toc:.42,day:0,xa:50,cao:1,goc:30,nghieng:42,tranh:1},
 nha:{ten:'ngôi nhà',tgt:[0,-1],ow:38,tam:[0,-1],le:[],lh:null,toc:.42,day:0,xa:28,cao:1,goc:40,anh:1},
 dien:{ten:'chính điện',tgt:[0,2.5],ow:41,tam:[0,2.5],le:[],lh:null,toc:.42,day:0,xa:30,cao:1,goc:40,tuong:1}};
const THU=t=>'img/3d/'+t+'/';
if(hall&&W&&coWebGL)khoi();

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
  const B=(x,y,z=0)=>new V3(x,z,-y);
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
  const cam=new THREE.PerspectiveCamera(35,1,1,400);   // near 1 m (camera luôn cách đích ≥ 7 m): bộ đệm sâu mịn hơn 10 lần, các mảnh phẳng cách nhau vài mm không còn sọc nhấp nháy
  const dk=new OrbitControls(cam,r.domElement);dk.enableDamping=!GIAM;dk.dampingFactor=.08;dk.rotateSpeed=.7;dk.enableZoom=false;dk.enablePan=false;
  dk.minPolarAngle=15*Math.PI/180;dk.maxPolarAngle=68*Math.PI/180;
  const ori=()=>hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h';
  const xa=()=>{const g=dang?CANH[dang].xa:CANH[DAU].xa;return THREE.MathUtils.clamp(g/(window.ssZoomK?ssZoomK(ori()):1),7,g*2.5)};   // tới 2,5 lần (nút thu nhỏ hết cỡ, js/16 MIN .4); nút góc nhìn, cuộn chuột, chụm ngón (js/16-goc-nhin.js) đổi khoảng cách camera
  let cw=-1,ch=-1;   // cảnh nạp sớm lúc sảnh còn ẩn (cỡ 0) nên đo lại mỗi khi hiện
  function co(){const w=hall.clientWidth,h=hall.clientHeight;if(w===cw&&h===ch)return;cw=w;ch=h;cam.aspect=w/Math.max(1,h);cam.fov=w<h?48:35;cam.updateProjectionMatrix();r.setSize(w,h)}
  co();addEventListener('resize',co);
  const NANG=new V3(.394,.616,-.682).normalize();
  const AGX=(sh,them)=>{sh.fragmentShader=THREE.ShaderChunk.tonemapping_pars_fragment+'\n'+sh.fragmentShader.replace('texture2D( map, vMapUv )','texture2D( map, vMapUv, -1.0 )')+'';
   if(them)sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\n irradiance *= 0.45;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );')};   // tự áp AgX như ảnh Blender

  // ---- nạp: glTF nhúng sẵn dữ liệu (JSON + base64, chạy được cả trên bản thử claude.ai)
  const ld=new GLTFLoader();ld.setMeshoptDecoder(MeshoptDecoder);
  async function taiJSON(url){const q=await fetch(url);if(!q.ok)throw new Error(url+' '+q.status);return q.json()}
  function thanhGLB(j){const b64=j.buffers[0].uri.split(',')[1];delete j.buffers[0].uri;const s=atob(b64),bin=new Uint8Array(s.length);for(let i=0;i<s.length;i++)bin[i]=s.charCodeAt(i);
   const js=new TextEncoder().encode(JSON.stringify(j)),pj=(4-js.length%4)%4,pb=(4-bin.length%4)%4,L=12+8+js.length+pj+8+bin.length+pb;
   const out=new ArrayBuffer(L),dv=new DataView(out),u8=new Uint8Array(out);dv.setUint32(0,0x46546C67,true);dv.setUint32(4,2,true);dv.setUint32(8,L,true);
   dv.setUint32(12,js.length+pj,true);dv.setUint32(16,0x4E4F534A,true);u8.set(js,20);u8.fill(0x20,20+js.length,20+js.length+pj);
   const o=20+js.length+pj;dv.setUint32(o,bin.length+pb,true);dv.setUint32(o+4,0x004E4942,true);u8.set(bin,o+8);return out}   // fetch data: URI hay bị iPhone chặn
  const parse=j=>new Promise((ok,loi)=>ld.parse(thanhGLB(j),'',ok,loi));
  const taiAnh=url=>new Promise((ok,loi)=>new THREE.TextureLoader().load(url,t=>{t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=r.capabilities.getMaxAnisotropy();ok(t)},undefined,loi));
  const anhTo=ten=>CAM_UNG?ten+'-2k':ten;   // ảnh 4096 chỉ cho máy tính; điện thoại dùng 2048 để không tràn bộ nhớ đồ hoạ

  let MT=null;const moiTruong=()=>MT||(MT=new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),.04).texture);
  // ---- nhân vật: mỗi mẫu nạp một lần, dùng chung mọi cảnh, nhân bản cho từng người
  const MAU={},CO={},ANHB=r.capabilities.getMaxAnisotropy();
  function mau(ten){return MAU[ten]||(MAU[ten]=dem(taiJSON('img/3d/nv/'+ten+'.json')).then(parse).then(gl=>{gl.scene.traverse(o=>{if(!o.isMesh)return;const m=o.material;m.metalness=0;m.roughness=.78;m.envMapIntensity=0;
     if(m.map&&CAM_UNG&&m.map.image&&m.map.image.width>1536){const c=document.createElement('canvas');c.width=c.height=1536;c.getContext('2d').drawImage(m.map.image,0,0,1536,1536);m.map.image=c;m.map.needsUpdate=true}
     if(m.map)m.map.anisotropy=ANHB;m.onBeforeCompile=sh=>AGX(sh)});CO[ten]=gl;return gl}))}
  const BONG=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
   gr.addColorStop(0,'rgba(70,45,25,.75)');gr.addColorStop(.45,'rgba(70,45,25,.35)');gr.addColorStop(1,'rgba(70,45,25,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
  const DONG={di:'Walk',dung:'Idle',chap:'Pray',lay:'Bow',ngoi:'Kneel'},TO=1.6;   // người to hơn thật 1,6 lần như hình nhân vật trong game
  function dung(ten,gl,canh){const rig=SU.clone(gl.scene);rig.scale.multiplyScalar(TO);rig.traverse(o=>{if(o.isMesh)o.frustumCulled=false});
   const bo=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.25),new THREE.MeshBasicMaterial({map:BONG,transparent:true,depthWrite:false,toneMapped:false,opacity:.55}));bo.rotation.x=-Math.PI/2;bo.renderOrder=1;
   const q={ten,rig,bo,canh,mx:new THREE.AnimationMixer(rig),act:{},dang:null,yaw:0};for(const c of gl.animations)q.act[c.name]=q.mx.clipAction(c);canh.add(rig,bo);return q}
  function choi(q,k){const a=q.act[k]||(k==='Bow'?q.act.Pray:null)||q.act.Idle;if(!a||q.dang===a)return;a.reset().fadeIn(.3).play();if(q.dang)q.dang.fadeOut(.3);q.dang=a;
   const mot=a===q.act.Bow||a===q.act.Kneel;a.setLoop(mot?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=a===q.act.Kneel;
   if(GIAM){q.mx.update(.6);}}   // giảm chuyển động: đứng yên ở một tư thế
  function boNguoi(q){q.canh.remove(q.rig,q.bo);q.mx.stopAllAction()}
  const NPC=['SuThay','PhuNuTim','HocSinh'];
  function mauCua(id,p){if(id.indexOf('npc-')===0)return NPC[(+id.split('-').pop()||0)%NPC.length];return p.k===1?'ThanhNien':'ChiBaBa'}

  // ---- vòng ring vàng dưới chân "Bạn" và vòng chạm đất khi bấm: dời sang cảnh đang xem
  const vongVang=new THREE.Mesh(new THREE.RingGeometry(.42,.6,48),new THREE.MeshBasicMaterial({color:0xFFD98A,transparent:true,opacity:.85,toneMapped:false,depthWrite:false}));vongVang.rotation.x=-Math.PI/2;vongVang.renderOrder=2;vongVang.visible=false;
  const ping=new THREE.Mesh(new THREE.RingGeometry(.3,.42,40),new THREE.MeshBasicMaterial({color:0xFFE7A8,transparent:true,opacity:0,toneMapped:false,depthWrite:false}));ping.rotation.x=-Math.PI/2;ping.renderOrder=2;let pingT=9;

  // ---- mỗi cảnh: nền nướng + cây + người lễ cố định
  const DL={};
  async function napCanh(ten){
   const c=CANH[ten],G=THU(ten),a=anhCua(c),canh=new THREE.Scene();canh.background=TROI;canh.fog=new THREE.Fog(NEN,55,110);
   const TAM=B(c.tam[0],c.tam[1]),den=new THREE.DirectionalLight(new THREE.Color(1,.9,.77),3.0);den.position.copy(TAM).addScaledVector(NANG,80);den.target.position.copy(TAM);
   canh.add(den,den.target,new THREE.HemisphereLight(0xfff1dc,0xe8d2b0,4.2));
   const [jc,jcay,anh,tt]=await Promise.all([dem(taiJSON(G+'canh.json'),ten),dem(taiJSON(G+'cay.json'),ten),Promise.all(['nen-2k',anhTo('vat-0'),'vat-1-2k',anhTo('vat-3')].map(t=>dem(taiAnh(G+t+'.webp'),ten))),
    c.cao?dem(taiJSON(G+'thong-tin.json'),ten):null]);
   const tex={'nuong-nen':anh[0],'nuong-vat-0':anh[1],'nuong-vat-1':anh[2],'nuong-vat-3':anh[3]};
   const g=await parse(jc),nen=[],dat=[];g.scene.traverse(o=>{if(o.isMesh){const la=o.material.name==='nuong-nen';
    // tấm nền phẳng nằm sát dưới cỏ và sân: đẩy lùi trong bộ đệm sâu để lớp trên luôn thắng, không chập chờn
    o.material=new THREE.MeshBasicMaterial({map:tex[o.material.name],toneMapped:false,side:THREE.DoubleSide,fog:true,polygonOffset:la,polygonOffsetFactor:la?4:0,polygonOffsetUnits:la?16:0});nen.push(o);dat.push(o)}});
   const gc=await parse(jcay);gc.scene.traverse(o=>{if(o.isMesh){
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,envMapIntensity:0});m.onBeforeCompile=sh=>AGX(sh,true);o.material=m;nen.push(o)}});   // cây: ánh sáng trời dịu hơn người cho tán lá có khối
   canh.add(g.scene,gc.scene);
   if(c.tuong){const gt=await parse(await dem(taiJSON(G+'tuong.json'),ten));gt.scene.traverse(o=>{if(o.isMesh){
    // giữ chất liệu gốc (tượng Phật là kim loại vàng): cho phản chiếu một phòng sáng dịu, không thì kim loại thành màu kem nhạt
    const m=o.material;m.envMap=moiTruong();m.envMapIntensity=.7;if(m.map)m.map.anisotropy=r.capabilities.getMaxAnisotropy();m.onBeforeCompile=sh=>AGX(sh);nen.push(o)}});canh.add(gt.scene)}
   const lh=c.lh?B(c.lh[0],c.lh[1]):null,tinh=[];
   for(const [m,dt,x,y] of c.le)mau(m).then(gl=>{const q=dung(m,gl,canh),p=B(x,y);q.rig.position.set(p.x,c.day+.03,p.z);q.bo.position.set(p.x,c.day+.05,p.z);
    if(lh){const d=new V3().subVectors(lh,p);q.rig.rotation.y=Math.atan2(d.x,d.z)}choi(q,DONG[dt]);if(!GIAM)q.mx.update(Math.random()*3);tinh.push(q)}).catch(()=>{});
   DL[ten]={...a,canh,nen,dat,lh,tinh,nut:[],nutO:'',cao:tt&&tt.cao}}
  function caoTai(ten,u,v){   // độ cao mặt đi tại điểm ảnh (u,v), nội suy từ lưới nướng sẵn
   const g=DL[ten].cao;if(!g)return CANH[ten].day;const x=Math.max(0,Math.min(g.w-1.001,u*g.w-.5)),y=Math.max(0,Math.min(g.h-1.001,v*g.h-.5)),i=x|0,j=y|0,fx=x-i,fy=y-j,z=(a,b)=>g.cm[b*g.w+a]/100;
   return (z(i,j)*(1-fx)+z(i+1,j)*fx)*(1-fy)+(z(i,j+1)*(1-fx)+z(i+1,j+1)*fx)*fy}

  // ---- nút điểm đến: lấy đúng chỗ trên ảnh, bắn tia theo camera ảnh vào cảnh 3D để ra điểm thật
  const ray=new THREE.Raycaster();
  function dungNut(ten){const d=DL[ten],O=ori();d.nutO=O;hotL.innerHTML='';d.nut=[];
   const ds=(window.SS_CANH&&SS_CANH[ten]&&SS_CANH[ten].hot&&SS_CANH[ten].hot[O])||[];
   ds.forEach((h,i)=>{ray.ray.copy(d.tiaAnh(h.x,h.y));const hit=ray.intersectObjects(d.nen,false)[0];const p=hit?hit.point.clone():(()=>{const q=d.tuAnh(h.x,h.y);return B(q.x,q.y)})();
    const a=document.createElement(h.id?'button':'a');a.className='wh'+(h.main?' main':'');if(h.id){a.type='button';a.dataset.w=h.id}else a.href=h.h;
    a.innerHTML='<i class="wh-dot"></i><span class="wh-lb"><i class="wh-ic"></i><b></b><small></small></span>';a.querySelector('b').textContent=h.short||h.t;a.querySelector('small').textContent=h.s||'';a.title=h.t+(h.s?' · '+h.s:'');
    window.ssHudIcon&&ssHudIcon(a.querySelector('.wh-ic'),h);a.style.setProperty('--d',(i*70)+'ms');hotL.appendChild(a);d.nut.push({el:a,p})})}

  // ---- bấm xuống sân để đi; kéo để xoay camera
  let bam=null,dang=null;   // dang: cảnh đang vẽ
  r.domElement.addEventListener('pointerdown',e=>{bam={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}});
  r.domElement.addEventListener('pointerup',e=>{const b=bam;bam=null;if(!b||b.id!==e.pointerId||Math.hypot(e.clientX-b.x,e.clientY-b.y)>7||performance.now()-b.t>600||!dang)return;
   const ls=hall.querySelector('.hall-list.open');if(ls){ls.classList.remove('open');hall.classList.remove('list-open');return}
   const d=DL[dang],rc=r.domElement.getBoundingClientRect(),ndc=new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ndc,cam);
   const hit=ray.intersectObjects(d.nen,false)[0];if(!hit)return;const pb=new V3(hit.point.x,-hit.point.z,hit.point.y),uv=d.raAnh(pb);
   window.ssWorld&&ssWorld.walk(uv[0],uv[1]);ping.position.set(hit.point.x,hit.point.y+.04,hit.point.z);pingT=0});

  // ---- camera: đi theo "Bạn", người dùng kéo để xoay
  let theo=null,daDat=false;
  // mở cùng hướng nhìn với ảnh iso cũ (từ tây nam nhìn lên) cho người quen đường không bị lạc;
  // nghiêng 55° (cao hơn ảnh cũ 42°) để mái cổng không che người vừa vào sân
  function datCamQuanh(t){const n=(dang&&CANH[dang].nghieng||55)*Math.PI/180,h=Math.hypot(DIR.x,DIR.y);cam.position.copy(t).addScaledVector(B(DIR.x/h*Math.cos(n),DIR.y/h*Math.cos(n),Math.sin(n)),xa());dk.target.copy(t)}
  const chieu=new V3(),tam2=new V3();
  function nhan(el,p,cao){chieu.copy(p);chieu.y+=cao;chieu.project(cam);const ok=chieu.z<1&&Math.abs(chieu.x)<1.2&&Math.abs(chieu.y)<1.2;el.style.display=ok?'':'none';
   if(ok){el.style.left=((chieu.x+1)/2*hall.clientWidth).toFixed(1)+'px';el.style.top=((1-chieu.y)/2*hall.clientHeight).toFixed(1)+'px'}}
  const nguoi={};
  function doiCanh(ten){   // sang cảnh khác: bỏ người của cảnh cũ, dời vòng sáng, đặt lại camera quanh "Bạn"
   for(const id in nguoi){const q=nguoi[id];q.q&&boNguoi(q.q);q.tag&&q.tag.remove();delete nguoi[id]}
   const d=DL[ten];d.canh.add(vongVang,ping,DOM);vongVang.visible=false;pingT=9;theo=null;daDat=false;dang=ten;dungNut(ten)
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
  function datTranh(ten){const d=DL[ten],Wd=hall.clientWidth,Hd=hall.clientHeight;
   for(const el of stg.querySelectorAll('.ho-h,.ho-d')){el._g={L:parseFloat(el.style.left)/100,T:parseFloat(el.style.top)/100,w:parseFloat(el.style.width)/100};tranhL.appendChild(el)}
   // tranh đứng như tấm bảng quay về camera, chân ở giữa mép dưới ô tranh trên ảnh: xoay camera thì nhà vẫn đứng đúng chỗ, không méo.
   // Ở góc mặc định (nghiêng 42° như ảnh) khớp đúng ảnh iso: cao thật = cao trên ảnh / cos(42°)
   const ri=new V3(1,0,0).applyQuaternion(cam.quaternion);
   for(const el of tranhL.children){const g=el._g;if(!g)continue;
    const a=d.tuAnh(g.L+g.w/2,g.T+g.w*1.5),p0=B(a.x,a.y),m=g.w*CANH[ten].ow;c1.copy(p0).project(cam);c2.copy(p0).addScaledVector(ri,m).project(cam);c3.copy(p0).add(new V3(0,m/Math.cos(EL),0)).project(cam);
    const x=(c1.x+1)/2*Wd,y=(1-c1.y)/2*Hd,pw=Math.abs(c2.x-c1.x)/2*Wd,ph=Math.abs(c3.y-c1.y)/2*Hd;
    el.style.left=(x-pw/2).toFixed(1)+'px';el.style.top=(y-ph).toFixed(1)+'px';el.style.width=pw.toFixed(1)+'px';el.style.height=ph.toFixed(1)+'px';el.style.zIndex=Math.round((1-c1.z)*1e5)}}   // nhà gần che nhà xa ở mọi góc xoay
  let truoc=performance.now();
  ve=function(ten){const t=performance.now(),dt=Math.min(.05,(t-truoc)/1000);truoc=t;if(dang!==ten||anDi){anDi=false;doiCanh(ten)}
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
    if(d.lh&&(p.a==='chap'||p.a==='lay')&&wp.distanceTo(d.lh)<12){const y=Math.atan2(d.lh.x-wp.x,d.lh.z-wp.z);m.yaw+=Math.atan2(Math.sin(y-m.yaw),Math.cos(y-m.yaw))*Math.min(1,dt*6)}
    m.rig.position.set(wp.x,hz+.03,wp.z);m.rig.rotation.y=m.yaw;m.bo.position.set(wp.x,hz+.05,wp.z);
    const k=DONG[p.a]||'Idle';if(m.dangA!==k){m.dangA=k;choi(m,k)}
    if(k==='Walk'&&m.act.Walk)m.act.Walk.timeScale=THREE.MathUtils.clamp((m.toc||2.2)/2.2,.6,1.6);
    if(!GIAM)m.mx.update(dt);
    if(p.me){vongVang.visible=true;vongVang.position.set(wp.x,hz+.06,wp.z);if(!GIAM)vongVang.material.opacity=.55+.3*Math.sin(t/320);theo=wp}}
   for(const id in nguoi)if(!thay[id]){const q=nguoi[id];q.q&&boNguoi(q.q);q.tag&&q.tag.remove();delete nguoi[id]}
   if(!GIAM)for(const q of d.tinh)q.mx.update(dt);
   // camera đi theo người chơi, giữ nguyên góc người dùng đã xoay
   if(theo){tam2.set(theo.x,theo.y+1,theo.z);   // theo.y = độ cao mặt đứng
    if(!daDat){datCamQuanh(tam2);daDat=true}   // vào cảnh: đặt lại camera quanh "Bạn" (trước đây dòng này lỡ nằm trong chú thích nên camera giữ góc của cảnh trước)
    const k=GIAM?1:1-Math.exp(-dt*3),dv=tam2.clone().sub(dk.target).multiplyScalar(k);dk.target.add(dv);cam.position.add(dv)}
   const v=cam.position.clone().sub(dk.target),R=v.length(),Rm=xa();if(Math.abs(R-Rm)>.01)cam.position.copy(dk.target).addScaledVector(v,(R+(Rm-R)*(GIAM?1:Math.min(1,dt*6)))/R);
   d.canh.fog.near=Rm+8;d.canh.fog.far=Rm+75;   // sương lùi theo khoảng cách camera; bắt đầu sát sau người cho cảnh xa mờ dần
   DOM.position.set(dk.target.x,dk.target.y-2,dk.target.z);bayDom(dt,t);
   dk.update();cam.updateMatrixWorld();   // nhãn tên và nút tính theo camera của khung này, không trễ một nhịp
   for(const id in nguoi){const q=nguoi[id];if(q.tag&&q.wp)nhan(q.tag,q.wp,TO*1.45)}
   if(pingT<1){pingT+=dt/.7;ping.material.opacity=.95*(1-pingT);ping.scale.setScalar(1+pingT*1.2)}else ping.material.opacity=0;
   for(const n of d.nut)nhan(n.el,n.p,0);
   if(CANH[ten].tranh)datTranh(ten);
   if(CANH[ten].anh)datAnh(ten);
   r.render(d.canh,cam)};
  // ---- đoạn phim chuyển cảnh thay màn tải: "Bạn" đi bộ trên đường thật của cảnh (lên chùa: leo bậc đá chân núi), máy quay bám theo.
  // Cảnh đích chưa nạp xong thì đi lại đoạn đường cho tới khi xong. Trả false khi không chiếu được (giảm chuyển động, cảnh chưa có) để 04-01 dùng màn cũ
  const THANG=[[.478,.495],[.458,.455],[.437,.415],[.418,.37],[.404,.33],[.388,.29],[.366,.215]];   // giữa bậc đá lên chùa trên ảnh chân núi, từ chân lên đỉnh
  const VAO={sanh:[.77,.9],ho:[.78,.8],tho:[.86,.62],nha:[.75,.86],dien:[.76,.82],chan:[.95,.52],lang:[.8,.86]};   // ngoài cổng mỗi cảnh, trên đường vào
  const VDI=2.2,tr=document.getElementById('wTrans');   // m/s: nhịp bước của hoạt ảnh Walk
  function co2(){const w=hall.clientWidth,h=hall.clientHeight;if(w!==cw||h!==ch){cw=w;ch=h;r.setSize(w,h)}cam.aspect=w/Math.max(1,h);cam.fov=w<h?50:40;cam.updateProjectionMatrix()}
  window.ss3dPhim=function(kieu,s,sp,xong){
   const cs=kieu==='di'?s:'chan',d=DL[cs],w=window.ssWorld;
   if(hong||GIAM||phim||!tr||!san[cs]||!d||d.loi||!w||!w.duong)return false;
   const av=w.avs?w.avs():{};let mi=null;for(const id in av)if(av[id].me)mi=av[id];
   const mm=mauCua('me',mi||{k:1});if(!CO[mm])return false;
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
   const q=dung(mm,CO[mm],d.canh);choi(q,'Walk');q.mx.update(.31);   // hết pha hoà dần, khung đầu không lộ tư thế dang tay
   if(q.act.Walk)q.act.Walk.timeScale=THREE.MathUtils.clamp(tc/VDI,.7,1.3);
   for(const id in nguoi){const x=nguoi[id].q;if(x)x.rig.visible=x.bo.visible=false}vongVang.visible=false;ping.material.opacity=0;
   tr.prepend(r.domElement);r.domElement.style.opacity='1';cw=-1;
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
    box.appendChild(r.domElement);r.domElement.style.opacity='';cw=-1;anDi=true;phim=null;xong()}
   phim={buoc(){const now=performance.now(),dt=Math.min(.05,(now-t0)/1000);t0=now;t+=dt;
    if(t>=T&&!het&&(san[s]||!CANH[s]||CANH[s].loi||hong)){het=now;r.domElement.style.opacity='0'}   // mờ về đen rồi mới đổi cảnh
    if(het&&now-het>420){xongPhim();return}
    if(!het&&t>=T+.5)t=0;   // cảnh đích còn đang nạp: đi lại quãng đường
    const x=d0+Math.min(t,T+.5)*tc;tai(x,vt);tai(x+.6,vt2);f.subVectors(vt2,vt);f.y=0;if(f.lengthSq()<1e-8)f.set(Math.sin(yaw),0,Math.cos(yaw));
    const y=Math.atan2(f.x,f.z);yaw=dau?y:yaw+Math.atan2(Math.sin(y-yaw),Math.cos(y-yaw))*Math.min(1,dt*6);
    q.rig.position.set(vt.x,vt.y+.03,vt.z);q.rig.rotation.y=yaw;q.bo.position.set(vt.x,vt.y+.05,vt.z);q.mx.update(dt);
    for(const z of d.tinh)z.mx.update(dt);
    const fx=Math.sin(yaw),fz=Math.cos(yaw);
    ph.set(vt.x+fx*K[0]-fz*K[1],vt.y+K[2],vt.z+fz*K[0]+fx*K[1]);nhin.set(vt.x+fx*K[3],vt.y+K[4],vt.z+fz*K[3]);
    if(dau){camM.copy(nhin);cam.position.copy(ph);dau=false}else{const k=1-Math.exp(-dt*4);cam.position.lerp(ph,k);camM.lerp(nhin,k)}
    cam.lookAt(camM);d.canh.fog.near=25;d.canh.fog.far=90;co2();r.render(d.canh,cam)}};
   return true};
  window.ss3dCanh={cam,dk,B,get canh(){return dang&&DL[dang].canh},get raAnh(){return dang&&DL[dang].raAnh},get tuAnh(){return dang&&DL[dang].tuAnh}};   // để thử nghiệm

  // ---- nạp mọi cảnh + đủ 9 nhân vật, rồi dựng sẵn shader một lần để lúc đi và lúc NPC xuất hiện không bị khựng
  const ds=await Promise.all(['ThanhNien','ChiBaBa',...NPC,...new Set(Object.values(CANH).flatMap(c=>c.le.map(x=>x[0])))].map(t=>mau(t).catch(()=>null)));
  // cảnh đầu trước; sau đó lần lượt: ưu tiên cảnh người dùng đang đứng chờ, rồi theo thứ tự trong CANH
  let dau=true;
  for(;;){const s=canhNay(),ten=s&&!san[s]&&!DL[s]?s:dau?DAU:Object.keys(CANH).find(k=>!DL[k]);if(!ten)break;
   try{await napCanh(ten);const d=DL[ten],tam=new THREE.Group();ds.forEach(gl=>gl&&tam.add(SU.clone(gl.scene)));d.canh.add(tam);r.compile(d.canh,cam);   /* không dời camera ở đây: cảnh nạp ngầm xong lúc người dùng đang xem cảnh khác sẽ giật camera về chỗ cũ */d.canh.remove(tam);san[ten]=true}
   catch(e){if(dau)throw e;console.warn('cảnh 3D '+ten+': dùng ảnh tĩnh',e);DL[ten]=DL[ten]||{loi:1};CANH[ten].loi=1}
   if(dau){dau=false;await new Promise(ok=>setTimeout(ok,300));window.ss3dXong=true}}}
}
