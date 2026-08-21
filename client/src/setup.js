import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock ResizeObserver which is not implemented in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
