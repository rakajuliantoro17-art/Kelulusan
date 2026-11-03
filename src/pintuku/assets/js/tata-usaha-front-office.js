/* PINTUKU Front Office — authenticated, server-persisted visitor workflow. */
(() => {
 "use strict";
 const $=(s,root=document)=>root.querySelector(s);
 const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
 const setText=(el,value)=>{if(el)el.textContent=value;};
 const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const state={visits:[],units:[],roles:[],context:null,loading:false};
 const FO_ROLES=new Set(["principal","head_tu","fo_coordinator","fo_receptionist","tu_operator"]);
 const APPROVER_ROLES=new Set(["unit_officer","head_tu","principal"]);
 const STATUS={
  pending_unit:["Menunggu unit tujuan","waiting"],
  approved:["Disetujui — menunggu kedatangan","approved"],
  clarification_requested:["Perlu klarifikasi","clarification"],
  rejected:["Ditolak unit tujuan","rejected"],
  checked_in:["Sedang berkunjung","active"],
  completed:["Kunjungan selesai","done"],
  cancelled:["Dibatalkan","cancelled"]
 };
 const formatDate=value=>{
  if(!value)return "—";
  const d=new Date(value);if(Number.isNaN(d.getTime()))return "—";
  return new Intl.DateTimeFormat("id",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);
 };
 const showNotice=(message,type="info")=>{
  const box=$("#foBackendNotice");if(!box)return;
  box.replaceChildren();
  const strong=node("strong","",type==="error"?"Layanan perlu diperiksa.":type==="success"?"Layanan tersambung.":"Informasi layanan.");
  box.append(strong,document.createTextNode(" "+message));
  box.dataset.state=type;
 };
 const api=async(path,options={})=>{
  if(!window.tuAuth||typeof window.tuAuth.getAccessToken!=="function")throw new Error("Sesi Tata Usaha belum siap. Muat ulang halaman atau masuk kembali.");
  const token=await window.tuAuth.getAccessToken();
  const headers={Authorization:"Bearer "+token,...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})};
  const response=await fetch(path,{...options,headers,cache:"no-store"});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.success)throw new Error(data.message||"Permintaan layanan tidak berhasil.");
  return data;
 };
 const unitName=id=>state.units.find(u=>u.id===id)?.unit_name||"Unit tujuan";
 const setView=name=>{
  $$(".fo-tab").forEach(b=>{const active=b.dataset.view===name;b.classList.toggle("is-active",active);b.setAttribute("aria-selected",String(active));});
  $$(".fo-view").forEach(v=>{const active=v.id==="view"+name[0].toUpperCase()+name.slice(1);v.classList.toggle("is-active",active);v.hidden=!active;});
  if(name==="register")$("#foRegisterForm")?.querySelector('input[name="name"]')?.focus({preventScroll:true});
 };
 const fillUnits=()=>{
  const select=$('#foRegisterForm select[name="unit"]');if(!select)return;
  select.replaceChildren(new Option("Pilih unit tujuan",""));
  state.units.forEach(unit=>select.add(new Option(unit.unit_name,unit.id)));
 };
 const renderStats=()=>{
  const visits=state.visits;
  setText($("#foTotal"),visits.length);
  setText($("#foWaiting"),visits.filter(v=>["pending_unit","clarification_requested"].includes(v.status)).length);
  setText($("#foActive"),visits.filter(v=>v.status==="checked_in").length);
  setText($("#foDone"),visits.filter(v=>v.status==="completed").length);
 };
 const actionButton=(label,action,id)=>{
  const b=node("button","fo-mini-btn",label);b.type="button";b.dataset.action=action;b.dataset.id=id;return b;
 };
 const renderQueue=()=>{
  const host=$("#foQueue");if(!host)return;
  host.replaceChildren();
  const q=($("#foSearch")?.value||"").trim().toLowerCase();
  const rows=state.visits.filter(v=>[
   v.visitor_name,v.organization,v.visit_code,unitName(v.destination_unit_id),v.host_name
  ].join(" ").toLowerCase().includes(q));
  if(!rows.length){const empty=node("div","fo-empty");empty.append(node("span","","♙"),node("strong","",state.visits.length?"Tidak ada hasil pencarian":"Belum ada kunjungan tersimpan"),node("p","",state.visits.length?"Ubah kata kunci pencarian.":"Registrasi baru akan muncul setelah disimpan melalui formulir petugas."));host.append(empty);return;}
  const list=node("div","fo-visitor-list");
  rows.forEach(v=>{
   const row=node("article","fo-visitor-row");
   const identity=node("div","fo-visitor-name");
   identity.append(node("span","fo-visitor-avatar",String(v.visitor_name||"T").trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("")));
   const copy=node("div");copy.append(node("strong","",v.visitor_name),node("small","",v.organization||"Pengunjung perorangan"));identity.append(copy);
   const meta=node("div","fo-visitor-meta");
   meta.append(node("strong","",unitName(v.destination_unit_id)+(v.host_name?" · "+v.host_name:"")),node("small","",v.purpose),node("small","",v.visit_code+" · "+formatDate(v.created_at)));
   const actions=node("div","fo-visitor-actions");
   const status=STATUS[v.status]||["Status tidak dikenal",""];actions.append(node("span","fo-status "+status[1],status[0]));
   if(v.visit_kind==="appointment")actions.append(node("small","fo-visit-time","Janji temu · "+formatDate(v.scheduled_at)));
   if(v.status==="approved")actions.append(actionButton("Catat kedatangan","checkin",v.id));
   if(v.status==="checked_in")actions.append(actionButton("Akhiri kunjungan","checkout",v.id));
   if(v.status==="clarification_requested")actions.append(actionButton("Kirim klarifikasi","resubmit",v.id));
   row.append(identity,meta,actions);list.append(row);
  });
  host.append(list);
 };
 const renderApprovals=()=>{
  const host=$("#foApprovalQueue");if(!host)return;
  host.replaceChildren();
  const assignedUnits=state.roles.filter(r=>r.role_code==="unit_officer"&&r.unit_id).map(r=>r.unit_id);
  const supervisor=state.roles.some(r=>["head_tu","principal"].includes(r.role_code));
  const rows=state.visits.filter(v=>v.status==="pending_unit"&&(supervisor||assignedUnits.includes(v.destination_unit_id)));
  if(!rows.length){const empty=node("div","fo-empty");empty.append(node("span","","✓"),node("strong","","Tidak ada permintaan menunggu keputusan"),node("p","","Permintaan baru dari Front Office akan tampil di sini."));host.append(empty);return;}
  const list=node("div","fo-visitor-list");
  rows.forEach(v=>{
   const row=node("article","fo-visitor-row");
   const identity=node("div","fo-visitor-name");identity.append(node("span","fo-visitor-avatar","FO"));
   const copy=node("div");copy.append(node("strong","",v.visitor_name),node("small","",v.organization||"Pengunjung perorangan"));identity.append(copy);
   const meta=node("div","fo-visitor-meta");meta.append(node("strong","",unitName(v.destination_unit_id)+(v.host_name?" · "+v.host_name:"")),node("small","",v.visit_code+" · "+formatDate(v.created_at)));
   const actions=node("div","fo-visitor-actions");actions.append(actionButton("Setujui","approve",v.id),actionButton("Klarifikasi","clarify",v.id),actionButton("Tolak","reject",v.id));
   row.append(identity,meta,actions);list.append(row);
  });
  host.append(list);
 };
 const render=()=>{renderStats();renderQueue();renderApprovals();};
 const loadVisits=async()=>{
  const data=await api("/api/tu/visits");
  state.visits=Array.isArray(data.visits)?data.visits:[];
  render();
 };
 const updateVisit=async(id,action,note)=>{
  await api("/api/tu/visits",{method:"PATCH",body:JSON.stringify({id,action,note:note||""})});
  await loadVisits();
 };
 const handleAction=async event=>{
  const button=event.target.closest("[data-action][data-id]");if(!button)return;
  const {action,id}=button.dataset;
  let note="";
  if(action==="reject"||action==="clarify"||action==="resubmit"){
   note=window.prompt(action==="reject"?"Alasan penolakan (wajib):":action==="clarify"?"Informasi yang perlu diklarifikasi (wajib):":"Catatan klarifikasi dari Front Office (wajib):","")||"";
   if(note.trim().length<3){showNotice("Tindakan dibatalkan. Catatan minimal 3 karakter diperlukan.","error");return;}
  }
  if(action==="approve"&&!window.confirm("Setujui permintaan kunjungan ini?"))return;
  if(action==="reject"&&!window.confirm("Tolak permintaan kunjungan ini?"))return;
  if(action==="checkin"&&!window.confirm("Catat bahwa tamu telah tiba di sekolah?"))return;
  if(action==="checkout"&&!window.confirm("Tutup kunjungan ini sebagai selesai?"))return;
  button.disabled=true;
  try{await updateVisit(id,action,note);showNotice("Perubahan status tersimpan dan tercatat pada audit trail.","success");}
  catch(error){showNotice(error.message,"error");button.disabled=false;}
 };
 const readForm=form=>{
  const fd=new FormData(form);
  return {
   visitor_name:String(fd.get("name")||"").trim(),
   organization:String(fd.get("organization")||"").trim(),
   contact_phone:String(fd.get("phone")||"").trim(),
   purpose:String(fd.get("purpose")||"").trim(),
   destination_unit_id:String(fd.get("unit")||""),
   host_name:String(fd.get("host")||"").trim(),
   notes:String(fd.get("notes")||"").trim(),
   visit_kind:fd.get("visit_kind")==="appointment"?"appointment":"walk_in",
   scheduled_at:String(fd.get("scheduled_at")||""),
   privacy_notice_delivered:fd.get("privacy_notice_delivered")==="on"
  };
 };
 const submitRegistration=form=>{
  form?.addEventListener("submit",async event=>{
   event.preventDefault();if(!form.reportValidity())return;
   const data=readForm(form);
   if(data.visit_kind==="appointment"){
    if(!data.scheduled_at){showNotice("Jadwal wajib diisi untuk janji temu.","error");return;}
    data.scheduled_at=new Date(data.scheduled_at).toISOString();
   }else data.scheduled_at=null;
   const button=form.querySelector('button[type="submit"]');if(button){button.disabled=true;button.textContent="Menyimpan…";}
   try{
    const result=await api("/api/tu/visits",{method:"POST",body:JSON.stringify(data)});
    form.reset();toggleSchedule();await loadVisits();setView("reception");
    const feedback=$("#foRegisterFeedback");if(feedback){feedback.hidden=false;feedback.textContent="Registrasi tersimpan. Nomor kunjungan: "+result.visit.visit_code+". Menunggu keputusan unit tujuan.";}
    showNotice("Registrasi "+result.visit.visit_code+" tersimpan. Unit tujuan menerima notifikasi internal.","success");
   }catch(error){showNotice(error.message,"error");}
   finally{if(button){button.disabled=false;button.textContent="Simpan registrasi kunjungan";}}
  });
 };
 const toggleSchedule=()=>{
  const form=$("#foRegisterForm");if(!form)return;
  const appointment=form.elements.visit_kind?.value==="appointment";
  const field=$("#foScheduleField");if(field)field.hidden=!appointment;
  const input=form.elements.scheduled_at;if(input){input.required=appointment;if(!appointment)input.value="";}
 };
 const init=()=>{
  const sidebar=$("#tuSidebar"),toggle=$("#tuMenuToggle"),backdrop=$("#tuSidebarBackdrop");
  const close=()=>{sidebar?.classList.remove("is-open");backdrop?.classList.remove("is-visible");toggle?.setAttribute("aria-expanded","false");};
  toggle?.addEventListener("click",()=>{const open=!sidebar.classList.contains("is-open");sidebar.classList.toggle("is-open",open);backdrop?.classList.toggle("is-visible",open);toggle.setAttribute("aria-expanded",String(open));});
  backdrop?.addEventListener("click",close);sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  $$(".fo-tab").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  document.addEventListener("click",e=>{const b=e.target.closest("[data-switch]");if(b)setView(b.dataset.switch);});
  $("#foQueue")?.addEventListener("click",handleAction);$("#foApprovalQueue")?.addEventListener("click",handleAction);
  $("#foSearch")?.addEventListener("input",renderQueue);
  $("#foRefresh")?.addEventListener("click",async()=>{const b=$("#foRefresh");b.disabled=true;try{await loadVisits();showNotice("Data kunjungan berhasil diperbarui.","success");}catch(error){showNotice(error.message,"error");}finally{b.disabled=false;}});
  $("#foRegisterForm")?.elements.visit_kind?.addEventListener("change",toggleSchedule);
  submitRegistration($("#foRegisterForm"));
  $("#foHelp")?.addEventListener("click",()=>{$("#foGuide").open=true;$("#foGuide").scrollIntoView({behavior:"smooth",block:"center"});});
  const updateClock=()=>{const d=new Date();setText($("#foToday"),new Intl.DateTimeFormat("id",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d));setText($("#foClock"),new Intl.DateTimeFormat("id",{hour:"2-digit",minute:"2-digit"}).format(d));setText($("#foKioskClock"),new Intl.DateTimeFormat("id",{hour:"2-digit",minute:"2-digit"}).format(d));};
  updateClock();setInterval(updateClock,30000);
  (async()=>{
   try{
    const context=await window.tuAuth.getContext();state.context=context;state.roles=context.roles||[];state.units=Array.isArray(context.units)?context.units:[];
    const isFo=state.roles.some(r=>FO_ROLES.has(r.role_code));
    const isApprover=state.roles.some(r=>APPROVER_ROLES.has(r.role_code));
    if(!isFo){["#tabReception","#tabRegister","#tabKiosk"].forEach(sel=>{const el=$(sel);if(el)el.hidden=true;});}
    if(isApprover){const tab=$("#tabApprovals");if(tab)tab.hidden=false;}
    if(!isFo&&!isApprover)throw new Error("Akun tidak memiliki akses operasional Front Office maupun persetujuan unit.");
    setText($("#foCurrentRole"),isFo?"Front Office":"Unit Officer");
    setText($("#foCurrentIdentity"),context.user?.email||"Petugas terautentikasi");
    setText($("#foConnectionState"),"Layanan tersambung");
    if(isFo)fillUnits();
    await loadVisits();
    if(!isFo&&isApprover)setView("approvals");
    showNotice("Terhubung ke backend. Data kunjungan dimuat dari database dan perubahan status diaudit.","success");
   }catch(error){
    setText($("#foConnectionState"),"Layanan tidak tersedia");
    showNotice(error.message||"Gagal memuat data layanan.","error");
    const queue=$("#foQueue");if(queue){queue.replaceChildren(node("div","fo-empty","Data tidak dapat dimuat. Periksa koneksi dan kewenangan akun."));}
   }
  })();
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
