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

  fastify.get("/all", {
    schema: {
      tags: ["Main"],
    },
    handler: async (request, reply) => {
      try {
        const knowledges = await fastify.prisma.knowledges.findMany({
          orderBy: {
            created_at: "desc",
          },
        });
        reply.send(knowledges);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to fetch all knowledges",
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
        const knowledge = await fastify.prisma.knowledges.findUnique({
          where: { id: parseInt(request.params.id) },
        });
        if (!knowledge) {
          reply.code(404).send({ error: "Knowledge not found" });
        } else {
          reply.send(knowledge);
        }
      } catch (error) {
        reply.code(500).send({ error: "Failed to fetch knowledge" });
      }
    },
  });

  fastify.put("/:id", {
    schema: {
      tags: ["Main"],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "integer" },
        },
      },
      body: {
        type: "object",
        properties: {
          knowledge: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const updatedKnowledge = await fastify.prisma.knowledges.update({
          where: { id: parseInt(request.params.id) },
          data: {
            ...request.body,
            modified_at: moment().toISOString(),
          },
        });
        reply.send(updatedKnowledge);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to update knowledge",
          details: error.message,
        });
      }
    },
  });

  fastify.delete("/:id", {
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
        await fastify.prisma.knowledges.delete({
          where: { id: parseInt(request.params.id) },
        });
        reply.code(204).send();
      } catch (error) {
        reply.code(500).send({ error: "Failed to delete knowledge" });
      }
    },
  });

  fastify.get("/browse/:hospitalId", {
    schema: {
      tags: ["Main"],
      params: {
        type: "object",
        required: ["hospitalId"],
        properties: {
          hospitalId: { type: "integer" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { hospitalId } = request.params;
        const knowledges = await fastify.prisma.knowledges.findMany({
          where: {
            hospital_id: parseInt(hospitalId),
          },
          orderBy: {
            created_at: "desc",
          },
        });
        reply.send(knowledges);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to fetch knowledges",
          details: error.message,
        });
      }
    },
  });
};
