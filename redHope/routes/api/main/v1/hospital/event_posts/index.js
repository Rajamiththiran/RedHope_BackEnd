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
          title: { type: "string" },
          start_time: { type: "string", format: "date-time" },
          end_time: { type: "string", format: "date-time" },
          location: { type: "string" },
          description: { type: "string" },
          image: { type: "string", format: "binary" },
        },
      },
    },
    handler: async (request, reply) => {
      const data = await request.file();
      const {
        hospital_id,
        title,
        start_time,
        end_time,
        location,
        description,
      } = request.body;
      let image_url = null;

      if (data) {
        image_url = await fastify.uploadImage(data);
      }

      const newEventPost = await fastify.prisma.event_posts.create({
        data: {
          hospital_id: parseInt(hospital_id),
          title,
          start_time: new Date(start_time),
          end_time: new Date(end_time),
          location,
          description,
          image_url,
          created_at: moment().toISOString(),
          modified_at: moment().toISOString(),
        },
      });

      reply.code(201).send(newEventPost);
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
      const eventPost = await fastify.prisma.event_posts.findUnique({
        where: { id: parseInt(id) },
      });

      if (!eventPost) {
        reply.code(404).send({ error: "Event post not found" });
      } else {
        reply.send(eventPost);
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

      const eventPosts = await fastify.prisma.event_posts.findMany({
        where: hospital_id ? { hospital_id: parseInt(hospital_id) } : {},
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { start_time: "asc" },
      });

      reply.send(eventPosts);
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
          title: { type: "string" },
          start_time: { type: "string", format: "date-time" },
          end_time: { type: "string", format: "date-time" },
          location: { type: "string" },
          description: { type: "string" },
          image: { type: "string", format: "binary" },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { title, start_time, end_time, location, description } =
        request.body;
      let image_url = null;

      const data = await request.file();
      if (data) {
        image_url = await fastify.uploadImage(data);
      }

      const updatedEventPost = await fastify.prisma.event_posts.update({
        where: { id: parseInt(id) },
        data: {
          title,
          start_time: start_time ? new Date(start_time) : undefined,
          end_time: end_time ? new Date(end_time) : undefined,
          location,
          description,
          image_url: image_url || undefined,
          modified_at: moment().toISOString(),
        },
      });

      reply.send(updatedEventPost);
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
      await fastify.prisma.event_posts.delete({
        where: { id: parseInt(id) },
      });
      reply.code(204).send();
    },
  });
};
