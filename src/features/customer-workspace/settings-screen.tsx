"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { Icon, type IconName } from "@/components/icon";
import { SignOutButton } from "@/features/accounts/sign-out-button";
import { areas } from "@/features/search/data";
import {
  preferenceStore,
  useDeviceValue,
  type CustomerPreferences,
} from "./device-settings";
import { useScreenData } from "./hooks";
import { customerService, readJson } from "./service";

interface AccountProfile {
  role: string;
  display_name: string;
  email: string | null;
}

const sections: readonly { id: string; label: string; icon: IconName }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "work", label: "Work capability", icon: "hammer" },
  { id: "security", label: "Sign-in & security", icon: "lock" },
  { id: "data", label: "Your data", icon: "download" },
];

const preferences: readonly {
  key: Exclude<keyof CustomerPreferences, "preferredArea">;
  label: string;
  description: string;
}[] = [
  {
    key: "bookingUpdates",
    label: "Booking updates",
    description: "Status changes on work you have booked.",
  },
  {
    key: "quoteAlerts",
    label: "Quote alerts",
    description: "New quotes and replies on your published requests.",
  },
  {
    key: "paymentReminders",
    label: "Milestone reminders",
    description: "Nudges when a deposit or balance milestone is due.",
  },
  {
    key: "productNews",
    label: "Product news",
    description: "Occasional updates about new SabiWork features.",
  },
];

