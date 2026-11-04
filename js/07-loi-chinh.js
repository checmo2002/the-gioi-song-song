(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce0=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=n=>n.toLocaleString('vi-VN');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------------- Hai lớp: trang giới thiệu và bên trong website ---------------- */
(function(){
  const isApp=el=>el&&el.closest('.app-only');
  function setView(v,targetId,smooth){const b=document.body;const was=b.classList.contains('view-app')?'app':'intro';b.classList.toggle('view-app',v==='app');b.classList.toggle('view-intro',v!=='app');
    if(was!==v){$$(v==='app'?'.app-only':'.intro-only').forEach(el=>{el.classList.remove('view-fade');void el.offsetWidth;el.classList.add('view-fade')});dispatchEvent(new Event('resize'));setTimeout(()=>window.prepReveal&&window.prepReveal(),60)}
    const t=targetId&&document.getElementById(targetId);
    const pg=window.ssPage?ssPage(t,v):{changed:false,isTop:true};
    if(pg.changed){dispatchEvent(new Event('resize'));setTimeout(()=>window.prepReveal&&window.prepReveal(),60)}
    if(t&&!pg.isTop&&!(v==='intro'&&targetId==='dau-trang'))requestAnimationFrame(()=>t.scrollIntoView({behavior:smooth&&!pg.changed&&!reduce?'smooth':'auto'}));else scrollTo({top:0,behavior:'auto'});
    setTimeout(()=>dispatchEvent(new Event('scroll')),80)}
  window.setView=setView;
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(!id)return;const t=document.getElementById(id);if(!t)return;
    e.preventDefault();const v=isApp(t)?'app':(t.closest('.intro-only')?'intro':(document.body.classList.contains('view-app')?'app':'intro'));setView(v,id,true);try{history.pushState(null,'','#'+id)}catch(_){}});
  addEventListener('popstate',()=>route(false));
  function route(){const id=location.hash.slice(1);const t=id&&document.getElementById(id);if(t&&isApp(t))setView('app',id,false);else setView('intro',id||null,false)}
  route();
})();

let tT; window.toast=function(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2600)};

/* ---------------- Dữ liệu mẫu ---------------- */
const CAT={ls:'Liệt sĩ',tb:'Thương binh',dh:'Dòng họ',nt:'Người thân'};
const people=[
 {id:'khiem',c:'ls',name:'Phạm Hữu Khiêm',title:'Liệt sĩ',b:1951,d:1972,place:'Ý Yên, Nam Định',inc:1284,
  facts:[['Sinh','1951, làng Yên Bằng'],['Quê quán','Ý Yên, Nam Định'],['Nhập ngũ','Tháng 9 năm 1970'],['Hy sinh','Tháng 8 năm 1972, Quảng Trị'],['An nghỉ','NTLS Quốc gia Đường 9 · Khu B'],['Ngày giỗ','14 tháng 7 âm lịch']],
  ch:[['1951','Con thứ ba trong nhà sáu anh em','Lớn lên bên bờ sông Đáy. Mẹ kể anh hay ngồi trên lưng trâu thổi sáo trúc, thổi lạc cả điệu mà vẫn thổi.'],
      ['1968','Học hết lớp bảy','Nghỉ học để đi cấy cùng mẹ khi anh cả đã vào bộ đội. Cuối mùa gặt, anh viết đơn tình nguyện nhập ngũ.'],
      ['1970','Lên đường','Huấn luyện ở Thanh Hóa rồi hành quân vào Nam. Gửi về nhà bốn lá thư, lá nào cũng dặn mẹ giữ sức khỏe.'],
      ['1972','Ở lại Quảng Trị','Hy sinh trong những ngày bảo vệ Thành cổ, khi vừa tròn 21 tuổi.'],
      ['2009','Trở về trong ký ức gia đình','Gia đình tìm được mộ anh. Từ đó, năm nào cháu Nam cũng vào thắp hương trước ngày 27 tháng 7.']],
  letter:'“Mẹ ơi, con vẫn khỏe. Ở đây trời nắng lắm, con nhớ mùi rơm nhà mình. Mẹ đừng lo, xong việc con về cấy với mẹ.”',cite:'Trích lá thư cuối, tháng 6 năm 1972 · nội dung mẫu',
  bio:'Anh Khiêm là con thứ ba trong một gia đình sáu anh em ở làng Yên Bằng, bên bờ sông Đáy. Học hết lớp bảy, anh ở nhà đi cấy cùng mẹ rồi tình nguyện nhập ngũ tháng 9 năm 1970. Anh gửi về nhà bốn lá thư, lá nào cũng dặn mẹ giữ sức khỏe. Tháng 8 năm 1972, anh hy sinh trong những ngày bảo vệ Thành cổ Quảng Trị, khi vừa tròn 21 tuổi.',
  story:['Mẹ của anh Khiêm giữ bốn lá thư trong một hộp sắt đựng bánh, buộc bằng sợi chỉ đỏ. Suốt ba mươi bảy năm, mỗi lần nghe tin có người về từ Quảng Trị, bà lại mang hộp thư ra hỏi.','Năm 2009, nhờ một đồng đội cũ nhớ ra tên anh trong danh sách, gia đình tìm được mộ tại Nghĩa trang Đường 9. Ngày đi viếng, bà đã yếu, cháu Nam phải cõng lên xe. Bà đặt lên mộ một nắm rơm khô mang từ quê vào.','Trang này do cháu Nam lập, để những người con cháu sinh sau không chỉ biết tên anh trên bia mà còn biết anh từng thổi sáo, từng đi cấy và từng nhớ mùi rơm.']},
 {id:'loc',c:'tb',name:'Đỗ Văn Lộc',title:'Thương binh hạng 2/4',b:1945,d:2021,place:'Vũ Thư, Thái Bình',inc:612,
  facts:[['Sinh','1945, Vũ Thư'],['Quê quán','Vũ Thư, Thái Bình'],['Thương binh','Hạng 2/4'],['Mất','Tháng 3 năm 2021'],['An nghỉ','Nghĩa trang xã quê'],['Ngày giỗ','19 tháng 2 âm lịch']],
  ch:[['1965','Nhập ngũ','Bộ đội công binh, mở đường qua những cánh rừng mà sau này ông vẫn nhớ tên từng con suối.'],['1971','Bị thương','Mất một phần bàn tay trái, trở về quê nhận sổ thương binh.'],['1975','Thợ mộc của làng','Dùng một tay rưỡi đóng giường tủ cho cả xóm. Ông dạy cháu đóng chiếc ghế đầu tiên năm cháu lên mười.']],
  letter:'“Cái gì làm bằng tay mình thì giữ được lâu.”',cite:'Câu ông hay nói · nội dung mẫu',story:['Ông Lộc không thích kể chuyện chiến tranh. Ông thích kể về gỗ: gỗ lim nặng, gỗ mít thơm, gỗ xoan phải ngâm bùn mới không mọt.']},
 {id:'nhan',c:'nt',name:'Trần Thị Nhàn',title:'Bà nội',b:1932,d:2019,place:'Hoàn Kiếm, Hà Nội',inc:845,
  facts:[['Sinh','1932, Hà Nội'],['Quê quán','Hoàn Kiếm, Hà Nội'],['Nghề','Bán hàng nước đầu ngõ'],['Mất','Tháng 11 năm 2019'],['An nghỉ','Nghĩa trang Văn Điển'],['Ngày giỗ','8 tháng 10 âm lịch']],
  ch:[['1950','Gánh hàng nước','Ba mươi năm ngồi đầu ngõ với ấm chè xanh và lọ kẹo lạc.'],['1990','Bà của bảy đứa cháu','Đứa nào đi học về cũng ghé hàng bà xin một chiếc kẹo.']],
  letter:'“Uống bát nước đã rồi hẵng đi.”',cite:'Câu bà nói với mọi khách qua đường · nội dung mẫu',story:['Hàng nước của bà không có biển hiệu, nhưng cả phố gọi là “hàng bà Nhàn”.']},
 {id:'tam',c:'ls',name:'Hoàng Minh Tâm',title:'Liệt sĩ',b:1954,d:1975,place:'Diễn Châu, Nghệ An',inc:530,
  facts:[['Sinh','1954, Diễn Châu'],['Quê quán','Diễn Châu, Nghệ An'],['Đơn vị','Lái xe vận tải'],['Hy sinh','Tháng 3 năm 1975'],['An nghỉ','Chưa tìm được mộ'],['Ngày giỗ','Gia đình chọn ngày 27 tháng 7']],
  ch:[['1972','Học lái xe','Mười tám tuổi, tay lái đầu tiên là chiếc xe tải chở gạo.'],['1975','Chuyến xe cuối','Hy sinh trên đường vận chuyển vào Tây Nguyên. Gia đình vẫn đang tìm mộ anh.']],
  letter:'“Gia đình mong nhận được bất kỳ thông tin nào từ đồng đội của anh.”',cite:'Lời nhắn của em gái · nội dung mẫu',story:['Không gian này mở công khai để đồng đội cũ có thể tìm thấy và để lại thông tin.']},
 {id:'men',c:'nt',name:'Vũ Thị Mến',title:'Cụ bà',b:1918,d:2004,place:'Kim Thành, Hải Dương',inc:390,
  facts:[['Sinh','1918, Kim Thành'],['Quê quán','Kim Thành, Hải Dương'],['Nghề','Nuôi tằm, dệt lụa'],['Mất','Năm 2004'],['An nghỉ','Nghĩa trang dòng họ'],['Ngày giỗ','3 tháng 3 âm lịch']],
  ch:[['1935','Khung cửi','Dệt lụa cho cả làng may áo cưới.'],['1980','Bà cố của đại gia đình','Bốn thế hệ quây quần mỗi dịp Tết.']],
  letter:'“Sợi tơ mảnh, nhưng xe nhiều sợi thì bền.”',cite:'Lời cụ dạy con cháu · nội dung mẫu',story:['Tấm lụa cuối cùng cụ dệt vẫn được gia đình giữ trong rương gỗ.']},
 {id:'vinh',c:'tb',name:'Lê Quang Vinh',title:'Thương binh hạng 3/4',b:1949,d:2016,place:'Lệ Thủy, Quảng Bình',inc:476,
  facts:[['Sinh','1949, Lệ Thủy'],['Quê quán','Lệ Thủy, Quảng Bình'],['Thương binh','Hạng 3/4'],['Mất','Năm 2016'],['An nghỉ','Nghĩa trang huyện'],['Ngày giỗ','22 tháng 5 âm lịch']],
  ch:[['1968','Nhập ngũ','Lính thông tin, mang máy điện đài qua sông Kiến Giang.'],['1978','Thầy giáo làng','Dạy văn ba mươi năm ở trường cấp hai xã.']],
  letter:'“Viết cho người đọc hiểu, đừng viết cho người đọc sợ.”',cite:'Lời thầy dặn học trò · nội dung mẫu',story:['Học trò cũ của thầy giờ có người làm hiệu trưởng ngay ngôi trường thầy từng dạy.']},
 {id:'ha',c:'nt',name:'Nguyễn Thu Hà',title:'Con gái, người chị',b:1988,d:2023,place:'Hải Châu, Đà Nẵng',inc:298,
  facts:[['Sinh','1988, Đà Nẵng'],['Quê quán','Hải Châu, Đà Nẵng'],['Nghề','Kiến trúc sư'],['Mất','Năm 2023'],['An nghỉ','Công viên nghĩa trang'],['Ngày giỗ','Theo dương lịch, 12/9']],
  ch:[['2010','Bản vẽ đầu tiên','Thiết kế lại căn bếp cho mẹ.'],['2018','Màu nước','Mỗi chuyến đi đều mang về một cuốn sổ vẽ.']],
  letter:'“Nhà đẹp là nhà có chỗ cho nắng vào.”',cite:'Ghi chú trong sổ vẽ · nội dung mẫu',story:['Gia đình dựng cho chị một ngôi nhà có cửa sổ thật lớn trong khu vườn trên mây.']},
 {id:'son',c:'ls',name:'Bùi Văn Sơn',title:'Liệt sĩ',b:1948,d:1968,place:'Lý Nhân, Hà Nam',inc:77,
  facts:[['Sinh','1948, Lý Nhân'],['Quê quán','Lý Nhân, Hà Nam'],['Đơn vị','Y tá chiến trường'],['Hy sinh','Năm 1968'],['An nghỉ','Nghĩa trang liệt sĩ huyện'],['Ngày giỗ','Chưa cập nhật']],
  ch:[['1966','Học y tá','Khóa học ba tháng rồi lên đường.'],['1968','Hy sinh','Khi đang băng bó cho đồng đội.']],
  letter:'“Hồ sơ này đang chờ thân nhân nhận và bổ sung.”',cite:'Ghi chú của cộng đồng · nội dung mẫu',story:['Nếu bạn là người thân của liệt sĩ Bùi Văn Sơn, hãy nhận hồ sơ để bổ sung ký ức.']}

 ,{id:'le',c:'dh',name:'Phạm Hữu Lễ',title:'Cụ tổ đời thứ nhất',b:1890,d:1951,place:'Ý Yên, Nam Định',inc:214,
  facts:[['Sinh','1890, làng Yên Bằng'],['Quê quán','Ý Yên, Nam Định'],['Nghề','Thầy đồ dạy chữ Nho'],['Mất','Năm 1951'],['An nghỉ','Nghĩa trang dòng họ Phạm'],['Ngày giỗ','12 tháng Chạp âm lịch']],
  ch:[['1910','Mở lớp chữ Nho','Dạy trẻ trong làng ở hiên nhà thờ họ.'],['1935','Lập gia phả','Chép tay cuốn gia phả đầu tiên của họ Phạm làng Yên Bằng.']],
  letter:'“Cây có gốc mới nở cành xanh ngọn.”',cite:'Câu đối cụ viết ở nhà thờ họ · nội dung mẫu',story:['Cuốn gia phả cụ chép tay vẫn được giữ trong hòm gỗ ở nhà thờ họ.']}
 ,{id:'to',c:'dh',name:'Đinh Thị Tơ',title:'Cụ bà đời thứ nhất',b:1894,d:1960,place:'Ý Yên, Nam Định',inc:188,
  facts:[['Sinh','1894'],['Quê quán','Ý Yên, Nam Định'],['Nghề','Dệt vải, làm ruộng'],['Mất','Năm 1960'],['An nghỉ','Nghĩa trang dòng họ Phạm'],['Ngày giỗ','6 tháng 4 âm lịch']],
  ch:[['1912','Về làm dâu họ Phạm','Nuôi năm người con qua những năm đói.']],
  letter:'“Thương con thì thương cho đều tay.”',cite:'Lời cụ dặn · nội dung mẫu',story:['Cụ là người giữ nếp nhà họ Phạm suốt nửa thế kỷ.']}
 ,{id:'can',c:'dh',name:'Phạm Hữu Cần',title:'Bố của liệt sĩ Khiêm',b:1922,d:1990,place:'Ý Yên, Nam Định',inc:305,
  facts:[['Sinh','1922'],['Quê quán','Ý Yên, Nam Định'],['Nghề','Đội trưởng hợp tác xã'],['Mất','Năm 1990'],['An nghỉ','Nghĩa trang dòng họ Phạm'],['Ngày giỗ','25 tháng 9 âm lịch']],
  ch:[['1945','Trưởng họ','Tiếp quản nhà thờ họ sau cụ Lễ.'],['1972','Mất người con thứ ba','Ông trồng một cây bưởi trước nhà để nhớ con.']],
  letter:'“Cây bưởi này là của thằng Khiêm.”',cite:'Lời ông nói với các cháu · nội dung mẫu',story:['Cây bưởi ông trồng năm 1972 đến nay vẫn ra quả.']}
 ,{id:'gai',c:'dh',name:'Trần Thị Gái',title:'Mẹ của liệt sĩ Khiêm',b:1925,d:2011,place:'Ý Yên, Nam Định',inc:642,
  facts:[['Sinh','1925'],['Quê quán','Ý Yên, Nam Định'],['Danh hiệu','Mẹ liệt sĩ'],['Mất','Năm 2011'],['An nghỉ','Nghĩa trang dòng họ Phạm'],['Ngày giỗ','2 tháng 11 âm lịch']],
  ch:[['1972','Hộp thư sắt','Giữ bốn lá thư của con trong hộp bánh buộc chỉ đỏ.'],['2009','Gặp con','Được cháu cõng vào Quảng Trị viếng mộ con lần đầu.']],
  letter:'“Mẹ mang rơm nhà mình vào cho con đây.”',cite:'Lời bà nói bên mộ con, 2009 · nội dung mẫu',story:['Bà sống thêm hai năm sau chuyến đi Quảng Trị.']}
 ,{id:'khoi',c:'dh',name:'Phạm Hữu Khôi',title:'Anh cả',b:1948,d:2020,place:'Ý Yên, Nam Định',inc:233,
  facts:[['Sinh','1948'],['Quê quán','Ý Yên, Nam Định'],['Nghề','Bộ đội, sau về dạy học'],['Mất','Năm 2020'],['An nghỉ','Nghĩa trang dòng họ Phạm'],['Ngày giỗ','17 tháng 5 âm lịch']],
  ch:[['1966','Nhập ngũ trước em','Vào bộ đội trước Khiêm bốn năm và trở về.'],['1980','Thầy giáo xã','Dạy toán ở trường cấp hai, nuôi các em ăn học.']],
  letter:'“Tao về được thì phải sống thay cả phần em.”',cite:'Lời ông kể với con trai · nội dung mẫu',story:['Ông là người kể cho cháu Nam nghe về chú Khiêm.']}
];
const byId=Object.fromEntries(people.map(p=>[p.id,p]));
const GEO={khiem:{g:[16.812,107.070,'Nghĩa trang Liệt sĩ Quốc gia Đường 9, Quảng Trị'],h:[20.32,106.02]},
 loc:{g:[20.44,106.29,'Nghĩa trang xã, Vũ Thư, Thái Bình'],h:[20.44,106.29]},
 nhan:{g:[20.945,105.845,'Nghĩa trang Văn Điển, Hà Nội'],h:[21.032,105.852]},
 tam:{g:null,h:[18.98,105.60]},
 men:{g:[20.93,106.50,'Nghĩa trang dòng họ, Kim Thành, Hải Dương'],h:[20.93,106.50]},
 vinh:{g:[17.22,106.79,'Nghĩa trang huyện Lệ Thủy, Quảng Bình'],h:[17.22,106.79]},
 ha:{g:[16.00,108.12,'Công viên nghĩa trang, Đà Nẵng'],h:[16.05,108.21]},
 son:{g:[20.55,106.10,'Nghĩa trang liệt sĩ huyện Lý Nhân, Hà Nam'],h:[20.55,106.10]}};
