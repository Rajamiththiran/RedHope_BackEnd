"use strict";

const Fastify = require("fastify");
const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

function config() {
  return {
    database: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
  };
}

async function build(t) {
  const app = Fastify();

  // Register plugins
  await app.register(AutoLoad, {
    dir: path.join(__dirname, "..", "plugins"),
    options: Object.assign({}, config()),
  });

  // Setup Prisma
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config().database.url,
      },
    },
  });
  await prisma.$connect();
  app.decorate("prisma", prisma);

  // Setup JWT
  await app.register(require("@fastify/jwt"), {
    secret: config().jwt.secret,
  });

  // Mock token plugin
  app.decorate("token", {
    create: async (payload) => {
      return "mock-refresh-token-" + payload.email;
    },
    delete: async (token) => {
      return { success: true };
    },
  });

  // Load your routes
  await app.register(AutoLoad, {
    dir: path.join(__dirname, "..", "routes"),
    options: Object.assign({}, config()),
  });

  await app.ready();

  t.after(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  return app;
}

module.exports = {
  config,
  build,
};
