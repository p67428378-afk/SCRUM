import { describe, it, expect } from "vitest";
import api, {
  getDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
} from "./api.js";

describe("API Service Module", () => {
  it("exports expected API methods", () => {
    expect(typeof getDrugs).toBe("function");
    expect(typeof getDrugById).toBe("function");
    expect(typeof createDrug).toBe("function");
    expect(typeof updateDrug).toBe("function");
    expect(typeof deleteDrug).toBe("function");
  });

  it("default export contains API functions", () => {
    expect(typeof api.getDrugs).toBe("function");
    expect(typeof api.createDrug).toBe("function");
    expect(typeof api.updateDrug).toBe("function");
    expect(typeof api.deleteDrug).toBe("function");
  });
});
