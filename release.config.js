module.exports = {
  branches: [
    "main",
    {
      name: "!(main)",
      channel: "early",
      prerelease: true,
    },
  ],
};
