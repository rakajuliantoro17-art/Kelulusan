"use strict";

function send(res,status,payload){return res.status(status).json(payload);}
function headers(res){
  res.setHeader("Cache-Control","no-store, max-age=0");
  res.setHeader("Pragma","no-cache");
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","same-origin");
}
function config(){
  const raw=process.env.SUPABASE_URL;
  const publishableKey=process.env.SUPABASE_PUBLISHABLE_KEY;
  const adminKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!raw||!publishableKey||!adminKey)return null;
  try{const u=new URL(raw);if(u.protocol!=="https:")return null;return{baseUrl:u.origin,publishableKey,adminKey};}
  catch(_){return null;}
}
async function request(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(10000)});
  let body=null;try{body=await response.json();}catch(_){}
  return{response,body};
}
function adminHeaders(c,profile=true){
  const h={apikey:c.adminKey,Accept:"application/json"};
  if(profile)h["Accept-Profile"]="humas";
  if(!c.adminKey.startsWith("sb_secret_"))h.Authorization="Bearer "+c.adminKey;
  return h;
}
function bearer(req){
  const value=req.headers&&req.headers.authorization;
  const match=typeof value==="string"?value.match(/^Bearer\s+([^\s]+)$/i):null;
  return match?match[1]:null;
}
function bodyOf(req){return req.body&&typeof req.body==="object"&&!Array.isArray(req.body)?req.body:{};}
function str(value,max=250){return typeof value==="string"?value.trim().slice(0,max):"";}
async function authenticate(c,token){
  const {response,body}=await request(c.baseUrl+"/auth/v1/user",{headers:{apikey:c.publishableKey,Authorization:"Bearer "+token,Accept:"application/json"}});
  if(response.status===401||response.status===403)return{ok:false,status:401};
  if(!response.ok||!body||typeof body.id!=="string")return{ok:false,status:502};
  return{ok:true,user:{id:body.id,email:typeof body.email==="string"?body.email:null}};
}
function safeError(res,error){
  const status=error&&error.status===401?401:503;
  const message=status===401?"Sesi tidak valid atau telah berakhir.":"Layanan akun HUMAS sementara tidak tersedia.";
  return send(res,status,{success:false,error:status===401?"unauthorized":"account_service_unavailable",message});
}
module.exports=async function humasAccountApi(req,res){
  headers(res);
  const c=config();
  if(!c)return send(res,503,{success:false,error:"server_configuration_missing",message:"Layanan akun belum dikonfigurasi pada server."});
  const op=String(req.query&&req.query.op||"config");
  if(op==="config"){
    if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,message:"Metode tidak didukung."});}
    return send(res,200,{success:true,data:{supabaseUrl:c.baseUrl,publishableKey:c.publishableKey}});
  }
  if(op!=="profile")return send(res,404,{success:false,error:"operation_not_found",message:"Operasi akun tidak ditemukan."});
  if(!["GET","POST","PATCH"].includes(req.method)){res.setHeader("Allow","GET, POST, PATCH");return send(res,405,{success:false,message:"Metode tidak didukung."});}
  const token=bearer(req);
  if(!token)return send(res,401,{success:false,error:"unauthorized",message:"Silakan masuk terlebih dahulu."});
  try{
    const auth=await authenticate(c,token);
    if(!auth.ok)return send(res,auth.status,{success:false,error:"unauthorized",message:"Sesi tidak valid atau telah berakhir."});
    if(req.method==="GET"){
      const q=new URLSearchParams({select:"user_id,account_type,full_name,phone,school_relationship,graduation_year,organization_name,organization_role,city,province,purpose,profile_status,created_at,updated_at",user_id:"eq."+auth.user.id,limit:"1"});
      const {response,body}=await request(c.baseUrl+"/rest/v1/external_profiles?"+q,{headers:adminHeaders(c)});
      if(!response.ok||!Array.isArray(body))throw new Error("profile_read_failed");
      return send(res,200,{success:true,data:{user:auth.user,profile:body[0]||null}});
    }
    const b=bodyOf(req);
    const accountType=str(b.account_type,24);
    const allowed=["alumni","partner","committee","public"];
    const payload={
      account_type:accountType,full_name:str(b.full_name,180),phone:str(b.phone,40),
      school_relationship:str(b.school_relationship,120),graduation_year:str(b.graduation_year,4),
      organization_name:str(b.organization_name,180),organization_role:str(b.organization_role,120),
      city:str(b.city,120),province:str(b.province,120),purpose:str(b.purpose,500),
      consent_terms:b.consent_terms===true
    };
    if(!allowed.includes(accountType)||payload.full_name.length<2||payload.phone.length<8||!payload.consent_terms)
      return send(res,400,{success:false,error:"invalid_profile",message:"Jenis akun, nama, nomor kontak, dan persetujuan wajib harus diisi dengan benar."});
    if(accountType==="alumni"&&(!/^[0-9]{4}$/.test(payload.graduation_year)||Number(payload.graduation_year)<1950||Number(payload.graduation_year)>2100))
      return send(res,400,{success:false,error:"invalid_profile",message:"Tahun lulus alumni tidak valid."});
    if(accountType!=="alumni")payload.graduation_year="";
    if(["partner","committee"].includes(accountType)&&!payload.organization_name)
      return send(res,400,{success:false,error:"invalid_profile",message:"Nama instansi atau organisasi wajib diisi."});
    const h=adminHeaders(c);h["Content-Profile"]="humas";h["Content-Type"]="application/json";
    const result=await request(c.baseUrl+"/rest/v1/rpc/external_profile_upsert",{method:"POST",headers:h,body:JSON.stringify({p_user_id:auth.user.id,p_payload:payload})});
    if(!result.response.ok)throw new Error("profile_write_failed");
    return send(res,200,{success:true,data:{profile:result.body}});
  }catch(error){console.error("[PINTUKU HUMAS ACCOUNT]",{message:error.message});return safeError(res,error);}
};
