"use strict";

const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post("/create", {
    schema: {
      tags: ["Main"],
      consumes: ["multipart/form-data"],
    },
    handler: async (request, reply) => {
      console.log("Handler started");

      try {
        console.log("Parsing parts");
        const parts = request.parts();

        const fields = {};
        let imageFile;

        console.log("Iterating over parts");
        for await (const part of parts) {
          console.log("Processing part:", part.fieldname);
          if (part.type === "file") {
            if (
              part.mimetype === "image/jpeg" ||
              part.mimetype === "image/png"
            ) {
              imageFile = part;
              console.log(
                "File received:",
                imageFile.filename,
                "Mimetype:",
                imageFile.mimetype
              );
            } else {
              throw new Error(
                "Invalid file type. Only JPEG and PNG are allowed."
              );
            }
          } else {
            fields[part.fieldname] = part.value;
          }
        }

        console.log("Parsed fields:", fields);

        let image_url = null;
        if (imageFile) {
          console.log("Uploading image");
          try {
            image_url = await fastify.uploadImage(imageFile);
            console.log("Image uploaded successfully. URL:", image_url);
          } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            throw uploadError;
          }
        }

        console.log("Creating event post");
        const newEventPost = await fastify.prisma.event_posts.create({
          data: {
            hospital_id: parseInt(fields.hospital_id),
            title: fields.title,
            start_time: new Date(fields.start_time),
            end_time: new Date(fields.end_time),
            location: fields.location,
            description: fields.description,
            image_url,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        console.log("Event post created:", newEventPost);

        console.log("Sending response");
        reply.code(201).send(newEventPost);
      } catch (error) {
        console.error("Error in handler:", error);
        reply.code(500).send({ error: error.message });
      }
    },
  });

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
      const { id } = request.params;
      const eventPost = await fastify.prisma.event_posts.findUnique({
        where: { id: parseInt(id) },
      });

      if (!eventPost) {
        reply.code(404).send({ error: "Event post not found" });
      } else {
        reply.send(eventPost);
      }
    },
  });

  fastify.get("/browse", {
    schema: {
      tags: ["Main"],
      querystring: {
        type: "object",
        properties: {
          hospital_id: { type: "integer" },
          limit: { type: "integer", default: 10 },
          offset: { type: "integer", default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { hospital_id, limit = 10, offset = 0 } = request.query;

      const eventPosts = await fastify.prisma.event_posts.findMany({
        where: hospital_id ? { hospital_id: parseInt(hospital_id) } : {},
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { start_time: "asc" },
      });

      reply.send(eventPosts);
    },
  });

  fastify.put("/:id", {
    schema: {
      tags: ["Main"],
      consumes: ["multipart/form-data"],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "integer" },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;

      const parts = request.parts();

      const fields = {};
      let imageFile;

      for await (const part of parts) {
        if (part.type === "file") {
          imageFile = part;
        } else {
          fields[part.fieldname] = part.value;
        }
      }

      let image_url = null;
      if (imageFile) {
        image_url = await fastify.uploadImage(imageFile);
      }

      const { title, start_time, end_time, location, description } = fields;

      const updatedEventPost = await fastify.prisma.event_posts.update({
        where: { id: parseInt(id) },
        data: {
          title,
          start_time: start_time ? new Date(start_time) : undefined,
          end_time: end_time ? new Date(end_time) : undefined,
          location,
          description,
          image_url: image_url || undefined,
          modified_at: moment().toISOString(),
        },
      });

      reply.send(updatedEventPost);
    },
  });

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
      const { id } = request.params;
      await fastify.prisma.event_posts.delete({
        where: { id: parseInt(id) },
      });
      reply.code(204).send();
    },
  });
};
