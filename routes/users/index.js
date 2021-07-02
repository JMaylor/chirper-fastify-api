"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Users"],
      description: "Get all users",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            required: ["user_id", "user_name", "handle", "picture"],
            properties: {
              user_id: { type: "number", description: "Unique identifier" },
              user_name: { type: "string", description: "User's display name" },
              handle: {
                type: "string",
                description: "User's @handle for mentions",
              },
              picture: {
                type: "string",
                format: "uri",
                description: "URL of user's picture",
              },
            },
          },
        },
      },
    },
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(
        "SELECT user_id, email, user_name, handle, picture FROM user_account;"
      );
      client.release();
      reply.send(rows);
    },
  });

  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Users"],
      description: "Create a user",
      body: {
        type: "object",
        required: ["user_name", "handle", "picture", "bio"],
        properties: {
          user_name: { type: "string", description: "User's display name" },
          handle: {
            type: "string",
            description: "User's @handle for mentions",
          },
          picture: {
            type: "string",
            format: "uri",
            description: "URL of user's picture",
          },
          bio: {
            type: "string",
            description: "Bio to be displayed on User's page",
          },
        },
      },
      response: {
        201: {
          type: "object",
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();

      const { user_name, handle, picture, bio } = req.body;
      const email = req.user["https://chirper.api/email"];
      const { sub } = req.user;
      const {
        rows: [user],
      } = await client.query(
        "INSERT INTO user_account(email, sub, user_name, handle, picture, bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, sub, user_name, handle, picture;",
        [email, sub, user_name, handle, picture, bio]
      );

      client.release();
      reply.status(201).send();
    },
  });
};
