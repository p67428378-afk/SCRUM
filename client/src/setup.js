import "@testing-library/jest-dom";

// Mock ResizeObserver for tests (especially if using charts or responsive layouts)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
