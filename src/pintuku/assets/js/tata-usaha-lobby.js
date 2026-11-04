/* Public lobby concierge display. No visitor intake, API calls, or personal data. */
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s);
const guidance={
tu:["Tata Usaha","Sampaikan keperluan administrasi atau persuratan kepada petugas Front Office. Petugas akan membantu mengarahkan Anda."],
principal:["Kepala Sekolah","Sampaikan maksud pertemuan kepada petugas. Pertemuan dengan pimpinan mengikuti konfirmasi dan jadwal yang berlaku."],
curriculum:["Kurikulum","Untuk keperluan akademik dan pembelajaran, sampaikan kelas, mata pelajaran, atau topik yang relevan kepada petugas."],
student:["Kesiswaan","Untuk layanan siswa dan orang tua, sampaikan keperluan secara singkat kepada petugas. Dokumen pribadi hanya diberikan melalui prosedur resmi."],
facility:["Sarana Prasarana","Untuk fasilitas, inventaris, atau pemeliharaan, jelaskan lokasi dan jenis kebutuhan kepada petugas."],
public:["Humas","Untuk informasi, kemitraan, publikasi, atau alumni, sampaikan tujuan kunjungan kepada petugas Front Office."],
teacher:["Guru / Wali Kelas","Sampaikan nama guru atau kelas yang dituju. Petugas akan membantu menghubungi pihak terkait."],
security:["Keamanan","Untuk bantuan akses dan keamanan lingkungan sekolah, silakan meminta bantuan petugas."]
};
const clock=()=>{const d=new Date(),h=d.getHours();$("#lobbyTime").textContent=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",hour12:false}).format(d);$("#lobbyDate").textContent=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d);$("#lobbyGreeting").textContent=h<11?"Selamat pagi":h<15?"Selamat siang":h<18?"Selamat sore":"Selamat malam";};
const choose=b=>{const item=guidance[b.dataset.service];if(!item)return;document.querySelectorAll("[data-service]").forEach(x=>{const active=x===b;x.classList.toggle("is-selected",active);x.setAttribute("aria-pressed",String(active));});$("#lobbyGuidanceTitle").textContent=item[0];$("#lobbyGuidanceText").textContent=item[1];};
const fullscreen=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{$("#lobbyFullscreen").textContent="Mode layar penuh tidak tersedia";}};
document.addEventListener("DOMContentLoaded",()=>{clock();window.setInterval(clock,30000);document.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>choose(b)));$("#lobbyFullscreen").addEventListener("click",fullscreen);document.addEventListener("fullscreenchange",()=>{const b=$("#lobbyFullscreen"),active=Boolean(document.fullscreenElement);b.setAttribute("aria-pressed",String(active));b.textContent=active?"⛶ Keluar layar penuh":"⛶ Layar penuh";});},{once:true});
})();