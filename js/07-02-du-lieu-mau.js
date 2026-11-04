/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Dữ liệu mẫu ---------------- */
const CAT=SS_DATA.cat;
const people=SS_DATA.people;
const byId=Object.fromEntries(people.map(p=>[p.id,p]));
const GEO=SS_DATA.geo;
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
