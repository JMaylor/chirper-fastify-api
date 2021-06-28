"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Likes"],
      description: "Like/dislike a chirp",
      body: {
        type: "object",
        required: ["chirp", "liked"],
        properties: {
          chirp: {
            type: "number",
            description: "ID of the chirp to be liked/disliked",
          },
          liked: {
            type: "boolean",
            description: "new like value (true/false)",
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
      const { chirp, liked } = req.body;

      // create the like
      const { rows } = await client.query(
        "INSERT INTO chirpstat(user_email, chirp, liked) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT chirpstat_user_email_chirp_key DO UPDATE SET liked = $3;",
        [email, chirp, liked]
      );
      console.log(rows);

      client.release();
      reply.status(201).send(rows);
    },
  });
};