['le','to','can','gai','khoi'].forEach(id=>GEO[id]={g:[20.31,106.03,'Nghĩa trang dòng họ Phạm, Ý Yên, Nam Định'],h:[20.32,106.02]});
const ZONES=[
 {id:'ls',name:'Đồi Tri Ân',sub:'Khu liệt sĩ',a:-Math.PI/2,ground:0xa9b97c,col:'#b9503a',roof:0x9c3b28},
 {id:'tb',name:'Vườn Đồng Đội',sub:'Khu thương binh',a:-Math.PI/2+1.2566,ground:0x8fb47a,col:'#3f7a64',roof:0x3f6a58},
 {id:'dh',name:'Xóm Dòng Họ',sub:'Nhà thờ họ và gia phả',a:-Math.PI/2+2.5133,ground:0xb4b17c,col:'#a8822e',roof:0x6e4a2e},
 {id:'nt',name:'Xóm Bình Yên',sub:'Khu người thân',a:-Math.PI/2+3.7699,ground:0x93b56b,col:'#7a5a3e',roof:0x7a5a3e},
 {id:'tt',name:'Vườn Thiên Thần',sub:'Không gian cho các thiên thần nhỏ',a:-Math.PI/2+5.0265,ground:0xbfd0a2,col:'#c77c9a',roof:0xd99ab4}];
const ZBY=Object.fromEntries(ZONES.map(z=>[z.id,z]));

let current='khiem';
const homes={}; // cấu hình nhà theo người
function homeOf(id){id=(byId[id]&&byId[id].houseOf)||id;return homes[id]||(homes[id]={style:'bagian',roof:'#9c3b28',garden:{dao:true,sen:true,cau:false,rao:true,den:true},gifts:[]});}

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
const notes={khiem:[
 ['Chú ơi, năm nay cháu đưa con trai vào thăm chú. Thằng bé hỏi chú có biết đi xe đạp không, cháu bảo chú biết thổi sáo.','Phạm Hữu Nam, cháu','25/07/2026'],
 ['Khiêm à, tao vẫn nhớ hôm mày chia nửa nắm cơm cho tao. Tao sống đến giờ là sống cả phần mày.','Lương Văn Bảy, đồng đội','02/09/2025'],
 ['Cháu không quen chú, nhưng hôm nay đi ngang Thành cổ, cháu thắp cho chú một nén hương.','Một người ở Huế','14/04/2026']]};
