"use strict";

/**
 * PINTUKU HUMAS API — Sprints 3B–3D.
 * Service credentials are server-only. All writes use transactional SQL RPCs.
 */
const READ_ROLES = new Set(["staff_humas","vice_principal_humas","principal"]);
const WRITE_ROLE = "staff_humas";
const PARTNER_TYPES = new Set(["government","education","business","community","nonprofit","alumni","other"]);
const AGREEMENT_TYPES = new Set(["mou","pks","implementation","other"]);
const PROPOSAL_CATEGORIES = new Set(["education","student_activity","sports","facility","community","event","other"]);
const PROPOSAL_STATUSES = new Set(["draft","submitted","under_review","revision_required","approved","rejected","fundraising","funded","in_progress","completed","cancelled","archived"]);
const SUPPORT_TYPES = new Set(["cash","goods","services","facility","other"]);
const SUPPORT_STATUSES = new Set(["prospect","contacted","proposed","committed","partially_realized","realized","declined"]);

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

async function authGrant(c,grant,payload){
  return request(c.baseUrl+"/auth/v1/token?grant_type="+grant,{
    method:"POST",
    headers:{apikey:c.publishableKey,"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify(payload)
  });
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
function pagination(query){
  const rawPage=query.page===undefined?"1":String(query.page);
  const rawLimit=query.limit===undefined?"25":String(query.limit);
  if(!/^\d{1,4}$/.test(rawPage)||!/^\d{1,3}$/.test(rawLimit))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
  const page=Number(rawPage),limit=Number(rawLimit);
  if(page<1||page>1000||limit<1||limit>100)throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
  return{page,limit,offset:(page-1)*limit};
}
function validDate(value){
  if(value==="")return true;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split("-").map(Number);
  const date=new Date(Date.UTC(y,m-1,d));
  return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
}
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
    err.code=code==="42501"?"forbidden":code==="P0002"?"record_not_found":(code==="22023"||code==="22008"||code==="22P02")?"invalid_request":"database_operation_failed";
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
    database_operation_failed:[503,"database_operation_failed","Operasi data gagal diproses."],
    storage_operation_failed:[503,"storage_operation_failed","Penyimpanan dokumen sementara tidak tersedia."],
    invalid_query:[400,"invalid_query","Parameter pencarian atau pagination tidak valid."]};
  const item=map[error&&error.code]||[503,"upstream_unavailable","Layanan HUMAS sementara tidak tersedia."];
  console.error("[PINTUKU HUMAS API]",{code:item[1],status:error&&error.upstreamStatus||null});
  return send(res,item[0],{success:false,error:item[1],message:item[2]});
}
async function listPartners(c,req){
  const q=req.query||{};
  const pg=pagination(q);
  const params=new URLSearchParams({select:"id,partner_name,partner_type,institution_address,contact_person,contact_email,contact_phone,website_url,notes,record_status,created_at,updated_at",order:"created_at.desc",limit:String(pg.limit),offset:String(pg.offset)});
  if(typeof q.status==="string"&&q.status){
    if(!["active","inactive","under_review"].includes(q.status))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
    params.set("record_status","eq."+q.status);
  }
  if(typeof q.type==="string"&&q.type){
    if(!PARTNER_TYPES.has(q.type))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
    params.set("partner_type","eq."+q.type);
  }
  if(typeof q.search==="string"&&q.search.trim()){
    // Restrict the search token to Unicode letters/digits. This prevents
    // PostgREST logic-tree metacharacters from altering the filter expression.
    const tokens=q.search.normalize("NFKC").match(/[\p{L}\p{N}]+/gu)||[];
    const term=tokens[0]||"";
    if(term)params.set("or","(partner_name.ilike.*"+term+"*,contact_person.ilike.*"+term+"*)");
  }
  return{partners:await restList(c,"partners",params),page:pg.page,limit:pg.limit};
}

async function listAgreements(c,req){
  const q=req.query||{};
  const pg=pagination(q);
  const params=new URLSearchParams({select:"id,agreement_code,partner_id,title,agreement_type,purpose,start_date,end_date,estimated_value,currency_code,status,submitted_at,approved_at,signed_at,registered_at,created_at,updated_at,partner:partners(partner_name)",order:"created_at.desc",limit:String(pg.limit),offset:String(pg.offset)});
  if(typeof q.status==="string"&&q.status){
    const statuses=["draft","submitted","verified","recommended","pending_principal_approval","revision_required","rejected","approved","pending_signature","physically_signed","electronically_signed","registered","archived","expired"];
    if(!statuses.includes(q.status))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
    params.set("status","eq."+q.status);
  }
  if(typeof q.partner_id==="string"&&q.partner_id){
    if(!uuid(q.partner_id))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
    params.set("partner_id","eq."+q.partner_id);
  }
  if(typeof q.search==="string"&&q.search.trim()){
    const tokens=q.search.normalize("NFKC").match(/[\p{L}\p{N}]+/gu)||[];
    const term=tokens[0]||"";
    if(term)params.set("or","(title.ilike.*"+term+"*,agreement_code.ilike.*"+term+"*)");
  }
  return{agreements:await restList(c,"agreements",params),page:pg.page,limit:pg.limit};
}


