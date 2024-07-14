"use strict";
const moment = require("moment");
const bcrypt = require("bcrypt");

module.exports = async function (fastify, opts) {
  fastify.post("/register", {
    schema: {
      tags: ["hospital", "auth"],
      body: {
        type: "object",
        required: [
          "name",
          "email",
          "password",
          "phone_number",
          "country_code",
          "address",
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
          phone_number: {
            type: "string",
          },
          country_code: {
            type: "string",
          },
          address: {
            type: "string",
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const existingHospital = await fastify.hospitals.findUnique({
          where: {
            email: request.body.email,
          },
        });

        if (existingHospital) {
          throw new Error("The email already Exist!!");
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(request.body.password, salt);
        const hospitals = await fastify.prisma.hospitals.create({
          data: {
            email: request.body.email,
            password: password,
            name: request.body.name,
            phone_number: request.body.phone_number,
            country_code: request.body.country_code,
            address: request.body.address,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        let token = {};
        let hospital_user = {};

        const accessToken = fastify.jwt.sign({
          id: hospitals.id,
          role: "Hospital",
          email: hospitals.email,
          name: hospitals.name,
        });
        const refreshToken = await fastify.token.create({
          email: jp_user.email,
        });

        token.access = accessToken;
        token.refresh = refreshToken;
        hospital_user.token = token;
        hospital_user.name = hospitals.name;
        hospital_user.phone_number = hospitals.phone_number;
        hospital_user.address = hospitals.address;

        reply.send(user);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });
};
