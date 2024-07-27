"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: [
          "hospital_id",
          "title",
          "start_time",
          "end_time",
          "location",
        ],
        properties: {
          hospital_id: { type: "integer" },
          title: { type: "string" },
          start_time: { type: "string", format: "date-time" },
          end_time: { type: "string", format: "date-time" },
          location: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const eventPost = await fastify.prisma.event_posts.create({
          data: {
            ...request.body,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });
        reply.code(201).send(eventPost);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to create event post",
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
        const eventPost = await fastify.prisma.event_posts.findUnique({
          where: { id: parseInt(request.params.id) },
        });
        if (!eventPost) {
          reply.code(404).send({ error: "Event post not found" });
        } else {
          reply.send(eventPost);
        }
      } catch (error) {
        reply.code(500).send({ error: "Failed to fetch event post" });
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
          title: { type: "string" },
          start_time: { type: "string", format: "date-time" },
          end_time: { type: "string", format: "date-time" },
          location: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const updatedEventPost = await fastify.prisma.event_posts.update({
          where: { id: parseInt(request.params.id) },
          data: {
            ...request.body,
            modified_at: moment().toISOString(),
          },
        });
        reply.send(updatedEventPost);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to update event post",
          details: error.message,
        });
      }
    },
  });
};
