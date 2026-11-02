"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Icon, type IconName } from "@/components/icon";
import { SignOutButton } from "@/features/accounts/sign-out-button";
import { useDeviceValue } from "@/lib/device-store";
import { readJson } from "./api";
import {
  artisanPreferenceStore,
  type ArtisanPreferences,
} from "./device-settings";
import type { ArtisanDesk } from "./types";
import { Crumbs, Head, PanelHead } from "./ui";

type AccountProfile = {
  role: string;
  display_name: string;
  email: string | null;
};

const sections: readonly { id: string; label: string; icon: IconName }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "alerts", label: "Job alerts", icon: "bell" },
  { id: "work", label: "Work settings", icon: "hammer" },
  { id: "security", label: "Sign-in & security", icon: "lock" },
  { id: "data", label: "Your data", icon: "download" },
];

const alertOptions: readonly {
  key: keyof ArtisanPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "jobRequests",
    label: "New job requests",
    description: "Work that matches your trade and coverage areas.",
  },
  {
    key: "quoteReplies",
    label: "Quote decisions",
    description: "When a customer accepts, declines or asks about a quote.",
  },
  {
    key: "paymentMilestones",
    label: "Deposit & balance paid",
    description: "Escrow movements on jobs you have been awarded.",
  },
  {
    key: "trainingNudges",
    label: "Training suggestions",
    description: "New guides picked for the work you take on.",
  },
];

