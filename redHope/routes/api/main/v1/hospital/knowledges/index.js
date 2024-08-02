"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["hospital_id", "knowledge"],
        properties: {
          hospital_id: { type: "integer" },
          knowledge: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const knowledge = await fastify.prisma.knowledges.create({
          data: {
            ...request.body,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });
        reply.code(201).send(knowledge);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to create knowledge",
          details: error.message,
        });
      }
    },
  });
};
