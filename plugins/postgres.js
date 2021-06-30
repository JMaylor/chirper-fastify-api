"use strict";

const fp = require("fastify-plugin");

/**
 * This plugin connects to postgres database
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("fastify-postgres"), {
    connectionString: process.env.DATABASE_URL,
  });
});
