(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const form=$("tuLoginForm"),email=$("tuEmail"),password=$("tuPassword"),submit=$("tuLoginSubmit"),alertBox=$("tuLoginAlert");
 const show=(message)=>{alertBox.textContent=message;alertBox.hidden=false;};
 const params=new URLSearchParams(location.search);
 const requested=params.get("next")||"/tata-usaha";
 const safeNext=()=>requested.startsWith("/tata-usaha")&&!requested.startsWith("//")?requested:"/tata-usaha";
 $("tuTogglePassword")?.addEventListener("click",()=>{const showPassword=password.type==="password";password.type=showPassword?"text":"password";$("tuTogglePassword").textContent=showPassword?"Sembunyikan":"Tampilkan";$("tuTogglePassword").setAttribute("aria-pressed",String(showPassword));});
 form?.addEventListener("submit",async event=>{
  event.preventDefault();alertBox.hidden=true;
  if(!form.reportValidity())return;
  submit.disabled=true;submit.querySelector("span").textContent="Memverifikasi akun…";
  try{
   const response=await fetch("/api/tu/auth",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action:"login",email:email.value.trim(),password:password.value})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.success||!data.session){show(data.message||"Login belum berhasil. Periksa data akun atau hubungi administrator.");return;}
   sessionStorage.setItem("pintuku-tu-session",JSON.stringify(data.session));
   location.replace(safeNext());
  }catch(_){show("Tidak dapat menghubungi layanan autentikasi. Periksa koneksi dan coba kembali.");}
  finally{submit.disabled=false;submit.querySelector("span").textContent="Masuk ke ruang kerja";password.value="";}
 });
})();
