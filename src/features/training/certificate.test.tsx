import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CertificateView } from "./certificate";
import { guides } from "./data";
import {
  certificateFor,
  nextGuide,
  resetTrainingProgress,
} from "./service";

describe("certificate view (S46 demo)", () => {
  beforeEach(() => {
    resetTrainingProgress();
    window.print = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    resetTrainingProgress();
  });

  it("stays locked with progress disclosure until all parts are read", () => {
    const locked = certificateFor(guides[0]);
    render(
      <CertificateView
        certificate={locked}
        nextGuideId={null}
        nextGuideTitle={null}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: "Certificate not unlocked yet",
      }),
    ).toBeTruthy();
    expect(screen.getByText(/still has 3 unread parts/)).toBeTruthy();
    expect(screen.getByText("2 of 5 parts read")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /Finish the guide/ })
        .getAttribute("href"),
    ).toBe(`/training/${guides[0].id}`);
  });

  it("renders the ready certificate with fictional metadata only", () => {
    const ready = certificateFor(guides[2]);
    const next = nextGuide(guides[2]);
    render(
      <CertificateView
        certificate={ready}
        nextGuideId={next?.id ?? null}
        nextGuideTitle={next?.title ?? null}
      />,
    );
    expect(screen.getByRole("heading", { name: /Certificate of completion/ })).toBeTruthy();
    expect(screen.getAllByText("Osaze Ighodaro").length).toBeGreaterThan(0);
    expect(screen.getByText(/SW-TRN-\d{4}-\d{4} \(sample\)/)).toBeTruthy();
    expect(screen.getByText(/25 October 2026/)).toBeTruthy();
    expect(screen.getByText(/Sample training record · TEST mode/)).toBeTruthy();
    // Legal honesty: never an accreditation claim.
    expect(screen.getByText(/not a government, statutory or vocational trade accreditation/)).toBeTruthy();
    // Disclosures on the sample rows.
    expect(screen.getByText("Decorative placeholder · not scannable")).toBeTruthy();
    expect(screen.getByText("No verification service is connected")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: next!.title }),
    ).toBeTruthy();
  });

  it("copies the in-app demo link and prints the frame via window.print", async () => {
    const ready = certificateFor(guides[2]);
    render(
      <CertificateView
        certificate={ready}
        nextGuideId={null}
        nextGuideTitle={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Copy demo link/ }));
    expect(
      await screen.findByText(
        /Clipboard is unavailable; copy the address bar link instead/,
      ),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /Export PDF \(print\)/ }),
    );
    expect(window.print).toHaveBeenCalledOnce();
  });

  it("offers the next guide card only when one is unfinished", () => {
    render(
      <CertificateView
        certificate={certificateFor(guides[2])}
        nextGuideId={guides[4].id}
        nextGuideTitle={guides[4].title}
      />,
    );
    expect(
      screen
        .getByRole("link", { name: /Start next guide/ })
        .getAttribute("href"),
    ).toBe(`/training/${guides[4].id}`);

    cleanup();
    render(
      <CertificateView
        certificate={certificateFor(guides[2])}
        nextGuideId={null}
        nextGuideTitle={null}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "All demo guides finished" }),
    ).toBeTruthy();
  });
});
