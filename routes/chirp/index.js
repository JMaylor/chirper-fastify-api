"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/:chirpId",
    schema: {
      tags: ["Chirps"],
      description: "Get a specific chirp",
      response: {
        200: {
          type: "object",
          required: [
            "chirp_id",
            "created_at",
            "body",
            "hashtags",
            "user_name",
            "handle",
            "picture",
            "liked",
            "rechirped",
          ],
          properties: {
            chirp_id: { type: "number", description: "Unique identifier" },
            created_at: { type: "number" },
            body: { type: "string", description: "Chirp content" },
            user_name: { type: "string" },
            handle: { type: "string" },
            picture: { type: "string" },
            liked: { type: "boolean" },
            rechirped: { type: "boolean" },
            likes: { type: "number" },
            rechirps: { type: "number" },
          },
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const email = req.user["https://chirper.api/email"];
      const { chirpId } = req.params;

      const client = await fastify.pg.connect();
      const {
        rows: [chirp],
      } = await client.query(
        `SELECT * FROM chirp_details($1) WHERE chirp_id = $2;`,
        [email, chirpId]
      );
      client.release();

      reply.send(chirp);
    },
  });
};
