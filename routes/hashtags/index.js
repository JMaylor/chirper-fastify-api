"use strict";

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/search/:query",
    schema: {
      tags: ["Hashtags"],
      description: "Get all live hashtags including a queried string",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            required: ["tag"],
            properties: {
              tag: { type: "string" },
            },
          },
        },
      },
    },
    handler: async (req, reply) => {
      const { query } = req.params;
      console.log(req.params);

      const client = await fastify.pg.connect();
      const { rows } = await client.query(
        "SELECT tag FROM hashtag WHERE tag LIKE '%' || $1 || '%';",
        [query]
      );
      client.release();

      reply.send(rows);
    },
  });
};
