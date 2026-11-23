/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Âm thanh thanh tịnh (tạo bằng Web Audio, không dùng file) ---------------- */
(function(){const btn=$('#sndBtn'),wrap=$('#snd');if(!btn)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC){wrap.hidden=true;return}
  let ctx=null,master=null,verb=null,on=false,timers=[],built=false;let VOL=.07;try{const v=parseFloat(localStorage.getItem('ss-vol'));if(v>=0&&v<=.3)VOL=v}catch(e){}
  // Ngũ cung Cung Sol (Sol La Si Rê Mi) — thang âm quen thuộc của nhạc cổ phương Đông
  const N=m=>440*Math.pow(2,(m-69)/12);
  const SC=[43,45,47,50,52,55,57,59,62,64,67,69,71,74,76,79];// G2 → G5 ngũ cung
  const ZH=SC.slice(5);// tầm đàn tranh G3→G5
  function impulse(sec,decay){const r=ctx.sampleRate,len=r*sec,b=ctx.createBuffer(2,len,r);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++){const env=Math.pow(1-i/len,decay);d[i]=(Math.random()*2-1)*env*(i<r*.02?i/(r*.02):1)}}return b}
  // tiếng dây gảy: mô hình Karplus–Strong, dựng sẵn từng nốt
  const ksCache={};
  function ks(midi){if(ksCache[midi])return ksCache[midi];const r=ctx.sampleRate,f=N(midi),len=Math.floor(r*4.2),P=Math.max(2,Math.round(r/f)),buf=ctx.createBuffer(1,len,r),d=buf.getChannelData(0);
    const ring=new Float32Array(P);for(let i=0;i<P;i++){const x=i/P;ring[i]=(Math.random()*2-1)*.6+(x<.12?(1-x/.12)*.7:0)}// gảy gần ngựa đàn: sáng
    let idx=0,prev=0;const damp=.4985+.0012*Math.min(1,(midi-55)/24);// nốt cao tắt nhanh hơn
    for(let i=0;i<len;i++){const cur=ring[idx];const nxt=ring[(idx+1)%P];const v=damp*(cur+nxt);ring[idx]=v*.999+(prev-v)*.002;prev=v;d[i]=cur;idx=(idx+1)%P}
    for(let i=0;i<300;i++)d[i]*=i/300;return ksCache[midi]=buf}
  function build(){ctx=ssAm();master=ctx.createGain();master.gain.value=0;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;master.connect(comp);comp.connect(ctx.destination);
    verb=ctx.createConvolver();verb.buffer=impulse(6.5,3);const vg=ctx.createGain();vg.gain.value=.5;verb.connect(vg);vg.connect(master);
    // gió rất nhẹ, như sân chùa vắng
    const nb=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),nd=nb.getChannelData(0);let last=0;for(let i=0;i<nd.length;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;nd[i]=last*3.5}
    const ns=ctx.createBufferSource();ns.buffer=nb;ns.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=450;bp.Q.value=.6;const wg=ctx.createGain();wg.gain.value=.025;
    const wl=ctx.createOscillator();wl.frequency.value=.06;const wlg=ctx.createGain();wlg.gain.value=.018;wl.connect(wlg);wlg.connect(wg.gain);ns.connect(bp);bp.connect(wg);wg.connect(master);ns.start();wl.start();
    ZH.forEach(ks);built=true}
  // đàn tranh: gảy, nhấn luyến (bend), có thân đàn cộng hưởng
  function zheng(midi,vel=1,when=0,bend=0){if(!ctx)return;const t=ctx.currentTime+when;const src=ctx.createBufferSource();src.buffer=ks(midi);
    if(bend){src.playbackRate.setValueAtTime(1,t+.18);src.playbackRate.linearRampToValueAtTime(Math.pow(2,bend/12),t+.42);if(Math.random()<.5)src.playbackRate.linearRampToValueAtTime(1,t+.9)}
    const body=ctx.createBiquadFilter();body.type='peaking';body.frequency.value=320;body.Q.value=1.2;body.gain.value=5;
    const hi=ctx.createBiquadFilter();hi.type='lowpass';hi.frequency.value=5200;const g=ctx.createGain();g.gain.value=.55*vel;
    const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;if(pan)pan.pan.value=-.35+(midi-55)/24*.7;
    src.connect(body);body.connect(hi);hi.connect(g);(pan?(g.connect(pan),pan):g).connect(master);g.connect(verb);src.start(t);src.stop(t+4.2)}
  function gliss(up=true,when=0){const notes=up?ZH.slice(0,9):ZH.slice(0,9).reverse();notes.forEach((m,i)=>zheng(m,.28+i*.03,when+i*.055))}
  function tremolo(midi,dur=1.6,when=0){for(let k=0;k*0.085<dur;k++)zheng(midi,.22+.12*Math.sin(k*.5),when+k*.085)}
  // tiêu: hơi thổi, láy rung, luyến giữa các nốt
  function xiao(notes,when=0){if(!ctx)return;let t=ctx.currentTime+when;const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type='sine';o2.type='triangle';lp.type='lowpass';lp.frequency.value=2200;const g2=ctx.createGain();g2.gain.value=.12;
    const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=5.2;vg.gain.value=0;vib.connect(vg);vg.connect(o.frequency);vg.connect(o2.detune);
    const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;const ns=ctx.createBufferSource();ns.buffer=nb;ns.loop=true;
    const nbp=ctx.createBiquadFilter();nbp.type='bandpass';nbp.Q.value=6;const ng=ctx.createGain();ng.gain.value=0;
    o.connect(g);o2.connect(g2);g2.connect(g);ns.connect(nbp);nbp.connect(ng);ng.connect(lp);g.connect(lp);lp.connect(master);lp.connect(verb);
    const start=t;g.gain.setValueAtTime(0,t);
    notes.forEach(([m,d],i)=>{const f=N(m);if(i===0){o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.25)}else{o.frequency.setTargetAtTime(f,t,.06)}
      o2.frequency.setTargetAtTime(f*2,t,.06);nbp.frequency.setTargetAtTime(f*2,t,.05);
      g.gain.setTargetAtTime(.065,t,.18);ng.gain.setTargetAtTime(.02,t,.08);
      vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+d*.8);// rung dần về cuối nốt
      if(i<notes.length-1&&d>1.2){g.gain.setTargetAtTime(.055,t+d-.25,.08)}
      t+=d});
    g.gain.setTargetAtTime(0,t-.15,.35);ng.gain.setTargetAtTime(0,t-.15,.3);
    [o,o2,vib,ns].forEach(x=>{x.start(start);x.stop(t+2)})}
  // chuông chùa
  function bell(f=196,vel=1,when=0){if(!ctx)return;const t=ctx.currentTime+when;[[1,1,10],[2.76,.4,6.5],[5.4,.2,4],[8.93,.08,2.5],[.5,.3,12]].forEach(([m,a,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f*m;o.detune.value=(Math.random()-.5)*8;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.13*a*vel,t+.01);g.gain.exponentialRampToValueAtTime(.0004,t+d);o.connect(g);g.connect(master);g.connect(verb);o.start(t);o.stop(t+d+.1)})}
  // mõ gỗ
  function mo(when=0,vel=1){if(!ctx)return;const t=ctx.currentTime+when;const o=ctx.createOscillator(),g=ctx.createGain(),bp=ctx.createBiquadFilter();o.type='sine';o.frequency.setValueAtTime(820,t);o.frequency.exponentialRampToValueAtTime(560,t+.08);
    bp.type='bandpass';bp.frequency.value=700;bp.Q.value=4;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25*vel,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+.22);o.connect(bp);bp.connect(g);g.connect(master);g.connect(verb);o.start(t);o.stop(t+.3)}
  const pluck=(f,v,w)=>zheng(ZH[Math.min(ZH.length-1,Math.max(0,Math.round(Math.log2(f/196)*5)))],v,w);
  // các câu nhạc: tiêu xướng, đàn tranh đáp
  const XP=[[[67,2.4],[69,1.2],[71,1.2],[74,3.2]],[[74,1.6],[71,1.2],[69,1.2],[67,3.6]],[[64,2.0],[67,1.4],[69,1.0],[67,1.2],[64,3.4]],[[62,2.2],[64,1.2],[67,2.8],[69,1.0],[67,3.0]],[[71,2.6],[74,1.2],[76,1.4],[74,1.2],[71,3.2]]];
  function zPhrase(when=0){let w=when;const st=Math.floor(Math.random()*6);let i=st;const n=2+Math.floor(Math.random()*3);
    for(let k=0;k<n;k++){i=Math.max(0,Math.min(ZH.length-1,i+[-2,-1,1,1,2][Math.floor(Math.random()*5)]));const bend=Math.random()<.25?[1,2][Math.floor(Math.random()*2)]:0;zheng(ZH[i],.4+Math.random()*.25,w,bend);w+=[.35,.5,.7,1.0][Math.floor(Math.random()*4)]}
    if(Math.random()<.15)tremolo(ZH[i],1.2,w+.2);return w}
  function schedule(){timers.forEach(clearTimeout);timers=[];let step=0;
    const loop=()=>{if(!on)return;step++;let next;
      if(step%2===1){const ph=XP[Math.floor(Math.random()*XP.length)];xiao(ph,0);const dur=ph.reduce((a,b)=>a+b[1],0);if(Math.random()<.5)zheng(ph[0][0]-12,.35,.05);next=dur+5+Math.random()*4}
      else{let w=0;if(Math.random()<.2){gliss(Math.random()<.7,0);w=.8}const end=zPhrase(w);next=end+6+Math.random()*5}
      timers.push(setTimeout(loop,next*1000))};
    const bells=()=>{if(!on)return;bell([98,130.81,146.83][Math.floor(Math.random()*3)],.75);if(Math.random()<.5){mo(5.5,.6);mo(6.4,.45)}timers.push(setTimeout(bells,(26+Math.random()*18)*1000))};
    timers.push(setTimeout(loop,2500));timers.push(setTimeout(bells,12000))}
  function setOn(v,save=true){on=v;btn.setAttribute('aria-pressed',v);btn.setAttribute('aria-label',v?'Tắt âm thanh':'Bật âm thanh');wrap.classList.remove('hint');
    if(v){if(!built)build();ctx.resume();const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(VOL,t+5);bell(130.81,.35,.6);schedule()}
    else if(ctx){const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(0,t+1.2);timers.forEach(clearTimeout);setTimeout(()=>{if(!on)ctx.suspend()},1400)}
    if(save){try{localStorage.setItem('ss-sound',v?'1':'0')}catch(e){}}}
  btn.addEventListener('click',()=>setOn(!on));
  const vol=$('#sndVol');if(vol){vol.value=Math.round(VOL*100);vol.addEventListener('input',()=>{VOL=vol.value/100;try{localStorage.setItem('ss-vol',String(VOL))}catch(e){}
    if(!on&&VOL>0){setOn(true)}if(ctx&&on){const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setTargetAtTime(VOL,t,.15)}});
    btn.addEventListener('pointerenter',()=>wrap.classList.add('show-vol'));wrap.addEventListener('pointerleave',()=>wrap.classList.remove('show-vol'))}

  document.addEventListener('visibilitychange',()=>{if(!ctx||!on)return;document.hidden?ctx.suspend():ctx.resume()});
  // âm thanh khi thắp hương / mở kỷ vật
  // chuông khi thắp hương / mở kỷ vật: qua vang của không gian nếu đang bật, không thì tiếng chuông riêng (js/02); âm lượng theo mục Hiệu ứng
  const bell02=window.ssBell,sv=()=>window.ssSfx?ssSfx():1;
  window.ssBell=fa=>{if(!sv())return;if(on){bell(146.83,.9*sv());mo(.05,.5*sv())}else if(bell02)bell02(fa)};window.ssChime=()=>{if(on&&sv()){zheng(74,.6*sv(),0,0);zheng(79,.5*sv(),.16,0)}};
  window.ssAmbient={on:()=>on,set:v=>{if(!!v!==on)setOn(!!v)},vol:v=>{if(v==null)return VOL/.3;VOL=Math.max(0,Math.min(.3,v*.3));try{localStorage.setItem('ss-vol',String(VOL))}catch(e){}
    if(vol)vol.value=Math.round(VOL*100);if(ctx&&on){const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setTargetAtTime(VOL,t,.15)}}};
  let pref=null;try{pref=localStorage.getItem('ss-sound')}catch(e){}
  // mặc định luôn bật (âm lượng 20%); chỉ tắt nếu người xem đã chủ động tắt
  if(pref!=='0'){
    const startNow=()=>{setOn(true,false);if(ctx&&ctx.state!=='running'){// trình duyệt chặn tự phát: phát ngay ở lần chạm/bấm phím đầu tiên
        const first=e=>{if(e.target.closest&&e.target.closest('#sndBtn'))return;['pointerdown','keydown','touchstart'].forEach(ev=>removeEventListener(ev,first,true));if(on){ctx.resume();const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(0,t);master.gain.linearRampToValueAtTime(VOL,t+5)}};
        ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,first,true))}};
    if(document.documentElement.classList.contains('is-loading'))setTimeout(startNow,600);else startNow()}
})();
