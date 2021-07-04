"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Comments"],
      description: "Create a comment",
      body: {
        type: "object",
        required: ["chirp_id", "body"],
        properties: {
          body: { type: "string", description: "Comment content" },
          chirp_id: {
            type: "number",
            description: "ID of chirp to add comment to",
          },
        },
      },
      response: {
        201: {
          type: "object",
          required: ["comment_id", "created_at", "chirp", "body"],
          properties: {
            comment_id: { type: "number", description: "Unique identifier" },
            created_at: { type: "number" },
            chirp: {
              type: "number",
              description: "id of chirp the comment was added to",
            },
            body: { type: "string", description: "Comment content" },
          },
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();
      const { body, chirp_id } = req.body;
      const email = req.user["https://chirper.api/email"];

      // create the chirp
      const {
        rows: [comment],
      } = await client.query(
        `INSERT INTO chirp_comment(author_email, chirp, body) 
        VALUES ($1, $2, $3)
        RETURNING created_at, comment_id, chirp, body;`,
        [email, chirp_id, body]
      );

      client.release();
      reply.status(201).send(comment);
    },
  });
};
