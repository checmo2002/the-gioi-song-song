/* ===== Chân núi 3D: sân chùa kiểu đồ chơi đất sét, vẽ thời gian thực bằng three.js thay cho ảnh tĩnh chan-iso =====
   Cảnh nền + ánh sáng nướng sẵn trong Blender (img/3d/canh.json + ảnh webp), cây và người tự chiếu sáng trên máy.
   Đường đi, người chơi khác, NPC, nút điểm đến vẫn do js/04-01-the-gioi-nui.js lo trên lưới 2D của ảnh chan-iso;
   file này chỉ đổi toạ độ ảnh <-> toạ độ 3D rồi vẽ lại cho đẹp. Máy không có WebGL thì giữ nguyên ảnh tĩnh. */
const hall=document.getElementById('hall'),W=document.getElementById('world');
// cần WebGL2 chạy bằng card đồ hoạ thật; trình duyệt vẽ bằng CPU (SwiftShader, llvmpipe: máy rất cũ, máy chủ kiểm tra) quá chậm nên giữ ảnh tĩnh.
// Thử trên máy không có card: thêm ?3d vào địa chỉ.
const coWebGL=(()=>{try{const g=document.createElement('canvas').getContext('webgl2');if(!g)return false;if(new URLSearchParams(location.search).has('3d'))return true;
 const x=g.getExtension('WEBGL_debug_renderer_info'),ten=String(x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER));g.getExtension('WEBGL_lose_context')?.loseContext();
 return !/swiftshader|llvmpipe|softpipe|software/i.test(ten)}catch(e){return false}})();
window.ss3dXong=!coWebGL;   // màn tải (js/01) và kiểm tra hình ảnh chờ cờ này: cảnh 3D đã nạp xong hoặc chắc chắn dùng ảnh tĩnh
if(hall&&W&&coWebGL)khoi();

