(() => {
"use strict";
const demoPartners=[
{id:"MITRA-DEMO-001",name:"Contoh Mitra Pendidikan",category:"Pendidikan",contact:"Nama contoh",email:"kontak@example.invalid",status:"Aktif"},
{id:"MITRA-DEMO-002",name:"Contoh Instansi Pemerintah",category:"Pemerintah",contact:"Nama contoh",email:"kontak@example.invalid",status:"Verifikasi"},
{id:"MITRA-DEMO-003",name:"Contoh Mitra Industri",category:"Industri",contact:"Nama contoh",email:"kontak@example.invalid",status:"Calon mitra"}
];
let partners=demoPartners.map(x=>({...x}));
const $=id=>document.getElementById(id);
const partnerDialog=$("partnerDialog"),infoDialog=$("infoDialog");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){
const q=$("partnerSearch").value.trim().toLowerCase(),cat=$("partnerCategory").value;
const filtered=partners.filter(p=>(!cat||p.category===cat)&&[p.name,p.category,p.contact,p.email,p.id].join(" ").toLowerCase().includes(q));
$("partnerRows").innerHTML=filtered.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.id)+'</small></td><td>'+esc(p.category)+'</td><td>'+esc(p.contact||"—")+'<small>'+esc(p.email||"—")+'</small></td><td><span class="hk-status '+(p.status==="Aktif"?"hk-status-active":p.status==="Verifikasi"?"hk-status-review":"hk-status-draft")+'">'+esc(p.status)+'</span></td><td><button class="hk-row-action" type="button" data-partner-id="'+esc(p.id)+'">Detail</button></td></tr>').join("");
$("partnerCount").textContent=filtered.length+" data pratinjau";
$("partnerEmpty").hidden=filtered.length!==0;
}
$("partnerSearch").addEventListener("input",render);
$("partnerCategory").addEventListener("change",render);
$("newPartnerBtn").addEventListener("click",()=>partnerDialog.showModal());
$("partnerForm").addEventListener("submit",e=>{
e.preventDefault();const fd=new FormData(e.currentTarget),name=String(fd.get("name")||"").trim();
if(!name)return;
partners.unshift({id:"PREVIEW-"+String(Date.now()).slice(-7),name,category:fd.get("category"),contact:fd.get("contact"),email:fd.get("email"),status:"Calon mitra"});
render();e.currentTarget.reset();partnerDialog.close();
});
$("resetDemo").addEventListener("click",()=>{partners=demoPartners.map(x=>({...x}));$("partnerSearch").value="";$("partnerCategory").value="";render();});
$("partnerRows").addEventListener("click",e=>{
const b=e.target.closest("[data-partner-id]");if(!b)return;const p=partners.find(x=>x.id===b.dataset.partnerId);if(!p)return;
$("infoTitle").textContent=p.name;
$("infoBody").innerHTML='<p><strong>ID:</strong> '+esc(p.id)+'</p><p><strong>Kategori:</strong> '+esc(p.category)+'</p><p><strong>Contact person:</strong> '+esc(p.contact||"Belum diisi")+'</p><p><strong>Kontak:</strong> '+esc(p.email||"Belum diisi")+'</p><p><strong>Status:</strong> '+esc(p.status)+'</p><p>Detail ini hanya berada pada sesi pratinjau. Belum tersimpan ke server.</p>';
infoDialog.showModal();
});
function showWorkflow(){ $("infoTitle").textContent="Tahapan proses kerja sama";$("infoBody").innerHTML='<ol><li>Staf HUMAS: registrasi dan pemeriksaan kelengkapan administratif.</li><li>Wakasek HUMAS: telaah substansi dan rekomendasi.</li><li>Kepala Sekolah: keputusan akhir — setujui, tolak, atau kembalikan untuk revisi.</li><li>Penandatanganan fisik/TTE setelah persetujuan, kemudian registrasi dan arsip.</li></ol><p>Persetujuan dan penandatanganan merupakan dua tahapan berbeda. Tidak ada keputusan nyata yang dapat dilakukan dari pratinjau ini.</p>';infoDialog.showModal();}
$("newAgreementBtn").addEventListener("click",showWorkflow);
document.querySelectorAll("[data-agreement-demo]").forEach(b=>b.addEventListener("click",showWorkflow));
render();
})();