function renderWall(){const n=notes[current]||[];$('#wall').innerHTML=n.length?n.map(([t,a,d])=>`<div class="note"><p>${esc(t)}</p><footer>${esc(a)} · ${d}</footer></div>`).join(''):'<p style="color:var(--ink-soft)">Chưa có lời nhắn nào. Hãy là người đầu tiên.</p>'}
function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
$('#msgForm').addEventListener('submit',e=>{e.preventDefault();const t=new Date();(notes[current]||(notes[current]=[])).unshift([$('#mText').value,$('#mName').value,t.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'})]);$('#mText').value='';renderWall();toast('Đã gửi lời nhắn tới '+byId[current].name)});
function showTab(p){$$('#memTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.p===p));$$('[data-pane]').forEach(d=>d.hidden=d.dataset.pane!==p)}
$('#memTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)showTab(b.dataset.p)});
$$('[data-tab]').forEach(a=>a.addEventListener('click',()=>showTab(a.dataset.tab)));

/* ---------------- Hành trình ---------------- */
$('#steps').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#steps button').forEach(x=>x.setAttribute('aria-selected',x===b));$$('[data-jp]').forEach(d=>d.hidden=d.dataset.jp!==b.dataset.j)});

/* ---------------- Cửa hàng ---------------- */
const IC={
 aodai:'<path d="M19 6h10l4 9-4 2v25H19V17l-4-2z"/><path d="M24 6v8M21 17h6"/>',
 quanphuc:'<path d="M16 8l8 3 8-3 8 6-4 6-4-2v22H16V18l-4 2-4-6z"/><path d="M20 22h4v4h-4zM28 22h4v4h-4z"/>',
 aolen:'<path d="M17 8c2 3 12 3 14 0l9 6-3 9-4-2v21H15V21l-4 2-3-9z"/><path d="M15 36h18M15 39h18"/>',
 xemay:'<circle cx="12" cy="33" r="6"/><circle cx="37" cy="33" r="6"/><path d="M12 33l7-11h12l6 11M19 22l-3-6h-4M31 22l2-8h5"/>',
 xedap:'<circle cx="12" cy="32" r="8"/><circle cx="36" cy="32" r="8"/><path d="M12 32l8-13h12l4 13M20 19l7 13 5-13M18 15h6M30 15h5"/>',
 oto:'<path d="M5 30v-6l5-2 6-8h16l7 8 5 2v6z"/><circle cx="14" cy="31" r="4"/><circle cx="34" cy="31" r="4"/><path d="M17 15l-3 7h20l-5-7"/>',
 truongky:'<path d="M8 20h32v12H8z"/><path d="M6 20v-6h36v6M10 32v5M38 32v5M8 26h32"/>',
 sap:'<path d="M5 22h38v6H5z"/><path d="M8 28v10M40 28v10M8 34h32M14 22v-4h20v4"/>',
 tuche:'<path d="M11 8h26v32H11z"/><path d="M11 24h26M24 8v16M21 16h-2M29 16h-2M14 40v3M34 40v3M15 30h18"/>',
 dao:'<path d="M24 42V24M24 30l-6-6M24 27l7-5"/><circle cx="17" cy="16" r="5"/><circle cx="29" cy="13" r="6"/><circle cx="24" cy="22" r="4"/><circle cx="33" cy="22" r="4"/><path d="M16 42h16"/>',
 denlong:'<path d="M24 4v6M20 10h8"/><ellipse cx="24" cy="24" rx="11" ry="13"/><path d="M24 11v26M16 14c-3 6-3 14 0 20M32 14c3 6 3 14 0 20M20 37h8M24 37v7"/>',
 binhsen:'<path d="M18 26h12l-2 16H20z"/><path d="M24 26V12M24 12c-4 0-6-4-6-7 3 0 6 3 6 7zM24 12c4 0 6-4 6-7-3 0-6 3-6 7zM24 18c-5 0-9-2-10-6 4 0 8 2 10 6z"/>',
 custom:'<circle cx="24" cy="24" r="16" stroke-dasharray="3 3"/><path d="M24 16v16M16 24h16"/>'
};
const goods=[
 {id:'aodai',k:'ao',n:'Áo dài lụa',p:80,t:'Lụa tơ tằm, may đo theo màu gia đình chọn.'},
 {id:'quanphuc',k:'ao',n:'Bộ quân phục mới',p:60,t:'Quân phục kèm mũ cối, dành tặng các anh hùng liệt sĩ.'},
 {id:'aolen',k:'ao',n:'Áo len mẹ đan',p:40,t:'Áo len cổ tròn, ấm cho những mùa đông miền Bắc.'},
 {id:'xemay',k:'xe',n:'Xe máy cổ',p:180,t:'Kiểu xe số những năm 1970, sơn xanh ngọc.'},
 {id:'xedap',k:'xe',n:'Xe đạp thồ',p:70,t:'Khung sắt chắc, có giá chở hàng phía sau.'},
 {id:'oto',k:'xe',n:'Ô tô gia đình',p:320,t:'Bảy chỗ, đủ cho cả nhà cùng đi chơi Tết.'},
 {id:'truongky',k:'noi',n:'Bộ trường kỷ',p:150,t:'Gỗ gụ chạm hoa sen, đặt giữa gian chính.'},
 {id:'sap',k:'noi',n:'Sập gụ',p:200,t:'Chiếc sập ngồi uống trà mỗi chiều.'},
 {id:'tuche',k:'noi',n:'Tủ chè',p:120,t:'Tủ chè khảm trai để bày ấm chén.'},
 {id:'dao',k:'trang',n:'Cây đào Nhật Tân',p:50,t:'Đào bích nở đúng dịp Tết, trồng trong sân.'},
 {id:'denlong',k:'trang',n:'Đèn lồng Hội An',p:20,t:'Treo dọc lối đi, sáng ấm khi trời tối.'},
 {id:'binhsen',k:'trang',n:'Bình hoa sen',p:30,t:'Sen Tây Hồ cắm bình gốm men lam.'}
];
let balance=500,shopK='all';
$('#recipient').innerHTML=people.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
function renderGoods(){
  const list=goods.filter(g=>shopK==='all'||g.k===shopK);
  let html=list.map((g,i)=>`<div class="good" style="--i:${i}"><div class="ic"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${IC[g.id]}</svg></div><h3>${g.n}</h3><p>${g.t}</p><div class="foot"><span class="price">${g.p} <small>nén</small></span><button class="btn" data-g="${g.id}" style="padding:8px 14px">Dâng tặng</button></div></div>`).join('');
  if(shopK==='all'||shopK==='yc')html+=`<div class="good custom"><div class="ic"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round">${IC.custom}</svg></div><h3>Đặt làm theo yêu cầu</h3><textarea id="customReq" aria-label="Mô tả vật phẩm" placeholder="Ví dụ: chiếc sáo trúc giống cây sáo chú từng thổi…"></textarea><div class="foot"><span class="price">Báo giá <small>trong 2 ngày</small></span><button class="btn ghost" id="customBtn" style="padding:8px 14px">Gửi yêu cầu</button></div></div>`;
  $('#goods').innerHTML=html;
}
$('#shopCats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;shopK=b.dataset.k;$$('#shopCats button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderGoods();const gd=$('#goods');gd.classList.remove('swap');void gd.offsetWidth;gd.classList.add('swap')});
$('#goods').addEventListener('click',e=>{
  if(e.target.id==='customBtn'){const v=$('#customReq').value.trim();toast(v?'Đã gửi yêu cầu đặt làm. Xưởng sẽ báo giá trong 2 ngày.':'Hãy mô tả vật phẩm bạn muốn đặt làm.');if(v)$('#customReq').value='';return}
  const b=e.target.closest('button[data-g]');if(!b)return;
  buy(b.dataset.g,$('#recipient').value);
});
function setBalance(v){balance=v;$('#balance').textContent=v;$$('[data-bal]').forEach(e=>e.textContent=v.toLocaleString('vi-VN'))}
function buy(gid,rid){const g=goods.find(x=>x.id===gid);if(!g||!byId[rid])return false;
  if(balance<g.p){toast('Số dư không đủ. Cần thêm '+(g.p-balance)+' nén. Bấm “Nạp nén” để nạp thêm.');return false}
  setBalance(balance-g.p);const h=homeOf(rid);h.gifts.push(g.id);
  if(h===homeOf(current)&&home)home.addGift(g.id,h.gifts.length-1);
  renderReceived();window.ssMe&&ssMe.save();
  toast(g.k==='ao'?`Đã gửi ${g.n} tới ${houseNames(rid)}. Món quà được cất vào tủ áo.`:g.k==='noi'?`Đã gửi ${g.n} tới ${houseNames(rid)}. Đồ đã được bày trong nhà.`:`Đã gửi ${g.n} tới ${houseNames(rid)}. Món quà đã có trong sân nhà.`);return true}
function renderReceived(){
  const h=homeOf(current);const c={};h.gifts.forEach(id=>c[id]=(c[id]||0)+1);
  const ks=Object.keys(c);
  $('#received').innerHTML=ks.length?ks.map(id=>{const g=goods.find(x=>x.id===id);return `<li><b>${g.n}${c[id]>1?' ×'+c[id]:''}</b><span>${g.k==='ao'?'trong tủ áo':'trong sân'}</span></li>`}).join(''):'<li>Chưa có quà. Gửi từ cửa hàng bên dưới.</li>';
}

/* ---------------- Ngôi nhà: điều khiển ---------------- */
function syncHomeUI(){
  const h=homeOf(current);
  $$('#hStyles button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===h.style));
  $$('#hRoof button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===h.roof));
  $$('#hGarden input').forEach(i=>i.checked=!!h.garden[i.dataset.g]);
}
$('#hStyles').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;homeOf(current).style=b.dataset.s;syncHomeUI();home&&home.rebuild()});
$('#hRoof').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;homeOf(current).roof=b.dataset.r;syncHomeUI();home&&home.rebuild()});
$('#hGarden').addEventListener('change',e=>{const i=e.target;homeOf(current).garden[i.dataset.g]=i.checked;home&&home.garden()});
$('#homeTime').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#homeTime button').forEach(x=>x.setAttribute('aria-pressed',x===b));home&&home.setTime(b.dataset.t)});
$('#saveHome').addEventListener('click',()=>toast('Đã lưu ngôi nhà của '+byId[current].name));

let park=null,home=null;const T=null;
/* ---------------- Hồ sơ: hiệu ứng ---------------- */
const lm=$('#ho-so');
$('.lm-bars').innerHTML=Array.from({length:14},(_,i)=>`<span style="--i:${(i*5)%14}"></span>`).join('');
[...$('.lm-body').children].forEach((c,i)=>c.style.setProperty('--d',i));
function replayLM(){if(reduce)return;lm.classList.remove('play');void lm.offsetWidth;lm.classList.add('play')}
if(!reduce){const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){lm.classList.add('play');io.disconnect()}},{threshold:.2});io.observe(lm);
  const por=$('#lmPortrait'),old=$('#lmOld');let tk=false;
  addEventListener('scroll',()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{tk=false;const r=lm.getBoundingClientRect();const y=Math.max(0,Math.min(-r.top,900));por.style.transform=`translateY(${y*.38}px)`;por.style.opacity=String(Math.max(.15,1-y/700));old.style.transform=`rotate(-1.5deg) translateY(${-y*.12}px)`})},{passive:true});}
$('#lmPrev').addEventListener('click',e=>select(e.currentTarget.dataset.id,true));
$('#lmNext').addEventListener('click',e=>select(e.currentTarget.dataset.id,true));
$('#lmVideo').addEventListener('click',()=>toast('Video mẫu. Gia đình sẽ tải video tưởng niệm lên đây.'));
$('#lmListen').addEventListener('click',()=>toast('Bản ghi âm mẫu. Người thân có thể ghi lời kể ngay trên điện thoại.'));


/* ---------------- Bản đồ thực tế ---------------- */
const VK=Math.cos(16*Math.PI/180)*40;const vp=(lat,lng)=>[(lng-101.2)*VK,(23.7-lat)*40];
let vLayer='g';
(function(){const ns='http://www.w3.org/2000/svg';
  const cities=[['Hà Nội',21.03,105.85],['Huế',16.46,107.59],['Đà Nẵng',16.05,108.2],['TP. Hồ Chí Minh',10.78,106.7],['Cần Thơ',10.03,105.78]];
  $('#vmapCities').innerHTML=cities.map(([n,la,lo])=>{const [x,y]=vp(la,lo);return `<g class="city"><circle cx="${x}" cy="${y}" r="2.5"/><text font-family="Be Vietnam Pro, sans-serif" x="${x-6}" y="${y+4}" text-anchor="end">${n}</text></g>`}).join('');
  const isl=(n,la,lo,pts)=>{const [x,y]=vp(la,lo);let c='';pts.forEach(([dx,dy])=>c+=`<circle cx="${x+dx}" cy="${y+dy}" r="1.6"/>`);return `<g class="isl">${c}<text font-family="Be Vietnam Pro, sans-serif" x="${x}" y="${y+28}" text-anchor="middle">${n}</text></g>`};
  $('#vmapIslands').innerHTML=isl('Quần đảo Hoàng Sa',16.5,112.0,[[0,0],[8,-5],[14,4],[-7,6],[4,10],[-12,-3]])+isl('Quần đảo Trường Sa',9.9,114.2,[[0,0],[10,6],[-9,8],[6,-9],[-14,-4],[16,-3],[2,14]])+(()=>{const [x,y]=vp(13.4,111.4);return `<text font-family="Be Vietnam Pro, sans-serif" class="sea-l" x="${x}" y="${y}" text-anchor="middle">BIỂN ĐÔNG</text>`})();
})();
function renderMap(){
  const list=people.map(p=>({p,pt:GEO[p.id]&&GEO[p.id][vLayer]})).filter(o=>o.pt);
  // nhóm các điểm trùng nhau
  const seen={};
  $('#vmapMarks').innerHTML=list.map(({p,pt})=>{const [x,y]=vp(pt[0],pt[1]);const k=x.toFixed(0)+','+y.toFixed(0);const n=seen[k]=(seen[k]||0)+1;const ox=(n-1)*7,oy=-(n-1)*3;const c=ZBY[p.c].col;const on=p.id===current;
    return `<g class="mk${on?' on':''}" data-id="${p.id}" transform="translate(${x+ox},${y+oy})"><circle class="pulse" r="8" stroke="${c}"/><circle class="o" r="7" stroke="${c}"/><circle class="i" r="3.2" fill="${c}"/>${on?`<text font-family="Be Vietnam Pro, sans-serif" x="12" y="4">${p.name}</text>`:''}</g>`}).join('');
  // đưa điểm đang chọn lên trên cùng
  const on=$('#vmapMarks .mk.on');if(on)on.parentNode.appendChild(on);
  const p=byId[current],g=GEO[current]||{};const pt=g[vLayer];
  $('#vcard').innerHTML=`<span class="eyebrow">${CAT[p.c]} · ${ZBY[p.c].name}</span><h3>${p.name}</h3><div>${p.b} – ${p.d}</div>`+
    (pt?`<div><b>${vLayer==='g'?'Mộ phần':'Quê quán'}:</b> ${vLayer==='g'?pt[2]:p.place}</div><div class="coord">${pt[0].toFixed(3)}° B, ${pt[1].toFixed(3)}° Đ · tọa độ gần đúng, dữ liệu mẫu</div><div class="row"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${pt[0]},${pt[1]}">Mở Google Maps</a><a class="btn ghost" href="#cong-vien" id="vToVillage">Xem trong làng</a></div>`
      :`<div><b>Mộ phần:</b> gia đình chưa tìm được. Hồ sơ đang mở công khai để đồng đội cũ có thể bổ sung thông tin.</div><div class="row"><a class="btn ghost" href="#ky-uc" data-tab="msg">Gửi thông tin</a></div>`);
  $('#vlist').innerHTML=people.map(q=>{const gp=GEO[q.id]&&GEO[q.id][vLayer];return `<li><button data-id="${q.id}" aria-current="${q.id===current}"><i style="background:${ZBY[q.c].col}"></i><div><div>${q.name}</div><span>${gp?(vLayer==='g'?gp[2]:q.place):'Chưa tìm được mộ'}</span></div><span>${q.b}–${q.d}</span></button></li>`}).join('');
  const tv=$('#vToVillage');if(tv)tv.addEventListener('click',()=>park&&park.focus(current));
  const gt=$('#vcard [data-tab]');if(gt)gt.addEventListener('click',()=>showTab('msg'));
}
$('#vmapMarks').addEventListener('click',e=>{const g=e.target.closest('.mk');if(g)select(g.dataset.id,true)});
$('#vlist').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)select(b.dataset.id,true)});
$('#vmapLayer').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;vLayer=b.dataset.l;$$('#vmapLayer button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderMap()});


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
  (function loop(now){const t=(now-t0)/1000;items.forEach(it=>{if(!it.vis||!it.W)return;const dur=Math.max(2.4,(it.W/(it.beats.length?Math.max(1,(it.beats[it.beats.length-1]-it.beats[0])/Math.max(1,it.beats.length-1)):200))*BEAT);
      const head=((t+(it.hero?0:1.3))/dur%1)*it.W;
      if(it.hero&&logo&&t>1.6&&it.prev!=null){const crossed=it.beats.some(b=>it.prev<b&&head>=b)||(it.prev<it.heart.hl&&head>=it.heart.hl);if(crossed){logo.classList.remove('beat');void logo.getBoundingClientRect();logo.classList.add('beat')}}
      it.prev=head;draw(it,head)});
    requestAnimationFrame(loop)})(t0);
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


/* ---------------- Tưởng niệm (đăng ký) / Thăm viếng (đăng nhập) ---------------- */
(function(){const m=$('#auth');let last=null;
  function tab(t){$$('.auth-tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));$('#fSignup').hidden=t!=='signup';$('#fLogin').hidden=t!=='login';setTimeout(()=>{const i=$(t==='signup'?'#aName':($('#lUser').value?'#lPass':'#lUser'));i&&i.focus()},30)}
  function open(t){last=document.activeElement;m.hidden=false;tab(t);document.body.style.overflow='hidden'}
  function close(){if(m.classList.contains('required')&&!document.body.classList.contains('signed'))return;m.hidden=true;m.classList.remove('required');document.body.style.overflow='';last&&last.focus&&last.focus()}
  window.ssAuthOpen=function(t,req){m.classList.toggle('required',!!req);var p=window.ssAuthPrefs?ssAuthPrefs():{};
    if(p.remember!==false&&p.id){$('#lUser').value=p.id;$('#aPhone').value||($('#aPhone').value=p.id);if(!t||req)t='login'}
    ['a','l'].forEach(k=>{$('#'+k+'Auto').checked=p.auto!==false;$('#'+k+'Rem').checked=p.remember!==false});open(t||'signup')};
  function savePrefs(k,id){const auto=$('#'+k+'Auto').checked,rem=$('#'+k+'Rem').checked;try{localStorage.setItem('ss-auth',JSON.stringify({auto,remember:rem,id:rem?id:''}));localStorage.removeItem('ss-out');sessionStorage.setItem('ss-session','1')}catch(e){}}
  document.addEventListener('click',e=>{const a=e.target.closest('[data-auth]');if(a){e.preventDefault();open(a.dataset.auth)}});
  m.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();const t=e.target.closest('[data-tab]');if(t)tab(t.dataset.tab)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)close()});
  // trạng thái đã vào: thay hai nút bằng lời chào (bản trình diễn, chưa có tài khoản thật)
  const slots=$$('.nav-auth,.msheet-auth'),orig=slots.map(el=>el.innerHTML);let user='';
  function setUser(n){user=n;slots.forEach((el,i)=>{el.innerHTML=n?`<a class="nav-user" href="#ca-nhan" title="Trang cá nhân"><i>${esc(n.trim().split(/\s+/).pop()[0]||'?')}</i>Chào, ${esc(n.trim().split(/\s+/).pop())}</a><button class="btn ghost" data-logout>Thoát</button>`:orig[i]})}
  document.addEventListener('click',e=>{if(e.target.closest('[data-logout]')){setUser('');ssMe.logout();try{localStorage.setItem('ss-out','1');sessionStorage.removeItem('ss-session')}catch(_){}setView('intro','dau-trang',true);document.documentElement.classList.add('pre-enter');scrollTo(0,0);window.ssAuthOpen('login',true);addEventListener('ss-auth-done',function(){document.documentElement.classList.remove('pre-enter')},{once:true})}});
  $('#fSignup').addEventListener('submit',e=>{e.preventDefault();const n=$('#aName').value.trim();if(!n){$('#aName').focus();return}ssMe.signup(n,$('#aPhone').value.trim());savePrefs('a',$('#aPhone').value.trim());document.body.classList.add('signed');close();dispatchEvent(new Event('ss-auth-done'));setUser(n);setView('app','ca-nhan',true);setTimeout(()=>toast('Chào mừng '+n+'. Hãy bắt đầu lập gia phả.'),500)});
  $('#fLogin').addEventListener('submit',e=>{e.preventDefault();const n=ssMe.login($('#lUser').value.trim());savePrefs('l',$('#lUser').value.trim());document.body.classList.add('signed');close();dispatchEvent(new Event('ss-auth-done'));setUser(n);setView('app','ca-nhan',true);setTimeout(()=>toast('Chào mừng trở lại, '+n+'.'),500)});
  window.ssSetUser=setUser;
})();


