/* PINTUKU TU Access Governance UI — no client-side database access. */
(() => {
 "use strict";
 const $=(s)=>document.querySelector(s);
 const setAlert=(kind,title,detail)=>{const box=$("#accessStatus");if(!box)return;box.className="access-alert "+kind;box.querySelector(".access-alert-icon").textContent=kind==="is-ready"?"✓":kind==="is-error"?"!":"i";box.querySelector("strong").textContent=title;box.querySelector("p").textContent=detail;};
 const init=()=>{
  const sidebar=$("#tuSidebar"),toggle=$("#tuMenuToggle"),backdrop=$("#tuSidebarBackdrop");
  const close=()=>{sidebar?.classList.remove("is-open");backdrop?.classList.remove("is-visible");toggle?.setAttribute("aria-expanded","false");document.body.classList.remove("tu-menu-open");};
  toggle?.addEventListener("click",()=>{const open=!sidebar.classList.contains("is-open");sidebar.classList.toggle("is-open",open);backdrop?.classList.toggle("is-visible",open);toggle.setAttribute("aria-expanded",String(open));document.body.classList.toggle("tu-menu-open",open);});
  backdrop?.addEventListener("click",close);sidebar?.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  const tabs=[...document.querySelectorAll("[data-access-tab]")];
  tabs.forEach(tab=>tab.addEventListener("click",()=>{const target=tab.dataset.accessTab;tabs.forEach(item=>{const active=item===tab;item.classList.toggle("is-active",active);item.setAttribute("aria-selected",String(active));});document.querySelectorAll(".access-panel").forEach(panel=>{const active=panel.id==="access"+target[0].toUpperCase()+target.slice(1);panel.hidden=!active;panel.classList.toggle("is-active",active);});}));
  const client=window.tuAuth;
  if(!client||typeof client.getAccessToken!=="function"){setAlert("is-blocked","Sesi Tata Usaha belum tersedia","Silakan masuk melalui halaman login khusus Tata Usaha.");return;}
  Promise.resolve(client.getAccessToken()).then(token=>{
   if(typeof token!=="string"||!token){setAlert("is-blocked","Silakan masuk melalui PINTUKU","Tidak ditemukan access token aktif. Muat ulang halaman setelah sesi login tersedia.");return null;}
   return fetch("/api/tu/context",{headers:{Authorization:"Bearer "+token},cache:"no-store"}).then(async response=>({response,data:await response.json().catch(()=>({}))}));
  }).then(result=>{
   if(!result)return;
   if(!result.response.ok){const message=result.data?.message||"Konteks akses tidak dapat dimuat.";setAlert(result.response.status===403?"is-blocked":"is-error",result.response.status===403?"Akses bisnis belum diberikan":"Layanan otorisasi belum tersedia",message);return;}
   setAlert("is-ready","Sesi dan peran berhasil diverifikasi","Konteks akun berhasil dimuat dari server. Tidak ada data otorisasi yang disimpan di browser.");
   const host=$("#accessUnitList");const units=Array.isArray(result.data.units)?result.data.units:[];
   if(host){host.replaceChildren();if(!units.length){host.textContent="Belum ada unit aktif.";return;}units.forEach(unit=>{const row=document.createElement("div");row.className="access-unit";const label=document.createElement("div");const name=document.createElement("strong");name.textContent=unit.unit_name||"Unit";const type=document.createElement("small");type.textContent=unit.unit_type||"Unit layanan";label.append(name,type);const code=document.createElement("code");code.textContent=unit.unit_code||"—";row.append(label,code);host.append(row);});}
  }).catch(()=>setAlert("is-error","Tidak dapat menghubungi layanan TU","Periksa koneksi jaringan atau status API. Tidak ada perubahan data yang dilakukan."));
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();