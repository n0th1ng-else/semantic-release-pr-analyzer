const { analyzeCommits: ac } = require("./src/commit-analyzer");
const { generateNotes: gn } = require("./src/release-notes-generator");
const { validateStrategy } = require("./src/utils");
const debug = require("debug")("semantic-release:pr-analyzer");

const analyzeCommits = async (pluginConfig, context) => {
  const { commitAnalyzerConfig, strategy: strtg } = pluginConfig || {};
  debug("Plugin config", JSON.stringify(pluginConfig));
  const strategy = validateStrategy(strtg);
  return ac(strategy, { ...pluginConfig, ...commitAnalyzerConfig }, context);
};

const generateNotes = async (pluginConfig, context) => {
  const { notesGeneratorConfig, strategy: strtg } = pluginConfig || {};
  debug("Plugin config", JSON.stringify(pluginConfig));
  const strategy = validateStrategy(strtg);
  return gn(strategy, { ...pluginConfig, ...notesGeneratorConfig }, context);
};

module.exports = { generateNotes, analyzeCommits };
