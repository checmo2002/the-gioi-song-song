/* Vòng vẽ dùng chung: chỉ chạy khi tab đang mở và ít nhất một phần tử theo dõi đang hiện trên màn hình.
   Phần tử bị ẩn (hidden, display:none) cũng tính là khuất. Ngừng hẳn requestAnimationFrame khi khuất để đỡ tốn pin.
   ssVong(fn, [phần tử…]) — fn(now) mỗi khung hình. Trả về hàm gọi để thử chạy lại (khi điều kiện riêng của mình đổi). */
window.ssVong=function(fn,els){
  var raf=0,dangThay=new Map(),list=(els||[]).filter(Boolean);
  function duoc(){if(document.hidden)return false;if(!list.length)return true;for(var v of dangThay.values())if(v)return true;return false}
  function buoc(now){raf=0;if(!duoc())return;fn(now);if(!raf&&duoc())raf=requestAnimationFrame(buoc)}
  function chay(){if(!raf&&duoc())raf=requestAnimationFrame(buoc)}
  if(list.length){var io=new IntersectionObserver(function(es){es.forEach(function(e){dangThay.set(e.target,e.isIntersecting)});chay()});list.forEach(function(el){io.observe(el)})}
  document.addEventListener('visibilitychange',chay);
  chay();return chay;
};
/* ssKhiDoi(fn): gọi fn mỗi khi khung đại sảnh thêm/bớt phần tử (gộp trong một khung hình), thay cho hẹn giờ dò DOM. */
window.ssKhiDoi=function(fn){
  var cho=0,goc=document.querySelector('.hall')||document.getElementById('hall');
  function goi(){if(!cho){cho=requestAnimationFrame(function(){cho=0;fn()})}}
  if(goc)new MutationObserver(goi).observe(goc,{childList:true,subtree:true});else document.addEventListener('DOMContentLoaded',function(){window.ssKhiDoi(fn)},{once:true});
  fn()};
/* ssAm(): một AudioContext chung cho cả trang (trình duyệt giới hạn số lượng). Chỉ tạo khi cần phát tiếng; tab ẩn thì tạm dừng. */
(function(){var ac=null,AC=window.AudioContext||window.webkitAudioContext;
  window.ssAm=function(){if(!AC)return null;if(!ac)ac=new AC();if(ac.state==='suspended'&&!document.hidden)ac.resume();return ac};
  document.addEventListener('visibilitychange',function(){if(!ac)return;document.hidden?ac.suspend():ac.resume()})})();