async function listProposals(c,req){
  const q=req.query||{};
  const pg=pagination(q);
  const params=new URLSearchParams({
    select:"id,proposal_code,title,category,description,requested_amount,proposal_date,submission_deadline,activity_start_date,activity_end_date,owner_unit,coordinator_name,status,created_at,updated_at",
    order:"created_at.desc",limit:String(pg.limit),offset:String(pg.offset)
  });
  if(typeof q.status==="string"&&q.status){
    if(!PROPOSAL_STATUSES.has(q.status))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
    params.set("status","eq."+q.status);
  }
  if(typeof q.category==="string"&&q.category){
    if(!PROPOSAL_CATEGORIES.has(q.category))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});
    params.set("category","eq."+q.category);
  }
  if(typeof q.search==="string"&&q.search.trim()){
    const tokens=q.search.normalize("NFKC").match(/[\p{L}\p{N}]+/gu)||[];
    const term=tokens[0]||"";
    if(term)params.set("or","(title.ilike.*"+term+"*,proposal_code.ilike.*"+term+"*,owner_unit.ilike.*"+term+"*)");
  }
  return{proposals:await restList(c,"proposals",params),page:pg.page,limit:pg.limit};
}


async function listAlumni(c,req){
 const q=req.query||{},pg=pagination(q);
 const p=new URLSearchParams({select:"id,full_name,graduation_year,last_class,whatsapp,email,city,province,current_status,institution,study_program,employer,job_title,business_name,industry,survey_year,contact_preference,consent_school_updates,consent_events,consent_fundraising,consent_career_network,consent_updated_at,consent_source,record_status,notes,created_at,updated_at",order:"graduation_year.desc,full_name.asc",limit:String(pg.limit),offset:String(pg.offset)});
 if(q.year){if(!/^\d{4}$/.test(String(q.year)))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});p.set("graduation_year","eq."+q.year);}
 if(q.status){if(!["studying","employed","entrepreneur","seeking_work","other","not_reported"].includes(q.status))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});p.set("current_status","eq."+q.status);}
 if(q.consent){const m={fundraising:"consent_fundraising",events:"consent_events",school_updates:"consent_school_updates"};if(!m[q.consent])throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});p.set(m[q.consent],"eq.true");}
 p.set("record_status","eq.active");
 if(typeof q.search==="string"&&q.search.trim()){const t=q.search.normalize("NFKC").match(/[\p{L}\p{N}]+/gu)||[],term=t[0]||"";if(term)p.set("or","(full_name.ilike.*"+term+"*,institution.ilike.*"+term+"*,employer.ilike.*"+term+"*,business_name.ilike.*"+term+"*,city.ilike.*"+term+"*)");}
 return{alumni:await restList(c,"alumni_profiles",p),page:pg.page,limit:pg.limit};
}

async function listAlumniIntakes(c,req){
 const pg=pagination(req.query||{});
 const p=new URLSearchParams({select:"id,full_name,graduation_year,last_class,whatsapp,email,city,province,current_status,institution,study_program,employer,job_title,business_name,industry,survey_year,contact_preference,consent_school_updates,consent_events,consent_fundraising,consent_career_network,submitted_at,status",status:"eq.pending",order:"submitted_at.asc",limit:String(pg.limit),offset:String(pg.offset)});
 return{submissions:await restList(c,"alumni_intake_submissions",p),page:pg.page,limit:pg.limit};
}


