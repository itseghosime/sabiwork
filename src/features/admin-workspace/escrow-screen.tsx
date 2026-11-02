"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  EmptyState,
  FilterTabs,
  KpiCard,
  PageHeader,
  SampleNotice,
  SectionCard,
  StatusPill,
  type Tone,
} from "./admin-ui";
import type { EscrowTransferStatus } from "@/features/payments/transfer";
import {
  escrowStatusLabel,
  formatNaira,
  formatWat,
  pluralUnit,
  type EscrowHold,
  type EscrowStatus,
} from "./admin-data";

type ApiError = { error?: { code?: string; message?: string } };

type TransferStatus = EscrowTransferStatus;

type EscrowHoldRecord = EscrowHold & {
  releasedAtIso: string | null;
  payoutAccountMasked: string | null;
  payoutAccountName: string | null;
  payoutBankCode: string | null;
  recipientReady: boolean;
  transferStatus: TransferStatus | null;
  transferReference: string | null;
  transferFailureReason: string | null;
  paidOutAtIso: string | null;
};

type TransferOutcome =
  | { state: "paid"; reference: string; amountKobo: number; accountName: string | null }
  | { state: "otp_required"; reference: string; transferCode: string | null }
  | { state: "in_flight"; reference: string };

type ReleaseResponse = { hold: EscrowHoldRecord | null; transfer: TransferOutcome };

type Bank = { name: string; code: string };

type EscrowTotals = {
  held: number;
  releaseDue: number;
  released: number;
  disputed: number;
  dueToday: number;
};

class ApiFailure extends Error {
  readonly code: string | null;
  constructor(message: string, code: string | null) {
    super(message);
    this.name = "ApiFailure";
    this.code = code;
  }
}

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new ApiFailure(
      body.error?.message ?? "Request failed.",
      body.error?.code ?? null,
    );
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

const transferTone: Record<TransferStatus, Tone> = {
  pending: "info",
  otp: "warning",
  success: "success",
  failed: "danger",
  reversed: "danger",
  abandoned: "neutral",
};

const transferLabel: Record<TransferStatus, string> = {
  pending: "Payout in flight",
  otp: "Awaiting OTP",
  success: "Paid out",
  failed: "Payout failed",
  reversed: "Payout reversed",
  abandoned: "Payout abandoned",
};

const statusTone: Record<EscrowStatus, Tone> = {
  held: "info",
  release_due: "warning",
  released: "success",
  disputed: "danger",
};

type StatusFilter = EscrowStatus | "all";

