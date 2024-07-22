"use strict";

const moment = require("moment");

module.exports = async function (fastify, opts) {
  // Create a new donation history record
  fastify.post("/create", {
    schema: {
      tags: ["Donation History"],
      body: {
        type: "object",
        required: ["donor_id", "donation_date", "address", "blood_type"],
        properties: {
          donor_id: { type: "integer" },
          donation_date: { type: "string" },
          address: { type: "string" },
          blood_type: { type: "string" },
          volume: { type: "number" },
          donation_type: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const donation = await fastify.prisma.donation_history.create({
          data: {
            ...request.body,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });
        reply.code(201).send(donation);
      } catch (error) {
        reply.code(500).send({ error: "Failed to create donation history" });
      }
    },
  });

  // Read all donation history records for a donor
  fastify.get("/donor/:donorId", {
    schema: {
      tags: ["Donation History"],
      params: {
        type: "object",
        required: ["donorId"],
        properties: {
          donorId: { type: "integer" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const donations = await fastify.prisma.donation_history.findMany({
          where: {
            donor_id: parseInt(request.params.donorId),
          },
          orderBy: {
            donation_date: "desc",
          },
        });
        reply.send(donations);
      } catch (error) {
        reply.code(500).send({ error: "Failed to fetch donation history" });
      }
    },
  });

  // Read a specific donation history record
  fastify.get("/:id", {
    schema: {
      tags: ["Donation History"],
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
        const donation = await fastify.prisma.donation_history.findUnique({
          where: {
            id: parseInt(request.params.id),
          },
        });
        if (!donation) {
          reply.code(404).send({ error: "Donation history not found" });
        } else {
          reply.send(donation);
        }
      } catch (error) {
        reply.code(500).send({ error: "Failed to fetch donation history" });
      }
    },
  });

  // Update a donation history record
  fastify.put("/:id", {
    schema: {
      tags: ["Donation History"],
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
          donation_date: { type: "string", format: "date" },
          address: { type: "string" },
          blood_type: { type: "string" },
          volume: { type: "number" },
          donation_type: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const updatedDonation = await fastify.prisma.donation_history.update({
          where: {
            id: parseInt(request.params.id),
          },
          data: {
            ...request.body,
            modified_at: moment().toISOString(),
          },
        });
        reply.send(updatedDonation);
      } catch (error) {
        reply.code(500).send({ error: "Failed to update donation history" });
      }
    },
  });

  // Delete a donation history record
  fastify.delete("/:id", {
    schema: {
      tags: ["Donation History"],
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
        await fastify.prisma.donation_history.delete({
          where: {
            id: parseInt(request.params.id),
          },
        });
        reply.code(204).send();
      } catch (error) {
        reply.code(500).send({ error: "Failed to delete donation history" });
      }
    },
  });
};
