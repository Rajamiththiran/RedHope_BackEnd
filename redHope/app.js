"use strict";
const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fastifyEnv = require("@fastify/env");
const fastifyJwt = require("@fastify/jwt");
const fastifyCors = require("@fastify/cors");
const fastifyMultipart = require("@fastify/multipart");

const schema = {
  type: "object",
  required: [
    "APP_URL",
    "DATABASE_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_BUCKET_NAME",
    "SPACE_DIR",
    "JWT_SECRET",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
  ],
  properties: {
    APP_URL: { type: "string" },
    DATABASE_URL: { type: "string" },
    AWS_ACCESS_KEY_ID: { type: "string" },
    AWS_SECRET_ACCESS_KEY: { type: "string" },
    AWS_REGION: { type: "string" },
    S3_BUCKET_NAME: { type: "string" },
    SPACE_DIR: { type: "string" },
    JWT_SECRET: { type: "string" },
    FIREBASE_PROJECT_ID: { type: "string" },
    FIREBASE_PRIVATE_KEY: { type: "string" },
    FIREBASE_CLIENT_EMAIL: { type: "string" },
  },
};

const options = {
  confKey: "config",
  schema: schema,
  dotenv: true,
};

module.exports = async function (fastify, opts) {
  await fastify.register(fastifyEnv, options);

  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.register(fastifyCors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  fastify.register(require("./plugins/firebase"));

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
    routeParams: true,
  });
};
