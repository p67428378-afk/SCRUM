import "@testing-library/jest-dom";

// Mock ResizeObserver which is not implemented in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.scrollTo which is not implemented in jsdom
if (typeof window !== "undefined") {
  window.scrollTo = () => {};
}
