import { analyzeCommits as ac } from "./src/commit-analyzer.js";
import { generateNotes as gn } from "./src/release-notes-generator.js";
import { validateStrategy } from "./src/utils.js";

import debugFactory from "debug";
const debug = debugFactory("semantic-release:pr-analyzer");

export async function analyzeCommits(pluginConfig, context) {
  debug("analyzeCommits() - pluginConfig: " + JSON.stringify(pluginConfig));

  const { commitAnalyzerConfig, strategy: strtg } = pluginConfig || {};
  const strategy = validateStrategy(strtg);
  debug("analyzeCommits() - commitAnalyzerConfig: " + JSON.stringify(commitAnalyzerConfig));
  debug("analyzeCommits() - strategy: " + strategy);

  return ac(strategy, { ...pluginConfig, ...commitAnalyzerConfig }, context);
}

export async function generateNotes(pluginConfig, context) {
  const { notesGeneratorConfig, strategy: strtg } = pluginConfig || {};
  const strategy = validateStrategy(strtg);
  return gn(strategy, { ...pluginConfig, ...notesGeneratorConfig }, context);
}
