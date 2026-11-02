"use strict";
const crypto=require("node:crypto");
const net=require("node:net");
function send(res,status,payload){return res.status(status).json(payload);}
function config(){const raw=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY,pepper=process.env.ALUMNI_INTAKE_RATE_SECRET;if(!raw||!key||!pepper||pepper.length<32)return null;try{const u=new URL(raw);if(u.protocol!=="https:")return null;return{baseUrl:u.origin,key,pepper};}catch(_){return null;}}
function clientIp(req){const h=req.headers||{},candidate=(typeof h["x-real-ip"]==="string"?h["x-real-ip"]:"")||(typeof h["x-forwarded-for"]==="string"?h["x-forwarded-for"].split(",")[0].trim():"");return net.isIP(candidate)?candidate:null;}
async function request(url,options){const r=await fetch(url,{...options,signal:AbortSignal.timeout(10000)});let body=null;try{body=await r.json();}catch(_){}return{response:r,body};}
module.exports=async function alumniPublic(req,res){
 res.setHeader("Cache-Control","no-store, max-age=0");res.setHeader("Pragma","no-cache");res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");res.setHeader("Content-Security-Policy","default-src 'none'; frame-ancestors 'self'; base-uri 'none'");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return send(res,405,{success:false,message:"Metode permintaan tidak didukung."});}
 const c=config();if(!c)return send(res,503,{success:false,message:"Formulir alumni belum diaktifkan. Silakan hubungi HUMAS sekolah."});
 const host=String(req.headers&&req.headers.host||"").toLowerCase(),origin=String(req.headers&&req.headers.origin||"");
 if(origin){try{if(new URL(origin).host.toLowerCase()!==host)return send(res,403,{success:false,message:"Asal permintaan tidak diizinkan."});}catch(_){return send(res,403,{success:false,message:"Asal permintaan tidak diizinkan."});}}
 const contentType=String(req.headers&&req.headers["content-type"]||"");if(!contentType.toLowerCase().startsWith("application/json"))return send(res,415,{success:false,message:"Format permintaan tidak didukung."});
 const body=req.body&&typeof req.body==="object"&&!Array.isArray(req.body)?req.body:{};
 if(Buffer.byteLength(JSON.stringify(body),"utf8")>12000)return send(res,413,{success:false,message:"Ukuran data terlalu besar."});
 if(typeof body.website==="string"&&body.website.trim())return send(res,202,{success:true,message:"Terima kasih. Data Anda telah diterima untuk ditinjau oleh HUMAS."});
 const ip=clientIp(req);if(!ip)return send(res,400,{success:false,message:"Permintaan tidak dapat diverifikasi. Muat ulang halaman dan coba kembali."});
 const allowed=["full_name","graduation_year","last_class","whatsapp","email","city","province","current_status","institution","study_program","employer","job_title","business_name","industry","survey_year","contact_preference","consent_data_processing","consent_school_updates","consent_events","consent_fundraising","consent_career_network"],payload={};
 for(const k of allowed){if(["graduation_year","survey_year"].includes(k))payload[k]=body[k]===undefined?"":String(body[k]).trim();else if(k.startsWith("consent_"))payload[k]=body[k]===true;else payload[k]=typeof body[k]==="string"?body[k].trim().slice(0,500):"";}
 if(!payload.full_name||payload.full_name.length<2||!/^\d{4}$/.test(payload.graduation_year)||Number(payload.graduation_year)<1950||Number(payload.graduation_year)>2100||(!payload.whatsapp&&!payload.email)||(payload.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))||!payload.consent_data_processing||(payload.survey_year&&(!/^\d{4}$/.test(payload.survey_year)||Number(payload.survey_year)<2000||Number(payload.survey_year)>2100))||!["studying","employed","entrepreneur","seeking_work","other","not_reported"].includes(payload.current_status)||!["whatsapp","email","phone","none"].includes(payload.contact_preference))return send(res,400,{success:false,message:"Periksa kembali nama, tahun lulus, kontak, status, dan persetujuan wajib."});
 const ipHash=crypto.createHmac("sha256",c.pepper).update(ip).digest("hex");
 try{const h={apikey:c.key,"Content-Profile":"humas","Content-Type":"application/json",Accept:"application/json"};if(!c.key.startsWith("sb_secret_"))h.Authorization="Bearer "+c.key;
  const r=await request(c.baseUrl+"/rest/v1/rpc/alumni_intake_submit",{method:"POST",headers:h,body:JSON.stringify({p_ip_hash:ipHash,p_payload:payload})});
  if(!r.response.ok||!r.body){const status=r.body&&r.body.code==="22023"?400:503;return send(res,status,{success:false,message:status===400?"Data formulir tidak valid. Periksa kembali isian Anda.":"Layanan formulir sementara tidak tersedia. Coba beberapa saat lagi."});}
  if(r.body.rate_limited)return send(res,429,{success:false,message:"Batas pengiriman sementara tercapai. Silakan coba kembali sekitar satu jam lagi."});
  return send(res,202,{success:true,message:"Terima kasih. Data Anda telah diterima dan akan diverifikasi oleh HUMAS SMAN 1 Sooko sebelum masuk ke direktori alumni."});
 }catch(_){return send(res,503,{success:false,message:"Layanan formulir sementara tidak tersedia. Coba beberapa saat lagi."});}
};
