"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const handler=require("../src/server/api/humas-alumni-public.js");

function validBody(overrides={}){return{
 full_name:"Alumni Pengujian",graduation_year:"2018",whatsapp:"08123456789",email:"",
 current_status:"employed",contact_preference:"whatsapp",consent_data_processing:true,
 consent_school_updates:false,consent_events:true,consent_fundraising:false,consent_career_network:false,
 website:"",...overrides
};}
async function invoke({body=validBody(),env=true,ip="203.0.113.10",origin="https://school.example",mockBody={ok:true,submission_id:"88888888-8888-4888-8888-888888888888",status:"pending"},mockStatus=200}={}){
 const old={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SECRET_KEY,pepper:process.env.ALUMNI_INTAKE_RATE_SECRET};
 if(env){process.env.SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_SECRET_KEY="sb_secret_test";process.env.ALUMNI_INTAKE_RATE_SECRET="test-rate-secret-0123456789-abcdef";}
 else{delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SECRET_KEY;delete process.env.ALUMNI_INTAKE_RATE_SECRET;}
 const oldFetch=global.fetch,calls=[];
 global.fetch=async(url,options={})=>{calls.push({url:String(url),options});return new Response(JSON.stringify(mockBody),{status:mockStatus});};
 const req={method:"POST",headers:{host:"school.example","x-real-ip":ip,origin,"content-type":"application/json"},body};
 const res={statusCode:200,headers:{},payload:null,status(code){this.statusCode=code;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.payload=v;return this;}};
 try{await handler(req,res);return{status:res.statusCode,payload:res.payload,headers:res.headers,calls};}
 finally{global.fetch=oldFetch;for(const [k,v] of Object.entries({SUPABASE_URL:old.url,SUPABASE_SECRET_KEY:old.key,ALUMNI_INTAKE_RATE_SECRET:old.pepper})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
test("public alumni form creates a pending intake through a server-only RPC",async()=>{const r=await invoke();assert.equal(r.status,202);assert.match(r.payload.message,/diverifikasi/);assert.equal(r.calls.length,1);const c=r.calls[0];assert.ok(c.url.endsWith("/rest/v1/rpc/alumni_intake_submit"));assert.equal(c.options.headers.apikey,"sb_secret_test");assert.equal(c.options.headers.Authorization,undefined);const p=JSON.parse(c.options.body);assert.match(p.p_ip_hash,/^[a-f0-9]{64}$/);assert.equal(p.p_payload.consent_events,true);assert.equal(p.p_payload.consent_fundraising,false);});
test("public intake rejects invalid mandatory consent before database access",async()=>{const r=await invoke({body:validBody({consent_data_processing:false})});assert.equal(r.status,400);assert.equal(r.calls.length,0);});
test("public intake rejects malformed email before database access",async()=>{const r=await invoke({body:validBody({email:"not-an-email"})});assert.equal(r.status,400);assert.equal(r.calls.length,0);});
test("public intake returns rate limit response from database",async()=>{const r=await invoke({mockBody:{ok:false,rate_limited:true}});assert.equal(r.status,429);});
test("public intake rejects cross-origin submission",async()=>{const r=await invoke({origin:"https://attacker.example"});assert.equal(r.status,403);assert.equal(r.calls.length,0);});
test("public intake honeypot quietly ignores automated submission",async()=>{const r=await invoke({body:validBody({website:"bot-filled"})});assert.equal(r.status,202);assert.equal(r.calls.length,0);});
test("public intake requires the server-side rate-limit secret",async()=>{const r=await invoke({env:false});assert.equal(r.status,503);assert.equal(r.calls.length,0);});
