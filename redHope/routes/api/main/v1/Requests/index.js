"use strict";
const moment = require("moment");

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
        ],
        properties: {
          requester_name: { type: "string" },
          requester_email: { type: "string", format: "email" },
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

        const matchingDonors = await fastify.prisma.donors.findMany({
          where: {
            blood_type: request.body.blood_type_requested,
          },
          select: {
            fcm_token: true,
          },
        });

        const fcmTokens = matchingDonors
          .map((donor) => donor.fcm_token)
          .filter(Boolean);

        if (fcmTokens.length > 0) {
          const message = {
            notification: {
              title: "Urgent Blood Request",
              body: `A request for ${request.body.blood_type_requested} blood type has been made in your area.`,
            },
            data: {
              url: "/donor_dashboard",
            },
            webpush: {
              fcm_options: {
                link: "/donor_dashboard",
              },
              headers: {
                Urgency: "high",
              },
              notification: {
                icon: "/path-to-your-icon.png",
                click_action: "/donor_dashboard",
              },
            },
            tokens: fcmTokens,
          };

          try {
            const response = await fastify.firebase
              .messaging()
              .sendMulticast(message);
            console.log("Successfully sent messages:", response.successCount);
          } catch (error) {
            console.log("Error sending messages:", error);
          }
        }

        reply.code(201).send({
          message: "Blood request created successfully and notifications sent",
          request: newRequest,
        });
      } catch (error) {
        reply.code(500).send({
          message: "Error processing blood request",
          error: error.message,
        });
      }
    },
  });

  fastify.get("/notification", {
    schema: {
      tags: ["Main"],
      querystring: {
        type: "object",
        properties: {
          blood_type: { type: "string" },
          urgency_level: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { blood_type, urgency_level } = request.query;

        let whereClause = {};
        if (blood_type) {
          whereClause.blood_type_requested = blood_type;
        }
        if (urgency_level) {
          whereClause.urgency_level = urgency_level;
        }

        const requests = await fastify.prisma.requests.findMany({
          where: whereClause,
          orderBy: {
            created_at: "desc",
          },
        });

        reply.send(requests);
      } catch (error) {
        reply.code(500).send({
          message: "Error fetching blood requests",
          error: error.message,
        });
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });
};
