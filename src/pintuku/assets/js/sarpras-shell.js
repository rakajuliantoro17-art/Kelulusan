/* Shell ala YouTube untuk halaman kerja Sarpras: topbar + sidebar yang bisa diciutkan, chip navigasi bagian. DOM API saja. */
(() => {
 "use strict";
 const ALL=["admin_sarpras","staff_sarpras","arsiparis","wakasek_sarpras","principal","operator","teacher","homeroom_teacher"];
 const NAV=[
  {href:"/sarpras/admin",icon:"▦",label:"Operasional",full:"Dashboard Operasional",roles:["admin_sarpras","staff_sarpras","arsiparis"]},
  {href:"/sarpras/eksekutif",icon:"◈",label:"Eksekutif",full:"Executive Overview",roles:["admin_sarpras","wakasek_sarpras","principal"]},
  {href:"/sarpras/pengguna",icon:"♙",label:"Layanan",full:"Layanan Guru & Siswa",roles:ALL}
 ];
 const MORE=[{href:"/sarpras",icon:"⌂",label:"Publik",full:"Portal Publik Sarpras"},{href:"/",icon:"◐",label:"PINTUKU",full:"Kembali ke PINTUKU"}];
 const LABEL={admin_sarpras:"Admin Sarpras",staff_sarpras:"Staff Sarpras",arsiparis:"Arsiparis",wakasek_sarpras:"Wakasek Sarpras",principal:"Kepala Sekolah",operator:"Operator",teacher:"Guru",homeroom_teacher:"Wali Kelas"};
 const KEY="sp-sidebar-collapsed";
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const store={get(){try{return localStorage.getItem(KEY)==="1";}catch(_){return false;}},set(v){try{localStorage.setItem(KEY,v?"1":"0");}catch(_){}}};
 const link=(n,path)=>{
  const a=el("a","sp-item");a.href=n.href;a.title=n.full;
  if(path===n.href){a.classList.add("is-active");a.setAttribute("aria-current","page");}
  const ic=el("span","sp-item-icon",n.icon);ic.setAttribute("aria-hidden","true");
  a.append(ic,el("span","sp-item-label",n.full),el("span","sp-item-mini",n.label));return a;
 };
 const init=()=>{
  const main=document.querySelector("main.sarpras-workspace");
  if(!main||document.querySelector(".sp-shell"))return;
  document.body.classList.add("sp-glass");
  const auth=window.sarprasAuth&&window.sarprasAuth.getSession();
  const role=auth&&auth.role||"";
  const path=location.pathname.replace(/\/+$/,"")||"/";
  const mobile=()=>matchMedia("(max-width:850px)").matches;

  // topbar
  const top=el("header","sp-topbar");
  const burger=el("button","sp-burger");burger.type="button";burger.setAttribute("aria-controls","spSidebar");burger.setAttribute("aria-label","Buka atau tutup menu");burger.setAttribute("aria-expanded","true");
  const bars=el("span","sp-burger-bars");bars.setAttribute("aria-hidden","true");burger.append(bars);
  const logo=el("a","sp-logo");logo.href="/sarpras";
  const lm=el("span","sp-logo-mark","SP");lm.setAttribute("aria-hidden","true");logo.append(lm,el("span","sp-logo-text","Sarpras"));
  const spacer=el("span","sp-top-spacer");
  const right=el("div","sp-top-right");
  if(auth){
   const nama=auth.user&&auth.user.nama||auth.user&&auth.user.username||"Pengguna";
   const who=el("span","sp-top-who");who.append(el("strong",null,nama),el("small",null,LABEL[role]||role));
   const av=el("span","sp-user-avatar",nama.trim().slice(0,2).toUpperCase());av.setAttribute("aria-hidden","true");
   const out=el("button","sp-logout","Keluar");out.type="button";out.id="sarprasLogoutButton";
   out.addEventListener("click",()=>window.sarprasAuth.logout());
   right.append(who,av,out);
  }
  top.append(burger,logo,spacer,right);

  // sidebar
  const side=el("aside","sp-sidebar");side.id="spSidebar";side.setAttribute("aria-label","Navigasi Sarpras");
  const nav=el("nav","sp-nav");
  NAV.filter(n=>!role||n.roles.includes(role)).forEach(n=>nav.append(link(n,path)));
  const rule=el("div","sp-side-rule");
  const more=el("nav","sp-nav");more.setAttribute("aria-label","Menu lainnya");
  MORE.forEach(n=>more.append(link(n,path)));
  const foot=el("p","sp-side-foot","SMAN 1 Sooko · SARPRASIN");
  side.append(nav,rule,el("div","sp-side-caption","Lainnya"),more,foot);

  // chips: loncat ke bagian halaman
  const panels=Array.from(main.querySelectorAll(".sp-panel")).filter(p=>p.querySelector("h2"));
  let chips=null;
  if(panels.length>1){
   chips=el("div","sp-chips");chips.setAttribute("role","navigation");chips.setAttribute("aria-label","Bagian halaman");
   panels.forEach((p,i)=>{
    const t=p.querySelector("h2").textContent.trim();
    const c=el("button","sp-chip"+(i===0?" is-active":""),t);c.type="button";
    c.addEventListener("click",()=>{p.scrollIntoView({behavior:"smooth",block:"start"});chips.querySelectorAll(".sp-chip").forEach(x=>x.classList.toggle("is-active",x===c));});
    chips.append(c);
   });
  }

  const back=el("div","sp-backdrop");
  const shell=el("div","sp-shell");
  main.parentNode.insertBefore(shell,main);
  shell.append(top,side,main,back);
  if(chips)shell.insertBefore(chips,main);

  const apply=()=>{
   if(mobile()){shell.classList.remove("is-collapsed");}
   else shell.classList.toggle("is-collapsed",store.get());
  };
  const setOpen=open=>{side.classList.toggle("is-open",open);back.classList.toggle("is-visible",open);burger.setAttribute("aria-expanded",String(open));};
  burger.addEventListener("click",()=>{
   if(mobile()){setOpen(!side.classList.contains("is-open"));return;}
   const c=!shell.classList.contains("is-collapsed");store.set(c);shell.classList.toggle("is-collapsed",c);burger.setAttribute("aria-expanded",String(!c));
  });
  back.addEventListener("click",()=>setOpen(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")setOpen(false);});
  matchMedia("(max-width:850px)").addEventListener("change",()=>{setOpen(false);apply();});
  apply();burger.setAttribute("aria-expanded",String(mobile()?false:!shell.classList.contains("is-collapsed")));
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