function khoi(){
 const GIAM=matchMedia('(prefers-reduced-motion: reduce)').matches,CAM_UNG=matchMedia('(pointer:coarse)').matches;
 const box=document.createElement('div');box.className='w3d';box.setAttribute('aria-hidden','true');
 const hotL=document.createElement('div');hotL.className='w3d-hot';const tagL=document.createElement('div');tagL.className='w3d-tags';
 const stg=document.getElementById('wStage');W.insertBefore(box,W.firstChild);stg.after(hotL);hotL.after(tagL);   // nút và tên nằm trên lớp ánh sáng theo giờ (trong wStage)
 let T=null,ve=null,san=false,hong=false;   // three, trình vẽ, đã nạp xong cảnh, nạp lỗi
 // màn chờ phủ cả thanh điều hướng: vào chân núi khi 3D chưa xong thì chờ ở đây, không lộ ảnh 2D
 const phu=document.createElement('div');phu.className='w3d-cho';phu.hidden=true;phu.setAttribute('role','status');
 phu.innerHTML='<b>Song Song</b><small>Đang dựng cảnh chân núi</small><i><s></s></i>';document.body.appendChild(phu);
 // nạp ngay từ lúc mở trang, màn tải đầu trang chờ xong mới mở
 window.ss3dTien=0;nap().catch(e=>{console.warn('chân núi 3D: dùng ảnh tĩnh',e);hong=true;window.ss3dXong=true;window.ss3dTocDo=1});

 function bat(){const w=window.ssWorld;return !!(w&&!hall.hidden&&w.on()&&w.scene()==='chan')}
 function vong(){requestAnimationFrame(vong);const b=bat();
  phu.hidden=!(b&&!san&&!hong);if(!phu.hidden)phu.querySelector('s').style.transform='scaleX('+(window.ss3dTien||0)+')';
  const hien=b&&san;hall.classList.toggle('w3d-on',hien);window.ss3dTocDo=hien?.42:1;if(hien)ve()}
 requestAnimationFrame(vong);

 async function nap(){
  // tiến độ cho màn tải: thư viện + cảnh + cây + 4 ảnh + 9 nhân vật
  let xong=0;const TONG=16,dem=pr=>pr.then(v=>{xong++;window.ss3dTien=Math.min(1,xong/TONG);return v});
  const [THREE,{OrbitControls},{GLTFLoader},{MeshoptDecoder},SU]=await dem(Promise.all([
   import('three'),import('three/addons/controls/OrbitControls.js'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js'),
   import('three/addons/utils/SkeletonUtils.js')]));
  T=THREE;const V3=THREE.Vector3;
  // toạ độ Blender (x, y, z lên) -> three (x, z, -y)
  const B=(x,y,z=0)=>new V3(x,z,-y);
  // ---- camera của ảnh chan-iso (build_chan_goc.py): trực giao 132 m, nghiêng 42°, phương vị -38°, nhìn vào (3, 13, 0)
  const EL=42*Math.PI/180,AZ=-38*Math.PI/180,OW=132,OH=88;
  const DIR=new V3(Math.sin(AZ)*Math.cos(EL),-Math.cos(AZ)*Math.cos(EL),Math.sin(EL)),C0=new V3(3,13,0).addScaledVector(DIR,160);
  const FW=DIR.clone().negate(),RI=new V3().crossVectors(FW,new V3(0,0,1)).normalize(),UP=new V3().crossVectors(RI,FW).normalize();
  const raAnh=pb=>{const d=pb.clone().sub(C0);return [.5+d.dot(RI)/OW,.5-d.dot(UP)/OH]};   // điểm Blender -> toạ độ ảnh 0..1
  const tuAnh=(u,v,z=0)=>{const o=C0.clone().addScaledVector(RI,(u-.5)*OW).addScaledVector(UP,(.5-v)*OH);return o.addScaledVector(FW,(z-o.z)/FW.z)};   // ảnh -> mặt đất Blender
  const tiaAnh=(u,v)=>{const o=C0.clone().addScaledVector(RI,(u-.5)*OW).addScaledVector(UP,(.5-v)*OH);return new THREE.Ray(B(o.x,o.y,o.z),B(FW.x,FW.y,FW.z))};
  const LH=B(0,-8);

  // ---- trình vẽ
  const r=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(CAM_UNG?1.75:2,devicePixelRatio||1));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.NoToneMapping;r.toneMappingExposure=1.08;
  // không dùng bóng thời gian thực: nền cỏ chân núi dốc, mặt hứng bóng phẳng cắt qua gây vệt đen nhấp nháy; bóng cây đã nướng sẵn trong ảnh nền
  box.appendChild(r.domElement);
  const canh=new THREE.Scene(),NEN=new THREE.Color('#b9cc8c');canh.background=NEN;canh.fog=new THREE.Fog(NEN,55,110);
  const cam=new THREE.PerspectiveCamera(35,1,.1,400);
  const dk=new OrbitControls(cam,r.domElement);dk.enableDamping=!GIAM;dk.dampingFactor=.08;dk.rotateSpeed=.7;dk.enableZoom=false;dk.enablePan=false;
  dk.minPolarAngle=15*Math.PI/180;dk.maxPolarAngle=68*Math.PI/180;
  const ori=()=>hall.clientWidth/Math.max(1,hall.clientHeight)<.9?'v':'h';
  const xa=()=>THREE.MathUtils.clamp(30/(window.ssZoomK?ssZoomK(ori()):1),7,42);   // nút góc nhìn, cuộn chuột, chụm ngón (js/16-goc-nhin.js) đổi khoảng cách camera
  let cw=-1,ch=-1;   // cảnh nạp sớm lúc sảnh còn ẩn (cỡ 0) nên đo lại mỗi khi hiện
  function co(){const w=hall.clientWidth,h=hall.clientHeight;if(w===cw&&h===ch)return;cw=w;ch=h;cam.aspect=w/Math.max(1,h);cam.fov=w<h?48:35;cam.updateProjectionMatrix();r.setSize(w,h)}
  co();addEventListener('resize',co);

  // ---- ánh sáng cho người và cây (cảnh nền đã nướng sẵn)
  const TAM=B(0,-9),NANG=new V3(.394,.616,-.682).normalize();
  const den=new THREE.DirectionalLight(new THREE.Color(1,.9,.77),3.0);den.position.copy(TAM).addScaledVector(NANG,80);den.target.position.copy(TAM);
  canh.add(den,den.target,new THREE.HemisphereLight(0xfff1dc,0xe8d2b0,4.2));
  const AGX=(sh,them)=>{sh.fragmentShader=THREE.ShaderChunk.tonemapping_pars_fragment+'\n'+sh.fragmentShader.replace('texture2D( map, vMapUv )','texture2D( map, vMapUv, -1.0 )')+'';
   if(them)sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\n irradiance *= 0.45;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );')};   // tự áp AgX như ảnh Blender

  // ---- nạp: glTF nhúng sẵn dữ liệu (JSON + base64, chạy được cả trên bản thử claude.ai)
  const ld=new GLTFLoader();ld.setMeshoptDecoder(MeshoptDecoder);const G='img/3d/';
  async function taiJSON(url){const q=await fetch(url);if(!q.ok)throw new Error(url+' '+q.status);return q.json()}
  function thanhGLB(j){const b64=j.buffers[0].uri.split(',')[1];delete j.buffers[0].uri;const s=atob(b64),bin=new Uint8Array(s.length);for(let i=0;i<s.length;i++)bin[i]=s.charCodeAt(i);
   const js=new TextEncoder().encode(JSON.stringify(j)),pj=(4-js.length%4)%4,pb=(4-bin.length%4)%4,L=12+8+js.length+pj+8+bin.length+pb;
   const out=new ArrayBuffer(L),dv=new DataView(out),u8=new Uint8Array(out);dv.setUint32(0,0x46546C67,true);dv.setUint32(4,2,true);dv.setUint32(8,L,true);
   dv.setUint32(12,js.length+pj,true);dv.setUint32(16,0x4E4F534A,true);u8.set(js,20);u8.fill(0x20,20+js.length,20+js.length+pj);
   const o=20+js.length+pj;dv.setUint32(o,bin.length+pb,true);dv.setUint32(o+4,0x004E4942,true);u8.set(bin,o+8);return out}   // fetch data: URI hay bị iPhone chặn
  const parse=j=>new Promise((ok,loi)=>ld.parse(thanhGLB(j),'',ok,loi));
  const taiAnh=ten=>new Promise((ok,loi)=>new THREE.TextureLoader().load(G+ten+'.webp',t=>{t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=r.capabilities.getMaxAnisotropy();ok(t)},undefined,loi));
  const anhTo=ten=>CAM_UNG?ten+'-2k':ten;   // ảnh 4096 chỉ cho máy tính; điện thoại dùng 2048 để không tràn bộ nhớ đồ hoạ
  const [jc,jcay,anh]=await Promise.all([dem(taiJSON(G+'canh.json')),dem(taiJSON(G+'cay.json')),Promise.all(['nen-2k',anhTo('vat-0'),'vat-1-2k',anhTo('vat-3')].map(t=>dem(taiAnh(t))))]);
  const tex={'nuong-nen':anh[0],'nuong-vat-0':anh[1],'nuong-vat-1':anh[2],'nuong-vat-3':anh[3]};
  const g=await parse(jc),nen=[];g.scene.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({map:tex[o.material.name],toneMapped:false,side:THREE.DoubleSide,fog:true});nen.push(o)}});
  const gc=await parse(jcay);gc.scene.traverse(o=>{if(o.isMesh){
   const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,envMapIntensity:0});m.onBeforeCompile=sh=>AGX(sh,true);o.material=m;nen.push(o)}});   // cây: ánh sáng trời dịu hơn người cho tán lá có khối
  canh.add(g.scene,gc.scene);

  // ---- nhân vật: mỗi mẫu nạp một lần, nhân bản cho từng người
  const MAU={},ANHB=r.capabilities.getMaxAnisotropy();
  function mau(ten){return MAU[ten]||(MAU[ten]=dem(taiJSON(G+'nv/'+ten+'.json')).then(parse).then(gl=>{gl.scene.traverse(o=>{if(!o.isMesh)return;const m=o.material;m.metalness=0;m.roughness=.78;m.envMapIntensity=0;
     if(m.map&&CAM_UNG&&m.map.image&&m.map.image.width>1536){const c=document.createElement('canvas');c.width=c.height=1536;c.getContext('2d').drawImage(m.map.image,0,0,1536,1536);m.map.image=c;m.map.needsUpdate=true}
     if(m.map)m.map.anisotropy=ANHB;m.onBeforeCompile=sh=>AGX(sh)});return gl}))}
  const BONG=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
   gr.addColorStop(0,'rgba(70,45,25,.75)');gr.addColorStop(.45,'rgba(70,45,25,.35)');gr.addColorStop(1,'rgba(70,45,25,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
  const DONG={di:'Walk',dung:'Idle',chap:'Pray',lay:'Bow',ngoi:'Kneel'},TO=1.6;   // người to hơn thật 1,6 lần như hình nhân vật trong game
  function dung(ten,gl){const rig=SU.clone(gl.scene);rig.scale.multiplyScalar(TO);rig.traverse(o=>{if(o.isMesh)o.frustumCulled=false});
   const bo=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.25),new THREE.MeshBasicMaterial({map:BONG,transparent:true,depthWrite:false,toneMapped:false,opacity:.55}));bo.rotation.x=-Math.PI/2;bo.renderOrder=1;
   const q={ten,rig,bo,mx:new THREE.AnimationMixer(rig),act:{},dang:null,yaw:0};for(const c of gl.animations)q.act[c.name]=q.mx.clipAction(c);canh.add(rig,bo);return q}
  function choi(q,k){const a=q.act[k]||(k==='Bow'?q.act.Pray:null)||q.act.Idle;if(!a||q.dang===a)return;a.reset().fadeIn(.3).play();if(q.dang)q.dang.fadeOut(.3);q.dang=a;
   const mot=a===q.act.Bow||a===q.act.Kneel;a.setLoop(mot?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=a===q.act.Kneel;
   if(GIAM){q.mx.update(.6);}}   // giảm chuyển động: đứng yên ở một tư thế
  function boNguoi(q){canh.remove(q.rig,q.bo);q.mx.stopAllAction()}
  // người đứng lễ quanh lư hương (trang trí cố định, giống ảnh render đã duyệt)
  const tinh=[];
  const LE=[['BaCu','chap',-1.7,-11.45],['CoAoDai','chap',1.7,-11.45],['OngAoNau','ngoi',0,-12.05],['CuuChienBinh','dung',-3.8,-12.6]];
  for(const [ten,a,x,y] of LE)mau(ten).then(gl=>{const q=dung(ten,gl),p=B(x,y);q.rig.position.set(p.x,.03,p.z);q.bo.position.set(p.x,.05,p.z);const d=new V3().subVectors(LH,p);q.rig.rotation.y=Math.atan2(d.x,d.z);choi(q,DONG[a]);if(!GIAM)q.mx.update(Math.random()*3);tinh.push(q)}).catch(()=>{});
  // người trong thế giới (bạn, người viếng khác, NPC): mẫu theo nam/nữ, NPC theo thứ tự
  const NPC=['SuThay','PhuNuTim','HocSinh'];
  function mauCua(id,p){if(id.indexOf('npc-')===0)return NPC[(+id.split('-').pop()||0)%NPC.length];return p.k===1?'ThanhNien':'ChiBaBa'}
  const nguoi={};
  // ---- vòng ring vàng dưới chân "Bạn" và vòng chạm đất khi bấm
  const vongVang=new THREE.Mesh(new THREE.RingGeometry(.42,.6,48),new THREE.MeshBasicMaterial({color:0xFFD98A,transparent:true,opacity:.85,toneMapped:false,depthWrite:false}));vongVang.rotation.x=-Math.PI/2;vongVang.renderOrder=2;vongVang.visible=false;canh.add(vongVang);
  const ping=new THREE.Mesh(new THREE.RingGeometry(.3,.42,40),new THREE.MeshBasicMaterial({color:0xFFE7A8,transparent:true,opacity:0,toneMapped:false,depthWrite:false}));ping.rotation.x=-Math.PI/2;ping.renderOrder=2;canh.add(ping);let pingT=9;

  // ---- nút điểm đến: lấy đúng chỗ trên ảnh, bắn tia theo camera ảnh vào cảnh 3D để ra điểm thật
  const ray=new THREE.Raycaster();let nut=[],nutO='';
  function dungNut(){const w=window.ssWorld,O=ori();nutO=O;hotL.innerHTML='';nut=[];
   const ds=(window.SS_CANH&&SS_CANH.chan&&SS_CANH.chan.hot&&SS_CANH.chan.hot[O])||[];
   ds.forEach((h,i)=>{ray.ray.copy(tiaAnh(h.x,h.y));const hit=ray.intersectObjects(nen,false)[0];const p=hit?hit.point.clone():(()=>{const q=tuAnh(h.x,h.y);return B(q.x,q.y)})();
    const a=document.createElement(h.id?'button':'a');a.className='wh'+(h.main?' main':'');if(h.id){a.type='button';a.dataset.w=h.id}else a.href=h.h;
    a.innerHTML='<i class="wh-dot"></i><span class="wh-lb"><i class="wh-ic"></i><b></b><small></small></span>';a.querySelector('b').textContent=h.short||h.t;a.querySelector('small').textContent=h.s||'';a.title=h.t+(h.s?' · '+h.s:'');
    window.ssHudIcon&&ssHudIcon(a.querySelector('.wh-ic'),h);a.style.setProperty('--d',(i*70)+'ms');hotL.appendChild(a);nut.push({el:a,p})})}
  dungNut();

  // ---- bấm xuống sân để đi; kéo để xoay camera
  let bam=null;
  r.domElement.addEventListener('pointerdown',e=>{bam={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}});
  r.domElement.addEventListener('pointerup',e=>{const b=bam;bam=null;if(!b||b.id!==e.pointerId||Math.hypot(e.clientX-b.x,e.clientY-b.y)>7||performance.now()-b.t>600)return;
   const ls=hall.querySelector('.hall-list.open');if(ls){ls.classList.remove('open');hall.classList.remove('list-open');return}
   const rc=r.domElement.getBoundingClientRect(),ndc=new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ndc,cam);
   const hit=ray.intersectObjects(nen,false)[0];if(!hit)return;const pb=new V3(hit.point.x,-hit.point.z,hit.point.y),uv=raAnh(pb);
   window.ssWorld&&ssWorld.walk(uv[0],uv[1]);ping.position.set(hit.point.x,hit.point.y+.06,hit.point.z);pingT=0});

  // ---- camera: đi theo "Bạn", người dùng kéo để xoay
  let theo=null,daDat=false;
  // mở cùng hướng nhìn với ảnh chan-iso cũ (nghiêng 42°, từ tây nam nhìn lên núi) cho người quen đường không bị lạc
  // nghiêng 55° (cao hơn ảnh cũ 42°) để mái cổng tam quan không che người vừa vào sân
  function datCamQuanh(t){const n=55*Math.PI/180,h=Math.hypot(DIR.x,DIR.y);cam.position.copy(t).addScaledVector(B(DIR.x/h*Math.cos(n),DIR.y/h*Math.cos(n),Math.sin(n)),xa());dk.target.copy(t)}
  const chieu=new V3(),tam2=new V3();
  function nhan(el,p,cao){chieu.copy(p);chieu.y+=cao;chieu.project(cam);const ok=chieu.z<1&&Math.abs(chieu.x)<1.2&&Math.abs(chieu.y)<1.2;el.style.display=ok?'':'none';
   if(ok){el.style.left=((chieu.x+1)/2*hall.clientWidth).toFixed(1)+'px';el.style.top=((1-chieu.y)/2*hall.clientHeight).toFixed(1)+'px'}}
  let truoc=performance.now();
  ve=function(){const t=performance.now(),dt=Math.min(.05,(t-truoc)/1000);truoc=t;const w=window.ssWorld,av=w.avs?w.avs():{},thay={};
   co();if(nutO!==ori())dungNut();
   for(const id in av){const p=av[id];thay[id]=1;const ten=mauCua(id,p);let q=nguoi[id];
    if(q&&q.ten!==ten&&q.q){boNguoi(q.q);q.tag&&q.tag.remove();q=null}
    if(!q){q=nguoi[id]={ten,q:null,tag:null};mau(ten).then(gl=>{if(nguoi[id]!==q)return;q.q=dung(ten,gl);q.q.dangA=''}).catch(()=>{});
     if(id.indexOf('npc-')!==0){q.tag=document.createElement('div');q.tag.className='w3d-tag'+(p.me?' me':'');q.tag.innerHTML='<span class="t"></span><span class="b"></span>';tagL.appendChild(q.tag)}}
    const pb=tuAnh(p.x,p.y),wp=B(pb.x,pb.y),m=q.q;q.wp=wp;
    if(q.tag){q.tag.querySelector('.t').textContent=(p.el.querySelector('.wa-tag')||{}).textContent||'';const bb=p.el.querySelector('.wa-bub');q.tag.querySelector('.b').textContent=bb?bb.textContent:''}
    if(!m)continue;
    const cu=m.rig.position,dx=wp.x-cu.x,dz=wp.z-cu.z,dd=Math.hypot(dx,dz);
    if(!m.daDat||dd>6){m.daDat=1}else if(dd>.004&&p.a==='di'){const y=Math.atan2(dx,dz);m.yaw+=Math.atan2(Math.sin(y-m.yaw),Math.cos(y-m.yaw))*Math.min(1,dt*8);m.toc=dd/Math.max(dt,1e-3)}
    if((p.a==='chap'||p.a==='lay')&&wp.distanceTo(LH)<12){const y=Math.atan2(LH.x-wp.x,LH.z-wp.z);m.yaw+=Math.atan2(Math.sin(y-m.yaw),Math.cos(y-m.yaw))*Math.min(1,dt*6)}
    m.rig.position.set(wp.x,.03,wp.z);m.rig.rotation.y=m.yaw;m.bo.position.set(wp.x,.05,wp.z);
    const k=DONG[p.a]||'Idle';if(m.dangA!==k){m.dangA=k;choi(m,k)}
    if(k==='Walk'&&m.act.Walk)m.act.Walk.timeScale=THREE.MathUtils.clamp((m.toc||2.2)/2.2,.6,1.6);
    if(!GIAM)m.mx.update(dt);
    if(p.me){vongVang.visible=true;vongVang.position.set(wp.x,.06,wp.z);if(!GIAM)vongVang.material.opacity=.55+.3*Math.sin(t/320);theo=wp}}
   for(const id in nguoi)if(!thay[id]){const q=nguoi[id];q.q&&boNguoi(q.q);q.tag&&q.tag.remove();delete nguoi[id]}
   if(!GIAM)for(const q of tinh)q.mx.update(dt);
   // camera đi theo người chơi, giữ nguyên góc người dùng đã xoay
   if(theo){tam2.set(theo.x,theo.y+1,theo.z);if(!daDat){datCamQuanh(tam2);daDat=true}
    const k=GIAM?1:1-Math.exp(-dt*3),d=tam2.clone().sub(dk.target).multiplyScalar(k);dk.target.add(d);cam.position.add(d)}
   const v=cam.position.clone().sub(dk.target),R=v.length(),Rm=xa();if(Math.abs(R-Rm)>.01)cam.position.copy(dk.target).addScaledVector(v,(R+(Rm-R)*(GIAM?1:Math.min(1,dt*6)))/R);
   dk.update();cam.updateMatrixWorld();   // nhãn tên và nút tính theo camera của khung này, không trễ một nhịp
   for(const id in nguoi){const q=nguoi[id];if(q.tag&&q.wp)nhan(q.tag,q.wp,TO*1.45)}
   if(pingT<1){pingT+=dt/.7;ping.material.opacity=.95*(1-pingT);ping.scale.setScalar(1+pingT*1.2)}else ping.material.opacity=0;
   for(const n of nut)nhan(n.el,n.p,0);
   r.render(canh,cam)};
  window.ss3dCanh={cam,dk,canh,raAnh,tuAnh,B};   // để thử nghiệm
  // nạp đủ 9 nhân vật rồi dựng sẵn shader một lần, để lúc đi và lúc NPC xuất hiện không bị khựng
  const ds=await Promise.all(['ThanhNien','ChiBaBa',...LE.map(x=>x[0]),...NPC].map(t=>mau(t).catch(()=>null)));
  const tam=new THREE.Group();ds.forEach(gl=>gl&&tam.add(SU.clone(gl.scene)));canh.add(tam);datCamQuanh(B(0,-9));r.compile(canh,cam);canh.remove(tam);
  san=true;await new Promise(ok=>setTimeout(ok,300));window.ss3dXong=true}
}