export function SettingsScreen() {
  const prefs = useDeviceValue(preferenceStore);

  const fetchAccount = useCallback(async () => {
    const [profile, workProfile] = await Promise.all([
      readJson<AccountProfile>("/api/account/profile"),
      readJson<{ primary_trade: string }>("/api/profiles/artisan").catch(() => null),
    ]);
    return { profile, workProfile };
  }, []);

  const { data, loading, error, retry } = useScreenData(
    fetchAccount,
    "Could not load your account settings.",
  );

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const profile = data?.profile;
  const workProfile = data?.workProfile ?? null;
  const nameValue = displayName ?? profile?.display_name ?? "";

  function updatePreference<K extends keyof CustomerPreferences>(
    key: K,
    value: CustomerPreferences[K],
  ) {
    preferenceStore.write({ ...prefs, [key]: value });
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const trimmed = nameValue.trim();
    if (trimmed.length < 2) {
      setSaveError("Use at least 2 characters for your display name.");
      setSaved(false);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await readJson<{ display_name: string }>(
        "/api/account/profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: trimmed }),
        },
      );
      setDisplayName(updated.display_name);
      setSaved(true);
    } catch (saveReason) {
      setSaveError(
        saveReason instanceof Error
          ? saveReason.message
          : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function downloadAccount() {
    setExporting(true);
    setExportError(null);
    try {
      const [jobs, requests] = await Promise.all([
        customerService.listJobs(),
        customerService.listRequests(),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        account: {
          display_name: nameValue,
          email: profile?.email ?? null,
          role: profile?.role ?? null,
          preferred_area: prefs.preferredArea,
        },
        requests,
        jobs,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sabiwork-account-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportReason) {
      setExportError(
        exportReason instanceof Error
          ? exportReason.message
          : "Could not build the export.",
      );
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <section className="cb-page">
        <header className="cb-page-head">
          <div className="cb-page-head-copy">
            <p className="cb-eyebrow">
              <span>Settings</span>
            </p>
            <h1>Account settings</h1>
          </div>
        </header>
        <div className="cb-panel">
          <p className="cb-loading">Loading your account...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="cb-page">
        <header className="cb-page-head">
          <div className="cb-page-head-copy">
            <p className="cb-eyebrow">
              <span>Settings</span>
            </p>
            <h1>Account settings</h1>
          </div>
        </header>
        <div className="cb-error-state">
          <p>{error}</p>
          <button type="button" className="button button-outline" onClick={retry}>
            <Icon name="refresh" size={15} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Settings</span>
            <span>Benin City</span>
          </p>
          <h1>Account settings</h1>
          <p>
            Your identity, how SabiWork reaches you, and the controls on your
            account.
          </p>
        </div>
      </header>

      <div className="cb-settings-layout">
        <nav className="cb-settings-nav" aria-label="Settings sections">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              <Icon name={section.icon} size={17} />
              {section.label}
            </a>
          ))}
        </nav>

        <div className="cb-settings-body">
          <section id="profile" className="cb-panel">
            <div className="cb-panel-head">
              <h2>Profile</h2>
              <p className="cb-panel-note">
                Your display name is what artisans and support see.
              </p>
            </div>

            <form className="cb-form" onSubmit={saveProfile}>
              <label className="cb-field">
                Display name
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={nameValue}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setSaved(false);
                  }}
                />
              </label>

              <label className="cb-field">
                Email address
                <input
                  type="email"
                  value={profile?.email ?? "Not available"}
                  readOnly
                  aria-describedby="email-help"
                />
                <small id="email-help">
                  Managed by your sign-in provider. Contact support to change it.
                </small>
              </label>

              <div className="cb-field-row">
                <div className="cb-field">
                  Account type
                  <span className="cb-readonly-value">
                    <Icon name="shield" size={15} />
                    {(profile?.role ?? "customer").replace(/^./, (c) => c.toUpperCase())}
                  </span>
                </div>

                <label className="cb-field">
                  Preferred service area
                  <select
                    value={prefs.preferredArea}
                    onChange={(event) =>
                      updatePreference("preferredArea", event.target.value)
                    }
                  >
                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area}, Benin City
                      </option>
                    ))}
                  </select>
                  <small>Stored on this device and used to prefill new requests.</small>
                </label>
              </div>

              {saveError ? (
                <p className="cb-field-error" role="alert">
                  {saveError}
                </p>
              ) : null}
              {saved ? (
                <p className="cb-success">
                  <strong>Profile saved</strong>
                  Your display name was updated in Neon.
                </p>
              ) : null}

              <div className="cb-composer-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </section>

          <section id="notifications" className="cb-panel">
            <div className="cb-panel-head">
              <h2>Notifications</h2>
              <p className="cb-panel-note">
                Choose what appears on your{" "}
                <Link href="/notifications">notifications page</Link>.
              </p>
            </div>

            <div className="cb-switch-list">
              {preferences.map((preference) => (
                <label key={preference.key} className="cb-switch-row">
                  <span className="cb-switch-copy">
                    <strong>{preference.label}</strong>
                    <span>{preference.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    className="cb-switch"
                    checked={prefs[preference.key]}
                    onChange={(event) =>
                      updatePreference(preference.key, event.target.checked)
                    }
                  />
                </label>
              ))}
            </div>

            <p className="cb-footnote">
              Preferences are saved on this device. Email and push delivery are
              not connected yet, so turning a category off hides it from this
              browser only.
            </p>
          </section>

          <section id="work" className="cb-panel">
            <div className="cb-panel-head">
              <h2>Work capability</h2>
              <p className="cb-panel-note">
                One login can hire artisans and offer services at the same time.
              </p>
            </div>

            {workProfile ? (
              <div className="cb-work-banner">
                <span className="cb-empty-icon">
                  <Icon name="hammer" size={20} />
                </span>
                <div>
                  <strong>Artisan profile active</strong>
                  <p>
                    You offer services as {workProfile.primary_trade}. Switch to
                    the artisan workspace to manage jobs and availability.
                  </p>
                  <Link className="button button-outline" href="/artisan">
                    Open artisan workspace
                    <Icon name="arrow" size={15} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="cb-work-banner muted">
                <span className="cb-empty-icon">
                  <Icon name="hammer" size={20} />
                </span>
                <div>
                  <strong>Not offering services yet</strong>
                  <p>
                    Create an artisan work profile to receive job requests
                    without a second login.
                  </p>
                  <Link className="button button-outline" href="/artisan/profile">
                    Create work profile
                    <Icon name="arrow" size={15} />
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section id="security" className="cb-panel">
            <div className="cb-panel-head">
              <h2>Sign-in &amp; security</h2>
              <p className="cb-panel-note">
                Sessions are issued by your SabiWork sign-in provider.
              </p>
            </div>

            <ul className="cb-settings-list">
              <li>
                <div>
                  <strong>Password</strong>
                  <span>Reset it from the sign-in screen.</span>
                </div>
                <Link className="button button-outline" href="/forgot-password">
                  Reset password
                </Link>
              </li>
              <li>
                <div>
                  <strong>This session</strong>
                  <span>Sign out on this device when you are done.</span>
                </div>
                <SignOutButton />
              </li>
            </ul>
          </section>

          <section id="data" className="cb-panel">
            <div className="cb-panel-head">
              <h2>Your data</h2>
              <p className="cb-panel-note">
                Everything SabiWork stores about your requests and bookings.
              </p>
            </div>

            <div className="cb-settings-list">
              <div className="cb-settings-row">
                <div>
                  <strong>Download my records</strong>
                  <span>
                    A JSON file of your requests, bookings, quotes and reviews.
                  </span>
                </div>
                <button
                  type="button"
                  className="button button-outline"
                  disabled={exporting}
                  onClick={() => void downloadAccount()}
                >
                  <Icon name="download" size={15} />
                  {exporting ? "Preparing..." : "Download"}
                </button>
              </div>
            </div>

            {exportError ? (
              <p className="cb-field-error" role="alert">
                {exportError}
              </p>
            ) : null}

            <p className="cb-footnote">
              Deleting an account is not self-service yet. Contact support and a
              person will handle the request.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
