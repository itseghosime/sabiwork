"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { notificationReadStore, useDeviceValue } from "./device-settings";
import { useScreenData } from "./hooks";
import {
  customerService,
  formatWat,
  type CustomerJob,
  type CustomerRequest,
} from "./service";

type Tone = "info" | "pending" | "done" | "neutral";

interface Notice {
  id: string;
  title: string;
  body: string;
  href: string;
  at: string;
  tone: Tone;
  icon: IconName;
}

function jobNotice(job: CustomerJob): Notice {
  const base = {
    id: `job:${job.id}:${job.status}`,
    href: `/jobs/${job.id}`,
    at: job.updated_at || job.created_at,
  };

  switch (job.status) {
    case "accepted":
      return {
        ...base,
        title: "Deposit due",
        body: `Your 50% mobilisation deposit for ${job.title} is ready to pay.`,
        tone: "pending",
        icon: "banknote",
      };
    case "in_progress":
      return {
        ...base,
        title: "Work started",
        body: `Your artisan has begun ${job.title}. Progress updates appear on the booking.`,
        tone: "info",
        icon: "hammer",
      };
    case "completed":
      return {
        ...base,
        title: "Job completed",
        body: `${job.title} was marked complete. Rate the artisan to close the loop.`,
        tone: "done",
        icon: "checkCircle",
      };
    case "cancelled":
      return {
        ...base,
        title: "Booking cancelled",
        body: `${job.title} was cancelled. No further milestones will be requested.`,
        tone: "neutral",
        icon: "xCircle",
      };
    default:
      return {
        ...base,
        title: "Booking updated",
        body: `${job.title} changed status.`,
        tone: "neutral",
        icon: "briefcase",
      };
  }
}

function requestNotice(request: CustomerRequest): Notice {
  const base = {
    id: `request:${request.id}:${request.status}`,
    href: `/requests/${request.id}`,
    at: request.updated_at || request.created_at,
  };

  switch (request.status) {
    case "draft":
      return {
        ...base,
        title: "Draft saved",
        body: `${request.title} is still a draft. Publish it when the brief is ready.`,
        tone: "neutral",
        icon: "file",
      };
    case "submitted":
      return {
        ...base,
        title: "Request published",
        body: `${request.title} is open. Artisans in ${request.service_area} can now quote.`,
        tone: "pending",
        icon: "send",
      };
    case "matching":
      return {
        ...base,
        title: "Quotes coming in",
        body: `Artisans are quoting on ${request.title}. Compare them when you are ready.`,
        tone: "info",
        icon: "clipboard",
      };
    case "cancelled":
      return {
        ...base,
        title: "Request cancelled",
        body: `${request.title} is closed and no longer accepting quotes.`,
        tone: "neutral",
        icon: "xCircle",
      };
    default:
      return {
        ...base,
        title: "Request updated",
        body: `${request.title} changed status.`,
        tone: "neutral",
        icon: "clipboard",
      };
  }
}

function dayBucket(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const age = startOfToday - date.getTime();

  if (date.getTime() >= startOfToday) return "Today";
  if (age < 6 * 24 * 60 * 60 * 1000) return "This week";
  return "Earlier";
}

export function NotificationsScreen() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const readIds = useDeviceValue(notificationReadStore);

  const fetchFeed = useCallback(
    () =>
      Promise.all([
        customerService.listJobs(),
        customerService.listRequests(),
      ]).then(([jobs, requests]) =>
        [...jobs.map(jobNotice), ...requests.map(requestNotice)].sort(
          (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
        ),
      ),
    [],
  );

  const { data, loading, error, retry } = useScreenData(
    fetchFeed,
    "Could not load your notifications.",
  );

  const notices = useMemo(() => data ?? [], [data]);
  const unread = useMemo(
    () => notices.filter((notice) => !readIds.includes(notice.id)),
    [notices, readIds],
  );
  const visible = tab === "unread" ? unread : notices;

  const grouped = useMemo(() => {
    const buckets = new Map<string, Notice[]>();
    visible.forEach((notice) => {
      const bucket = dayBucket(notice.at);
      const list = buckets.get(bucket) ?? [];
      list.push(notice);
      buckets.set(bucket, list);
    });
    return Array.from(buckets.entries());
  }, [visible]);

  function markRead(ids: string[]) {
    if (!ids.length) return;
    notificationReadStore.write(Array.from(new Set([...readIds, ...ids])));
  }

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>Notifications</span>
            <span>{unread.length} unread</span>
          </p>
          <h1>What changed on your account</h1>
          <p>
            Milestones, quotes and status changes from your requests and
            bookings, newest first.
          </p>
        </div>
        <div className="cb-actions">
          <button
            type="button"
            className="button button-outline"
            disabled={unread.length === 0}
            onClick={() => markRead(notices.map((notice) => notice.id))}
          >
            <Icon name="check" size={15} />
            Mark all as read
          </button>
        </div>
      </header>

      <div className="cb-notice-toolbar">
        <div className="cb-tabs" role="tablist" aria-label="Notification filter">
          <button
            type="button"
            role="tab"
            className="cb-tab"
            aria-selected={tab === "all"}
            onClick={() => setTab("all")}
          >
            All
            <span className="cb-tab-count">{notices.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            className="cb-tab"
            aria-selected={tab === "unread"}
            onClick={() => setTab("unread")}
          >
            Unread
            <span className="cb-tab-count">{unread.length}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="cb-panel">
          <p className="cb-loading">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="cb-error-state">
          <p>{error}</p>
          <button type="button" className="button button-outline" onClick={retry}>
            <Icon name="refresh" size={15} />
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="cb-empty">
          <span className="cb-empty-icon">
            <Icon name="bell" size={22} />
          </span>
          <h3>{tab === "unread" ? "You are all caught up" : "Nothing here yet"}</h3>
          <p>
            {tab === "unread"
              ? "Every notification on this account has been read."
              : "Notifications appear once you publish a request or book an artisan."}
          </p>
          {tab === "all" ? (
            <Link className="button button-primary" href="/requests/new">
              Post a request
            </Link>
          ) : (
            <button
              type="button"
              className="button button-outline"
              onClick={() => setTab("all")}
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="cb-notice-groups">
          {grouped.map(([bucket, items]) => (
            <section key={bucket} className="cb-notice-group">
              <h2 className="cb-notice-group-title">{bucket}</h2>
              <ul className="cb-notice-list">
                {items.map((notice) => {
                  const read = readIds.includes(notice.id);
                  return (
                    <li key={notice.id}>
                      <Link
                        href={notice.href}
                        className="cb-notice"
                        data-unread={read ? "false" : "true"}
                        onClick={() => markRead([notice.id])}
                      >
                        <span className={`cb-notice-icon ${notice.tone}`}>
                          <Icon name={notice.icon} size={18} />
                        </span>
                        <span className="cb-notice-copy">
                          <strong>{notice.title}</strong>
                          <span>{notice.body}</span>
                        </span>
                        <span className="cb-notice-meta">
                          {!read ? (
                            <span className="cb-notice-dot" aria-label="Unread" />
                          ) : null}
                          <time dateTime={notice.at}>{formatWat(notice.at)}</time>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="cb-footnote">
        Generated from your own requests and bookings. Read state is stored on
        this device only, and no email or push delivery is connected yet.
      </p>
    </section>
  );
}
