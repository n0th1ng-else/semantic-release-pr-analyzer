const { Octokit } = require("@octokit/rest");

const getEnv = () => {
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

  return {
    token,
    fullRepo,
    prNumber,
  };
};

const eqSubject = (commit1, commit2) => commit1.subject === commit2.subject;

const eqFull = (commit1, commit2) =>
  eqSubject(commit1, commit2) && commit1.body === commit2.body;

const mergeItems = (arr) => arr.join("\n\n");

const getFullCommit = (title, body) =>
  mergeItems([title, body].filter(Boolean));

const getFirstCommit = (commits) => commits[commits.length - 1];

const imitateCommit = (title, body) => ({
  subject: title,
  body,
  message: getFullCommit(title, body),
});

const getPullRequestAsCommit = async () => {
  const { token, prNumber, fullRepo } = getEnv();

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

const getGithubStrategyCommitBody = (commits) =>
  mergeItems(
    commits
      .map(({ subject: t, body: b }) => getFullCommit(`* ${t}`, b))
      .reverse()
  );

const getGithubStrategyCommit = async (commits, prCommit) => {
  if (commits.length === 1) {
    return getFirstCommit(commits);
  }

  const { subject } = prCommit || (await getPullRequestAsCommit());
  const body = getGithubStrategyCommitBody(commits);

  return imitateCommit(subject, body);
};

const getStrictGithubStrategyCommit = async (commits) => {
  if (!commits.length) {
    throw new Error("No commits found");
  }

  const prCommit = await getPullRequestAsCommit();
  const firstCommit = getFirstCommit(commits);

  if (eqSubject(prCommit, firstCommit)) {
    return getGithubStrategyCommit(commits, prCommit);
  }

  throw new Error(
    "The pull request title is not equal to the first commit title"
  );
};

const getStrictPullRequestStrategyCommit = async (commits) => {
  if (!commits.length) {
    throw new Error("No commits found");
  }

  const prCommit = await getPullRequestAsCommit();
  const firstCommit = getFirstCommit(commits);
  if (eqFull(prCommit, firstCommit)) {
    return prCommit;
  }

  throw new Error(
    "The pull request description is not equal to the first commit body"
  );
};

const STRATEGY = {
  Github: "github",
  StrictGithub: "strict-github",
  PullRequest: "pull-request",
  StrictPullRequest: "strict-pull-request",
};

const getRawCommit = async (strategy, commits) => {
  switch (strategy) {
    case STRATEGY.Github:
      return getGithubStrategyCommit(commits);
    case STRATEGY.StrictGithub:
      return getStrictGithubStrategyCommit(commits);
    case STRATEGY.PullRequest:
      return getPullRequestAsCommit();
    case STRATEGY.StrictPullRequest:
      return getStrictPullRequestStrategyCommit(commits);
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
};

const getCommit = async (strategy, commits) => {
  const commit = await getRawCommit(strategy, commits);
  const { prNumber } = getEnv();

  return {
    ...commit,
    subject: `${commit.subject} (#${prNumber})`,
  };
};

const getStrategies = () => Object.values(STRATEGY);

const validateStrategy = (strategy) => {
  if (!strategy) {
    return STRATEGY.Github;
  }

  if (Object.values(STRATEGY).includes(strategy)) {
    return strategy;
  }

  const strategies = getStrategies().join(", ");
  throw new Error(
    `Invalid strategy: ${strategy}. Available options: ${strategies}`
  );
};

module.exports = {
  getCommit,
  validateStrategy,
};
