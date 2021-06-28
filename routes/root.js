"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Healthcheck"],
      description:
        "Healthcheck endpoint to determine if service is up and running",
      response: {
        200: {
          type: "object",
          properties: {
            status: {
              type: "string",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    handler: (req, reply) => {
      return { status: "ok", timestamp: new Date().toISOString() };
    },
  });
};
