/* Spreadsheet-backed Tata Usaha session guard. Tokens are tab-scoped; never use localStorage. */
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
 const verify=async()=>{
  if(!session||typeof session.token!=="string"||!session.token||Number(session.expires_at||session.exp)*1000<=Date.now())return null;
  const response=await fetch("/api/tu/auth",{headers:{Authorization:"Bearer "+session.token},cache:"no-store"});
  const data=await response.json().catch(()=>({}));
  if(response.status===401)return null;
  if(!response.ok||!data.valid||!data.session)throw new Error(data.message||"session_unavailable");
  session=data.session;save(session);return data;
 };
 const context=async()=>{const data=await verify();if(!data)throw new Error("session_expired");return {success:true,user:data.user,roles:data.roles,units:[],assigned_units:[]};};
 const logout=async()=>{
  const token=session?.token;clear();session=null;
  try{await fetch("/api/tu/auth",{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},cache:"no-store",body:JSON.stringify({action:"logout"})});}catch(_){}
  location.replace(LOGIN);
 };
 window.tuAuth=Object.freeze({
  getAccessToken:async()=>{const data=await verify();if(!data)throw new Error("session_expired");return session.token;},
  getContext:context,
  getSession:()=>session?{user:{username:session.username,nama:session.nama},role:session.role,expires_at:session.expires_at}:null,
  getRole:()=>session?.role||"",
  logout
 });
 const guard=async()=>{
  try{
   const data=await verify();
   if(!data){clear();session=null;redirect();return;}
   document.documentElement.classList.remove("tu-auth-pending");
   const host=document.querySelector(".tu-sidebar-bottom");
   if(host&&!document.getElementById("tuLogoutButton")){
    const button=document.createElement("button");button.id="tuLogoutButton";button.type="button";button.className="tu-nav-link";button.style.width="100%";button.style.textAlign="left";
    button.innerHTML='<span class="tu-nav-icon" aria-hidden="true">↪</span><span>Keluar dari Tata Usaha</span>';button.addEventListener("click",logout);host.append(button);
   }
  }catch(_){clear();session=null;redirect();}
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",guard,{once:true});else guard();
})();