export function ArtisanSettingsScreen() {
  const prefs = useDeviceValue(artisanPreferenceStore);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readJson<AccountProfile>("/api/account/profile")
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setProfileError(err instanceof Error ? err.message : "Could not load your account.");
        setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const nameValue = nameDraft ?? profile?.display_name ?? "";

  function updatePreference<K extends keyof ArtisanPreferences>(
    key: K,
    value: ArtisanPreferences[K],
  ) {
    artisanPreferenceStore.write({ ...prefs, [key]: value });
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
      const updated = await readJson<{ display_name: string }>("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: trimmed }),
      });
      setNameDraft(updated.display_name);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function downloadRecords() {
    setExporting(true);
    setExportError(null);
    try {
      const desk = await readJson<ArtisanDesk>("/api/artisan/desk");
      const payload = {
        exported_at: new Date().toISOString(),
        account: {
          display_name: nameValue,
          email: profile?.email ?? null,
          role: profile?.role ?? null,
        },
        work_profile: desk.profile,
        open_requests: desk.open_requests,
        quotes: desk.quotes,
        jobs: desk.jobs,
        payments: desk.payments,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sabiwork-artisan-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Could not build the export.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="aw-page">
      <Crumbs
        trail={[
          { label: "SabiWork", href: "/" },
          { label: "Artisan workspace", href: "/artisan" },
          { label: "Settings" },
        ]}
      />

      <Head
        title="Artisan settings"
        subtitle="Your identity, the alerts you get on this device, and the controls on your workspace."
      />

      <div className="aw-settings-layout">
        <nav className="aw-settings-nav" aria-label="Settings sections">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              <Icon name={section.icon} size={17} />
              <span>{section.label}</span>
            </a>
          ))}
        </nav>

        <div className="aw-settings-body">
          <section id="profile" className="aw-panel">
            <PanelHead
              title="Profile"
              note="Your display name is what customers see on quotes and job updates."
            />

            {profileLoading ? <p className="aw-loading">Loading your account…</p> : null}

            {profileError ? (
              <div className="aw-settings-error">
                <p className="aw-alert aw-alert-error">{profileError}</p>
                <button
                  type="button"
                  className="aw-btn aw-btn-ghost aw-btn-sm"
                  onClick={() => {
                    setProfileError(null);
                    setProfileLoading(true);
                    setReloadKey((key) => key + 1);
                  }}
                >
                  <Icon name="refresh" size={14} />
                  Try again
                </button>
              </div>
            ) : null}

            {!profileLoading && !profileError ? (
              <form className="aw-form" onSubmit={saveProfile}>
                <label className="aw-field">
                  <span>Display name</span>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={nameValue}
                    onChange={(event) => {
                      setNameDraft(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>

                <div className="aw-form-row">
                  <label className="aw-field">
                    <span>Email address</span>
                    <input type="email" value={profile?.email ?? "Not available"} readOnly />
                    <small>Managed by your sign-in provider. Contact support to change it.</small>
                  </label>

                  <div className="aw-field">
                    <span>Account type</span>
                    <span className="aw-readonly-value">
                      <Icon name="hammer" size={15} />
                      {(profile?.role ?? "artisan").replace(/^./, (char) => char.toUpperCase())}
                    </span>
                    <small>Artisan settings are separate from your customer account settings.</small>
                  </div>
                </div>

                {saveError ? <p className="aw-alert aw-alert-error">{saveError}</p> : null}
                {saved ? <p className="aw-alert aw-alert-success">Display name updated.</p> : null}

                <div className="aw-form-actions">
                  <button className="aw-btn aw-btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </form>
            ) : null}
          </section>

          <section id="alerts" className="aw-panel">
            <PanelHead
              title="Job alerts"
              note="Choose what the workspace flags for you while you are on dispatch."
            />

            <div className="aw-switch-list">
              {alertOptions.map((option) => (
                <label key={option.key} className="aw-switch-row">
                  <span className="aw-switch-copy">
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    className="aw-switch-input"
                    checked={prefs[option.key]}
                    onChange={(event) => updatePreference(option.key, event.target.checked)}
                  />
                </label>
              ))}
            </div>

            <p className="aw-panel-note">
              Alerts are saved on this device only and are kept apart from your customer notification
              choices. Email and push delivery are not connected yet.
            </p>
          </section>

          <section id="work" className="aw-panel">
            <PanelHead
              title="Work settings"
              note="Trade, coverage and availability live on the pages built for them."
            />

            <div className="aw-settings-list">
              <div className="aw-settings-row">
                <div>
                  <strong>Work profile &amp; rates</strong>
                  <span>Trade, coverage areas, bio and starting rate guidance.</span>
                </div>
                <Link className="aw-btn aw-btn-ghost aw-btn-sm" href="/artisan/profile">
                  Edit profile
                  <Icon name="next" size={14} />
                </Link>
              </div>

              <div className="aw-settings-row">
                <div>
                  <strong>Dispatch availability</strong>
                  <span>Go online or offline and publish your working notes.</span>
                </div>
                <Link className="aw-btn aw-btn-ghost aw-btn-sm" href="/artisan/availability">
                  Set availability
                  <Icon name="next" size={14} />
                </Link>
              </div>

              <div className="aw-settings-row">
                <div>
                  <strong>Training guides</strong>
                  <span>Craft, client etiquette and payment discipline.</span>
                </div>
                <Link className="aw-btn aw-btn-ghost aw-btn-sm" href="/artisan/training">
                  Open training
                  <Icon name="next" size={14} />
                </Link>
              </div>
            </div>
          </section>

          <section id="security" className="aw-panel">
            <PanelHead
              title="Sign-in & security"
              note="Sessions are issued by your SabiWork sign-in provider."
            />

            <div className="aw-settings-list">
              <div className="aw-settings-row">
                <div>
                  <strong>Password</strong>
                  <span>Reset it from the sign-in screen.</span>
                </div>
                <Link className="aw-btn aw-btn-ghost aw-btn-sm" href="/forgot-password">
                  Reset password
                </Link>
              </div>

              <div className="aw-settings-row">
                <div>
                  <strong>This session</strong>
                  <span>Sign out on this device when you are done.</span>
                </div>
                <SignOutButton />
              </div>
            </div>
          </section>

          <section id="data" className="aw-panel">
            <PanelHead
              title="Your data"
              note="Everything SabiWork holds about your artisan work."
            />

            <div className="aw-settings-list">
              <div className="aw-settings-row">
                <div>
                  <strong>Download my records</strong>
                  <span>A JSON file of your work profile, requests, quotes, jobs and payments.</span>
                </div>
                <button
                  type="button"
                  className="aw-btn aw-btn-primary aw-btn-sm"
                  disabled={exporting}
                  onClick={() => void downloadRecords()}
                >
                  <Icon name="download" size={14} />
                  {exporting ? "Preparing…" : "Download"}
                </button>
              </div>
            </div>

            {exportError ? <p className="aw-alert aw-alert-error">{exportError}</p> : null}

            <p className="aw-panel-note">
              Deleting an account is not self-service yet. Contact support and a person will handle
              the request.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
