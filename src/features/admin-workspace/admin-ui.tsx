import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import { formatNairaCompact, type OverviewSeriesPoint } from "./admin-data";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "is-neutral",
  info: "is-info",
  success: "is-success",
  warning: "is-warning",
  danger: "is-danger",
};

export function StatusPill({
  tone = "neutral",
  children,
  dot = true,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={`ad-status-pill ${toneClass[tone]}`}>
      {dot ? <span className="ad-status-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function PageHeader({
  breadcrumb,
  title,
  description,
  actions,
  meta,
}: {
  breadcrumb?: readonly { label: string; href?: string }[];
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="ad-page-head">
      {breadcrumb?.length ? (
        <nav className="ad-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`} className="ad-breadcrumb-item">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href ? <Link href={item.href}>{item.label}</Link> : <strong aria-current="page">{item.label}</strong>}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="ad-page-head-row">
        <div className="ad-page-head-text">
          <h1>{title}</h1>
          <p>{description}</p>
          {meta ? <div className="ad-page-meta">{meta}</div> : null}
        </div>
        {actions ? <div className="ad-page-actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  icon,
  tone = "info",
  footnote,
  chip,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: IconName;
  tone?: Tone;
  footnote?: ReactNode;
  chip?: ReactNode;
}) {
  return (
    <article className="ad-kpi">
      <div className="ad-kpi-head">
        <span className="ad-kpi-label">{label}</span>
        <span className={`ad-kpi-icon ${toneClass[tone]}`}>
          <Icon name={icon} size={18} />
        </span>
      </div>
      <div className="ad-kpi-value-row">
        <strong className="ad-kpi-value">{value}</strong>
        {unit ? <span className="ad-kpi-unit">{unit}</span> : null}
      </div>
      {chip ? <div className="ad-kpi-chip-row">{chip}</div> : null}
      {footnote ? <div className="ad-kpi-foot">{footnote}</div> : null}
    </article>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className = "",
  as: Tag = "section",
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "aside";
}) {
  return (
    <Tag className={`ad-card ${className}`}>
      <div className="ad-card-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="ad-card-actions">{actions}</div> : null}
      </div>
      {children}
    </Tag>
  );
}

export function SampleNotice({ children }: { children: ReactNode }) {
  return (
    <div className="ad-notice" role="note">
      <span className="ad-notice-icon" aria-hidden="true">
        <Icon name="alert" size={18} />
      </span>
      <div>
        <strong>Sample data</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon = "inbox",
}: {
  title: string;
  message: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="ad-empty">
      <span className="ad-empty-icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action ? <div className="ad-empty-action">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "info",
  label,
}: {
  value: number;
  tone?: Tone;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`ad-progress ${toneClass[tone]}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function BarsChart({ data }: { data: readonly OverviewSeriesPoint[] }) {
  const max = Math.max(...data.map((point) => point.valueKobo), 1);
  const total = data.reduce((sum, point) => sum + point.valueKobo, 0);
  return (
    <div className="ad-bars" role="img" aria-label={`Sample settlement volume over 7 days, total ${formatNairaCompact(total)}`}>
      {data.map((point) => {
        const height = Math.max(6, Math.round((point.valueKobo / max) * 100));
        return (
          <div key={point.label} className="ad-bar-col">
            <span className="ad-bar-value">{formatNairaCompact(point.valueKobo)}</span>
            <span className="ad-bar-track">
              <span className="ad-bar" style={{ height: `${height}%` }} />
            </span>
            <span className="ad-bar-label">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: readonly { value: number; color: string; label: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const cumulative = segments.reduce<number[]>(
    (totals, segment) => [...totals, (totals.at(-1) ?? 0) + segment.value],
    [],
  );
  const stops = segments.map((segment, index) => {
    const start = ((cumulative[index] - segment.value) / total) * 360;
    const end = (cumulative[index] / total) * 360;
    return `${segment.color} ${start}deg ${end}deg`;
  });
  return (
    <div
      className="ad-donut"
      style={{ background: `conic-gradient(${stops.join(", ")})` }}
      role="img"
      aria-label={`${centerLabel}: ${centerValue}`}
    >
      <div className="ad-donut-hole">
        <span>{centerLabel}</span>
        <strong>{centerValue}</strong>
      </div>
    </div>
  );
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="ad-filter-tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {typeof option.count === "number" ? <span>{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
