"use strict";

const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fastifyEnv = require("@fastify/env");

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
  },
};

const options = {
  schema: schema,
  dotenv: true,
};

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(fastifyEnv, options).after((err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "plugins"),
      options: Object.assign({}, opts),
    });

    // This loads all plugins defined in routes
    // define your routes in one of these
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "routes"),
      options: Object.assign({}, opts),
      routeParams: true,
    });
  });
};
