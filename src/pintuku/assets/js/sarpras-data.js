/* Mengisi dashboard Sarpras dari ringkasan spreadsheet (/api/sarpras/summary). Hanya textContent, tanpa innerHTML. */
(() => {
 "use strict";
 const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const num=n=>Number(n||0).toLocaleString("id-ID");
 const rp=n=>"Rp "+Number(n||0).toLocaleString("id-ID");
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const kpi=(label,value,note)=>{
  const box=$$(".sp-kpi").find(k=>k.querySelector(".sp-kpi-label")?.textContent.trim()===label);
  if(!box)return;
  box.querySelector(".sp-kpi-value").textContent=value;
  if(note!==undefined)box.querySelector(".sp-kpi-note").textContent=note;
 };
 const row=(label,value)=>{
  const r=$$(".sp-list-row").find(x=>x.querySelector("strong")?.textContent.trim()===label);
  if(r)r.querySelector("span").textContent=value;
 };
 const panel=title=>$$(".sp-panel").find(p=>p.querySelector("h2")?.textContent.trim()===title);
 const fill=(title,build)=>{
  const p=panel(title);if(!p)return;
  const ph=p.querySelector(".sp-placeholder");if(!ph)return;
  const wrap=el("div","sp-list");build(wrap);ph.replaceWith(wrap);
 };
 const lines=(wrap,items,fmt)=>{
  if(!items.length){wrap.append(el("div","sp-list-row",""));wrap.firstChild.append(el("strong",null,"Belum ada data"),el("span",null,"—"));return;}
  items.forEach(i=>{const r=el("div","sp-list-row");r.append(el("strong",null,i.label),el("span",null,fmt(i)));wrap.append(r);});
 };
 const pct=(a,b)=>b?Math.round(a/b*1000)/10+"%":"—";
 const render=d=>{
  const t=d.totals;
  const badge=$$(".sp-preview")[0];
  if(badge)badge.textContent="TERHUBUNG · GOOGLE SHEETS";
  const note=$$(".sp-note")[0];
  if(note)note.textContent="Sumber: "+d.source+" · diperbarui "+new Date(d.generated_at).toLocaleString("id-ID")+". Angka dihitung dari tab Aset dan Ruangan; Jumlah kosong dihitung 1 unit per baris."+(document.querySelector(".sarpras-admin-workspace")?" · Mode baca saja: tambah, edit, mutasi, dan impor belum menulis data.":"");
  // Admin
  kpi("Total aset",num(t.aset),t.records+" catatan inventaris");
  kpi("Ruangan",num(t.ruangan),t.tanpa_ruang?t.tanpa_ruang+" aset belum berkode ruang":"Seluruh aset berkode ruang");
  kpi("Perlu pemeliharaan",num(t.perlu_penanganan),"Rusak ringan "+t.rusak_ringan+" · rusak berat "+t.rusak_berat);
  const act=panel("Aktivitas terbaru");if(act)act.querySelector(".sp-panel-intro").textContent="Lima aktivitas terakhir dari tab Log_Aktivitas.";
  fill("Aktivitas terbaru",w=>lines(w,d.activity.map(a=>({label:a.aktivitas||"Aktivitas",v:(a.waktu+" · "+a.pengguna).trim()})),i=>i.v));
  // Eksekutif
  kpi("Nilai aset tercatat",rp(t.nilai));
  kpi("Indeks kesehatan aset",t.indeks_kesehatan===null?"—":t.indeks_kesehatan+"%");
  kpi("Aset perlu penanganan",num(t.perlu_penanganan));
  row("Kondisi baik",num(t.baik));
  row("Perlu perbaikan",num(t.rusak_ringan));
  row("Rusak",num(t.rusak_berat));
  row("Indeks kelayakan",t.indeks_kesehatan===null?"—":t.indeks_kesehatan+"%");
  row("Nilai aset tercatat",rp(t.nilai));
  row("Sumber pendanaan",d.by_dana.length?d.by_dana.length+" sumber · terbesar "+d.by_dana[0].label:"—");
  fill("Komposisi & sebaran aset",w=>{
   lines(w,d.by_jenis.map(i=>({label:"Kategori · "+i.label,value:i.value})),i=>num(i.value)+" unit ("+pct(i.value,t.aset)+")");
   lines(w,d.by_ruang.slice(0,5).map(i=>({label:"Ruang · "+i.label,value:i.value})),i=>num(i.value)+" unit");
   lines(w,d.by_tahun.map(i=>({label:"Tahun · "+i.label,value:i.value})),i=>num(i.value)+" unit");
  });
  fill("Anggaran & sumber pendanaan",()=>{});
 };
 const run=async()=>{
  try{
   const token=await window.sarprasAuth.getAccessToken();
   const r=await fetch("/api/sarpras/summary",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
   const d=await r.json().catch(()=>({}));
   if(!r.ok||!d.success)throw new Error(d.message||"Data tidak dapat dimuat.");
   render(d);
  }catch(e){
   const note=$$(".sp-note")[0];
   if(note)note.textContent="Data dari spreadsheet belum dapat dimuat: "+(e.message||"kesalahan tidak diketahui");
  }
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