/* ---------------- Thiên giới: biển mây nhiều lớp, lầu gác trên mây, hạc bay, cánh hoa, đốm sáng ---------------- */
(function(){const hero=$('.hero'),cv=$('.hero-sky');if(!cv)return;const ctx=cv.getContext('2d');let W=0,H=0,dpr=1,vis=true,layers=[],pav=[],motes=[],petals=[],cranes=[];
  function puff(w,h,warm){const g=document.createElement('canvas');g.width=w;g.height=h;const x=g.getContext('2d');const bl=Math.max(6,Math.round(h*.06));x.filter='blur('+bl+'px)';
    const n=26+Math.floor(Math.random()*10);
    for(let i=0;i<n;i++){const u=Math.random(),cx=w*(.14+u*.72),arch=Math.sin(u*Math.PI);const rx=h*(.14+Math.random()*.2)*(1+arch*.6),ry=rx*(.5+Math.random()*.2);
      const cy=h*.72-arch*h*(.18+Math.random()*.12)-ry*.3;x.save();x.translate(cx,cy);x.scale(1,ry/rx);const gr=x.createRadialGradient(0,-rx*.25,0,0,0,rx);
      gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.6,'rgba(255,254,250,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.beginPath();x.arc(0,0,rx,0,7);x.fill();x.restore()}
    // bóng ấm dưới chân mây
    x.globalCompositeOperation='source-atop';x.filter='none';const sh=x.createLinearGradient(0,h*.35,0,h);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(1,warm?'rgba(236,206,160,.55)':'rgba(200,212,226,.5)');x.fillStyle=sh;x.fillRect(0,0,w,h);
    x.globalCompositeOperation='source-over';return g}
  function pavilion(w,h,tiers,col){const g=document.createElement('canvas');g.width=w;g.height=h;const x=g.getContext('2d');x.filter='blur(.6px)';const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,col);gr.addColorStop(.6,col);gr.addColorStop(.92,'rgba(255,255,255,0)');x.fillStyle=gr;x.strokeStyle=col;
    const cx=w/2,base=h*.62;// đá nổi
    x.beginPath();x.moveTo(cx-w*.34,base);for(let i=0;i<=12;i++){const t=i/12;x.lineTo(cx-w*.34+w*.68*t,base+Math.sin(t*Math.PI)*h*(.28+.06*Math.sin(t*9)))}x.closePath();x.fill();
    x.fillRect(cx-w*.3,base-h*.03,w*.6,h*.035);// nền
    let y=base-h*.03,bw=w*.42;for(let k=0;k<tiers;k++){const ch=h*(.1-.015*k);x.fillRect(cx-bw*.42,y-ch,bw*.84,ch);// thân
      for(let c=-2;c<=2;c++)x.fillRect(cx+c*bw*.18-1,y-ch,2,ch);
      y-=ch;const rw=bw*1.25,rh=h*.06;x.beginPath();x.moveTo(cx-rw/2-w*.03,y-rh*.2);x.quadraticCurveTo(cx-rw*.3,y-rh*.1,cx-rw*.28,y-rh);x.lineTo(cx+rw*.28,y-rh);x.quadraticCurveTo(cx+rw*.3,y-rh*.1,cx+rw/2+w*.03,y-rh*.2);x.lineTo(cx+rw/2,y+rh*.1);x.lineTo(cx-rw/2,y+rh*.1);x.closePath();x.fill();
      y-=rh;bw*=.72}
    x.beginPath();x.moveTo(cx-w*.012,y);x.lineTo(cx,y-h*.07);x.lineTo(cx+w*.012,y);x.fill();
    // cây tùng bên cạnh
    x.beginPath();const tx=cx+w*.24,ty=base-h*.02;x.moveTo(tx,ty);x.lineTo(tx+w*.01,ty-h*.12);x.lineWidth=2;x.stroke();[[0,.12,.09],[.02,.09,.07],[-.02,.15,.06]].forEach(([dx,dy,r])=>{x.beginPath();x.ellipse(tx+w*dx,ty-h*dy,w*r,h*r*.35,0,0,7);x.fill()});
    return g}
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const mob=W<700;
    pav=[[.70,.44,.09,2,'rgba(170,184,200,.26)',.012],[.95,.38,.13,3,'rgba(165,180,196,.30)',.009],[.84,.52,.2,3,'rgba(150,164,182,.36)',.006]].map(([px,py,sc,t,c,sp],i)=>{const w=Math.round(W*sc*(mob?1.6:1)),h=Math.round(w*1.1);return{img:pavilion(w,h,t,c),x:W*(mob?Math.min(.95,px+.05):px)-w/2,y:H*py-h*.62,w,h,ph:i*2,sp}});
    layers=[[.50,.34,['far'],5,.5],[.62,.42,['mid'],9,.75],[.74,.55,['near'],14,.92],[.88,.7,['front'],20,1]].map(([yb,sc,_,sp,op],li)=>{const arr=[];const n=mob?3:5;for(let i=0;i<n;i++){const w=W*(.42+Math.random()*.3)*(mob?1.6:1)*sc*1.7,h=w*.42;arr.push({img:puff(Math.round(w),Math.round(h),li>1),x:(i/n)*W*1.3-W*.15+Math.random()*W*.1,y:H*yb-h*.5+Math.random()*H*.04,w,h,v:sp*(.7+Math.random()*.5),o:op})}return arr});
    motes=Array.from({length:mob?24:46},()=>({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*1.7,v:3+Math.random()*7,sw:Math.random()*6}));
    petals=Array.from({length:mob?7:14},()=>({x:Math.random()*W,y:Math.random()*H*.8,s:3+Math.random()*3,vx:8+Math.random()*10,vy:6+Math.random()*8,r:Math.random()*6,vr:(Math.random()-.5)*1.5}));
    cranes=[{x:W*.2,y:H*.22,s:mob?9:13,v:9,ph:0},{x:W*.05,y:H*.28,s:mob?7:10,v:8,ph:1.7}]}
  new ResizeObserver(size).observe(hero);size();new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(hero);
  function crane(c,t){const f=Math.sin(t*1.6+c.ph);const s=c.s;ctx.save();ctx.translate(c.x,c.y+Math.sin(t*.5+c.ph)*4);ctx.strokeStyle='rgba(70,70,80,.45)';ctx.fillStyle='rgba(70,70,80,.45)';ctx.lineWidth=1.2;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-s*1.1,s*.05);ctx.lineTo(s*1.3,-s*.05);ctx.stroke();// thân + cổ dài
    ctx.beginPath();ctx.moveTo(-s*.2,0);ctx.quadraticCurveTo(-s*.9,-s*(.6+f*.8),-s*2.1,-s*(.2+f*1.1));ctx.quadraticCurveTo(-s*1,-s*(.1+f*.3),-s*.2,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(s*.1,0);ctx.quadraticCurveTo(-s*.4,-s*(.5+f*.7),-s*1.4,-s*(.4+f*1));ctx.quadraticCurveTo(-s*.5,-s*(.1+f*.25),s*.1,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(-s*1.1,s*.05);ctx.lineTo(-s*2,s*.25);ctx.stroke();ctx.restore()}
  function frame(now,dt){const t=now/1000;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const drawLayer=L=>L.forEach(c=>{c.x+=c.v*dt;if(c.x>W+20)c.x=-c.w-Math.random()*W*.2;ctx.globalAlpha=c.o;ctx.drawImage(c.img,c.x,c.y+Math.sin(t*.18+c.v)*3,c.w,c.h)});
    drawLayer(layers[0]);ctx.globalAlpha=1;pav.slice(0,2).forEach(p=>ctx.drawImage(p.img,p.x,p.y+Math.sin(t*.25+p.ph)*5,p.w,p.h));
    drawLayer(layers[1]);ctx.globalAlpha=1;const p=pav[2];ctx.drawImage(p.img,p.x,p.y+Math.sin(t*.22+p.ph)*6,p.w,p.h);
    drawLayer(layers[2]);ctx.globalAlpha=1;cranes.forEach(c=>{c.x+=c.v*dt;if(c.x>W+60){c.x=-60;c.y=H*(.16+Math.random()*.16)}crane(c,t)});
    drawLayer(layers[3]);ctx.globalAlpha=1;
    ctx.globalCompositeOperation='lighter';motes.forEach(m=>{m.y-=m.v*dt;m.x+=Math.sin(t*.5+m.sw)*5*dt;if(m.y<-6){m.y=H+6;m.x=Math.random()*W}const al=.3+.3*Math.sin(t*1.6+m.sw*3);const R=m.r*4;const g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,R);g.addColorStop(0,`rgba(255,236,190,${al.toFixed(2)})`);g.addColorStop(1,'rgba(255,236,190,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y,R,0,7);ctx.fill()});
    ctx.globalCompositeOperation='source-over';petals.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt+Math.sin(t+q.r)*.2;q.r+=q.vr*dt;if(q.x>W+10||q.y>H){q.x=-10;q.y=Math.random()*H*.6}ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.fillStyle='rgba(246,206,214,.7)';ctx.beginPath();ctx.ellipse(0,0,q.s,q.s*.55,0,0,7);ctx.fill();ctx.restore()})}
  if(reduce){frame(performance.now(),0);return}
  let last=performance.now();(function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(vis&&W)frame(now,dt);requestAnimationFrame(loop)})(last);
})();


