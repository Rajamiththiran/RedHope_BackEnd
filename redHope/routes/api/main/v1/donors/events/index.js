"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["donor_id", "title", "start_time", "address"],
        properties: {
          donor_id: { type: "integer" },
          title: { type: "string" },
          start_time: { type: "string", format: "date-time" },
          end_time: { type: "string", format: "date-time" },
          address: { type: "string" },
          color: { type: "string" },
          reminder: { type: "string", format: "date-time" },
          description: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const event = await fastify.prisma.events.create({
          data: {
            ...request.body,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });
        reply.code(201).send(event);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to create event",
          details: error.message,
        });
      }
    },
  });
};
