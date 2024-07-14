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

  fastify.post("/login", {
    schema: {
      tags: ["Main"],
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
          },
          password: {
            type: "string",
          },
        },
      },
    },

    handler: async (request, reply) => {
      try {
        const hospitals = await fastify.prisma.hospitals.findUnique({
          where: {
            email: request.body.email,
          },
          select: {
            id: true,
            email: true,
            password: true,
            // is_active: true,
            name: true,
            phone_number: true,
            address: true,
          },
        });
        if (!hospitals) {
          throw new Error("Incorrect Email or Password!");
        }
        // if (!hospitals.is_active) {
        //     throw new Error("The User is not Active");
        //   }

        const validation = await bcrypt.compare(
          request.body.password,
          hospitals.password
        );
        if (!validation) {
          throw new Error("Incorrect Email or Password!");
        }

        let token = {};
        let hospital_user = {};
        const accessToken = fastify.jwt.sign({
          id: hospitals.id,
          role: "Hospital",
          email: hospitals.email,
        });
        const refreshToken = await fastify.token.create({
          email: hospitals.email,
        });

        token.access = accessToken;
        token.refresh = refreshToken;
        hospital_user.token = token;
        hospital_user.name = hospitals.name;
        hospital_user.phone_number = hospitals.phone_number;
        hospital_user.address = hospitals.address;
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });

  fastify.post("/refresh", {
    preValidation: [fastify.isHospital],
    schema: {
      tags: ["Main"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: {
            type: "string",
          },
        },
      },
    },

    handler: async (request, reply) => {
      try {
        const hospital_token = await fastify.prisma.user_tokens.findUnique({
          where: {
            token: request.body.refresh_token,
          },
        });

        if (!hospital_token) {
          throw new Error("Invalid refresh token!");
        }

        const create_date = moment(hospital_token.created_at);
        const now = moment();

        const diffInDays = now.diff(create_date, "days");
        if (diffInDays > 30) {
          throw new Error("Refresh token has been expired.");
        }
        const hospitals = await fastify.prisma.hospitals.findUnique({
          where: {
            email: hospital_token.email,
          },
          select: {
            id: true,
            //   is_active: true,
            email: true,
            name: true,
            phone_number: true,
            address: true,
          },
        });
        // if (!hospitals.is_active) {
        //     throw new Error("This user is not active!");
        //   }
        let token = {};
        let user = {};
        const accessToken = fastify.jwt.sign({
          id: hospitals.id,
          role: "Hospital",
          email: hospitals.email,
        });
        const refreshToken = request.body.refresh_token;
        token.access = accessToken;
        token.referesh = refreshToken;
        hospital_user.token = token;
        hospital_user.name = hospitals.name;
        hospital_user.phone_number = hospitals.phone_number;
        hospital_user.address = hospitals.address;
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    },
  });
};
