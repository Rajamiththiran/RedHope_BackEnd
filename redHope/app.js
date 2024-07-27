"use strict";
const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fastifyEnv = require("@fastify/env");
const fastifyJwt = require("@fastify/jwt");
const fastifyCors = require("@fastify/cors");

const schema = {
  type: "object",
  required: [
    "APP_URL",
    "DATABASE_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_ENDPOINT",
    "AWS_REGION",
    "SPACE_DIR",
    "JWT_SECRET",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "BUCKET_NAME",
  ],
  properties: {
    APP_URL: { type: "string" },
    DATABASE_URL: { type: "string" },
    AWS_ACCESS_KEY_ID: { type: "string" },
    AWS_SECRET_ACCESS_KEY: { type: "string" },
    S3_ENDPOINT: { type: "string" },
    AWS_REGION: { type: "string" },
    SPACE_DIR: { type: "string" },
    JWT_SECRET: { type: "string" },
    FIREBASE_PROJECT_ID: { type: "string" },
    FIREBASE_PRIVATE_KEY: { type: "string" },
    FIREBASE_CLIENT_EMAIL: { type: "string" },
    SUPABASE_URL: { type: "string" },
    SUPABASE_KEY: { type: "string" },
    BUCKET_NAME: { type: "string" },
  },
};

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "Set" : "Not set");
console.log("BUCKET_NAME:", process.env.BUCKET_NAME);

const options = {
  schema: schema,
  dotenv: true,
};

module.exports = async function (fastify, opts) {
  fastify.register(fastifyEnv, options).after((err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
    });

    fastify.register(fastifyCors, {
      origin: [
        "http://localhost:5173",
        "https://red-hope-front-end.vercel.app",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });

    fastify.register(require("./plugins/firebase"));
    fastify.register(require("@fastify/multipart"));
    fastify.register(require("./plugins/supabase"));

    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "plugins"),
      options: Object.assign({}, opts),
    });

    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "routes"),
      options: Object.assign({}, opts),
      routeParams: true,
    });
  });
};
