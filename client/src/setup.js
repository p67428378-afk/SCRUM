import "@testing-library/jest-dom";

// Global ResizeObserver mock for jsdom environment
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Global IntersectionObserver mock
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Window matchMedia mock
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
