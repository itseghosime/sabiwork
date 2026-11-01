import Link from "next/link";
import {
  CategoryCard,
  Portrait,
  SearchForm,
} from "@/components/discovery";
import { Icon } from "@/components/icon";
import { artisans, categories } from "@/features/search/data";

const fan = [artisans[2], artisans[1], artisans[0], artisans[3], artisans[4]];
export default function HomePage() {
  return (
    <>
      <section className="home-hero marketplace-hero">
        <div className="container hero-inner marketplace-hero-inner">
          <div className="eyebrow-pill">
            <span className="location-dot" /> BENIN CITY MARKETPLACE{" "}
            <span className="pill-divider">/</span> HIRE OR GET HIRED
          </div>
          <h1>
            Find trusted local artisans
            <br />
            <span>for everyday jobs that matter.</span>
          </h1>
          <p className="hero-copy">
            Search by task, compare profiles and request clear quotes before work starts.
            Create one account to both post jobs and offer your own services.
          </p>
          <SearchForm />
          <div className="trust-row">
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
          <div className="home-hero-actions">
            <Link href="/signup/customer" className="button button-primary">
              Post a service request <Icon name="arrow" size={18} />
            </Link>
            <Link href="/signup/artisan" className="button button-outline">
              Create work profile <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div
            className="artisan-fan"
            aria-label="Meet local artisan profiles"
          >
            {fan.map((person, index) => (
              <Link
                href={`/artisans/${person.id}`}
                className={`fan-card fan-${index}`}
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
      <section className="section container" aria-labelledby="trades-heading">
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
      <section
        className="how-section"
        id="how-it-works"
        aria-labelledby="how-heading"
      >
        <div className="container section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LESS SEARCHING. MORE GETTING IT DONE.</p>
              <h2 id="how-heading">
                From “who can help?”
                <br />
                to a job well done.
              </h2>
            </div>
            <p className="section-description">
              A simple way to connect with skilled people.
              <br />
              You choose the person. You agree the work.
            </p>
          </div>
          <ol className="steps-grid">
            {[
              {
                icon: "search" as const,
                title: "Find your person",
                text: "Choose a trade and your area. Explore profiles, work highlights and reviews.",
              },
              {
                icon: "wrench" as const,
                title: "Compare clear quotes",
                text: "Share what you need. Agree on the scope, materials, labour and milestones.",
              },
              {
                icon: "shield" as const,
                title: "Start with a milestone",
                text: "Deposit and balance payments are planned for Paystack TEST mode; checkout is not connected yet.",
              },
              {
                icon: "check" as const,
                title: "Sign off good work",
                text: "Follow progress, confirm completed work and share your experience.",
              },
            ].map((step, index) => (
              <li key={step.title}>
                <div className="step-top">
                  <span className="step-icon">
                    <Icon name={step.icon} size={25} />
                  </span>
                  <span className="step-number">0{index + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container section">
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
              people who know their trade—and your city.
            </p>
            <Link href="/artisans" className="button button-primary">
              Meet the artisans <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container cta-wrap">
        <div className="cta-panel">
          <div>
            <p className="eyebrow">GOOD AT WHAT YOU DO?</p>
            <h2>There&apos;s a place for your craft here.</h2>
            <p>
              Build your profile. Show your work. Connect with your community.
            </p>
          </div>
          <Link href="/signup/artisan" className="button button-dark">
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
