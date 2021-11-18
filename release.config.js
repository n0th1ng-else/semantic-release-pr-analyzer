const { analyzeCommits, generateNotes } = require(".");

const getConfig = () => {
  return {
    plugins: [
      [
        {
          analyzeCommits,
          generateNotes,
        },
        {
          strategy: "pull-request",
          commitAnalyzerConfig: {
            preset: "eslint",
          },
          notesGeneratorConfig: {
            preset: "eslint",
          },
        },
      ],
    ],
  };
};

module.exports = getConfig();
