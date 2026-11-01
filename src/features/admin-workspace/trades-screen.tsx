"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  KpiCard,
  PageHeader,
  SampleNotice,
  SectionCard,
  StatusPill,
} from "./admin-ui";
import {
  SAMPLE_NOW_ISO,
  formatBps,
  formatNaira,
  formatWatDate,
  hoursBetween,
  pluralUnit,
  sampleTiers,
  sampleTradeCategories,
  type TradeCategory,
  type TradeTier,
} from "./admin-data";

function cloneTiers(): TradeTier[] {
  return sampleTiers.map((tier) => ({ ...tier }));
}

function cloneCategories(): TradeCategory[] {
  return sampleTradeCategories.map((category) => ({ ...category }));
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function AdminTradesScreen() {
  const [tiers, setTiers] = useState<TradeTier[]>(cloneTiers);
  const [savedTiers, setSavedTiers] = useState<TradeTier[]>(cloneTiers);
  const [categories, setCategories] = useState<TradeCategory[]>(cloneCategories);
  const [amount, setAmount] = useState("250000");
  const [calcTierId, setCalcTierId] = useState(tiers[1]?.id ?? tiers[0]?.id ?? "");
  const [notice, setNotice] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(tiers) !== JSON.stringify(savedTiers),
    [tiers, savedTiers],
  );

  const averages = useMemo(() => {
    const active = categories.filter((category) => category.active);
    const artisanCount = active.reduce((sum, category) => sum + category.activeArtisans, 0);
    const avgCommission = Math.round(
      tiers.reduce((sum, tier) => sum + tier.commissionBps, 0) / (tiers.length || 1),
    );
    const reviewed = categories.filter(
      (category) => hoursBetween(category.lastReviewedIso, SAMPLE_NOW_ISO) > 90 * 24,
    ).length;
    return { activeCategories: active.length, artisanCount, avgCommission, overdue: reviewed };
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

  function updateCategoryTier(id: string, tierId: string) {
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, defaultTierId: tierId } : category)),
    );
  }

  function toggleCategory(id: string) {
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, active: !category.active } : category)),
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
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => { setTiers(cloneTiers()); setCategories(cloneCategories()); setNotice("Draft reset to the sample baseline."); }}>
              <Icon name="refresh" size={16} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              disabled={!dirty}
              onClick={() => {
                setSavedTiers(tiers.map((tier) => ({ ...tier })));
                setNotice("Draft saved in this session only. Rate persistence is not connected to a backend yet.");
              }}
            >
              <Icon name="checkCircle" size={16} />
              <span>{dirty ? "Save changes" : "Saved"}</span>
            </button>
          </>
        }
        meta={
          <>
            <StatusPill tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved draft" : "No pending changes"}</StatusPill>
            <StatusPill tone="neutral" dot={false}>Sample configuration</StatusPill>
          </>
        }
      />

      <SampleNotice>
        Tier and category settings are interactive drafts. Saving them does not change production rates or
        persist to a backend in this build.
      </SampleNotice>

      <section className="ad-kpi-grid" aria-label="Configuration metrics">
        <KpiCard label="Active categories" value={String(averages.activeCategories)} unit={`of ${categories.length}`} icon="grid" tone="info" footnote="Visible to customers" />
        <KpiCard label="Active artisans" value={String(averages.artisanCount)} icon="users" tone="success" footnote="Across active trades" />
        <KpiCard label="Average commission" value={formatBps(averages.avgCommission)} icon="trending" tone="warning" footnote="Across all tiers" />
        <KpiCard label="Overdue reviews" value={String(averages.overdue)} unit={pluralUnit(averages.overdue, "category")} icon="clock" tone="danger" footnote="Not reviewed in 90 days" />
      </section>

      {notice ? (
        <p className="ad-inline-notice ad-inline-notice-wide" role="status">
          <Icon name="alert" size={16} /> {notice}
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
                    max={3000}
                    step={25}
                    value={tier.commissionBps}
                    onChange={(event) => updateTier(tier.id, { commissionBps: clamp(Number(event.target.value), 0, 3000) })}
                    aria-label={`${tier.name} commission in basis points`}
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
                    max={30}
                    step={1}
                    value={tier.payoutWindowDays}
                    onChange={(event) => updateTier(tier.id, { payoutWindowDays: clamp(Number(event.target.value), 0, 30) })}
                    aria-label={`${tier.name} payout window in days`}
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
          <ul className="ad-review-list">
            {categories
              .slice()
              .sort((a, b) => new Date(a.lastReviewedIso).getTime() - new Date(b.lastReviewedIso).getTime())
              .slice(0, 5)
              .map((category) => {
                const days = Math.round(hoursBetween(category.lastReviewedIso, SAMPLE_NOW_ISO) / 24);
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
                    <StatusPill tone={overdue ? "danger" : "success"}>{overdue ? "Overdue" : "Current"}</StatusPill>
                  </li>
                );
              })}
          </ul>
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
                      onChange={(event) => updateCategoryTier(category.id, event.target.value)}
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
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => toggleCategory(category.id)}>
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
