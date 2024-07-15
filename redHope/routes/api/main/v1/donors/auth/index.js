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
        ],
        properties: {
          name: {
            type: "string",
          },
          email: {
            type: "string",
          },
          password: {
            type: "string",
          },
          address: {
            type: "string",
          },
          phone_number: {
            type: "string",
          },
          country_code: {
            type: "string",
          },
          blood_type: {
            type: "string",
          },
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
          throw new Error("The email already Exist!!");
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
            created_at: moment().toISOString(),
            updated_at: moment().toISOString(),
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

        reply.send(newDonor);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });
};
