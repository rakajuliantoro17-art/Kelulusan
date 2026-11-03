/* PINTUKU Front Office prototype. Volatile in-memory state only; no PII persistence/network. */
(() => {
 "use strict";
 const visitors=[];
 let sequence=0;
 const $=(s,root=document)=>root.querySelector(s);
 const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
 const escapeText=(v)=>String(v??"");
 const setText=(el,value)=>{if(el)el.textContent=value;};
 const nowDate=()=>new Date();
 const formatDate=(d)=>new Intl.DateTimeFormat(document.documentElement.lang==="en"?"en":"id",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);
 const ticket=()=>{const d=nowDate();const y=String(d.getFullYear()).slice(-2);const m=String(d.getMonth()+1).padStart(2,"0");const day=String(d.getDate()).padStart(2,"0");sequence+=1;return "FO-"+y+m+day+"-"+String(sequence).padStart(3,"0");};
 const setView=(name)=>{
  $$(".fo-tab").forEach(b=>{const active=b.dataset.view===name;b.classList.toggle("is-active",active);b.setAttribute("aria-selected",String(active));});
  $$(".fo-view").forEach(v=>{const active=v.id==="view"+name[0].toUpperCase()+name.slice(1);v.classList.toggle("is-active",active);v.hidden=!active;});
  if(name==="kiosk"){$("#foKioskForm")?.querySelector("input[name=name]")?.focus({preventScroll:true});}
  if(name==="register")$("#foRegisterForm")?.querySelector("input[name=name]")?.focus({preventScroll:true});
 };
 const readForm=(form)=>{const fd=new FormData(form);return {name:escapeText(fd.get("name")).trim(),organization:escapeText(fd.get("organization")).trim(),phone:escapeText(fd.get("phone")).trim(),purpose:escapeText(fd.get("purpose")).trim(),unit:escapeText(fd.get("unit")).trim(),host:escapeText(fd.get("host")).trim(),notes:escapeText(fd.get("notes")).trim()};};
 const addVisitor=(data,source)=>{const record={...data,code:ticket(),source,status:"waiting",createdAt:nowDate()};visitors.unshift(record);render();return record;};
 const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const render=()=>{
  const waiting=visitors.filter(v=>v.status==="waiting").length,active=visitors.filter(v=>v.status==="active").length,done=visitors.filter(v=>v.status==="done").length;
  setText($("#foTotal"),visitors.length);setText($("#foWaiting"),waiting);setText($("#foActive"),active);setText($("#foDone"),done);
  const host=$("#foQueue");if(!host)return;host.replaceChildren();
  const q=($("#foSearch")?.value||"").trim().toLowerCase();
  const filtered=visitors.filter(v=>[v.name,v.organization,v.code,v.unit,v.host].join(" ").toLowerCase().includes(q));
  if(!filtered.length){const empty=node("div","fo-empty");empty.append(node("span","", "♙"),node("strong","",visitors.length?"Tidak ada hasil pencarian":"Belum ada tamu terdaftar"),node("p","",visitors.length?"Ubah kata kunci pencarian dan coba lagi.":"Daftarkan tamu melalui formulir petugas atau mode kiosk."));if(!visitors.length){const b=node("button","fo-primary-btn","Buka registrasi tamu");b.type="button";b.dataset.switch="register";empty.append(b);}host.append(empty);return;}
  const list=node("div","fo-visitor-list");
  filtered.forEach(v=>{
   const row=node("article","fo-visitor-row");const identity=node("div","fo-visitor-name");identity.append(node("span","fo-visitor-avatar",v.name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("")));const copy=node("div");copy.append(node("strong","",v.name),node("small","",v.organization||"Pengunjung perorangan"));identity.append(copy);
   const meta=node("div","fo-visitor-meta");meta.append(node("strong","",v.unit+(v.host?" · "+v.host:"")),node("small","",v.code+" · "+formatDate(v.createdAt)));
   const actions=node("div","fo-visitor-actions");const status=node("span","fo-status "+v.status,v.status==="waiting"?"Menunggu konfirmasi":v.status==="active"?"Sedang berkunjung":"Selesai");actions.append(status);
   if(v.status==="waiting"){const b=node("button","fo-mini-btn","Konfirmasi diterima");b.type="button";b.dataset.action="accept";b.dataset.code=v.code;actions.append(b);}
   if(v.status==="active"){const b=node("button","fo-mini-btn","Akhiri kunjungan");b.type="button";b.dataset.action="finish";b.dataset.code=v.code;actions.append(b);}
   row.append(identity,meta,actions);list.append(row);
  });
  host.append(list);
 };
 const submit=(form,source)=>{
  form.addEventListener("submit",e=>{
   e.preventDefault();if(!form.reportValidity())return;
   const data=readForm(form);if(!data.name||!data.purpose||!data.unit)return;
   const record=addVisitor(data,source);
   if(source==="kiosk"){
    const body=$("#foKioskBody");const success=node("div","fo-kiosk-success");success.append(node("div","fo-kiosk-symbol","✓"),node("span","tu-section-kicker","REGISTRASI DITERIMA"),node("h2","","Terima kasih, "+record.name+"."),node("p","","Registrasi awal Anda sudah masuk ke antrean petugas. Silakan tunjukkan nomor kunjungan berikut kepada petugas Front Office untuk konfirmasi dan arahan selanjutnya."),node("div","fo-ticket-code",record.code));const next=node("button","","Kembali ke halaman awal");next.type="button";next.addEventListener("click",()=>{form.reset();success.remove();form.hidden=false;});form.hidden=true;body.append(success);
   }else{
    form.reset();const feedback=$("#foRegisterFeedback");if(feedback){feedback.hidden=false;feedback.textContent="Registrasi berhasil dibuat untuk sesi ini. Nomor kunjungan: "+record.code;}setView("reception");
   }
  });
 };
 const init=()=>{
  const sidebar=$("#tuSidebar"),toggle=$("#tuMenuToggle"),backdrop=$("#tuSidebarBackdrop");
  const close=()=>{sidebar?.classList.remove("is-open");backdrop?.classList.remove("is-visible");toggle?.setAttribute("aria-expanded","false");};
  toggle?.addEventListener("click",()=>{const open=!sidebar.classList.contains("is-open");sidebar.classList.toggle("is-open",open);backdrop?.classList.toggle("is-visible",open);toggle.setAttribute("aria-expanded",String(open));});
  backdrop?.addEventListener("click",close);sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  $$(".fo-tab").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  document.addEventListener("click",e=>{const b=e.target.closest("[data-switch]");if(b)setView(b.dataset.switch);});
  $("#foQueue")?.addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b)return;const v=visitors.find(x=>x.code===b.dataset.code);if(!v)return;if(b.dataset.action==="accept"&&v.status==="waiting")v.status="active";else if(b.dataset.action==="finish"&&v.status==="active")v.status="done";render();});
  $("#foSearch")?.addEventListener("input",render);
  const reg=$("#foRegisterForm"),kiosk=$("#foKioskForm");
  if(reg)submit(reg,"receptionist");if(kiosk)submit(kiosk,"kiosk");
  $("#foHelp")?.addEventListener("click",()=>{$("#foGuide").open=true;$("#foGuide").scrollIntoView({behavior:"smooth",block:"center"});});
  const updateClock=()=>{const d=nowDate();setText($("#foToday"),new Intl.DateTimeFormat("id",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d));setText($("#foClock"),new Intl.DateTimeFormat("id",{hour:"2-digit",minute:"2-digit"}).format(d));setText($("#foKioskClock"),new Intl.DateTimeFormat("id",{hour:"2-digit",minute:"2-digit"}).format(d));};
  updateClock();render();document.addEventListener("pintuku:languagechange",updateClock);
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
