import "@testing-library/jest-dom";
import { vi } from "vitest";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
