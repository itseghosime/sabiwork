import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MilestoneCheckout, MilestoneReceipt } from "./milestone-checkout";
import { JobSignoffScreen } from "@/features/hire-workspace/screens";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const response = (data: unknown) => ({
  ok: true,
  json: async () => ({ data }),
});
it("keeps the balance locked until customer inspection is recorded", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(
      response({
        title: "QA repair",
        total_quote_kobo: 3000000,
        signed_off_at: null,
        payments: [],
      }),
    );
  vi.stubGlobal("fetch", fetch);
  render(<MilestoneCheckout jobId="qa-job" milestone="balance" />);
  expect(
    await screen.findByRole("link", { name: "Inspect & sign off" }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Pay/ })).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("shows the server's paid reference rather than offering a second payment", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        response({
          title: "QA repair",
          total_quote_kobo: 3000000,
          signed_off_at: null,
          payments: [
            {
              milestone: "deposit",
              status: "confirmed",
              reference: "SW-JOB-QA",
            },
          ],
        }),
      ),
  );
  render(<MilestoneCheckout jobId="qa-job" milestone="deposit" />);
  expect(
    (await screen.findByRole("link", { name: "View receipt" })).getAttribute(
      "href",
    ),
  ).toBe("/payments/SW-JOB-QA/receipt");
  expect(screen.queryByRole("button", { name: /Pay/ })).toBeNull();
});
it("does not display a pending payment as a receipt and supports verification retry", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      response([
        {
          reference: "SW-JOB-QA",
          job_id: "qa-job",
          status: "pending",
          milestone: "deposit",
          amount_kobo: 1500000,
        },
      ]),
    )
    .mockResolvedValueOnce(
      response({
        reference: "SW-JOB-QA",
        job_id: "qa-job",
        status: "confirmed",
        milestone: "deposit",
        amount_kobo: 1500000,
        paid_at: null,
      }),
    );
  vi.stubGlobal("fetch", fetch);
  render(<MilestoneReceipt reference="SW-JOB-QA" />);
  await screen.findByText("pending");
  expect(
    screen.queryByRole("heading", { name: "Test payment receipt" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Check payment status" }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Test payment receipt" }),
    ).toBeTruthy(),
  );
  expect(fetch.mock.calls[1][0]).toBe("/api/payments/deposit/verify");
});
it("requires the customer to affirm each inspection item, without preselected sign-off", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<JobSignoffScreen jobId="qa-job" />);
  expect(
    screen
      .getAllByRole("checkbox")
      .every((e) => !(e as HTMLInputElement).checked),
  ).toBe(true);
  expect(
    (
      screen.getByRole("button", {
        name: /Sign off & continue/,
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(fetch).not.toHaveBeenCalled();
});
