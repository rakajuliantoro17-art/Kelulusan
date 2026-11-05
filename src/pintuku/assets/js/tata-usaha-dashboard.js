/* PINTUKU TU dashboard — role-based workspace presentation. */
(() => {
 "use strict";
 const ROLES={
  head_tu:{
   label:"Kepala Tata Usaha",title:"Dashboard Kepala Tata Usaha",
   description:"Pantau seluruh layanan, kendalikan prioritas pekerjaan, dan koordinasikan administrasi sekolah dari satu ruang kerja.",
   badge:"AKSES PENGELOLA TU",
   nav:["dashboard","tasks","spreadsheet","front-office","access","persuratan","arsip","administrasi","helpdesk","agenda","reports"],
   sections:["welcome","overview","spreadsheet","tasks","quick","coordination","guide"],
   services:["front-office","persuratan","arsip","administrasi","helpdesk","access","reports"]
  },
  staff_tu:{
   label:"Staf Tata Usaha",title:"Ruang Kerja Staf Tata Usaha",
   description:"Kelola pencatatan administrasi, tindak lanjuti pekerjaan, dan perbarui register layanan sesuai tanggung jawab Anda.",
   badge:"AKSES STAF ADMINISTRASI",
   nav:["dashboard","tasks","spreadsheet","persuratan","arsip","administrasi","helpdesk","agenda","reports"],
   sections:["welcome","overview","spreadsheet","tasks","quick","guide"],
   services:["persuratan","arsip","administrasi","helpdesk","reports"]
  },
  receptionist:{
   label:"Resepsionis",title:"Dashboard Front Office",
   description:"Kelola penerimaan tamu, registrasi kunjungan, dan koordinasi awal dengan unit tujuan melalui layanan satu pintu sekolah.",
   badge:"AKSES FRONT OFFICE",
   nav:["dashboard","front-office"],
   sections:["welcome","overview","quick","guide"],
   services:["front-office"]
  },
  fo_coordinator:{
   label:"Koordinator Front Office",title:"Dashboard Koordinator Front Office",
   description:"Pantau alur penerimaan tamu, koordinasikan petugas, dan pastikan standar pelayanan sekolah berjalan konsisten.",
   badge:"KOORDINASI FRONT OFFICE",
   nav:["dashboard","tasks","front-office","agenda","reports"],
   sections:["welcome","overview","tasks","quick","coordination","guide"],
   services:["front-office","reports"]
  },
  unit_officer:{
   label:"Petugas Unit",title:"Dashboard Petugas Unit",
   description:"Pantau permintaan yang diarahkan ke unit Anda dan tindak lanjuti konfirmasi layanan sesuai kewenangan.",
   badge:"AKSES UNIT LAYANAN",
   nav:["dashboard","front-office"],
   sections:["welcome","overview","tasks","quick","guide"],
   services:["front-office"]
  },
  principal:{
   label:"Kepala Sekolah",title:"Dashboard Eksekutif Tata Usaha",
   description:"Pantau ringkasan layanan dan koordinasi administrasi sekolah. Tindakan operasional tetap dilaksanakan petugas yang berwenang.",
   badge:"AKSES PEMANTAUAN",
   nav:["dashboard","reports"],
   sections:["welcome","overview","quick","coordination","guide"],
   services:["reports"]
  }
 };
 const ROLE_LABEL=Object.fromEntries(Object.entries(ROLES).map(([key,value])=>[key,value.label]));
 const applyRole=(role,context)=>{
  const config=ROLES[role];
  if(!config){location.replace("/tata-usaha/login?reason=role-unrecognized");return false;}
  document.body.dataset.tuRole=role;
  document.body.dataset.tuWorkspace=role;
  document.title=config.title+" · PINTUKU";
  const title=document.getElementById("tuWelcomeTitle");
  const description=document.getElementById("tuWelcomeDescription");
  const badge=document.getElementById("tuRoleBadge");
  if(title)title.textContent=config.title;
  if(description)description.textContent=config.description;
  if(badge)badge.textContent=config.badge;
  document.querySelectorAll("[data-tu-nav]").forEach(el=>{
   const visible=config.nav.includes(el.dataset.tuNav);
   el.hidden=!visible;
   if(visible&&el.dataset.tuNav==="dashboard"){el.classList.add("is-active");el.setAttribute("aria-current","page");}
   else{el.classList.remove("is-active");el.removeAttribute("aria-current");}
  });
  document.querySelectorAll("[data-tu-section]").forEach(el=>{el.hidden=!config.sections.includes(el.dataset.tuSection);});
  document.querySelectorAll("[data-tu-service]").forEach(el=>{el.hidden=!config.services.includes(el.dataset.tuService);});
  const chip=document.querySelector(".tu-user-chip");
  const user=context.user||{};
  if(chip){
   const strong=chip.querySelector("strong"),small=chip.querySelector("small"),avatar=chip.querySelector(".tu-user-avatar");
   if(strong)strong.textContent=user.nama||user.username||"Pengguna TU";
   if(small)small.textContent=config.label;
   if(avatar)avatar.textContent=String(user.nama||user.username||"TU").trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("")||"TU";
  }
  const params=new URLSearchParams(location.search);
  if(params.get("workspace")!==role){
   params.set("workspace",role);
   history.replaceState(null,"",location.pathname+"?"+params.toString()+location.hash);
  }
  return true;
 };
 const ready=()=>{
  const sidebar=document.getElementById("tuSidebar"),toggle=document.getElementById("tuMenuToggle"),backdrop=document.getElementById("tuSidebarBackdrop");
  const close=()=>{sidebar?.classList.remove("is-open");backdrop?.classList.remove("is-visible");toggle?.setAttribute("aria-expanded","false");document.body.classList.remove("tu-menu-open");};
  toggle?.addEventListener("click",()=>{const open=!sidebar.classList.contains("is-open");sidebar.classList.toggle("is-open",open);backdrop?.classList.toggle("is-visible",open);toggle?.setAttribute("aria-expanded",String(open));document.body.classList.toggle("tu-menu-open",open);});
  backdrop?.addEventListener("click",close);sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  const help=document.getElementById("tuHelpButton");help?.addEventListener("click",()=>{const guide=document.querySelector(".tu-guide");if(guide){guide.open=true;guide.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});}});
  const date=document.getElementById("tuTodayDate"),time=document.getElementById("tuTodayTime");
  const paintDate=language=>{const current=new Date();if(date)date.textContent=new Intl.DateTimeFormat(language,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(current);if(time)time.textContent=new Intl.DateTimeFormat(language,{hour:"2-digit",minute:"2-digit"}).format(current);};
  paintDate(document.documentElement.lang==="en"?"en":"id");
  document.addEventListener("pintuku:languagechange",event=>paintDate(event.detail?.language==="en"?"en":"id"));
  if(!window.tuAuth?.getContext){location.replace("/tata-usaha/login");return;}
  window.tuAuth.getContext().then(context=>{
   const role=context.roles?.[0]?.role_code||window.tuAuth.getRole()||"";
   applyRole(role,context);
  }).catch(()=>location.replace("/tata-usaha/login?reason=session-expired"));
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();