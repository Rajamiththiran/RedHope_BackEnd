"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  //create event
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

  // read event
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
        const event = await fastify.prisma.events.findUnique({
          where: { id: parseInt(request.params.id) },
        });
        if (!event) {
          reply.code(404).send({ error: "Event not found" });
        } else {
          reply.send(event);
        }
      } catch (error) {
        reply.code(500).send({ error: "Failed to fetch event" });
      }
    },
  });

  //update event
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
          address: { type: "string" },
          color: { type: "string" },
          reminder: { type: "string", format: "date-time" },
          description: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const updatedEvent = await fastify.prisma.events.update({
          where: { id: parseInt(request.params.id) },
          data: {
            ...request.body,
            modified_at: moment().toISOString(),
          },
        });
        reply.send(updatedEvent);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to update event",
          details: error.message,
        });
      }
    },
  });

  // delete event
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
        await fastify.prisma.events.delete({
          where: { id: parseInt(request.params.id) },
        });
        reply.code(204).send();
      } catch (error) {
        reply.code(500).send({ error: "Failed to delete event" });
      }
    },
  });

  // Browse events for a donor
  fastify.get("/browse/:donorId", {
    schema: {
      tags: ["Main"],
      params: {
        type: "object",
        required: ["donorId"],
        properties: {
          donorId: { type: "integer" },
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
        const { donorId } = request.params;
        const { start_date, end_date } = request.query;

        let whereClause = {
          donor_id: parseInt(donorId),
        };

        if (start_date && end_date) {
          whereClause.start_time = {
            gte: new Date(start_date),
            lte: new Date(end_date),
          };
        }

        const events = await fastify.prisma.events.findMany({
          where: whereClause,
          orderBy: {
            start_time: "asc",
          },
        });

        reply.send(events);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to fetch events",
          details: error.message,
        });
      }
    },
  });
};
