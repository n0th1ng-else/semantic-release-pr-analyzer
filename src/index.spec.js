const { analyzeCommits, generateNotes } = require("..");
const ac = require("./commit-analyzer").analyzeCommits;
const gn = require("./release-notes-generator").generateNotes;

jest.mock("./commit-analyzer", () => ({
  analyzeCommits: jest.fn().mockResolvedValue(),
}));

jest.mock("./release-notes-generator", () => ({
  generateNotes: jest.fn().mockResolvedValue(),
}));

describe("analyzeCommits", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("works when there is no plugin config specified, defaults to github strategy", () => {
    return analyzeCommits().then(() => {
      expect(ac).toBeCalledWith("github", {}, undefined);
    });
  });

  it("throws an error when the strategy is unknown", () => {
    const strategy = "foo";
    return analyzeCommits({ strategy }).then(
      () => {
        throw new Error("Should not be there");
      },
      (err) => {
        expect(err.message).toBe(
          "Invalid strategy: foo. Available options: github, strict-github, pull-request, strict-pull-request",
        );
      },
    );
  });

  it("should pass the whole config down to the commit-analyzer", () => {
    const cfg = { foo: "bar" };
    return analyzeCommits(cfg).then(() => {
      expect(ac).toBeCalledWith("github", cfg, undefined);
    });
  });

  it("should enrich the custom configuration for commit-analyzer", () => {
    const cfg = { foo: "bar", commitAnalyzerConfig: { baz: "feed" } };
    return analyzeCommits(cfg).then(() => {
      expect(ac).toBeCalledWith("github", { ...cfg, baz: "feed" }, undefined);
    });
  });

  it("should override default configuration for commit-analyzer", () => {
    const cfg = { foo: "bar", commitAnalyzerConfig: { foo: "baz" } };
    return analyzeCommits(cfg).then(() => {
      expect(ac).toBeCalledWith("github", { ...cfg, foo: "baz" }, undefined);
    });
  });
});

describe("generateNotes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("works when there is no plugin config specified, defaults to github strategy", () => {
    return generateNotes().then(() => {
      expect(gn).toBeCalledWith("github", {}, undefined);
    });
  });

  it("throws an error when the strategy is unknown", () => {
    const strategy = "foo";
    return generateNotes({ strategy }).then(
      () => {
        throw new Error("Should not be there");
      },
      (err) => {
        expect(err.message).toBe(
          "Invalid strategy: foo. Available options: github, strict-github, pull-request, strict-pull-request",
        );
      },
    );
  });

  it("should pass the whole config down to the release-notes-generator", () => {
    const cfg = { foo: "bar" };
    return generateNotes(cfg).then(() => {
      expect(gn).toBeCalledWith("github", cfg, undefined);
    });
  });

  it("should enrich the custom configuration for release-notes-generator", () => {
    const cfg = { foo: "bar", notesGeneratorConfig: { baz: "feed" } };
    return generateNotes(cfg).then(() => {
      expect(gn).toBeCalledWith("github", { ...cfg, baz: "feed" }, undefined);
    });
  });

  it("should override default configuration for release-notes-generator", () => {
    const cfg = { foo: "bar", notesGeneratorConfig: { foo: "baz" } };
    return generateNotes(cfg).then(() => {
      expect(gn).toBeCalledWith("github", { ...cfg, foo: "baz" }, undefined);
    });
  });
});
