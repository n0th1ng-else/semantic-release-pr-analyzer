import { jest } from "@jest/globals";

let mockFn = () => Promise.reject(new Error("Octokit mock is not set"));

export const Octokit = jest.fn(() => ({
  pulls: {
    get: jest.fn().mockImplementation(() => Promise.resolve().then(mockFn)),
  },
}));

export function resetMock() {
  mockFn = () => Promise.reject(new Error("Octokit mock is not set"));
}

export function setMockResult(fn) {
  mockFn = fn;
}
