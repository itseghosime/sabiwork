import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  defaultPreferences,
  notificationReadStore,
  preferenceStore,
} from "./device-settings";
import { NotificationsScreen } from "./notifications-screen";
import { RequestComposerScreen } from "./request-composer-screen";
import { SettingsScreen } from "./settings-screen";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
  usePathname: () => "/notifications",
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: { signOut: vi.fn() },
}));

const fetchMock = vi.hoisted(() => vi.fn());

const jsonResponse = (status: number, body: unknown = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const envelope = (data: unknown) => jsonResponse(200, { data });

const job = {
  id: "job_1",
  request_id: "req_1",
  status: "accepted",
  customer_id: "cust_1",
  worker_id: "worker_1",
  title: "Kitchen pipe repair",
  category: "Plumbing",
  service_area: "GRA, Benin City",
  budget_guidance_kobo: 3_500_000,
  total_quote_kobo: 3_200_000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function routeFetch(routes: Record<string, () => unknown>) {
  fetchMock.mockImplementation((input: string) => {
    const match = Object.keys(routes).find((key) => input.startsWith(key));
    if (!match) return Promise.resolve(jsonResponse(404, { error: {} }));
    return Promise.resolve(routes[match]());
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  navigationMocks.push.mockReset();
  notificationReadStore.write([]);
  preferenceStore.write(defaultPreferences);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RequestComposerScreen", () => {
  it("blocks publishing an incomplete brief", async () => {
    render(<RequestComposerScreen />);

    fireEvent.click(screen.getByRole("button", { name: /Publish request/ }));

    expect(
      await screen.findByText(/title of at least 3 characters/i),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(navigationMocks.push).not.toHaveBeenCalled();
  });

  it("submits the brief to the requests API and opens the new request", async () => {
    routeFetch({
      "/api/requests": () => envelope({ id: "req_42" }),
    });

    render(<RequestComposerScreen />);

    fireEvent.change(screen.getByPlaceholderText(/Kitchen pipe burst repair/i), {
      target: { value: "Kitchen pipe burst repair" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Describe the task, materials needed/i),
      {
        target: {
          value: "Burst pipe under the kitchen sink leaking into the cabinet.",
        },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /Publish request/ }));

    await waitFor(() => expect(navigationMocks.push).toHaveBeenCalledWith("/requests/req_42"));

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.status).toBe("submitted");
    expect(body.category).toBe("Plumbing");
    expect(body.service_area).toBe("GRA, Benin City");
    expect(body.budget_guidance_kobo).toBe(3_500_000);
  });
});

describe("NotificationsScreen", () => {
  it("derives notices from bookings and flags them unread", async () => {
    routeFetch({
      "/api/jobs": () => envelope([job]),
      "/api/requests": () => envelope([]),
    });

    render(<NotificationsScreen />);

    expect(await screen.findByText("Deposit due")).toBeTruthy();
    expect(screen.getByText(/mobilisation deposit for Kitchen pipe repair/i)).toBeTruthy();
    expect(screen.getAllByLabelText("Unread").length).toBe(1);
  });

  it("clears the unread count when marked as read", async () => {
    routeFetch({
      "/api/jobs": () => envelope([job]),
      "/api/requests": () => envelope([]),
    });

    render(<NotificationsScreen />);
    await screen.findByText("Deposit due");

    fireEvent.click(screen.getByRole("button", { name: /Mark all as read/ }));

    await waitFor(() => expect(screen.queryAllByLabelText("Unread").length).toBe(0));
    expect(JSON.parse(localStorage.getItem("sabiwork.notifications.read") ?? "[]")).toEqual([
      "job:job_1:accepted",
    ]);
  });
});

describe("SettingsScreen", () => {
  it("shows the signed-in email and saves a new display name", async () => {
    routeFetch({
      "/api/account/profile": () => envelope({
        role: "customer",
        display_name: "Ada Okafor",
        email: "ada@example.test",
      }),
    });

    render(<SettingsScreen />);

    const email = await screen.findByDisplayValue("ada@example.test");
    expect(email.hasAttribute("readonly")).toBe(true);

    const name = screen.getByDisplayValue("Ada Okafor");
    fireEvent.change(name, { target: { value: "Ada N. Okafor" } });
    fireEvent.click(screen.getByRole("button", { name: /Save profile/ }));

    await waitFor(() => expect(screen.getByText(/Profile saved/)).toBeTruthy());

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(post).toBeTruthy();
    expect(JSON.parse(post![1].body)).toEqual({ display_name: "Ada N. Okafor" });
  });

  it("persists a notification preference on the device", async () => {
    routeFetch({
      "/api/account/profile": () => envelope({
        role: "customer",
        display_name: "Ada Okafor",
        email: "ada@example.test",
      }),
    });

    render(<SettingsScreen />);
    await screen.findByDisplayValue("Ada Okafor");

    const [bookingSwitch] = screen.getAllByRole("checkbox");
    expect((bookingSwitch as HTMLInputElement).checked).toBe(true);

    fireEvent.click(bookingSwitch);

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem("sabiwork.customer.preferences") ?? "{}",
      );
      expect(stored.bookingUpdates).toBe(false);
    });
  });
});
