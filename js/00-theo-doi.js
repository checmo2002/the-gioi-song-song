// Theo dõi lỗi và tốc độ tải (docs/theo-doi.md): gửi về máy chủ của chính Song Song (/api/bao-loi), không dùng dịch vụ ngoài.
// Không gửi tên, tài khoản, nội dung người dùng nhập; đường dẫn bỏ phần sau ? và #. Chỉ chạy trên https (bản chạy thật), máy thử http không gửi.
(function(){if(location.protocol!=='https:'||!navigator.sendBeacon)return;
  var da={},so=0,goc=location.origin,
    // chữ trong ngoặc kép (ví dụ lỗi JSON.parse trích dữ liệu đã lưu) có thể là chữ người dùng nhập: thay bằng "…"
    gon=function(s,n){return String(s==null?'':s).split(goc).join('').replace(/[?#][^\s)]*/g,'').replace(/"[^"\n]*"/g,'"…"').slice(0,n)},
    may=function(){return innerWidth<700?'dt':'mt'},
    gui=function(o){try{o.may=may();navigator.sendBeacon('/api/bao-loi',new Blob([JSON.stringify(o)],{type:'application/json'}))}catch(e){}};
  function loi(m,f,d,c,s){if(so>=5)return;   // mỗi lần mở trang gửi tối đa 5 lỗi, lỗi trùng chỉ gửi một lần
    f=String(f||'');if(f&&f.indexOf(goc)!==0)return;   // lỗi của tiện ích trình duyệt, trang khác: bỏ
    var k=m+'|'+f+'|'+d;if(da[k])return;da[k]=1;so++;
    // trang: đường dẫn + #màn (mã phần tử như #ca-nhan), không qua gon vì gon cắt mất phần #
    gui({t:'loi',m:gon(m,300),f:gon(f,200),d:+d||0,c:+c||0,s:gon(s,600),trang:(location.pathname+location.hash.split('?')[0]).replace(/[^\w\/#.-]/g,'').slice(0,60)})}
  addEventListener('error',function(e){if(e.message==='Script error.')return;loi(e.message,e.filename,e.lineno,e.colno,e.error&&e.error.stack)});
  addEventListener('unhandledrejection',function(e){var r=e.reason||{};loi('Promise: '+(r.message||r),(String(r.stack||'').match(/https?:\/\/[^\s)]+?\.js/)||[goc])[0],0,0,r.stack)});
  // tốc độ: một lần mỗi lần mở trang, khi chân núi 3D nạp xong (js/26 đặt ss3dXong) hoặc tối đa 2 phút.
  // d3 = -1 khi quá 2 phút hoặc máy không có WebGL2 (js/26 chỉ đặt ss3dCPU khi có WebGL2, lúc đó ss3dXong=true ngay mà không nạp gì)
  var lcp=0,t0=Date.now(),xong=false;
  try{new PerformanceObserver(function(l){var a=l.getEntries();if(a.length)lcp=Math.round(a[a.length-1].startTime)}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){}
  function doi(){if(xong)return;var n=performance.getEntriesByType('navigation')[0]||{},c=navigator.connection||{};
    if(window.ss3dXong!==true&&Date.now()-t0<12e4)return setTimeout(doi,250);xong=true;
    gui({t:'toc-do',ttfb:Math.round(n.responseStart||0),dom:Math.round(n.domContentLoadedEventEnd||0),tai:Math.round(n.loadEventEnd||0),lcp:lcp,
      d3:window.ss3dXong===true&&'ss3dCPU' in window?Math.round(performance.now()):-1,mang:String(c.effectiveType||'').slice(0,8)})}
  addEventListener('load',function(){setTimeout(doi,0)});
})();
