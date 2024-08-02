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

  fastify.get("/all", {
    schema: {
      tags: ["Main"],
    },
    handler: async (request, reply) => {
      try {
        const thoughts = await fastify.prisma.thoughts.findMany({
          orderBy: {
            created_at: "desc",
          },
        });
        reply.send(thoughts);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to fetch all thoughts",
          details: error.message,
        });
      }
    },
  });

  fastify.get("/:id", {
    schema: {
      tags: ["Main"],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "integer" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const thought = await fastify.prisma.thoughts.findUnique({
          where: { id: parseInt(request.params.id) },
        });
        if (!thought) {
          reply.code(404).send({ error: "Thought not found" });
        } else {
          reply.send(thought);
        }
      } catch (error) {
        reply.code(500).send({ error: "Failed to fetch thought" });
      }
    },
  });
};
