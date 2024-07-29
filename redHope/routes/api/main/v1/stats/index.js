"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/counts", {
    schema: {
      tags: ["Stats"],
      querystring: {
        start_date: { type: "string", format: "date" },
        end_date: { type: "string", format: "date" },
        blood_type: { type: "string" },
      },
    },
    handler: async (request, reply) => {
      try {
        const { start_date, end_date, blood_type } = request.query;
        let dateFilter = {};
        let bloodTypeFilter = {};

        if (start_date && end_date) {
          dateFilter = {
            AND: [
              { created_at: { gte: new Date(start_date) } },
              { created_at: { lte: new Date(end_date) } },
            ],
          };
        }

        if (blood_type) {
          bloodTypeFilter = {
            OR: [
              { blood_type: blood_type },
              { blood_type_requested: blood_type },
            ],
          };
        }

        const donationCounts = await fastify.prisma.donation_history.groupBy({
          by: ["donation_date"],
          _count: { id: true },
          where: {
            ...dateFilter,
            ...bloodTypeFilter,
          },
        });

        const requestCounts = await fastify.prisma.requests.groupBy({
          by: ["created_at"],
          _count: { id: true },
          where: {
            ...dateFilter,
            ...bloodTypeFilter,
          },
        });

        const dailyCounts = {};

        donationCounts.forEach((item) => {
          const date = item.donation_date.toISOString().split("T")[0];
          if (!dailyCounts[date])
            dailyCounts[date] = { donations: 0, requests: 0 };
          dailyCounts[date].donations = item._count.id;
        });

        requestCounts.forEach((item) => {
          const date = item.created_at.toISOString().split("T")[0];
          if (!dailyCounts[date])
            dailyCounts[date] = { donations: 0, requests: 0 };
          dailyCounts[date].requests = item._count.id;
        });

        reply.send({ dailyCounts });
      } catch (error) {
        console.error("Error fetching counts:", error);
        reply.code(500).send({ error: "Failed to fetch counts" });
      }
    },
  });
};
