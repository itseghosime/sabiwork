"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import {
  channelOptions,
  districtOptions,
  languageOptions,
  settingsSections,
  timezoneOptions,
  type DemoSettings,
} from "./data";
import { updateSettings, type SettingsInput } from "./service";

type SaveStatus = "pristine" | "dirty" | "saving" | "saved" | "error";

const maxLength = 2 * 1024 * 1024;

export function AccountSettings({
  initialSettings,
}: {
  initialSettings: DemoSettings;
}) {
  const responseId = useId();
  const [draft, setDraft] = useState<DemoSettings>(initialSettings);
  const [values, setValues] = useState<DemoSettings>(initialSettings);
  const [status, setStatus] = useState<SaveStatus>("pristine");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"discard" | "logout" | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoRef = useRef<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    },
    [],
  );

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(values),
    [draft, values],
  );

  const protect = (value: string, max: number) => value.slice(0, max);

  const save = async () => {
    if (status === "saving") return;
    setStatus("saving");
    setToast(null);
    const input: SettingsInput = {
      fullName: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      language: draft.language,
      timezone: draft.timezone,
      district: draft.district,
      channels: { ...draft.channels },
    };
    try {
      const result = await updateSettings(input);
      if (!result.ok) {
        setEmailError(result.code === "VALIDATION" ? result.message : null);
        setStatus("error");
        return;
      }
      setValues(draft);
      setStatus("saved");
      setEmailError(null);
      setToast("Demo save finished. TEST mode: nothing was sent to a server.");
    } catch {
      setStatus("error");
      setToast("The demo save was interrupted. Your edits are still here.");
    }
  };

  const discard = () => {
    setDraft(values);
    setStatus("pristine");
    setEmailError(null);
    setDialog(null);
  };

  const applyPhoto = (url: string | null) => {
    if (photoRef.current && photoRef.current !== url) {
      URL.revokeObjectURL(photoRef.current);
    }
    photoRef.current = url;
    setPhotoUrl(url);
  };

  const changePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!/^(image\/(png|jpe?g))$/.test(file.type)) {
      setToast("TEST mode: only JPG or PNG previews are supported.");
      return;
    }
    if (file.size > maxLength) {
      setToast("That file is larger than 2MB. Choose a smaller image.");
      return;
    }
    applyPhoto(URL.createObjectURL(file));
    setToast("Photo preview attached. Uploads are not sent anywhere yet.");
  };

  const removePhoto = () => {
    applyPhoto(null);
  };

  const statusDotClass =
    status === "error"
      ? "settings-dot settings-dot-error"
      : status === "saved"
        ? "settings-dot settings-dot-done"
        : status === "saving"
          ? "settings-dot settings-dot-live"
          : "settings-dot";

  const statusText =
    status === "error"
      ? "Fix the highlighted field, then try saving again."
      : status === "saving"
        ? "Saving (demo)…"
        : dirty
          ? "You have unsaved edits in this form."
          : status === "saved"
            ? "Saved for this demo session only — nothing is persisted."
            : "TEST mode: these details are simulated and not saved anywhere.";

  const saveLabel =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Try saving again"
          : "Save changes";

  if (signedOut) {
    return (
      <div className="settings-out">
        <span className="settings-out-icon">
          <Icon name="back" size={30} />
        </span>
        <h2>Demo sign-out finished.</h2>
        <p>
          In the real platform this ends your session on this device and clears
          its access. This demo has no session to end — the workspace is still
          here so you can keep exploring.
        </p>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setSignedOut(false);
            setStatus("pristine");
          }}
        >
          Back to account settings
        </button>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-heading">
        <p className="eyebrow">ACCOUNT · DEMO SCREEN</p>
        <h1>Account settings</h1>
        <p>
          Contact details, alerts and safety options for your demo workspace.
          Trade portfolio edits live on the artisan profile screen, which a
          different feature owner builds and is not part of this page.
        </p>
        <div className="demo-notice" role="note">
          <Icon name="help" size={18} />
          <p>
            <strong>Frontend demo</strong> · Saving is simulated in TEST mode;
            nothing is sent to a server or stored beyond this page session.
          </p>
        </div>
      </header>

      <div className="settings-layout">
        <nav aria-label="Settings sections" className="settings-menu">
          <p className="settings-menu-eyebrow">On this page</p>
          {settingsSections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              <Icon name="next" size={14} />
              {section.title}
            </a>
          ))}
        </nav>

        <div className="settings-columns">
          {/* Profile & identity */}
          <section id="identity" className="settings-card">
            <h2>Profile &amp; personal identity</h2>
            <p className="settings-card-note">
              Your name and contact points for job communication.
            </p>
            <div className="settings-photo-row">
              <span className="settings-portrait" aria-hidden="true">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL preview only, never a server asset
                  <img src={photoUrl} alt="" />
                ) : (
                  <span className="portrait-fallback">OI</span>
                )}
              </span>
              <div className="settings-photo-actions">
                <div className="settings-photo-buttons">
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => photoInput.current?.click()}
                  >
                    Change photo
                  </button>
                  <button
                    className="button button-outline settings-photo-remove"
                    type="button"
                    onClick={removePhoto}
                  >
                    Remove preview
                  </button>
                </div>
                <p className="settings-photo-note">
                  Preview only · JPG or PNG, up to 2MB. Photo uploads are not
                  connected to a server yet.
                </p>
              </div>
              <input
                ref={photoInput}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  changePhoto(event.target.files?.[0]);
                  event.target.value = "";
                }}
                className="sr-only"
                aria-label="Choose a profile photo to preview"
              />
            </div>
            <div className="settings-fields">
              <label className="input-label settings-span">
                Full name
                <input
                  value={draft.fullName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      fullName: protect(event.target.value, 80),
                    }))
                  }
                  maxLength={80}
                />
              </label>
              <label className="input-label">
                Email address
                <input
                  type="email"
                  value={draft.email}
                  aria-describedby={emailError ? responseId : undefined}
                  aria-invalid={Boolean(emailError)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      email: protect(event.target.value, 120),
                    }))
                  }
                />
              </label>
              {emailError && (
                <p id={responseId} className="settings-error" role="alert">
                  {emailError}
                </p>
              )}
              <label className="input-label">
                Mobile phone
                <input
                  type="tel"
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      phone: protect(event.target.value, 32),
                    }))
                  }
                />
              </label>
            </div>
            <div className="settings-readonly">
              <span className="settings-readonly-label">
                <Icon name="lock" size={16} />
                Account role
              </span>
              <span className="settings-bubble">Artisan · demo role</span>
              <p>
                Roles come from the verified server session and cannot be
                changed here. Role changes are part of the backend handoff with
                the accounts owner.
              </p>
            </div>
          </section>

          {/* Regional & notifications */}
          <section id="preferences" className="settings-card">
            <h2>Regional &amp; notification preferences</h2>
            <p className="settings-card-note">
              Display defaults for the demo workspace and how alerts arrive.
            </p>
            <div className="settings-fields settings-three">
              <label className="input-label">
                Language
                <select
                  value={draft.language}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      language: event.target.value,
                    }))
                  }
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="input-label">
                Timezone
                <select
                  value={draft.timezone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      timezone: event.target.value,
                    }))
                  }
                >
                  {timezoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="input-label">
                Primary service area
                <select
                  value={draft.district}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      district: event.target.value,
                    }))
                  }
                >
                  {districtOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="settings-channels">
              <legend>Direct operational channels</legend>
              {channelOptions.map((channel) => {
                const checked = draft.channels[channel.id];
                return (
                  <label key={channel.id} className="settings-channel-row">
                    <span className="settings-channel-copy">
                      <strong>{channel.title}</strong>
                      {channel.description}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          channels: {
                            ...current.channels,
                            [channel.id]: event.target.checked,
                          },
                        }))
                      }
                    />
                  </label>
                );
              })}
            </fieldset>
          </section>

          {/* Security */}
          <section id="security" className="settings-card">
            <h2>Security &amp; password management</h2>
            <p className="settings-card-note">
              Password recovery is handled by the shared account screens.
            </p>
            <div className="settings-duo">
              <div className="settings-duo-item">
                <span className="settings-readonly-label">Account password</span>
                <p>
                  Passwords are never stored or displayed in this demo. Reset
                  happens through the recovery flow.
                </p>
                <Link className="button button-subtle" href="/reset-password">
                  Change password
                </Link>
              </div>
              <div className="settings-duo-item">
                <span className="settings-readonly-label">
                  Two-factor authentication
                </span>
                <p>
                  Two-factor setup needs real tokens and the auth backend.
                  Security enforcement is a later handoff, so TEST mode offers a
                  preview only.
                </p>
                <span className="settings-pending-pill">Backend pending</span>
              </div>
            </div>
          </section>

          {/* Sessions */}
          <section id="sessions" className="settings-card">
            <h2>Connected sessions</h2>
            <p className="settings-card-note">
              Sample row only — the demo has no real sessions to list.
            </p>
            <div className="settings-session-row">
              <span className="settings-session-icon">
                <Icon name="home" size={20} />
              </span>
              <div>
                <strong>Sample session · this browser</strong>
                <p>Example entry shown to preview the layout.</p>
              </div>
              <span className="settings-pending-pill">Demo data</span>
            </div>
          </section>

          {/* Danger zone */}
          <section id="danger-zone" className="settings-card settings-danger">
            <h2>Danger zone</h2>
            <div className="settings-danger-row">
              <div>
                <strong>Sign out of the demo workspace</strong>
                <p>Ends access on this browser in the real platform.</p>
              </div>
              <button
                className="button button-danger"
                type="button"
                onClick={() => setDialog("logout")}
              >
                Log out
              </button>
            </div>
            <div className="settings-danger-row settings-danger-muted">
              <div>
                <strong>Deactivate this account</strong>
                <p>
                  Needs a real backend account, so it is unavailable in TEST
                  mode.
                </p>
              </div>
              <button
                className="button button-outline"
                type="button"
                disabled
                aria-disabled="true"
              >
                Request deactivation
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="settings-savebar" role="region" aria-label="Save changes">
        <p aria-live="polite" className="settings-savebar-status">
          <span className={statusDotClass} aria-hidden="true" />
          <span className={dirty ? "settings-unsaved" : ""}>{statusText}</span>
        </p>
        <div className="settings-savebar-actions">
          <button
            className="button button-outline"
            type="button"
            disabled={!dirty || status === "saving"}
            onClick={() => setDialog("discard")}
          >
            Cancel / revert
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={save}
            disabled={status === "saving"}
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="settings-toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}

      {dialog === "discard" && (
        <Modal
          title="Discard unsaved changes?"
          onClose={() => setDialog(null)}
          onConfirm={discard}
          confirmLabel="Discard & exit"
          confirmClass="button-danger"
          body="Your edits stay on the form only until you save. Discarding restores the last demo snapshot."
        />
      )}
      {dialog === "logout" && (
        <Modal
          title="Log out of the demo workspace?"
          onClose={() => setDialog(null)}
          confirmLabel="Confirm log out"
          confirmClass="button-danger"
          body="This shows the demo sign-out state. Any unsaved edits on this page are discarded."
          onConfirm={() => {
            setDialog(null);
            setDraft(values);
            setStatus("pristine");
            setSignedOut(true);
          }}
        />
      )}
    </div>
  );
}

function Modal({
  title,
  body,
  onClose,
  onConfirm,
  confirmLabel,
  confirmClass,
}: {
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmClass: string;
}) {
  const confirm = useRef<HTMLButtonElement>(null);
  return (
    <div
      className="settings-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="settings-modal-actions">
          <button className="button button-outline" type="button" onClick={onClose}>
            Keep editing
          </button>
          <button
            ref={confirm}
            className={`button ${confirmClass}`}
            type="button"
            onClick={onConfirm}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- focus moves into the dialog on open and returns on close
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
