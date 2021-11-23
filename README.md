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

| Option                 | Description                                                                                                                        | Default                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `strategy`             | analyzing strategy                                                                                                                 | `github`                                |
| `commitAnalyzerConfig` | standard commit-analyzer plugin [configuration](https://github.com/semantic-release/commit-analyzer#configuration)                 | default one for commit-analyzer         |
| `notesGeneratorConfig` | standard release-notes-generator plugin [configuration](https://github.com/semantic-release/release-notes-generator#configuration) | default one for release-notes-generator |

## Strategy

### GitHub strategy (`{strategy: 'github'}`)

Once PR is merged, GitHib creates a squash commit in the main branch following the rules below:

| Number of commits in the pull request | Main Branch Commit Title                                                                   | Main Branch Commit Description                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Single commit                         | The title of the commit message for the single commit, followed by the pull request number | The body text of the commit message for the single commit                    |
| More than one commit                  | The pull request title, followed by the pull request number                                | A list of the commit messages for all of the squashed commits, in date order |

You can read more about this in the official
[GitHub docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#merge-message-for-a-squash-merge).
This plugin hijacks semantic-release flow and replaces the commits list with the one that respects these rules
into the mix.

### Strict GitHub strategy (`{strategy: 'strict-github'}`)

The same as the **_GitHub strategy_**, but it will throw an error if the first commit title is not equal
to the pull request title.

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

## Examples

##### You can see the sample configuration in the [examples folder](https://github.com/n0th1ng-else/semantic-release-pr-analyzer/tree/main/examples).
