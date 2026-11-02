(() => {
"use strict";
const $=id=>document.getElementById(id);
const keys={access:"pintuku_humas_access",refresh:"pintuku_humas_refresh"};
const session=()=>({access:sessionStorage.getItem(keys.access),refresh:sessionStorage.getItem(keys.refresh)});
function save(data){if(data.access_token)sessionStorage.setItem(keys.access,data.access_token);if(data.refresh_token)sessionStorage.setItem(keys.refresh,data.refresh_token);}
function clear(){sessionStorage.removeItem(keys.access);sessionStorage.removeItem(keys.refresh);}
function notice(msg,type="info"){const el=$("notice");el.textContent=msg;el.className="hk-notice "+(type==="error"?"is-error":"");el.hidden=false;}
async function request(op,method="GET",body=null,auth=true){const headers={Accept:"application/json"};if(body){headers["Content-Type"]="application/json";}if(auth&&session().access)headers.Authorization="Bearer "+session().access;const r=await fetch("/api/humas?op="+encodeURIComponent(op),{method,headers,body:body?JSON.stringify(body):undefined,cache:"no-store"});let data={};try{data=await r.json();}catch(_){}return{r,data};}
function showLogin(){ $("loginPanel").hidden=false;$("workspace").hidden=true;$("logoutBtn").hidden=true;$("userBadge").hidden=true;}
function showWorkspace(user,roles){$("loginPanel").hidden=true;$("workspace").hidden=false;$("logoutBtn").hidden=false;$("userBadge").hidden=false;$("userBadge").textContent=user.email||"Pengguna HUMAS";$("userBadge").title=roles.join(", ");}
async function validateSession(){if(!session().access)return showLogin();const result=await request("workspace");if(result.r.status===401){clear();return showLogin();}if(!result.r.ok){showLogin();notice(result.data.message||"Layanan otorisasi belum tersedia.","error");return;}const d=result.data.data||{};const roles=Array.isArray(d.roles)?d.roles:[];if(!roles.some(x=>["staff_humas","vice_principal_humas","principal"].includes(x))){clear();showLogin();notice("Akun belum memiliki akses layanan HUMAS.","error");return;}showWorkspace(d.user||{},roles);}
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget,btn=form.querySelector('[type="submit"]');btn.disabled=true;try{const fd=new FormData(form);const result=await request("login","POST",{email:fd.get("email"),password:fd.get("password")},false);if(!result.r.ok)throw new Error(result.data.message||"Tidak dapat masuk.");save(result.data.data||{});await validateSession();}catch(err){notice(err.message,"error");}finally{btn.disabled=false;}});
$("logoutBtn").addEventListener("click",()=>{clear();showLogin();});
validateSession();
})();
