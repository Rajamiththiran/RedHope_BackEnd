const fp = require("fastify-plugin");
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-admin-sdk.json");

module.exports = fp(async function (fastify, opts) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  fastify.decorate("firebase", admin);
});