export function AdminEscrowScreen() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [holds, setHolds] = useState<EscrowHoldRecord[]>([]);
  const [totals, setTotals] = useState<EscrowTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingRelease, setPendingRelease] = useState<EscrowHoldRecord | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savingPayee, setSavingPayee] = useState(false);
  const [otp, setOtp] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const next = await readJson<{ holds: EscrowHoldRecord[]; totals: EscrowTotals }>("/api/admin/escrow");
      setHolds(next.holds);
      setTotals(next.totals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the escrow ledger.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    readJson<{ holds: EscrowHoldRecord[]; totals: EscrowTotals }>("/api/admin/escrow")
      .then((next) => {
        if (!active) return;
        setHolds(next.holds);
        setTotals(next.totals);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load the escrow ledger.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return holds.filter((hold) => {
      if (status !== "all" && hold.status !== status) return false;
      if (!needle) return true;
      return [hold.id, hold.title, hold.customerName, hold.artisanName, hold.trade, hold.jobRef]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [holds, status, query]);

  const dueSchedule = useMemo(
    () =>
      holds
        .filter((hold) => hold.status === "release_due")
        .slice()
        .sort((a, b) => new Date(a.releaseDueIso).getTime() - new Date(b.releaseDueIso).getTime()),
    [holds],
  );

  const readyToRelease = holds.filter((hold) => hold.status === "release_due" && hold.signedOff).length;
  const needsPayee = holds.filter((hold) => hold.status !== "released" && !hold.recipientReady).length;
  const failedPayouts = holds.filter(
    (hold) => hold.transferStatus === "failed" || hold.transferStatus === "reversed",
  ).length;

  const openRelease = useCallback(async (hold: EscrowHoldRecord) => {
    setPendingRelease(hold);
    setError(null);
    setNotice(null);
    setOtp("");
    setAccountNumber("");
    setBankCode(hold.payoutBankCode ?? "");
    setAwaitingOtp(hold.transferStatus === "otp");
    if (hold.recipientReady || banks.length > 0) return;
    try {
      const next = await readJson<{ banks: Bank[] }>("/api/admin/banks");
      setBanks(next.banks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the bank list.");
    }
  }, [banks.length]);

  async function savePayee() {
    if (!pendingRelease) return;
    setSavingPayee(true);
    setError(null);
    setNotice(null);
    try {
      const bank = banks.find((entry) => entry.code === bankCode);
      const next = await readJson<{ hold: EscrowHoldRecord | null }>(
        `/api/admin/escrow/${pendingRelease.id}/payout-details`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber, bankCode, bankName: bank?.name ?? "" }),
        },
      );
      if (next.hold) setPendingRelease(next.hold);
      setNotice(`Payout account saved for ${next.hold?.payoutAccountName ?? "this artisan"}. You can release the milestone now.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the payout account.");
    } finally {
      setSavingPayee(false);
    }
  }

  function applyOutcome(next: ReleaseResponse) {
    const outcome = next.transfer;
    if (outcome.state === "paid") {
      setNotice(
        `${formatNaira(outcome.amountKobo)} sent to ${outcome.accountName ?? "the artisan"} · reference ${outcome.reference}.`,
      );
      setPendingRelease(null);
      setAwaitingOtp(false);
      return;
    }
    if (outcome.state === "otp_required") {
      setAwaitingOtp(true);
      if (next.hold) setPendingRelease(next.hold);
      setNotice("Paystack sent a transfer OTP. Enter it to finish the payout.");
      return;
    }
    if (next.hold) setPendingRelease(next.hold);
    setNotice(`Payout ${outcome.reference} is in flight with Paystack. Refresh to see the final state.`);
  }

  async function confirmRelease() {
    if (!pendingRelease) return;
    setReleasing(true);
    setError(null);
    setNotice(null);
    try {
      const next = await readJson<ReleaseResponse>(`/api/admin/escrow/${pendingRelease.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release" }),
      });
      applyOutcome(next);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not release this milestone.";
      setError(message);
      // A stale card can go out of step with the ledger; reload so the modal
      // shows the real transfer state instead of a stale one.
      if (err instanceof ApiFailure && (err.code === "NEEDS_PAYEE" || err.code === "NOT_PAYABLE")) {
        await load();
      }
    } finally {
      setReleasing(false);
    }
  }

  async function submitOtp() {
    if (!pendingRelease) return;
    setReleasing(true);
    setError(null);
    setNotice(null);
    try {
      const next = await readJson<ReleaseResponse>(`/api/admin/escrow/${pendingRelease.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      setOtp("");
      applyOutcome(next);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paystack rejected that OTP.");
    } finally {
      setReleasing(false);
    }
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Escrow & payouts" }]}
        title="Escrow &amp; payouts"
        description="Track held milestones, release windows, and payout readiness across active jobs."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              <Icon name="refresh" size={16} />
              <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setStatus("release_due")}>
              <Icon name="clock" size={16} />
              <span>Release due ({totals?.dueToday ?? 0})</span>
            </button>
            <Link className="ad-btn ad-btn-primary" href="/admin/audit">
              <Icon name="scroll" size={16} />
              <span>Audit trail</span>
            </Link>
          </>
        }
        meta={
          <>
            <StatusPill tone="warning">{totals?.dueToday ?? 0} releases due</StatusPill>
            <StatusPill tone="danger" dot={false}>
              {holds.filter((hold) => hold.status === "disputed").length} disputed
            </StatusPill>
            <StatusPill tone="neutral" dot={false}>Neon records</StatusPill>
          </>
        }
      />

      <SampleNotice>
        Releases use Paystack test mode only. No real money moves and no escrow guarantee is provided.
        A test transfer is sent to the artisan&apos;s resolved NUBAN recipient. Payout accounts are resolved with Paystack before they can be used, and a
        failed or reversed transfer leaves the milestone payable instead of marking it released.
      </SampleNotice>

      {error ? (
        <p className="ad-inline-notice is-danger" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      ) : null}

      <section className="ad-kpi-grid" aria-label="Escrow metrics">
        <KpiCard label="Held in escrow" value={formatNaira(totals?.held ?? 0)} icon="banknote" tone="info" footnote="Held + release due" />
        <KpiCard
          label="Release due"
          value={formatNaira(totals?.releaseDue ?? 0)}
          icon="clock"
          tone="warning"
          footnote={`${totals?.dueToday ?? 0} ${pluralUnit(totals?.dueToday ?? 0, "milestone")}`}
        />
        <KpiCard label="Released" value={formatNaira(totals?.released ?? 0)} icon="checkCircle" tone="success" footnote="Recorded releases" />
        <KpiCard label="In dispute" value={formatNaira(totals?.disputed ?? 0)} icon="gavel" tone="danger" footnote="Frozen pending review" />
      </section>

      <div className="ad-toolbar">
        <div className="ad-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hold ref, job, artisan, or trade…"
            aria-label="Search escrow holds"
          />
        </div>
        <FilterTabs
          ariaLabel="Filter escrow holds by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: holds.length },
            { value: "held", label: "Held" },
            { value: "release_due", label: "Release due" },
            { value: "released", label: "Released" },
            { value: "disputed", label: "Disputed" },
          ]}
        />
      </div>

      {notice ? (
        <p className="ad-inline-notice ad-inline-notice-wide" role="status">
          <Icon name="checkCircle" size={16} /> {notice}
        </p>
      ) : null}

      {loading ? (
        <p className="ad-loading" role="status">
          Retrieving escrow holds from Neon…
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="banknote"
          title="No escrow holds match this view"
          message="Try a different status or clear the search field."
          action={
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => { setStatus("all"); setQuery(""); }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Hold &amp; job</th>
                <th>Parties</th>
                <th>Milestone</th>
                <th>Amount</th>
                <th>Release due</th>
                <th>Status</th>
                <th className="ad-cell-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hold) => (
                <tr key={hold.id}>
                  <td>
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong ad-cell-nowrap">{hold.id}</span>
                      <span className="ad-cell-muted">{hold.title}</span>
                      <span className="ad-cell-muted">{hold.trade} · {hold.area}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong">{hold.customerName}</span>
                      <span className="ad-cell-muted">→ {hold.artisanName}</span>
                      <span className="ad-cell-muted">{hold.payoutBank}</span>
                      <span className="ad-cell-muted">
                        {hold.recipientReady
                          ? (hold.payoutAccountMasked ?? "Account on file")
                          : "No payout account"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusPill tone="neutral" dot={false}>{hold.milestone}</StatusPill>
                  </td>
                  <td>
                    <span className="ad-cell-strong">{formatNaira(hold.amountKobo)}</span>
                  </td>
                  <td>
                    <div className="ad-cell-stack">
                      <span className="ad-cell-strong">{formatWat(hold.releaseDueIso)}</span>
                      <span className="ad-cell-muted">
                        {hold.status === "released" && hold.releasedAtIso
                          ? `Released ${formatWat(hold.releasedAtIso)}`
                          : hold.signedOff
                            ? "Signed off"
                            : "Awaiting sign-off"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ad-cell-stack">
                      <StatusPill tone={statusTone[hold.status]}>{escrowStatusLabel[hold.status]}</StatusPill>
                      {hold.transferStatus ? (
                        <StatusPill tone={transferTone[hold.transferStatus]} dot={false}>
                          {transferLabel[hold.transferStatus]}
                        </StatusPill>
                      ) : null}
                    </div>
                  </td>
                  <td className="ad-cell-right">
                    <button
                      type="button"
                      className="ad-btn ad-btn-ghost ad-btn-sm"
                      disabled={
                        hold.transferStatus === "success" ||
                        !(
                          hold.transferStatus === "otp" || hold.transferStatus === "pending" ||
                          (hold.status === "release_due" && hold.signedOff)
                        )
                      }
                      onClick={() => void openRelease(hold)}
                      title={
                        hold.transferStatus === "success"
                          ? "This milestone has already been paid out"
                          : hold.transferStatus === "pending"
                            ? "A payout is already in flight with Paystack"
                            : hold.transferStatus === "otp"
                              ? "Finish the payout with the transfer OTP"
                              : hold.status !== "release_due"
                                ? "Only milestones due for release can be actioned"
                                : !hold.signedOff
                                  ? "The customer has not signed this milestone off"
                                  : "Release the funds"
                      }
                    >
                      {hold.transferStatus === "pending" ? "Check payout" : hold.transferStatus === "otp" ? "Finish payout" : "Release"} <Icon name="next" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ad-grid-2">
        <SectionCard title="Release schedule" description="Milestones due next, in WAT.">
          {dueSchedule.length === 0 ? (
            <EmptyState icon="checkCircle" title="Nothing due right now" message="No milestone is inside a release window." />
          ) : (
            <ul className="ad-schedule">
              {dueSchedule.map((hold) => (
                <li key={hold.id}>
                  <span className="ad-schedule-time">
                    <Icon name="clock" size={16} />
                    {formatWat(hold.releaseDueIso)}
                  </span>
                  <div className="ad-schedule-body">
                    <strong>{formatNaira(hold.amountKobo)}</strong>
                    <span>{hold.artisanName} · {hold.payoutBank}</span>
                  </div>
                  <StatusPill tone="warning" dot={false}>{hold.milestone}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Payout health" description="What is ready to move and what is blocked.">
          <ul className="ad-health-list">
            <li>
              <span className="ad-health-icon is-success"><Icon name="checkCircle" size={17} /></span>
              <div>
                <strong>Ready to release</strong>
                <p>{readyToRelease} signed-off {pluralUnit(readyToRelease, "milestone")} inside a release window.</p>
              </div>
              <StatusPill tone={readyToRelease ? "success" : "neutral"}>{readyToRelease ? "Ready" : "None"}</StatusPill>
            </li>
            <li>
              <span className="ad-health-icon is-warning"><Icon name="shieldAlert" size={17} /></span>
              <div>
                <strong>Disputed holds</strong>
                <p>Frozen while the linked dispute case is open in the disputes queue.</p>
              </div>
              <StatusPill tone="warning">
                {holds.filter((hold) => hold.status === "disputed").length} held
              </StatusPill>
            </li>
            <li>
              <span className="ad-health-icon is-success"><Icon name="banknote" size={17} /></span>
              <div>
                <strong>Provider connection</strong>
                <p>
                  Releases settle through Paystack Transfers. {needsPayee} payable{" "}
                  {pluralUnit(needsPayee, "hold")} still {needsPayee === 1 ? "needs" : "need"} a verified payout account.
                </p>
              </div>
              <StatusPill tone="success">Paystack connected</StatusPill>
            </li>
            <li>
              <span className="ad-health-icon is-danger"><Icon name="alert" size={17} /></span>
              <div>
                <strong>Failed transfers</strong>
                <p>Failed and reversed payouts return the milestone to payable so the desk can retry them.</p>
              </div>
              <StatusPill tone={failedPayouts ? "danger" : "neutral"}>{failedPayouts} failed</StatusPill>
            </li>
          </ul>
        </SectionCard>
      </div>

      {pendingRelease ? (
        <div className="ad-modal-overlay" role="presentation" onClick={() => (releasing ? undefined : setPendingRelease(null))}>
          <div
            className="ad-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="release-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ad-modal-head">
              <div>
                <span className="ad-modal-eyebrow">
                  {awaitingOtp ? "Finish payout" : "Release milestone"}
                </span>
                <h2 id="release-modal-title">{formatNaira(pendingRelease.amountKobo)}</h2>
              </div>
              <button
                type="button"
                className="ad-modal-close"
                onClick={() => setPendingRelease(null)}
                aria-label="Close dialog"
                disabled={releasing}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <dl className="ad-facts">
              <div><dt>Hold</dt><dd>{pendingRelease.id}</dd></div>
              <div><dt>Job</dt><dd>{pendingRelease.jobRef}</dd></div>
              <div><dt>Artisan</dt><dd>{pendingRelease.artisanName}</dd></div>
              <div>
                <dt>Payee</dt>
                <dd>
                  {pendingRelease.recipientReady
                    ? `${pendingRelease.payoutAccountName ?? "Verified account"} · ${pendingRelease.payoutAccountMasked ?? ""}`
                    : "No verified payout account"}
                </dd>
              </div>
              <div><dt>Payout bank</dt><dd>{pendingRelease.payoutBank}</dd></div>
              <div><dt>Milestone</dt><dd>{pendingRelease.milestone}</dd></div>
              <div><dt>Sign-off</dt><dd>{pendingRelease.signedOff ? "Confirmed" : "Not confirmed"}</dd></div>
              {pendingRelease.transferStatus ? (
                <div>
                  <dt>Transfer</dt>
                  <dd>
                    {transferLabel[pendingRelease.transferStatus]}
                    {pendingRelease.transferReference ? ` · ${pendingRelease.transferReference}` : ""}
                  </dd>
                </div>
              ) : null}
              {pendingRelease.transferFailureReason ? (
                <div><dt>Provider note</dt><dd>{pendingRelease.transferFailureReason}</dd></div>
              ) : null}
            </dl>

            {error ? (
              <p className="ad-inline-notice is-danger" role="alert">
                <Icon name="alert" size={16} /> {error}
              </p>
            ) : null}

            {awaitingOtp ? (
              <label className="ad-field">
                <span>Transfer OTP</span>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter the OTP Paystack sent for this transfer"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  disabled={releasing}
                />
              </label>
            ) : pendingRelease.recipientReady ? (
              <p className="ad-modal-note">
                <Icon name="banknote" size={16} /> Releasing sends {formatNaira(pendingRelease.amountKobo)} to{" "}
                {pendingRelease.payoutAccountName ?? "the artisan"} {pendingRelease.payoutAccountMasked ?? ""}{" "}
                through Paystack. The milestone is only marked released after the provider confirms the transfer.
              </p>
            ) : (
              <>
                <p className="ad-modal-note">
                  <Icon name="alert" size={16} /> This hold has no verified payout account, so there is nowhere
                  to send the money yet.
                </p>
                <label className="ad-field">
                  <span>Payout bank</span>
                  <select
                    value={bankCode}
                    onChange={(event) => setBankCode(event.target.value)}
                    disabled={savingPayee}
                  >
                    <option value="">Select a bank…</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ad-field">
                  <span>NUBAN account number</span>
                  <input
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    placeholder="0123456789"
                    inputMode="numeric"
                    maxLength={10}
                    disabled={savingPayee}
                  />
                </label>
              </>
            )}

            <div className="ad-modal-actions">
              {awaitingOtp ? (
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={submitOtp}
                  disabled={releasing || otp.trim().length < 4}
                >
                  <Icon name="send" size={16} /> {releasing ? "Confirming…" : "Submit OTP"}
                </button>
              ) : pendingRelease.recipientReady ? (
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={confirmRelease}
                  disabled={!pendingRelease.signedOff || releasing}
                >
                  <Icon name="send" size={16} />{" "}
                  {releasing ? "Checking Paystack…" : pendingRelease.transferStatus === "pending" ? "Check payout status" : `Release ${formatNaira(pendingRelease.amountKobo)}`}
                </button>
              ) : (
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={savePayee}
                  disabled={savingPayee || accountNumber.trim().length !== 10 || !bankCode}
                >
                  <Icon name="checkCircle" size={16} /> {savingPayee ? "Verifying…" : "Save payout account"}
                </button>
              )}
              <button
                type="button"
                className="ad-btn ad-btn-ghost"
                onClick={() => setPendingRelease(null)}
                disabled={releasing || savingPayee}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
