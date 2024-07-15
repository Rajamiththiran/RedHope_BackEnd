"use strict";

const fp = require("fastify-plugin");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

module.exports = fp(async function (fastify, opts) {
  const token = {
    create: async (params = {}) => {
      //email
      const key = uuidv4();
      const query = await fastify.prisma.user_tokens.create({
        data: {
          email: params.email,
          token: key,
          created_at: moment().toISOString(),
          modified_at: moment().toISOString(),
        },
      });
      return query.token;
    },

    delete: async (params = {}) => {
      //token
      const query = await fastify.prisma.user_tokens.delete({
        where: {
          tokens: params.token,
        },
      });
      return query;
    },
  };
  fastify.decorate("token", token);
});
