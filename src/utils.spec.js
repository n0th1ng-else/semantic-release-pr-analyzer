const { getStrategies, validateStrategy, getCommit } = require("./utils");

const REAL_ENV = process.env;

const setEnv = () => {
  process.env.GITHUB_REPOSITORY = "sen/repo";
  process.env.GITHUB_PR_NUMBER = "666";
  process.env.GITHUB_TOKEN = "SUPER-TOKEN";
};

describe("utils", () => {
  describe("getStrategies", () => {
    it("gets available strategies", () => {
      expect(getStrategies()).toEqual([
        "github",
        "pull-request",
        "strict-pull-request",
      ]);
    });
  });

  describe("validateStrategy", () => {
    it("falls back on the default strategy if no strategy specified", () => {
      expect(validateStrategy()).toBe("github");
    });

    it("returns undefined if the strategy is unknown", () => {
      expect(validateStrategy("foo")).toBeUndefined();
    });

    it.each([["github"], ["pull-request"], ["strict-pull-request"]])(
      "returns %s if it was specified",
      (strategy) => {
        expect(validateStrategy(strategy)).toBe(strategy);
      }
    );
  });

  describe("getCommit", () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...REAL_ENV };
    });

    it("throws an error if the strategy is unknown", () => {
      const strategy = "foo";
      return getCommit(strategy).then(
        () => {
          throw new Error("Should not be there");
        },
        (err) => {
          expect(err.message).toBe(`Unknown strategy: ${strategy}`);
        }
      );
    });

    describe("github", () => {
      it("returns commit daa if there is a single commit", () => {
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
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          });
        });
      });

      it("returns commit daa if there is a single commit", () => {
        setEnv();
        const strategy = "github";
        const commits = [
          {
            subject: "Commit title 1",
            body: "description 1",
            message: "Commit title 1\n\ndescription 1",
          },
          {
            subject: "Commit title 2",
            body: "description 2",
            message: "Commit title 2\n\ndescription 2",
          },
        ];

        return getCommit(strategy, commits).then((commit) => {
          expect(commit).toEqual({
            subject: "Commit title",
            body: "description",
            message: "Commit title\n\ndescription",
          });
        });
      });
    });
  });
});