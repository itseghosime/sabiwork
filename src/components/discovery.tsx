import Link from "next/link";
import Form from "next/form";
import { Icon, type IconName } from "./icon";
import { sampleEstimates } from "@/features/search/benchmarks";
import {
  areas,
  categories,
  formatNaira,
  type Artisan,
} from "@/features/search/data";

export function Portrait({
  index,
  name,
  className = "",
  initials = "",
}: {
  index: number | null;
  name: string;
  className?: string;
  initials?: string;
}) {
  return (
    <div
      role="img"
      aria-label={
        index === null
          ? `${name}: profile photo unavailable`
          : `Illustrative AI portrait for fictional artisan ${name}`
      }
      className={`portrait ${index === null ? "portrait-fallback" : ""} ${className}`}
      style={
        index === null
          ? undefined
          : {
              backgroundImage: "url(/images/artisan-demo-sheet.png)",
              backgroundPosition: `${index * 25}% 0%`,
            }
      }
    >
      {index === null && (
        <span>
          {initials ||
            name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
        </span>
      )}
    </div>
  );
}
export function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <Form
      action="/artisans"
      className={`discovery-search ${compact ? "compact-search" : ""}`}
    >
      <label>
        <Icon name="search" />
        <span>
          <span className="field-label">What do you need help with?</span>
          <input
            name="q"
            aria-label="Search services or artisans"
            placeholder="Try plumbing, tailoring…"
            maxLength={100}
          />
        </span>
      </label>
      <label>
        <Icon name="pin" />
        <span>
          <span className="field-label">Where in Benin City?</span>
          <select name="area" aria-label="Benin City area">
            <option value="">All areas</option>
            {areas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </span>
      </label>
      <button className="button button-primary" type="submit">
        Find an artisan <Icon name="arrow" size={18} />
      </button>
    </Form>
  );
}
export function CategoryCard({
  category,
  extended = false,
  area = "",
}: {
  category: (typeof categories)[number];
  extended?: boolean;
  area?: string;
}) {
  return (
    <Link
      href={`/artisans?category=${category.id}${area ? `&area=${encodeURIComponent(area)}` : ""}`}
      className={`category-card ${extended ? "extended-category" : ""}`}
    >
      <div className="category-top">
        <span className={`category-icon tone-${category.id}`}>
          <Icon name={category.icon as IconName} size={25} />
        </span>
        <Icon name="arrow" size={19} />
      </div>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      {extended && (
        <div className="sample-estimate">
          <span>Illustrative estimate</span>
          <strong>
            {formatNaira(sampleEstimates[category.id][0])}–
            {formatNaira(sampleEstimates[category.id][1])}
          </strong>
          <small>Example pricing · confirm in your quote</small>
        </div>
      )}
      {extended && (
        <ul className="service-tags">
          {category.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      )}
      <span className="category-action">
        Find {category.short.toLowerCase()} help <Icon name="arrow" size={16} />
      </span>
    </Link>
  );
}
export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  const category = categories.find((item) => item.id === artisan.category)!;
  return (
    <article className="artisan-card">
      <div className="artisan-image">
        <Portrait
          index={artisan.portrait}
          name={artisan.name}
          initials={artisan.initials}
        />
        <span className="image-label">{category.short}</span>
      </div>
      <div className="artisan-body">
        <div className="artisan-name">
          <h3>{artisan.name}</h3>
          {artisan.profileReviewed && (
            <span
              title="Sample admin-reviewed profile"
              className="reviewed-icon"
            >
              <Icon name="badge" size={20} />
              <span className="sr-only">Sample profile reviewed</span>
            </span>
          )}
        </div>
        <p className="artisan-title">{artisan.headline}</p>
        <p className="artisan-bio">{artisan.bio}</p>
        <p className="metadata">
          <Icon name="pin" size={14} /> {artisan.area}, Benin City
        </p>
        <div className="artisan-rating">
          <span>
            <Icon name="star" size={15} />{" "}
            <strong>{artisan.rating.toFixed(1)}</strong>{" "}
            <span>({artisan.reviewCount} sample reviews)</span>
          </span>
        </div>
        <div className="artisan-bottom">
          <p>
            <span>Starting from</span>
            <strong>{formatNaira(artisan.startingPriceKobo)}</strong>
          </p>
          <Link
            className="button button-subtle"
            href={`/artisans/${artisan.id}`}
          >
            View profile <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function DemoNotice() {
  return (
    <p className="demo-notice">
      <Icon name="help" size={16} /> Demo directory: profiles, reviews and
      starting prices are fictional. Ask for an itemized quote.
    </p>
  );
}
