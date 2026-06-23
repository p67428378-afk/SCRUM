import "@testing-library/jest-dom";

// Mock ResizeObserver for Recharts or other components
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
