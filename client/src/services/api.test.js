import { describe, it, expect } from "vitest";
import api, {
  authApi,
  projectsApi,
  tasksApi,
  commentsApi,
  apiClient,
} from "./api";

describe("API Services Module", () => {
  it("exports apiClient with configured baseURL", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.baseURL).toMatch(/localhost:8000/);
  });

  it("exports all required authApi endpoints", () => {
    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.register).toBe("function");
    expect(typeof authApi.getMe).toBe("function");
    expect(typeof authApi.getUsers).toBe("function");
  });

  it("exports all required projectsApi endpoints", () => {
    expect(typeof projectsApi.list).toBe("function");
    expect(typeof projectsApi.get).toBe("function");
    expect(typeof projectsApi.create).toBe("function");
    expect(typeof projectsApi.update).toBe("function");
    expect(typeof projectsApi.delete).toBe("function");
  });

  it("exports all required tasksApi endpoints", () => {
    expect(typeof tasksApi.list).toBe("function");
    expect(typeof tasksApi.get).toBe("function");
    expect(typeof tasksApi.create).toBe("function");
    expect(typeof tasksApi.update).toBe("function");
    expect(typeof tasksApi.delete).toBe("function");
  });

  it("exports all required commentsApi endpoints", () => {
    expect(typeof commentsApi.listForTask).toBe("function");
    expect(typeof commentsApi.createForTask).toBe("function");
    expect(typeof commentsApi.update).toBe("function");
    expect(typeof commentsApi.delete).toBe("function");
  });

  it("exports default api object with all services", () => {
    expect(api.auth).toBe(authApi);
    expect(api.projects).toBe(projectsApi);
    expect(api.tasks).toBe(tasksApi);
    expect(api.comments).toBe(commentsApi);
  });
});
