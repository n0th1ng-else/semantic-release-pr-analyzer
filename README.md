# **semantic-release-pr-analyzer**

semantic-release plugin that imitates the behaviour when the team relies on the **_squash and merge_** strategy
on GitHub.

## Install

```bash
$ npm install semantic-release-pr-analyzer -D
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    [
      "semantic-release-pr-analyzer",
      {
        "strategy": "github"
      }
    ]
  ]
}
```

## Configuration

### Options

| Option                 | Description        | Default  |
| ---------------------- | ------------------ | -------- |
| `strategy`             | analyzing strategy | `github` |
| `commitAnalyzerConfig` | TODO               | none     |
| `notesGeneratorConfig` | TODO               | none     |

## Strategy

### Github strategy (`{strategy: 'github'}`)

- In case of a single commit in the branch, semantic-release analyzes that commit.
- When multiple commits are in the branch, semantic-release analyzes the commit made of the pull request title and commit concatenation in the body.

### Pull Request strategy (`{strategy: 'pull-request'}`)

Always analyzes the pull request title and description as a commit.

### Strict Pull Request strategy (`{strategy: 'strict-pull-request'}`)

The same as the **_Pull Request strategy_**, but it will throw an error if the first commit body is not equal
to the pull request description.

## Environment variables

### env.GITHUB_TOKEN

GitHub token to access your repository. Using the `secrets.GITHUB_TOKEN` value should be enough.

### env.GITHUB_PR_NUMBER

The pull request number. In the context of GitHub actions, it is achievable as `github.event.pull_request.number`

### env.GITHUB_REPOSITORY

Repository path, for example `n0th1ng-else/semantic-release-pr-analyzer`. For GitHub actions workflow it is
set automatically.
