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
    "BUCKET_NAME",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_ENDPOINT",
    "SPACE_DIR",
    "JWT_SECRET",
  ],
  properties: {
    APP_URL: {
      type: "string",
    },
    DATABASE_URL: {
      type: "string",
    },
    BUCKET_NAME: {
      type: "string",
    },
    AWS_ACCESS_KEY_ID: {
      type: "string",
    },
    AWS_SECRET_ACCESS_KEY: {
      type: "string",
    },
    AWS_REGION: {
      type: "string",
    },
    S3_ENDPOINT: {
      type: "string",
    },
    SPACE_DIR: {
      type: "string",
    },
    JWT_SECRET: {
      type: "string",
    },
  },
};

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

    // Register JWT plugin
    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
    });

    // Register CORS plugin
    fastify.register(fastifyCors, {
      origin: "http://localhost:5173", // Your React app's URL
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });

    // Register Firebase plugin
    fastify.register(require("./plugins/firebase"));

    // This loads all plugins defined in plugins
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "plugins"),
      options: Object.assign({}, opts),
    });

    // This loads all plugins defined in routes
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "routes"),
      options: Object.assign({}, opts),
      routeParams: true,
    });
  });
};
