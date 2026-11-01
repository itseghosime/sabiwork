import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";

const authMocks = vi.hoisted(() => ({
  authorizeRole: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/server/authorization", () => ({
  authorizeRole: authMocks.authorizeRole,
}));

vi.mock("@/lib/server/db", () => ({
  getDb: dbMocks.getDb,
}));

describe("admin verification dossier API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("blocks non-admin users from inspecting dossier", async () => {
    authMocks.authorizeRole.mockResolvedValue({ kind: "forbidden" });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "worker-1" }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Admin access is required.",
      },
    });
  });

  it("blocks non-admin users from updating verification", async () => {
    authMocks.authorizeRole.mockResolvedValue({ kind: "forbidden" });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
        headers: { "Content-Type": "application/json" },
      }),
      {
        params: Promise.resolve({ id: "worker-1" }),
      },
    );

    expect(response.status).toBe(403);
  });

  it("rejects invalid status payloads with 400", async () => {
    authMocks.authorizeRole.mockResolvedValue({
      kind: "authorized",
      user: { id: "admin-1" },
      role: "admin",
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ status: "invalid_status" }),
        headers: { "Content-Type": "application/json" },
      }),
      {
        params: Promise.resolve({ id: "worker-1" }),
      },
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error?.code).toBe("INVALID_INPUT");
  });
});
