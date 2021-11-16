let mockFn = () => Promise.reject(new Error("Octokit mock is not set"));

const octokit = jest.fn(() => ({
  pulls: {
    get: jest.fn().mockImplementation(() => Promise.resolve().then(mockFn)),
  },
}));

const resetMock = () => {
  mockFn = () => Promise.reject(new Error("Octokit mock is not set"));
};

const setMockResult = (fn) => {
  mockFn = fn;
};

module.exports = {
  Octokit: octokit,
  resetMock,
  setMockResult,
};
