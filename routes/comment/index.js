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

      // create the comment
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

  fastify.route({
    method: "GET",
    url: "/:chirpId",
    schema: {
      tags: ["Comments"],
      description: "Get all comments for a particular chirp",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            required: [
              "comment_id",
              "created_at",
              "body",
              "user_name",
              "handle",
              "picture",
            ],
            properties: {
              comment_id: { type: "number", description: "Unique identifier" },
              created_at: { type: "number" },
              body: { type: "string", description: "comment body" },
              user_name: { type: "string" },
              handle: { type: "string" },
              picture: { type: "string" },
            },
          },
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();
      const { chirpId } = req.params;

      // create the comment
      const { rows } = await client.query(
        `SELECT
          created_at,
          comment_id,
          body,
          user_name,
          handle,
          picture
        FROM chirp_comment
        JOIN user_account on chirp_comment.author_email = user_account.email
        WHERE chirp_comment.chirp = $1;`,
        [chirpId]
      );

      client.release();
      reply.status(200).send(rows);
    },
  });
};
