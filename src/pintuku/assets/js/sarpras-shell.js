/* Sidebar bergaya TU untuk halaman kerja Sarpras. Memakai DOM API; peran dibaca dari sesi sarprasAuth. */
(() => {
 "use strict";
 const ALL=["admin_sarpras","staff_sarpras","arsiparis","wakasek_sarpras","principal","operator","teacher","homeroom_teacher"];
 const NAV=[
  {href:"/sarpras/admin",icon:"▦",label:"Dashboard Operasional",roles:["admin_sarpras","staff_sarpras","arsiparis"]},
  {href:"/sarpras/eksekutif",icon:"◈",label:"Executive Overview",roles:["admin_sarpras","wakasek_sarpras","principal"]},
  {href:"/sarpras/pengguna",icon:"♙",label:"Layanan Guru & Siswa",roles:ALL},
  {href:"/sarpras",icon:"⌂",label:"Portal Publik Sarpras",roles:ALL}
 ];
 const LABEL={admin_sarpras:"Admin Sarpras",staff_sarpras:"Staff Sarpras",arsiparis:"Arsiparis",wakasek_sarpras:"Wakasek Sarpras",principal:"Kepala Sekolah",operator:"Operator",teacher:"Guru",homeroom_teacher:"Wali Kelas"};
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const init=()=>{
  const main=document.querySelector("main.sarpras-workspace");
  if(!main||document.querySelector(".sp-shell"))return;
  document.body.classList.add("sp-glass");
  const auth=window.sarprasAuth&&window.sarprasAuth.getSession();
  const role=auth&&auth.role||"";
  const path=location.pathname.replace(/\/+$/,"")||"/";
  const side=el("aside","sp-sidebar");side.id="spSidebar";side.setAttribute("aria-label","Navigasi Sarpras");
  const brand=el("div","sp-brand"),mark=el("div","sp-brand-mark","SP");mark.setAttribute("aria-hidden","true");
  const bt=el("div");bt.append(el("strong",null,"Sarpras"),el("span",null,"Sarana & Prasarana"));brand.append(mark,bt);
  const nav=el("nav","sp-nav");
  NAV.filter(n=>!role||n.roles.includes(role)).forEach(n=>{
   const a=el("a");a.href=n.href;
   if(path===n.href){a.classList.add("is-active");a.setAttribute("aria-current","page");}
   const ic=el("span","sp-nav-icon",n.icon);ic.setAttribute("aria-hidden","true");
   a.append(ic,el("span",null,n.label));nav.append(a);
  });
  const bottom=el("div","sp-side-bottom");
  if(auth){
   const nama=auth.user&&auth.user.nama||auth.user&&auth.user.username||"Pengguna";
   const chip=el("div","sp-user"),av=el("span","sp-user-avatar",nama.trim().slice(0,2).toUpperCase());av.setAttribute("aria-hidden","true");
   const who=el("span");who.append(el("strong",null,nama),el("small",null,LABEL[role]||role));chip.append(av,who);
   const out=el("button","sp-logout","Keluar");out.type="button";out.id="sarprasLogoutButton";
   out.addEventListener("click",()=>window.sarprasAuth.logout());
   bottom.append(chip,out);
  }
  side.append(brand,el("div","sp-nav-caption","RUANG KERJA"),nav,bottom);
  const bar=el("div","sp-mobilebar"),tog=el("button","sp-menu-toggle");tog.type="button";tog.setAttribute("aria-controls","spSidebar");tog.setAttribute("aria-expanded","false");
  tog.append(el("span",null,"☰"),el("span",null,"Menu Sarpras"));bar.append(tog,el("span","sp-mobile-label","PINTUKU · SARPRAS"));
  const back=el("div","sp-backdrop");
  const shell=el("div","sp-shell");
  main.parentNode.insertBefore(shell,main);
  shell.append(side,main);main.prepend(bar);shell.append(back);
  const set=open=>{side.classList.toggle("is-open",open);back.classList.toggle("is-visible",open);tog.setAttribute("aria-expanded",String(open));};
  tog.addEventListener("click",()=>set(!side.classList.contains("is-open")));
  back.addEventListener("click",()=>set(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false);});
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
