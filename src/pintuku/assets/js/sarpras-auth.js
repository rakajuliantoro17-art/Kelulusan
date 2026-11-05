/* Spreadsheet-backed Sarpras session guard. Tokens are tab-scoped; never use localStorage. */
(() => {
 "use strict";
 const KEY="pintuku-sarpras-session";
 const LOGIN="/sarpras/login";
 const HOME={admin_sarpras:"/sarpras/admin",staff_sarpras:"/sarpras/admin",arsiparis:"/sarpras/admin",wakasek_sarpras:"/sarpras/eksekutif",principal:"/sarpras/eksekutif"};
 const roleHome=role=>HOME[role]||"/sarpras/pengguna";
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||"null");}catch(_){return null;}};
 const save=value=>sessionStorage.setItem(KEY,JSON.stringify(value));
 const clear=()=>sessionStorage.removeItem(KEY);
 let session=read();
 const redirect=()=>{const next=location.pathname+location.search+location.hash;location.replace(LOGIN+"?next="+encodeURIComponent(next));};
 const allow=(document.documentElement.dataset.sarprasAllow||"").split(",").map(x=>x.trim()).filter(Boolean);
 const verify=async()=>{
  if(!session||typeof session.token!=="string"||!session.token||Number(session.expires_at||session.exp)*1000<=Date.now())return null;
  const response=await fetch("/api/sarpras/auth",{method:"GET",headers:{Authorization:"Bearer "+session.token},cache:"no-store"});
  const data=await response.json().catch(()=>({}));
  if(response.status===401)return null;
  if(!response.ok||!data.valid||!data.session)throw new Error(data.message||"session_unavailable");
  session=data.session;save(session);return data;
 };
 const logout=async()=>{
  const token=session?.token;clear();session=null;
  try{await fetch("/api/sarpras/auth",{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},cache:"no-store",body:JSON.stringify({action:"logout"})});}catch(_){}
  location.replace(LOGIN);
 };
 window.sarprasAuth=Object.freeze({
  getAccessToken:async()=>{const data=await verify();if(!data)throw new Error("session_expired");return session.token;},
  getSession:()=>session?{user:{username:session.username,nama:session.nama},role:session.role,expires_at:session.expires_at}:null,
  getRole:()=>session?.role||"",
  roleHome,
  logout
 });
 document.documentElement.classList.add("sarpras-auth-pending");
 const guard=async()=>{
  try{
   const data=await verify();
   if(!data){clear();session=null;redirect();return;}
   if(allow.length&&!allow.includes(session.role)){location.replace(roleHome(session.role));return;}
   document.documentElement.classList.remove("sarpras-auth-pending");
   const head=document.querySelector(".sp-page-head");
   if(head&&!document.getElementById("sarprasLogoutButton")){
    const box=document.createElement("div");box.style.cssText="display:flex;gap:10px;align-items:center;font-size:13px;flex-wrap:wrap";
    const who=document.createElement("span");who.textContent=(session.nama||session.username)+" · "+session.role;
    const button=document.createElement("button");button.id="sarprasLogoutButton";button.type="button";button.textContent="Keluar";
    button.style.cssText="padding:6px 14px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer";
    button.addEventListener("click",logout);box.append(who,button);head.append(box);
   }
  }catch(_){clear();session=null;redirect();}
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",guard,{once:true});else guard();
})();
