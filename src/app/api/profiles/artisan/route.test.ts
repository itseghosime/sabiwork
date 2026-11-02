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

describe("artisan profile route role access and validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("blocks admin users from viewing artisan profile", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({ kind: "forbidden" });

    const response = await GET();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Admins cannot create or edit work profiles.",
      },
    });
  });

  it("blocks admin users from creating or editing artisan profile", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({ kind: "forbidden" });

    const response = await POST(
      new Request("http://localhost/api/profiles/artisan", {
        method: "POST",
        body: JSON.stringify({ primary_trade: "Carpentry" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Admins cannot create or edit work profiles.",
      },
    });
  });

  it("rejects invalid input with 400 INVALID_INPUT", async () => {
    authMocks.authorizeMarketplaceUser.mockResolvedValue({
      kind: "authorized",
      user: { id: "user-1", name: "User One" },
      role: "customer",
    });

    const response = await POST(
      new Request("http://localhost/api/profiles/artisan", {
        method: "POST",
        body: JSON.stringify({
          contact_phone: "bad", // too short
          primary_trade: "P", // too short
          experience_years: -5, // invalid
          coverage_areas: [],
          workshop_area: "",
          bio: "too short",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error?.code).toBe("INVALID_INPUT");
  });
});
