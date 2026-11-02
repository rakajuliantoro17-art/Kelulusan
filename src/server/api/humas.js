"use strict";

/**
 * PINTUKU HUMAS API — Sprints 3B–3D.
 * Service credentials are server-only. All writes use transactional SQL RPCs.
 */
const READ_ROLES = new Set(["staff_humas","vice_principal_humas","principal"]);
const WRITE_ROLE = "staff_humas";
const PARTNER_TYPES = new Set(["government","education","business","community","nonprofit","alumni","other"]);
const AGREEMENT_TYPES = new Set(["mou","pks","implementation","other"]);

function send(res,status,payload){ return res.status(status).json(payload); }
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
function bearer(req){
  const v=req.headers&&req.headers.authorization;
  const m=typeof v==="string"?v.match(/^Bearer\s+([^\s]+)$/i):null;
  return m?m[1]:null;
}
async function request(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(10000)});
  let body=null;try{body=await response.json();}catch(_){}
  return{response,body};
}
async function authenticate(c,token){
  const {response,body}=await request(c.baseUrl+"/auth/v1/user",{headers:{apikey:c.publishableKey,Authorization:"Bearer "+token,Accept:"application/json"}});
  if(response.status===401||response.status===403)return{ok:false,status:401};
  if(!response.ok||!body||typeof body.id!=="string")return{ok:false,status:502};
  return{ok:true,user:{id:body.id,email:typeof body.email==="string"?body.email:null}};
}
function adminHeaders(c,profile=true){
  const h={apikey:c.adminKey,Accept:"application/json"};
  if(profile)h["Accept-Profile"]="humas";
  if(!c.adminKey.startsWith("sb_secret_"))h.Authorization="Bearer "+c.adminKey;
  return h;
}
async function roles(c,userId){
  const q=new URLSearchParams({select:"role_code",user_id:"eq."+userId,is_active:"eq.true",order:"assigned_at.asc"});
  const {response,body}=await request(c.baseUrl+"/rest/v1/user_roles?"+q,{headers:adminHeaders(c)});
  if(!response.ok||!Array.isArray(body))throw Object.assign(new Error("role_store_unavailable"),{code:"role_store_unavailable",upstreamStatus:response.status});
  return [...new Set(body.map(x=>x&&x.role_code).filter(x=>["staff_humas","vice_principal_humas","principal","system_operator"].includes(x)))];
}
function hasRead(roles){return roles.some(x=>READ_ROLES.has(x));}
function staffOnly(roles){return roles.includes(WRITE_ROLE);}
function bodyOf(req){return req.body&&typeof req.body==="object"&&!Array.isArray(req.body)?req.body:{};}
function str(v,max=2000){return typeof v==="string"?v.trim().slice(0,max):"";}
function uuid(v){return typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);}
async function restList(c,table,params){
  const {response,body}=await request(c.baseUrl+"/rest/v1/"+table+"?"+params.toString(),{headers:adminHeaders(c)});
  if(!response.ok||!Array.isArray(body))throw Object.assign(new Error("data_store_unavailable"),{code:"data_store_unavailable",upstreamStatus:response.status});
  return body;
}
async function rpc(c,name,payload){
  const h=adminHeaders(c);h["Content-Profile"]="humas";h["Content-Type"]="application/json";
  const {response,body}=await request(c.baseUrl+"/rest/v1/rpc/"+name,{method:"POST",headers:h,body:JSON.stringify(payload)});
  if(!response.ok){
    const code=body&&body.code;
    const err=new Error("database_operation_failed");
    err.code=code==="42501"?"forbidden":code==="P0002"?"record_not_found":code==="22023"?"invalid_request":"database_operation_failed";
    err.upstreamStatus=response.status;
    throw err;
  }
  return body;
}
function safeError(res,error){
  const map={forbidden:[403,"insufficient_role","Akun tidak memiliki kewenangan untuk tindakan ini."],
    record_not_found:[404,"record_not_found","Data tidak ditemukan."],
    invalid_request:[400,"invalid_request","Data tidak valid atau tidak memenuhi aturan."],
    role_store_unavailable:[503,"role_store_unavailable","Layanan otorisasi sementara tidak tersedia."],
    data_store_unavailable:[503,"data_store_unavailable","Layanan data sementara tidak tersedia."],
    database_operation_failed:[503,"database_operation_failed","Operasi data gagal diproses."]};
  const item=map[error&&error.code]||[503,"upstream_unavailable","Layanan HUMAS sementara tidak tersedia."];
  console.error("[PINTUKU HUMAS API]",{code:item[1],status:error&&error.upstreamStatus||null});
  return send(res,item[0],{success:false,error:item[1],message:item[2]});
}
async function listPartners(c,req){
  const q=req.query||{};
  const limit=Math.min(100,Math.max(1,Number.parseInt(q.limit,10)||25));
  const page=Math.max(1,Number.parseInt(q.page,10)||1);
  const params=new URLSearchParams({select:"id,partner_name,partner_type,institution_address,contact_person,contact_email,contact_phone,website_url,notes,record_status,created_at,updated_at",order:"created_at.desc",limit:String(limit),offset:String((page-1)*limit)});
  if(typeof q.status==="string"&&["active","inactive","under_review"].includes(q.status))params.set("record_status","eq."+q.status);
  if(typeof q.type==="string"&&PARTNER_TYPES.has(q.type))params.set("partner_type","eq."+q.type);
  if(typeof q.search==="string"&&q.search.trim()){
    const term=q.search.trim().replace(/[,%()]/g," ").slice(0,80);
    params.set("or","(partner_name.ilike.*"+term+"*,contact_person.ilike.*"+term+"*)");
  }
  return{partners:await restList(c,"partners",params),page,limit};
}
async function listAgreements(c,req){
  const q=req.query||{};
  const limit=Math.min(100,Math.max(1,Number.parseInt(q.limit,10)||25));
  const page=Math.max(1,Number.parseInt(q.page,10)||1);
  const params=new URLSearchParams({select:"id,agreement_code,partner_id,title,agreement_type,purpose,start_date,end_date,estimated_value,currency_code,status,submitted_at,approved_at,signed_at,registered_at,created_at,updated_at,partner:partners(partner_name)",order:"created_at.desc",limit:String(limit),offset:String((page-1)*limit)});
  if(typeof q.status==="string"&&["draft","submitted","verified","recommended","pending_principal_approval","revision_required","rejected","approved","pending_signature","physically_signed","electronically_signed","registered","archived","expired"].includes(q.status))params.set("status","eq."+q.status);
  if(typeof q.partner_id==="string"&&uuid(q.partner_id))params.set("partner_id","eq."+q.partner_id);
  return{agreements:await restList(c,"agreements",params),page,limit};
}

