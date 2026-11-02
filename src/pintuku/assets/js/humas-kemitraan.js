(() => {
"use strict";
const $=id=>document.getElementById(id);
const state={roles:[],partners:[],agreements:[],partnerPage:1,agreementPage:1,partnerEditing:null,agreementEditing:null,currentAgreement:null};
const keys={access:"pintuku_humas_access",refresh:"pintuku_humas_refresh"};
const labels={government:"Pemerintah",education:"Pendidikan",business:"Dunia usaha/industri",community:"Komunitas",nonprofit:"Nirlaba",alumni:"Alumni",other:"Lainnya"};
const statuses={draft:"Draft",submitted:"Diajukan",verified:"Terverifikasi",recommended:"Direkomendasikan",pending_principal_approval:"Menunggu Kepala Sekolah",revision_required:"Perlu revisi",rejected:"Ditolak",approved:"Disetujui",pending_signature:"Menunggu tanda tangan",physically_signed:"Ditandatangani fisik",electronically_signed:"Ditandatangani elektronik",registered:"Terdaftar",archived:"Diarsipkan",expired:"Kedaluwarsa"};
const statusClass=s=>["registered","physically_signed","electronically_signed","approved"].includes(s)?"hk-status-active":["rejected","revision_required","expired"].includes(s)?"hk-status-danger":["draft","archived"].includes(s)?"hk-status-draft":"hk-status-review";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>v==null||v===""?"—":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v));
const date=v=>v?new Date(v+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"}):"—";
function notice(message,type="info"){const el=$("notice");el.textContent=message;el.className="hk-notice "+(type==="error"?"is-error":type==="success"?"is-success":"");el.hidden=false;}
function clearNotice(){$("notice").hidden=true;}
function session(){return{access:sessionStorage.getItem(keys.access),refresh:sessionStorage.getItem(keys.refresh)};}
function saveSession(data){if(data.access_token)sessionStorage.setItem(keys.access,data.access_token);if(data.refresh_token)sessionStorage.setItem(keys.refresh,data.refresh_token);}
function clearSession(){sessionStorage.removeItem(keys.access);sessionStorage.removeItem(keys.refresh);}
async function rawApi(op,method="GET",body=null,auth=true){
 const headers={"Accept":"application/json"};if(body)headers["Content-Type"]="application/json";
 if(auth&&session().access)headers.Authorization="Bearer "+session().access;
 const parts=String(op).split("&");const url="/api/humas?op="+encodeURIComponent(parts.shift())+(parts.length?"&"+parts.join("&"):"");
 const response=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined,cache:"no-store"});
 let data={};try{data=await response.json();}catch(_){}
 return{response,data};
}
async function api(op,method="GET",body=null,retry=true){
 let result=await rawApi(op,method,body,true);
 if(result.response.status===401&&retry&&session().refresh){
  const refreshed=await rawApi("refresh","POST",{refresh_token:session().refresh},false);
  if(refreshed.response.ok&&refreshed.data.data){saveSession(refreshed.data.data);result=await rawApi(op,method,body,true);}
  else{clearSession();showLogin("Sesi telah berakhir. Silakan masuk kembali.");throw new Error("Sesi berakhir. Silakan masuk kembali.");}
 }
 if(!result.response.ok)throw new Error(result.data.message||"Permintaan tidak dapat diproses.");
 return result.data.data||{};
}
function showLogin(message){$("loginPanel").hidden=false;$("workspace").hidden=true;$("logoutBtn").hidden=true;$("refreshBtn").hidden=true;$("userBadge").hidden=true;if(message)notice(message,"error");}
function showWorkspace(user){$("loginPanel").hidden=true;$("workspace").hidden=false;$("logoutBtn").hidden=false;$("refreshBtn").hidden=false;$("userBadge").hidden=false;$("userBadge").textContent=user.email||"Pengguna HUMAS";}
function can(role){return state.roles.includes(role);}
function setupRoleUI(){
 $("newPartnerBtn").hidden=!can("staff_humas");$("newAgreementBtn").hidden=!can("staff_humas");
 $("userBadge").title=state.roles.join(", ");
}
async function login(email,password){
 const result=await rawApi("login","POST",{email,password},false);
 if(!result.response.ok)throw new Error(result.data.message||"Tidak dapat masuk.");
 saveSession(result.data.data);return result.data.data.user||{};
}
async function loadWorkspace(){
 const d=await api("workspace");
 state.roles=Array.isArray(d.roles)?d.roles:[];
 if(!state.roles.some(r=>["staff_humas","vice_principal_humas","principal"].includes(r)))throw new Error("Akun belum diberi akses layanan Kemitraan & MoU.");
 showWorkspace(d.user||{});setupRoleUI();
 const summary=d.summary||{};
 $("kpiPartners").textContent=summary.total_partners??0;
 $("kpiActivePartners").textContent=summary.active_partners??0;
 $("kpiAgreements").textContent=summary.in_process??0;
 $("kpiExpiring").textContent=summary.expiring_soon??0;
 renderPartners(d.partners&&d.partners.partners||[]);
 renderAgreements(d.agreements&&d.agreements.agreements||[]);
}
async function loadDashboard(){
 const d=await api("dashboard");
 $("kpiPartners").textContent=d.total_partners??0;$("kpiActivePartners").textContent=d.active_partners??0;
 $("kpiAgreements").textContent=d.in_process??0;$("kpiExpiring").textContent=d.expiring_soon??0;
}
function renderPartners(items){
 state.partners=items||[];
 $("partnerRows").innerHTML=state.partners.map(p=>'<tr><td><strong>'+esc(p.partner_name)+'</strong><small>'+esc(p.institution_address||p.id)+'</small></td><td>'+esc(labels[p.partner_type]||p.partner_type)+'</td><td>'+esc(p.contact_person||"—")+'<small>'+esc(p.contact_email||p.contact_phone||"—")+'</small></td><td><span class="hk-status '+(p.record_status==="active"?"hk-status-active":p.record_status==="inactive"?"hk-status-draft":"hk-status-review")+'">'+(p.record_status==="active"?"Aktif":p.record_status==="inactive"?"Tidak aktif":"Dalam pemeriksaan")+'</span></td><td><button class="hk-row-action" type="button" data-edit-partner="'+esc(p.id)+'">Kelola</button></td></tr>').join("")||'<tr><td colspan="5" class="hk-empty">Belum ada data mitra.</td></tr>';
 $("partnerEmpty").hidden=state.partners.length!==0;
 $("partnerPageInfo").textContent="Halaman "+state.partnerPage+" · "+state.partners.length+" data";
 $("partnerPrev").disabled=state.partnerPage<=1;$("partnerNext").disabled=state.partners.length<25;
}
async function loadPartners(){
 const q=new URLSearchParams({page:String(state.partnerPage),limit:"25"});
 if($("partnerSearch").value.trim())q.set("search",$("partnerSearch").value.trim());
 if($("partnerCategory").value)q.set("type",$("partnerCategory").value);
 if($("partnerStatus").value)q.set("status",$("partnerStatus").value);
 const d=await api("partners&"+q.toString());renderPartners(d.partners||[]);
}
function renderAgreements(items){
 state.agreements=items||[];
 $("agreementRows").innerHTML=state.agreements.map(a=>'<tr><td><strong>'+esc(a.title)+'</strong><small>'+esc(a.agreement_code||a.id)+'</small></td><td>'+esc(a.partner&&a.partner.partner_name||"—")+'</td><td>'+esc(({mou:"MoU",pks:"PKS",implementation:"Pelaksanaan",other:"Lainnya"})[a.agreement_type]||a.agreement_type)+'</td><td><span class="hk-status '+statusClass(a.status)+'">'+esc(statuses[a.status]||a.status)+'</span></td><td>'+esc(date(a.start_date))+' – '+esc(date(a.end_date))+'</td><td><button class="hk-row-action" type="button" data-open-agreement="'+esc(a.id)+'">Detail</button></td></tr>').join("")||'<tr><td colspan="6" class="hk-empty">Belum ada dokumen kerja sama.</td></tr>';
 $("agreementEmpty").hidden=state.agreements.length!==0;
 $("agreementPageInfo").textContent="Halaman "+state.agreementPage+" · "+state.agreements.length+" data";
 $("agreementPrev").disabled=state.agreementPage<=1;$("agreementNext").disabled=state.agreements.length<25;
}
async function loadAgreements(){
 const q=new URLSearchParams({page:String(state.agreementPage),limit:"25"});
 if($("agreementSearch").value.trim())q.set("search",$("agreementSearch").value.trim());
 if($("agreementStatus").value)q.set("status",$("agreementStatus").value);
 const d=await api("agreements&"+q.toString());renderAgreements(d.agreements||[]);
}
async function refreshAll(){
 clearNotice();
 try{await loadWorkspace();}
 catch(e){notice(e.message,"error");}
}
function openPartnerForm(p=null){
 state.partnerEditing=p;$("partnerForm").reset();$("partnerDialogTitle").textContent=p?"Ubah data mitra":"Daftarkan mitra";
 if(p)for(const [k,v] of Object.entries(p))if($("partnerForm").elements[k])$("partnerForm").elements[k].value=v??"";
 $("partnerDialog").showModal();
}
async function savePartner(e){
 e.preventDefault();const form=e.currentTarget,fd=new FormData(form),payload=Object.fromEntries(fd.entries());
 const btn=form.querySelector('[type="submit"]');btn.disabled=true;
 try{
  if(state.partnerEditing){await api("partners","PATCH",{id:state.partnerEditing.id,...payload});notice("Perubahan data mitra tersimpan.","success");}
  else{await api("partners","POST",payload);notice("Mitra berhasil didaftarkan.","success");}
  $("partnerDialog").close();state.partnerPage=1;await Promise.all([loadPartners(),loadDashboard()]);
 }catch(err){notice(err.message,"error");}finally{btn.disabled=false;}
}
async function partnerAction(e){
 const b=e.target.closest("[data-edit-partner]");if(!b)return;
 const p=state.partners.find(x=>x.id===b.dataset.editPartner);if(!p)return;
 const choice=window.prompt("Ketik U untuk ubah data, A untuk menonaktifkan/mengaktifkan, atau B untuk batal.","U");
 if(!choice||choice.toUpperCase()==="B")return;
 if(choice.toUpperCase()==="U"){openPartnerForm(p);return;}
 if(choice.toUpperCase()==="A"){
  const next=p.record_status==="active"?"inactive":"active";
  if(!window.confirm("Ubah status mitra menjadi "+(next==="active"?"Aktif":"Tidak aktif")+"?"))return;
  try{await api("partners","PATCH",{id:p.id,action:"status",record_status:next,reason:"Perubahan status melalui PINTUKU"});notice("Status mitra diperbarui.","success");await Promise.all([loadPartners(),loadDashboard()]);}catch(err){notice(err.message,"error");}
 }
}
async function openAgreementForm(){
 if(!can("staff_humas"))return;
 try{
  const d=await api("partners?page=1&limit=100&status=active");const partners=d.partners||[];
  if(!partners.length){notice("Daftarkan mitra aktif terlebih dahulu sebelum mencatat MoU/PKS.","error");return;}
  $("agreementPartner").innerHTML='<option value="">Pilih mitra aktif</option>'+partners.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.partner_name)+'</option>').join("");
  $("agreementForm").reset();state.agreementEditing=null;$("agreementDialogTitle").textContent="Catat kerja sama baru";$("agreementDialog").showModal();
 }catch(e){notice(e.message,"error");}
}
async function saveAgreement(e){
 e.preventDefault();const form=e.currentTarget,btn=form.querySelector('[type="submit"]'),payload=Object.fromEntries(new FormData(form).entries());
 btn.disabled=true;
 try{
  if(state.agreementEditing){await api("agreements","PATCH",{id:state.agreementEditing.id,action:"update_draft",...payload});notice("Draft kerja sama diperbarui.","success");}
  else{await api("agreements","POST",payload);notice("Draft kerja sama berhasil dibuat.","success");}
  $("agreementDialog").close();state.agreementPage=1;await Promise.all([loadAgreements(),loadDashboard()]);
 }catch(err){notice(err.message,"error");}finally{btn.disabled=false;}
}
function actionList(a){
 const s=a.status,actions=[];
 if(can("staff_humas")){
  if(["draft","revision_required"].includes(s))actions.push(["submit","Ajukan untuk diperiksa"]);
  if(s==="submitted")actions.push(["verify","Tandai administrasi terverifikasi"]);
  if(s==="pending_signature")actions.push(["sign_physical","Catat tanda tangan fisik"],["sign_electronic","Catat tanda tangan elektronik"]);
  if(["physically_signed","electronically_signed"].includes(s))actions.push(["register","Registrasikan dokumen"]);
  if(s==="registered")actions.push(["archive","Arsipkan kerja sama"]);
  if(["draft","revision_required"].includes(s))actions.push(["edit","Ubah draft"]);
 }
 if(can("vice_principal_humas")){
  if(s==="verified")actions.push(["recommend","Berikan rekomendasi"]);
  if(s==="recommended")actions.push(["forward_to_principal","Teruskan ke Kepala Sekolah"]);
  if(["submitted","verified"].includes(s))actions.push(["request_revision","Minta revisi"]);
 }
 if(can("principal")&&s==="pending_principal_approval")actions.push(["approve","Setujui"],["reject","Tolak"],["request_revision","Minta revisi"]);
 if(can("principal")&&s==="approved")actions.push(["prepare_signature","Siapkan penandatanganan"]);
 return actions;
}
async function showAgreement(id){
 try{
  const d=await api("agreement-detail&id="+encodeURIComponent(id));const a=d.agreement;state.currentAgreement=a;
  $("detailTitle").textContent=a.title;$("detailStatus").textContent=statuses[a.status]||a.status;$("detailStatus").className="hk-status "+statusClass(a.status);
  const events=(a.events||[]).sort((x,y)=>new Date(y.occurred_at)-new Date(x.occurred_at));
  const docs=(a.documents||[]).sort((x,y)=>y.version_number-x.version_number);
  $("detailBody").innerHTML='<div class="hk-detail-grid"><p><b>Mitra</b><span>'+esc(a.partner&&a.partner.partner_name||"—")+'</span></p><p><b>Jenis</b><span>'+esc(a.agreement_type.toUpperCase())+'</span></p><p><b>Masa berlaku</b><span>'+esc(date(a.start_date))+' – '+esc(date(a.end_date))+'</span></p><p><b>Nilai perkiraan</b><span>'+esc(money(a.estimated_value))+'</span></p><p><b>Koordinator sekolah</b><span>'+esc(a.school_coordinator||"—")+'</span></p><p><b>Koordinator mitra</b><span>'+esc(a.partner_coordinator||"—")+'</span></p></div><h3>Tujuan kerja sama</h3><p>'+esc(a.purpose)+'</p><h3>Ruang lingkup</h3><p>'+esc(a.scope_of_work||"Belum diisi")+'</p><h3>Dokumen tersimpan</h3>'+(docs.length?'<ul>'+docs.map(x=>'<li>'+esc(x.file_name)+' · versi '+esc(x.version_number)+' · '+esc(date(x.uploaded_at.slice(0,10)))+'</li>').join("")+'</ul>':'<p>Belum ada dokumen yang diunggah.</p>')+'<h3>Riwayat proses</h3>'+(events.length?'<ol class="hk-timeline">'+events.map(x=>'<li><b>'+esc(statuses[x.to_status]||x.event_type)+'</b><span>'+esc(new Date(x.occurred_at).toLocaleString("id-ID"))+' · '+esc(x.actor_role||"sistem")+'</span><small>'+esc(x.reason||"Tidak ada catatan")+'</small></li>').join("")+'</ol>':'<p>Belum ada riwayat.</p>');
  const actions=actionList(a);
  $("workflowActions").innerHTML=actions.map(([act,label])=>'<button class="hk-btn '+(["approve","recommend","submit","register"].includes(act)?"hk-btn-primary":"hk-btn-secondary")+'" type="button" data-workflow-action="'+act+'">'+label+'</button>').join("")||'<p class="hk-muted">Tidak ada tindakan yang tersedia untuk peran dan tahap saat ini.</p>';
  $("detailDialog").showModal();
 }catch(e){notice(e.message,"error");}
}
async function runWorkflow(action){
 const a=state.currentAgreement;if(!a)return;
 let reason="";
 if(["reject","request_revision"].includes(action)){reason=window.prompt(action==="reject"?"Tuliskan alasan penolakan:":"Tuliskan catatan revisi:","");if(!reason||!reason.trim())return;}
 else if(!window.confirm("Jalankan tindakan ini pada dokumen kerja sama?"))return;
 try{
  await api("agreements","PATCH",{id:a.id,action,reason,actor_role:action==="request_revision"&&a.status==="pending_principal_approval"?"principal":undefined});$("detailDialog").close();notice("Tahapan kerja sama berhasil diperbarui.","success");await Promise.all([loadAgreements(),loadDashboard()]);
 }catch(e){notice(e.message,"error");}
}
function debounce(fn,wait=350){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait);};}
function bind(){
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();const b=e.currentTarget.querySelector("button");b.disabled=true;try{const fd=new FormData(e.currentTarget);await login(fd.get("email"),fd.get("password"));await loadMe();await refreshAll();}catch(err){clearSession();showLogin(err.message);}finally{b.disabled=false;}});
 $("logoutBtn").addEventListener("click",()=>{clearSession();state.roles=[];showLogin("Anda telah keluar.");});
 $("refreshBtn").addEventListener("click",refreshAll);
 $("newPartnerBtn").addEventListener("click",()=>openPartnerForm());
 $("partnerForm").addEventListener("submit",savePartner);
 $("partnerRows").addEventListener("click",partnerAction);
 $("newAgreementBtn").addEventListener("click",openAgreementForm);
 $("agreementForm").addEventListener("submit",saveAgreement);
 $("agreementRows").addEventListener("click",e=>{const b=e.target.closest("[data-open-agreement]");if(b)showAgreement(b.dataset.openAgreement);});
 $("workflowActions").addEventListener("click",e=>{const b=e.target.closest("[data-workflow-action]");if(b)runWorkflow(b.dataset.workflowAction);});
 document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
 const partnerReload=debounce(()=>{state.partnerPage=1;loadPartners().catch(e=>notice(e.message,"error"));});
 $("partnerSearch").addEventListener("input",partnerReload);$("partnerCategory").addEventListener("change",partnerReload);$("partnerStatus").addEventListener("change",partnerReload);
 $("agreementSearch").addEventListener("input",debounce(()=>{state.agreementPage=1;loadAgreements().catch(e=>notice(e.message,"error"));}));
 $("agreementStatus").addEventListener("change",()=>{state.agreementPage=1;loadAgreements().catch(e=>notice(e.message,"error"));});
 $("partnerPrev").addEventListener("click",()=>{if(state.partnerPage>1){state.partnerPage--;loadPartners().catch(e=>notice(e.message,"error"));}});
 $("partnerNext").addEventListener("click",()=>{state.partnerPage++;loadPartners().catch(e=>notice(e.message,"error"));});
 $("agreementPrev").addEventListener("click",()=>{if(state.agreementPage>1){state.agreementPage--;loadAgreements().catch(e=>notice(e.message,"error"));}});
 $("agreementNext").addEventListener("click",()=>{state.agreementPage++;loadAgreements().catch(e=>notice(e.message,"error"));});
}
async function init(){
 bind();
 if(!session().access&&!session().refresh){showLogin();return;}
 try{await refreshAll();}
 catch(e){clearSession();showLogin(e.message);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();