/* PINTUKU TU dashboard — accessible shell interactions and role-aware identity. */
(() => {
 "use strict";
 const ROLE_LABEL={head_tu:"Kepala Tata Usaha",staff_tu:"Staf Tata Usaha",receptionist:"Resepsionis",fo_coordinator:"Koordinator Front Office",unit_officer:"Petugas Unit",principal:"Kepala Sekolah"};
 const ready=()=>{
  const sidebar=document.getElementById("tuSidebar"),toggle=document.getElementById("tuMenuToggle"),backdrop=document.getElementById("tuSidebarBackdrop");
  const close=()=>{sidebar?.classList.remove("is-open");backdrop?.classList.remove("is-visible");toggle?.setAttribute("aria-expanded","false");document.body.classList.remove("tu-menu-open");};
  toggle?.addEventListener("click",()=>{const open=!sidebar.classList.contains("is-open");sidebar.classList.toggle("is-open",open);backdrop?.classList.toggle("is-visible",open);toggle?.setAttribute("aria-expanded",String(open));document.body.classList.toggle("tu-menu-open",open);});
  backdrop?.addEventListener("click",close);sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  const help=document.getElementById("tuHelpButton");help?.addEventListener("click",()=>{const guide=document.querySelector(".tu-guide");if(guide){guide.open=true;guide.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});}});
  const now=new Date(),lang=document.documentElement.lang==="en"?"en":"id",date=document.getElementById("tuTodayDate"),time=document.getElementById("tuTodayTime");
  const paintDate=language=>{const current=new Date();if(date)date.textContent=new Intl.DateTimeFormat(language,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(current);if(time)time.textContent=new Intl.DateTimeFormat(language,{hour:"2-digit",minute:"2-digit"}).format(current);};
  paintDate(lang);
  document.addEventListener("pintuku:languagechange",event=>paintDate(event.detail?.language==="en"?"en":"id"));
  if(window.tuAuth?.getContext){
   window.tuAuth.getContext().then(context=>{
    const user=context.user||{},role=context.roles?.[0]?.role_code||window.tuAuth.getRole()||"";
    const chip=document.querySelector(".tu-user-chip");
    if(chip){const strong=chip.querySelector("strong"),small=chip.querySelector("small");if(strong)strong.textContent=user.nama||user.username||"Pengguna TU";if(small)small.textContent=ROLE_LABEL[role]||"Akun Tata Usaha";}
    document.body.dataset.tuRole=role;
    document.body.dataset.tuWorkspace=new URLSearchParams(location.search).get("workspace")||role;
   }).catch(()=>{});
  }
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();