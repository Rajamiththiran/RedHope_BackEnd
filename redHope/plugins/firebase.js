const fp = require("fastify-plugin");
const admin = require("firebase-admin");

module.exports = fp(
  async function (fastify, opts) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
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
