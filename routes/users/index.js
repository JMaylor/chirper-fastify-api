"use strict";

const { userSchema } = require("./schema");

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
          items: userSchema,
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
        required: ["user_name", "handle", "picture"],
        properties: userSchema.properties,
      },
      response: {
        201: userSchema,
      },
    },
    preValidation: fastify.authenticate,
    handler: async (req, reply) => {
      const client = await fastify.pg.connect();

      const { user_name, handle, picture } = req.body;
      const email = req.user["https://chirper.api/email"];
      const { sub } = req.user;
      const {
        rows: [user],
      } = await client.query(
        "INSERT INTO user_account(email, sub, user_name, handle, picture) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, sub, user_name, handle, picture;",
        [email, sub, user_name, handle, picture]
      );

      client.release();
      reply.status(201).send(user);
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
        properties: userSchema.properties,
      },
      response: {
        200: userSchema,
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
