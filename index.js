const { Octokit } = require("@octokit/rest");
const getStream = require("get-stream");
const intoStream = require("into-stream");
const { sync: parser } = require("conventional-commits-parser");
const writer = require("conventional-changelog-writer");
const filter = require("conventional-commits-filter");

const { analyzeCommits: ac } = require("@semantic-release/commit-analyzer");
const loadChangelogConfig = require("@semantic-release/release-notes-generator/lib/load-changelog-config");

const getPullRequestAsCommit = async () => {
  const {
    GITHUB_TOKEN: token,
    GITHUB_PR_NUMBER: prNumber,
    GITHUB_REPOSITORY: fullRepo,
  } = process.env;

  const [owner, repo] = fullRepo.split("/");
  const pr = await new Octokit({
    auth: token,
  }).pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { body, title, updated_at: updated } = pr.data;

  return {
    subject: title,
    body,
    committerDate: updated,
    message: `${title}\n\n${body}`,
  };
};

const generateNotes = async (pluginConfig, context) => {
  const commit = await getPullRequestAsCommit();

  const { parserOpts, writerOpts } = await loadChangelogConfig(
    pluginConfig,
    context
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
    intoStream.object(parsedCommits).pipe(writer(changelogContext, writerOpts))
  );
};

const analyzeCommits = async (pluginConfig, context) => {
  const commit = await getPullRequestAsCommit();
  return ac(pluginConfig, { ...context, commits: [commit] });
};

module.exports = { generateNotes, analyzeCommits };
