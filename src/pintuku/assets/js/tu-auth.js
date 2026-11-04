/* Dedicated Tata Usaha session guard. Tokens are tab-scoped. */
(() => {
 "use strict";
 const KEY="pintuku-tu-session";
 const LOGIN="/tata-usaha/login";
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||"null");}catch(_){return null;}};
 const save=value=>sessionStorage.setItem(KEY,JSON.stringify(value));
 const clear=()=>sessionStorage.removeItem(KEY);
 let session=read();
 const redirect=()=>{const next=location.pathname+location.search+location.hash;location.replace(LOGIN+"?next="+encodeURIComponent(next));};
 if(document.documentElement.dataset.tuLoginPage==="true")return;
 document.documentElement.classList.add("tu-auth-pending");
 if(!session||typeof session.access_token!=="string"){clear();redirect();return;}
 const getAccessToken=async()=>{
  if(!session||typeof session.access_token!=="string")throw new Error("session_missing");
  const expiresAt=Number(session.expires_at)||0;
  if(expiresAt<=Math.floor(Date.now()/1000)+30){clear();session=null;redirect();throw new Error("session_expired");}
  return session.access_token;
 };
 window.tuAuth=Object.freeze({
  getAccessToken,
  getContext:async()=>{
   const token=await getAccessToken();
   const response=await fetch("/api/tu/context",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.success)throw new Error(data.message||"context_unavailable");
   return data;
  },
  getSession:()=>session?{user:session.user||null,expires_at:session.expires_at}:null,
  logout:async()=>{clear();session=null;location.replace(LOGIN);}
 });
 const guard=async()=>{
  try{
   const token=await getAccessToken();
   const response=await fetch("/api/tu/context",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
   const data=await response.json().catch(()=>({}));
   if(response.status===401){clear();session=null;redirect();return;}
   if(response.status===403){document.documentElement.classList.remove("tu-auth-pending");document.body.innerHTML='<main style="max-width:620px;margin:12vh auto;padding:28px;font:14px/1.7 system-ui;color:inherit"><h1>Akses Tata Usaha belum diberikan</h1><p>Akun sudah terautentikasi, tetapi belum memiliki peran TU yang diizinkan. Periksa kolom Status dan Peran pada Spreadsheet Pengguna TU.</p><button id="tuAuthLogout" type="button">Keluar</button></main>';document.getElementById("tuAuthLogout").addEventListener("click",()=>window.tuAuth.logout());return;}
   if(!response.ok||!data.success)throw new Error("context_unavailable");
   session.user=data.user||session.user;save(session);
   document.documentElement.classList.remove("tu-auth-pending");
   const host=document.querySelector(".tu-sidebar-bottom");
   if(host&&!document.getElementById("tuLogoutButton")){const button=document.createElement("button");button.id="tuLogoutButton";button.type="button";button.className="tu-nav-link";button.style.width="100%";button.style.textAlign="left";button.innerHTML='<span class="tu-nav-icon" aria-hidden="true">↪</span><span>Keluar dari Tata Usaha</span>';button.addEventListener("click",()=>window.tuAuth.logout());host.append(button);}
  }catch(_){clear();session=null;redirect();}
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",guard,{once:true});else guard();
})();
