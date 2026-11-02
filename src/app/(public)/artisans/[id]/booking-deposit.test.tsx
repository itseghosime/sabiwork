import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BookingDeposit } from "./booking-deposit";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("Directory booking entry", () => {
  it("requires an agreed scope before collecting money", () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    render(<BookingDeposit artisanId="artisan" artisanName="QA artisan" amountKobo={280000} paymentsEnabled customerWorkspace />);
    expect(screen.getByRole("link", { name: "Request a quote before paying" }).getAttribute("href")).toBe("/requests/new");
    expect(screen.queryByRole("button", { name: /Pay/ })).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("takes signed-out visitors to account access before booking", () => {
    render(<BookingDeposit artisanId="artisan" artisanName="QA artisan" amountKobo={280000} paymentsEnabled />);
    expect(screen.getByRole("link", { name: "Request a quote before paying" }).getAttribute("href")).toBe("/login");
  });
});
