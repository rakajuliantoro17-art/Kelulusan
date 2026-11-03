/* PINTUKU TU dashboard — accessible shell interactions; no demo data is persisted. */
(() => {
 "use strict";
 const ready=()=>{
  const sidebar=document.getElementById("tuSidebar");
  const toggle=document.getElementById("tuMenuToggle");
  const backdrop=document.getElementById("tuSidebarBackdrop");
  const close=()=>{sidebar?.classList.remove("is-open");backdrop?.classList.remove("is-visible");toggle?.setAttribute("aria-expanded","false");document.body.classList.remove("tu-menu-open");};
  toggle?.addEventListener("click",()=>{const open=!sidebar.classList.contains("is-open");sidebar.classList.toggle("is-open",open);backdrop.classList.toggle("is-visible",open);toggle.setAttribute("aria-expanded",String(open));document.body.classList.toggle("tu-menu-open",open);});
  backdrop?.addEventListener("click",close);
  sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  const help=document.getElementById("tuHelpButton");
  help?.addEventListener("click",()=>{const guide=document.querySelector(".tu-guide");if(guide){guide.open=true;guide.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});}});
  const now=new Date();
  const lang=document.documentElement.lang==="en"?"en":"id";
  const date=document.getElementById("tuTodayDate");
  const time=document.getElementById("tuTodayTime");
  if(date)date.textContent=new Intl.DateTimeFormat(lang,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(now);
  if(time)time.textContent=new Intl.DateTimeFormat(lang,{hour:"2-digit",minute:"2-digit"}).format(now);
  document.addEventListener("pintuku:languagechange",event=>{
   const language=event.detail?.language==="en"?"en":"id";
   const current=new Date();
   if(date)date.textContent=new Intl.DateTimeFormat(language,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(current);
   if(time)time.textContent=new Intl.DateTimeFormat(language,{hour:"2-digit",minute:"2-digit"}).format(current);
  });
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();
