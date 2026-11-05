/* Spreadsheet-backed Tata Usaha session guard. Tokens are tab-scoped; never use localStorage. */
(() => {
 "use strict";
 const KEY="pintuku-tu-session";
 const LOGIN="/tata-usaha/login";
 const ROUTE_ROLES=[
  {match:path=>path.startsWith("/tata-usaha/akses"),roles:["head_tu"]},
  {match:path=>path.startsWith("/tata-usaha/front-office"),roles:["head_tu","fo_coordinator","receptionist","unit_officer","principal"]}
 ];
 const canAccess=(path,role)=>{const rule=ROUTE_ROLES.find(item=>item.match(path));return !rule||rule.roles.includes(role);};
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||"null");}catch(_){return null;}};
 const save=value=>sessionStorage.setItem(KEY,JSON.stringify(value));
 const clear=()=>sessionStorage.removeItem(KEY);
 let session=read();
 const redirect=()=>{const next=location.pathname+location.search+location.hash;location.replace(LOGIN+"?next="+encodeURIComponent(next));};
 if(document.documentElement.dataset.tuLoginPage==="true")return;
 document.documentElement.classList.add("tu-auth-pending");
 const verify=async()=>{
  if(!session||typeof session.token!=="string"||!session.token||Number(session.expires_at||session.exp)*1000<=Date.now())return null;
  const response=await fetch("/api/tu/auth",{method:"GET",headers:{Authorization:"Bearer "+session.token},cache:"no-store"});
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
  canAccess:(path=location.pathname)=>canAccess(path,session?.role||""),
  logout
 });
 const guard=async()=>{
  try{
   const data=await verify();
   if(!data){clear();session=null;redirect();return;}
   if(!canAccess(location.pathname, data.session.role)){
    const target="/tata-usaha/dashboard?denied="+encodeURIComponent(location.pathname);
    location.replace(target);return;
   }
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