const getStream = require("get-stream");
const intoStream = require("into-stream");
const { sync: parser } = require("conventional-commits-parser");
const writer = require("conventional-changelog-writer");
const filter = require("conventional-commits-filter");
const loadChangelogConfig = require("@semantic-release/release-notes-generator/lib/load-changelog-config");
const { getCommit } = require("./utils");

const generateNotes = async (strategy, pluginConfig, context) => {
  const commit = await getCommit(strategy, context.commits);

  const { parserOpts, writerOpts } = await loadChangelogConfig(
    pluginConfig,
    context,
  );

  const parsedCommits = filter([
    {
      ...commit,
      ...parser(commit.message, {
        ...parserOpts,
      }),
    },
  ]);

  const changelogContext = {
    version: context.nextRelease.version,
  };

  return getStream(
    intoStream.object(parsedCommits).pipe(writer(changelogContext, writerOpts)),
  );
};

module.exports = { generateNotes };
