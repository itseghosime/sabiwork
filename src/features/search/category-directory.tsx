"use client";
import Link from "next/link";
import { useState } from "react";
import { areas, artisans, categories } from "./data";
import { CategoryCard } from "@/components/discovery";
import { Icon } from "@/components/icon";

export function CategoryDirectory() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [withProfiles, setWithProfiles] = useState(false);
  const visible = categories.filter((category) => {
    const text = [category.name, category.description, ...category.services]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(query.trim().toLowerCase()) &&
      (!withProfiles ||
        artisans.some(
          (person) =>
            person.category === category.id && (!area || person.area === area),
        ))
    );
  });
  function reset() {
    setQuery("");
    setArea("");
    setWithProfiles(false);
  }
  return (
    <>
      <div className="directory-controls">
        <label className="directory-search">
          <Icon name="search" />
          <span className="sr-only">Search services</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a trade or task, e.g. leak repairs"
            maxLength={100}
          />
        </label>
        <label className="district-select">
          <Icon name="pin" size={18} />
          <span className="sr-only">Filter directory by area</span>
          <select
            value={area}
            onChange={(event) => setArea(event.target.value)}
          >
            <option value="">All Benin City areas</option>
            {areas.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button className="button button-outline" onClick={reset}>
          <Icon name="filters" size={16} />
          Reset
        </button>
      </div>
      <div
        className="district-shortcuts"
        role="group"
        aria-label="Quick area filters"
      >
        <span>Quick select</span>
        {["", "GRA", "Ugbowo", "Ikpoba Hill", "Airport Road"].map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={area === item}
            onClick={() => setArea(item)}
          >
            {item || "All areas"}
          </button>
        ))}
      </div>
      <div className="directory-meta">
        <div
          className="directory-tabs"
          role="group"
          aria-label="Directory display"
        >
          <button
            type="button"
            aria-pressed={!withProfiles}
            onClick={() => setWithProfiles(false)}
          >
            All trades
          </button>
          <button
            type="button"
            aria-pressed={withProfiles}
            onClick={() => setWithProfiles(true)}
          >
            With sample profiles
          </button>
        </div>
        <span role="status">
          {visible.length} {visible.length === 1 ? "trade" : "trades"} to
          explore
        </span>
      </div>
      {visible.length ? (
        <div className="category-grid directory-grid">
          {visible.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              area={area}
              extended
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="search" size={30} />
          </span>
          <h2>No services match “{query}”</h2>
          <p>
            Try another area or a broader term, such as painting, plumbing or
            cleaning.
          </p>
          <button className="button button-primary" onClick={reset}>
            Show all services <Icon name="arrow" size={17} />
          </button>
        </div>
      )}
      <section className="review-explainer" aria-labelledby="review-heading">
        <div>
          <p className="eyebrow">A CLEARER PICTURE BEFORE YOU CHOOSE</p>
          <h2 id="review-heading">Know who you’re hiring.</h2>
          <p>
            Explore a person’s skills, work samples and customer feedback before
            requesting a quote.
          </p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Read the profile</h3>
              <p>Look for relevant skills and examples of similar work.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Understand the badge</h3>
              <p>
                Admin-reviewed means submitted profile details were checked. It
                is not a government accreditation or work guarantee.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Agree on the details</h3>
              <p>
                Discuss your task, materials, labour and milestones in an
                itemized quote.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <p className="directory-bottom-link">
        Already know what you need?{" "}
        <Link className="text-link" href="/artisans">
          Search all artisans <Icon name="arrow" size={16} />
        </Link>
      </p>
    </>
  );
}
