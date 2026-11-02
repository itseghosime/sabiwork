import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

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

describe("requests route role access", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("blocks admin users from listing requests", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({ kind: "forbidden" });

    const response = await GET();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Admins cannot create or list hire requests.",
      },
    });
  });

  it("blocks admin users from creating requests", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({ kind: "forbidden" });

    const response = await POST(
      new Request("http://localhost/api/requests", {
        method: "POST",
        body: JSON.stringify({ title: "A", category: "B" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Admins cannot create or list hire requests.",
      },
    });
  });

  it("allows an artisan account to list its own requests", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({
      kind: "authorized",
      user: { id: "artisan-user" },
      role: "artisan",
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
