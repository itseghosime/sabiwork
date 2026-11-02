import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const authMocks = vi.hoisted(() => ({
  authorizeMarketplaceUser: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/server/authorization", () => ({
  authorizeMarketplaceUser: authMocks.authorizeMarketplaceUser,
}));

vi.mock("@/lib/server/db", () => ({
  getDb: dbMocks.getDb,
}));

describe("open requests route role access", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("blocks admin users from viewing open opportunities", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({ kind: "forbidden" });

    const response = await GET();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Admins cannot access hiring opportunities.",
      },
    });
  });

  it("allows marketplace users to view open opportunities", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({
      kind: "authorized",
      user: { id: "worker-1" },
      role: "customer",
    });

    const limit = vi.fn().mockResolvedValue([]);
    const orderBy = vi.fn(() => ({ limit }));
    const where = vi.fn(() => ({ orderBy }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    dbMocks.getDb.mockReturnValue({ select });

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: [] });
  });
});
