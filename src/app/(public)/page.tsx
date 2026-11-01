import type { CSSProperties } from "react";
import Link from "next/link";
import { CategoryCard, Portrait, SearchForm } from "@/components/discovery";
import { Icon } from "@/components/icon";
import { signupPaths } from "@/features/accounts/signup-paths";
import { artisans, categories } from "@/features/search/data";
import "./landing.css";

const fan = [artisans[2], artisans[1], artisans[0], artisans[3], artisans[4]];
const rise = (step: number) =>
  ({ "--rise": `${step * 90}ms` }) as CSSProperties;

export default function HomePage() {
  const { customer, artisan } = signupPaths;
  return (
    <>
      <section className="home-hero marketplace-hero landing-hero">
        <div className="landing-aurora" aria-hidden="true">
          <span className="aurora-orb aurora-orb-sky" />
          <span className="aurora-orb aurora-orb-navy" />
          <span className="aurora-orb aurora-orb-pale" />
        </div>
        <div className="container hero-inner marketplace-hero-inner">
          <div className="eyebrow-pill hero-rise" style={rise(0)}>
            <span className="location-dot" /> BENIN CITY MARKETPLACE{" "}
            <span className="pill-divider">/</span> HIRE OR GET HIRED
          </div>
          <h1 className="hero-rise" style={rise(1)}>
            Find skilled hands.
            <br />
            <span>Or be the skilled hands.</span>
          </h1>
          <p className="hero-copy hero-rise" style={rise(2)}>
            SabiWork is a two-sided marketplace for everyday jobs in Benin City.
            Post the work you need done, or build a work profile and start
            quoting for jobs near you.
          </p>
          <div className="landing-choices hero-rise" style={rise(3)}>
            <Link
              href={customer.href}
              className="button button-primary landing-choice"
            >
              <span className="choice-icon">
                <Icon name={customer.icon} size={18} />
              </span>
              <span className="choice-text">
                Hire an artisan
                <small>{customer.roleNote}</small>
              </span>
              <Icon name="arrow" size={18} />
            </Link>
            <Link
              href={artisan.href}
              className="button button-dark landing-choice"
            >
              <span className="choice-icon">
                <Icon name={artisan.icon} size={18} />
              </span>
              <span className="choice-text">
                Join as an artisan
                <small>{artisan.roleNote}</small>
              </span>
              <Icon name="arrow" size={18} />
            </Link>
          </div>
          <SearchForm />
          <div className="trust-row hero-rise" style={rise(4)}>
            <span>
              <Icon name="badge" size={16} /> Reviewed profile submissions
            </span>
            <span>
              <Icon name="check" size={16} /> Itemized quote workflow
            </span>
            <span>
              <Icon name="pin" size={16} /> Built for Benin City
            </span>
          </div>
          <div className="artisan-fan" aria-label="Meet local artisan profiles">
            {fan.map((person, index) => (
              <Link
                href={`/artisans/${person.id}`}
                className={`fan-card fan-${index}`}
                style={rise(index + 5)}
                key={person.id}
              >
                <div className="fan-photo">
                  <Portrait index={person.portrait} name={person.name} />
                  {index === 2 && (
                    <span className="fan-featured">
                      <Icon name="star" size={12} /> Popular this week
                    </span>
                  )}
                  <span className="fan-badge">
                    <Icon name="badge" size={12} /> Reviewed profile
                  </span>
                </div>
                <div className="fan-caption">
                  <strong>{person.name}</strong>
                  <span>
                    {
                      categories.find(
                        (category) => category.id === person.category,
                      )?.short
                    }{" "}
                    · {person.area}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="hero-note">
            Marketplace notice: directory details are illustrative while payments and
            verification checks are being completed.
          </p>
        </div>
      </section>

      <section
        className="landing-paths"
        id="how-it-works"
        aria-labelledby="paths-heading"
      >
        <div className="container section">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">TWO WAYS IN. ONE ACCOUNT.</p>
              <h2 id="paths-heading">Which one are you here to do?</h2>
            </div>
            <p className="section-description">
              Every SabiWork account can both hire and be hired. The only real
              question is where you start, so start on the right side.
            </p>
          </div>
          <div className="path-grid">
            {[customer, artisan].map((path) => (
              <article
                className={`path-card path-${path.role} reveal`}
                key={path.role}
              >
                <div className="path-card-top">
                  <span className="path-chip">
                    <Icon name={path.icon} size={16} />
                    {path.switchLabel}
                  </span>
                  <span className="path-kicker">{path.kicker}</span>
                </div>
                <h3>{path.headline}</h3>
                <p className="path-summary">{path.summary}</p>
                <ol className="path-steps">
                  {path.steps.map((step, index) => (
                    <li key={step.title}>
                      <span className="path-step-number">0{index + 1}</span>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  href={path.href}
                  className={`button path-cta ${
                    path.role === "customer" ? "button-dark" : "button-primary"
                  }`}
                >
                  {path.cta}
                  <Icon name="arrow" size={18} />
                </Link>
                <p className="path-aside">{path.aside}</p>
              </article>
            ))}
          </div>
          <p className="demo-notice reveal">
            <Icon name="help" size={16} /> Payments, verification decisions and
            reviews are still being connected. Listed ranges are illustrative —
            always agree scope and amount in a quote.
          </p>
        </div>
      </section>

      <section
        className="section container reveal"
        aria-labelledby="trades-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE HELP GOES A LONG WAY</p>
            <h2 id="trades-heading">What needs doing?</h2>
          </div>
          <Link href="/categories" className="text-link">
            Explore all services <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="container section reveal">
        <div className="community-panel">
          <div className="community-photo">
            <Portrait index={3} name="Sunday Alabi" />
            <span className="photo-caption">
              Every good job has a person behind it.
            </span>
          </div>
          <div className="community-copy">
            <p className="eyebrow">SKILLS WORTH FINDING</p>
            <h2>
              Your next project.
              <br />
              Someone&apos;s everyday craft.
            </h2>
            <p>
              From a quick repair to something made just for you, start with
              people who know their trade — and your city.
            </p>
            <Link href="/artisans" className="button button-primary">
              Meet the artisans <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container cta-wrap reveal">
        <div className="cta-panel">
          <div>
            <p className="eyebrow">GOOD AT WHAT YOU DO?</p>
            <h2>There&apos;s a place for your craft here.</h2>
            <p>
              Build your work profile, show your trade and service areas, then
              answer the requests that fit.
            </p>
          </div>
          <Link href={artisan.href} className="button button-dark">
            Join as an artisan <Icon name="arrow" size={18} />
          </Link>
        </div>
        <p className="demo-notice">
          <Icon name="help" size={16} /> Pricing, reviews and profile badges are
          illustrative. Always agree scope and amount in your quote.
        </p>
      </section>
    </>
  );
}
