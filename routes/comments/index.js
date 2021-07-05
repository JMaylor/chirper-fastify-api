"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/",
    query: {
      type: "object",
      properties: {
        chirpId: {
          type: "number",
        },
        timestamp: {
          type: "number",
        },
      },
    },
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
      const { chirpId } = req.query;
      const timestamp = req.query.timestamp || 0;

      const client = await fastify.pg.connect();
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
        WHERE 
          chirp_comment.chirp = $1 AND 
          ((extract(epoch from created_at) *1000)::bigint < $2 OR $2 = 0)
        ORDER BY created_at DESC
        LIMIT 3;`,
        [chirpId, timestamp]
      );

      client.release();
      reply.status(200).send(rows);
    },
  });
};