/* ---------------- Vòng ký ức: album ảnh/video quay quanh tâm ---------------- */
(function(){
  const ringEl=$('#ring');if(!ringEl)return;
  const MEM=[
    {k:'school',y:1964,t:'Lớp bảy trường cấp hai xã',d:'Anh ngồi bàn thứ hai, cạnh cửa sổ. Thầy giáo cũ giữ tấm ảnh này suốt bốn mươi năm.',by:'Thầy Đặng Văn Hòa gửi',tone:'bw'},
    {k:'field',y:1966,t:'Mùa gặt làng Yên Bằng',d:'Mùa gặt cuối cùng anh còn ở nhà, đi cấy cùng mẹ bên bờ sông Đáy.',by:'Cháu Nam đăng',tone:'sepia'},
    {k:'flute',y:1968,t:'Anh và cây sáo trúc',d:'Mẹ kể anh hay ngồi trên lưng trâu thổi sáo, thổi lạc điệu mà vẫn thổi.',by:'Cháu Nam đăng',tone:'bw'},
    {k:'soldier',y:1970,t:'Ảnh thẻ trước ngày nhập ngũ',d:'Chụp ở hiệu ảnh thị xã, tháng 9 năm 1970. Đây là tấm ảnh được đặt trên bàn thờ.',by:'Gia đình',tone:'bw'},
    {k:'station',y:1970,t:'Sân ga ngày tiễn anh lên đường',d:'Thước phim gia đình dựng lại từ lời kể của bà và các cô.',by:'Cháu Trang dựng',tone:'faded',video:'02:14'},
    {k:'letter',y:1972,t:'Lá thư cuối gửi mẹ',d:'Bốn lá thư được bà giữ trong hộp bánh buộc chỉ đỏ. Đây là lá cuối, tháng 6 năm 1972.',by:'Gia đình',tone:'sepia'},
    {k:'mother',y:1985,t:'Mẹ ngồi chờ ở đầu ngõ',d:'Mỗi lần có người về từ Quảng Trị, bà lại mang hộp thư ra hỏi.',by:'Cô Lụa đăng',tone:'faded'},
    {k:'village',y:1990,t:'Ngôi nhà cũ bên lũy tre',d:'Ngôi nhà ba gian nơi anh lớn lên, trước khi gia đình xây lại.',by:'Chú Tuấn đăng',tone:'faded'},
    {k:'citadel',y:2009,t:'Lần đầu vào thăm Thành cổ',d:'Cháu Nam cõng bà vào viếng. Bà đặt lên mộ một nắm rơm khô mang từ quê.',by:'Cháu Nam quay',tone:'color',video:'06:42'},
    {k:'lotus',y:2012,t:'Ao sen trước nhà thờ họ',d:'Ao sen họ Phạm, nơi mỗi năm con cháu về giỗ chú.',by:'Cháu Trang đăng',tone:'color'},
    {k:'family',y:2019,t:'Giỗ chú, cả nhà quây quần',d:'Ngày 14 tháng 7 âm lịch, bốn thế hệ cùng ngồi quanh mâm cơm.',by:'Cháu Nam đăng',tone:'color'},
    {k:'river',y:2022,t:'Thả hoa đăng trên sông Thạch Hãn',d:'Những ngọn đèn hoa đăng trôi trên sông, tưởng nhớ những người đã nằm lại.',by:'Cháu Nam quay',tone:'color',video:'03:05'},
    {k:'graves',y:2025,t:'Chiều 27/7 ở nghĩa trang',d:'Hàng mộ trắng dưới nắng chiều, trước ngày Thương binh Liệt sĩ.',by:'Tổ chăm sóc mộ gửi',tone:'color'},
    {k:'incense',y:2026,t:'Nén hương năm nay',d:'Lần chăm mộ tháng 7 năm 2026: lau bia, dâng hoa cúc vàng, thắp hương thay gia đình.',by:'Tổ chăm sóc mộ gửi',tone:'color'}
  ];
  // ---------- vẽ ảnh minh họa ----------
  function rng(seed){let s=seed*9301+49297;return()=>(s=(s*9301+49297)%233280)/233280}
  function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,col])=>g.addColorStop(o,col));return g}
  function person(c,x,y,s,col,hat){c.fillStyle=col;c.beginPath();c.ellipse(x,y-s*1.55,s*.28,s*.32,0,0,7);c.fill();c.beginPath();c.moveTo(x-s*.5,y);c.quadraticCurveTo(x-s*.55,y-s*1.15,x,y-s*1.2);c.quadraticCurveTo(x+s*.55,y-s*1.15,x+s*.5,y);c.closePath();c.fill();
    if(hat){c.beginPath();c.moveTo(x-s*.62,y-s*1.62);c.lineTo(x,y-s*2.05);c.lineTo(x+s*.62,y-s*1.62);c.closePath();c.fill()}}
  const P={
    school(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#b9b4a6'],[1,'#7d786b']]);c.fillRect(0,0,w,h);c.fillStyle='#2f3b33';c.fillRect(w*.12,h*.1,w*.62,h*.36);c.strokeStyle='rgba(240,240,230,.7)';c.lineWidth=w*.004;for(let i=0;i<4;i++){c.beginPath();c.moveTo(w*.17,h*(.18+i*.065));c.lineTo(w*(.3+r()*.35),h*(.18+i*.065));c.stroke()}
      c.fillStyle='#e6e1d2';c.fillRect(w*.8,h*.08,w*.14,h*.4);c.fillStyle='#5b4a38';for(let row=0;row<2;row++)for(let i=0;i<4;i++){c.fillRect(w*(.05+i*.24),h*(.68+row*.16),w*.2,h*.04)}
      for(let i=0;i<7;i++)person(c,w*(.1+i*.13),h*(.72+(i%2)*.14),h*.14,'#3c352d')},
    field(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.45,[[0,'#d8c9a0'],[1,'#f0e2bd']]);c.fillRect(0,0,w,h*.45);c.fillStyle=lg(c,0,h*.45,0,h,[[0,'#a9a35a'],[1,'#6f7138']]);c.fillRect(0,h*.45,w,h*.55);
      c.strokeStyle='rgba(60,60,20,.35)';c.lineWidth=w*.003;for(let i=-10;i<=10;i++){c.beginPath();c.moveTo(w*.5,h*.45);c.lineTo(w*.5+i*w*.12,h);c.stroke()}
      c.fillStyle='#5b5a33';for(let i=0;i<14;i++){const x=r()*w;c.beginPath();c.ellipse(x,h*.44,w*.03,h*.04,0,0,7);c.fill()}
      person(c,w*.7,h*.86,h*.26,'#2d2a1e',true);person(c,w*.32,h*.74,h*.16,'#3a3624',true)},
    flute(c,w,h,r){c.fillStyle=lg(c,0,0,w,h,[[0,'#c9c6bd'],[1,'#7f7c74']]);c.fillRect(0,0,w,h);const x=w*.5,y=h;c.fillStyle='#2b2a27';c.beginPath();c.moveTo(x-w*.3,y);c.quadraticCurveTo(x-w*.28,y-h*.42,x,y-h*.45);c.quadraticCurveTo(x+w*.28,y-h*.42,x+w*.3,y);c.fill();
      c.fillStyle='#4a4741';c.beginPath();c.ellipse(x,h*.36,w*.1,h*.17,0,0,7);c.fill();c.fillStyle='#1d1c1a';c.beginPath();c.ellipse(x,h*.25,w*.105,h*.08,0,Math.PI,0);c.fill();
      c.strokeStyle='#d8cfb6';c.lineWidth=h*.025;c.beginPath();c.moveTo(x-w*.05,h*.44);c.lineTo(x+w*.32,h*.62);c.stroke()},
    soldier(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#d3d0c8'],[1,'#8e8b84']]);c.fillRect(0,0,w,h);const x=w*.5;c.fillStyle='#3d3f33';c.beginPath();c.moveTo(x-w*.3,h);c.quadraticCurveTo(x-w*.27,h*.6,x,h*.56);c.quadraticCurveTo(x+w*.27,h*.6,x+w*.3,h);c.fill();
      c.fillStyle='#57534b';c.fillRect(x-w*.04,h*.48,w*.08,h*.1);c.fillStyle='#6c6860';c.beginPath();c.ellipse(x,h*.38,w*.085,h*.15,0,0,7);c.fill();
      c.fillStyle='#4c5240';c.beginPath();c.ellipse(x,h*.27,w*.13,h*.12,0,Math.PI,0);c.fill();c.fillRect(x-w*.15,h*.265,w*.3,h*.03);c.fillStyle='#c9b25a';c.beginPath();c.arc(x,h*.2,h*.025,0,7);c.fill();
      c.strokeStyle='#2a2b23';c.lineWidth=w*.006;c.beginPath();c.moveTo(x-w*.06,h*.62);c.lineTo(x,h*.72);c.lineTo(x+w*.06,h*.62);c.stroke()},
    station(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.5,[[0,'#cfd3cf'],[1,'#e7e2d2']]);c.fillRect(0,0,w,h);c.fillStyle='#8b857a';c.fillRect(0,h*.5,w,h*.5);
      c.strokeStyle='#4e4a43';c.lineWidth=w*.006;[[.42,-.3],[.58,1.3]].forEach(([a,b])=>{c.beginPath();c.moveTo(w*a,h*.5);c.lineTo(w*b,h);c.stroke()});
      for(let i=0;i<8;i++){const t=i/8,yy=h*.5+h*.5*t*t;c.beginPath();c.moveTo(w*(.42-.72*t*t),yy);c.lineTo(w*(.58+.72*t*t),yy);c.stroke()}
      c.fillStyle='#3b3c3a';c.fillRect(w*.02,h*.28,w*.32,h*.3);c.fillStyle='#d9d4c4';for(let i=0;i<4;i++)c.fillRect(w*(.04+i*.075),h*.33,w*.05,h*.07);
      for(let i=0;i<5;i++)person(c,w*(.6+i*.08),h*(.66+r()*.04),h*.13,'#2e2b27',i%2===0)},
    letter(c,w,h,r){c.fillStyle=lg(c,0,0,w,h,[[0,'#7a5a3e'],[1,'#4e3826']]);c.fillRect(0,0,w,h);c.save();c.translate(w*.46,h*.5);c.rotate(-.08);c.fillStyle='#efe6cf';c.fillRect(-w*.3,-h*.4,w*.6,h*.8);
      c.strokeStyle='rgba(40,50,90,.55)';c.lineWidth=w*.0035;for(let i=0;i<9;i++){c.beginPath();let x=-w*.25;c.moveTo(x,-h*.3+i*h*.075);while(x<w*.2){x+=w*.02;c.lineTo(x,-h*.3+i*h*.075+Math.sin(x*.3+i)*h*.006)}c.stroke()}c.restore();
      c.save();c.translate(w*.8,h*.7);c.rotate(.18);c.fillStyle='#d9ccad';c.fillRect(-w*.14,-h*.12,w*.28,h*.24);c.strokeStyle='#a4977a';c.beginPath();c.moveTo(-w*.14,-h*.12);c.lineTo(0,h*.02);c.lineTo(w*.14,-h*.12);c.stroke();c.fillStyle='#b5443a';c.fillRect(w*.07,-h*.1,w*.05,h*.07);c.restore()},
    mother(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#d9d2bd'],[1,'#a8a089']]);c.fillRect(0,0,w,h);c.fillStyle='#8c8470';c.fillRect(0,h*.2,w*.18,h*.8);c.fillRect(w*.82,h*.2,w*.18,h*.8);c.fillStyle='#6a6352';c.fillRect(0,h*.15,w,h*.06);
      c.strokeStyle='#5d6a3c';c.lineWidth=w*.006;for(let i=0;i<16;i++){const x=r()*w;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+w*.03,h*.08,x+w*.06*(r()-.3),h*.16);c.stroke()}
      c.fillStyle='#6e5a44';c.fillRect(w*.47,h*.78,w*.12,h*.08);person(c,w*.53,h*.8,h*.3,'#2e2a24',true)},
    village(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.55,[[0,'#cfdad6'],[1,'#e9e4d0']]);c.fillRect(0,0,w,h);c.fillStyle='#55603b';for(let i=0;i<6;i++){const x=w*(i*.19);c.beginPath();c.ellipse(x,h*.36,w*.08,h*.26,0,0,7);c.fill()}
      c.fillStyle='#e6dfc8';c.fillRect(w*.3,h*.4,w*.4,h*.18);c.fillStyle='#8a4a33';c.beginPath();c.moveTo(w*.26,h*.42);c.lineTo(w*.5,h*.28);c.lineTo(w*.74,h*.42);c.closePath();c.fill();c.fillStyle='#4b3a2c';[.38,.48,.58].forEach(x=>c.fillRect(w*x,h*.47,w*.05,h*.11));
      c.fillStyle=lg(c,0,h*.6,0,h,[[0,'#6f8a86'],[1,'#3e5653']]);c.fillRect(0,h*.6,w,h*.4);c.globalAlpha=.25;c.fillStyle='#e6dfc8';c.fillRect(w*.3,h*.62,w*.4,h*.12);c.globalAlpha=1},
    citadel(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.5,[[0,'#9fc0dd'],[1,'#e8eef0']]);c.fillRect(0,0,w,h);c.fillStyle='#8f8676';c.fillRect(0,h*.32,w,h*.33);c.strokeStyle='rgba(60,50,40,.35)';c.lineWidth=1;for(let y=0;y<6;y++)for(let x=0;x<14;x++){c.strokeRect(x*w/14+(y%2)*w/28,h*.32+y*h*.055,w/14,h*.055)}
      c.fillStyle='#6e8b4a';c.fillRect(0,h*.65,w,h*.35);c.fillStyle='#e8c34a';for(let i=0;i<10;i++){c.beginPath();c.arc(w*(.45+r()*.12),h*(.72+r()*.06),h*.022,0,7);c.fill()}
      person(c,w*.3,h*.95,h*.3,'#2c3a46');person(c,w*.4,h*.97,h*.22,'#3b3330',true);person(c,w*.75,h*.93,h*.26,'#30343a')},
    lotus(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#3f5e4c'],[1,'#22372d']]);c.fillRect(0,0,w,h);for(let i=0;i<16;i++){c.fillStyle=i%2?'#5f8a4a':'#4c7a3e';c.beginPath();c.ellipse(r()*w,r()*h,w*(.06+r()*.05),h*(.05+r()*.04),r()*3,0,7);c.fill()}
      for(let i=0;i<6;i++){const x=w*(.1+r()*.8),y=h*(.15+r()*.7);c.fillStyle='#f0a8bb';for(let k=-2;k<=2;k++){c.beginPath();c.ellipse(x+k*w*.012,y,w*.014,h*.05,k*.35,0,7);c.fill()}c.fillStyle='#f7d2dc';c.beginPath();c.ellipse(x,y+h*.01,w*.012,h*.035,0,0,7);c.fill()}},
    family(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#c9a676'],[1,'#7b5a38']]);c.fillRect(0,0,w,h);c.fillStyle='#b13a2e';c.fillRect(w*.38,h*.06,w*.24,h*.14);c.fillStyle='#f2d9a0';c.fillRect(w*.4,h*.08,w*.2,h*.1);
      for(let i=0;i<6;i++){const a=Math.PI+i/5*Math.PI;person(c,w*.5+Math.cos(a)*w*.36,h*.7+Math.sin(a)*h*.18,h*.24,['#3a2e26','#4a3a2e','#2f2721'][i%3],false)}
      c.fillStyle='#5a3b25';c.beginPath();c.ellipse(w*.5,h*.72,w*.3,h*.13,0,0,7);c.fill();c.fillStyle='#efe6d2';for(let i=0;i<7;i++){c.beginPath();c.ellipse(w*(.3+i*.067),h*(.71+(i%2)*.03),w*.025,h*.02,0,0,7);c.fill()}
      for(let i=0;i<4;i++)person(c,w*(.24+i*.17),h*1.02,h*.28,'#2a211b')},
    river(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.45,[[0,'#2b3159'],[1,'#c97a5e']]);c.fillRect(0,0,w,h*.45);c.fillStyle=lg(c,0,h*.45,0,h,[[0,'#3a3550'],[1,'#141526']]);c.fillRect(0,h*.45,w,h*.55);
      c.fillStyle='#1b1a26';c.fillRect(0,h*.38,w,h*.07);for(let i=0;i<6;i++)c.fillRect(w*(.1+i*.16),h*.3,w*.02,h*.1);c.fillRect(0,h*.29,w,h*.02);
      for(let i=0;i<22;i++){const x=r()*w,y=h*(.5+r()*.48),s=.5+(y/h-.5)*2;const g=c.createRadialGradient(x,y,0,x,y,h*.05*s);g.addColorStop(0,'rgba(255,220,150,1)');g.addColorStop(1,'rgba(255,150,80,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,h*.05*s,0,7);c.fill();c.fillStyle='rgba(255,200,120,.35)';c.fillRect(x-1,y+h*.02,2,h*.06*s)}},
    graves(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.5,[[0,'#e9b27a'],[1,'#f6dcb6']]);c.fillRect(0,0,w,h);c.fillStyle='#7f9a58';c.fillRect(0,h*.45,w,h*.55);
      for(let row=0;row<5;row++){const y=h*(.5+row*row*.03+row*.06),s=.4+row*.25;for(let i=0;i<12;i++){const x=w*(i/11)+(row%2)*w*.04;c.fillStyle='#f3efe6';c.fillRect(x-w*.018*s,y-h*.07*s,w*.036*s,h*.07*s);c.beginPath();c.arc(x,y-h*.07*s,w*.018*s,Math.PI,0);c.fill();c.fillStyle='rgba(60,70,40,.35)';c.fillRect(x-w*.02*s,y,w*.04*s,h*.012*s)}}},
    incense(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#9db0a8'],[1,'#4d5b52']]);c.fillRect(0,0,w,h);c.fillStyle='#ece6d8';c.fillRect(w*.36,h*.12,w*.28,h*.55);c.beginPath();c.arc(w*.5,h*.12,w*.14,Math.PI,0);c.fill();
      c.fillStyle='#b8402f';c.font=`${Math.round(h*.06)}px serif`;c.textAlign='center';c.fillText('★',w*.5,h*.2);c.fillStyle='rgba(80,80,80,.55)';for(let i=0;i<4;i++)c.fillRect(w*.41,h*(.28+i*.07),w*.18,h*.015);
      c.fillStyle='#7a6a4a';c.fillRect(w*.3,h*.67,w*.4,h*.06);c.fillStyle='#8a6a2c';c.beginPath();c.ellipse(w*.5,h*.8,w*.07,h*.06,0,0,7);c.fill();
      c.strokeStyle='#b4413a';c.lineWidth=w*.004;[-1,0,1].forEach(k=>{c.beginPath();c.moveTo(w*.5+k*w*.012,h*.78);c.lineTo(w*.5+k*w*.02,h*.6);c.stroke()});
      c.strokeStyle='rgba(240,240,240,.5)';c.lineWidth=w*.004;c.beginPath();c.moveTo(w*.5,h*.6);c.bezierCurveTo(w*.46,h*.5,w*.56,h*.42,w*.5,h*.3);c.stroke();
      [[.22,'#f2c94c'],[.78,'#f2c94c']].forEach(([x,col])=>{c.fillStyle='#5b6e3a';c.fillRect(w*x-w*.008,h*.62,w*.016,h*.2);c.fillStyle=col;for(let i=0;i<7;i++){c.beginPath();c.arc(w*x+(r()-.5)*w*.08,h*(.58+(r()-.5)*.1),h*.03,0,7);c.fill()}})}
  };
  function tone(c,w,h,mode,seed){const r=rng(seed);const g=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=g;c.fillRect(0,0,w,h);
    const im=c.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){let R=d[i],Gc=d[i+1],B=d[i+2];const y=.3*R+.59*Gc+.11*B;
      if(mode==='bw'){R=Gc=B=y}else if(mode==='sepia'){R=y*1.07+18;Gc=y*.95+8;B=y*.78}else if(mode==='faded'){R=R*.6+y*.4+14;Gc=Gc*.6+y*.4+8;B=B*.6+y*.4}
      const n=(r()-.5)*26;d[i]=R+n;d[i+1]=Gc+n;d[i+2]=B+n}c.putImageData(im,0,0)}
  function paint(cv,item,idx,W,H){const dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const c=cv.getContext('2d');
    if(item.img){const w=cv.width,h=cv.height,k=Math.max(w/item.img.width,h/item.img.height),iw=item.img.width*k,ih=item.img.height*k;c.drawImage(item.img,(w-iw)/2,(h-ih)/2,iw,ih);return}const w=cv.width,h=cv.height;
    (P[item.k]||P.field)(c,w,h,rng(idx*17+3));tone(c,w,h,item.tone,idx*31+7)}
  // ---------- dựng vòng ----------
  const tilesEl=$('#ringTiles'),n=MEM.length;$('#ringCount').textContent=`${n} kỷ vật · ${MEM[0].y} – ${MEM[n-1].y}`;
  const tiles=MEM.map((m,i)=>{const b=document.createElement('button');b.className='rt';b.setAttribute('aria-label',`${m.y}, ${m.t}`);const cv=document.createElement('canvas');b.appendChild(cv);
    if(m.video){const v=document.createElement('span');v.className='rt-vid';v.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M7 4v16l13-8z"/></svg>${m.video}`;b.appendChild(v)}
    const yr=document.createElement('span');yr.className='rt-y';yr.textContent=m.y;b.appendChild(yr);tilesEl.appendChild(b);paint(cv,m,i,300,200);return b});
  // ảnh thật của gia đình: thay lần lượt các tấm minh họa (chỉ trong phiên xem này)
  // shortcut: ảnh chưa được lưu lên máy chủ, mất khi tải lại trang; cần kho lưu ảnh khi làm sản phẩm thật
  const loadImg=f=>(window.createImageBitmap?createImageBitmap(f):new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=URL.createObjectURL(f)}));
  $('#ringUpload').addEventListener('change',async e=>{const files=[...e.target.files].filter(f=>f.type.startsWith('image/'));let done=0;
    for(const f of files){const i=MEM.findIndex(m=>!m.img);if(i<0)break;try{const img=await loadImg(f);const m=MEM[i];m.img=img;m.t=f.name.replace(/\.[^.]+$/,'').slice(0,60);m.y=new Date(f.lastModified||Date.now()).getFullYear();m.d='Ảnh gia đình tải lên.';m.by='Bạn vừa tải lên';delete m.video;
      tiles[i].querySelector('.rt-y').textContent=m.y;const v=tiles[i].querySelector('.rt-vid');v&&v.remove();tiles[i].setAttribute('aria-label',`${m.y}, ${m.t}`);paint(tiles[i].querySelector('canvas'),m,i,300,200);done++}catch(_){}}
    e.target.value='';toast(done?`Đã thêm ${done} ảnh vào vòng ký ức. Ảnh chỉ lưu trong lần xem này.`:'Không đọc được ảnh. Hãy chọn tệp JPG hoặc PNG.')});
  let base=0,vel=0,hover=-1,t0=performance.now(),last=t0,drag=null,vis=false;
  new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(ringEl);
  function setCap(i){if(i<0){$('#rcN').textContent='—';$('#rcT').textContent='Rê chuột hoặc chạm vào một kỷ vật';$('#rcY').textContent='';return}const m=MEM[i];$('#rcN').textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');$('#rcT').textContent=m.t+(m.video?' · video '+m.video:'');$('#rcY').textContent=m.y}
  function setHover(i){hover=i;tiles.forEach((t,k)=>t.classList.toggle('on',k===i));ringEl.classList.toggle('has-hover',i>=0);setCap(i)}
  tiles.forEach((t,i)=>{t.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setHover(i)});t.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')setHover(-1)});
    t.addEventListener('focus',()=>setHover(i));t.addEventListener('blur',()=>setHover(-1));
    t.addEventListener('click',e=>{if(drag&&drag.moved)return;if(e.pointerType!=='mouse'&&hover!==i&&matchMedia('(hover:none)').matches){setHover(i);return}openLB(i)})});
  ringEl.addEventListener('pointerdown',e=>{drag={x:e.clientX,b:base,moved:false,id:e.pointerId}});
  addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.moved=true;if(drag.moved){const nb=drag.b+dx*.006;vel=(nb-base)*60;base=nb}});
  addEventListener('pointerup',()=>{setTimeout(()=>drag=null,0)});
  $('#ringPrev').addEventListener('click',()=>vel-=1.6);$('#ringNext').addEventListener('click',()=>vel+=1.6);
  ringEl.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){vel-=1.6;e.preventDefault()}else if(e.key==='ArrowRight'){vel+=1.6;e.preventDefault()}});
  let scrollA=0;function sc(){const r=ringEl.getBoundingClientRect();scrollA=((innerHeight-r.top)/(innerHeight+r.height))*Math.PI*.9}addEventListener('scroll',sc,{passive:true});sc();
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    if(vis){const W=ringEl.clientWidth,H=ringEl.clientHeight,tw=tiles[0].offsetWidth,th=tiles[0].offsetHeight;
      if(!drag||!drag.moved){base+=vel*dt;vel*=Math.pow(.04,dt);if(!reduce&&hover<0)base+=dt*.05}
      const A=base+scrollA,Rx=Math.min(W*.37,W/2-tw*.42),Ry=Math.min(H*.34,H/2-th*.62);
      tiles.forEach((t,i)=>{const a=A+i/n*Math.PI*2,x=W/2+Rx*Math.cos(a),y=H/2+Ry*Math.sin(a),d=(Math.sin(a)+1)/2;let s=.7+.42*d;if(i===hover)s*=1.28;
        t.style.transform=`translate3d(${(x-tw/2).toFixed(1)}px,${(y-th/2).toFixed(1)}px,0) scale(${s.toFixed(3)}) rotate(${(Math.cos(a)*-4).toFixed(2)}deg)`;t.style.zIndex=i===hover?300:Math.round(d*100);t.style.opacity=(i===hover?1:.55+.45*d).toFixed(2)})}
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);setCap(-1);
  // ---------- xem lớn ----------
  const lb=$('#lb');let cur=0;
  function show(i){cur=(i+n)%n;const m=MEM[cur];paint($('#lbCanvas'),m,cur,900,600);$('#lbN').textContent=String(cur+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');$('#lbY').textContent=m.y;$('#lbT').textContent=m.t;$('#lbD').textContent=m.d;$('#lbBy').textContent=m.by+' · ảnh minh họa';$('#lbPlay').hidden=!m.video;$('#lbPlay').dataset.len=m.video||''}
  function openLB(i){window.ssChime&&window.ssChime();show(i);lb.hidden=false;document.body.style.overflow='hidden';$('#lbClose').focus()}
  function closeLB(){lb.hidden=true;document.body.style.overflow='';tiles[cur]&&tiles[cur].focus({preventScroll:true})}
  $('#lbPrev').addEventListener('click',()=>show(cur-1));$('#lbNext').addEventListener('click',()=>show(cur+1));
  lb.addEventListener('click',e=>{if(e.target.closest('[data-lbclose]'))closeLB()});
  $('#lbPlay').addEventListener('click',()=>toast('Video mẫu ('+$('#lbPlay').dataset.len+'). Gia đình sẽ tải video thật lên đây.'));
  addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')closeLB();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1)});
})();


