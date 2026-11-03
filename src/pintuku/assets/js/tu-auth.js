/* Dedicated Tata Usaha session guard. Tokens are tab-scoped; never use localStorage. */
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
 if(!session||typeof session.access_token!=="string"||typeof session.refresh_token!=="string"){clear();redirect();return;}
 let refreshPromise=null;
 const refresh=()=>{
  if(refreshPromise)return refreshPromise;
  refreshPromise=fetch("/api/tu/auth",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"refresh",refresh_token:session.refresh_token})})
   .then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok||!data.success||!data.session)throw new Error("session_expired");session=data.session;save(session);return session.access_token;})
   .catch(()=>{clear();redirect();throw new Error("session_expired");})
   .finally(()=>{refreshPromise=null;});
  return refreshPromise;
 };
 const getAccessToken=async()=>{
  if(!session)throw new Error("session_missing");
  const expiresAt=Number(session.expires_at)||0;
  if(expiresAt<=Math.floor(Date.now()/1000)+60)return refresh();
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
  logout:async()=>{const token=session?.access_token;clear();session=null;try{await fetch("/api/tu/auth",{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},cache:"no-store",body:JSON.stringify({action:"logout"})});}catch(_){}location.replace(LOGIN);}
 });
 const guard=async()=>{
  try{
   const token=await getAccessToken();
   const response=await fetch("/api/tu/context",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
   const data=await response.json().catch(()=>({}));
   if(response.status===401){clear();redirect();return;}
   if(response.status===403){document.documentElement.classList.remove("tu-auth-pending");document.body.innerHTML='<main style="max-width:620px;margin:12vh auto;padding:28px;font:14px/1.7 system-ui;color:inherit"><h1>Akses Tata Usaha belum diberikan</h1><p>Akun sudah terautentikasi, tetapi belum memiliki peran bisnis TU yang aktif. Hubungi administrator yang berwenang.</p><button id="tuAuthLogout" type="button">Keluar</button></main>';document.getElementById("tuAuthLogout").addEventListener("click",()=>window.tuAuth.logout());return;}
   if(!response.ok||!data.success)throw new Error("context_unavailable");
   session.user=data.user||session.user;save(session);
   document.documentElement.classList.remove("tu-auth-pending");
   const host=document.querySelector(".tu-sidebar-bottom");
   if(host&&!document.getElementById("tuLogoutButton")){const button=document.createElement("button");button.id="tuLogoutButton";button.type="button";button.className="tu-nav-link";button.style.width="100%";button.style.textAlign="left";button.innerHTML='<span class="tu-nav-icon" aria-hidden="true">↪</span><span>Keluar dari Tata Usaha</span>';button.addEventListener("click",()=>window.tuAuth.logout());host.append(button);}
  }catch(_){clear();redirect();}
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",guard,{once:true});else guard();
})();
