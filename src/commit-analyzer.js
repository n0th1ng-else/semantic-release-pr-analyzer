import { analyzeCommits as ac } from "@semantic-release/commit-analyzer";
import { getCommit } from "./utils.js";

import debugFactory from "debug";
const debug = debugFactory("semantic-release:pr-analyzer:commit-analyzer");

export async function analyzeCommits(strategy, pluginConfig, context) {
  debug("strategy: " + JSON.stringify(strategy));
  debug("pluginConfig: " + JSON.stringify(pluginConfig));

  debug("commit: utils.getCommit()");
  const commit = await getCommit(strategy, context.commits);
  debug("commit: " + JSON.stringify(commit));
  debug("commit.message: " + commit.message);

  debug("Run @semantic-release/commit-analyzer");
  return ac(pluginConfig, { ...context, commits: [commit] });
}
