"use strict";

const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      consumes: ["multipart/form-data"],
      body: {
        type: "object",
        properties: {
          hospital_id: { type: "integer" },
          knowledge: { type: "string" },
          image: { type: "string", format: "binary" },
        },
      },
    },
    handler: async (request, reply) => {
      const data = await request.file();
      const { hospital_id, knowledge } = request.body;
      let image_url = null;

      if (data) {
        image_url = await fastify.uploadImage(data);
      }

      const newKnowledge = await fastify.prisma.knowledges.create({
        data: {
          hospital_id: parseInt(hospital_id),
          knowledge,
          image_url,
          created_at: moment().toISOString(),
          modified_at: moment().toISOString(),
        },
      });

      reply.code(201).send(newKnowledge);
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
      const { id } = request.params;
      const knowledge = await fastify.prisma.knowledges.findUnique({
        where: { id: parseInt(id) },
      });

      if (!knowledge) {
        reply.code(404).send({ error: "Knowledge not found" });
      } else {
        reply.send(knowledge);
      }
    },
  });

  fastify.get("/browse", {
    schema: {
      tags: ["Main"],
      querystring: {
        type: "object",
        properties: {
          hospital_id: { type: "integer" },
          limit: { type: "integer", default: 10 },
          offset: { type: "integer", default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { hospital_id, limit = 10, offset = 0 } = request.query;

      const knowledges = await fastify.prisma.knowledges.findMany({
        where: hospital_id ? { hospital_id: parseInt(hospital_id) } : {},
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: "desc" },
      });

      reply.send(knowledges);
    },
  });

  fastify.put("/:id", {
    schema: {
      tags: ["Main"],
      consumes: ["multipart/form-data"],
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
          image: { type: "string", format: "binary" },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { knowledge } = request.body;
      let image_url = null;

      const data = await request.file();
      if (data) {
        image_url = await fastify.uploadImage(data);
      }

      const updatedKnowledge = await fastify.prisma.knowledges.update({
        where: { id: parseInt(id) },
        data: {
          knowledge,
          image_url: image_url || undefined,
          modified_at: moment().toISOString(),
        },
      });

      reply.send(updatedKnowledge);
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
      const { id } = request.params;
      await fastify.prisma.knowledges.delete({
        where: { id: parseInt(id) },
      });
      reply.code(204).send();
    },
  });
};
