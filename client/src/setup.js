import "@testing-library/jest-dom";

if (typeof window !== "undefined") {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
