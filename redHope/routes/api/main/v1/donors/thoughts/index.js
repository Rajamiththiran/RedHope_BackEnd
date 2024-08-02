"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["donor_id", "title", "thought"],
        properties: {
          donor_id: { type: "integer" },
          title: { type: "string" },
          thought: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const thought = await fastify.prisma.thoughts.create({
          data: {
            ...request.body,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });
        reply.code(201).send(thought);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to create thought",
          details: error.message,
        });
      }
    },
  });
};
