(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const form=$("spLoginForm"),username=$("spUsername"),password=$("spPassword"),submit=$("spLoginSubmit"),alertBox=$("spLoginAlert");
 const show=message=>{alertBox.textContent=message;alertBox.hidden=false;};
 const HOME={admin_sarpras:"/sarpras/admin",staff_sarpras:"/sarpras/admin",arsiparis:"/sarpras/admin",wakasek_sarpras:"/sarpras/eksekutif",principal:"/sarpras/eksekutif"};
 const requested=new URLSearchParams(location.search).get("next")||"";
 const safeNext=()=>/^\/sarpras\/(admin|eksekutif|pengguna)\/?$/.test(requested)?requested:"";
 $("spTogglePassword")?.addEventListener("click",()=>{const visible=password.type==="password";password.type=visible?"text":"password";$("spTogglePassword").textContent=visible?"Sembunyikan":"Tampilkan";$("spTogglePassword").setAttribute("aria-pressed",String(visible));});
 form?.addEventListener("submit",async event=>{
  event.preventDefault();alertBox.hidden=true;
  if(!form.reportValidity())return;
  submit.disabled=true;submit.querySelector("span").textContent="Memverifikasi akun…";
  try{
   const response=await fetch("/api/sarpras/auth",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"login",username:username.value.trim(),password:password.value})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.success||!data.session){show(data.message||"Login belum berhasil. Periksa data akun atau hubungi administrator.");return;}
   sessionStorage.setItem("pintuku-sarpras-session",JSON.stringify(data.session));
   location.replace(safeNext()||HOME[data.session.role]||"/sarpras/pengguna");
  }catch(_){show("Tidak dapat menghubungi layanan autentikasi. Periksa koneksi dan coba kembali.");}
  finally{submit.disabled=false;submit.querySelector("span").textContent="Masuk";password.value="";}
 });
})();
