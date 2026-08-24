import "@testing-library/jest-dom";

// Mock ResizeObserver for tests (e.g. Recharts or other layout components)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
