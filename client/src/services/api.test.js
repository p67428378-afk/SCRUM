import { describe, it, expect } from "vitest";
import * as api from "./api";

describe("API Service Exports", () => {
  it("exports required API functions", () => {
    expect(typeof api.getPatients).toBe("function");
    expect(typeof api.searchPatients).toBe("function");
    expect(typeof api.getPatient).toBe("function");
    expect(typeof api.createPatient).toBe("function");
    expect(typeof api.getPatientRecords).toBe("function");
    expect(typeof api.createMedicalRecord).toBe("function");
    expect(typeof api.getAppointments).toBe("function");
    expect(typeof api.createAppointment).toBe("function");
    expect(typeof api.getAvailableSlots).toBe("function");
    expect(typeof api.getDoctors).toBe("function");
  });
});
