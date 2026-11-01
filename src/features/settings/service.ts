import {
  demoSettings,
  districtOptions,
  languageOptions,
  timezoneOptions,
  type DemoSettings,
} from "./data";

export type SettingsInput = Partial<Omit<DemoSettings, "channels">> & {
  channels?: Partial<DemoSettings["channels"]>;
};

export type SettingsSaveResult =
  | { ok: true; mode: "demo" }
  | {
      ok: false;
      mode: "demo";
      code: "VALIDATION" | "UNAVAILABLE";
      message: string;
    };

const enumGuard = (
  value: string,
  options: readonly { value: string }[],
  fallback: string,
) => (options.some((option) => option.value === value) ? value : fallback);

/** Merge untrusted partial input onto the demo record, trimming strings and
 * snapping unknown option values back to their safe defaults. */
export function normalizeSettings(input: SettingsInput): DemoSettings {
  const channels = { ...demoSettings.channels, ...input.channels };
  for (const key of Object.keys(channels) as (keyof typeof channels)[]) {
    if (typeof channels[key] !== "boolean") channels[key] = demoSettings[key];
  }
  const text = (value: unknown, fallback: string, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : fallback;
  return {
    fullName: text(input.fullName, demoSettings.fullName, 80),
    email: text(input.email, demoSettings.email, 120).toLowerCase(),
    phone: text(input.phone, demoSettings.phone, 32),
    language: enumGuard(
      String(input.language ?? ""),
      languageOptions,
      demoSettings.language,
    ),
    timezone: enumGuard(
      String(input.timezone ?? ""),
      timezoneOptions,
      demoSettings.timezone,
    ),
    district: enumGuard(
      String(input.district ?? ""),
      districtOptions,
      demoSettings.district,
    ),
    channels: channels as DemoSettings["channels"],
  };
}

export function validateSettings(record: DemoSettings): {
  fullName?: string;
  email?: string;
} {
  const errors: { fullName?: string; email?: string } = {};
  if (!record.fullName) errors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email))
    errors.email = "Enter a valid email address, for example name@example.test.";
  return errors;
}

// In-memory snapshot only. Nothing is written to storage, cookies or a server;
// a page refresh restores the shipped demo values. Replace this adapter
// (single replacement point) with the real settings API on Saturday.
let savedSnapshot: DemoSettings = { ...demoSettings };

async function pause(signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, 220);
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export async function fetchSettings(
  signal?: AbortSignal,
): Promise<DemoSettings> {
  await pause(signal);
  return { ...savedSnapshot, channels: { ...savedSnapshot.channels } };
}

/** TEST mode preview save. The sample address offline@example.test reports an
 * unavailable result so the error and retry states can be demonstrated. */
export async function updateSettings(
  input: SettingsInput,
  signal?: AbortSignal,
): Promise<SettingsSaveResult> {
  const record = normalizeSettings(input);
  const errors = validateSettings(record);
  await pause(signal);
  if (Object.keys(errors).length)
    return {
      ok: false,
      mode: "demo",
      code: "VALIDATION",
      message: "Check the highlighted fields before saving.",
    };
  if (record.email === "offline@example.test")
    return {
      ok: false,
      mode: "demo",
      code: "UNAVAILABLE",
      message:
        "The demo save could not finish. Your edits are still on the form; try again.",
    };
  savedSnapshot = record;
  return { ok: true, mode: "demo" };
}

/** Reset the in-memory snapshot. Used between test runs only. */
export function resetSavedSettings(): void {
  savedSnapshot = { ...demoSettings };
}
