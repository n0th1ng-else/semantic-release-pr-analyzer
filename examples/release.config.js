const getConfig = (runInPRContext) => {
  // In the pull-request action we only use semantic-release-pr-analyzer plugin
  if (runInPRContext) {
    return {
      plugins: ["semantic-release-pr-analyzer"],
    };
  }

  // Default configuration for the real release workflow
  return {
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/npm",
      "@semantic-release/github",
    ],
  };
};

const runInPRContext = Boolean(process.env.GITHUB_PR_NUMBER);

module.exports = getConfig(runInPRContext);
