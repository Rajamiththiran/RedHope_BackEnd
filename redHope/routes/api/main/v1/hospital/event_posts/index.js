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
        await fastify.prisma.event_posts.delete({
          where: { id: parseInt(request.params.id) },
        });
        reply.code(204).send();
      } catch (error) {
        reply.code(500).send({ error: "Failed to delete event post" });
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
      querystring: {
        type: "object",
        properties: {
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { hospitalId } = request.params;
        const { start_date, end_date } = request.query;
        let whereClause = {
          hospital_id: parseInt(hospitalId),
        };

        if (start_date && end_date) {
          whereClause.start_time = {
            gte: new Date(start_date),
            lte: new Date(end_date),
          };
        }

        const eventPosts = await fastify.prisma.event_posts.findMany({
          where: whereClause,
          orderBy: {
            start_time: "asc",
          },
        });
        reply.send(eventPosts);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to fetch event posts",
          details: error.message,
        });
      }
    },
  });
};
