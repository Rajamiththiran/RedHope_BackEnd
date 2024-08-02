"use strict";

const moment = require("moment");

module.exports = async function (fastify, opts) {
  // Create a new donation history record
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["donor_id", "donation_date", "address", "blood_type"],
        properties: {
          donor_id: { type: "integer" },
          donation_date: { type: "string", format: "date-time" },
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
        console.log("Received donation data:", request.body);
        const donation = await fastify.prisma.donation_history.create({
          data: {
            ...request.body,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });
        console.log("Donation created successfully:", donation);
        reply.code(201).send(donation);
      } catch (error) {
        console.error("Error creating donation history:", error);
        reply.code(500).send({
          error: "Failed to create donation history",
          details: error.message,
        });
      }
    },
  });

  // Read all donation history records for a donor
  fastify.get("/donor/:donorId", {
    schema: {
      tags: ["Main"],
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

  fastify.get("/all", {
    schema: {
      tags: ["Main"],
    },
    handler: async (request, reply) => {
      try {
        const donations = await fastify.prisma.donation_history.findMany({
          orderBy: {
            donation_date: "desc",
          },
        });
        reply.send(donations);
      } catch (error) {
        reply.code(500).send({
          error: "Failed to fetch all donation history records",
          details: error.message,
        });
      }
    },
  });

  // Update a donation history record
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
        required: [
          "donation_date",
          "address",
          "blood_type",
          "volume",
          "donation_type",
        ],
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
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
          return reply.code(400).send({ error: "Invalid ID" });
        }

        if (!moment(request.body.donation_date, "YYYY-MM-DD", true).isValid()) {
          return reply
            .code(400)
            .send({ error: "Invalid date format. Use YYYY-MM-DD" });
        }

        const existingDonation =
          await fastify.prisma.donation_history.findUnique({
            where: { id: id },
          });

        if (!existingDonation) {
          return reply.code(404).send({ error: "Donation history not found" });
        }

        const updatedDonation = await fastify.prisma.donation_history.update({
          where: { id: id },
          data: {
            donation_date: new Date(request.body.donation_date),
            address: request.body.address,
            blood_type: request.body.blood_type,
            volume: parseFloat(request.body.volume),
            donation_type: request.body.donation_type,
            description: request.body.description,
            modified_at: new Date(),
          },
        });

        reply.send(updatedDonation);
      } catch (error) {
        console.error("Error updating donation history:", error);
        reply.code(500).send({
          error: "Failed to update donation history",
          details: error.message,
        });
      }
    },
  });

  // Delete a donation history record
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
