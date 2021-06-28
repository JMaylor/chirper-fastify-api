"use strict";

const fp = require("fastify-plugin");

/**
 * This plugin connects to postgres database
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("fastify-auth0-verify"), {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  });
});
