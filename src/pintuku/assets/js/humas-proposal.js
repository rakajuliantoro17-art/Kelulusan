(() => {
"use strict";
const $=id=>document.getElementById(id);
const state={roles:[],page:1,current:null,editingId:null};
const keys={access:"pintuku_humas_access",refresh:"pintuku_humas_refresh"};
const categoryLabels={education:"Pendidikan",student_activity:"Kegiatan siswa",sports:"Olahraga",facility:"Sarana prasarana",community:"Sosial & masyarakat",event:"Acara sekolah",other:"Lainnya"};
const statusLabels={draft:"Draft",submitted:"Diajukan",under_review:"Ditelaah",revision_required:"Perlu revisi",approved:"Disetujui",rejected:"Ditolak",fundraising:"Penggalangan dukungan",funded:"Dukungan terpenuhi",in_progress:"Berjalan",completed:"Selesai",cancelled:"Dibatalkan",archived:"Diarsipkan"};
const supportLabels={prospect:"Calon sponsor",contacted:"Sudah dihubungi",proposed:"Penawaran dikirim",committed:"Komitmen",partially_realized:"Realisasi sebagian",realized:"Terealisasi",declined:"Tidak bersedia"};
const supportTypeLabels={cash:"Dana",goods:"Barang",services:"Jasa",facility:"Fasilitas",other:"Lainnya"};
const transitions={
 draft:["submitted","cancelled"],submitted:["under_review","revision_required","approved","rejected","cancelled"],
 under_review:["revision_required","approved","rejected","cancelled"],revision_required:["submitted","cancelled"],
 approved:["fundraising","in_progress","cancelled"],fundraising:["funded","in_progress","cancelled"],
 funded:["in_progress","cancelled"],in_progress:["completed","cancelled"],
 completed:["archived"],rejected:["archived"],cancelled:["archived"]
};
function notice(message,type="info"){const el=$("notice");el.textContent=message;el.className="hk-notice "+(type==="error"?"is-error":type==="success"?"is-success":"");el.hidden=false;}
function clearNotice(){$("notice").hidden=true;}
function session(){return{access:sessionStorage.getItem(keys.access),refresh:sessionStorage.getItem(keys.refresh)};}
function saveSession(data){if(data.access_token)sessionStorage.setItem(keys.access,data.access_token);if(data.refresh_token)sessionStorage.setItem(keys.refresh,data.refresh_token);}
function clearSession(){sessionStorage.removeItem(keys.access);sessionStorage.removeItem(keys.refresh);}
async function rawApi(op,method="GET",body=null,auth=true){
 const headers={"Accept":"application/json"};if(body)headers["Content-Type"]="application/json";
 if(auth&&session().access)headers.Authorization="Bearer "+session().access;
 const parts=String(op).split("&"),url="/api/humas?op="+encodeURIComponent(parts.shift())+(parts.length?"&"+parts.join("&"):"");
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
function canWrite(){return state.roles.includes("staff_humas");}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(value){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value||0));}
function date(value){if(!value)return "—";const d=new Date(value+"T00:00:00");return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(d);}
function statusClass(status){if(["approved","funded","completed"].includes(status))return "hk-status-active";if(["rejected","cancelled"].includes(status))return "hk-status-danger";return "hk-status-pending";}
function renderRows(items){
 const body=$("proposalRows");$("proposalEmpty").hidden=items.length>0;
 if(!items.length){body.innerHTML='<tr><td colspan="6" class="hk-empty">Belum ada proposal. Gunakan tombol “Buat proposal” untuk memulai.</td></tr>';return;}
 body.innerHTML=items.map(p=>'<tr><td><span class="hp-table-title">'+esc(p.title)+'</span><span class="hp-table-sub">'+esc(p.proposal_code||"Belum bernomor")+' · '+esc(p.owner_unit||"Unit belum diisi")+'</span></td><td>'+esc(categoryLabels[p.category]||p.category)+'</td><td><span class="hp-money">'+money(p.requested_amount)+'</span></td><td>'+esc(date(p.submission_deadline))+'</td><td><span class="hk-status '+statusClass(p.status)+'">'+esc(statusLabels[p.status]||p.status)+'</span></td><td><button class="hp-action-btn" type="button" data-open-proposal="'+esc(p.id)+'">Detail</button></td></tr>').join("");
}
async function loadWorkspace(){
 const q=new URLSearchParams({page:String(state.page),limit:"25",search:$("proposalSearch").value.trim(),category:$("proposalCategory").value,status:$("proposalStatus").value});
 const d=await api("proposal-workspace&"+q.toString());
 state.roles=Array.isArray(d.roles)?d.roles:[];
 if(!state.roles.some(r=>["staff_humas","vice_principal_humas","principal"].includes(r)))throw new Error("Akun belum memiliki akses layanan Proposal & Sponsorship.");
 showWorkspace(d.user||{});
 $("newProposalBtn").hidden=!canWrite();
 const summary=d.summary||{};
 $("kpiTotal").textContent=summary.total_proposals??0;
 $("kpiProcess").textContent=summary.in_process??0;
 $("kpiCommitted").textContent=money(summary.committed_support);
 $("kpiRealized").textContent=money(summary.realized_support);
 const data=d.proposals||{};renderRows(data.proposals||[]);
 $("proposalPageInfo").textContent="Halaman "+(data.page||state.page)+" · Maksimal 25 data";
 $("proposalPrev").disabled=state.page<=1;
 $("proposalNext").disabled=(data.proposals||[]).length<25;
}
function formData(form){return Object.fromEntries(new FormData(form).entries());}
function openProposalForm(proposal=null){
 state.editingId=proposal&&proposal.id||null;
 $("proposalForm").reset();
 $("proposalDialogTitle").textContent=state.editingId?"Perbarui draft proposal":"Buat proposal baru";
 $("proposalForm").querySelector('button[type="submit"]').textContent=state.editingId?"Simpan perubahan":"Simpan draft";
 if(proposal)for(const [k,v] of Object.entries(proposal)){const field=$("proposalForm").elements.namedItem(k);if(field)field.value=v??"";}
 $("proposalDialog").showModal();
}
async function saveProposal(e){
 e.preventDefault();const btn=e.currentTarget.querySelector('button[type="submit"]');btn.disabled=true;
 try{
  const payload=formData(e.currentTarget);
  if(state.editingId)await api("proposals","PATCH",{id:state.editingId,action:"update_draft",...payload});
  else await api("proposals","POST",payload);
  $("proposalDialog").close();notice(state.editingId?"Draft proposal diperbarui.":"Proposal berhasil disimpan sebagai draft.","success");
  state.editingId=null;state.page=1;await loadWorkspace();
 }catch(err){notice(err.message,"error");}finally{btn.disabled=false;}
}
async function showProposal(id){
 const d=await api("proposal-detail&id="+encodeURIComponent(id)),p=d.proposal;
 state.current=p;
 $("proposalDetailTitle").textContent=p.title||"Detail proposal";
 $("proposalDetailStatus").className="hk-status "+statusClass(p.status);
 $("proposalDetailStatus").textContent=statusLabels[p.status]||p.status;
 const details=[
  ["Nomor proposal",p.proposal_code||"Belum bernomor"],["Kategori",categoryLabels[p.category]||p.category],
  ["Target dukungan",money(p.requested_amount)],["Tanggal proposal",date(p.proposal_date)],
  ["Tenggat pengajuan",date(p.submission_deadline)],["Jadwal kegiatan",(date(p.activity_start_date)+" – "+date(p.activity_end_date))],
  ["Unit pengusul",p.owner_unit||"—"],["Koordinator",p.coordinator_name||"—"],
  ["Kontak koordinator",p.coordinator_contact||"—"],["Sasaran",p.target_audience||"—"],
  ["Tujuan",p.objectives||"—"],["Ringkasan",p.description||"—"]
 ];
 $("proposalDetailBody").innerHTML='<div class="hp-detail-grid">'+details.map(([k,v])=>'<div class="hp-detail-item"><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join("")+'</div>';
 $("addSupportBtn").hidden=!canWrite();
 renderSupports(p.supports||[]);
 renderStatusActions(p);
 $("proposalDetailDialog").showModal();
}
function renderSupports(items){
 const el=$("supportList");
 if(!items.length){el.innerHTML='<div class="hp-empty">Belum ada sponsor atau dukungan yang dicatat.</div>';return;}
 el.innerHTML=items.map(s=>{
  const controls=canWrite()?'<div class="hp-support-controls"><label class="hp-muted">Status<select data-support-status="'+esc(s.id)+'">'+Object.entries(supportLabels).map(([k,v])=>'<option value="'+k+'" '+(s.support_status===k?"selected":"")+'>'+v+'</option>').join("")+'</select></label><label class="hp-muted">Realisasi (Rp)<input data-support-realized="'+esc(s.id)+'" type="number" min="0" step="0.01" value="'+esc(s.realized_value||0)+'"></label><button class="hp-action-btn" type="button" data-save-support="'+esc(s.id)+'">Simpan</button></div>':"";
  return '<article class="hp-support-card"><div><h4>'+esc(s.sponsor_name)+'</h4><p>'+esc(supportTypeLabels[s.support_type]||s.support_type)+' · '+esc(supportLabels[s.support_status]||s.support_status)+'</p><p>'+esc(s.support_description||"Bentuk dukungan belum dirinci")+'</p><p>Estimasi: <strong class="hp-money">'+money(s.estimated_value)+'</strong> · Realisasi: <strong class="hp-money">'+money(s.realized_value)+'</strong></p>'+(s.contact_person?'<p>Narahubung: '+esc(s.contact_person)+'</p>':"")+'</div>'+controls+'</article>';
 }).join("");
}
function renderStatusActions(p){
 const allowed=transitions[p.status]||[];
 if(!canWrite()||!allowed.length){$("proposalStatusActions").innerHTML="";return;}
 $("proposalStatusActions").innerHTML='<label class="hp-muted">Perbarui status<select id="nextProposalStatus">'+allowed.map(x=>'<option value="'+x+'">'+(statusLabels[x]||x)+'</option>').join("")+'</select></label><label class="hp-muted">Catatan tindak lanjut<input id="proposalStatusReason" maxlength="1000" placeholder="Opsional"></label><button class="hk-btn hk-btn-primary" type="button" id="saveProposalStatus">Simpan status</button>';
 if(["draft","revision_required"].includes(p.status))$("proposalStatusActions").insertAdjacentHTML("afterbegin",'<button class="hk-btn hk-btn-secondary" type="button" id="editProposalBtn">Ubah draft</button>');
}
async function loadPartners(){
 const d=await api("partners&limit=100&status=active");
 const rows=d.partners||[];
 $("supportPartner").innerHTML='<option value="">Tidak ditautkan ke direktori mitra</option>'+rows.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.partner_name)+'</option>').join("");
}
async function openSupportForm(){
 if(!state.current)return;
 try{await loadPartners();$("supportForm").reset();$("supportForm").elements.namedItem("estimated_value").value="0";$("supportDialog").showModal();}
 catch(e){notice(e.message,"error");}
}
async function saveSupport(e){
 e.preventDefault();const btn=e.currentTarget.querySelector('button[type="submit"]');btn.disabled=true;
 try{await api("proposal-supports","POST",{proposal_id:state.current.id,...formData(e.currentTarget)});$("supportDialog").close();notice("Sponsor berhasil dicatat.","success");await showProposal(state.current.id);await loadWorkspace();}
 catch(err){notice(err.message,"error");}finally{btn.disabled=false;}
}
async function saveSupportUpdate(id){
 const status=$("supportList").querySelector('[data-support-status="'+CSS.escape(id)+'"]').value;
 const realized=$("supportList").querySelector('[data-support-realized="'+CSS.escape(id)+'"]').value;
 try{await api("proposal-supports","PATCH",{id,support_status:status,realized_value:realized,realization_date:status==="realized"?new Date().toISOString().slice(0,10):""});notice("Perkembangan dukungan diperbarui.","success");await showProposal(state.current.id);await loadWorkspace();}
 catch(e){notice(e.message,"error");}
}
async function changeStatus(){
 const status=$("nextProposalStatus").value,reason=$("proposalStatusReason").value;
 try{await api("proposals","PATCH",{id:state.current.id,action:"status",status,reason});notice("Status proposal diperbarui.","success");await showProposal(state.current.id);await loadWorkspace();}
 catch(e){notice(e.message,"error");}
}
function debounce(fn,wait=350){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait);};}
function bind(){
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();const b=e.currentTarget.querySelector('button[type="submit"]');b.disabled=true;try{const f=formData(e.currentTarget);const d=await rawApi("login","POST",{email:f.email,password:f.password},false);if(!d.response.ok)throw new Error(d.data.message||"Login gagal.");saveSession(d.data.data);await loadWorkspace();}catch(err){clearSession();showLogin(err.message);}finally{b.disabled=false;}});
 $("logoutBtn").addEventListener("click",()=>{clearSession();state.roles=[];showLogin("Anda telah keluar.");});
 $("refreshBtn").addEventListener("click",()=>loadWorkspace().catch(e=>notice(e.message,"error")));
 $("newProposalBtn").addEventListener("click",()=>openProposalForm());
 $("proposalForm").addEventListener("submit",saveProposal);
 $("proposalRows").addEventListener("click",e=>{const b=e.target.closest("[data-open-proposal]");if(b)showProposal(b.dataset.openProposal).catch(err=>notice(err.message,"error"));});
 $("proposalSearch").addEventListener("input",debounce(()=>{state.page=1;loadWorkspace().catch(e=>notice(e.message,"error"));}));
 $("proposalCategory").addEventListener("change",()=>{state.page=1;loadWorkspace().catch(e=>notice(e.message,"error"));});
 $("proposalStatus").addEventListener("change",()=>{state.page=1;loadWorkspace().catch(e=>notice(e.message,"error"));});
 $("proposalPrev").addEventListener("click",()=>{if(state.page>1){state.page--;loadWorkspace().catch(e=>notice(e.message,"error"));}});
 $("proposalNext").addEventListener("click",()=>{state.page++;loadWorkspace().catch(e=>notice(e.message,"error"));});
 $("addSupportBtn").addEventListener("click",openSupportForm);
 $("supportForm").addEventListener("submit",saveSupport);
 $("supportList").addEventListener("click",e=>{const b=e.target.closest("[data-save-support]");if(b)saveSupportUpdate(b.dataset.saveSupport);});
 $("proposalStatusActions").addEventListener("click",e=>{
  if(e.target.id==="saveProposalStatus")changeStatus();
  if(e.target.id==="editProposalBtn")openProposalForm(state.current);
 });
 document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
}
async function init(){
 bind();
 if(!session().access&&!session().refresh){showLogin();return;}
 try{await loadWorkspace();}catch(e){clearSession();showLogin(e.message);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();