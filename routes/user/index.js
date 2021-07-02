"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/me",
    schema: {
      tags: ["Users"],
      description: "Get profile of logged in user",
      response: {
        200: {
          type: "object",
          required: ["user_id", "user_name", "handle", "picture", "bio"],
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
            bio: {
              type: "string",
              description: "Bio to be displayed on User's page",
            },
          },
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const email = req.user["https://chirper.api/email"];
      const client = await fastify.pg.connect();
      const {
        rows: [user],
      } = await client.query(
        "SELECT user_id, user_name, handle, picture, bio FROM user_account WHERE user_account.email = $1;",
        [email]
      );
      client.release();
      if (user) reply.send(user);
      else reply.status(404).send();
    },
  });

  fastify.route({
    method: "GET",
    url: "/handle/:handle",
    schema: {
      tags: ["Users"],
      description: "Get user profile by handle",
      response: {
        200: {
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
            bio: {
              type: "string",
              description: "Bio to be displayed on User's page",
            },
          },
        },
      },
    },
    handler: async (req, reply) => {
      const { handle } = req.params;
      const client = await fastify.pg.connect();
      const {
        rows: [user],
      } = await client.query(
        "SELECT user_id, user_name, handle, picture, bio FROM user_account WHERE user_account.handle = $1;",
        [handle]
      );
      client.release();
      if (user) reply.send(user);
      else reply.status(404).send();
    },
  });

  fastify.route({
    method: "PUT",
    url: "/",
    schema: {
      tags: ["Users"],
      description: "Update a user",
      body: {
        type: "object",
        required: ["user_name", "picture"],
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
      response: {
        200: {
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
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();

      const { user_name, picture } = req.body;
      const email = req.user["https://chirper.api/email"];
      const {
        rows: [user],
      } = await client.query(
        "UPDATE user_account SET user_name = $1, picture = $2 WHERE email = $3 RETURNING user_id, sub, email, user_name, handle, picture",
        [user_name, picture, email]
      );

      client.release();
      reply.send(user);
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/",
    schema: {
      tags: ["Users"],
      description: "Delete a user",
      response: {
        204: {
          type: "string",
          default: "No Content",
        },
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();
      const email = req.user["https://chirper.api/email"];
      await client.query("DELETE FROM user_account WHERE email = $1;", [email]);

      client.release();
      reply.status(204).send();
    },
  });
};
