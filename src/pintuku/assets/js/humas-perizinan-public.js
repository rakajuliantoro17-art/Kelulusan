(() => {
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let turnstileToken="";let turnstileWidgetId=null;let captchaReady=false;
const statusText={draft:"Draft",submitted:"Diajukan",verified:"Terverifikasi",under_review:"Dalam penilaian",revision_required:"Perlu revisi",approved:"Disetujui",rejected:"Ditolak",cancelled:"Dibatalkan",completed:"Selesai",archived:"Arsip"};
const eventText={public_submitted:"Permohonan dikirim",created:"Permohonan dicatat",submit:"Permohonan diajukan",verify:"Permohonan diverifikasi",recommend:"Masuk penilaian pimpinan",request_revision:"Perlu perbaikan",approve:"Permohonan disetujui",reject:"Permohonan ditolak",cancel:"Permohonan dibatalkan",public_cancelled:"Dibatalkan oleh pemohon",complete:"Kegiatan dinyatakan selesai",archive:"Permohonan diarsipkan"};
function notice(message,error=false){const el=$("publicNotice");el.textContent=message;el.className="hk-notice"+(error?" is-error":"");el.hidden=false;}
async function api(op,payload){const r=await fetch("/api/humas?op="+encodeURIComponent(op),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload),cache:"no-store"});let data={};try{data=await r.json();}catch(_){}if(!r.ok)throw new Error(data.message||"Permintaan tidak dapat diproses.");return data.data||{};}
function showMode(){const track=location.pathname.includes("/lacak");$("applyPanel").hidden=track;$("trackingPanel").hidden=!track;$("showApply").classList.toggle("is-active",!track);$("showTrack").classList.toggle("is-active",track);}
function localIso(value){return value?new Date(value).toISOString():"";}
function statusPill(status){return '<span class="hp-status-tag">'+esc(statusText[status]||status)+'</span>';}
function renderTracking(p){
 const events=Array.isArray(p.events)?p.events:[];
 const canCancel=["submitted","revision_required"].includes(p.status);
 $("trackingResult").innerHTML='<div class="hp-tracking-head"><div><small>KODE PERMOHONAN</small><h3>'+esc(p.request_code)+'</h3></div>'+statusPill(p.status)+'</div>'+
 '<div class="hp-detail-grid"><div><small>Nama kegiatan</small><p>'+esc(p.title)+'</p></div><div><small>Jenis permohonan</small><p>'+esc(p.permit_type==="facility"?"Penggunaan fasilitas":"Pihak eksternal")+'</p></div><div><small>Jadwal mulai</small><p>'+esc(p.requested_start_at?new Date(p.requested_start_at).toLocaleString("id-ID"):"—")+'</p></div><div><small>Jadwal selesai</small><p>'+esc(p.requested_end_at?new Date(p.requested_end_at).toLocaleString("id-ID"):"—")+'</p></div><div><small>Lokasi</small><p>'+esc(p.activity_location||"Belum ditetapkan")+'</p></div><div><small>Terakhir diperbarui</small><p>'+esc(p.updated_at?new Date(p.updated_at).toLocaleString("id-ID"):"—")+'</p></div></div>'+
 (p.decision_note?'<div class="hp-public-decision"><small>CATATAN HUMAS</small><p>'+esc(p.decision_note)+'</p></div>':"")+
 '<h3 class="hp-timeline-title">Riwayat proses</h3><ol class="hp-public-timeline">'+events.map(e=>'<li><span class="hp-timeline-dot"></span><div><b>'+esc(eventText[e.event_type]||e.event_type)+'</b><small>'+esc(e.occurred_at?new Date(e.occurred_at).toLocaleString("id-ID"):"")+'</small>'+(e.reason?'<p>'+esc(e.reason)+'</p>':"")+'</div></li>').join("")+'</ol>'+
 (canCancel?'<div class="hp-form-actions"><button class="hk-btn hk-btn-ghost" type="button" id="cancelPublicPermit">Batalkan permohonan</button></div>':"");
 $("trackingResult").hidden=false;
 $("cancelPublicPermit")?.addEventListener("click",async()=>{if(!confirm("Batalkan permohonan ini? Tindakan ini tidak dapat dibatalkan."))return;try{await api("permit-public-cancel",{request_code:p.request_code,tracking_token:$("trackPermitForm").elements.tracking_token.value.trim()});notice("Permohonan berhasil dibatalkan.");await track();}catch(e){notice(e.message,true);}});
}
async function loadCaptcha(){
 try{
  const r=await fetch("/api/humas?op=permit-public-config",{cache:"no-store"});const d=await r.json();
  if(!r.ok||!d.data?.ready||!d.data?.site_key)throw new Error("Verifikasi keamanan belum aktif. Pengajuan publik sementara belum dapat digunakan.");
  const render=()=>{if(!window.turnstile)return false;turnstileWidgetId=window.turnstile.render("#turnstileWidget",{sitekey:d.data.site_key,theme:"auto",callback:token=>{turnstileToken=token;captchaReady=true;$("captchaHelp").textContent="Verifikasi berhasil.";$("submitPublicPermit").disabled=false;},"expired-callback":()=>{turnstileToken="";captchaReady=false;$("submitPublicPermit").disabled=true;$("captchaHelp").textContent="Verifikasi kedaluwarsa. Silakan ulangi.";},"error-callback":()=>{turnstileToken="";captchaReady=false;$("submitPublicPermit").disabled=true;$("captchaHelp").textContent="Verifikasi gagal dimuat.";} });return true;};
  if(window.turnstile){render();return;}
  const script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";script.async=true;script.defer=true;
  script.onload=()=>{if(!render())$("captchaHelp").textContent="Komponen verifikasi tidak tersedia.";};
  script.onerror=()=>{$("captchaHelp").textContent="Gagal memuat verifikasi keamanan.";$("submitPublicPermit").disabled=true;};
  document.head.appendChild(script);
 }catch(err){$("captchaHelp").textContent=err.message;$("submitPublicPermit").disabled=true;notice(err.message,true);}
}
async function track(){
 const form=$("trackPermitForm"),payload={request_code:form.elements.request_code.value.trim().toUpperCase(),tracking_token:form.elements.tracking_token.value.trim()};
 const data=await api("permit-public-track",payload);renderTracking(data.permit);return data.permit;
}
$("publicPermitType").addEventListener("change",e=>{$("publicFacilityFields").hidden=e.target.value!=="facility";});
$("publicPermitForm").addEventListener("submit",async e=>{
 e.preventDefault();const form=e.currentTarget,button=$("submitPublicPermit");button.disabled=true;button.textContent="Mengirim...";
 try{
  const fd=new FormData(form),p=Object.fromEntries(fd.entries());
  if(!turnstileToken)throw new Error("Selesaikan verifikasi keamanan sebelum mengirim permohonan.");p.turnstile_token=turnstileToken;
  p.facility_details={facility_name:p.facility_name||"",facility_equipment:p.facility_equipment||"",facility_layout:p.facility_layout||""};
  delete p.facility_name;delete p.facility_equipment;delete p.facility_layout;
  p.requested_start_at=localIso(p.requested_start_at);p.requested_end_at=localIso(p.requested_end_at);
  const result=await api("permit-public-create",p);
  $("successCode").textContent=result.request_code;$("successToken").textContent=result.tracking_token;
  $("copyCode").onclick=()=>navigator.clipboard?.writeText(result.request_code).then(()=>notice("Kode permohonan disalin.")).catch(()=>notice("Salin kode secara manual."));
  $("copyToken").onclick=()=>navigator.clipboard?.writeText(result.tracking_token).then(()=>notice("Token pelacakan disalin.")).catch(()=>notice("Salin token secara manual."));
  $("submissionSuccess").hidden=false;$("applyPanel").hidden=true;$("trackingPanel").hidden=true;
  $("goTrack").href="/humas/perizinan/lacak";
  $("goTrack").onclick=()=>{sessionStorage.setItem("pintuku_humas_last_request",result.request_code);sessionStorage.setItem("pintuku_humas_last_token",result.tracking_token);};
  sessionStorage.setItem("pintuku_humas_last_request",result.request_code);sessionStorage.setItem("pintuku_humas_last_token",result.tracking_token);
  notice("Permohonan berhasil dikirim dan masuk antrean verifikasi.");
 }catch(err){notice(err.message,true);}finally{if(window.turnstile&&turnstileWidgetId!==null)window.turnstile.reset(turnstileWidgetId);turnstileToken="";captchaReady=false;button.disabled=true;button.textContent="Kirim permohonan";}
});
$("trackPermitForm").addEventListener("submit",async e=>{e.preventDefault();const button=e.currentTarget.querySelector('[type="submit"]');button.disabled=true;try{await track();notice("Status permohonan berhasil dimuat.");}catch(err){$("trackingResult").hidden=true;notice(err.message,true);}finally{button.disabled=false;}});
const lastCode=sessionStorage.getItem("pintuku_humas_last_request"),lastToken=sessionStorage.getItem("pintuku_humas_last_token");
if(lastCode&&lastToken){$("trackPermitForm").elements.request_code.value=lastCode;$("trackPermitForm").elements.tracking_token.value=lastToken;}
showMode();
loadCaptcha();
})();