module.exports=async function humasApi(req,res){
  headers(res);
  const c=config();
  if(!c)return send(res,503,{success:false,error:"server_configuration_missing",message:"Layanan HUMAS belum dikonfigurasi pada server."});
  const token=bearer(req);
  if(!token)return send(res,401,{success:false,error:"authentication_required",message:"Silakan masuk untuk mengakses layanan HUMAS."});
  try{
    const auth=await authenticate(c,token);
    if(!auth.ok)return send(res,auth.status,{success:false,error:auth.status===401?"invalid_session":"auth_service_unavailable",message:auth.status===401?"Sesi tidak valid atau telah berakhir.":"Layanan autentikasi sementara tidak tersedia."});
    const userRoles=await roles(c,auth.user.id);
    const op=String((req.query&&req.query.op)||"me");
    if(op==="me"&&req.method==="GET")return send(res,200,{success:true,data:{user:auth.user,roles:userRoles}});

    if(op==="partners"){
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses direktori mitra."});
      if(req.method==="GET")return send(res,200,{success:true,data:await listPartners(c,req)});
      if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mengubah data mitra."});
      const b=bodyOf(req);
      if(req.method==="POST"){
        const payload={partner_name:str(b.partner_name,180),partner_type:str(b.partner_type,40),institution_address:str(b.institution_address),contact_person:str(b.contact_person,180),contact_email:str(b.contact_email,254),contact_phone:str(b.contact_phone,40),website_url:str(b.website_url,500),notes:str(b.notes,4000)};
        if(!payload.partner_name||!PARTNER_TYPES.has(payload.partner_type))return send(res,400,{success:false,error:"invalid_request",message:"Nama dan jenis mitra wajib diisi dengan benar."});
        const partner=await rpc(c,"partner_create",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_payload:payload});
        return send(res,201,{success:true,data:{partner}});
      }
      if(req.method==="PATCH"){
        const id=str(b.id,64);
        if(!uuid(id))return send(res,400,{success:false,error:"invalid_request",message:"ID mitra tidak valid."});
        if(b.action==="status"){
          const status=str(b.record_status,30);
          if(!["active","inactive","under_review"].includes(status))return send(res,400,{success:false,error:"invalid_request",message:"Status mitra tidak valid."});
          const partner=await rpc(c,"partner_set_status",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_partner_id:id,p_status:status,p_reason:str(b.reason,1000)});
          return send(res,200,{success:true,data:{partner}});
        }
        const allowed=["partner_name","partner_type","institution_address","contact_person","contact_email","contact_phone","website_url","notes"];
        const payload={};for(const key of allowed)if(Object.prototype.hasOwnProperty.call(b,key))payload[key]=key==="partner_type"?str(b[key],40):str(b[key],key==="notes"?4000:2000);
        if(!Object.keys(payload).length||("partner_name" in payload&&!payload.partner_name)||("partner_type" in payload&&!PARTNER_TYPES.has(payload.partner_type)))return send(res,400,{success:false,error:"invalid_request",message:"Tidak ada perubahan valid atau nama/jenis mitra tidak valid."});
        const partner=await rpc(c,"partner_update",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_partner_id:id,p_payload:payload});
        return send(res,200,{success:true,data:{partner}});
      }
      res.setHeader("Allow","GET, POST, PATCH");
      return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }

    if(op==="agreements"){
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses register perjanjian."});
      if(req.method==="GET")return send(res,200,{success:true,data:await listAgreements(c,req)});
      if(req.method==="POST"){
        if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat membuat draft perjanjian."});
        const b=bodyOf(req);
        const payload={partner_id:str(b.partner_id,64),title:str(b.title,250),agreement_type:str(b.agreement_type||"mou",30),purpose:str(b.purpose,4000),scope_of_work:str(b.scope_of_work,8000),start_date:str(b.start_date,10),end_date:str(b.end_date,10),estimated_value:b.estimated_value===undefined?"":String(b.estimated_value),currency_code:str(b.currency_code||"IDR",3),school_coordinator:str(b.school_coordinator,180),partner_coordinator:str(b.partner_coordinator,180)};
        if(!uuid(payload.partner_id)||!payload.title||!payload.purpose||!AGREEMENT_TYPES.has(payload.agreement_type)||!/^([0-9]{4}-[0-9]{2}-[0-9]{2})?$/.test(payload.start_date)||!/^([0-9]{4}-[0-9]{2}-[0-9]{2})?$/.test(payload.end_date)|| (payload.estimated_value!==""&&(!Number.isFinite(Number(payload.estimated_value))||Number(payload.estimated_value)<0)))return send(res,400,{success:false,error:"invalid_request",message:"Data draft perjanjian tidak valid."});
        const agreement=await rpc(c,"agreement_create_draft",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_payload:payload});
        return send(res,201,{success:true,data:{agreement}});
      }
      res.setHeader("Allow","GET, POST");
      return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }
    return send(res,404,{success:false,error:"operation_not_found",message:"Operasi HUMAS tidak ditemukan."});
  }catch(error){return safeError(res,error);}
};
