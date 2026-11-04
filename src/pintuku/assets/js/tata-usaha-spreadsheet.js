/* PINTUKU TU Spreadsheet — session-only UI prototype; no API/database calls */
(()=>{"use strict";
const sheets={
 pekerjaan:"Register Pekerjaan",
 persuratan:"Persuratan",
 layanan:"Layanan Administrasi",
 arsip:"Arsip & Dokumen"
};
let active="pekerjaan",rows={pekerjaan:[],persuratan:[],layanan:[],arsip:[]};
const $=id=>document.getElementById(id);
const safe=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const today=()=>new Date().toISOString().slice(0,10);
function render(){
 const query=($("tuSheetSearch")?.value||"").trim().toLowerCase();
 const list=rows[active].filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(query)));
 const body=$("tuSheetBody");if(!body)return;
 body.innerHTML=list.length?list.map((r,i)=>'<tr><td>'+String(i+1).padStart(2,"0")+'</td><td>'+safe(r.date)+'</td><td><strong>'+safe(r.subject)+'</strong></td><td>'+safe(r.owner||"—")+'</td><td>'+safe(r.unit||"—")+'</td><td>'+safe(r.due||"—")+'</td><td><span class="tu-sheet-status" data-status="'+safe(r.status)+'">'+safe(r.status)+'</span></td><td><button type="button" class="tu-sheet-row-action" data-delete="'+safe(r.id)+'" aria-label="Hapus entri">Hapus</button></td></tr>').join(""):'<tr><td colspan="8" class="tu-sheet-empty">'+(query?"Tidak ada data yang cocok dengan pencarian.":"Belum ada entri pada lembar ini. Gunakan “Tambah baris” untuk mengisi register.")+'</td></tr>';
 const all=rows[active];$("tuSheetCount").textContent=all.length;
 $("tuSheetProgress").textContent=all.filter(r=>r.status==="Dalam proses"||r.status==="Menunggu").length;
 $("tuSheetDone").textContent=all.filter(r=>r.status==="Selesai").length;
 $("tuSheetFootnote").textContent=all.length+" entri pada "+sheets[active]+". Data hanya berada di sesi browser.";
}
function add(){const dialog=$("tuSheetDialog");if(!dialog)return;dialog.showModal();$("tuSheetForm")?.querySelector('[name="subject"]')?.focus();}
function exportCsv(){
 const data=rows[active];if(!data.length){alert("Belum ada data untuk diekspor.");return;}
 const headers=["Tanggal","Perihal/Kegiatan","Penanggung Jawab","Unit Terkait","Tenggat","Status"];
 const quote=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const csv="\uFEFF"+[headers,...data.map(r=>[r.date,r.subject,r.owner,r.unit,r.due,r.status])].map(row=>row.map(quote).join(";")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="TUPINTUKU-"+active+"-"+today()+".csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function init(){
 const root=$("tu-spreadsheet");if(!root)return;
 root.querySelectorAll("[data-sheet]").forEach(btn=>btn.addEventListener("click",()=>{
  active=btn.dataset.sheet;root.querySelectorAll("[data-sheet]").forEach(tab=>{const selected=tab===btn;tab.classList.toggle("is-active",selected);tab.setAttribute("aria-selected",String(selected));});render();
 }));
 $("tuSheetAdd")?.addEventListener("click",add);
 const dialog=$("tuSheetDialog"),form=$("tuSheetForm");
 const close=()=>dialog?.close();
 $("tuSheetClose")?.addEventListener("click",close);$("tuSheetCancel")?.addEventListener("click",close);
 dialog?.addEventListener("click",event=>{if(event.target===dialog)close();});
 form?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(form);const subject=String(data.get("subject")||"").trim();if(!subject)return;
  rows[active].push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),date:today(),subject,owner:String(data.get("owner")||"").trim(),unit:String(data.get("unit")||"").trim(),due:String(data.get("due")||"").trim(),status:String(data.get("status")||"Menunggu")});
  form.reset();close();render();
 });
 $("tuSheetExport")?.addEventListener("click",exportCsv);
 $("tuSheetSearch")?.addEventListener("input",render);
 $("tuSheetBody")?.addEventListener("click",event=>{const btn=event.target.closest("[data-delete]");if(!btn)return;rows[active]=rows[active].filter(r=>r.id!==btn.dataset.delete);render();});
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();