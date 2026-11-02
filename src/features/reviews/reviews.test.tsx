import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  AdminDisputeDetailScreen,
  AdminDisputeQueueScreen,
  ReviewScreen,
} from "./screens";
import { reviewsDemoService } from "./service";

afterEach(cleanup);

describe("reviews and disputes demo adapter", () => {
  it("returns invalid review errors without publishing or persisting", async () => {
    expect(await reviewsDemoService.submitReview({ rating: 0, text: "", tags: [] })).toMatchObject({
      ok: false,
      mode: "demo",
      code: "VALIDATION",
    });
    expect(await reviewsDemoService.submitReview({ rating: 5, text: "A tidy repair with clear communication.", tags: ["Clean work"] })).toMatchObject({
      ok: true,
      mode: "demo",
      kind: "review-preview",
      message: expect.stringContaining("not been saved or published"),
    });
  });

  it("keeps review input after a recoverable error", async () => {
    render(<ReviewScreen jobId="demo-job-8421" />);
    await screen.findByRole("heading", { name: "Rate your experience" });
    fireEvent.click(screen.getByRole("button", { name: "5 stars" }));
    const feedback = screen.getByLabelText(/Detailed feedback/) as HTMLTextAreaElement;
    fireEvent.change(feedback, { target: { value: "The repair was neat and finished on time." } });
    fireEvent.click(screen.getByRole("button", { name: "Simulate the next request failing" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview review" }));
    expect((await screen.findByRole("alert")).textContent).toContain("still here; try again");
    expect(feedback.value).toBe("The repair was neat and finished on time.");
  });

  it("filters the demo dispute queue and opens only the matching sample", async () => {
    render(<AdminDisputeQueueScreen />);
    await screen.findByRole("link", { name: /View case/ });
    fireEvent.change(screen.getByRole("searchbox", { name: "Search disputes" }), {
      target: { value: "not-a-case" },
    });
    expect(await screen.findByText("No cases match this view")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(
      (await screen.findByRole("link", { name: /View case/ })).getAttribute("href"),
    ).toBe("/admin/disputes/demo-dispute-01");
  });

  it("clearly labels admin decisions as previews and leaves case state unchanged", async () => {
    render(<AdminDisputeDetailScreen disputeId="demo-dispute-01" />);
    await screen.findByRole("button", { name: "Preview continue review" });
    fireEvent.click(screen.getByRole("button", { name: "Preview continue review" }));
    expect((await screen.findByRole("status")).textContent).toContain("case has not changed");
    expect(screen.getByText("Under review · sample")).toBeTruthy();
  });
});