const PERMIT_TYPES=new Set(["internal","external","facility"]);
const PERMIT_DOC_TYPES=new Set(["application_letter","proposal","parent_consent","institution_letter","supporting_document","decision_letter","other"]);
const PERMIT_MIMES=new Set(["application/pdf","image/jpeg","image/png","image/webp","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);
function isoDateTime(v){if(v==="")return true;return typeof v==="string"&&!Number.isNaN(Date.parse(v));}
function safeFileName(v){return str(v,255).replace(/[^\\p{L}\\p{N}._ -]/gu,"_").replace(/\\.{2,}/g,"_");}
async function listPermits(c,req){
 const q=req.query||{},pg=pagination(q),p=new URLSearchParams({
  select:"id,request_code,permit_type,title,purpose,applicant_name,applicant_unit,applicant_email,applicant_phone,related_institution,activity_location,requested_start_at,requested_end_at,expected_attendees,status,decision_note,created_by,assigned_staff,submitted_at,decided_at,completed_at,created_at,updated_at",
  order:"created_at.desc",limit:String(pg.limit),offset:String(pg.offset)
 });
 if(q.status){const s=["draft","submitted","verified","under_review","revision_required","approved","rejected","cancelled","completed","archived"];if(!s.includes(q.status))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});p.set("status","eq."+q.status);}
 if(q.type){if(!PERMIT_TYPES.has(q.type))throw Object.assign(new Error("invalid_query"),{code:"invalid_query"});p.set("permit_type","eq."+q.type);}
 if(q.search){const tokens=String(q.search).normalize("NFKC").match(/[\\p{L}\\p{N}]+/gu)||[];const term=tokens[0]||"";if(term)p.set("or","(request_code.ilike.*"+term+"*,title.ilike.*"+term+"*,applicant_name.ilike.*"+term+"*)");}
 return{permits:await restList(c,"permit_requests",p),page:pg.page,limit:pg.limit};
}
async function permitDetail(c,id){
 const p=new URLSearchParams({select:"id,request_code,permit_type,title,purpose,applicant_name,applicant_unit,applicant_email,applicant_phone,related_institution,activity_location,requested_start_at,requested_end_at,expected_attendees,facility_details,status,decision_note,created_by,assigned_staff,submitted_at,decided_at,completed_at,created_at,updated_at,documents:permit_documents(id,document_type,file_name,mime_type,file_size_bytes,version_number,uploaded_at,is_current),events:permit_workflow_events(id,event_type,from_status,to_status,actor_id,actor_role,reason,metadata,occurred_at)",id:"eq."+id,limit:"1","documents.order":"uploaded_at.desc","events.order":"occurred_at.desc","events.limit":"100"});
 const rows=await restList(c,"permit_requests",p);return rows[0]||null;
}
async function storageRequest(c,path,method,body){
 const h=adminHeaders(c,false);h["Content-Type"]="application/json";
 const {response,body:result}=await request(c.baseUrl+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
 if(!response.ok)throw Object.assign(new Error("storage_operation_failed"),{code:"storage_operation_failed",upstreamStatus:response.status});
 return result;
}

module.exports=async function humasApi(req,res){
  headers(res);
  const c=config();
  if(!c)return send(res,503,{success:false,error:"server_configuration_missing",message:"Layanan HUMAS belum dikonfigurasi pada server."});
  const opInput=String((req.query&&req.query.op)||"me");
  if(opInput==="login"||opInput==="refresh"){
    if(req.method!=="POST"){res.setHeader("Allow","POST");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
    const b=bodyOf(req);
    const isLogin=opInput==="login";
    const email=str(b.email,254).toLowerCase(),password=typeof b.password==="string"?b.password:"";
    const refreshToken=str(b.refresh_token,2048);
    if(isLogin&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password||password.length>256))return send(res,400,{success:false,error:"invalid_credentials",message:"Email atau kata sandi tidak valid."});
    if(!isLogin&&!refreshToken)return send(res,400,{success:false,error:"invalid_refresh_token",message:"Sesi perlu diperbarui dengan token yang valid."});
    try{
      const result=await authGrant(c,isLogin?"password":"refresh_token",isLogin?{email,password}:{refresh_token:refreshToken});
      if(!result.response.ok||!result.body||!result.body.access_token)return send(res,401,{success:false,error:isLogin?"login_failed":"session_expired",message:isLogin?"Email atau kata sandi tidak sesuai.":"Sesi berakhir. Silakan masuk kembali."});
      return send(res,200,{success:true,data:{access_token:result.body.access_token,refresh_token:result.body.refresh_token,expires_in:result.body.expires_in,user:result.body.user?{id:result.body.user.id,email:result.body.user.email}:undefined}});
    }catch(_){return send(res,503,{success:false,error:"auth_service_unavailable",message:"Layanan autentikasi sementara tidak tersedia."});}
  }
  const token=bearer(req);
  if(!token)return send(res,401,{success:false,error:"authentication_required",message:"Silakan masuk untuk mengakses layanan HUMAS."});
  try{
    const auth=await authenticate(c,token);
    if(!auth.ok)return send(res,auth.status,{success:false,error:auth.status===401?"invalid_session":"auth_service_unavailable",message:auth.status===401?"Sesi tidak valid atau telah berakhir.":"Layanan autentikasi sementara tidak tersedia."});
    const userRoles=await roles(c,auth.user.id);
    const op=String((req.query&&req.query.op)||"me");

    if(op==="me"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      return send(res,200,{success:true,data:{user:auth.user,roles:userRoles}});
    }

    if(op==="dashboard"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses ringkasan HUMAS."});
      return send(res,200,{success:true,data:await rpc(c,"dashboard_summary",{})});
    }

    if(op==="workspace"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses ruang kerja HUMAS."});
      const q=req.query||{};
      const partnerReq={query:{page:q.partner_page||"1",limit:q.partner_limit||"25",search:q.partner_search||"",type:q.partner_type||"",status:q.partner_status||""}};
      const agreementReq={query:{page:q.agreement_page||"1",limit:q.agreement_limit||"25",search:q.agreement_search||"",status:q.agreement_status||""}};
      const [summary,partnerData,agreementData]=await Promise.all([
        rpc(c,"dashboard_summary",{}),listPartners(c,partnerReq),listAgreements(c,agreementReq)
      ]);
      return send(res,200,{success:true,data:{user:auth.user,roles:userRoles,summary,partners:partnerData,agreements:agreementData}});
    }


    if(op==="proposal-workspace"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses ruang kerja proposal."});
      const q=req.query||{};
      const [summary,proposalData]=await Promise.all([
        rpc(c,"proposal_summary",{}),
        listProposals(c,{query:{page:q.page||"1",limit:q.limit||"25",search:q.search||"",status:q.status||"",category:q.category||""}})
      ]);
      return send(res,200,{success:true,data:{user:auth.user,roles:userRoles,summary,proposals:proposalData}});
    }

    if(op==="proposal-detail"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses detail proposal."});
      const id=str(req.query&&req.query.id,64);
      if(!uuid(id))return send(res,400,{success:false,error:"invalid_query",message:"ID proposal tidak valid."});
      const params=new URLSearchParams({
        select:"id,proposal_code,title,category,description,objectives,target_audience,requested_amount,proposal_date,submission_deadline,activity_start_date,activity_end_date,owner_unit,coordinator_name,coordinator_contact,status,created_at,updated_at,supports:proposal_supports(id,partner_id,sponsor_name,support_type,support_description,estimated_value,realized_value,support_status,contact_person,contact_date,commitment_date,realization_date,notes,created_at,updated_at),events:proposal_events(id,event_type,support_id,before_data,after_data,reason,occurred_at)",
        id:"eq."+id,limit:"1",
        "supports.order":"created_at.desc","supports.limit":"100",
        "events.order":"occurred_at.desc","events.limit":"50"
      });
      const rows=await restList(c,"proposals",params);
      if(!rows.length)return send(res,404,{success:false,error:"record_not_found",message:"Proposal tidak ditemukan."});
      return send(res,200,{success:true,data:{proposal:rows[0]}});
    }

    if(op==="proposals"){
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses daftar proposal."});
      if(req.method==="GET")return send(res,200,{success:true,data:await listProposals(c,req)});
      if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mengelola proposal."});
      const b=bodyOf(req);
      if(req.method==="POST"){
        const payload={
          title:str(b.title,250),category:str(b.category,40),description:str(b.description,8000),
          objectives:str(b.objectives,4000),target_audience:str(b.target_audience,1000),
          requested_amount:b.requested_amount===undefined?"":String(b.requested_amount),
          proposal_date:str(b.proposal_date,10),submission_deadline:str(b.submission_deadline,10),
          activity_start_date:str(b.activity_start_date,10),activity_end_date:str(b.activity_end_date,10),
          owner_unit:str(b.owner_unit,180),coordinator_name:str(b.coordinator_name,180),
          coordinator_contact:str(b.coordinator_contact,120)
        };
        const dates=[payload.proposal_date,payload.submission_deadline,payload.activity_start_date,payload.activity_end_date];
        if(!payload.title||!PROPOSAL_CATEGORIES.has(payload.category)||!payload.description||
          !dates.every(validDate)||(payload.proposal_date&&payload.submission_deadline&&payload.submission_deadline<payload.proposal_date)||
          (payload.activity_start_date&&payload.activity_end_date&&payload.activity_end_date<payload.activity_start_date)||
          (payload.requested_amount!==""&&!/^\d{1,14}(\.\d{1,2})?$/.test(payload.requested_amount)))
          return send(res,400,{success:false,error:"invalid_request",message:"Data proposal tidak valid. Periksa judul, kategori, uraian, tanggal, dan nilai pengajuan."});
        const proposal=await rpc(c,"proposal_create",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_payload:payload});
        return send(res,201,{success:true,data:{proposal}});
      }
      if(req.method==="PATCH"){
        const id=str(b.id,64),action=str(b.action,30);
        if(!uuid(id))return send(res,400,{success:false,error:"invalid_request",message:"ID proposal tidak valid."});
        if(action==="update_draft"){
          const allowed=["title","category","description","objectives","target_audience","requested_amount","proposal_date","submission_deadline","activity_start_date","activity_end_date","owner_unit","coordinator_name","coordinator_contact"];
          const payload={};for(const key of allowed)if(Object.prototype.hasOwnProperty.call(b,key))payload[key]=String(b[key]??"").trim();
          if(!Object.keys(payload).length||("category" in payload&&!PROPOSAL_CATEGORIES.has(payload.category))||
            (["proposal_date","submission_deadline","activity_start_date","activity_end_date"].some(k=>k in payload&&!validDate(payload[k])))||
            (payload.requested_amount!==undefined&&payload.requested_amount!==""&&!/^\d{1,14}(\.\d{1,2})?$/.test(payload.requested_amount)))
            return send(res,400,{success:false,error:"invalid_request",message:"Perubahan proposal tidak valid."});
          const proposal=await rpc(c,"proposal_update",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_proposal_id:id,p_payload:payload});
          return send(res,200,{success:true,data:{proposal}});
        }
        if(action==="status"){
          const status=str(b.status,40);
          if(!PROPOSAL_STATUSES.has(status))return send(res,400,{success:false,error:"invalid_request",message:"Status proposal tidak valid."});
          const proposal=await rpc(c,"proposal_set_status",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_proposal_id:id,p_status:status,p_reason:str(b.reason,1000)});
          return send(res,200,{success:true,data:{proposal}});
        }
      }
      res.setHeader("Allow","GET, POST, PATCH");
      return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }

    if(op==="proposal-supports"){
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses data dukungan proposal."});
      if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mencatat dukungan sponsor."});
      const b=bodyOf(req);
      if(req.method==="POST"){
        const proposalId=str(b.proposal_id,64);
        const payload={
          sponsor_name:str(b.sponsor_name,180),partner_id:str(b.partner_id,64),
          support_type:str(b.support_type,30),support_description:str(b.support_description,2000),
          estimated_value:b.estimated_value===undefined?"":String(b.estimated_value),
          contact_person:str(b.contact_person,180),contact_date:str(b.contact_date,10),notes:str(b.notes,2000)
        };
        if(!uuid(proposalId)||!payload.sponsor_name||!SUPPORT_TYPES.has(payload.support_type)||
          (payload.partner_id&&!uuid(payload.partner_id))||!validDate(payload.contact_date)||
          (payload.estimated_value!==""&&!/^\d{1,14}(\.\d{1,2})?$/.test(payload.estimated_value)))
          return send(res,400,{success:false,error:"invalid_request",message:"Data calon sponsor atau bentuk dukungan tidak valid."});
        const support=await rpc(c,"proposal_support_create",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_proposal_id:proposalId,p_payload:payload});
        return send(res,201,{success:true,data:{support}});
      }
      if(req.method==="PATCH"){
        const id=str(b.id,64);
        const payload={};
        for(const key of ["estimated_value","realized_value","support_status","support_description","contact_person","contact_date","commitment_date","realization_date","notes"])
          if(Object.prototype.hasOwnProperty.call(b,key))payload[key]=String(b[key]??"").trim();
        if(!uuid(id)||!Object.keys(payload).length||
          ("support_status" in payload&&!SUPPORT_STATUSES.has(payload.support_status))||
          (["contact_date","commitment_date","realization_date"].some(k=>k in payload&&!validDate(payload[k])))||
          (["estimated_value","realized_value"].some(k=>k in payload&&payload[k]!==""&&!/^\d{1,14}(\.\d{1,2})?$/.test(payload[k]))))
          return send(res,400,{success:false,error:"invalid_request",message:"Pembaruan dukungan sponsor tidak valid."});
        const support=await rpc(c,"proposal_support_update",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_support_id:id,p_payload:payload});
        return send(res,200,{success:true,data:{support}});
      }
      res.setHeader("Allow","POST, PATCH");
      return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }



    if(op==="alumni-intakes"){
      if(!hasRead(userRoles)||!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat meninjau pengajuan alumni."});
      if(req.method==="GET")return send(res,200,{success:true,data:await listAlumniIntakes(c,req)});
      if(req.method==="PATCH"){
        const b=bodyOf(req),id=str(b.id,64),action=str(b.action,20);
        if(!uuid(id)||!["approve","reject"].includes(action))return send(res,400,{success:false,error:"invalid_request",message:"Pengajuan atau tindakan peninjauan tidak valid."});
        const result=await rpc(c,"alumni_intake_review",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_submission_id:id,p_action:action,p_note:str(b.note,1000)});
        if(result&&result.status==="duplicate_possible")return send(res,409,{success:false,error:"possible_duplicate",message:"Kemungkinan data alumni sudah tercatat. Periksa profil yang cocok sebelum memutuskan tindak lanjut.",data:result});
        return send(res,200,{success:true,data:result});
      }
      res.setHeader("Allow","GET, PATCH");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }

    if(op==="alumni-workspace"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses data alumni."});
      const q=req.query||{},[summary,alumniData]=await Promise.all([rpc(c,"alumni_summary",{}),listAlumni(c,{query:{page:q.page||"1",limit:q.limit||"25",search:q.search||"",year:q.year||"",status:q.status||"",consent:q.consent||""}})]);
      return send(res,200,{success:true,data:{user:auth.user,roles:userRoles,summary,alumni:alumniData.alumni,page:alumniData.page,limit:alumniData.limit}});
    }
    if(op==="alumni-detail"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses detail alumni."});
      const id=str(req.query&&req.query.id,64);if(!uuid(id))return send(res,400,{success:false,error:"invalid_query",message:"ID alumni tidak valid."});
      const p=new URLSearchParams({select:"id,full_name,graduation_year,last_class,whatsapp,email,city,province,current_status,institution,study_program,employer,job_title,business_name,industry,survey_year,contact_preference,consent_school_updates,consent_events,consent_fundraising,consent_career_network,consent_updated_at,consent_source,record_status,notes,created_at,updated_at,logs:alumni_contact_logs(id,purpose,channel,outcome,contacted_at,summary)",id:"eq."+id,limit:"1","logs.order":"contacted_at.desc","logs.limit":"50"});
      const rows=await restList(c,"alumni_profiles",p);if(!rows.length)return send(res,404,{success:false,error:"record_not_found",message:"Data alumni tidak ditemukan."});
      const alumni=rows[0],logs=alumni.logs||[];delete alumni.logs;return send(res,200,{success:true,data:{alumni,logs}});
    }
    if(op==="alumni"){
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses direktori alumni."});
      if(req.method==="GET")return send(res,200,{success:true,data:await listAlumni(c,req)});
      if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mengelola data alumni."});
      const b=bodyOf(req),fields=["full_name","graduation_year","last_class","whatsapp","email","city","province","current_status","institution","study_program","employer","job_title","business_name","industry","survey_year","contact_preference","consent_source","record_status","notes"],consents=["consent_school_updates","consent_events","consent_fundraising","consent_career_network"];
      if(req.method==="POST"||req.method==="PATCH"){
        const payload={};for(const k of fields)if(Object.prototype.hasOwnProperty.call(b,k))payload[k]=["graduation_year","survey_year"].includes(k)?String(b[k]??"").trim():str(b[k],k==="notes"?2000:k==="consent_source"?250:500);
        for(const k of consents)if(Object.prototype.hasOwnProperty.call(b,k)){if(typeof b[k]!=="boolean")return send(res,400,{success:false,error:"invalid_request",message:"Nilai persetujuan harus berupa pilihan ya atau tidak."});payload[k]=b[k];}
        if(req.method==="POST"){
          if(!payload.full_name||!/^[0-9]{4}$/.test(payload.graduation_year||"")||Number(payload.graduation_year)<1950||Number(payload.graduation_year)>2100||(payload.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))||(payload.survey_year&&(!/^[0-9]{4}$/.test(payload.survey_year)||Number(payload.survey_year)<2000||Number(payload.survey_year)>2100)))return send(res,400,{success:false,error:"invalid_request",message:"Nama, tahun lulus, atau kontak alumni tidak valid."});
          const a=await rpc(c,"alumni_profile_create",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_payload:payload});return send(res,201,{success:true,data:{alumni:a}});
        }
        const id=str(b.id,64);if(!uuid(id)||!Object.keys(payload).length)return send(res,400,{success:false,error:"invalid_request",message:"ID atau perubahan profil alumni tidak valid."});
        if(payload.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))return send(res,400,{success:false,error:"invalid_request",message:"Alamat email tidak valid."});
        const a=await rpc(c,"alumni_profile_update",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_alumni_id:id,p_payload:payload});return send(res,200,{success:true,data:{alumni:a}});
      }
      res.setHeader("Allow","GET, POST, PATCH");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }
    if(op==="alumni-contact"){
      if(req.method!=="POST"){res.setHeader("Allow","POST");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles)||!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mencatat komunikasi alumni."});
      const b=bodyOf(req),id=str(b.alumni_id,64),purpose=str(b.purpose,30),channel=str(b.channel,30),outcome=str(b.outcome||"sent",30);
      if(!uuid(id)||!["school_update","event","reunion","fundraising","career_network"].includes(purpose)||!["whatsapp","email","phone","in_person"].includes(channel)||!["planned","sent","responded","no_answer","declined","completed"].includes(outcome))return send(res,400,{success:false,error:"invalid_request",message:"Tujuan, kanal, atau status komunikasi tidak valid."});
      const log=await rpc(c,"alumni_contact_log_create",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_alumni_id:id,p_payload:{purpose,channel,outcome,summary:str(b.summary,1000)}});return send(res,201,{success:true,data:{log}});
    }

    if(op==="agreement-detail"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun ini tidak memiliki akses detail perjanjian."});
      const id=str(req.query&&req.query.id,64);
      if(!uuid(id))return send(res,400,{success:false,error:"invalid_query",message:"ID perjanjian tidak valid."});
      const params=new URLSearchParams({
        select:"id,agreement_code,partner_id,title,agreement_type,purpose,scope_of_work,start_date,end_date,estimated_value,currency_code,school_coordinator,partner_coordinator,status,submitted_at,approved_at,signed_at,registered_at,archived_at,created_by,assigned_staff,created_at,updated_at,partner:partners(partner_name,partner_type),approvals:agreement_approvals(id,stage,decision,actor_id,actor_role,notes,acted_at,created_at),documents:agreement_documents(id,document_type,file_name,mime_type,file_size_bytes,version_number,uploaded_at,is_current),events:agreement_workflow_events(id,event_type,from_status,to_status,actor_role,reason,occurred_at)",
        id:"eq."+id,limit:"1"
      });
      const rows=await restList(c,"agreements",params);
      if(!rows.length)return send(res,404,{success:false,error:"record_not_found",message:"Data perjanjian tidak ditemukan."});
      return send(res,200,{success:true,data:{agreement:rows[0]}});
    }

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
        if(!uuid(payload.partner_id)||!payload.title||!payload.purpose||!AGREEMENT_TYPES.has(payload.agreement_type)||!validDate(payload.start_date)||!validDate(payload.end_date)||(payload.start_date&&payload.end_date&&payload.end_date<payload.start_date)||(payload.estimated_value!==""&&!/^\d{1,14}(\.\d{1,2})?$/.test(payload.estimated_value)))return send(res,400,{success:false,error:"invalid_request",message:"Data draft perjanjian tidak valid."});
        const agreement=await rpc(c,"agreement_create_draft",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_payload:payload});
        return send(res,201,{success:true,data:{agreement}});
      }
      if(req.method==="PATCH"){
        const b=bodyOf(req),id=str(b.id,64),action=str(b.action,40);
        if(!uuid(id))return send(res,400,{success:false,error:"invalid_request",message:"ID perjanjian tidak valid."});
        if(action==="update_draft"){
          if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat memperbarui draft."});
          const allowed=["partner_id","title","agreement_type","purpose","scope_of_work","start_date","end_date","estimated_value","school_coordinator","partner_coordinator"];
          const payload={};for(const key of allowed)if(Object.prototype.hasOwnProperty.call(b,key))payload[key]=String(b[key]??"").trim();
          if(payload.partner_id&&!uuid(payload.partner_id))return send(res,400,{success:false,error:"invalid_request",message:"Mitra tidak valid."});
          if(payload.agreement_type&&!AGREEMENT_TYPES.has(payload.agreement_type))return send(res,400,{success:false,error:"invalid_request",message:"Jenis perjanjian tidak valid."});
          if((payload.start_date&&!validDate(payload.start_date))||(payload.end_date&&!validDate(payload.end_date))||(payload.start_date&&payload.end_date&&payload.end_date<payload.start_date))return send(res,400,{success:false,error:"invalid_request",message:"Masa berlaku tidak valid."});
          if(payload.estimated_value!==undefined&&payload.estimated_value!==""&&!/^\d{1,14}(\.\d{1,2})?$/.test(payload.estimated_value))return send(res,400,{success:false,error:"invalid_request",message:"Nilai kerja sama tidak valid."});
          payload.reason=str(b.reason,1000);
          const agreement=await rpc(c,"agreement_update_draft",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_agreement_id:id,p_payload:payload});
          return send(res,200,{success:true,data:{agreement}});
        }
        const actionRoles={submit:"staff_humas",verify:"staff_humas",recommend:"vice_principal_humas",request_revision:"vice_principal_humas",forward_to_principal:"vice_principal_humas",approve:"principal",reject:"principal",prepare_signature:"principal",sign_physical:"staff_humas",sign_electronic:"staff_humas",register:"staff_humas",archive:"staff_humas"};
        let actorRole=actionRoles[action];
        if(action==="request_revision"){const requestedRole=str(b.actor_role,40);actorRole=["principal","vice_principal_humas"].includes(requestedRole)&&userRoles.includes(requestedRole)?requestedRole:(userRoles.includes("vice_principal_humas")?"vice_principal_humas":"principal");}
        if(!actorRole||!userRoles.includes(actorRole))return send(res,403,{success:false,error:"insufficient_role",message:"Peran akun tidak sesuai dengan tahapan proses ini."});
        const agreement=await rpc(c,"agreement_transition",{p_actor_id:auth.user.id,p_actor_role:actorRole,p_agreement_id:id,p_action:action,p_reason:str(b.reason,1000)});
        return send(res,200,{success:true,data:{agreement}});
      }
      res.setHeader("Allow","GET, POST, PATCH");
      return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }

    if(op==="permits"||op==="permit-workspace"){
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun tidak memiliki akses data perizinan."});
      if(op==="permit-workspace"&&req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(req.method==="GET"){
        if(op==="permit-workspace"){
          const [summary,items]=await Promise.all([rpc(c,"permit_summary",{}),listPermits(c,req)]);
          return send(res,200,{success:true,data:{user:auth.user,roles:userRoles,summary,...items}});
        }
        const id=str(req.query&&req.query.id,64);
        if(id){if(!uuid(id))return send(res,400,{success:false,error:"invalid_query",message:"ID permohonan tidak valid."});const permit=await permitDetail(c,id);if(!permit)return send(res,404,{success:false,error:"record_not_found",message:"Permohonan tidak ditemukan."});return send(res,200,{success:true,data:{permit}});}
        return send(res,200,{success:true,data:await listPermits(c,req)});
      }
      if(req.method==="POST"){
        if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat membuat permohonan internal."});
        const b=bodyOf(req),payload={
          permit_type:str(b.permit_type,20),title:str(b.title,200),purpose:str(b.purpose,4000),
          applicant_name:str(b.applicant_name,180),applicant_unit:str(b.applicant_unit,180),
          applicant_email:str(b.applicant_email,254),applicant_phone:str(b.applicant_phone,40),
          related_institution:str(b.related_institution,250),activity_location:str(b.activity_location,500),
          requested_start_at:str(b.requested_start_at,40),requested_end_at:str(b.requested_end_at,40),
          expected_attendees:b.expected_attendees===undefined?"":String(b.expected_attendees),
          facility_details:b.facility_details&&typeof b.facility_details==="object"&&!Array.isArray(b.facility_details)?b.facility_details:{}
        };
        if(!PERMIT_TYPES.has(payload.permit_type)||!payload.title||!payload.purpose||!payload.applicant_name||
          !isoDateTime(payload.requested_start_at)||!isoDateTime(payload.requested_end_at)||
          (payload.requested_start_at&&payload.requested_end_at&&Date.parse(payload.requested_end_at)<Date.parse(payload.requested_start_at))||
          (payload.expected_attendees!==""&&!/^\\d{1,6}$/.test(payload.expected_attendees))||
          (payload.applicant_email&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(payload.applicant_email)))
          return send(res,400,{success:false,error:"invalid_request",message:"Data permohonan tidak valid. Periksa klasifikasi, pemohon, jadwal, dan kontak."});
        const permit=await rpc(c,"permit_create",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_payload:payload});
        return send(res,201,{success:true,data:{permit}});
      }
      if(req.method==="PATCH"){
        const b=bodyOf(req),id=str(b.id,64),action=str(b.action,30);
        if(!uuid(id))return send(res,400,{success:false,error:"invalid_request",message:"ID permohonan tidak valid."});
        if(action==="update_draft"){
          if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat memperbarui draft."});
          const keys=["permit_type","title","purpose","applicant_name","applicant_unit","applicant_email","applicant_phone","related_institution","activity_location","requested_start_at","requested_end_at","expected_attendees","facility_details"];
          const payload={};for(const k of keys)if(Object.prototype.hasOwnProperty.call(b,k))payload[k]=k==="facility_details"?b[k]:String(b[k]??"").trim();
          if(!Object.keys(payload).length||("permit_type" in payload&&!PERMIT_TYPES.has(payload.permit_type))||
            (["requested_start_at","requested_end_at"].some(k=>k in payload&&!isoDateTime(payload[k])))||
            ("applicant_email" in payload&&payload.applicant_email&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(payload.applicant_email)))
            return send(res,400,{success:false,error:"invalid_request",message:"Perubahan permohonan tidak valid."});
          const permit=await rpc(c,"permit_update_draft",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_permit_id:id,p_payload:payload});
          return send(res,200,{success:true,data:{permit}});
        }
        if(action==="assign"){
          if(!userRoles.some(x=>["vice_principal_humas","principal"].includes(x)))return send(res,403,{success:false,error:"insufficient_role",message:"Penugasan hanya dapat dilakukan oleh pejabat HUMAS."});
          const assigned=str(b.assigned_staff,64);if(assigned&&!uuid(assigned))return send(res,400,{success:false,error:"invalid_request",message:"ID petugas tidak valid."});
          const actorRole=userRoles.includes("vice_principal_humas")?"vice_principal_humas":"principal";
          const permit=await rpc(c,"permit_assign",{p_actor_id:auth.user.id,p_actor_role:actorRole,p_permit_id:id,p_assigned_staff:assigned||null});
          return send(res,200,{success:true,data:{permit}});
        }
        const actionRole={submit:"staff_humas",verify:"staff_humas",recommend:"vice_principal_humas",request_revision:"vice_principal_humas",approve:"principal",reject:"principal",cancel:"staff_humas",complete:"staff_humas",archive:"staff_humas"};
        const actorRole=actionRole[action];if(!actorRole||!userRoles.includes(actorRole))return send(res,403,{success:false,error:"insufficient_role",message:"Peran akun tidak sesuai dengan tahapan proses ini."});
        const permit=await rpc(c,"permit_transition",{p_actor_id:auth.user.id,p_actor_role:actorRole,p_permit_id:id,p_action:action,p_reason:str(b.reason,1200)});
        return send(res,200,{success:true,data:{permit}});
      }
      res.setHeader("Allow","GET, POST, PATCH");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }

    if(op==="permit-upload-url"){
      if(req.method!=="POST"){res.setHeader("Allow","POST");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mengunggah dokumen."});
      const b=bodyOf(req),permitId=str(b.permit_id,64),fileName=safeFileName(b.file_name),mime=str(b.mime_type,120),size=Number(b.file_size_bytes),docType=str(b.document_type,40);
      if(!uuid(permitId)||!fileName||!PERMIT_DOC_TYPES.has(docType)||!PERMIT_MIMES.has(mime)||!Number.isInteger(size)||size<1||size>26214400)
        return send(res,400,{success:false,error:"invalid_request",message:"Nama, jenis, format, atau ukuran dokumen tidak memenuhi ketentuan (maksimal 25 MB)."});
      const rows=await restList(c,"permit_requests",new URLSearchParams({select:"id,status,created_by,assigned_staff",id:"eq."+permitId,limit:"1"}));
      if(!rows.length)return send(res,404,{success:false,error:"record_not_found",message:"Permohonan tidak ditemukan."});
      if(rows[0].status==="archived"||rows[0].status==="rejected")return send(res,409,{success:false,error:"document_upload_closed",message:"Dokumen tidak dapat ditambahkan pada permohonan yang sudah ditutup."});
      const ext=(fileName.split(".").pop()||"").toLowerCase();if(!/^[a-z0-9]{1,8}$/.test(ext))return send(res,400,{success:false,error:"invalid_request",message:"Ekstensi dokumen tidak valid."});
      const path=permitId+"/"+crypto.randomUUID()+"."+ext;
      const signed=await storageRequest(c,"/storage/v1/object/upload/sign/humas-permit-documents/"+path,"POST",{});
      const relative=signed.url||signed.signedUrl||signed.signedURL;
      if(!relative||typeof relative!=="string")throw Object.assign(new Error("storage_operation_failed"),{code:"storage_operation_failed"});
      const uploadUrl=relative.startsWith("http")?relative:c.baseUrl+"/storage/v1"+(relative.startsWith("/")?relative:"/"+relative);
      return send(res,200,{success:true,data:{upload_url:uploadUrl,storage_path:path,storage_bucket:"humas-permit-documents",upload_token:signed.token||null,publishable_key:c.publishableKey,document_type:docType,file_name:fileName,mime_type:mime,file_size_bytes:size}});
    }

    if(op==="permit-documents"){
      if(req.method==="POST"){
        if(!staffOnly(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Hanya Staf HUMAS yang dapat mendaftarkan dokumen."});
        const b=bodyOf(req),permitId=str(b.permit_id,64);
        if(!uuid(permitId))return send(res,400,{success:false,error:"invalid_request",message:"ID permohonan tidak valid."});
        const payload={document_type:str(b.document_type,40),file_name:safeFileName(b.file_name),storage_bucket:"humas-permit-documents",storage_path:str(b.storage_path,500),mime_type:str(b.mime_type,120),file_size_bytes:String(b.file_size_bytes||""),checksum_sha256:str(b.checksum_sha256,64)};
        const doc=await rpc(c,"permit_register_document",{p_actor_id:auth.user.id,p_actor_role:WRITE_ROLE,p_permit_id:permitId,p_payload:payload});
        return send(res,201,{success:true,data:{document:doc}});
      }
      res.setHeader("Allow","POST");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});
    }

    if(op==="permit-document-url"){
      if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{success:false,error:"method_not_allowed",message:"Metode permintaan tidak didukung."});}
      if(!hasRead(userRoles))return send(res,403,{success:false,error:"insufficient_role",message:"Akun tidak memiliki akses dokumen."});
      const id=str(req.query&&req.query.id,64);if(!uuid(id))return send(res,400,{success:false,error:"invalid_query",message:"ID dokumen tidak valid."});
      const docs=await restList(c,"permit_documents",new URLSearchParams({select:"id,storage_bucket,storage_path,file_name",id:"eq."+id,limit:"1"}));
      if(!docs.length)return send(res,404,{success:false,error:"record_not_found",message:"Dokumen tidak ditemukan."});
      const signed=await storageRequest(c,"/storage/v1/object/sign/"+docs[0].storage_bucket+"/"+docs[0].storage_path,"POST",{expiresIn:300});
      const relative=signed.signedURL||signed.signedUrl||signed.url;
      if(!relative||typeof relative!=="string")throw Object.assign(new Error("storage_operation_failed"),{code:"storage_operation_failed"});
      return send(res,200,{success:true,data:{url:relative.startsWith("http")?relative:c.baseUrl+"/storage/v1"+(relative.startsWith("/")?relative:"/"+relative),file_name:docs[0].file_name,expires_in:300}});
    }

    return send(res,404,{success:false,error:"operation_not_found",message:"Operasi HUMAS tidak ditemukan."});
  }catch(error){return safeError(res,error);}
};
