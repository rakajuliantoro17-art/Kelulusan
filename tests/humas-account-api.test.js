"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const handler=require("../src/server/api/humas-account.js");
const USER_ID="11111111-1111-4111-8111-111111111111";

async function invoke({method="GET",op="config",token="valid-token",body={}}={}){
 const originalFetch=global.fetch,calls=[];
 process.env.SUPABASE_URL="https://example.supabase.co";
 process.env.SUPABASE_PUBLISHABLE_KEY="sb_publishable_test";
 process.env.SUPABASE_SECRET_KEY="sb_secret_test";
 global.fetch=async(input,options={})=>{
  const url=new URL(String(input));calls.push({url,options});
  if(url.pathname==="/auth/v1/user")return new Response(JSON.stringify(token==="invalid-token"?{message:"invalid"}:{id:USER_ID,email:"external@example.invalid"}),{status:token==="invalid-token"?401:200});
  if(url.pathname==="/rest/v1/external_profiles")return new Response(JSON.stringify([{user_id:USER_ID,account_type:"alumni",full_name:"Alumni Uji",profile_status:"pending_review"}]),{status:200});
  if(url.pathname.endsWith("/rpc/external_profile_upsert"))return new Response(JSON.stringify({user_id:USER_ID,account_type:"alumni",profile_status:"pending_review"}),{status:200});
  return new Response(JSON.stringify({message:"not found"}),{status:404});
 };
 const req={method,headers:token?{authorization:"Bearer "+token}:{},query:{op},body};
 const res={statusCode:200,headers:{},payload:null,status(code){this.statusCode=code;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.payload=v;return this;}};
 try{await handler(req,res);return{status:res.statusCode,payload:res.payload,calls,headers:res.headers};}
 finally{global.fetch=originalFetch;}
}

test("public config exposes only Supabase URL and publishable key",async()=>{
 const r=await invoke();
 assert.equal(r.status,200);
 assert.deepEqual(Object.keys(r.payload.data).sort(),["publishableKey","supabaseUrl"]);
 assert.equal(JSON.stringify(r.payload).includes("sb_secret_test"),false);
 assert.equal(r.headers["Cache-Control"],"no-store, max-age=0");
});
test("profile endpoint requires an authenticated session",async()=>{
 const r=await invoke({op:"profile",token:null});
 assert.equal(r.status,401);
 assert.equal(r.calls.length,0);
});
test("invalid access token cannot read external profile",async()=>{
 const r=await invoke({op:"profile",token:"invalid-token"});
 assert.equal(r.status,401);
 assert.equal(r.calls.some(x=>x.url.pathname==="/rest/v1/external_profiles"),false);
});
test("authenticated user reads only their own external profile",async()=>{
 const r=await invoke({op:"profile"});
 assert.equal(r.status,200);
 const read=r.calls.find(x=>x.url.pathname==="/rest/v1/external_profiles");
 assert.equal(read.url.searchParams.get("user_id"),"eq."+USER_ID);
});
test("profile rejects internal account types before database write",async()=>{
 const r=await invoke({op:"profile",method:"POST",body:{account_type:"staff_humas",full_name:"Petugas",phone:"081234567890",consent_terms:true}});
 assert.equal(r.status,400);
 assert.equal(r.calls.some(x=>x.url.pathname.endsWith("/rpc/external_profile_upsert")),false);
});
test("valid external profile upsert is bound to authenticated user id",async()=>{
 const r=await invoke({op:"profile",method:"POST",body:{account_type:"alumni",full_name:"Alumni Uji",phone:"081234567890",graduation_year:"2020",consent_terms:true}});
 assert.equal(r.status,200);
 const call=r.calls.find(x=>x.url.pathname.endsWith("/rpc/external_profile_upsert"));
 assert.ok(call);
 assert.equal(JSON.parse(call.options.body).p_user_id,USER_ID);
 assert.equal(JSON.parse(call.options.body).p_payload.account_type,"alumni");
});
test("partner and committee profiles require organization name",async()=>{
 for(const account_type of ["partner","committee"]){
  const r=await invoke({op:"profile",method:"POST",body:{account_type,full_name:"Pengguna Uji",phone:"081234567890",consent_terms:true}});
  assert.equal(r.status,400);
  assert.equal(r.calls.some(x=>x.url.pathname.endsWith("/rpc/external_profile_upsert")),false);
 }
});
