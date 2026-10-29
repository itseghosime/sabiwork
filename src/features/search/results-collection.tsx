"use client";
import { useState } from "react";
import { ArtisanCard } from "@/components/discovery";
import { Icon } from "@/components/icon";
import type { Artisan } from "./data";
export function ResultsCollection({ items }: { items: Artisan[] }) {
  const [view, setView] = useState<"list" | "grid">("list");
  return (
    <>
      <div className="result-view-toolbar">
        <span>Compare skills, location and sample starting prices.</span>
        <div role="group" aria-label="Results layout">
          <button
            type="button"
            className="layout-toggle"
            aria-label="List"
            title="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <Icon name="list" />
          </button>
          <button
            type="button"
            className="layout-toggle"
            aria-label="Grid"
            title="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Icon name="grid" />
          </button>
        </div>
      </div>
      <div className={view === "list" ? "artisan-list" : "artisan-grid"}>
        {items.map((person) => (
          <ArtisanCard key={person.id} artisan={person} />
        ))}
      </div>
    </>
  );
}
