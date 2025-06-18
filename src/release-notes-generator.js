import getStream from "get-stream";
import intoStream from "into-stream";
import { sync as parser } from "conventional-commits-parser";
import filter from "conventional-commits-filter";
import writer from "conventional-changelog-writer";

import loadChangelogConfig from "./lib/load-changelog-config.js";
import { getCommit } from "./utils.js";

import debugFactory from "debug";
const debug = debugFactory(
  "semantic-release:pr-analyzer:release-notes-generator"
);

export async function generateNotes(strategy, pluginConfig, context) {
  const commit = await getCommit(strategy, context.commits);

  const { parserOpts, writerOpts } = await loadChangelogConfig(
    pluginConfig,
    context
  );

  const changelogContext = {
    version: context.nextRelease.version,
  };

  const parsedCommits = filter(
    [commit]
      .filter(({ message, hash }) => {
        if (!message.trim()) {
          debug("Skip commit %s with empty message", hash);
          return false;
        }

        return true;
      })
      .map((rawCommit) => ({
        ...rawCommit,
        ...parser(rawCommit.message, {
          ...parserOpts,
        }),
      }))
  );

  return getStream(
    intoStream.object(parsedCommits).pipe(writer(changelogContext, writerOpts))
  );
}
