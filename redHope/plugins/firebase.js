const fp = require("fastify-plugin");
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-admin-sdk.json");

let firebaseApp;

module.exports = fp(
  async function (fastify, opts) {
    if (!firebaseApp) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    if (!fastify.firebase) {
      fastify.decorate("firebase", admin);
    }
  },
  {
    name: "firebase-plugin",
  }
);
