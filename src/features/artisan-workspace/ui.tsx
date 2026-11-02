"use client";

import Link from "next/link";
import { Fragment } from "react";
import { Icon, type IconName } from "@/components/icon";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`aw-badge is-${tone}`}>{children}</span>;
}

export function Crumbs({ trail }: { trail: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="aw-breadcrumbs" aria-label="Breadcrumb">
      {trail.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 ? <span aria-hidden="true">/</span> : null}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <strong>{item.label}</strong>}
        </Fragment>
      ))}
    </nav>
  );
}

export function Head({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="aw-head">
      <div className="aw-head-copy">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="aw-head-actions">{children}</div> : null}
    </header>
  );
}

export function PanelHead({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="aw-panel-head">
      <div>
        <h2 className="aw-panel-title">{title}</h2>
        {note ? <p>{note}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Kpi({
  icon,
  label,
  value,
  foot,
}: {
  icon: IconName;
  label: string;
  value: React.ReactNode;
  foot?: string;
}) {
  return (
    <div className="aw-kpi">
      <div className="aw-kpi-head">
        <span className="aw-kpi-label">{label}</span>
        <span className="aw-kpi-icon">
          <Icon name={icon} size={15} />
        </span>
      </div>
      <span className="aw-kpi-value">{value}</span>
      {foot ? <span className="aw-kpi-foot">{foot}</span> : null}
    </div>
  );
}

export function Empty({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="aw-empty">
      <span className="aw-empty-icon">
        <Icon name={icon} size={20} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
