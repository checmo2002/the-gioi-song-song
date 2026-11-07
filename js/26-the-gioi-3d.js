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
const CANH={
 sanh:{ten:'sảnh',tgt:[2,18],ow:88,tam:[2,10],le:[],lh:null,toc:.42,tuong:1,day:.09,xa:60},
 chan:{ten:'chân núi',tgt:[3,13],ow:132,tam:[0,-9],lh:[0,-8],toc:.42,day:0,xa:30,
  le:[['BaCu','chap',-1.7,-11.45],['CoAoDai','chap',1.7,-11.45],['OngAoNau','ngoi',0,-12.05],['CuuChienBinh','dung',-3.8,-12.6]]},
 tho:{ten:'nhà thờ',tgt:[2,1.5],ow:42,tam:[2,1.5],le:[],lh:null,toc:.42,day:0,xa:30,cao:1,goc:40}};
const THU=t=>'img/3d/'+t+'/';
if(hall&&W&&coWebGL)khoi();

function khoi(){
 const GIAM=matchMedia('(prefers-reduced-motion: reduce)').matches,CAM_UNG=matchMedia('(pointer:coarse)').matches;
 const box=document.createElement('div');box.className='w3d';box.setAttribute('aria-hidden','true');
 const hotL=document.createElement('div');hotL.className='w3d-hot';const tagL=document.createElement('div');tagL.className='w3d-tags';
 const stg=document.getElementById('wStage');W.insertBefore(box,W.firstChild);stg.after(hotL);hotL.after(tagL);   // nút và tên nằm trên lớp ánh sáng theo giờ (trong wStage)
 let ve=null,hong=false,anDi=true,tienCanh=null;const san={};   // trình vẽ, nạp lỗi, cảnh đã nạp xong
 // màn chờ phủ cả thanh điều hướng: vào cảnh 3D chưa nạp xong thì chờ ở đây, không lộ ảnh 2D
 const phu=document.createElement('div');phu.className='w3d-cho';phu.hidden=true;phu.setAttribute('role','status');
 phu.innerHTML='<b>Song Song</b><small></small><i><s></s></i>';document.body.appendChild(phu);
 // nạp ngay từ lúc mở trang, màn tải đầu trang chờ xong mới mở
 window.ss3dTien=0;nap().catch(e=>{console.warn('thế giới 3D: dùng ảnh tĩnh',e);hong=true;window.ss3dXong=true;window.ss3dTocDo=1});

 function canhNay(){const w=window.ssWorld;if(!w||hall.hidden||!w.on())return null;const s=w.scene();return CANH[s]?s:null}
 function vong(){requestAnimationFrame(vong);const s=canhNay();
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
  const [THREE,{OrbitControls},{GLTFLoader},{MeshoptDecoder},SU]=await dem(Promise.all([
   import('three'),import('three/addons/controls/OrbitControls.js'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js'),
   import('three/addons/utils/SkeletonUtils.js')]));
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
  const NEN=new THREE.Color('#b9cc8c');
  const cam=new THREE.PerspectiveCamera(35,1,.1,400);
  const dk=new OrbitControls(cam,r.domElement);dk.enableDamping=!GIAM;dk.dampingFactor=.08;dk.rotateSpeed=.7;dk.enableZoom=false;dk.enablePan=false;
  dk.minPolarAngle=15*Math.PI/180;dk.maxPolarAngle=68*Math.PI/180;
  const ori=()=>hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h';
  const xa=()=>{const g=dang?CANH[dang].xa:CANH[DAU].xa;return THREE.MathUtils.clamp(g/(window.ssZoomK?ssZoomK(ori()):1),7,g*1.4)};   // nút góc nhìn, cuộn chuột, chụm ngón (js/16-goc-nhin.js) đổi khoảng cách camera
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

  // ---- nhân vật: mỗi mẫu nạp một lần, dùng chung mọi cảnh, nhân bản cho từng người
  const MAU={},ANHB=r.capabilities.getMaxAnisotropy();
  function mau(ten){return MAU[ten]||(MAU[ten]=dem(taiJSON('img/3d/nv/'+ten+'.json')).then(parse).then(gl=>{gl.scene.traverse(o=>{if(!o.isMesh)return;const m=o.material;m.metalness=0;m.roughness=.78;m.envMapIntensity=0;
     if(m.map&&CAM_UNG&&m.map.image&&m.map.image.width>1536){const c=document.createElement('canvas');c.width=c.height=1536;c.getContext('2d').drawImage(m.map.image,0,0,1536,1536);m.map.image=c;m.map.needsUpdate=true}
     if(m.map)m.map.anisotropy=ANHB;m.onBeforeCompile=sh=>AGX(sh)});return gl}))}
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
   const c=CANH[ten],G=THU(ten),a=anhCua(c),canh=new THREE.Scene();canh.background=NEN;canh.fog=new THREE.Fog(NEN,55,110);
   const TAM=B(c.tam[0],c.tam[1]),den=new THREE.DirectionalLight(new THREE.Color(1,.9,.77),3.0);den.position.copy(TAM).addScaledVector(NANG,80);den.target.position.copy(TAM);
   canh.add(den,den.target,new THREE.HemisphereLight(0xfff1dc,0xe8d2b0,4.2));
   const [jc,jcay,anh,tt]=await Promise.all([dem(taiJSON(G+'canh.json'),ten),dem(taiJSON(G+'cay.json'),ten),Promise.all(['nen-2k',anhTo('vat-0'),'vat-1-2k',anhTo('vat-3')].map(t=>dem(taiAnh(G+t+'.webp'),ten))),
    c.cao?dem(taiJSON(G+'thong-tin.json'),ten):null]);
   const tex={'nuong-nen':anh[0],'nuong-vat-0':anh[1],'nuong-vat-1':anh[2],'nuong-vat-3':anh[3]};
   const g=await parse(jc),nen=[];g.scene.traverse(o=>{if(o.isMesh){const la=o.material.name==='nuong-nen';
    // tấm nền phẳng nằm sát dưới cỏ và sân: đẩy lùi trong bộ đệm sâu để lớp trên luôn thắng, không chập chờn
    o.material=new THREE.MeshBasicMaterial({map:tex[o.material.name],toneMapped:false,side:THREE.DoubleSide,fog:true,polygonOffset:la,polygonOffsetFactor:la?4:0,polygonOffsetUnits:la?16:0});nen.push(o)}});
   const gc=await parse(jcay);gc.scene.traverse(o=>{if(o.isMesh){
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,envMapIntensity:0});m.onBeforeCompile=sh=>AGX(sh,true);o.material=m;nen.push(o)}});   // cây: ánh sáng trời dịu hơn người cho tán lá có khối
   canh.add(g.scene,gc.scene);
   if(c.tuong){const gt=await parse(await dem(taiJSON(G+'tuong.json'),ten));gt.scene.traverse(o=>{if(o.isMesh){
    const m=new THREE.MeshStandardMaterial({map:o.material.map||null,color:o.material.map?0xffffff:o.material.color,roughness:.75,metalness:0,envMapIntensity:0});
    if(m.map){m.map.colorSpace=THREE.SRGBColorSpace;m.map.anisotropy=r.capabilities.getMaxAnisotropy()}m.onBeforeCompile=sh=>AGX(sh);o.material=m;nen.push(o)}});canh.add(gt.scene)}
   const lh=c.lh?B(c.lh[0],c.lh[1]):null,tinh=[];
   for(const [m,dt,x,y] of c.le)mau(m).then(gl=>{const q=dung(m,gl,canh),p=B(x,y);q.rig.position.set(p.x,c.day+.03,p.z);q.bo.position.set(p.x,c.day+.05,p.z);
    if(lh){const d=new V3().subVectors(lh,p);q.rig.rotation.y=Math.atan2(d.x,d.z)}choi(q,DONG[dt]);if(!GIAM)q.mx.update(Math.random()*3);tinh.push(q)}).catch(()=>{});
   DL[ten]={...a,canh,nen,lh,tinh,nut:[],nutO:'',cao:tt&&tt.cao}}
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
  function datCamQuanh(t){const n=55*Math.PI/180,h=Math.hypot(DIR.x,DIR.y);cam.position.copy(t).addScaledVector(B(DIR.x/h*Math.cos(n),DIR.y/h*Math.cos(n),Math.sin(n)),xa());dk.target.copy(t)}
  const chieu=new V3(),tam2=new V3();
  function nhan(el,p,cao){chieu.copy(p);chieu.y+=cao;chieu.project(cam);const ok=chieu.z<1&&Math.abs(chieu.x)<1.2&&Math.abs(chieu.y)<1.2;el.style.display=ok?'':'none';
   if(ok){el.style.left=((chieu.x+1)/2*hall.clientWidth).toFixed(1)+'px';el.style.top=((1-chieu.y)/2*hall.clientHeight).toFixed(1)+'px'}}
  const nguoi={};
  function doiCanh(ten){   // sang cảnh khác: bỏ người của cảnh cũ, dời vòng sáng, đặt lại camera quanh "Bạn"
   for(const id in nguoi){const q=nguoi[id];q.q&&boNguoi(q.q);q.tag&&q.tag.remove();delete nguoi[id]}
   const d=DL[ten];d.canh.add(vongVang,ping);vongVang.visible=false;pingT=9;theo=null;daDat=false;dang=ten;dungNut(ten)
   const g=CANH[ten].goc,h=Math.hypot(DIR.x,DIR.y),t0=Math.atan2(DIR.x/h,DIR.y/h);   // hướng camera ảnh theo góc phương vị của OrbitControls
   dk.minAzimuthAngle=g?t0-g*Math.PI/180:-Infinity;dk.maxAzimuthAngle=g?t0+g*Math.PI/180:Infinity;dk.maxPolarAngle=(g?60:68)*Math.PI/180}
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
   if(theo){tam2.set(theo.x,theo.y+1,theo.z);   // theo.y = độ cao mặt đứngif(!daDat){datCamQuanh(tam2);daDat=true}
    const k=GIAM?1:1-Math.exp(-dt*3),dv=tam2.clone().sub(dk.target).multiplyScalar(k);dk.target.add(dv);cam.position.add(dv)}
   const v=cam.position.clone().sub(dk.target),R=v.length(),Rm=xa();if(Math.abs(R-Rm)>.01)cam.position.copy(dk.target).addScaledVector(v,(R+(Rm-R)*(GIAM?1:Math.min(1,dt*6)))/R);
   d.canh.fog.near=Rm+25;d.canh.fog.far=Rm+80;   // sương lùi theo khoảng cách camera
   dk.update();cam.updateMatrixWorld();   // nhãn tên và nút tính theo camera của khung này, không trễ một nhịp
   for(const id in nguoi){const q=nguoi[id];if(q.tag&&q.wp)nhan(q.tag,q.wp,TO*1.45)}
   if(pingT<1){pingT+=dt/.7;ping.material.opacity=.95*(1-pingT);ping.scale.setScalar(1+pingT*1.2)}else ping.material.opacity=0;
   for(const n of d.nut)nhan(n.el,n.p,0);
   r.render(d.canh,cam)};
  window.ss3dCanh={cam,dk,B,get canh(){return dang&&DL[dang].canh},get raAnh(){return dang&&DL[dang].raAnh},get tuAnh(){return dang&&DL[dang].tuAnh}};   // để thử nghiệm

  // ---- nạp mọi cảnh + đủ 9 nhân vật, rồi dựng sẵn shader một lần để lúc đi và lúc NPC xuất hiện không bị khựng
  const ds=await Promise.all(['ThanhNien','ChiBaBa',...NPC,...new Set(Object.values(CANH).flatMap(c=>c.le.map(x=>x[0])))].map(t=>mau(t).catch(()=>null)));
  // cảnh đầu trước; sau đó lần lượt: ưu tiên cảnh người dùng đang đứng chờ, rồi theo thứ tự trong CANH
  let dau=true;
  for(;;){const s=canhNay(),ten=s&&!san[s]&&!DL[s]?s:dau?DAU:Object.keys(CANH).find(k=>!DL[k]);if(!ten)break;
   try{await napCanh(ten);const d=DL[ten],tam=new THREE.Group();ds.forEach(gl=>gl&&tam.add(SU.clone(gl.scene)));d.canh.add(tam);datCamQuanh(B(...CANH[ten].tam));r.compile(d.canh,cam);d.canh.remove(tam);san[ten]=true}
   catch(e){if(dau)throw e;console.warn('cảnh 3D '+ten+': dùng ảnh tĩnh',e);DL[ten]=DL[ten]||{loi:1};CANH[ten].loi=1}
   if(dau){dau=false;await new Promise(ok=>setTimeout(ok,300));window.ss3dXong=true}}}
}
