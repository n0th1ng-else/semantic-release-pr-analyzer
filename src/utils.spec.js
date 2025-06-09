const { setMockResult, resetMock } = require("./__mocks__/@octokit/rest");
const { validateStrategy, getCommit } = require("./utils");

const REAL_ENV = process.env;

const prNumber = "322";

const setEnv = () => {
  process.env.GITHUB_REPOSITORY = "sen/repo";
  process.env.GITHUB_PR_NUMBER = prNumber;
  process.env.GITHUB_TOKEN = "SUPER-TOKEN";
};

describe("utils", () => {
  describe("validateStrategy", () => {
    it("falls back on the default strategy if no strategy specified", () => {
      expect(validateStrategy()).toBe("github");
    });

    it("throws an error when the strategy is unknown", () => {
      const strategy = "foo";
      expect(() => {
        validateStrategy(strategy);
      }).toThrow(
        `Invalid strategy: ${strategy}. Available options: github, strict-github, pull-request, strict-pull-request`,
      );
    });

    it.each([
      ["github"],
      ["strict-github"],
      ["pull-request"],
      ["strict-pull-request"],
    ])("returns %s if it was specified", (strategy) => {
      expect(validateStrategy(strategy)).toBe(strategy);
    });
  });

  describe("getCommit", () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...REAL_ENV };
      resetMock();
    });

    it("throws an error if the strategy is unknown", () => {
      const strategy = "foo";
      return getCommit(strategy).then(
        () => {
          throw new Error("Should not be there");
        },
        (err) => {
          expect(err.message).toBe(`Unknown strategy: ${strategy}`);
        },
      );
    });

    describe("github strategy", () => {
      it("returns commit data if there is a single commit", () => {
        setEnv();
        const strategy = "github";

        const commits = [
          {
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          },
        ];

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `Commit title (#${prNumber})`,
            body: "description",
            message: "Commit title\n\ndescription",
          });
        });
      });

      it("returns pull request data if there is more than 1 commit", () => {
        setEnv();
        const strategy = "github";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "pr title",
              body: "pr body",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `pr title (#${prNumber})`,
            body: "* Commit title 1\n\ndescription 1\n\n* Commit title 2\n\ndescription 2",
            message:
              "pr title\n\n* Commit title 1\n\ndescription 1\n\n* Commit title 2\n\ndescription 2",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      it("throws an error when the github API is not available", () => {
        setEnv();
        const strategy = "github";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        setMockResult(() => Promise.reject(new Error("Where is it?")));

        return getCommit(strategy, commits).then(
          () => {
            throw new Error("Should not be there");
          },
          (err) => {
            expect(err.message).toBe("Where is it?");
          },
        );
      });
    });

    describe("strict-github strategy", () => {
      it("returns commit data if there is a single commit and the title eq to the PR title", () => {
        setEnv();
        const strategy = "strict-github";

        const commits = [
          {
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "Commit title",
              body: "pr body",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `Commit title (#${prNumber})`,
            body: "description",
            message: "Commit title\n\ndescription",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      it("returns pull request data if there is more than 1 commit and the first commit title eq to the PR title", () => {
        setEnv();
        const strategy = "strict-github";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "Commit title 1",
              body: "pr body",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `Commit title 1 (#${prNumber})`,
            body: "* Commit title 1\n\ndescription 1\n\n* Commit title 2\n\ndescription 2",
            message:
              "Commit title 1\n\n* Commit title 1\n\ndescription 1\n\n* Commit title 2\n\ndescription 2",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      describe("throws an error", () => {
        it("for single commit when the github API is not available", () => {
          setEnv();
          const strategy = "strict-github";

          const commits = [
            {
              subject: "Commit title",
              body: "description",
              message: "Commit title\n\ndescription",
            },
          ];

          setMockResult(() => Promise.reject(new Error("Where is it?")));

          return getCommit(strategy, commits).then(
            () => {
              throw new Error("Should not be there");
            },
            (err) => {
              expect(err.message).toBe("Where is it?");
            },
          );
        });

        it("for multiple commits when the github API is not available", () => {
          setEnv();
          const strategy = "strict-github";

          const commits = [
            {
              subject: "Commit title 2",
              body: "description 2",
              message: "Commit title 2\n\ndescription 2",
            },
            {
              subject: "Commit title 1",
              body: "description 1",
              message: "Commit title 1\n\ndescription 1",
            },
          ];

          setMockResult(() => Promise.reject(new Error("Where is it?")));

          return getCommit(strategy, commits).then(
            () => {
              throw new Error("Should not be there");
            },
            (err) => {
              expect(err.message).toBe("Where is it?");
            },
          );
        });

        it("for single commit when the commit title is not eq to the PR title", () => {
          setEnv();
          const strategy = "strict-github";

          const commits = [
            {
              subject: "Commit title",
              body: "description",
              message: "Commit title\n\ndescription",
            },
          ];

          setMockResult(() =>
            Promise.resolve({
              data: {
                title: "pr title",
                body: "description",
              },
            }),
          );

          return getCommit(strategy, commits).then(
            () => {
              throw new Error("Should not be there");
            },
            (err) => {
              expect(err.message).toBe(
                "The pull request title is not equal to the first commit title",
              );
            },
          );
        });

        it("for multiple commits when the first commit title is not eq to the PR title", () => {
          setEnv();
          const strategy = "strict-github";

          const commits = [
            {
              subject: "Commit title 2",
              body: "description 2",
              message: "Commit title 2\n\ndescription 2",
            },
            {
              subject: "Commit title 1",
              body: "description 1",
              message: "Commit title 1\n\ndescription 1",
            },
          ];

          setMockResult(() =>
            Promise.resolve({
              data: {
                title: "Commit title 2",
                body: "description 2",
              },
            }),
          );

          return getCommit(strategy, commits).then(
            () => {
              throw new Error("Should not be there");
            },
            (err) => {
              expect(err.message).toBe(
                "The pull request title is not equal to the first commit title",
              );
            },
          );
        });
      });
    });

    describe("pull-request strategy", () => {
      it("returns pull request data if there is a single commit", () => {
        setEnv();
        const strategy = "pull-request";

        const commits = [
          {
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "pr title",
              body: "pr body",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `pr title (#${prNumber})`,
            body: "pr body",
            message: "pr title\n\npr body",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      it("returns pull request data if there is more than 1 commit", () => {
        setEnv();
        const strategy = "pull-request";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "pr title",
              body: "pr body",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `pr title (#${prNumber})`,
            body: "pr body",
            message: "pr title\n\npr body",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      it("throws an error when the github API is not available", () => {
        setEnv();
        const strategy = "pull-request";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        setMockResult(() => Promise.reject(new Error("Where is it?")));

        return getCommit(strategy, commits).then(
          () => {
            throw new Error("Should not be there");
          },
          (err) => {
            expect(err.message).toBe("Where is it?");
          },
        );
      });

      it("throws an error when the github API is not available (single commit)", () => {
        setEnv();
        const strategy = "pull-request";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
        ];

        setMockResult(() => Promise.reject(new Error("Where is it?")));

        return getCommit(strategy, commits).then(
          () => {
            throw new Error("Should not be there");
          },
          (err) => {
            expect(err.message).toBe("Where is it?");
          },
        );
      });
    });

    describe("strict-pull-request strategy", () => {
      it("returns pull request data if there is a single commit", () => {
        setEnv();
        const strategy = "strict-pull-request";

        const commits = [
          {
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "Commit title",
              body: "description",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `Commit title (#${prNumber})`,
            body: "description",
            message: "Commit title\n\ndescription",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      it("returns pull request data if there is more than 1 commit", () => {
        setEnv();
        const strategy = "strict-pull-request";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        const mockFn = jest.fn(() =>
          Promise.resolve({
            data: {
              title: "Commit title 1",
              body: "description 1",
            },
          }),
        );
        setMockResult(mockFn);

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: `Commit title 1 (#${prNumber})`,
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          });
          expect(mockFn).toBeCalledTimes(1);
        });
      });

      it("throws an error when the github API is not available", () => {
        setEnv();
        const strategy = "strict-pull-request";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
        ];

        setMockResult(() => Promise.reject(new Error("Where is it?")));

        return getCommit(strategy, commits).then(
          () => {
            throw new Error("Should not be there");
          },
          (err) => {
            expect(err.message).toBe("Where is it?");
          },
        );
      });

      it("throws an error when the github API is not available (single commit)", () => {
        setEnv();
        const strategy = "strict-pull-request";

        const commits = [
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
        ];

        setMockResult(() => Promise.reject(new Error("Where is it?")));

        return getCommit(strategy, commits).then(
          () => {
            throw new Error("Should not be there");
          },
          (err) => {
            expect(err.message).toBe("Where is it?");
          },
        );
      });

      it("throws an error when the pull request description is not eq to the first commit body", () => {
        setEnv();
        const strategy = "strict-pull-request";

        const commits = [
          {
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          },
        ];

        setMockResult(() =>
          Promise.resolve({
            data: {
              title: "pr title",
              body: "pr body",
            },
          }),
        );

        return getCommit(strategy, commits).then(
          () => {
            throw new Error("Should not be there");
          },
          (err) => {
            expect(err.message).toBe(
              "The pull request description is not equal to the first commit body",
            );
          },
        );
      });
    });

    describe("Environment vars", () => {
      it.each([["GITHUB_TOKEN"], ["GITHUB_PR_NUMBER"], ["GITHUB_REPOSITORY"]])(
        "throws an error when env.%s is not specified",
        (envKey) => {
          setEnv();
          process.env[envKey] = "";

          const strategy = "pull-request";

          return getCommit(strategy, []).then(
            () => {
              throw new Error("Should not be there");
            },
            (err) => {
              expect(err.message).toBe(`${envKey} is not defined`);
            },
          );
        },
      );
    });
  });
});
