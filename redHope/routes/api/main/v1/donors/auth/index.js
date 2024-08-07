"use strict";
const moment = require("moment");
const bcrypt = require("bcrypt");

module.exports = async function (fastify, opts) {
  fastify.post("/register", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: [
          "name",
          "email",
          "password",
          "address",
          "phone_number",
          "country_code",
          "blood_type",
          "fcm_token", // Add this line
        ],
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
          address: { type: "string" },
          phone_number: { type: "string" },
          country_code: { type: "string" },
          blood_type: { type: "string" },
          fcm_token: { type: "string" }, // Add this line
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const donor = await fastify.prisma.donors.findUnique({
          where: {
            email: request.body.email,
          },
        });
        if (donor) {
          throw new Error("The email already exists!");
        }
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(request.body.password, salt);

        const donor_user = await fastify.prisma.donors.create({
          data: {
            name: request.body.name,
            email: request.body.email,
            password: password,
            address: request.body.address,
            phone_number: request.body.phone_number,
            country_code: request.body.country_code,
            blood_type: request.body.blood_type,
            fcm_token: request.body.fcm_token, // Add this line
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        let token = {};
        let newDonor = {};
        const accessToken = fastify.jwt.sign({
          id: donor_user.id,
          role: "Donor",
          email: donor_user.email,
        });
        const refreshToken = await fastify.token.create({
          email: donor_user.email,
        });
        token.access = accessToken;
        token.refresh = refreshToken;
        newDonor.name = donor_user.name;
        newDonor.address = donor_user.address;
        newDonor.phone_number = donor_user.phone_number;
        newDonor.country_code = donor_user.country_code;
        newDonor.blood_type = donor_user.blood_type;
        newDonor.fcm_token = donor_user.fcm_token; // Add this line
        reply.send(newDonor);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });

  fastify.post("/login", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const donor = await fastify.prisma.donors.findUnique({
          where: { email: request.body.email },
        });

        if (!donor) {
          throw new Error("Invalid email or password");
        }

        const validPassword = await bcrypt.compare(
          request.body.password,
          donor.password
        );
        if (!validPassword) {
          throw new Error("Invalid email or password");
        }

        const token = fastify.jwt.sign({
          id: donor.id,
          email: donor.email,
          role: "donor",
        });

        reply.send({
          id: donor.id,
          name: donor.name,
          email: donor.email,
          blood_type: donor.blood_type,
          token: token,
        });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    },
  });

  fastify.post("/refresh", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const donor_token = await fastify.prisma.user_tokens.findUnique({
          where: {
            token: request.body.refresh_token,
          },
        });
        if (!donor_token) {
          throw new Error("Invalid refresh token.");
        }
        const create_date = moment(donor_token.created_at);
        const now = moment();
        const diffInDays = now.diff(create_date, "days");
        if (diffInDays > 30) {
          throw new Error("Refresh token has been expired.");
        }
        const donor = await fastify.prisma.donors.findUnique({
          where: {
            email: donor_token.email,
          },
        });
        if (!donor.is_active) {
          throw new Error("This user is not active.");
        }
        let token = {};
        const accessToken = fastify.jwt.sign({
          id: donor.id,
          role: "Donor",
          email: donor.email,
          name: donor.name,
        });
        const refreshToken = request.body.refresh_token;
        token.access = accessToken;
        token.refresh = refreshToken;
        donor.token = token;
        delete donor.is_active;
        delete donor.created_at;
        reply.send(donor);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });

  fastify.post("/updateFCMToken", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["donorId", "fcmToken"],
        properties: {
          donorId: { type: "integer" },
          fcmToken: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { donorId, fcmToken } = request.body;
        const donor = await fastify.prisma.donors.findUnique({
          where: { id: donorId },
        });
        if (!donor) {
          return reply.code(404).send({
            message: "Donor not found",
            error: `No donor found with id ${donorId}`,
          });
        }
        await fastify.prisma.donors.update({
          where: { id: donorId },
          data: { fcm_token: fcmToken },
        });
        reply.send({ message: "FCM token updated successfully" });
      } catch (error) {
        reply.code(500).send({
          message: "Error updating FCM token",
          error: error.message,
        });
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });

  fastify.post("/logout", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const donor_token = await fastify.prisma.user_tokens.findUnique({
          where: {
            token: request.body.refresh_token,
          },
        });
        if (!donor_token) {
          throw new Error("Invalid refresh token.");
        }
        const refreshToken = await fastify.token.delete({
          token: request.body.refresh_token,
        });
        reply.send(refreshToken);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });
};
