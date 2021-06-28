"use strict";

const { chirpSchema } = require("./schema");

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Chirps"],
      description: "Get all chirps",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            // required: ["chirp_id", "author_email", "body", "hashtags"],
            properties: {
              chirp_id: { type: "number", description: "Unique identifier" },
              body: { type: "string", description: "Chirp content" },
              user_name: { type: "string" },
              handle: { type: "string" },
              picture: { type: "string" },
              liked: { type: "boolean" },
              rechirped: { type: "boolean" },
            },
          },
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      // console.log(fastify.jwt.verify());
      const email = req.user["https://chirper.api/email"];
      const client = await fastify.pg.connect();
      const { rows } = await client.query(
        "SELECT * FROM chirp JOIN user_account ON chirp.author_email = user_account.email LEFT JOIN chirpstat ON chirpstat.user_email = $1 AND chirpstat.chirp = chirp.chirp_id;",
        [email]
      );
      client.release();
      reply.send(rows);
    },
  });

  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Chirps"],
      description: "Create a chirp",
      body: {
        type: "object",
        required: ["body"],
        properties: {
          body: { type: "string", description: "Chirp content" },
        },
      },
      response: {
        201: chirpSchema,
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();
      const { body } = req.body;
      const email = req.user["https://chirper.api/email"];

      // parse chirp body for hashtags
      const hashtags = [
        ...new Set(
          body
            .split(" ")
            .filter((word) => word.charAt() == "#")
            .map((tag) => tag.substring(1))
        ),
      ];

      // create all hashtags
      await Promise.all(
        hashtags.map((tag) =>
          client.query(
            "INSERT INTO hashtag(tag) VALUES ($1) ON CONFLICT (tag) DO NOTHING;",
            [tag]
          )
        )
      );

      // create the chirp
      const {
        rows: [chirp],
      } = await client.query(
        "INSERT INTO chirp(author_email, body, hashtags) VALUES ($1, $2, $3) RETURNING chirp_id, author_email, body, hashtags;",
        [email, body, hashtags]
      );

      client.release();
      reply.status(201).send(chirp);
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:chirp_id",
    schema: {
      tags: ["Chirps"],
      description: "Delete a chirp",
      params: {
        type: "object",
        required: ["chirp_id"],
        properties: {
          chirp_id: { type: "number" },
        },
      },
      response: {
        204: {
          type: "string",
          default: "No Content",
        },
      },
    },
    handler: async (req, reply) => {
      const { chirp_id } = req.params;

      const client = await fastify.pg.connect();
      const { rowCount } = await client.query(
        "DELETE FROM chirp WHERE chirp_id = $1;",
        [chirp_id]
      );
      client.release();

      reply.status(rowCount === 0 ? 404 : 204).send();
    },
  });
};
