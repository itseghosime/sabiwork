"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  User,
  Wrench,
  ShieldAlert,
  ChevronDown,
  Layers,
} from "lucide-react";

export function RoleNavigator() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Determine current active role from pathname
  const isCustomer =
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/requests") ||
    pathname.startsWith("/settings") ||
    pathname === "/payments";
  const isArtisan =
    pathname.startsWith("/artisan") || pathname.startsWith("/training");
  const isAdmin = pathname.startsWith("/admin");
  const isPublic = !isCustomer && !isArtisan && !isAdmin;

  if (collapsed) {
    return (
      <div className="sabi-role-dock" aria-label="Demo Role Switcher">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="sabi-role-dock-collapsed-btn"
          aria-label="Expand demo role switcher"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Switch Role / Portal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="sabi-role-dock" aria-label="Demo Role Switcher">
      <div className="sabi-role-dock-panel" role="region" aria-label="Interactive Portal Switcher">
        <div className="sabi-role-dock-title">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Demo Roles</span>
        </div>

        <Link
          href="/"
          className={`sabi-role-dock-link ${isPublic ? "active" : ""}`}
          title="Browse public artisan marketplace"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Public</span>
        </Link>

        <Link
          href="/jobs"
          className={`sabi-role-dock-link ${isCustomer ? "active" : ""}`}
          title="View customer jobs and post requests"
        >
          <User className="w-3.5 h-3.5" />
          <span>Customer</span>
        </Link>

        <Link
          href="/artisan"
          className={`sabi-role-dock-link ${isArtisan ? "active" : ""}`}
          title="Manage artisan work orders and quotes"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Artisan</span>
        </Link>

        <Link
          href="/admin/verification"
          className={`sabi-role-dock-link ${isAdmin ? "active" : ""}`}
          title="Review verification queue and disputes"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin</span>
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="sabi-role-dock-toggle"
          title="Minimize switcher"
          aria-label="Minimize switcher"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
