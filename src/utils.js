const { Octokit } = require("@octokit/rest");

const eq = (commit1, commit2) =>
  commit1.subject === commit2.subject && commit1.body === commit2.body;

const mergeItems = (arr) => arr.join("\n\n");

const getFullCommit = (title, body) =>
  mergeItems([title, body].filter(Boolean));

const imitateCommit = (title, body) => ({
  subject: title,
  body,
  message: getFullCommit(title, body),
});

const getPullRequestAsCommit = async () => {
  const {
    GITHUB_TOKEN: token,
    GITHUB_PR_NUMBER: prNumber,
    GITHUB_REPOSITORY: fullRepo,
  } = process.env;

  if (!fullRepo) {
    throw new Error("GITHUB_REPOSITORY is not defined");
  }

  if (!prNumber) {
    throw new Error("GITHUB_PR_NUMBER is not defined");
  }

  if (!token) {
    throw new Error("GITHUB_TOKEN is not defined");
  }

  const [owner, repo] = fullRepo.split("/");
  const pr = await new Octokit({
    auth: token,
  }).pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { title, body } = pr.data;
  return imitateCommit(title, body);
};

const getGithubStrategyCommit = async (commits) => {
  if (commits.length === 1) {
    return commits[0];
  }

  const { subject } = await getPullRequestAsCommit();
  const body = mergeItems(
    commits.map(({ subject: t, body: b }) => getFullCommit(`* ${t}`, b))
  );

  return imitateCommit(subject, body);
};

const getStrictGithubStrategyCommit = async (commits) => {
  if (!commits.length) {
    throw new Error("No commits found");
  }

  const prCommit = await getPullRequestAsCommit();
  const first = commits[0];
  if (eq(prCommit, first)) {
    return prCommit;
  }

  throw new Error(
    "The pull request description is not equal to the first commit body"
  );
};

const STRATEGY = {
  Github: "github",
  PullRequest: "pull-request",
  StrictPullRequest: "strict-pull-request",
};

const getRawCommit = async (strategy, commits) => {
  switch (strategy) {
    case STRATEGY.Github:
      return getGithubStrategyCommit(commits);
    case STRATEGY.PullRequest:
      return getPullRequestAsCommit();
    case STRATEGY.StrictPullRequest:
      return getStrictGithubStrategyCommit(commits);
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
};

const getCommit = async (strategy, commits) => {
  /**
   * TODO add pull-request number to the commit title.
   * This does not affect the expected version.
   * Just for consistency with GitHub.
   */
  return getRawCommit(strategy, commits);
};

const validateStrategy = (strategy) => {
  if (!strategy) {
    return STRATEGY.Github;
  }

  if (Object.values(STRATEGY).includes(strategy)) {
    return strategy;
  }
};

const getStrategies = () => Object.values(STRATEGY);

module.exports = {
  getCommit,
  getStrategies,
  validateStrategy,
};
