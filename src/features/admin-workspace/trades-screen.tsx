"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  EmptyState,
  KpiCard,
  PageHeader,
  SampleNotice,
  SectionCard,
  StatusPill,
} from "./admin-ui";
import {
  formatBps,
  formatNaira,
  formatWatDate,
  hoursBetween,
  pluralUnit,
  type TradeCategory,
  type TradeTier,
} from "./admin-data";

type ApiError = { error?: { code?: string; message?: string } };

type TradeConfig = { tiers: TradeTier[]; categories: TradeCategory[] };

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { cache: "no-store", ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.message ?? "Request failed.");
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function AdminTradesScreen() {
  const [tiers, setTiers] = useState<TradeTier[]>([]);
  const [savedTiers, setSavedTiers] = useState<TradeTier[]>([]);
  const [categories, setCategories] = useState<TradeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("250000");
  const [calcTierId, setCalcTierId] = useState("");

  const applyConfig = useCallback((next: TradeConfig) => {
    setTiers(next.tiers);
    setSavedTiers(next.tiers);
    setCategories(next.categories);
    setCalcTierId((current) => {
      if (next.tiers.some((tier) => tier.id === current)) return current;
      return next.tiers[1]?.id ?? next.tiers[0]?.id ?? "";
    });
  }, []);

  useEffect(() => {
    let active = true;
    readJson<TradeConfig>("/api/admin/trades")
      .then((next) => {
        if (!active) return;
        applyConfig(next);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load trade rates and tiers.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applyConfig]);

  const dirtyTiers = useMemo(
    () =>
      tiers.filter((tier) => {
        const saved = savedTiers.find((item) => item.id === tier.id);
        return (
          !saved ||
          saved.commissionBps !== tier.commissionBps ||
          saved.payoutWindowDays !== tier.payoutWindowDays
        );
      }),
    [tiers, savedTiers],
  );
  const dirty = dirtyTiers.length > 0;

  const averages = useMemo(() => {
    const activeCategories = categories.filter((category) => category.active);
    const artisanCount = activeCategories.reduce((sum, category) => sum + category.activeArtisans, 0);
    const avgCommission = Math.round(
      tiers.reduce((sum, tier) => sum + tier.commissionBps, 0) / (tiers.length || 1),
    );
    const overdue = categories.filter(
      (category) => hoursBetween(category.lastReviewedIso, new Date().toISOString()) > 90 * 24,
    ).length;
    return { activeCategories: activeCategories.length, artisanCount, avgCommission, overdue };
  }, [categories, tiers]);

  const calculator = useMemo(() => {
    const totalKobo = Math.round(clamp(Number(amount), 0, 1_000_000_000) * 100);
    const tier = tiers.find((item) => item.id === calcTierId) ?? tiers[0];
    const commissionKobo = Math.round((totalKobo * (tier?.commissionBps ?? 0)) / 10_000);
    return {
      tier,
      totalKobo,
      commissionKobo,
      payoutKobo: Math.max(0, totalKobo - commissionKobo),
    };
  }, [amount, calcTierId, tiers]);

  function updateTier(id: string, patch: Partial<Pick<TradeTier, "commissionBps" | "payoutWindowDays">>) {
    setTiers((current) => current.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)));
  }

  async function saveTiers() {
    if (!dirtyTiers.length) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await Promise.all(
        dirtyTiers.map((tier) =>
          readJson<{ tier: TradeTier }>(`/api/admin/trades/tiers/${tier.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              commissionBps: tier.commissionBps,
              payoutWindowDays: tier.payoutWindowDays,
            }),
          }).then((next) => next.tier),
        ),
      );
      setTiers((current) => current.map((tier) => updated.find((item) => item.id === tier.id) ?? tier));
      setSavedTiers((current) => current.map((tier) => updated.find((item) => item.id === tier.id) ?? tier));
      setNotice(`Saved ${updated.length} ${pluralUnit(updated.length, "tier")} to Neon.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the commission tiers.");
    } finally {
      setSaving(false);
    }
  }

  function resetDraft() {
    setTiers(savedTiers);
    setNotice("Draft reset to the rates stored in Neon.");
  }

  async function patchCategory(id: string, body: Record<string, unknown>, message: string) {
    setError(null);
    setNotice(null);
    const previous = categories;
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== id) return category;
        if (typeof body.active === "boolean") return { ...category, active: body.active };
        if (typeof body.defaultTierId === "string") return { ...category, defaultTierId: body.defaultTierId };
        return category;
      }),
    );
    try {
      const next = await readJson<{ category: TradeCategory }>(`/api/admin/trades/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setCategories((current) => current.map((category) => (category.id === id ? next.category : category)));
      setNotice(message);
    } catch (err) {
      setCategories(previous);
      setError(err instanceof Error ? err.message : "Could not update this trade category.");
    }
  }

  if (loading) {
    return (
      <div className="ad-page">
        <p className="ad-loading" role="status">
          Retrieving trade rates from Neon…
        </p>
      </div>
    );
  }

  return (
    <div className="ad-page">
      <PageHeader
        breadcrumb={[{ label: "Admin portal", href: "/admin" }, { label: "Trade rates & tiers" }]}
        title="Trade rates &amp; tiers"
        description="Shape commission bands, payout windows, and the default tier each trade starts on."
        actions={
          <>
            <button type="button" className="ad-btn ad-btn-ghost" onClick={resetDraft} disabled={!dirty || saving}>
              <Icon name="refresh" size={16} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              disabled={!dirty || saving}
              onClick={saveTiers}
            >
              <Icon name="checkCircle" size={16} />
              <span>{saving ? "Saving…" : dirty ? "Save changes" : "Saved"}</span>
            </button>
          </>
        }
        meta={
          <>
            <StatusPill tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved draft" : "No pending changes"}</StatusPill>
            <StatusPill tone="neutral" dot={false}>Neon records</StatusPill>
          </>
        }
      />
      <SampleNotice>
        Rates and categories below are stored in the Neon database. Edits here change what the hub records;
        no payment provider is connected, so saved rates do not charge anyone.
      </SampleNotice>

      {error ? (
        <p className="ad-inline-notice is-danger" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      ) : null}

      <section className="ad-kpi-grid" aria-label="Configuration metrics">
        <KpiCard label="Active categories" value={String(averages.activeCategories)} unit={`of ${categories.length}`} icon="grid" tone="info" footnote="Visible to customers" />
        <KpiCard label="Active artisans" value={String(averages.artisanCount)} icon="users" tone="success" footnote="Across active trades" />
        <KpiCard label="Average commission" value={formatBps(averages.avgCommission)} icon="trending" tone="warning" footnote="Across all tiers" />
        <KpiCard label="Overdue reviews" value={String(averages.overdue)} unit={pluralUnit(averages.overdue, "category")} icon="clock" tone="danger" footnote="Not reviewed in 90 days" />
      </section>

      {notice ? (
        <p className="ad-inline-notice ad-inline-notice-wide" role="status">
          <Icon name="checkCircle" size={16} /> {notice}
        </p>
      ) : null}

      <SectionCard
        title="Tier matrix"
        description="Commission and payout window per tier. Edit the two fields directly."
      >
        <div className="ad-tier-grid">
          {tiers.map((tier) => (
            <article key={tier.id} className="ad-tier-card">
              <div className="ad-tier-head">
                <div>
                  <h3>{tier.name}</h3>
                  <span className="ad-tier-badge">{tier.badge}</span>
                </div>
                <Icon name="badge" size={20} />
              </div>
              <p className="ad-tier-desc">{tier.description}</p>

              <label className="ad-field">
                <span>Commission ({formatBps(tier.commissionBps)})</span>
                <div className="ad-input-row">
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    step={25}
                    value={tier.commissionBps}
                    onChange={(event) => updateTier(tier.id, { commissionBps: clamp(Number(event.target.value), 0, 5000) })}
                    aria-label={`${tier.name} commission in basis points`}
                    disabled={saving}
                  />
                  <span className="ad-input-suffix">bps</span>
                </div>
              </label>

              <label className="ad-field">
                <span>Payout window</span>
                <div className="ad-input-row">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={1}
                    value={tier.payoutWindowDays}
                    onChange={(event) => updateTier(tier.id, { payoutWindowDays: clamp(Number(event.target.value), 0, 60) })}
                    aria-label={`${tier.name} payout window in days`}
                    disabled={saving}
                  />
                  <span className="ad-input-suffix">days</span>
                </div>
              </label>

              <div className="ad-tier-min">
                <span>{tier.minCompletedJobs}+ jobs</span>
                <span>{tier.minRating.toFixed(1)}+ rating</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="ad-grid-2">
        <SectionCard title="Commission calculator" description="Preview what an artisan receives under each tier.">
          <label className="ad-field">
            <span>Quoted job value (NGN)</span>
            <input
              type="number"
              min={0}
              step={500}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-label="Quoted job value in naira"
            />
          </label>

          <label className="ad-field">
            <span>Tier</span>
            <select value={calcTierId} onChange={(event) => setCalcTierId(event.target.value)} aria-label="Select tier for calculation">
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} · {formatBps(tier.commissionBps)}
                </option>
              ))}
            </select>
          </label>

          <div className="ad-calc">
            <div>
              <span>Quoted value</span>
              <strong>{formatNaira(calculator.totalKobo)}</strong>
            </div>
            <div>
              <span>Platform commission</span>
              <strong className="is-warning">−{formatNaira(calculator.commissionKobo)}</strong>
            </div>
            <div className="ad-calc-total">
              <span>Artisan receives</span>
              <strong>{formatNaira(calculator.payoutKobo)}</strong>
            </div>
            <p className="ad-card-note">
              Payout would settle within {calculator.tier?.payoutWindowDays ?? 0} day(s) after sign-off.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Review cadence" description="Categories closest to a stale rate review.">
          {categories.length === 0 ? (
            <EmptyState icon="grid" title="No trade categories yet" message="Categories appear here once they exist in the database." />
          ) : (
            <ul className="ad-review-list">
              {categories
                .slice()
                .sort((a, b) => new Date(a.lastReviewedIso).getTime() - new Date(b.lastReviewedIso).getTime())
                .slice(0, 5)
                .map((category) => {
                  const days = Math.round(
                    hoursBetween(category.lastReviewedIso, new Date().toISOString()) / 24,
                  );
                  const overdue = days > 90;
                  return (
                    <li key={category.id}>
                      <span className={`ad-review-icon ${overdue ? "is-danger" : "is-success"}`}>
                        <Icon name={category.icon} size={17} />
                      </span>
                      <div>
                        <strong>{category.name}</strong>
                        <span>Reviewed {formatWatDate(category.lastReviewedIso)} · {days} days ago</span>
                      </div>
                      <button
                        type="button"
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        onClick={() =>
                          patchCategory(
                            category.id,
                            { markReviewed: true },
                            `${category.name} marked reviewed in Neon.`,
                          )
                        }
                      >
                        Mark reviewed
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Trade categories" description="Default tier and marketplace visibility per trade.">
        <div className="ad-table-wrap ad-table-flush">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Trade</th>
                <th>Active artisans</th>
                <th>Median rate</th>
                <th>Default tier</th>
                <th>Visibility</th>
                <th className="ad-cell-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="ad-cell-inline">
                      <span className="ad-trade-icon"><Icon name={category.icon} size={17} /></span>
                      <span className="ad-cell-strong">{category.name}</span>
                    </div>
                  </td>
                  <td><span className="ad-cell-strong">{category.activeArtisans}</span></td>
                  <td><span className="ad-cell-muted">{formatNaira(category.medianRateKobo)}</span></td>
                  <td>
                    <select
                      className="ad-inline-select"
                      value={category.defaultTierId}
                      onChange={(event) =>
                        patchCategory(
                          category.id,
                          { defaultTierId: event.target.value },
                          `${category.name} now defaults to the selected tier.`,
                        )
                      }
                      aria-label={`Default tier for ${category.name}`}
                    >
                      {tiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <StatusPill tone={category.active ? "success" : "neutral"}>
                      {category.active ? "Listed" : "Hidden"}
                    </StatusPill>
                  </td>
                  <td className="ad-cell-right">
                    <button
                      type="button"
                      className="ad-btn ad-btn-ghost ad-btn-sm"
                      onClick={() =>
                        patchCategory(
                          category.id,
                          { active: !category.active },
                          `${category.name} is now ${category.active ? "hidden from" : "listed in"} the marketplace.`,
                        )
                      }
                    >
                      {category.active ? "Hide" : "List"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
