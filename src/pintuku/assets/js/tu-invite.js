(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const status=$("inviteStatus"),wrap=$("inviteFormWrap"),form=$("inviteForm"),submit=$("inviteSubmit");
 let inviteAccessToken="";
 const show=(message,type="")=>{status.textContent=message;status.className="status"+(type?" "+type:"");};
 const post=async body=>{
  const response=await fetch("/api/tu/auth",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",credentials:"same-origin",referrerPolicy:"no-referrer",body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.success)throw Object.assign(new Error(data.message||"Permintaan tidak dapat diproses."),{code:data.code,status:response.status});
  return data;
 };
 (async()=>{
  const url=new URL(location.href),tokenHash=url.searchParams.get("token_hash"),type=url.searchParams.get("type");
  // Remove the one-time secret from the address bar and browser history before network activity.
  history.replaceState(null,"",location.pathname);
  if(type!=="invite"||!tokenHash){show("Parameter undangan tidak ditemukan. Gunakan tautan undangan terbaru dari administrator.","error");return;}
  try{
   const data=await post({action:"verify-invite",token_hash:tokenHash});
   inviteAccessToken=data.access_token;
   if(typeof inviteAccessToken!=="string"||!inviteAccessToken){show("Sesi undangan tidak dapat dibentuk. Minta administrator mengirim undangan baru.","error");return;}
   $("inviteEmail").textContent=data.email||"akun yang diundang";
   show("Undangan berhasil diverifikasi. Silakan buat kata sandi akun Anda.","success");
   wrap.hidden=false;
  }catch(error){show(error.message||"Tautan undangan tidak valid atau telah kedaluwarsa.","error");}
 })();
 form?.addEventListener("submit",async event=>{
  event.preventDefault();
  const password=$("invitePassword").value,confirm=$("invitePasswordConfirm").value;
  if(password.length<12||password.length>256){show("Kata sandi harus terdiri dari 12–256 karakter.","error");return;}
  if(password!==confirm){show("Konfirmasi kata sandi tidak sama.","error");return;}
  if(!inviteAccessToken){show("Sesi aktivasi tidak tersedia. Buka kembali tautan undangan terbaru.","error");return;}
  submit.disabled=true;submit.firstChild.textContent="Menyimpan…";
  try{
   await post({action:"set-invite-password",access_token:inviteAccessToken,password});
   inviteAccessToken="";
   $("invitePassword").value="";$("invitePasswordConfirm").value="";
   form.hidden=true;wrap.hidden=true;
   show("Kata sandi berhasil dibuat. Akun siap digunakan setelah peran Tata Usaha ditetapkan oleh administrator.","success");
   $("loginLink").hidden=false;
  }catch(error){show(error.message||"Kata sandi belum berhasil disimpan. Coba kembali.","error");}
  finally{submit.disabled=false;submit.firstChild.textContent="Simpan kata sandi ";}
 });
})();
