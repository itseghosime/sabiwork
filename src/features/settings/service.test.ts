import { describe, expect, it } from "vitest";
import { demoSettings } from "./data";
import {
  fetchSettings,
  normalizeSettings,
  resetSavedSettings,
  updateSettings,
  validateSettings,
} from "./service";

describe("settings normalisation", () => {
  it("merges partial input, snaps unknown option values and clamps text", () => {
    const record = normalizeSettings({
      fullName: "  Osaze Ighodaro  ",
      email: "  OSAZE@Example.test ",
      phone: "+234 000 000 0000",
      language: "hackerman" as string,
      timezone: "UTC-99" as string,
      district: "mars" as string,
      channels: { whatsapp: false, paymentAlerts: false },
    });
    expect(record.fullName).toBe("Osaze Ighodaro");
    expect(record.email).toBe("osaze@example.test");
    expect(record.language).toBe(demoSettings.language);
    expect(record.timezone).toBe(demoSettings.timezone);
    expect(record.district).toBe(demoSettings.district);
    expect(record.channels).toEqual({
      whatsapp: false,
      emailSummaries: demoSettings.channels.emailSummaries,
      paymentAlerts: false,
    });
  });

  it("rejects blank names and malformed emails", () => {
    expect(
      validateSettings({ ...demoSettings, fullName: "   ", email: "nope" }),
    ).toEqual({
      fullName: "Enter your full name.",
      email: expect.stringContaining("valid email"),
    });
    expect(validateSettings(demoSettings)).toEqual({});
  });
});

describe("demo save adapter (TEST mode)", () => {
  it("returns validation errors before touching the snapshot", async () => {
    resetSavedSettings();
    const before = await fetchSettings();
    const result = await updateSettings({ email: "not-an-email" });
    expect(result).toMatchObject({ ok: false, code: "VALIDATION" });
    expect(await fetchSettings()).toEqual(before);
  });

  it("saves a valid record into the session snapshot only", async () => {
    resetSavedSettings();
    const result = await updateSettings({ fullName: "Osaze Testperson" });
    expect(result).toEqual({ ok: true, mode: "demo" });
    expect((await fetchSettings()).fullName).toBe("Osaze Testperson");
    resetSavedSettings();
    expect((await fetchSettings()).fullName).toBe("Osaze Ighodaro");
  });

  it("reports the sample unavailable trigger without erasing edits", async () => {
    const result = await updateSettings({ email: "offline@example.test" });
    expect(result).toMatchObject({ ok: false, code: "UNAVAILABLE" });
    expect(result.message).toContain("try again");
    // The snapshot keeps the previously saved record; form edits are not lost.
    expect((await fetchSettings()).email).toBe("osaze@example.test");
  });
});
