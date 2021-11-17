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
      expect(ac).toBeCalledWith("github", undefined, undefined);
    });
  });
});

describe("generateNotes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("works when there is no plugin config specified, defaults to github strategy", () => {
    return generateNotes().then(() => {
      expect(gn).toBeCalledWith("github", undefined, undefined);
    });
  });
});
