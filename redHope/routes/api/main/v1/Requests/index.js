"use strict";
const moment = require("moment");

async function findMatchingDonors(fastify, request) {
  return await fastify.prisma.donors.findMany({
    where: {
      blood_type: request.blood_type_requested,
      // Add any other criteria for matching donors
    },
  });
}

async function sendNotificationsToMatchingDonors(fastify, donors, request) {
  // Placeholder for notification logic
  // You'll need to implement this based on your notification service
  console.log(`Sending notifications to ${donors.length} matching donors`);
}

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: [
          "requester_name",
          "requester_email",
          "blood_type_requested",
          "urgency_level",
          "phone_number",
          "country_code",
          "location",
          "request_date",
        ],
        properties: {
          requester_name: { type: "string" },
          requester_email: { type: "string", format: "email" },
          request_date: { type: "string", format: "date-time" },
          blood_type_requested: { type: "string" },
          urgency_level: { type: "string" },
          description: { type: "string" },
          phone_number: { type: "string" },
          country_code: { type: "string" },
          location: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const newRequest = await fastify.prisma.requests.create({
          data: {
            requester_name: request.body.requester_name,
            requester_email: request.body.requester_email,
            request_date: new Date(request.body.request_date),
            blood_type_requested: request.body.blood_type_requested,
            urgency_level: request.body.urgency_level,
            description: request.body.description,
            phone_number: request.body.phone_number,
            country_code: request.body.country_code,
            location: request.body.location,
            created_at: new Date(),
            modified_at: new Date(),
          },
        });

        const matchingDonors = await findMatchingDonors(fastify, newRequest);
        await sendNotificationsToMatchingDonors(
          fastify,
          matchingDonors,
          newRequest
        );

        reply.code(201).send({
          message: "Blood request created successfully and notifications sent",
          request: newRequest,
        });
      } catch (error) {
        reply.code(500).send({
          message: "Error processing blood request",
          error: error.message,
        });
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });
};
