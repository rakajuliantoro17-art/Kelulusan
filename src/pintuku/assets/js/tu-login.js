(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const form=$("tuLoginForm"),username=$("tuUsername"),password=$("tuPassword"),submit=$("tuLoginSubmit"),alertBox=$("tuLoginAlert");
 const show=message=>{alertBox.textContent=message;alertBox.hidden=false;};
 const params=new URLSearchParams(location.search);
 const requested=params.get("next")||"";
 const safeNext=()=>requested.startsWith("/tata-usaha/")&&!requested.startsWith("//")?requested:"";
 const roleHome=role=>"/tata-usaha/dashboard?workspace="+encodeURIComponent(role||"staff_tu");
 $("tuTogglePassword")?.addEventListener("click",()=>{const visible=password.type==="password";password.type=visible?"text":"password";$("tuTogglePassword").textContent=visible?"Sembunyikan":"Tampilkan";$("tuTogglePassword").setAttribute("aria-pressed",String(visible));});
 form?.addEventListener("submit",async event=>{
  event.preventDefault();alertBox.hidden=true;
  if(!form.reportValidity())return;
  submit.disabled=true;submit.querySelector("span").textContent="Memverifikasi akun…";
  try{
   const response=await fetch("/api/tu/auth",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"login",username:username.value.trim(),password:password.value})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.success||!data.session){show(data.message||"Login belum berhasil. Periksa data akun atau hubungi administrator.");return;}
   sessionStorage.setItem("pintuku-tu-session",JSON.stringify(data.session));
   location.replace(safeNext()||roleHome(data.session.role));
  }catch(_){show("Tidak dapat menghubungi layanan autentikasi. Periksa koneksi dan coba kembali.");}
  finally{submit.disabled=false;submit.querySelector("span").textContent="Masuk ke ruang kerja";password.value="";}
 });
})();