/* ---------------- Đèn trời bay lên sau lời mời ---------------- */
(function(){const cv=$('.icta .lanterns');if(!cv)return;const ctx=cv.getContext('2d');let W=0,H=0,dpr=1,vis=false,L=[];
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr}
  new ResizeObserver(size).observe(cv);new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
  const mk=init=>({x:W*(.5+Math.random()*.5),y:init?Math.random()*H:H+30,s:6+Math.random()*12,v:8+Math.random()*14,sw:Math.random()*6,f:Math.random()*6});
  function draw(l,t){const s=l.s,x=l.x+Math.sin(t*.4+l.sw)*10,y=l.y;const fl=.8+.2*Math.sin(t*6+l.f);
    const g=ctx.createRadialGradient(x,y,0,x,y,s*3.2);g.addColorStop(0,`rgba(240,170,80,${.38*fl})`);g.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,s*3.2,0,7);ctx.fill();
    ctx.fillStyle=lgr(x,y,s,fl);ctx.beginPath();ctx.moveTo(x-s*.55,y-s*.75);ctx.lineTo(x+s*.55,y-s*.75);ctx.lineTo(x+s*.42,y+s*.7);ctx.lineTo(x-s*.42,y+s*.7);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(255,250,220,${.9*fl})`;ctx.beginPath();ctx.ellipse(x,y+s*.55,s*.14,s*.2,0,0,7);ctx.fill()}
  function lgr(x,y,s,fl){const g=ctx.createLinearGradient(x,y-s,x,y+s);g.addColorStop(0,`rgba(255,150,70,${.55*fl})`);g.addColorStop(1,`rgba(255,215,150,${.95*fl})`);return g}
  if(reduce){setTimeout(()=>{size();L=Array.from({length:10},()=>mk(true));ctx.setTransform(dpr,0,0,dpr,0,0);L.forEach(l=>draw(l,0))},300);return}
  let last=performance.now();(function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    if(vis&&W){if(!L.length)L=Array.from({length:W<600?9:16},()=>mk(true));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);const t=now/1000;
      L.forEach((l,i)=>{l.y-=l.v*dt;if(l.y<-30)L[i]=mk(false);const a=Math.min(1,(H-l.y)/80)*Math.min(1,(l.y+30)/90);ctx.globalAlpha=Math.max(0,a);draw(l,t)});ctx.globalAlpha=1}
    requestAnimationFrame(loop)})(last);
})();


/* ---------------- Menu điện thoại ---------------- */
(function(){const btn=$('#navMenu'),sh=$('#msheet');if(!btn)return;
  function set(o){sh.hidden=!o;btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Đóng menu':'Mở menu');document.body.classList.toggle('menu-open',o);
    if(o){const on=$('#mainNav a.on');$$('.msheet-links a').forEach(a=>a.classList.toggle('on',!!on&&a.getAttribute('href')===on.getAttribute('href')));const f=sh.querySelector('a');f&&f.focus({preventScroll:true})}}
  btn.addEventListener('click',()=>set(sh.hidden));
  sh.addEventListener('click',e=>{if(e.target.closest('a,[data-auth]'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!sh.hidden){set(false);btn.focus()}});
  matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)set(false)});
})();




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
  function build(){ctx=new AC();master=ctx.createGain();master.gain.value=0;
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
  window.ssBell=()=>{if(on){bell(146.83,.9);mo(.05,.5)}};window.ssChime=()=>{if(on){zheng(74,.6,0,0);zheng(79,.5,.16,0)}};
  let pref=null;try{pref=localStorage.getItem('ss-sound')}catch(e){}
  // mặc định luôn bật (âm lượng 20%); chỉ tắt nếu người xem đã chủ động tắt
  if(pref!=='0'){
    const startNow=()=>{setOn(true,false);if(ctx&&ctx.state!=='running'){// trình duyệt chặn tự phát: phát ngay ở lần chạm/bấm phím đầu tiên
        const first=e=>{if(e.target.closest&&e.target.closest('#sndBtn'))return;['pointerdown','keydown','touchstart'].forEach(ev=>removeEventListener(ev,first,true));if(on){ctx.resume();const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(0,t);master.gain.linearRampToValueAtTime(VOL,t+5)}};
        ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,first,true))}};
    if(document.documentElement.classList.contains('is-loading'))setTimeout(startNow,600);else startNow()}
})();


/* ---------------- Ảnh chân dung do gia đình tải lên ---------------- */
$('#lmUpload').addEventListener('change',e=>{const f=e.target.files[0];if(!f||!f.type.startsWith('image/'))return;const box=$('#lmPortrait');let im=box.querySelector('img');if(!im){im=document.createElement('img');im.alt='Chân dung do gia đình tải lên';box.insertBefore(im,box.querySelector('svg'))}
  im.src=URL.createObjectURL(f);$('.lm-cap').textContent='Ảnh gia đình tải lên · chỉ lưu trong lần xem này';e.target.value=''});


/* ---------------- Trang cá nhân: gia phả, làng dòng họ, nhà 3D, ví nén ---------------- */
(function(){
  const KEY='ss-me';const ME={user:null,members:[],seq:1};
  const get=id=>ME.members.find(m=>m.id===id);
  const dead=()=>ME.members.filter(m=>m.d);
  const surname=()=>(ME.user&&ME.user.name.trim().split(/\s+/)[0])||'';
  const isClan=()=>dead().length>=2;
  const yrs=m=>m.d?`${m.b||'?'} – ${m.d}`:`${m.b||'?'} · còn sống`;
  const hk=m=>m.houseOf&&get(m.houseOf)?m.houseOf:m.id;
  function save(){try{const hs={};dead().forEach(m=>{const k=hk(m);if(homes[k])hs[k]=homes[k]});localStorage.setItem(KEY,JSON.stringify({user:ME.user,members:ME.members,seq:ME.seq,balance,homes:hs}))}catch(e){}}
  function restore(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d||!d.user)return false;ME.user=d.user;ME.members=d.members||[];ME.seq=d.seq||ME.members.length+1;if(typeof d.balance==='number')setBalance(d.balance);Object.assign(homes,d.homes||{});ME.members.forEach(reg);return true}catch(e){return false}}
  // đưa người đã khuất của gia đình vào hệ thống hồ sơ + nhà 3D chung của trang
  function reg(m){const exist=byId[m.id];if(!m.d){if(exist){people.splice(people.indexOf(exist),1);delete byId[m.id]}return}
    const p=exist||{id:m.id,mine:true,inc:0};Object.assign(p,{c:m.ls?'ls':'dh',name:m.name,title:m.ls?'Liệt sĩ':(m.g==='f'?'Người mẹ, người bà của dòng họ':'Người cha, người ông của dòng họ'),b:m.b||'?',d:m.d,place:ME.user.place||'Quê nhà',
      facts:[['Sinh',m.b?String(m.b):'Chưa rõ'],['Mất',String(m.d)],['Quê quán',ME.user.place||'Chưa cập nhật'],['Dòng họ',surname()?('Họ '+surname()):'—'],['Người lập hồ sơ',ME.user.name],['Ngày giỗ','Gia đình chưa cập nhật']],
      ch:[[String(m.d),'Ghi nhớ','Gia đình đang bổ sung câu chuyện về '+m.name+'.']],letter:'“Con cháu luôn nhớ về người.”',cite:'Lời gia đình',story:['Trang này do '+ME.user.name+' lập. Hãy thêm ảnh và câu chuyện để con cháu đời sau hiểu thêm về '+m.name+'.'],bio:'',houseOf:m.houseOf&&get(m.houseOf)?m.houseOf:null});
    if(!exist){people.push(p);byId[m.id]=p}}
  function syncRecipients(){$('#recipient').innerHTML=people.map(p=>`<option value="${p.id}">${esc(p.name)}${p.mine?' · gia đình':''}</option>`).join('')}

  // ---------- cây gia đình ----------
  const NW=156,NH=62,SG=14,GX=26,GY=64;let sel=null;
  const unitOf=m=>{const s=m.spouse&&get(m.spouse);return s&&!s.parent?[m,s]:[m]};
  const kidsOf=u=>{const ids=u.map(x=>x.id);return ME.members.filter(c=>c.parent&&ids.includes(c.parent)).sort((a,b)=>(a.b||9999)-(b.b||9999))};
  function width(u,seen){const own=u.length*NW+(u.length-1)*SG;const ks=kidsOf(u).filter(k=>!seen.has(k.id));ks.forEach(k=>seen.add(k.id));const kw=ks.reduce((a,k)=>a+width(unitOf(k),seen),0)+GX*Math.max(0,ks.length-1);return Math.max(own,kw)}
  function drawTree(){const svg=$('#treeSvg');const pos={},links=[],pairs=[];let maxD=0;
    const roots=[];ME.members.forEach(m=>{if(m.parent&&get(m.parent))return;const s=m.spouse&&get(m.spouse);if(s&&s.parent&&get(s.parent))return;if(s&&roots.includes(s))return;roots.push(m)});
    const placed=new Set();
    function place(u,x,depth){const w=width(u,new Set());const own=u.length*NW+(u.length-1)*SG;const ox=x+(w-own)/2;u.forEach((m,i)=>{pos[m.id]={x:ox+i*(NW+SG),y:depth*(NH+GY)};placed.add(m.id)});if(u.length>1)pairs.push(u);maxD=Math.max(maxD,depth);
      const ks=kidsOf(u).filter(k=>!placed.has(k.id));const widths=ks.map(k=>width(unitOf(k),new Set()));const kw=widths.reduce((a,b)=>a+b,0)+GX*Math.max(0,ks.length-1);let cx=x+(w-kw)/2;
      ks.forEach((k,i)=>{place(unitOf(k),cx,depth+1);links.push([u,k]);cx+=widths[i]+GX})}
    let x=0;roots.forEach(r=>{const u=unitOf(r);place(u,x,0);x+=width(u,new Set())+GX*2});
    ME.members.forEach(m=>{if(!placed.has(m.id)){pos[m.id]={x,y:0};x+=NW+GX}});
    const L=64,W=Math.max(x-GX*2,NW)+L+20,H=(maxD+1)*(NH+GY)-GY+24;svg.setAttribute('viewBox',`-${L} -12 ${W} ${H}`);svg.style.width=W+'px';svg.style.height=H+'px';
    let g='';for(let d=0;d<=maxD;d++)g+=`<text class="tg" x="-${L-4}" y="${d*(NH+GY)+NH/2+4}">Đời ${d+1}</text>`;
    links.forEach(([u,k])=>{const a=pos[u[0].id],b=u[1]?pos[u[1].id]:null;const x1=b?(a.x+b.x+NW)/2:a.x+NW/2,y1=a.y+NH,p=pos[k.id],x2=p.x+NW/2,y2=p.y,ym=y1+GY/2;g+=`<path class="tl" d="M${x1} ${y1}V${ym}H${x2}V${y2}"/>`});
    pairs.forEach(([a,b])=>{const p=pos[a.id],q=pos[b.id];g+=`<path class="ts" d="M${p.x+NW} ${p.y+NH/2}H${q.x}"/><circle class="tsd" cx="${(p.x+NW+q.x)/2}" cy="${p.y+NH/2}" r="4"/>`});
    ME.members.forEach(m=>{const p=pos[m.id];const nm=m.name.length>19?m.name.slice(0,18)+'…':m.name;
      g+=`<g class="tn${m.d?' dead':''}${m.self?' self':''}${sel===m.id?' on':''}" data-id="${m.id}" tabindex="0" role="button" aria-label="${esc(m.name)}, ${yrs(m)}" transform="translate(${p.x},${p.y})"><rect width="${NW}" height="${NH}" rx="8"/>
        ${m.d?`<path class="ic" d="M14 40v-12h4v12zM16 27c-2-3 0-5 0-7 2 2 3 4 0 7z"/>`:`<circle class="ic" cx="16" cy="31" r="4"/>`}${m.ls?`<text class="star" x="${NW-14}" y="18">★</text>`:''}
        <text class="n" x="28" y="27">${esc(nm)}</text><text class="y" x="28" y="45">${m.self?'Bạn · ':''}${yrs(m)}</text></g>`});
    svg.innerHTML=g;$('#treeEmpty').hidden=ME.members.length>1;$('#meSample').hidden=ME.members.length>1}
  $('#treeSvg').addEventListener('click',e=>{const n=e.target.closest('.tn');if(n){sel=n.dataset.id;drawTree();side()}});
  $('#treeSvg').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.tn')){e.preventDefault();sel=e.target.closest('.tn').dataset.id;drawTree();side()}});

  // ---------- bảng bên: chi tiết / thêm người ----------
  function opts(filter){return ME.members.filter(filter||(()=>true)).map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}
  function side(mode,preset){const el=$('#treeSide');const m=sel&&get(sel);
    if(mode==='add'||!m){const pr=preset||{};el.innerHTML=`<h3>Thêm người vào gia phả</h3>
      <form id="addForm" class="me-form" novalidate>
        <label>Họ và tên<input id="nfName" required maxlength="60" placeholder="Ví dụ: Phạm Hữu Cần"></label>
        <div class="row2"><label>Giới tính<select id="nfG"><option value="m">Nam</option><option value="f">Nữ</option></select></label><label>Năm sinh<input id="nfB" inputmode="numeric" maxlength="4" placeholder="1922"></label></div>
        <div class="row2"><label>Năm mất<input id="nfD" inputmode="numeric" maxlength="4" placeholder="Để trống nếu còn sống"></label><label class="chk"><input type="checkbox" id="nfLs"> Liệt sĩ</label></div>
        <div class="row2"><label>Quan hệ<select id="nfRel"><option value="child">Con của</option><option value="spouse">Vợ/Chồng của</option><option value="parent">Bố/Mẹ của</option></select></label><label>&nbsp;<select id="nfTo">${opts()}</select></label></div>
        <label>Nhà tưởng niệm 3D<select id="nfHouse"><option value="">Nhà riêng</option>${dead().map(d=>`<option value="${hk(d)}">Ở chung nhà với ${esc(d.name)}</option>`).join('')}</select></label>
        <p class="err" id="nfErr" role="alert"></p>
        <button class="btn" type="submit">Thêm vào gia phả</button>${m?'<button class="btn ghost" type="button" id="nfCancel">Huỷ</button>':''}
      </form>`;
      if(pr.rel)$('#nfRel').value=pr.rel;if(pr.to)$('#nfTo').value=pr.to;const c=$('#nfCancel');c&&c.addEventListener('click',()=>side());
      $('#addForm').addEventListener('submit',e=>{e.preventDefault();addMember()});$('#nfName').focus({preventScroll:true});return}
    const par=m.parent&&get(m.parent),sp=m.spouse&&get(m.spouse),kids=ME.members.filter(c=>c.parent===m.id||(m.spouse&&c.parent===m.spouse));
    const mates=m.d?dead().filter(x=>x.id!==m.id&&hk(x)===hk(m)):[];
    el.innerHTML=`<span class="eyebrow">${m.ls?'Liệt sĩ':m.d?'Người đã khuất':'Người thân còn sống'}</span><h3>${esc(m.name)}</h3><p class="me-y">${yrs(m)}${m.self?' · tài khoản của bạn':''}</p>
      <dl class="me-dl">${par?`<div><dt>Bố/Mẹ</dt><dd>${esc(par.name)}</dd></div>`:''}${sp?`<div><dt>Vợ/Chồng</dt><dd>${esc(sp.name)}</dd></div>`:''}${kids.length?`<div><dt>Con</dt><dd>${kids.map(k=>esc(k.name)).join(', ')}</dd></div>`:''}${mates.length?`<div><dt>Chung nhà 3D</dt><dd>${mates.map(k=>esc(k.name)).join(', ')}</dd></div>`:''}</dl>
      ${m.d?`<div class="me-act"><button class="btn" data-go="house">Vào nhà 3D</button><button class="btn ghost" data-go="profile">Xem hồ sơ</button><button class="btn ghost" data-go="incense">Thắp hương</button></div>`:''}
      <div class="me-quick"><button data-q="child">+ Thêm con</button>${sp?'':'<button data-q="spouse">+ Vợ/Chồng</button>'}${par?'':'<button data-q="parent">+ Bố/Mẹ</button>'}${m.self?'':'<button data-q="del" class="del">Xoá khỏi gia phả</button>'}</div>`;
    el.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{const q=b.dataset.q;if(q==='del'){delMember(m.id);return}side('add',{rel:q,to:m.id})}));
    el.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const go=b.dataset.go;if(go==='house')enterHouse(m.id);else if(go==='profile'){select(m.id,false);setView('app','ho-so',true)}else{select(m.id,false);lightIncense();refresh()}}))}
  function year(v){v=v.trim();if(!v)return null;const n=+v;return Number.isInteger(n)&&n>=1800&&n<=new Date().getFullYear()?n:NaN}
  function addMember(){const name=$('#nfName').value.trim(),b=year($('#nfB').value),d=year($('#nfD').value),err=$('#nfErr');
    if(!name){err.textContent='Hãy nhập họ và tên.';return}if(Number.isNaN(b)||Number.isNaN(d)){err.textContent='Năm sinh, năm mất phải là số từ 1800 đến năm nay.';return}if(b&&d&&d<b){err.textContent='Năm mất không thể trước năm sinh.';return}
    const rel=$('#nfRel').value,to=get($('#nfTo').value);if(!to){err.textContent='Hãy chọn người để nối quan hệ.';return}
    if(rel==='spouse'&&to.spouse){err.textContent=to.name+' đã có vợ/chồng trong gia phả.';return}if(rel==='parent'&&to.parent){err.textContent=to.name+' đã có bố/mẹ trong gia phả. Hãy thêm vợ/chồng cho người đó.';return}
    const m={id:'u'+(ME.seq++),name,g:$('#nfG').value,b,d,ls:$('#nfLs').checked&&!!d,parent:null,spouse:null,houseOf:d&&$('#nfHouse').value||null};
    if(rel==='child')m.parent=to.id;else if(rel==='spouse'){m.spouse=to.id;to.spouse=m.id;m.parent=null}else{to.parent=m.id}
    const wasClan=isClan();ME.members.push(m);reg(m);sel=m.id;refresh();side();toast(d?`Đã thêm ${name}. Nhà tưởng niệm trong làng đã sẵn sàng.`:`Đã thêm ${name} vào gia phả.`);
    if(!wasClan&&isClan())setTimeout(()=>toast(`Đã lập dòng họ ${surname()}. Làng dòng họ đã mở.`),2800)}
  function delMember(id){const m=get(id);if(!m||m.self)return;ME.members.forEach(x=>{if(x.parent===id)x.parent=m.spouse||null;if(x.spouse===id)x.spouse=null;if(x.houseOf===id)x.houseOf=null});
    ME.members=ME.members.filter(x=>x!==m);m.d=null;reg(m);sel=null;refresh();side();toast('Đã xoá '+m.name+' khỏi gia phả.')}

  // ---------- làng dòng họ 3D (cùng bộ dựng hình với làng chung) ----------
  let clan=null;
  function drawVillage(){const box=$('#meVillage');
    box.innerHTML='<div class="me-lock"><b>Làng tưởng niệm</b><p>Nhà của từng người thân nằm trong Làng tưởng niệm dưới chân núi chùa.</p><button class="btn" type="button" data-go-lang>Vào làng</button></div>';
    box.querySelector('[data-go-lang]').addEventListener('click',()=>window.ssGoWorld&&ssGoWorld('lang'))}
  

  // ---------- danh sách nhà 3D ----------
  function drawHouses(){const box=$('#meHouses');const groups={};dead().forEach(m=>{(groups[hk(m)]=groups[hk(m)]||[]).push(m)});const ks=Object.keys(groups);
    box.innerHTML=ks.length?ks.map(k=>{const ms=groups[k],h=homes[k],n=h?h.gifts.length:0;return `<article class="me-hc"><svg viewBox="0 0 60 44" aria-hidden="true"><path d="M6 22 30 8l24 14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 22v16h40V22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M26 38v-9h8v9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      <h4>${ms.map(m=>esc(m.name)).join(' & ')}</h4><p>${ms.map(m=>yrs(m)).join(' · ')}</p><p class="me-hg">${n?n+' món quà trong nhà':'Chưa có quà'}${ms.length>1?' · nhà chung':''}</p>
      <div class="me-act"><button class="btn" data-k="${k}" data-a="in">Vào nhà 3D</button><button class="btn ghost" data-k="${k}" data-a="shop">Cửa hàng</button></div></article>`}).join('')
      :`<div class="me-lock"><b>Chưa có nhà tưởng niệm</b><p>Thêm một người đã khuất vào gia phả, ngôi nhà 3D của người sẽ được dựng ngay.</p><button class="btn" data-goto="tree">Thêm vào gia phả</button></div>`;
    box.querySelectorAll('button[data-a]').forEach(b=>b.addEventListener('click',()=>enterHouse(b.dataset.k,b.dataset.a==='shop')))}

  // ---------- chung ----------
  function enterHouse(id,shop){select(id,false);if(shop){setView('app','cua-hang',true);return}window.ssGoWorld&&ssGoWorld('nha',id)}
  function head(){const u=ME.user;$('#meAv').textContent=(u.name.trim().split(/\s+/).pop()||'?')[0].toUpperCase();$('#meName').textContent=u.name;$('#meSub').textContent=[u.contact,u.place,'Thành viên từ '+u.since].filter(Boolean).join(' · ');
    const dc=dead().length,hc=new Set(dead().map(hk)).size;$('#meStats').innerHTML=[[ME.members.length,'người trong gia phả'],[dc,'người đã khuất'],[hc,'ngôi nhà 3D'],[isClan()?('Họ '+surname()):'Chưa lập','dòng họ']].map(([v,l])=>`<div><b>${esc(String(v))}</b><span>${l}</span></div>`).join('');
    $('#meClan').hidden=!isClan();$('#meClan').textContent='Dòng họ '+surname()}
  function refresh(){if(!ME.user)return;ME.members.forEach(reg);syncRecipients();head();drawTree();drawVillage();drawHouses();save()}
  function tab(t){$$('#meTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t));$$('[data-mp]').forEach(p=>p.hidden=p.dataset.mp!==t)}
  $('#meTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t)});
  $('#ca-nhan').addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){tab(g.dataset.goto);if(g.dataset.goto==='tree'){sel=null;side('add')}}});
  $('#meSample').addEventListener('click',()=>{const self=ME.members.find(m=>m.self);const sn=surname()||'Phạm';const id=()=>'u'+(ME.seq++);
    const a={id:id(),name:sn+' Văn Lễ',g:'m',b:1890,d:1951},b={id:id(),name:'Đinh Thị Tơ',g:'f',b:1894,d:1960},c={id:id(),name:sn+' Văn Cần',g:'m',b:1922,d:1990},w={id:id(),name:'Trần Thị Gái',g:'f',b:1925,d:2011},k={id:id(),name:sn+' Văn Khiêm',g:'m',b:1951,d:1972,ls:true},f={id:id(),name:sn+' Văn Khôi',g:'m',b:1948,d:2020};
    a.spouse=b.id;b.spouse=a.id;c.parent=a.id;c.spouse=w.id;w.spouse=c.id;w.houseOf=c.id;b.houseOf=a.id;k.parent=c.id;f.parent=c.id;self.parent=f.id;
    [a,b,c,w,k,f].forEach(m=>{m.parent=m.parent||null;m.spouse=m.spouse||null;m.houseOf=m.houseOf||null;ME.members.push(m)});sel=self.id;refresh();side();toast('Đã thêm gia phả mẫu 4 đời. Làng dòng họ '+sn+' đã mở.')});
  $('#meInfo').addEventListener('submit',e=>{e.preventDefault();const n=$('#miName').value.trim();if(!n){toast('Hãy nhập họ và tên.');return}ME.user.name=n;ME.user.contact=$('#miContact').value.trim();ME.user.place=$('#miPlace').value.trim();const self=ME.members.find(m=>m.self);if(self)self.name=n;window.ssSetUser&&ssSetUser(n);refresh();toast('Đã lưu thông tin.')});
  function fillInfo(){$('#miName').value=ME.user.name;$('#miContact').value=ME.user.contact||'';$('#miPlace').value=ME.user.place||''}
  function start(){document.body.classList.add('signed');const me=ME.members.find(m=>m.self);sel=me.id;refresh();fillInfo();if(ME.members.length>1)side();else side('add',{rel:'parent',to:me.id});tab('tree')}
  window.ssMe={tree:function(){return ME},homeOf:function(id){return homeOf(id)},goods:function(){return goods},balance:function(){return balance},
    signup(name,contact){ME.user={name,contact,place:'',since:new Date().toLocaleDateString('vi-VN',{month:'2-digit',year:'numeric'})};ME.seq=2;ME.members=[{id:'u1',name,g:'m',b:null,d:null,self:true,parent:null,spouse:null}];
      people.filter(p=>p.mine).forEach(p=>{people.splice(people.indexOf(p),1);delete byId[p.id]});start()},
    login(contact){if(!ME.user&&!restore()){this.signup('Bạn',contact);return ME.user.name}start();return ME.user.name},
    logout(){document.body.classList.remove('signed')},save,refresh,
    resume(){if(restore()){start();return ME.user.name}return null}};
  // shortcut: dữ liệu gia phả chỉ lưu trên trình duyệt này (localStorage); cần máy chủ và tài khoản thật khi làm sản phẩm
  // tự kiểm tra bố cục cây: con luôn nằm thấp hơn cha mẹ một đời
  console.assert((()=>{const bk=JSON.stringify(ME);ME.members=[{id:'a',name:'A',self:true},{id:'b',name:'B',parent:'a'},{id:'c',name:'C',parent:'b'}];const u=unitOf(ME.members[0]);const ok=width(u,new Set())>=NW&&kidsOf(u).length===1;Object.assign(ME,JSON.parse(bk));return ok})(),'tree layout');

  // ---------- cửa hàng trong nhà 3D ----------
  let hk2='all';
  function drawShop(){const p=byId[current];$('#hsTo').textContent=p?('Gửi tới: '+houseNames(current)):'';
    $('#hsList').innerHTML=goods.filter(g=>hk2==='all'||g.k===hk2).map(g=>`<li><span class="hs-ic"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${IC[g.id]}</svg></span><span class="hs-t"><b>${g.n}</b><small>${g.k==='ao'?'Cất vào tủ áo':g.k==='noi'?'Bày trong nhà':'Đặt ngoài sân'}</small></span><button class="btn" data-buy="${g.id}">${g.p} nén</button></li>`).join('')}
  function openShop(){drawShop();$('#hshop').hidden=false;$('#homeStage').classList.add('shop-open')}
  window.ssOpenShop=openShop;
  $('#homeShopBtn').addEventListener('click',()=>{$('#hshop').hidden?openShop():($('#hshop').hidden=true,$('#homeStage').classList.remove('shop-open'))});
  $('#hsClose').addEventListener('click',()=>{$('#hshop').hidden=true;$('#homeStage').classList.remove('shop-open')});
  $('#hsCats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;hk2=b.dataset.k;$$('#hsCats button').forEach(x=>x.setAttribute('aria-pressed',x===b));drawShop()});
  $('#hsList').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(b&&buy(b.dataset.buy,current))refresh()});

  // ---------- nạp nén (bản trình diễn) ----------
  const tp=$('#topup');
  document.addEventListener('click',e=>{if(e.target.closest('[data-topup]')){tp.hidden=false}else if(e.target.closest('[data-tpclose]'))tp.hidden=true;const pk=e.target.closest('[data-pack]');if(pk){setBalance(balance+(+pk.dataset.pack));tp.hidden=true;save();toast(`Đã nạp ${(+pk.dataset.pack).toLocaleString('vi-VN')} nén (bản trình diễn, chưa trừ tiền thật).`)}});
  addEventListener('keydown',e=>{if(e.key==='Escape')tp.hidden=true});
})();

/* ---------------- Khởi tạo ---------------- */
renderGoods();renderWall();updateTotal();
const _sel=select;select=function(id,fly){_sel(id,fly);renderWall();renderMap()};
select('khiem',false);
{const n=(!window.ssAuthAllowed||ssAuthAllowed())?ssMe.resume():null;if(n){ssSetUser(n);document.body.classList.add('signed')}}
/* ---------------- Chuyển động toàn trang ---------------- */
(function(){
  const nav=$('.nav'),prog=$('.nav-prog'),ind=$('.nav-ind'),links=$$('#mainNav a');
  // vạch chỉ mục + tiến trình + ẩn hiện menu
  const secs=[];
  let lastY=scrollY,tick=false,cur=null;
  function moveInd(a){window.tbGo&&window.tbGo(a)}
  function onScroll(){tick=false;const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;prog.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    lastY=y;
    let on=null;for(const sct of secs){const r=sct.getBoundingClientRect();if(r.top<innerHeight*.4&&r.bottom>innerHeight*.4){on=sct;break}}
    if(on!==cur){cur=on;links.forEach(a=>a.classList.toggle('on',on&&a.getAttribute('href')==='#'+on.id));moveInd(links.find(a=>a.classList.contains('on')))}
    if(!reduce){const hg=$('.hero-glow');if(hg&&y<innerHeight*1.4)hg.style.translate=`0 ${(y*.25).toFixed(1)}px`}}
  addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});addEventListener('resize',()=>moveInd(links.find(a=>a.classList.contains('on'))));onScroll();
  // ánh sáng theo con trỏ
  document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.iso,.good,.note,.vcard');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  if(reduce)return;
  // tiêu đề tách chữ
  $$('.sec-head h2, .faq h2').forEach(h=>{let i=0;const walk=n=>{[...n.childNodes].forEach(ch=>{if(ch.nodeType===3){const frag=document.createDocumentFragment();ch.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(t));return}const w=document.createElement('span');w.className='w';const inner=document.createElement('span');inner.textContent=t;inner.style.setProperty('--wi',i++);w.appendChild(inner);frag.appendChild(w)});ch.replaceWith(frag)}else if(ch.nodeType===1)walk(ch)})};walk(h);h.classList.add('rvh')});
  // hiện dần
  const sel='.sec-head .eyebrow, .sec-head .lede, .iso, .good, .vmap-stage, .vmap-side, .home, .shop-bar, .tabs, .photo, .note, .msgform, .steps li, .jpanel, .faq details, .lm-facts, .lm .chap, .lm-letter, .lm-links, .lm-pn, .foot-word, .stats>div, .video, .tree .gen, .story';
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.classList.remove('pre','pre-h');io.unobserve(el);if(el.dataset.count!=null)count(el)}),{rootMargin:'0px 0px -5% 0px',threshold:.05});
  const prep=el=>{const r=el.getBoundingClientRect();if(!r.height||r.top<innerHeight*.92)return;const sib=[...el.parentNode.children].filter(x=>x.matches(sel));el.style.setProperty('--si',Math.min(8,Math.max(0,sib.indexOf(el))));el.classList.add('rv','pre');io.observe(el)};
  window.prepReveal=()=>{$$(sel).forEach(el=>{if(!el.classList.contains('rv'))prep(el)});$$('.rvh').forEach(h=>{if(h.dataset.rv)return;const r=h.getBoundingClientRect();if(!r.height||r.top<innerHeight*.92)return;h.dataset.rv=1;h.classList.add('pre-h');io.observe(h)})};
  window.prepReveal();
  // số đếm lên
  function count(box){const b=box.querySelector('b');if(!b)return;const target=parseInt(b.textContent.replace(/\D/g,''))||0;const t0=performance.now(),d=1400;(function f(now){const k=Math.min(1,(now-t0)/d),e=1-Math.pow(1-k,3);b.textContent=Math.round(target*e).toLocaleString('vi-VN');if(k<1)requestAnimationFrame(f)})(t0)}
  $$('.stats>div').forEach(d=>{d.dataset.count='';if(!d.classList.contains('pre')){io.observe(d)}});
})();

})();
