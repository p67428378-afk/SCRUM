import "@testing-library/jest-dom";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.scrollTo
if (typeof window !== "undefined") {
  window.scrollTo = () => {};
}
