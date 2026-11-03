"use strict";

/* PINTUKU TU API dispatcher. All authorization is performed by the TU service. */
module.exports = async function tuDispatcher(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return require("../../src/server/api/tu.js")(req, res);
};
