module.exports = {
  userSchema: {
    type: "object",
    required: ["user_id", "user_name", "handle", "picture"],
    properties: {
      user_id: { type: "number", description: "Unique identifier" },
      user_name: { type: "string", description: "User's display name" },
      handle: { type: "string", description: "User's @handle for mentions" },
      picture: {
        type: "string",
        format: "uri",
        description: "URL of user's picture",
      },
    },
  },
};
