const { analyzeCommits: ac } = require("./src/commit-analyzer");
const { generateNotes: gn } = require("./src/release-notes-generator");
const { validateStrategy, getStrategies } = require("./src/utils");

const analyzeCommits = async (pluginConfig, context) => {
  const { commitAnalyzerConfig, strategy: inputStrategy } = pluginConfig;
  const strategy = validateStrategy(inputStrategy);
  if (!strategy) {
    throw new Error(
      `Invalid strategy: ${inputStrategy}. Available options: ${getStrategies().join(
        ", "
      )}`
    );
  }

  return ac(strategy, commitAnalyzerConfig, context);
};

const generateNotes = async (pluginConfig, context) => {
  const { notesGeneratorConfig, strategy: inputStrategy } = pluginConfig;
  const strategy = validateStrategy(inputStrategy);
  if (!strategy) {
    throw new Error(
      `Invalid strategy: ${inputStrategy}. Available options: ${getStrategies().join(
        ", "
      )}`
    );
  }

  return gn(strategy, notesGeneratorConfig, context);
};

module.exports = { generateNotes, analyzeCommits };
