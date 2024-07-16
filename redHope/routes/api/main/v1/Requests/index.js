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
          "request_date",
          "location",
        ],
        properties: {
          requester_name: { type: "string" },
          requester_email: { type: "string" },
          request_date: { type: "timestamp" },
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
            request_date: request.body.request_date,
            blood_type_requested: request.body.blood_type_requested,
            urgency_level: request.body.urgency_level,
            description: request.body.description,
            phone_number: request.body.phone_number,
            country_code: request.body.country_code,
            location: request.body.location,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
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

async function findMatchingDonors(fastify, request) {
  const donors = await fastify.prisma.donors.findMany({
    where: {
      blood_type: request.blood_type_requested,
      NOT: {
        deleted_at: { not: null },
      },
    },
  });

  return donors.filter((donor) =>
    addressMatches(donor.address, request.location)
  );
}

function addressMatches(donorAddress, requestLocation) {
  const donorWords = donorAddress.toLowerCase().split(/\s+/);
  const requestWords = requestLocation.toLowerCase().split(/\s+/);
  return donorWords.some((word) => requestWords.includes(word));
}

async function sendNotificationsToMatchingDonors(
  fastify,
  matchingDonors,
  request
) {
  const admin = fastify.firebase;

  for (const donor of matchingDonors) {
    const fcmToken = await getFCMToken(fastify, donor.id);

    if (fcmToken) {
      const message = {
        notification: {
          title: "Urgent Blood Request",
          body: `Your blood type ${request.blood_type_requested} is needed near you!`,
        },
        data: {
          requestId: request.id.toString(),
          bloodType: request.blood_type_requested,
          location: request.location,
        },
        token: fcmToken,
      };

      try {
        await admin.messaging().send(message);
        console.log(`Notification sent to donor ${donor.id}`);
      } catch (error) {
        console.error(
          `Error sending notification to donor ${donor.id}:`,
          error
        );
      }
    }
  }
}

async function getFCMToken(fastify, donorId) {
  const donor = await fastify.prisma.donors.findUnique({
    where: { id: donorId },
    select: { fcm_token: true },
  });
  return donor?.fcm_token || null;
}
