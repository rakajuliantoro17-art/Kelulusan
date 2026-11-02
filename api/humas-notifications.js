"use strict";
module.exports=async function humasNotificationsCron(req,res){
  req.query={...(req.query||{}),op:"notifications-dispatch"};
  return require("../src/server/api/humas.js")(req,res);
};
