import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BookingDeposit } from "./booking-deposit";

afterEach(cleanup);

describe("BookingDeposit", () => {
  it("prefills the signed-in customer email and waits for a manual pay click", () => {
    render(
      <BookingDeposit
        artisanId="seed-artisan-0001"
        artisanName="Presentation artisan"
        amountKobo={280_000}
        paymentsEnabled
        initialEmail="customer@example.test"
        customerWorkspace
      />,
    );

    expect(
      (screen.getByLabelText("Email for the receipt") as HTMLInputElement).value,
    ).toBe("customer@example.test");
    expect(
      screen.getByRole("button", { name: "Pay ₦2,800 deposit" }).hasAttribute("disabled"),
    ).toBe(false);
    expect(screen.queryByText("Opening the Paystack test checkout…")).toBeNull();
  });
});
