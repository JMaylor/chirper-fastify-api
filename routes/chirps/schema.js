module.exports = {
  chirpSchema: {
    type: "object",
    // required: ["chirp_id", "author_email", "body", "hashtags"],
    properties: {
      chirp_id: { type: "number", description: "Unique identifier" },
      author_email: { type: "string", description: "User email" },
      body: { type: "string", description: "Chirp content" },
      hashtags: {
        type: "array",
        items: { type: "string", description: "Hashtag IDs" },
      },
    },
  },
};
