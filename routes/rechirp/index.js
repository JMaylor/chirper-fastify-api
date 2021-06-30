"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Rechirps"],
      description: "Rechirp/remove rechirp a chirp",
      body: {
        type: "object",
        required: ["chirp", "rechirped"],
        properties: {
          chirp: {
            type: "number",
            description: "ID of the chirp to be rechirped",
          },
          rechirped: {
            type: "boolean",
            description: "new rechirp value (true/false)",
          },
        },
      },
      response: {
        200: {
          type: "string",
          default: "OK",
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const email = req.user["https://chirper.api/email"];
      const client = await fastify.pg.connect();
      const { chirp, rechirped } = req.body;

      // create the rechirp
      await client.query(
        "INSERT INTO chirpstat(user_email, chirp, rechirped) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT chirpstat_user_email_chirp_key DO UPDATE SET rechirped = $3;",
        [email, chirp, rechirped]
      );

      client.release();
      reply.status(201).send();
    },
  });
};
