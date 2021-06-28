"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("fastify-swagger"), {
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "maylor.io Fastify API",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost:3000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      // tags: [
      //   { name: "user", description: "User related end-points" },
      //   { name: "code", description: "Code related end-points" },
      // ],
      // definitions: {
      //   User: {
      //     type: "object",
      //     required: ["id", "email"],
      //     properties: {
      //       id: { type: "string", format: "uuid" },
      //       firstName: { type: "string" },
      //       lastName: { type: "string" },
      //       email: { type: "string", format: "email" },
      //     },
      //   },
      // },
      // securityDefinitions: {
      //   apiKey: {
      //     type: "apiKey",
      //     name: "apiKey",
      //     in: "header",
      //   },
      // },
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });
});
