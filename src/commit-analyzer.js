const { analyzeCommits: ac } = require("@semantic-release/commit-analyzer");
const { getCommit } = require("./utils");

const analyzeCommits = async (strategy, pluginConfig, context) => {
  const commit = await getCommit(strategy, context.commits);

  return ac(pluginConfig, { ...context, commits: [commit] });
};

module.exports = { analyzeCommits };
