import "@testing-library/jest-dom";

// Global mock for ResizeObserver in jsdom environment
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
