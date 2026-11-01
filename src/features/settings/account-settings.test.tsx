import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AccountSettings } from "./account-settings";
import { demoSettings, type DemoSettings } from "./data";
import { resetSavedSettings } from "./service";

// jsdom does not ship object URL plumbing; stub the preview lifecycle.
beforeEach(() => {
  resetSavedSettings();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:demo-photo-1"),
  });
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  resetSavedSettings();
  vi.restoreAllMocks();
});

const renderSettings = (
  initialSettings: DemoSettings = demoSettings,
): void => {
  render(<AccountSettings initialSettings={initialSettings} />);
};

describe("account settings interactions (S13 demo)", () => {
  it("tracks unsaved edits, saves to the demo snapshot and reports honestly", async () => {
    renderSettings();
    expect(screen.getByText(/TEST mode: these details are simulated/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Osaze Demo-Edit" },
    });
    expect(
      screen.getByText("You have unsaved edits in this form."),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^Save changes/ }));
    expect(screen.getByText("Saving (demo)…")).toBeTruthy();
    expect(
      await screen.findByText(/Demo save finished\. TEST mode/),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Saved for this demo session only — nothing is persisted.",
      ),
    ).toBeTruthy();
  });

  it("surfaces email validation as an alert and keeps the form editable", async () => {
    renderSettings();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Try saving again|Save changes/ }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("valid email");
    // Fixing the field clears the block and the save succeeds.
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "osaze@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Save changes|Try saving again/ }));
    expect(await screen.findByText(/Demo save finished/)).toBeTruthy();
  });

  it("discards edits only after the confirm modal", async () => {
    renderSettings();
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Changed Name" },
    });
    expect(
      screen.getByRole("button", { name: "Cancel / revert" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancel / revert" }));
    const dialog = screen.getByRole("dialog", {
      name: "Discard unsaved changes?",
    });
    expect(dialog).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByLabelText("Full name").getAttribute("value"),
    ).toBe("Changed Name");
    fireEvent.click(screen.getByRole("button", { name: "Cancel / revert" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard & exit" }));
    expect(screen.getByLabelText("Full name").getAttribute("value")).toBe(
      "Osaze Ighodaro",
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the demo sign-out state and returns without faking a session", async () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm log out" }),
    );
    expect(
      screen.getByText("Demo sign-out finished."),
    ).toBeTruthy();
    expect(screen.getByText(/no session to end/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Back to account settings" }),
    );
    expect(screen.getByText(/TEST mode: these details are simulated/)).toBeTruthy();
  });

  it("previews a local photo, enforces the 2MB image rules and never uploads", async () => {
    renderSettings();
    expect(screen.queryByText("Photo preview attached. Uploads are not sent anywhere yet.")).toBeNull();
    fireEvent.change(screen.getByLabelText("Choose a profile photo to preview"), {
      target: {
        files: [new File(["pixels"], "photo.png", { type: "image/png" })],
      },
    });
    expect(
      await screen.findByText("Photo preview attached. Uploads are not sent anywhere yet."),
    ).toBeTruthy();
    expect(
      (document.querySelector(".settings-portrait img") as HTMLImageElement)
        .src,
    ).toContain("blob:demo-photo-1");
    fireEvent.change(screen.getByLabelText("Choose a profile photo to preview"), {
      target: {
        files: [new File(["data"], "notes.txt", { type: "text/plain" })],
      },
    });
    expect(
      await screen.findByText("TEST mode: only JPG or PNG previews are supported."),
    ).toBeTruthy();
  });

  it("toggles notification channels and keeps the save bar in sync", async () => {
    renderSettings();
    const whatsapp = screen.getByRole("checkbox", {
      name: /WhatsApp job alerts/,
    });
    fireEvent.click(whatsapp);
    expect(
      screen.getByText("You have unsaved edits in this form."),
    ).toBeTruthy();
    expect((whatsapp as HTMLInputElement).checked).toBe(false);
  });
});
