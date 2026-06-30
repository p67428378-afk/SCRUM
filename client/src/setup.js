import "@testing-library/jest-dom";

// Mock ResizeObserver for tests
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
