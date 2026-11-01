import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatNaira } from "@/features/search/data";

type PublicArtisan = {
  id: string;
  name: string;
  headline: string;
  trade: string;
  area: string;
  workshopAddress: string;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  startingPriceKobo: number;
  experienceYears: number;
  profileReviewed: boolean;
  initials: string;
  bio: string;
  skills: string[];
};

export function PublicArtisanDetail({ artisan }: { artisan: PublicArtisan }) {
  return (
    <section className="public-artisan-detail">
      <div className="container">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/">Home</Link>
          <Icon name="next" size={14} />
          <Link href="/artisans">Find an artisan</Link>
          <Icon name="next" size={14} />
          <span aria-current="page">{artisan.name}</span>
        </nav>

        <article className="public-artisan-card">
          <header className="public-artisan-header">
            <div className="public-artisan-identity">
              <span className="public-artisan-avatar" aria-hidden="true">
                {artisan.initials}
              </span>
              <div>
                <p className="eyebrow">BENIN CITY ARTISAN PROFILE</p>
                <h1>{artisan.name}</h1>
                <p>{artisan.headline}</p>
              </div>
            </div>
            <div className="public-artisan-price">
              <span>Typical starting labour</span>
              <strong>{formatNaira(artisan.startingPriceKobo)}</strong>
              <small>Final cost is agreed in your quote.</small>
            </div>
          </header>

          <div className="public-artisan-metrics">
            <p>
              <Icon name="star" size={16} /> {artisan.rating.toFixed(1)} rating (
              {artisan.reviewCount} reviews)
            </p>
            <p>
              <Icon name="briefcase" size={16} /> {artisan.completedJobsCount} completed jobs
            </p>
            <p>
              <Icon name="pin" size={16} /> {artisan.area}, Benin City
            </p>
            <p>
              <Icon name="calendar" size={16} /> {artisan.experienceYears} years experience
            </p>
          </div>

          <div className="public-artisan-grid">
            <section className="public-artisan-section">
              <h2>About this artisan</h2>
              <p>{artisan.bio}</p>
            </section>
            <section className="public-artisan-section">
              <h2>Primary trade</h2>
              <p>{artisan.trade}</p>
              <h3>Workshop area</h3>
              <p>{artisan.workshopAddress}</p>
            </section>
            <section className="public-artisan-section">
              <h2>Skills</h2>
              <div className="public-artisan-tags">
                {artisan.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </section>
            <section className="public-artisan-section">
              <h2>Profile status</h2>
              <p>
                {artisan.profileReviewed
                  ? "Profile details reviewed by admin."
                  : "Profile details submitted by artisan and awaiting review."}
              </p>
              <p className="public-artisan-note">
                Verification checks, escrow handling, and training certificates are not yet available.
              </p>
            </section>
          </div>

          <footer className="public-artisan-actions">
            <Link className="button button-primary" href="/signup/customer">
              Request a quote <Icon name="arrow" size={17} />
            </Link>
            <Link className="button button-outline" href="/artisans">
              Continue searching <Icon name="arrow" size={17} />
            </Link>
          </footer>
        </article>
      </div>
    </section>
  );
}
