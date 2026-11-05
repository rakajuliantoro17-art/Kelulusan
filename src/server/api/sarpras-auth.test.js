"use strict";
const assert = require("assert");
const crypto = require("crypto");
process.env.SARPRAS_SESSION_SECRET = "test-secret";
const handler = require("./sarpras-auth.js");
function res() { return { h:{}, setHeader(k,v){this.h[k]=v;}, status(c){this.code=c;return this;}, json(b){this.body=b;return this;} }; }
(async () => {
  let r = res(); await handler({ method:"GET", headers:{} }, r);
  assert.strictEqual(r.code, 401);
  const body = Buffer.from(JSON.stringify({u:"a",n:"A",r:"admin_sarpras",exp:Math.floor(Date.now()/1000)+60})).toString("base64url");
  const tok = body + "." + crypto.createHmac("sha256","test-secret").update(body).digest("base64url");
  r = res(); await handler({ method:"GET", headers:{ authorization:"Bearer "+tok } }, r);
  assert.strictEqual(r.code, 200); assert.strictEqual(r.body.role, "admin_sarpras");
  r = res(); await handler({ method:"POST", headers:{}, body:{action:"login",username:"a",password:"b"} }, r);
  assert.strictEqual(r.code, 503);
  console.log("sarpras-auth ok");
})();
