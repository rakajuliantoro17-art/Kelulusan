/* Public TU UI interactions only: no network request and no persistence of visitor data. */
(() => {
 "use strict";
 const $=(id)=>document.getElementById(id);
 const dateFormat=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 const timeFormat=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",hour12:false});
 const updateClock=()=>{
  const now=new Date();
  if($("tuPublicClock"))$("tuPublicClock").textContent=timeFormat.format(now);
  if($("tuPublicDate"))$("tuPublicDate").textContent=dateFormat.format(now);
  if($("tuQueueClock"))$("tuQueueClock").textContent=timeFormat.format(now);
  if($("tuQueueDate"))$("tuQueueDate").textContent=dateFormat.format(now);
  const hour=now.getHours();
  if($("tuPublicGreeting"))$("tuPublicGreeting").textContent=hour<11?"Selamat pagi":hour<15?"Selamat siang":hour<18?"Selamat sore":"Selamat malam";
 };
 const initVisitor=()=>{
  const section=$("tuVisitorFormSection"),form=$("tuVisitorForm");
  $("tuOpenVisitorForm")?.addEventListener("click",()=>{section.hidden=false;section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});form?.querySelector("input")?.focus({preventScroll:true});});
  $("tuCloseVisitorForm")?.addEventListener("click",()=>{section.hidden=true;$("tuOpenVisitorForm")?.focus();});
  form?.addEventListener("submit",event=>{
   event.preventDefault();
   const feedback=$("tuVisitorFeedback");
   if(!form.reportValidity())return;
   feedback.hidden=false;
   feedback.textContent="Pratinjau berhasil divalidasi di perangkat ini. Data belum dikirim atau disimpan karena endpoint registrasi publik belum diaktifkan. Silakan hubungi petugas Front Office untuk pencatatan kunjungan.";
   feedback.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  form?.addEventListener("reset",()=>{const feedback=$("tuVisitorFeedback");if(feedback)feedback.hidden=true;});
 };
 const initQueue=()=>{
  $("tuQueueFullscreen")?.addEventListener("click",async()=>{
   try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}
   catch{const status=$("tuQueueConnection");if(status)status.textContent="Mode layar penuh tidak tersedia";}
  });
  document.addEventListener("fullscreenchange",()=>{
   const button=$("tuQueueFullscreen");
   if(button)button.textContent=document.fullscreenElement?"⛶ Keluar layar penuh":"⛶ Layar penuh";
  });
 };
 document.addEventListener("DOMContentLoaded",()=>{
  updateClock();window.setInterval(updateClock,30000);
  if(document.body.dataset.tuPublicView==="visitor")initVisitor();
  if(document.body.dataset.tuPublicView==="queue")initQueue();
 },{once:true});
})();